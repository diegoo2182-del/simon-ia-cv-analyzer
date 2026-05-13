'use client';

import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  accent?: boolean;
}

export function Card({ children, className, glow, accent }: CardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-[#e8e4f0] bg-white p-6',
      accent && 'border-t-2 border-t-[#7c3aed]',
      glow && 'shadow-md shadow-purple-100',
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-base font-semibold text-[#1a1a3e]', className)}>
      {children}
    </h3>
  );
}
