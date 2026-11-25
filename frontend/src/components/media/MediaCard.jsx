import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { getPreviewFile, MEDIA_TYPE_ICONS, STATUS_VARIANTS, formatDate } from '@/lib/mediaHelpers';

export function MediaCard({ media }) {
  const preview = getPreviewFile(media);

  return (
    <Link
      href={`/media/${media.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-colors hover:border-brand-600"
    >
      <div className="flex aspect-video items-center justify-center bg-slate-950">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview.url} alt={media.originalFilename} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">{MEDIA_TYPE_ICONS[media.mediaType]}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-sm font-medium text-slate-200">{media.originalFilename}</span>
          <Badge variant={STATUS_VARIANTS[media.status]}>{media.status}</Badge>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{formatDate(media.createdAt)}</span>
          <span>{media.mappings?.length || 0} student(s) tagged</span>
        </div>
      </div>
    </Link>
  );
}
