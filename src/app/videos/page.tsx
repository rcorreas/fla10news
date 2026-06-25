import { formatPublishedTime } from '@/lib/utils';
import Image from 'next/image'
import Link from 'next/link'
import { Eye, PlayCircle, Clock } from 'lucide-react'
import { getVideos } from '@/data/videos'
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShareButton } from '@/components/share-button'
import { PaginationControls } from '@/components/pagination-controls'



function formatViews(views: number): string {
    if (views >= 1_000_000) {
        return `${(views / 1_000_000).toFixed(1).replace('.', ',')}M`;
    }
    if (views >= 1_000) {
        return `${Math.floor(views / 1_000)}K`;
    }
    return views.toString();
}

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const ITEMS_PER_PAGE = 10;

    const allVideosRaw = await getVideos();
    const totalPages = Math.ceil(allVideosRaw.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const videos = allVideosRaw.slice(startIndex, endIndex);

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-headline font-bold">Vídeos e Bastidores</h1>
                <p className="text-lg text-muted-foreground mt-2">Veja os melhores momentos, interviews e o dia a dia do Mais Querido.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
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

            <PaginationControls 
                currentPage={currentPage} 
                totalPages={totalPages} 
                basePath="/videos" 
            />
        </div>
    )
}
