import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGalleryItemById, incrementGalleryItemViews } from '@/data/gallery';
import { incrementDailyViews } from '@/data/analytics';
import { Eye, ArrowLeft } from 'lucide-react';
import { ShareButton } from '@/components/share-button';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getGalleryItemById(resolvedParams.id);
  
  if (!item) {
    return {
      title: 'Imagem não encontrada | FLA10 News',
    };
  }

  return {
    title: `${item.caption.substring(0, 50)}... | Galeria FLA10 News`,
    description: item.caption,
  };
}

export default async function GalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const item = await getGalleryItemById(resolvedParams.id);

  if (!item) {
    notFound();
  }

  // Increment views
  await incrementGalleryItemViews(item.id);
  await incrementDailyViews();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/galeria" className="inline-flex items-center text-primary hover:underline font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Galeria
        </Link>
      </div>
      
      <div className="bg-card rounded-xl overflow-hidden shadow-xl border border-border">
        <div className="relative aspect-auto flex justify-center bg-black/5">
          <Image 
            src={item.imageUrl} 
            alt={item.caption} 
            width={1200} 
            height={800} 
            className="w-full h-auto max-h-[80vh] object-contain" 
            priority
          />
        </div>
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl md:text-3xl font-headline font-bold">{item.caption}</h1>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Por {item.artist}</span>
                <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {(item.views || 0) + 1} visualizações</span>
              </div>
            </div>
            
            <div className="shrink-0">
               <ShareButton title={item.caption} slug={item.id} type="galeria" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
