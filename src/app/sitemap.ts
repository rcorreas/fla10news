import type { MetadataRoute } from 'next';
import { getAllColumnSlugs } from '@/data/columns';
import { getAllHistorySlugs } from '@/data/history';
import { getAllNewsSlugs } from '@/data/news';
import { getAllVideoSlugs } from '@/data/videos';
import { getAllVozTorcedorSlugs } from '@/data/voz-torcedor';
import { absoluteUrl } from '@/lib/site';

const staticRoutes = [
  '/',
  '/noticias',
  '/colunas',
  '/videos',
  '/flahistoria',
  '/voz-torcedor',
  '/futebol',
  '/basquete',
  '/volei',
  '/e-sports',
  '/olimpicos',
  '/historia',
  '/titulos',
  '/estadio',
  '/ct',
  '/socio-torcedor',
  '/quem-somos',
  '/contato',
  '/fale-conosco',
  '/trabalhe-conosco',
  '/responsabilidade',
  '/politica-de-privacidade',
  '/termos-de-uso',
  '/politica-de-cookies',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, columns, history, videos, vozTorcedor] = await Promise.all([
    getAllNewsSlugs(),
    getAllColumnSlugs(),
    getAllHistorySlugs(),
    getAllVideoSlugs(),
    getAllVozTorcedorSlugs(),
  ]);

  const now = new Date();
  const dynamicRoutes = [
    ...news.map(({ slug }) => `/noticias/${slug}`),
    ...columns.map(({ slug }) => `/colunas/${slug}`),
    ...history.map(({ slug }) => `/flahistoria/${slug}`),
    ...videos.map(({ slug }) => `/videos/${slug}`),
    ...vozTorcedor.map(({ slug }) => `/voz-torcedor/${slug}`),
  ];

  return [...staticRoutes, ...dynamicRoutes]
    .filter(Boolean)
    .map((route) => ({
      url: absoluteUrl(route),
      lastModified: now,
      changeFrequency: route === '/' ? 'hourly' : 'daily',
      priority: route === '/' ? 1 : route.split('/').length > 2 ? 0.7 : 0.8,
    }));
}

