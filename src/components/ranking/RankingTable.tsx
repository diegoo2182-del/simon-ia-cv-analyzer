'use client';

import { RankedCandidate } from '@/types/analysis';

interface RankingTableProps {
  candidates: RankedCandidate[];
  onReset: () => void;
}

const RECOMMENDATION_CONFIG = {
  ADVANCE:  { label: 'Avanzar',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  CONSIDER: { label: 'Considerar', bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  REJECT:   { label: 'Rechazar',  bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
};

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : score >= 50 ? 'text-amber-600 bg-amber-50 border-amber-200'
    : 'text-red-600 bg-red-50 border-red-200';
  return (
    <span className={`inline-flex items-center text-lg font-bold px-3 py-1 rounded-lg border ${color}`}>
      {score}
    </span>
  );
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-slate-400 w-7 text-right tabular-nums">{value}%</span>
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.048 3.697A1 1 0 0112 3h0a1 1 0 01.952.697l1.56 4.8H19.5a1 1 0 01.588 1.81l-3.87 2.81 1.478 4.546a1 1 0 01-1.538 1.118L12 15.882l-4.158 3.099a1 1 0 01-1.538-1.118l1.478-4.546-3.87-2.81A1 1 0 014.5 8.497h5.988l1.56-4.8z"/>
    </svg>
  );
}

export function RankingTable({ candidates, onReset }: RankingTableProps) {
  const best = candidates[0];

  return (
    <div className="mt-8 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-lg font-bold text-[#1a1a3e]">Ranking de candidatos</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{candidates.length} CVs analizados</span>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#7c3aed] transition-colors px-3 py-1.5 rounded-lg hover:bg-purple-50 border border-transparent hover:border-[#e8e4f0]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Nuevo ranking
        </button>
      </div>

      {/* Mejor candidato */}
      <div className="rounded-xl border-2 border-[#7c3aed] bg-gradient-to-r from-purple-50 to-white p-5">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1">
            <TrophyIcon />
            <span className="text-xs font-bold text-amber-500">#1</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-base font-bold text-[#1a1a3e] truncate">{best.fileName.replace(/\.[^/.]+$/, '')}</p>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#7c3aed] text-white">
                Mayor score
              </span>
              {best.result.recommendation === 'REJECT' && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-600 border border-red-200">
                  ⚠ Ningún candidato supera el umbral mínimo
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1 line-clamp-2">{best.result.executiveSummary.summary}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {best.result.executiveSummary.highlights.slice(0, 4).map((h, i) => (
                <span key={i} className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">{h}</span>
              ))}
            </div>
          </div>
          <ScoreBadge score={best.result.compatibilityScore} />
        </div>
      </div>

      {/* Tabla completa */}
      <div className="rounded-xl border border-[#e8e4f0] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f0edf8] bg-[#f8f7ff]">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 w-10">#</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Candidato</th>
                <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 w-24">Score</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3 min-w-[180px]">Desglose</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Skills match</th>
                <th className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider px-5 py-3">Recomendación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0edf8]">
              {candidates.map((c, i) => {
                const rec = RECOMMENDATION_CONFIG[c.result.recommendation];
                const cats = c.result.categoryScores;
                const isFirst = i === 0;

                return (
                  <tr key={c.fileName} className={isFirst ? 'bg-purple-50/30' : 'hover:bg-slate-50 transition-colors'}>

                    {/* Rank */}
                    <td className="px-5 py-4">
                      <span className={`text-sm font-bold ${isFirst ? 'text-[#7c3aed]' : 'text-slate-400'}`}>
                        {isFirst ? '🏆' : `#${i + 1}`}
                      </span>
                    </td>

                    {/* Nombre */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-[#1a1a3e] truncate max-w-[180px]">
                        {c.fileName.replace(/\.[^/.]+$/, '')}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {c.result.skillsBreakdown.detectedSeniority}
                      </p>
                    </td>

                    {/* Score */}
                    <td className="px-5 py-4 text-center">
                      <ScoreBadge score={c.result.compatibilityScore} />
                    </td>

                    {/* Desglose */}
                    <td className="px-5 py-4">
                      <div className="space-y-1 min-w-[160px]">
                        <MiniBar value={cats.skills}      color="bg-purple-400" />
                        <MiniBar value={cats.experience}  color="bg-blue-400" />
                        <MiniBar value={cats.seniority}   color="bg-teal-400" />
                        <MiniBar value={cats.culturaFit}  color="bg-amber-400" />
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {c.result.matchingSkills.slice(0, 4).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">{s}</span>
                        ))}
                        {c.result.matchingSkills.length > 4 && (
                          <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">+{c.result.matchingSkills.length - 4}</span>
                        )}
                        {c.result.matchingSkills.length === 0 && (
                          <span className="text-xs text-slate-400 italic">Sin matches</span>
                        )}
                      </div>
                    </td>

                    {/* Recomendación */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${rec.bg} ${rec.text} ${rec.border}`}>
                        {rec.label}
                      </span>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
