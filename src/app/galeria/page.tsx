import { Metadata } from 'next';
import Image from 'next/image';
import { getGalleryItems } from '@/data/gallery';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { AdBanner } from '@/components/ad-banner';
import { AdsKeeperWidget } from '@/components/adskeeper-widget';

export const metadata: Metadata = {
  title: 'Galeria de Arte Rubro-Negra | FLA10 News',
  description: 'Aprecie a paixão rubro-negra através de imagens e obras exclusivas.',
};

export const dynamic = 'force-dynamic';

export default async function GaleriaPage() {
  const items = await getGalleryItems();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-center">
         <AdBanner width={728} height={90} />
      </div>
      <div className="mb-8 border-b border-primary/40 pb-4">
        <h1 className="text-4xl font-headline font-bold text-primary">Galeria de Arte Rubro-Negra</h1>
        <p className="text-xl text-muted-foreground mt-2">
          A paixão do Flamengo retratada em imagens marcantes.
        </p>
      </div>
      
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {items.map((item) => (
          <div key={item.id} className="break-inside-avoid relative group overflow-hidden rounded-lg shadow-lg">
            <Link href={`/galeria/${item.id}`}>
              <Image 
                src={item.imageUrl} 
                alt={item.title} 
                width={800} 
                height={600} 
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-white text-lg font-bold line-clamp-3 mb-2">{item.title}</p>
                  <div className="flex justify-between items-center text-sm text-gray-300">
                    <div className="flex flex-col gap-1">
                      {item.artist && <span>Por {item.artist}</span>}
                      <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {item.views || 0}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      
      <div className="mt-12 pt-8 border-t flex flex-col items-center gap-6">
          <AdBanner width={728} height={90} />
          <AdsKeeperWidget widgetId="2046585" />
      </div>
    </div>
  );
}
