'use client';

import clsx from 'clsx';
import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, className, id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={clsx(
          'rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100',
          'placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
});
