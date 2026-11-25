import { Card } from '@/components/ui/Card';

export function StatCard({ label, value, icon, isLoading }) {
  return (
    <Card className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-500/15 text-2xl">{icon}</div>
      <div>
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-2xl font-semibold text-slate-100">{isLoading ? '—' : value}</p>
      </div>
    </Card>
  );
}
