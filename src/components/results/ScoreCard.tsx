'use client';

import { useEffect, useState } from 'react';
import { getScoreColor, getScoreBg } from '@/lib/utils';
import { CategoryScores } from '@/types/analysis';
import { ScoreCategoryBar } from './ScoreCategoryBar';

interface ScoreCardProps {
  score: number;
  categoryScores: CategoryScores;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excelente match';
  if (score >= 65) return 'Buen match';
  if (score >= 50) return 'Match parcial';
  if (score >= 35) return 'Match bajo';
  return 'Sin match';
}

const CATEGORIES: { key: keyof CategoryScores; label: string }[] = [
  { key: 'skills',      label: 'Skills técnicas' },
  { key: 'experience',  label: 'Experiencia' },
  { key: 'seniority',   label: 'Seniority' },
  { key: 'culturaFit',  label: 'Cultura fit' },
];

export function ScoreCard({ score, categoryScores }: ScoreCardProps) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;
  const colorClass = getScoreColor(score);
  const bgClass = getScoreBg(score);

  return (
    <div className="rounded-xl border border-[#e8e4f0] bg-white p-6 shadow-sm space-y-6">

      {/* Score general */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Compatibilidad general
        </p>

        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 104 104">
            <circle cx="52" cy="52" r={radius} fill="none" stroke="#f3f0ff" strokeWidth="8" />
            <circle
              cx="52" cy="52" r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={`${colorClass} transition-all duration-100`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold tabular-nums ${colorClass}`}>{displayed}</span>
            <span className="text-xs text-slate-400 mt-0.5">/ 100</span>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bgClass} text-white`}>
          {getScoreLabel(score)}
        </span>
      </div>

      {/* Divisor */}
      <div className="border-t border-[#f0edf8]" />

      {/* Breakdown por categorías */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Detalle por área
        </p>
        {CATEGORIES.map(({ key, label }, i) => (
          <ScoreCategoryBar
            key={key}
            label={label}
            score={categoryScores[key]}
            delay={200 + i * 100}
          />
        ))}
      </div>

    </div>
  );
}
