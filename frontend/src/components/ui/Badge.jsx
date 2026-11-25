import clsx from 'clsx';

const VARIANTS = {
  default: 'bg-slate-800 text-slate-300',
  success: 'bg-emerald-500/15 text-emerald-400',
  warning: 'bg-amber-500/15 text-amber-400',
  danger: 'bg-red-500/15 text-red-400',
  info: 'bg-brand-500/15 text-brand-300'
};

export function Badge({ variant = 'default', className, children }) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', VARIANTS[variant], className)}>
      {children}
    </span>
  );
}
