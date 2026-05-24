
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHistoryArticleBySlug, getHistoryArticles } from '@/data/history'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AdBanner } from '@/components/ad-banner'
import { Clock, PlayCircle, Trophy } from 'lucide-react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export const revalidate = 3600; // Revalidate at most every hour

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

const parseContent = (content: string): string[] => {
    if (!content) return [];
    
    const trimmed = content.trim();
    
    // Detecta se o conteúdo possui marcação HTML de parágrafo ou título
    const hasHtml = /<[a-z][\s\S]*>/i.test(trimmed);
    
    if (!hasHtml) {
        // Trata como texto puro
        // Divide por quebras de linha duplas
        const paragraphs = trimmed
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 0);
            
        if (paragraphs.length <= 1 && trimmed.includes('\n')) {
            // Se houver apenas uma linha contendo quebras de linha simples, divide por quebras de linha simples
            const singleLines = trimmed
                .split('\n')
                .map(p => p.trim())
                .filter(p => p.length > 0);
            return singleLines.map(p => `<p>${p}</p>`);
        }
        
        return paragraphs.map(p => `<p>${p}</p>`);
    }
    
    // Possui marcação HTML. Vamos extrair os blocos completos de nível de bloco
    const blocks: string[] = [];
    const blockRegex = /<(p|h1|h2|h3|h4|h5|h6|div|section|blockquote|ul|ol|li)[^>]*>([\s\S]*?)<\/\1>/gi;
    
    let match;
    let lastIndex = 0;
    
    while ((match = blockRegex.exec(trimmed)) !== null) {
        const between = trimmed.substring(lastIndex, match.index).trim();
        if (between) {
            blocks.push(`<p>${between}</p>`);
        }
        blocks.push(match[0]);
        lastIndex = blockRegex.lastIndex;
    }
    
    const remaining = trimmed.substring(lastIndex).trim();
    if (remaining) {
        if (remaining.startsWith('<') && remaining.endsWith('>')) {
            blocks.push(remaining);
        } else {
            blocks.push(`<p>${remaining}</p>`);
        }
    }
    
    return blocks.filter(b => b.trim().length > 0);
};

export default async function HistoryArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getHistoryArticleBySlug(slug)
  const allArticles = await getHistoryArticles(4) // Fetch a few articles for "related" section
  
  if (!article) {
    notFound()
  }

  const otherArticles = allArticles.filter(a => a.slug !== article.slug).slice(0, 3);
  const articleDate = format(article.publishedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  const videoId = article.videoUrl ? getYouTubeId(article.videoUrl) : null;
  
  const paragraphs = article.content ? parseContent(article.content) : [];
  const midPoint = Math.ceil(paragraphs.length / 2);
  const firstHalf = paragraphs.slice(0, midPoint).join('');
  const secondHalf = paragraphs.slice(midPoint).join('');



  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="mb-8">
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
          <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight mb-2">{article.title}</h1>
          <p className="text-xl text-muted-foreground mb-4">{article.subtitle}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
             <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Publicado em {articleDate}</span>
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
                         <div className="mt-4">
                            <AdBanner width={300} height={250} />
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
        
        <div className="mt-12 pt-8 border-t">
            <AdBanner width={728} height={90} />
        </div>
      </article>
        
      {otherArticles.length > 0 && (
        <section className="mt-16 pt-12 border-t">
            <h2 className="font-headline text-3xl font-bold mb-8 text-primary">Outros Momentos Históricos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherArticles.map((item) => (
                    <Card key={item.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                        <Link href={`/flahistoria/${item.slug}`}>
                            <CardHeader className="p-0 relative">
                                <Image src={item.image} alt={item.title} width={600} height={400} className="rounded-t-lg object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105" data-ai-hint={item.dataAiHint} />
                            </CardHeader>
                        </Link>
                        <CardContent className="flex-grow p-4 space-y-2">
                            <CardTitle className="text-lg font-bold font-body leading-tight">
                                <Link href={`/flahistoria/${item.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                                    {item.title}
                                </Link>
                            </CardTitle>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
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
