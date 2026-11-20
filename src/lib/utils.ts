import { absoluteUrl } from '@/lib/site';
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

export function toImgurSocialThumbnail(url: string): string {
  // Converte imagens originais do Imgur (frequentemente PNGs de 1.4MB a 3.5MB que o WhatsApp recusa)
  // para o thumbnail nativo 'h.jpg' (1024px JPEG, ~80-170KB) gerado pelo próprio Imgur.
  return url.replace(
    /^https?:\/\/(?:i\.)?imgur\.com\/([a-zA-Z0-9]{7})\.(?:png|jpg|jpeg|webp)(\?.*)?$/i,
    'https://i.imgur.com/$1h.jpg'
  );
}

export function getSocialMetaImageUrl(url: string | undefined | null): string {
  if (!url) return absoluteUrl('/imagem-canal.png');

  let cleanUrl = url.trim();
  if (!cleanUrl) return absoluteUrl('/imagem-canal.png');

  // Se já for uma URL apontando para /api/proxy-image (relativa ou absoluta), extrai a URL original interna
  if (cleanUrl.includes('/api/proxy-image')) {
    try {
      const parsed = new URL(cleanUrl, 'https://fla10.news');
      const inner = parsed.searchParams.get('url');
      if (inner) {
        cleanUrl = inner;
      }
    } catch {
      // mantém cleanUrl caso o parse falhe
    }
  }

  // Caminhos locais relativos (ex: /imagem-canal.png)
  if (cleanUrl.startsWith('/')) {
    return absoluteUrl(cleanUrl);
  }

  // Imagens já otimizadas em JPEG no nosso bucket Google Cloud Storage ou Cloudflare R2
  // já possuem Content-Length explícito, robots.txt liberado e tamanho < 200KB.
  if (
    /\.(?:jpg|jpeg)$/i.test(cleanUrl) &&
    (cleanUrl.startsWith('https://storage.googleapis.com/fla10news-media/') ||
      cleanUrl.includes('.r2.dev/'))
  ) {
    return cleanUrl;
  }

  const optimizedUrl = toImgurSocialThumbnail(cleanUrl);

  // Serve sempre pelo domínio próprio (fla10.news/api/proxy-image) com Content-Length explícito e JPEG leve,
  // evitando o bloqueio de robots.txt (Disallow: /*?) do external-content.duckduckgo.com e o bloqueio de IP do Imgur.
  return `${absoluteUrl('/api/proxy-image')}?url=${encodeURIComponent(optimizedUrl)}&formato=jpeg&ext=.jpg`;
}
