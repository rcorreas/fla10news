import './globals.css';
import { NextGameBanner } from '@/components/next-game-banner';
import { ClientLayout } from '@/components/layout/client-layout';
import type { Metadata } from 'next';
import Script from 'next/script';

export const revalidate = 60; // Revalida o cache da página a cada 60 segundos

export const metadata: Metadata = {
  title: 'FLA10 News',
  description: 'Seu portal diário de notícias sobre o Clube de Regatas do Flamengo.',
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
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1816855957581879"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="min-h-screen bg-background font-body antialiased flex flex-col">
        <ClientLayout nextGameBanner={<NextGameBanner />}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
