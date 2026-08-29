import { getSocialMetaImageUrl } from '@/lib/utils';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGalleryItemById, incrementGalleryItemViews } from '@/data/gallery';
import { incrementDailyViews } from '@/data/analytics';
import { Eye, ArrowLeft } from 'lucide-react';
import { ShareButton } from '@/components/share-button';
import { absoluteUrl } from '@/lib/site';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getGalleryItemById(resolvedParams.id);
  
  if (!item) {
    return {
      title: 'Imagem não encontrada | FLA10 News',
    };
  }

  

  return {
    title: `${item.title.substring(0, 50)}... | Galeria FLA10 News`,
    description: item.legenda || item.title,
    openGraph: {
      title: `${item.title.substring(0, 50)}... | Galeria FLA10 News`,
      description: item.legenda || item.title,
      url: absoluteUrl(`/galeria/${item.id}`),
      images: [getSocialMetaImageUrl(item.imageUrl)],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.title.substring(0, 50)}... | Galeria FLA10 News`,
      description: item.legenda || item.title,
      images: [item.imageUrl],
    },
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <Link href="/galeria" className="inline-flex items-center text-primary hover:underline font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a Galeria
        </Link>
      </div>
      
      <div className="bg-card rounded-xl overflow-hidden shadow-xl border border-border flex flex-col lg:flex-row">
        <div className="relative flex-1 flex justify-center items-center bg-black/5 p-4 lg:p-8">
          <Image 
            src={item.imageUrl} 
            alt={item.title} 
            width={1200} 
            height={800} 
            className="w-full h-auto max-h-[80vh] object-contain" 
            priority
          />
        </div>
        
        <div className="p-6 lg:p-8 lg:w-[400px] shrink-0 border-t lg:border-t-0 lg:border-l border-border bg-card/50 flex flex-col">
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-headline font-bold mb-4">{item.title}</h1>
              
              <div className="flex flex-col gap-2 text-sm text-muted-foreground mb-6">
                {item.artist && <span className="font-medium text-foreground">Por {item.artist}</span>}
                <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {(item.views || 0) + 1} visualizações</span>
              </div>
            </div>

            {item.legenda && (
              <div className="prose prose-sm dark:prose-invert">
                <p className="text-base leading-relaxed text-muted-foreground">{item.legenda}</p>
              </div>
            )}
            
            {item.texto && (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
                  {item.texto}
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-8 mt-auto shrink-0 border-t border-border/50">
             <div className="flex items-center gap-3">
               <span className="text-sm font-medium">Compartilhar:</span>
               <div className="relative w-8 h-8">
                 <ShareButton title={item.title} slug={item.id} type="galeria" />
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
