import './globals.css';
import { NextGameBanner } from '@/components/next-game-banner';
import { ClientLayout } from '@/components/layout/client-layout';
import type { Metadata } from 'next';

export const revalidate = 60; // Revalida o cache da página a cada 60 segundos

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://fla10news.com.br';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'FLA10 News',
  description: 'Seu portal diário de notícias sobre o Clube de Regatas do Flamengo.',
  keywords: 'Notícias do Flamengo, Notícias do Flamengo hoje, Flamengo, Flamengo hoje, Nação rubro-negra',
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
      </head>
      <body className="min-h-screen bg-background font-body antialiased flex flex-col">
        <ClientLayout nextGameBanner={<NextGameBanner />}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
