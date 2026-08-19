import { NextRequest, NextResponse } from 'next/server';
import { parseBambooHRExcel } from '@/services/excelParser';
import { parseSalaries } from '@/services/salaryParser';
import { getExchangeRates, toUSD, toUYU } from '@/services/currencyConverter';
import { extractTextFromFile } from '@/services/fileParser';
import { analyzeCV } from '@/services/groq';
import { matchCVToCandidate } from '@/services/nameMatcher';
import {
  CandidateSalaryRow,
  LocationSummary,
  PositionReport,
  ScoredCandidate,
  SalaryScoreResponse,
  JDInput,
} from '@/types/salary';
import { JobRequirements } from '@/types/analysis';

export const runtime = 'nodejs';

const MONTHLY_CAP_USD = 15_000;
const ANNUAL_CAP_USD = MONTHLY_CAP_USD * 12;
const CV_CONCURRENCY = 3;

async function mapConcurrent<T, U>(
  items: T[],
  fn: (item: T, i: number) => Promise<U>,
  limit: number,
): Promise<U[]> {
  const results: U[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export async function POST(req: NextRequest): Promise<NextResponse<SalaryScoreResponse>> {
  try {
    const formData = await req.formData();
    const excelFiles = formData.getAll('files') as File[];
    const cvFiles = formData.getAll('cvs') as File[];
    const jdRaw = formData.get('jd') as string | null;

    if (!excelFiles.length) {
      return NextResponse.json({ success: false, error: 'No se recibieron archivos Excel.' }, { status: 400 });
    }

    const jd: JDInput | null = jdRaw ? JSON.parse(jdRaw) : null;
    const hasScoring = jd && cvFiles.length > 0;

    // Parse Excel
    const allCandidates = [];
    for (const file of excelFiles) {
      const buf = await file.arrayBuffer();
      allCandidates.push(...parseBambooHRExcel(buf));
    }
    if (!allCandidates.length) {
      return NextResponse.json({ success: false, error: 'No se encontraron candidatos con salario en los archivos.' }, { status: 400 });
    }

    // Parallel: salary parsing + exchange rates + CV text extraction
    const cvTexts = hasScoring
      ? await mapConcurrent(cvFiles, async (f) => {
          try { return { name: f.name, text: await extractTextFromFile(f) }; }
          catch { return { name: f.name, text: '' }; }
        }, 4)
      : [];

    const [parsedSalaries, rates] = await Promise.all([
      parseSalaries(allCandidates),
      getExchangeRates(),
    ]);

    const cvFilenames = cvTexts.map((c) => c.name);

    // Build salary rows
    const rows: (CandidateSalaryRow & { annualUSD: number | null })[] = allCandidates.map((c, i) => {
      const parsed = parsedSalaries[i];
      let annualUSD: number | null = null;
      let annualUYU: number | null = null;
      let parseNote = '';

      if (parsed?.annualAmount) {
        const usd = toUSD(parsed.annualAmount, parsed.currency, rates.rates, rates.arsPerUSD);
        annualUSD = Math.round(usd);
        annualUYU = Math.round(toUYU(usd, rates.usdToUYU));
        if (parsed.confidence === 'low') parseNote = 'estimado';
      } else {
        parseNote = 'no parseable';
      }

      const exceedsCap = annualUSD !== null && annualUSD > ANNUAL_CAP_USD;
      const locationParts = [c.city, c.state !== c.city ? c.state : '', c.country].filter(Boolean);

      return {
        name: `${c.firstName} ${c.lastName}`.trim(),
        position: c.position || 'Sin posición',
        location: locationParts.join(', '),
        country: c.country || 'Desconocido',
        rawSalary: c.rawSalary,
        annualUSD,
        annualUYU,
        parseNote: exceedsCap ? 'excede cap' : parseNote,
        excludedFromComparison: exceedsCap,
      };
    });

    // Build geographic reports (same as /api/salary)
    const byPosition = new Map<string, typeof rows>();
    for (const row of rows) {
      if (!byPosition.has(row.position)) byPosition.set(row.position, []);
      byPosition.get(row.position)!.push(row);
    }

    const reports: PositionReport[] = [];
    for (const [position, candidates] of byPosition) {
      const sorted = [...candidates].sort((a, b) => (a.annualUSD ?? Infinity) - (b.annualUSD ?? Infinity));
      const eligible = candidates.filter((c) => !c.excludedFromComparison);
      const byCountryMap = new Map<string, typeof eligible>();
      for (const c of eligible) {
        if (!byCountryMap.has(c.country)) byCountryMap.set(c.country, []);
        byCountryMap.get(c.country)!.push(c);
      }
      const byLocation: LocationSummary[] = [];
      for (const [country, cands] of byCountryMap) {
        const withSalary = cands.filter((c) => c.annualUSD !== null);
        if (!withSalary.length) continue;
        const amounts = withSalary.map((c) => c.annualUSD!);
        const avg = Math.round(amounts.reduce((a, b) => a + b, 0) / amounts.length);
        byLocation.push({
          country, count: withSalary.length, avgUSD: avg,
          minUSD: Math.min(...amounts), maxUSD: Math.max(...amounts),
          avgUYU: Math.round(toUYU(avg, rates.usdToUYU)),
        });
      }
      byLocation.sort((a, b) => a.avgUSD - b.avgUSD);
      reports.push({ position, candidates: sorted, byLocation, excludedCount: candidates.filter((c) => c.excludedFromComparison).length });
    }

    // Scoring (only if JD + CVs provided)
    let scoredCandidates: ScoredCandidate[] | undefined;
    let matchStats = { total: rows.length, matched: 0, analyzed: 0 };

    if (hasScoring && jd) {
      const jobRequirements: JobRequirements = {
        description: jd.description,
        seniority: jd.seniority,
        requiredSkills: jd.requiredSkills ?? [],
      };

      // Match CVs to candidates
      const matched: { rowIdx: number; cvText: string; cvFilename: string; confidence: number }[] = [];
      rows.forEach((row, rowIdx) => {
        const match = matchCVToCandidate(row.name, cvFilenames);
        if (match) {
          const cvEntry = cvTexts.find((c) => c.name === match.filename);
          if (cvEntry?.text) {
            matched.push({ rowIdx, cvText: cvEntry.text, cvFilename: match.filename, confidence: match.confidence });
          }
        }
      });
      matchStats.matched = matched.length;

      // Analyze CVs concurrently
      const analysisResults = await mapConcurrent(
        matched,
        async (m) => {
          try {
            const result = await analyzeCV({ cvText: m.cvText, jobRequirements });
            return { ...m, result };
          } catch {
            return { ...m, result: null };
          }
        },
        CV_CONCURRENCY,
      );
      matchStats.analyzed = analysisResults.filter((r) => r.result).length;

      // Build scored candidates list (all candidates, matched or not)
      const scoreMap = new Map<number, typeof analysisResults[0]>();
      analysisResults.forEach((r) => scoreMap.set(r.rowIdx, r));

      scoredCandidates = rows.map((row, i) => {
        const scoreData = scoreMap.get(i);
        const base: ScoredCandidate = {
          name: row.name,
          position: row.position,
          location: row.location,
          country: row.country,
          rawSalary: row.rawSalary,
          monthlyUSD: row.annualUSD !== null ? Math.round(row.annualUSD / 12) : null,
          annualUYU: row.annualUYU,
          excludedFromComparison: row.excludedFromComparison ?? false,
          cvMatched: !!scoreData,
        };

        if (scoreData?.result) {
          return {
            ...base,
            cvFilename: scoreData.cvFilename,
            matchConfidence: scoreData.confidence,
            compatibilityScore: scoreData.result.compatibilityScore,
            recommendation: scoreData.result.recommendation,
            profileSummary: scoreData.result.profileSummary,
            matchingSkills: scoreData.result.matchingSkills,
            missingSkills: scoreData.result.missingSkills,
            recommendationReason: scoreData.result.recommendationReason,
          };
        }
        if (scoreData) {
          return { ...base, cvFilename: scoreData.cvFilename, matchConfidence: scoreData.confidence };
        }
        return base;
      });

      // Sort by score desc, then by monthlyUSD asc
      scoredCandidates.sort((a, b) => {
        if ((b.compatibilityScore ?? -1) !== (a.compatibilityScore ?? -1))
          return (b.compatibilityScore ?? -1) - (a.compatibilityScore ?? -1);
        return (a.monthlyUSD ?? Infinity) - (b.monthlyUSD ?? Infinity);
      });
    }

    return NextResponse.json({
      success: true,
      reports,
      scoredCandidates,
      rates: { usdToUYU: rates.usdToUYU, arsPerUSD: rates.arsPerUSD, rateType: 'MEP', fetchedAt: new Date().toISOString() },
      matchStats,
    });

  } catch (err) {
    console.error('[/api/salary-score]', err);
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Error interno' }, { status: 500 });
  }
}
