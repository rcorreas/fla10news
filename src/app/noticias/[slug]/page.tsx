import { formatPublishedTime, slugify } from '@/lib/utils';
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Clock, Eye } from 'lucide-react'
import { getNewsBySlug, getAllNewsSlugs, getNews } from '@/data/news'
import type { Metadata, ResolvingMetadata } from 'next'
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AdBanner } from '@/components/ad-banner'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton } from '@/components/share-button'
import { ArticleShareButton } from '@/components/article-share-button'
import { JsonLd } from '@/components/json-ld'
import { absoluteUrl, siteName, truncateDescription } from '@/lib/site'

export const revalidate = 3600; // Revalidate at most every hour

// This generates the routes at build time
export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);

  if (!article) {
    return {
      title: 'Notícia não encontrada',
    }
  }

  const desc = truncateDescription(article.excerpt || article.content || '');
  const url = absoluteUrl(`/noticias/${article.slug}`);

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
      images: [article.image],
      type: 'article',
      publishedTime: article.publishedAt.toISOString(),
      authors: article.author ? [article.author] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: desc,
      images: [article.image],
    },
  }
}


import { db } from '@/lib/firebase'
import { doc, updateDoc, increment } from 'firebase/firestore'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug)
  const latestNews = await getNews(3);
  const otherNews = latestNews.filter(n => n.slug !== slug).slice(0, 2);

  if (!article) {
    notFound()
  }

  // Increment dynamic view count in Firebase asynchronously
  try {
    const articleRef = doc(db, 'news', article.id);
    updateDoc(articleRef, {
      views: increment(1)
    }).catch(err => console.error("Error updating news views:", err));
  } catch (err) {
    console.error("Error incrementing news views:", err);
  }

  const articleDate = format(article.publishedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const articleUrl = absoluteUrl(`/noticias/${article.slug}`);
  const articleDescription = truncateDescription(article.excerpt || article.content || '');

  const parseContent = (content: string): string[] => {
      // If content has </p> tags, split by them safely
      if (content.toLowerCase().includes('</p>')) {
          const parts = content.split(/(<\/p>)/i);
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
      if (content.includes('\n\n')) {
          return content.split('\n\n').map(p => p.trim()).filter(p => p.length > 0).map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`);
      }

      // If content has single newlines
      if (content.includes('\n')) {
          return content.split('\n').map(p => p.trim()).filter(p => p.length > 0).map(p => `<p>${p}</p>`);
      }

      // Fallback
      return [content];
  };
  
  const paragraphs = article.content ? parseContent(article.content) : [];
  const midPoint = Math.floor(paragraphs.length / 2);
  const firstHalf = paragraphs.slice(0, midPoint).join('\n');
  const secondHalf = paragraphs.slice(midPoint).join('\n');


  return (
    <div className="container mx-auto max-w-4xl py-12">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'NewsArticle',
          headline: article.title,
          description: articleDescription,
          image: [article.image],
          datePublished: article.publishedAt.toISOString(),
          dateModified: article.publishedAt.toISOString(),
          author: {
            '@type': 'Person',
            name: article.author || 'Redação Fla10',
            url: absoluteUrl(`/autor/${slugify(article.author || 'Redacao Fla10')}`),
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
      <div className="mb-8">
        <AdBanner width={728} height={90} />
      </div>
      <article>
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="default">{article.category}</Badge>
            <ArticleShareButton title={article.title} slug={article.slug} />
          </div>

          <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight mb-4">{article.title}</h1>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
                <span>Por <Link href={`/autor/${slugify(article.author || 'Redacao NRN')}`} className="hover:underline hover:text-[#FF073A] transition-colors">{article.author || 'Redação NRN'}</Link></span> &bull; <span>{articleDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{article.views || 0} acessos</span>
            </div>
          </div>
        </header>

        <div className="relative overflow-hidden rounded-lg mb-8">
          <Image
            src={article.image}
            alt={article.title}
            width={1200}
            height={675}
            className="w-full h-auto object-cover rounded-lg transition-transform duration-300 ease-in-out hover:scale-105"
            data-ai-hint={article.dataAiHint}
            priority
          />
           {article.imageCredit && (
            <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                Imagem: {article.imageCredit}
            </span>
        )}
        </div>

        {article.excerpt && (
            <div className="mb-8 border-l-4 border-[#ff073a] pl-4 py-2 bg-muted/30 rounded-r-lg">
                <h2 className="text-xl md:text-2xl font-headline font-semibold text-muted-foreground leading-snug">
                    {article.excerpt}
                </h2>
            </div>
        )}

        <div 
          className="text-lg space-y-6 [&_h3]:text-2xl [&_h3]:font-headline [&_h3]:font-bold [&_h3]:my-4 [&_strong]:font-bold [&_a]:text-[#ff073a] [&_a]:font-bold [&_a]:hover:underline"
        >
          <div dangerouslySetInnerHTML={{ __html: firstHalf }} />

          {article.image2 && (
              <div className="my-8 space-y-4">
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
                  <div className="flex justify-center">
                    <AdBanner width={300} height={250} />
                  </div>
              </div>
          )}

          {!article.image2 && midPoint > 0 && (
            <div className="my-8 flex justify-center">
              <AdBanner width={300} height={250} />
            </div>
          )}

          <div dangerouslySetInnerHTML={{ __html: secondHalf }} />
        </div>


        {article.fullArticleLink && (
            <div className="mt-8">
              <Link 
                href={article.fullArticleLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-[#ff073a] hover:text-yellow-400 transition-colors"
              >
                Leia mais.
              </Link>
            </div>
        )}
        
        <div className="mt-12 pt-8 border-t">
            <AdBanner width={728} height={90} />
        </div>
      </article>

      {otherNews.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-3xl font-headline font-bold mb-6">Últimas Notícias</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherNews.map((news) => (
              <Card key={news.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                <CardHeader className="p-0 relative">
                    <Link href={`/noticias/${news.slug}`}>
                        <Image src={news.image} alt={news.title} width={600} height={400} className="rounded-t-lg object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105" data-ai-hint={news.dataAiHint} />
                    </Link>
                  <Badge className="absolute top-2 left-2">{news.category}</Badge>
                  <ShareButton title={news.title} slug={news.slug} />
                </CardHeader>
                <CardContent className="flex-grow p-4 space-y-2">
                  <CardTitle className="text-lg font-bold font-body leading-tight">
                    <Link href={`/noticias/${news.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                       {news.title}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground line-clamp-2">{news.excerpt}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            <span>{formatPublishedTime(news.publishedAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>Por <Link href={`/autor/${slugify(news.author || 'Redacao NRN')}`} className="hover:underline hover:text-primary transition-colors">{news.author || 'Redação NRN'}</Link></span>
                        </div>
                    </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  )
}
