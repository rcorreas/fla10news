import { formatPublishedTime, getSocialMetaImageUrl } from '@/lib/utils';
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock, Eye } from 'lucide-react'
import { getTirinhaBySlug, getAllTirinhasSlugs, getTirinhas } from '@/data/tirinhas'
import type { Metadata, ResolvingMetadata } from 'next'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AdBanner } from '@/components/ad-banner'
import { AdsKeeperWidget } from '@/components/adskeeper-widget'
import { ArticleShareButton } from '@/components/article-share-button'
import { JsonLd } from '@/components/json-ld'
import { absoluteUrl, siteName, truncateDescription } from '@/lib/site'
import { db } from '@/lib/firebase'
import { doc, updateDoc, increment } from 'firebase/firestore'

export const revalidate = 3600; // Revalidate at most every hour

export async function generateStaticParams() {
  const slugs = await getAllTirinhasSlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const tirinha = await getTirinhaBySlug(slug);

  if (!tirinha) {
    return {
      title: 'Tirinha não encontrada',
    }
  }

  const desc = truncateDescription(tirinha.description || 'Confira esta tirinha do Fla10.');
  const url = absoluteUrl(`/tirinhas/${tirinha.slug}`);

  return {
    title: tirinha.title,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: tirinha.title,
      description: desc,
      url,
      images: [
        {
          url: getSocialMetaImageUrl(tirinha.imageHome),
          width: 1200,
          height: 630,
          alt: tirinha.title,
        }
      ],
      type: 'article',
      publishedTime: tirinha.publishedAt.toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: tirinha.title,
      description: desc,
      images: [tirinha.imageHome],
    },
  }
}

export default async function TirinhaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tirinha = await getTirinhaBySlug(slug)
  const latestTirinhas = await getTirinhas(4);
  const otherTirinhas = latestTirinhas.filter(t => t.slug !== slug).slice(0, 3);

  if (!tirinha) {
    notFound()
  }

  // Increment dynamic view count in Firebase asynchronously
  try {
    const docRef = doc(db, 'tirinhas', tirinha.id);
    updateDoc(docRef, {
      views: increment(1)
    }).catch(err => console.error("Error updating tirinha views:", err));
  } catch (err) {
    console.error("Error incrementing tirinha views:", err);
  }

  const publishDate = format(tirinha.publishedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const pageUrl = absoluteUrl(`/tirinhas/${tirinha.slug}`);
  const description = truncateDescription(tirinha.description || 'Confira esta tirinha do Fla10.');

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: tirinha.title,
          description: description,
          image: [tirinha.image],
          datePublished: tirinha.publishedAt.toISOString(),
          dateModified: tirinha.publishedAt.toISOString(),
          publisher: {
            '@type': 'Organization',
            name: siteName,
            logo: {
              '@type': 'ImageObject',
              url: absoluteUrl('/icon.png'),
            },
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': pageUrl,
          },
        }}
      />
      
      <div className="mb-8 flex justify-center px-4">
         <AdBanner width={728} height={90} />
      </div>

      <article>
        <header className="mb-8 text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight mb-4">{tirinha.title}</h1>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
            <span>{publishDate}</span>
            <span>&bull;</span>
            <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{tirinha.views || 0} acessos</span>
            </div>
          </div>
          <div className="flex justify-center">
             <ArticleShareButton title={tirinha.title} slug={tirinha.slug} type="tirinhas" />
          </div>
        </header>

        <div className="relative mb-8 bg-white p-4 rounded-lg shadow-md border border-border">
          <Image
            src={tirinha.image}
            alt={`${tirinha.title}`}
            width={1200}
            height={1200}
            className="w-full h-auto object-contain rounded-lg"
            data-ai-hint={tirinha.dataAiHint}
            priority
          />
        </div>

        {tirinha.description && (
             <div className="mb-8 text-lg text-center text-muted-foreground max-w-3xl mx-auto">
                 <p>{tirinha.description}</p>
             </div>
        )}
        
        <div className="mt-12 pt-8 border-t flex flex-col items-center gap-6">
            <AdBanner width={728} height={90} />
            <AdsKeeperWidget widgetId="2046585" />
        </div>
      </article>

      {otherTirinhas.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-3xl font-headline font-bold mb-6">Mais Tirinhas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {otherTirinhas.map((item) => (
               <Link key={item.slug} href={`/tirinhas/${item.slug}`} className="group block">
                   <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden transition-transform group-hover:-translate-y-1">
                       <Image src={item.imageHome} alt={item.title} width={400} height={300} className="w-full object-contain aspect-square bg-gray-50" />
                       <div className="p-4 text-center">
                           <h3 className="font-bold font-headline group-hover:text-primary transition-colors">{item.title}</h3>
                       </div>
                   </div>
               </Link>
            ))}
          </div>
        </section>
      )}

    </div>
  )
}
