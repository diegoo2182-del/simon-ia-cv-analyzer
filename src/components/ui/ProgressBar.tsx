'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  colorClass?: string;
  animated?: boolean;
}

export function ProgressBar({ value, className, colorClass = 'bg-blue-500', animated }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn('w-full h-2 bg-slate-800 rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-700 ease-out', colorClass, animated && 'animate-pulse')}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
