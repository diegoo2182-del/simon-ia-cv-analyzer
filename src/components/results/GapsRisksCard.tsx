'use client';

import { GapsAnalysis, GapSeverity, GapCategory } from '@/types/analysis';

interface GapsRisksCardProps {
  data: GapsAnalysis;
}

const SEVERITY_CONFIG: Record<GapSeverity, {
  label: string;
  dot: string;
  badge: string;
  cardBorder: string;
  cardBg: string;
  icon: React.ReactNode;
}> = {
  high: {
    label: 'Alto',
    dot: 'bg-red-500',
    badge: 'bg-red-50 text-red-700 border-red-200',
    cardBorder: 'border-red-200',
    cardBg: 'bg-red-50',
    icon: (
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  medium: {
    label: 'Medio',
    dot: 'bg-amber-500',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    cardBorder: 'border-amber-200',
    cardBg: 'bg-amber-50',
    icon: (
      <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  low: {
    label: 'Bajo',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cardBorder: 'border-emerald-200',
    cardBg: 'bg-emerald-50',
    icon: (
      <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const CATEGORY_LABELS: Record<GapCategory, string> = {
  skills:     'Skills',
  experience: 'Experiencia',
  seniority:  'Seniority',
  stability:  'Estabilidad',
  other:      'Otro',
};

const SEVERITY_ORDER: GapSeverity[] = ['high', 'medium', 'low'];

export function GapsRisksCard({ data }: GapsRisksCardProps) {
  const overallCfg = SEVERITY_CONFIG[data.overallRisk];
  const hasGaps = data.items.length > 0;

  const grouped = SEVERITY_ORDER.reduce<Record<GapSeverity, typeof data.items>>(
    (acc, s) => { acc[s] = data.items.filter(i => i.severity === s); return acc; },
    { high: [], medium: [], low: [] }
  );

  return (
    <div className="rounded-xl border border-[#e8e4f0] border-t-2 border-t-red-400 bg-white p-6 space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1a1a3e]">Gaps y riesgos del perfil</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Riesgo general</span>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${overallCfg.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${overallCfg.dot}`} />
            {overallCfg.label}
          </span>
        </div>
      </div>

      {/* Sin gaps */}
      {!hasGaps && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-emerald-200 bg-emerald-50">
          <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-emerald-700 font-medium">No se detectaron gaps significativos en el perfil.</p>
        </div>
      )}

      {/* Gaps agrupados por severidad */}
      {hasGaps && (
        <div className="space-y-4">
          {SEVERITY_ORDER.map(severity => {
            const items = grouped[severity];
            if (!items.length) return null;
            const cfg = SEVERITY_CONFIG[severity];

            return (
              <div key={severity}>
                <div className="flex items-center gap-2 mb-2">
                  {cfg.icon}
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cfg.badge}`}>
                    Riesgo {cfg.label}
                  </span>
                </div>
                <div className="space-y-2 pl-6">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.cardBorder} ${cfg.cardBg}`}
                    >
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border shrink-0 mt-0.5 ${cfg.badge}`}>
                        {CATEGORY_LABELS[item.category]}
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
