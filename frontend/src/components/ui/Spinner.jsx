import clsx from 'clsx';

export function Spinner({ className }) {
  return (
    <div className={clsx('flex items-center justify-center py-10', className)}>
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-brand-500" />
    </div>
  );
}
