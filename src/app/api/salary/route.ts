import { NextRequest, NextResponse } from 'next/server';
import { parseBambooHRExcel } from '@/services/excelParser';
import { parseSalaries } from '@/services/salaryParser';
import { getExchangeRates, toUSD, toUYU } from '@/services/currencyConverter';
import { CandidateSalaryRow, LocationSummary, PositionReport, SalaryAnalysisResponse } from '@/types/salary';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse<SalaryAnalysisResponse>> {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files.length) {
      return NextResponse.json({ success: false, error: 'No se recibieron archivos.' }, { status: 400 });
    }

    // Parse all Excel files
    const allCandidates = [];
    for (const file of files) {
      const buffer = await file.arrayBuffer();
      const candidates = parseBambooHRExcel(buffer);
      allCandidates.push(...candidates);
    }

    if (!allCandidates.length) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron candidatos con salario declarado en los archivos.' },
        { status: 400 },
      );
    }

    // Parallel: parse salaries with Groq + fetch exchange rates
    const [parsedSalaries, rates] = await Promise.all([
      parseSalaries(allCandidates),
      getExchangeRates(),
    ]);

    // Build rows
    const rows: CandidateSalaryRow[] = allCandidates.map((c, i) => {
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

      // Cap: $15,000 USD/mes equivalente — candidatos que superan esto se excluyen del análisis geográfico
      // (suelen ser montos anuales mal interpretados o candidatos de mercados fuera del rango LATAM)
      const MONTHLY_CAP_USD = 15_000;
      const ANNUAL_CAP_USD = MONTHLY_CAP_USD * 12;

      const locationParts = [c.city, c.state !== c.city ? c.state : '', c.country].filter(Boolean);
      const exceedsCap = annualUSD !== null && annualUSD > ANNUAL_CAP_USD;
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

    // Group by position
    const byPosition = new Map<string, CandidateSalaryRow[]>();
    for (const row of rows) {
      if (!byPosition.has(row.position)) byPosition.set(row.position, []);
      byPosition.get(row.position)!.push(row);
    }

    const reports: PositionReport[] = [];
    for (const [position, candidates] of byPosition) {
      const sorted = [...candidates].sort((a, b) => (a.annualUSD ?? Infinity) - (b.annualUSD ?? Infinity));

      // Geographic summary — solo candidatos dentro del cap
      const eligible = candidates.filter((c) => !c.excludedFromComparison);
      const byCountryMap = new Map<string, CandidateSalaryRow[]>();
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
          country,
          count: withSalary.length,
          avgUSD: avg,
          minUSD: Math.min(...amounts),
          maxUSD: Math.max(...amounts),
          avgUYU: Math.round(toUYU(avg, rates.usdToUYU)),
        });
      }
      byLocation.sort((a, b) => a.avgUSD - b.avgUSD);

      const excludedCount = candidates.filter((c) => c.excludedFromComparison).length;
      reports.push({ position, candidates: sorted, byLocation, excludedCount });
    }

    return NextResponse.json({
      success: true,
      reports,
      rates: {
        usdToUYU: rates.usdToUYU,
        arsPerUSD: rates.arsPerUSD,
        rateType: 'MEP',
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[/api/salary]', err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Error interno del servidor' },
      { status: 500 },
    );
  }
}
