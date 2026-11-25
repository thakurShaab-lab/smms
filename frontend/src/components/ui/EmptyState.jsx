export function EmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-800 py-16 text-center">
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {description && <p className="max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
