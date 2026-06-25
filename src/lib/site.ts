export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fla10.news').replace(/\/$/, '');

export const siteName = 'FLA10 News';

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function stripHtml(value = '') {
  return value.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
}

export function truncateDescription(value = '', maxLength = 160) {
  const clean = stripHtml(value);
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}…`;
}

