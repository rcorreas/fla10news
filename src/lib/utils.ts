import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string | undefined | null): string {
  if (!text) return "";
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

import { differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'

export function formatPublishedTime(publishedAt: Date): string {
    const now = new Date();
  
    const diffYears = differenceInYears(now, publishedAt);
    if (diffYears >= 1) {
      return `${diffYears} ano${diffYears > 1 ? 's' : ''} atrás`;
    }

    const diffMonths = differenceInMonths(now, publishedAt);
    if (diffMonths >= 1) {
      return `${diffMonths} mê${diffMonths > 1 ? 'ses' : 's'} atrás`;
    }

    const diffDays = differenceInDays(now, publishedAt);
    if (diffDays >= 1) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    }
  
    const diffHours = differenceInHours(now, publishedAt);
    if (diffHours >= 1) {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    }
  
    const diffMinutes = differenceInMinutes(now, publishedAt);
    if (diffMinutes >= 1) {
      return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
    }
  
    return "Agora mesmo";
}

export function formatDurationISO(duration: string): string {
  if (!duration) return "";
  const parts = duration.split(':');
  if (parts.length === 2) {
    return `PT${parts[0]}M${parts[1]}S`;
  } else if (parts.length === 3) {
    return `PT${parts[0]}H${parts[1]}M${parts[2]}S`;
  }
  return `PT${duration}S`;
}

export function getSocialMetaImageUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.includes('imgur.com')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}`;
  }
  return url;
}
