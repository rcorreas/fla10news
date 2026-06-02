import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { getVideoBySlug, getAllVideoSlugs, getVideos } from '@/data/videos'
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Eye, PlayCircle } from 'lucide-react'
import { AdBanner } from '@/components/ad-banner'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton } from '@/components/share-button'
import { ArticleShareButton } from '@/components/article-share-button'

export const revalidate = 3600; // Revalidate at most every hour

// This generates the routes at build time
export async function generateStaticParams() {
  const slugs = await getAllVideoSlugs();
  return slugs.map((item) => ({
    slug: item.slug,
  }));
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

function getYouTubeId(url: string) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function formatPublishedTime(publishedAt: Date): string {
    const now = new Date();
  
    const diffDays = differenceInDays(now, publishedAt);
    if (diffDays > 3) {
      return format(publishedAt, 'dd/MM/yyyy');
    }
    if (diffDays >= 1) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    }
  
    const diffHours = differenceInHours(now, publishedAt);
    if (diffHours >= 1) {
      return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    }
  
    const diffMinutes = differenceInMinutes(now, publishedAt);
    if (diffMinutes >= 1) {
      return `${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''} atrás`;
    }
  
    return "Agora mesmo";
}

import { db } from '@/lib/firebase'
import { doc, updateDoc, increment } from 'firebase/firestore'

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const video = await getVideoBySlug(slug)
  const allVideos = await getVideos(3);
  const otherVideos = allVideos.filter(v => v.slug !== slug).slice(0, 2);

  if (!video) {
    notFound()
  }

  // Increment dynamic view count in Firebase asynchronously (ignore static fallbacks)
  if (video.id && !video.id.startsWith('static')) {
    try {
      const videoRef = doc(db, 'videos', video.id);
      updateDoc(videoRef, {
        views: increment(1)
      }).catch(err => console.error("Error updating video views:", err));
    } catch (err) {
      console.error("Error incrementing video views:", err);
    }
  }

  const videoId = video.videoUrl ? getYouTubeId(video.videoUrl) : null;
  const videoDate = format(video.publishedAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <article>
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Badge variant="default">{video.category}</Badge>
            <ArticleShareButton title={video.title} slug={video.slug} type="videos" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight my-4">{video.title}</h1>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
             <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>Publicado em {videoDate}</span>
             </div>
             <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{formatViews(video.views)} visualizações</span>
            </div>
          </div>
        </header>
        
        <div className="relative aspect-video bg-black rounded-lg">
          {videoId ? (
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            ></iframe>
          ) : (
            <>
              <Image
                src={video.image}
                alt={video.title}
                fill
                className="w-full h-full object-cover rounded-lg"
                data-ai-hint={video.dataAiHint}
                priority
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <PlayCircle className="h-24 w-24 text-white/80" />
              </div>
              <p className="absolute bottom-4 left-4 text-lg font-bold z-10">Vídeo indisponível</p>
            </>
          )}
        </div>
        {!videoId && <p className="mt-4 text-muted-foreground">Um link de vídeo válido não foi fornecido.</p>}
        
        <div className="mt-12 pt-8 border-t">
            <AdBanner width={728} height={90} />
        </div>
      </article>

      {otherVideos.length > 0 && (
        <section className="mt-12 pt-8 border-t">
          <h2 className="text-3xl font-headline font-bold mb-6">Vídeos Recentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {otherVideos.map((video) => (
                <Card key={video.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                <CardHeader className="p-0 relative">
                    <Link href={`/videos/${video.slug}`}>
                        <Image src={video.image} alt={video.title} width={600} height={400} className="w-full object-cover aspect-[16/9] transition-transform duration-300 group-hover:scale-105" data-ai-hint={video.dataAiHint} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">{video.duration}</div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <PlayCircle className="h-16 w-16 text-white/80" />
                        </div>
                    </Link>
                    <Badge className="absolute top-2 left-2">{video.category}</Badge>
                    <ShareButton title={video.title} slug={video.slug} type="videos" />
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                    <CardTitle className="text-lg font-bold font-body leading-tight">
                        <Link href={`/videos/${video.slug}`} className="group-hover:text-[#FF073A] transition-colors duration-200">
                            {video.title}
                        </Link>
                    </CardTitle>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                            <Eye className="h-4 w-4" />
                            <span className="text-xs">{formatViews(video.views)} visualizações</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs">{formatPublishedTime(video.publishedAt)}</span>
                        </div>
                    </div>
                </CardFooter>
            </Card>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 pt-8 border-t">
        <AdBanner width={728} height={90} />
      </div>
    </div>
  )
}
