export function base64ToBuffer(base64String) {
  return Buffer.from(base64String, 'base64');
}

export function mimeToExtension(mimeType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'video/mp4': '.mp4'
  };
  return map[mimeType] || '';
}
