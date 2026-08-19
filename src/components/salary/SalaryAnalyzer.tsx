'use client';

import { useState, useRef } from 'react';
import { SalaryAnalysisResponse, PositionReport, CandidateSalaryRow } from '@/types/salary';

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
}

function UploadIcon() {
  return (
    <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function CandidatesTable({ candidates }: { candidates: CandidateSalaryRow[] }) {
  const [open, setOpen] = useState(false);
  const withSalary = candidates.filter((c) => c.annualUSD !== null);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-600"
      >
        <span>Ver candidatos individuales ({withSalary.length} con salario declarado)</span>
        <ChevronIcon open={open} />
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-t border-b border-slate-200">
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidato</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">País</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Ciudad</th>
                <th className="text-left px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pedido original</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">USD/año</th>
                <th className="text-right px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">UYU/año</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c, i) => (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs">{c.country || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs">{c.location.split(',').slice(0, -1).join(',').trim() || '—'}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{c.rawSalary}</td>
                  <td className="px-4 py-2.5 text-right">
                    {c.annualUSD !== null ? (
                      <span className="font-semibold text-slate-800">
                        {fmt(c.annualUSD)}
                        {c.parseNote === 'estimado' && <span className="ml-1 text-amber-400 text-xs">~</span>}
                      </span>
                    ) : <span className="text-slate-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-500 text-xs">
                    {c.annualUYU !== null ? fmt(c.annualUYU, 'UYU') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PositionView({ report }: { report: PositionReport }) {
  const locs = report.byLocation;
  const maxAvg = locs.length ? Math.max(...locs.map((l) => l.avgUSD)) : 0;
  const minCountry = locs[0]?.country;
  const maxCountry = locs[locs.length - 1]?.country;
  const totalCandidates = report.candidates.length;
  const withSalary = report.candidates.filter((c) => c.annualUSD !== null).length;

  return (
    <div className="space-y-6">

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1">{totalCandidates} candidatos totales</span>
        <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1">{withSalary} con salario declarado</span>
        <span className="bg-slate-100 text-slate-600 rounded-full px-3 py-1">{locs.length} países</span>
        {minCountry && (
          <span className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 font-medium">
            ★ Más económico: {minCountry} ({fmt(locs[0].avgUSD)}/año)
          </span>
        )}
        {maxCountry && maxCountry !== minCountry && (
          <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1">
            Más alto: {maxCountry} ({fmt(locs[locs.length - 1].avgUSD)}/año)
          </span>
        )}
      </div>

      {/* Comparison table */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Comparativa por localidad · ordenado por promedio USD ↑</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">País</th>
                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Candidatos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Mín USD/año</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prom USD/año</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Máx USD/año</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Prom UYU/año</th>
                <th className="px-4 py-3 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {locs.map((loc, i) => {
                const isMin = loc.country === minCountry;
                const isMax = loc.country === maxCountry && locs.length > 1;
                return (
                  <tr
                    key={loc.country}
                    className={`border-b border-slate-100 ${isMin ? 'bg-emerald-50' : isMax ? 'bg-rose-50' : 'hover:bg-slate-50'} transition-colors`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isMin && <span className="text-emerald-600 font-bold text-xs">★</span>}
                        <span className={`font-semibold ${isMin ? 'text-emerald-800' : 'text-slate-800'}`}>{loc.country}</span>
                        {isMin && <span className="text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">Más bajo</span>}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">#{i + 1} de {locs.length}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{loc.count}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{fmt(loc.minUSD)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${isMin ? 'text-emerald-700' : isMax ? 'text-rose-700' : 'text-slate-800'}`}>
                        {fmt(loc.avgUSD)}
                      </span>
                      <Bar value={loc.avgUSD} max={maxAvg} color={isMin ? 'bg-emerald-400' : isMax ? 'bg-rose-400' : 'bg-[#7c3aed]'} />
                    </td>
                    <td className="px-4 py-3 text-right text-slate-600">{fmt(loc.maxUSD)}</td>
                    <td className="px-4 py-3 text-right text-slate-500 text-xs">{fmt(loc.avgUYU, 'UYU')}</td>
                    <td className="px-4 py-3 text-right">
                      {i > 0 && (
                        <span className="text-xs text-rose-500 font-medium">
                          +{Math.round(((loc.avgUSD - locs[0].avgUSD) / locs[0].avgUSD) * 100)}% vs {minCountry}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidates collapsible */}
      <CandidatesTable candidates={report.candidates} />
    </div>
  );
}

export function SalaryAnalyzer() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalaryAnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    const xlsx = Array.from(incoming).filter((f) => f.name.endsWith('.xlsx') || f.name.endsWith('.xls'));
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [...prev, ...xlsx.filter((f) => !names.has(f.name))];
    });
  }

  function removeFile(name: string) {
    setFiles((prev) => prev.filter((f) => f.name !== name));
  }

  async function analyze() {
    if (!files.length) return;
    setLoading(true);
    setResult(null);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('files', f));
      const res = await fetch('/api/salary', { method: 'POST', body: fd });
      const data: SalaryAnalysisResponse = await res.json();
      setResult(data);
      setActiveTab(0);
    } catch {
      setResult({ success: false, error: 'Error de conexión con el servidor.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`rounded-2xl border-2 border-dashed cursor-pointer transition-colors p-8 text-center
          ${dragging ? 'border-[#7c3aed] bg-purple-50' : 'border-slate-200 hover:border-[#7c3aed] hover:bg-slate-50'}`}
      >
        <input ref={inputRef} type="file" accept=".xlsx,.xls" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
        <UploadIcon />
        <p className="mt-3 text-sm font-medium text-slate-700">Arrastrá los Excel de BambooHR o hacé click para seleccionar</p>
        <p className="mt-1 text-xs text-slate-400">BambooHR → Jobs → Active Applicants → Export to Excel</p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-2 text-sm">
              <span className="text-slate-700 font-medium truncate">{f.name}</span>
              <button onClick={() => removeFile(f.name)} className="text-slate-400 hover:text-rose-500 transition-colors ml-4 shrink-0 text-xs">Quitar</button>
            </li>
          ))}
        </ul>
      )}

      {files.length > 0 && (
        <button
          onClick={analyze}
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#7c3aed] text-white font-semibold text-sm hover:bg-[#6d28d9] disabled:opacity-60 transition-colors"
        >
          {loading ? 'Analizando salarios...' : `Analizar ${files.length} archivo${files.length > 1 ? 's' : ''}`}
        </button>
      )}

      {result && !result.success && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-sm text-rose-700">{result.error}</div>
      )}

      {result?.success && result.reports && (
        <div className="space-y-5">
          {/* Exchange rates */}
          {result.rates && (
            <div className="flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="bg-slate-100 rounded-full px-3 py-1">1 USD = {result.rates.usdToUYU.toFixed(1)} UYU</span>
              <span className="bg-slate-100 rounded-full px-3 py-1">ARS MEP: {result.rates.arsPerUSD.toFixed(0)} ARS/USD</span>
              <span className="bg-slate-100 rounded-full px-3 py-1">
                Actualizado: {new Date(result.rates.fetchedAt).toLocaleTimeString('es-UY', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {/* Position tabs */}
          {result.reports.length > 1 && (
            <div className="flex gap-2 border-b border-slate-200">
              {result.reports.map((r, i) => (
                <button
                  key={r.position}
                  onClick={() => setActiveTab(i)}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px
                    ${activeTab === i ? 'border-[#7c3aed] text-[#7c3aed]' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                  {r.position}
                </button>
              ))}
            </div>
          )}

          <PositionView report={result.reports[activeTab]} />
        </div>
      )}
    </div>
  );
}
