import { formatPublishedTime } from '@/lib/utils';
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Clock } from 'lucide-react'
import { getTirinhas } from '@/data/tirinhas'
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

export default async function TirinhasPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const ITEMS_PER_PAGE = 10;

    const allTirinhasRaw = await getTirinhas();
    const totalPages = Math.ceil(allTirinhasRaw.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const tirinhas = allTirinhasRaw.slice(startIndex, endIndex);

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8">
                <h1 className="text-4xl font-headline font-bold">Fla10 Tirinhas</h1>
                <p className="text-lg text-muted-foreground mt-2">O bom humor rubro-negro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {tirinhas.map((tirinha) => (
                     <Card key={tirinha.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                        <CardHeader className="p-0 relative bg-white">
                            <Link href={`/tirinhas/${tirinha.slug}`}>
                                <Image src={tirinha.imageHome} alt={tirinha.title} width={800} height={600} className="w-full object-contain aspect-[4/3] transition-transform duration-300 group-hover:scale-105" data-ai-hint={tirinha.dataAiHint} />
                            </Link>
                            <ShareButton title={tirinha.title} slug={tirinha.slug} type="tirinhas" />
                        </CardHeader>
                        <CardContent className="p-4 flex-grow">
                            <CardTitle className="text-xl font-bold font-body leading-tight">
                                <Link href={`/tirinhas/${tirinha.slug}`} className="group-hover:text-[#FF073A] transition-colors duration-200">
                                    {tirinha.title}
                                </Link>
                            </CardTitle>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <div className="flex justify-between items-center w-full text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="h-4 w-4" />
                                    <span className="text-xs">{formatViews(tirinha.views)} visualizações</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-xs">{formatPublishedTime(tirinha.publishedAt)}</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {tirinhas.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <p>Nenhuma tirinha publicada ainda.</p>
                </div>
            )}

            {totalPages > 1 && (
                <PaginationControls 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    basePath="/tirinhas" 
                />
            )}
        </div>
    )
}
