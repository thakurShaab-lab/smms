import { Button } from './Button';

export function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, totalItems } = pagination;

  return (
    <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-sm text-slate-400">
      <span>
        Page {page} of {totalPages} &middot; {totalItems} total
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
