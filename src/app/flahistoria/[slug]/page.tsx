import { getSocialMetaImageUrl } from '@/lib/utils';

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHistoryArticleBySlug, getHistoryArticles, getAllHistorySlugs } from '@/data/history'
import type { Metadata, ResolvingMetadata } from 'next'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AdBanner } from '@/components/ad-banner'
import { Clock, PlayCircle, Trophy, Eye } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ShareButton } from '@/components/share-button'
import { ArticleShareButton } from '@/components/article-share-button'
import { AdsKeeperWidget } from '@/components/adskeeper-widget'
import { db } from '@/lib/firebase'
import { doc, updateDoc, increment } from 'firebase/firestore'
import { JsonLd } from '@/components/json-ld'
import { absoluteUrl, siteName, truncateDescription } from '@/lib/site'

export const revalidate = 3600; // Revalidate at most every hour

export async function generateStaticParams() {
  const slugs = await getAllHistorySlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getHistoryArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Momento Histórico não encontrado',
    }
  }

  const desc = truncateDescription(article.subtitle || article.content || '');
  const url = absoluteUrl(`/flahistoria/${article.slug}`);
  

  return {
    title: article.title,
    description: desc,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: article.title,
      description: desc,
      url,
      images: [getSocialMetaImageUrl(article.image)],
      type: 'article',
      publishedTime: article.publishedAt.toISOString(),
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: desc,
      images: [article.image],
    },
  }
}

function getYouTubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function formatViews(views: number): string {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (views >= 1_000) {
    return `${Math.floor(views / 1_000)}K`;
  }
  return views.toString();
}

