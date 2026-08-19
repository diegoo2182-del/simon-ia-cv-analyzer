'use client';

import { useState, useRef } from 'react';
import { SalaryAnalysisResponse, SalaryScoreResponse, PositionReport, ScoredCandidate } from '@/types/salary';
import { Seniority } from '@/types/analysis';

const SENIORITY_OPTIONS: Seniority[] = ['Junior', 'Semi-Senior', 'Senior', 'Lead', 'Principal'];

function fmtUSD(n: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);
}
function fmtUYU(n: number) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(n);
}

// ─── Icons ───────────────────────────────────────────────────────────────────

function UploadIcon() {
  return (
    <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  );
}
function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

// ─── Salary view ─────────────────────────────────────────────────────────────

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1"><div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} /></div>;
}

function CandidatesTable({ candidates }: { candidates: PositionReport['candidates'] }) {
  const [open, setOpen] = useState(false);
  const withSalary = candidates.filter((c) => c.annualUSD !== null);
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-600">
        <span>Ver candidatos individuales ({withSalary.length} con salario declarado)</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-t border-b border-slate-200">
                {['#', 'Candidato', 'País', 'Ciudad', 'Pedido original', 'USD/mes', 'UYU/año'].map((h) => (
                  <th key={h} className={`px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === '#' || h === 'Candidato' || h === 'País' || h === 'Ciudad' || h === 'Pedido original' ? 'text-left' : 'text-right'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{c.country || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{c.location.split(',').slice(0, -1).join(',').trim() || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{c.rawSalary}</td>
                  <td className="px-4 py-2.5 text-right">
                    {c.annualUSD !== null ? (
                      <span className={`font-semibold ${c.excludedFromComparison ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                        {fmtUSD(Math.round(c.annualUSD / 12))}
                        {c.excludedFromComparison && <span className="ml-1 text-amber-500 text-xs no-underline" style={{ textDecoration: 'none' }}>excluido</span>}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-500 text-xs">{c.annualUYU !== null ? fmtUYU(c.annualUYU) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SalaryView({ report }: { report: PositionReport }) {
  const locs = report.byLocation;
  const maxAvg = locs.length ? Math.max(...locs.map((l) => l.avgUSD)) : 0;
  const minCountry = locs[0]?.country;
  const maxCountry = locs[locs.length - 1]?.country;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1">{report.candidates.length} candidatos</span>
        <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1">{locs.length} países en análisis</span>
        {report.excludedCount > 0 && <span className="bg-amber-100 text-amber-700 rounded-full px-3 py-1" title="Montos >USD 15k/mes excluidos">{report.excludedCount} excluidos del análisis (&gt;USD 15k/mes)</span>}
        {minCountry && <span className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 font-medium">★ Más económico: {minCountry} ({fmtUSD(locs[0].avgUSD)}/mes)</span>}
        {maxCountry && maxCountry !== minCountry && <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1">Más alto: {maxCountry} ({fmtUSD(locs[locs.length - 1].avgUSD)}/mes)</span>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['País', 'Candidatos', 'Mín USD/mes', 'Prom USD/mes', 'Máx USD/mes', 'Prom UYU/año', ''].map((h, i) => (
                <th key={i} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i === 0 || i === 6 ? 'text-left' : 'text-right'} ${i === 1 ? 'text-center' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {locs.map((loc, i) => {
              const isMin = loc.country === minCountry;
              const isMax = loc.country === maxCountry && locs.length > 1;
              return (
                <tr key={loc.country} className={`border-b border-slate-100 ${isMin ? 'bg-emerald-50' : isMax ? 'bg-rose-50' : 'hover:bg-slate-50'}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {isMin && <span className="text-emerald-600 font-bold text-xs">★</span>}
                      <span className={`font-semibold ${isMin ? 'text-emerald-800' : 'text-slate-800'}`}>{loc.country}</span>
                      {isMin && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Más bajo</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">#{i + 1} de {locs.length}</div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">{loc.count}</td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtUSD(Math.round(loc.minUSD / 12))}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-bold ${isMin ? 'text-emerald-700' : isMax ? 'text-rose-700' : 'text-slate-800'}`}>{fmtUSD(Math.round(loc.avgUSD / 12))}</span>
                    <Bar value={loc.avgUSD} max={maxAvg} color={isMin ? 'bg-emerald-400' : isMax ? 'bg-rose-400' : 'bg-[#7c3aed]'} />
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">{fmtUSD(Math.round(loc.maxUSD / 12))}</td>
                  <td className="px-4 py-3 text-right text-slate-500 text-xs">{fmtUYU(loc.avgUYU)}</td>
                  <td className="px-4 py-3 text-right">
                    {i > 0 && <span className="text-xs text-rose-500 font-medium">+{Math.round(((loc.avgUSD - locs[0].avgUSD) / locs[0].avgUSD) * 100)}% vs {minCountry}</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <CandidatesTable candidates={report.candidates} />
    </div>
  );
}

// ─── Score view ───────────────────────────────────────────────────────────────

const REC_CONFIG = {
  ADVANCE:  { label: 'Avanzar',    bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  CONSIDER: { label: 'Considerar', bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
  REJECT:   { label: 'Descartar',  bg: 'bg-rose-100',    text: 'text-rose-700',    dot: 'bg-rose-500' },
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? 'bg-emerald-500' : score >= 45 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`font-bold text-sm ${score >= 70 ? 'text-emerald-700' : score >= 45 ? 'text-amber-600' : 'text-rose-600'}`}>{score}</span>
    </div>
  );
}

function ScoreView({ candidates, matchStats }: { candidates: ScoredCandidate[]; matchStats?: { total: number; matched: number; analyzed: number } }) {
  const analyzed = candidates.filter((c) => c.compatibilityScore !== undefined);
  const unmatched = candidates.filter((c) => !c.cvMatched);

  return (
    <div className="space-y-5">
      {matchStats && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1">{matchStats.total} candidatos en Excel</span>
          <span className="bg-purple-100 text-purple-700 rounded-full px-3 py-1">{matchStats.matched} CVs cruzados</span>
          <span className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1">{matchStats.analyzed} analizados con IA</span>
          {unmatched.length > 0 && <span className="bg-slate-100 text-slate-500 rounded-full px-3 py-1">{unmatched.length} sin CV cargado</span>}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['#', 'Candidato', 'País / Ciudad', 'Score', 'Recomendación', 'Salario pedido', 'Skills match', 'Skills faltantes'].map((h, i) => (
                <th key={i} className={`px-3 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${i <= 2 ? 'text-left' : i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {analyzed.map((c, i) => {
              const rec = c.recommendation ? REC_CONFIG[c.recommendation] : null;
              return (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-3 text-slate-400 text-xs font-medium">{i + 1}</td>
                  <td className="px-3 py-3">
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    {c.profileSummary && <div className="text-xs text-slate-400 mt-0.5 max-w-xs truncate" title={c.profileSummary}>{c.profileSummary}</div>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-slate-700 text-xs font-medium">{c.country}</div>
                    <div className="text-slate-400 text-xs">{c.location.split(',').slice(0, -1).join(',').trim() || ''}</div>
                  </td>
                  <td className="px-3 py-3"><ScoreBar score={c.compatibilityScore!} /></td>
                  <td className="px-3 py-3">
                    {rec && (
                      <span className={`inline-flex items-center gap-1.5 ${rec.bg} ${rec.text} px-2.5 py-1 rounded-full text-xs font-medium`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${rec.dot}`} />
                        {rec.label}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {c.monthlyUSD !== null ? (
                      <div>
                        <div className="font-semibold text-slate-800">{fmtUSD(c.monthlyUSD!)}<span className="text-slate-400 font-normal">/mes</span></div>
                        {c.annualUYU && <div className="text-xs text-slate-400">{fmtUYU(c.annualUYU)}/año</div>}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.matchingSkills ?? []).slice(0, 3).map((s) => (
                        <span key={s} className="bg-emerald-100 text-emerald-700 text-xs px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {(c.matchingSkills ?? []).length > 3 && <span className="text-xs text-slate-400">+{(c.matchingSkills ?? []).length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(c.missingSkills ?? []).slice(0, 3).map((s) => (
                        <span key={s} className="bg-rose-100 text-rose-600 text-xs px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                      {(c.missingSkills ?? []).length > 3 && <span className="text-xs text-slate-400">+{(c.missingSkills ?? []).length - 3}</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {unmatched.length > 0 && (
        <div className="text-xs text-slate-400 border border-slate-200 rounded-lg px-4 py-3">
          <span className="font-medium text-slate-500">Sin CV cargado ({unmatched.length}):</span>{' '}
          {unmatched.map((c) => c.name).join(', ')}
        </div>
      )}
    </div>
  );
}

// ─── Upload zone ──────────────────────────────────────────────────────────────

function FileDropZone({ label, hint, accept, multiple, files, onAdd, onRemove }: {
  label: string; hint: string; accept: string; multiple: boolean;
  files: File[]; onAdd: (fl: FileList | null) => void; onRemove: (name: string) => void;
}) {
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-700">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onAdd(e.dataTransfer.files); }}
        onClick={() => ref.current?.click()}
        className={`rounded-xl border-2 border-dashed cursor-pointer transition-colors p-5 text-center
          ${drag ? 'border-[#7c3aed] bg-purple-50' : 'border-slate-200 hover:border-[#7c3aed] hover:bg-slate-50'}`}
      >
        <input ref={ref} type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => onAdd(e.target.files)} />
        <UploadIcon />
        <p className="mt-2 text-xs font-medium text-slate-600">{hint}</p>
      </div>
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-1.5 text-xs">
              <span className="text-slate-700 truncate">{f.name}</span>
              <button onClick={(e) => { e.stopPropagation(); onRemove(f.name); }} className="text-slate-400 hover:text-rose-500 ml-3 shrink-0">✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type ResultView = 'salary' | 'score';

export function SalaryAnalyzer() {
  const [excelFiles, setExcelFiles] = useState<File[]>([]);
  const [cvFiles, setCvFiles] = useState<File[]>([]);
  const [jdText, setJdText] = useState('');
  const [seniority, setSeniority] = useState<Seniority>('Senior');
  const [skills, setSkills] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [result, setResult] = useState<SalaryScoreResponse | null>(null);
  const [activePosition, setActivePosition] = useState(0);
  const [view, setView] = useState<ResultView>('salary');

  function addFiles(setter: React.Dispatch<React.SetStateAction<File[]>>, exts: string[]) {
    return (fl: FileList | null) => {
      if (!fl) return;
      const valid = Array.from(fl).filter((f) => exts.some((e) => f.name.toLowerCase().endsWith(e)));
      setter((prev) => {
        const names = new Set(prev.map((f) => f.name));
        return [...prev, ...valid.filter((f) => !names.has(f.name))];
      });
    };
  }
  function removeFile(setter: React.Dispatch<React.SetStateAction<File[]>>, name: string) {
    setter((prev) => prev.filter((f) => f.name !== name));
  }

  const withScoring = cvFiles.length > 0 && jdText.trim().length > 20;
  const canAnalyze = excelFiles.length > 0;

  async function analyze() {
    if (!canAnalyze) return;
    setLoading(true);
    setResult(null);
    setLoadingMsg(withScoring ? `Analizando ${excelFiles.length} Excel + ${cvFiles.length} CVs...` : `Procesando salarios...`);

    try {
      const fd = new FormData();
      excelFiles.forEach((f) => fd.append('files', f));
      if (withScoring) {
        cvFiles.forEach((f) => fd.append('cvs', f));
        fd.append('jd', JSON.stringify({
          description: jdText,
          seniority,
          requiredSkills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        }));
      }

      const endpoint = withScoring ? '/api/salary-score' : '/api/salary';
      const res = await fetch(endpoint, { method: 'POST', body: fd });
      const data: SalaryScoreResponse = await res.json();
      setResult(data);
      setActivePosition(0);
      setView(withScoring && data.scoredCandidates?.length ? 'score' : 'salary');
    } catch {
      setResult({ success: false, error: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
      setLoadingMsg('');
    }
  }

  const hasScoreResults = result?.success && result.scoredCandidates && result.scoredCandidates.some((c) => c.compatibilityScore !== undefined);

  return (
    <div className="space-y-6">
      {/* Upload sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FileDropZone
          label="1. Base de datos (Excel BambooHR)"
          hint="Arrastrá los Excel o hacé click — uno por aviso"
          accept=".xlsx,.xls"
          multiple
          files={excelFiles}
          onAdd={addFiles(setExcelFiles, ['.xlsx', '.xls'])}
          onRemove={(n) => removeFile(setExcelFiles, n)}
        />
        <FileDropZone
          label="2. CVs de candidatos (opcional — para análisis por score)"
          hint="PDF o DOCX — el nombre del archivo debe incluir el nombre del candidato"
          accept=".pdf,.docx,.doc"
          multiple
          files={cvFiles}
          onAdd={addFiles(setCvFiles, ['.pdf', '.docx', '.doc'])}
          onRemove={(n) => removeFile(setCvFiles, n)}
        />
      </div>

      {/* JD section — only shown when CVs are loaded */}
      {cvFiles.length > 0 && (
        <div className="space-y-3 border border-slate-200 rounded-xl p-4">
          <label className="text-sm font-semibold text-slate-700">3. Descripción del puesto (JD)</label>
          <div className="flex gap-3">
            <select
              value={seniority}
              onChange={(e) => setSeniority(e.target.value as Seniority)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            >
              {SENIORITY_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input
              type="text"
              placeholder="Skills requeridas (ej: Python, SQL, AWS) — separadas por coma"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
            />
          </div>
          <textarea
            placeholder="Pegá aquí la descripción completa del puesto..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            rows={5}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7c3aed] resize-none"
          />
        </div>
      )}

      {/* Analyze button */}
      {canAnalyze && (
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#7c3aed] text-white font-semibold text-sm hover:bg-[#6d28d9] disabled:opacity-60 transition-colors"
        >
          {loading ? loadingMsg : withScoring
            ? `Analizar salarios + perfiles (${cvFiles.length} CVs)`
            : `Analizar salarios (${excelFiles.length} archivo${excelFiles.length > 1 ? 's' : ''})`}
        </button>
      )}

      {result && !result.success && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{result.error}</div>
      )}

      {/* Results */}
      {result?.success && result.reports && (
        <div className="space-y-5">
          {/* Exchange rates */}
          {result.rates && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="bg-slate-100 rounded-full px-3 py-1">1 USD = {result.rates.usdToUYU.toFixed(1)} UYU</span>
              <span className="bg-slate-100 rounded-full px-3 py-1">ARS MEP: {result.rates.arsPerUSD.toFixed(0)} ARS/USD</span>
              <span className="bg-slate-100 rounded-full px-3 py-1">
                {new Date(result.rates.fetchedAt).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* View toggle */}
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
            <button
              onClick={() => setView('salary')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'salary' ? 'bg-white shadow-sm text-[#7c3aed]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              📍 Por localidad / salario
            </button>
            {hasScoreResults && (
              <button
                onClick={() => setView('score')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${view === 'score' ? 'bg-white shadow-sm text-[#7c3aed]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                🏆 Por score / perfil
              </button>
            )}
          </div>

          {/* Position tabs (salary view only) */}
          {view === 'salary' && result.reports.length > 1 && (
            <div className="flex gap-2 border-b border-slate-200">
              {result.reports.map((r, i) => (
                <button key={r.position} onClick={() => setActivePosition(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activePosition === i ? 'border-[#7c3aed] text-[#7c3aed]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                  {r.position}
                </button>
              ))}
            </div>
          )}

          {view === 'salary' && <SalaryView report={result.reports[activePosition]} />}
          {view === 'score' && result.scoredCandidates && (
            <ScoreView candidates={result.scoredCandidates} matchStats={result.matchStats} />
          )}
        </div>
      )}
    </div>
  );
}
