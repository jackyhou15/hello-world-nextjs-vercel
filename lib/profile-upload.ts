export const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
export const avatarExtensions: Record<string, string> = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif',
};
export function avatarFileError(type: string, size: number): string | null {
  if (!Object.hasOwn(avatarExtensions, type)) return 'Choose a JPG, PNG, WebP, or GIF image.';
  if (!Number.isSafeInteger(size) || size < 1) return 'This image is empty. Choose another photo.';
  if (size > MAX_AVATAR_BYTES) return 'This photo is larger than 5 MB. Choose a smaller image.';
  return null;
}
