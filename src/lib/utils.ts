import { Recommendation } from '@/types/analysis';

export function getScoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-500';
  if (score >= 50) return 'text-amber-500';
  return 'text-red-500';
}

export function getScoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

export function getRecommendationLabel(rec: Recommendation): string {
  const map: Record<Recommendation, string> = {
    ADVANCE: 'Avanzar con el candidato',
    CONSIDER: 'Considerar con reservas',
    REJECT: 'No recomendado',
  };
  return map[rec];
}

export function getRecommendationColor(rec: Recommendation): string {
  const map: Record<Recommendation, string> = {
    ADVANCE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CONSIDER: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECT: 'bg-red-50 text-red-700 border-red-200',
  };
  return map[rec];
}

export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
