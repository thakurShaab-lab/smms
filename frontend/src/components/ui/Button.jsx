'use client';

import clsx from 'clsx';

const VARIANTS = {
  primary: 'bg-brand-600 hover:bg-brand-500 text-white',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700',
  danger: 'bg-red-600 hover:bg-red-500 text-white',
  ghost: 'bg-transparent hover:bg-slate-800 text-slate-300'
};

export function Button({ variant = 'primary', className, isLoading, disabled, children, ...props }) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      )}
      {children}
    </button>
  );
}
