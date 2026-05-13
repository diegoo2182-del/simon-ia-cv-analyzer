'use client';

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white border-transparent shadow-lg shadow-purple-500/20 disabled:opacity-50',
  ghost:   'bg-transparent hover:bg-purple-50 text-slate-600 border-transparent',
  outline: 'bg-transparent hover:bg-purple-50 text-[#7c3aed] border-[#c4b5fd] hover:border-[#7c3aed]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border font-medium',
        'transition-all duration-150 cursor-pointer',
        'disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
