export function getSafeRedirect(value: string | null | undefined, fallback = '/') {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith('/')) {
    return fallback;
  }

  if (trimmed.startsWith('//')) {
    return fallback;
  }

  return trimmed;
}
