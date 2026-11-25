export function getPreviewFile(media) {
  if (!media?.files?.length) return null;

  if (media.mediaType === 'photo') {
    return media.files.find((file) => file.fileRole === 'original') || null;
  }
  if (media.mediaType === 'video') {
    return media.files.find((file) => file.fileRole === 'thumbnail') || null;
  }
  if (media.mediaType === 'document') {
    return media.files.find((file) => file.fileRole === 'ocr_page') || null;
  }
  return null;
}

export function getVideoPreviewFile(media) {
  return media?.files?.find((file) => file.fileRole === 'preview') || null;
}

export function getOriginalFile(media) {
  return media?.files?.find((file) => file.fileRole === 'original') || null;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export const MEDIA_TYPE_ICONS = {
  photo: '📷',
  video: '🎬',
  document: '📄',
  audio: '🎵'
};

export const STATUS_VARIANTS = {
  uploaded: 'default',
  processing: 'warning',
  completed: 'success',
  failed: 'danger'
};
