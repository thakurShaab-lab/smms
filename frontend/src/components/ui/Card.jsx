import clsx from 'clsx';

export function Card({ className, children }) {
  return (
    <div className={clsx('rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base font-semibold text-slate-100">{title}</h3>
        {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