const parseContent = (content: string): string[] => {
  // Transforma URLs de imagens soltas em tags <img>
  const imageUrlRegex = /(?<!["'=])(https?:\/\/[^\s<>"]+?\.(?:jpg|jpeg|png|gif|webp)(?:\?[^\s<>"]*)?)/gi;
  const formattedContent = content.replace(imageUrlRegex, '<img src="$1" alt="Imagem" class="w-full h-auto rounded-lg shadow-md my-6" />');

  // If content has </p> tags, split by them safely
  if (formattedContent.toLowerCase().includes('</p>')) {
    const parts = formattedContent.split(/(<\/p>)/i);
    const result = [];
    let current = '';
    for (const part of parts) {
      current += part;
      if (part.toLowerCase() === '</p>') {
        result.push(current.trim());
        current = '';
      }
    }
    if (current.trim().length > 0) {
      result.push(current.trim());
    }
    return result;
  }

  // If content is plain text with double newlines
  if (formattedContent.includes('\n\n')) {
    return formattedContent.split('\n\n').map(p => p.trim()).filter(p => p.length > 0).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`);
  }

  // If content has single newlines
  if (formattedContent.includes('\n')) {
    return formattedContent.split('\n').map(p => p.trim()).filter(p => p.length > 0).map(p => `<p>${p}</p>`);
  }

  // Fallback
  return [formattedContent];
};

export default async function HistoryArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getHistoryArticleBySlug(slug)
  const allArticles = await getHistoryArticles(4) // Fetch a few articles for "related" section

  if (!article) {
    notFound()
  }

  // Increment dynamic view count in Firebase asynchronously (ignore static fallbacks)
  if (article.id && !article.id.startsWith('static')) {
    try {
      const articleRef = doc(db, 'history', article.id);
      updateDoc(articleRef, {
        views: increment(1)
      }).catch(err => console.error("Error updating history article views:", err));
    } catch (err) {
      console.error("Error incrementing history article views:", err);
    }
  }

  const otherArticles = allArticles.filter(a => a.slug !== article.slug).slice(0, 3);
  const articleDate = format(article.publishedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const videoId = article.videoUrl ? getYouTubeId(article.videoUrl) : null;
  const articleUrl = absoluteUrl(`/flahistoria/${article.slug}`);
  const articleDescription = truncateDescription(article.subtitle || article.content || '');

  const paragraphs = article.content ? parseContent(article.content) : [];
  const midPoint = Math.floor(paragraphs.length / 2);
  const firstHalf = paragraphs.slice(0, midPoint).join('\n');
  const secondHalf = paragraphs.slice(midPoint).join('\n');



  return (
    <div className="container mx-auto max-w-4xl py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: article.title,
          description: articleDescription,
          image: [article.image],
          datePublished: article.publishedAt.toISOString(),
          dateModified: article.publishedAt.toISOString(),
          author: {
            '@type': 'Person',
            name: article.author,
          },
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
            '@id': articleUrl,
          },
        }}
      />
      <div className="mb-8 flex justify-center px-4">
        <a href="https://meli.la/1yUshX3" target="_blank" rel="noopener noreferrer" className="block w-full max-w-[728px] hover:opacity-90 transition-opacity">
          <Image src="https://i.imgur.com/JzHwtHD.jpeg" alt="Publicidade" width={728} height={90} className="w-full h-auto rounded-lg shadow-md border border-border" />
        </a>
      </div>
      <div className="mb-8 flex justify-center px-4">
        <AdBanner width={728} height={90} />
      </div>

      <div className="mb-12 border-b border-primary/40 pb-6 text-center">
        <div className="flex flex-col items-center gap-4">
          <Trophy className="h-12 w-12 text-primary" />
          <div>
            <h2 className="text-5xl font-headline font-bold">Flamengo na História</h2>
            <p className="text-lg text-muted-foreground mt-1">Relembre os momentos que marcaram nossa trajetória.</p>
          </div>
        </div>
      </div>

      <article>
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="default">História</Badge>
            <ArticleShareButton title={article.title} slug={article.slug} type="flahistoria" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight mb-2">{article.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{article.subtitle}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>Publicado em {articleDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              <span>{formatViews(article.views)} visualizações</span>
            </div>
            <span>Por {article.author}</span>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-lg mb-8 aspect-video">
          <Image
            src={article.image}
            alt={article.title}
            fill
            className="w-full h-auto object-cover rounded-lg"
            data-ai-hint={article.dataAiHint}
            priority
          />
          {article.imageCredit1 && (
            <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              Imagem: {article.imageCredit1}
            </span>
          )}
        </div>

        <div className="prose prose-lg max-w-none text-foreground/90 text-justify space-y-6 [&_h3]:text-2xl [&_h3]:font-headline [&_h3]:font-bold [&_h3]:my-4 [&_strong]:font-bold">
          {article.content && (
            <>
              <div dangerouslySetInnerHTML={{ __html: firstHalf }} />

              {article.image2 && (
                <div className="my-8 space-y-2">
                  <div className="relative aspect-video">
                    <Image
                      src={article.image2}
                      alt={`Imagem secundária para ${article.title}`}
                      fill
                      className="w-full h-auto object-cover rounded-lg"
                    />
                    {article.imageCredit2 && (
                      <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                        Imagem: {article.imageCredit2}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex justify-center px-4">
                    <a href="https://amzn.to/4pm8HFl" target="_blank" rel="noopener noreferrer" className="block w-full max-w-[728px] hover:opacity-90 transition-opacity">
                      <Image src="https://i.imgur.com/xZYv2gr.png" alt="Publicidade" width={728} height={90} className="w-full h-auto rounded-lg shadow-md border border-border" />
                    </a>
                  </div>
                </div>
              )}

              {secondHalf && <div dangerouslySetInnerHTML={{ __html: secondHalf }} />}
            </>
          )}
        </div>

        {videoId && (
          <div className="mt-12">
            <div className="relative aspect-video bg-black rounded-lg">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={article.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full rounded-lg"
              ></iframe>
            </div>
          </div>
        )}

        <AdsKeeperWidget widgetId="2046582" />

        <div className="mt-12 pt-8 border-t flex flex-col items-center gap-6">
            <AdBanner width={728} height={90} />
            <AdsKeeperWidget widgetId="2046585" />
        </div>
      </article>

      {otherArticles.length > 0 && (
        <section className="mt-16 pt-12 border-t">
          <h2 className="font-headline text-3xl font-bold mb-8 text-primary">Outros Momentos Históricos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherArticles.map((item) => (
              <Card key={item.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                <CardHeader className="p-0 relative">
                  <Link href={`/flahistoria/${item.slug}`}>
                    <Image src={item.image} alt={item.title} width={600} height={400} className="rounded-t-lg object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105" data-ai-hint={item.dataAiHint} />
                  </Link>
                  <ShareButton title={item.title} slug={item.slug} type="flahistoria" />
                </CardHeader>
                <CardContent className="flex-grow p-4 space-y-2">
                  <CardTitle className="text-lg font-bold font-body leading-tight">
                    <Link href={`/flahistoria/${item.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                      {item.title}
                    </Link>
                  </CardTitle>
                </CardContent>
                <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3 w-3" />
                    <span>{formatViews(item.views)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    <span>{format(item.publishedAt, 'dd/MM/yyyy')}</span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {otherArticles.length > 0 && (
        <div className="mt-12">
          <AdBanner width={728} height={90} />
        </div>
      )}
    </div>
  )
}
