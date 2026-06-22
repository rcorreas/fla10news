"use client"

import { usePathname } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';
import { TiktokIcon } from '@/components/tiktok-icon';
import { AuthProvider } from '@/context/auth-context';
import { Toaster } from '../ui/toaster';
import { ViewTracker } from '@/components/view-tracker';

function SocialBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container mx-auto flex h-10 items-center justify-between px-4">
        <p className="font-sans text-sm font-bold">Siga o FLA10</p>
        <div className="flex items-center gap-4">
          <Link href="https://www.facebook.com/profile.php?id=100075993313125" aria-label="Facebook" className="transition-opacity hover:opacity-80" target="_blank" rel="noopener noreferrer">
            <Facebook className="h-5 w-5" />
          </Link>
          <Link href="https://www.instagram.com/canalfla10/" aria-label="Instagram" className="transition-opacity hover:opacity-80" target="_blank" rel="noopener noreferrer">
            <Instagram className="h-5 w-5" />
          </Link>
          <Link href="https://x.com/canalfla10" aria-label="Twitter" className="transition-opacity hover:opacity-80" target="_blank" rel="noopener noreferrer">
            <Twitter className="h-5 w-5" />
          </Link>
          <Link href="https://www.youtube.com/@fladez" aria-label="Youtube" className="transition-opacity hover:opacity-80" target="_blank" rel="noopener noreferrer">
            <Youtube className="h-5 w-5" />
          </Link>
          <Link href="https://www.tiktok.com/@canalfla10" aria-label="Tiktok" className="transition-opacity hover:opacity-80" target="_blank" rel="noopener noreferrer">
            <TiktokIcon className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ClientLayout({
  children,
  nextGameBanner
}: {
  children: React.ReactNode;
  nextGameBanner: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <AuthProvider>
      <ViewTracker />
      {isAdminPage ? (
        <div className="bg-muted/40">{children}</div>
      ) : (
        <div className="relative flex min-h-screen flex-col">
          <SocialBar />
          <Header />
          {nextGameBanner}
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      )}
      <Toaster />
    </AuthProvider>
  );
}
