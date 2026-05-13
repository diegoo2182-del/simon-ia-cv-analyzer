'use client';

import { useEffect, useState } from 'react';

interface CVVacancyComparisonProps {
  matchingSkills: string[];
  missingSkills: string[];
  detectedSkills: string[];
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function MatchBar({ matchCount, total }: { matchCount: number; total: number }) {
  const [width, setWidth] = useState(0);
  const pct = total > 0 ? Math.round((matchCount / total) * 100) : 0;

  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 150);
    return () => clearTimeout(t);
  }, [pct]);

  const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600';
  const bgBadge = pct >= 75 ? 'bg-emerald-50 border-emerald-200' : pct >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">
          {matchCount} de {total} skills requeridas encontradas
        </span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${bgBadge} ${textColor}`}>
          {pct}% match
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function CVVacancyComparison({ matchingSkills, missingSkills, detectedSkills }: CVVacancyComparisonProps) {
  const requiredTotal = matchingSkills.length + missingSkills.length;

  // Skills que el candidato tiene pero no eran requeridas
  const matchingSet = new Set(matchingSkills.map(s => s.toLowerCase()));
  const missingSet = new Set(missingSkills.map(s => s.toLowerCase()));
  const additionalSkills = detectedSkills.filter(
    s => !matchingSet.has(s.toLowerCase()) && !missingSet.has(s.toLowerCase())
  );

  const hasRequiredSkills = requiredTotal > 0;

  return (
    <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-[#7c3aed] bg-white p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1a1a3e]">Comparación CV vs Vacante</h3>
        {!hasRequiredSkills && (
          <span className="text-xs text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
            Sin skills requeridas definidas
          </span>
        )}
      </div>

      {/* Barra de match */}
      {hasRequiredSkills && (
        <MatchBar matchCount={matchingSkills.length} total={requiredTotal} />
      )}

      {/* Grid de skills requeridas */}
      {hasRequiredSkills && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Skills requeridas
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {matchingSkills.map(skill => (
              <div
                key={skill}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                <span className="text-emerald-500"><CheckIcon /></span>
                <span className="text-xs font-medium truncate">{skill}</span>
              </div>
            ))}
            {missingSkills.map(skill => (
              <div
                key={skill}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600"
              >
                <span className="text-red-400"><XIcon /></span>
                <span className="text-xs font-medium truncate">{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills adicionales */}
      {additionalSkills.length > 0 && (
        <div className={hasRequiredSkills ? 'pt-4 border-t border-[#f0edf8]' : ''}>
          <div className="flex items-center gap-2 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Habilidades adicionales del candidato
            </p>
            <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#7c3aed] bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              <PlusIcon />
              {additionalSkills.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {additionalSkills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#f8f7ff] text-[#7c3aed] border border-purple-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío — sin skills en ningún lado */}
      {!hasRequiredSkills && additionalSkills.length === 0 && detectedSkills.length === 0 && (
        <p className="text-sm text-slate-400 italic text-center py-4">
          No se detectaron skills en el CV para comparar.
        </p>
      )}

      {/* Si no hay skills requeridas pero sí detectadas */}
      {!hasRequiredSkills && detectedSkills.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Skills detectadas en el CV
          </p>
          <div className="flex flex-wrap gap-2">
            {detectedSkills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-[#f8f7ff] text-[#7c3aed] border border-purple-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
