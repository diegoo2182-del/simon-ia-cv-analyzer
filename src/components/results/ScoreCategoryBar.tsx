'use client';

import { useEffect, useState } from 'react';

interface ScoreCategoryBarProps {
  label: string;
  score: number;
  delay?: number;
}

function getBarColor(score: number): string {
  if (score >= 75) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getTextColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

export function ScoreCategoryBar({ label, score, delay = 0 }: ScoreCategoryBarProps) {
  const [width, setWidth] = useState(0);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let frame: number;
      const duration = 900;
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setWidth(Math.round(eased * score));
        setDisplayed(Math.round(eased * score));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };

      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, delay);

    return () => clearTimeout(timeout);
  }, [score, delay]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`text-xs font-bold tabular-nums ${getTextColor(score)}`}>
          {displayed}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-none ${getBarColor(score)}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
