import './globals.css';
import { NextGameBanner } from '@/components/next-game-banner';
import { ClientLayout } from '@/components/layout/client-layout';
import type { Metadata } from 'next';
import { JsonLd } from '@/components/json-ld';
import { absoluteUrl, siteName, siteUrl } from '@/lib/site';

export const revalidate = 60; // Revalida o cache da página a cada 60 segundos

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: 'Seu portal diário de notícias sobre o Clube de Regatas do Flamengo.',
  keywords: 'Notícias do Flamengo, Notícias do Flamengo hoje, Flamengo, Flamengo hoje, Nação rubro-negra',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: siteName,
    description: 'Seu portal diário de notícias sobre o Clube de Regatas do Flamengo.',
    url: siteUrl,
    siteName,
    locale: 'pt_BR',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Exo+2:wght@700&family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1816855957581879"
          crossOrigin="anonymous"
        ></script>
        {/* AdsKeeper Loader */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="https://jsc.adskeeper.com/site/1101178.js" async></script>
      </head>
      <body className="min-h-screen bg-background font-body antialiased flex flex-col">
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: siteName,
              url: siteUrl,
              logo: absoluteUrl('/icon.png'),
              sameAs: [
                'https://www.facebook.com/profile.php?id=100075993313125',
                'https://www.instagram.com/canalfla10/',
                'https://x.com/canalfla10',
                'https://www.youtube.com/@fladez',
                'https://www.tiktok.com/@canalfla10',
              ],
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: siteName,
              url: siteUrl,
            },
          ]}
        />
        <ClientLayout nextGameBanner={<NextGameBanner />}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
