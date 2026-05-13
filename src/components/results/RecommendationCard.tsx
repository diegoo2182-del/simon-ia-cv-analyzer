'use client';

import { Recommendation } from '@/types/analysis';
import { getRecommendationColor, getRecommendationLabel } from '@/lib/utils';

interface RecommendationCardProps {
  recommendation: Recommendation;
  reason: string;
}

const icons: Record<Recommendation, React.ReactNode> = {
  ADVANCE: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  CONSIDER: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  REJECT: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

const borderColors: Record<Recommendation, string> = {
  ADVANCE: 'border-emerald-200 border-t-emerald-500',
  CONSIDER: 'border-amber-200 border-t-amber-500',
  REJECT:   'border-red-200 border-t-red-500',
};

const bgColors: Record<Recommendation, string> = {
  ADVANCE: 'bg-emerald-50',
  CONSIDER: 'bg-amber-50',
  REJECT:   'bg-red-50',
};

const iconColors: Record<Recommendation, string> = {
  ADVANCE: 'text-emerald-500',
  CONSIDER: 'text-amber-500',
  REJECT:   'text-red-500',
};


export function RecommendationCard({ recommendation, reason }: RecommendationCardProps) {
  const colorClass = getRecommendationColor(recommendation);
  const label = getRecommendationLabel(recommendation);

  return (
    <div className={`rounded-xl border border-t-2 p-6 ${borderColors[recommendation]} ${bgColors[recommendation]}`}>
      <div className="flex items-start gap-4">
        <div className={`shrink-0 ${iconColors[recommendation]}`}>
          {icons[recommendation]}
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-[#1a1a3e]">Recomendación final</h3>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${colorClass}`}>
              {label}
            </span>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{reason}</p>
        </div>
      </div>
    </div>
  );
}
