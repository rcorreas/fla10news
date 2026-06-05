import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getHistoryArticles } from '@/data/history';
import { format } from 'date-fns';
import { Clock, Trophy, Eye } from 'lucide-react';
import { AdBanner } from '@/components/ad-banner';
import { ShareButton } from '@/components/share-button';
import { PaginationControls } from '@/components/pagination-controls';

function formatViews(views: number): string {
    if (views >= 1_000_000) {
        return `${(views / 1_000_000).toFixed(1).replace('.', ',')}M`;
    }
    if (views >= 1_000) {
        return `${Math.floor(views / 1_000)}K`;
    }
    return views ? views.toString() : '0';
}

export const revalidate = 3600; // Revalida no máximo a cada 1 hora

export default async function FlaHistoriaPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const ITEMS_PER_PAGE = 10;

    const allArticlesRaw = await getHistoryArticles();
    const totalPages = Math.ceil(allArticlesRaw.length / ITEMS_PER_PAGE);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const articles = allArticlesRaw.slice(startIndex, endIndex);

    return (
        <div className="container mx-auto py-12 px-4 max-w-6xl">
            <div className="mb-12 border-b border-primary/40 pb-6 text-center">
                <div className="flex flex-col items-center gap-4">
                    <Trophy className="h-16 w-16 text-primary" />
                    <div>
                        <h1 className="text-4xl md:text-5xl font-headline font-bold">Flamengo na História</h1>
                        <p className="text-lg text-muted-foreground mt-2">Relembre os momentos mais marcantes e gloriosos da trajetória do Mengão.</p>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <AdBanner width={728} height={90} />
            </div>

            {articles.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhuma matéria histórica encontrada. Volte em breve!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {articles.map((article) => (
                        <Card key={article.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                            <CardHeader className="p-0 relative">
                                <Link href={`/flahistoria/${article.slug}`}>
                                    <Image 
                                        src={article.image} 
                                        alt={article.title} 
                                        width={600} 
                                        height={400} 
                                        className="rounded-t-lg object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105" 
                                        data-ai-hint={article.dataAiHint} 
                                    />
                                </Link>
                                <ShareButton title={article.title} slug={article.slug} type="flahistoria" />
                            </CardHeader>
                            <CardContent className="flex-grow p-4 space-y-2">
                                <CardTitle className="text-lg font-bold font-body leading-tight">
                                    <Link href={`/flahistoria/${article.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                                        {article.title}
                                    </Link>
                                </CardTitle>
                                <p className="text-sm text-muted-foreground line-clamp-3">{article.subtitle}</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="h-3 w-3" />
                                    <span>{formatViews(article.views)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    <span>{format(article.publishedAt, 'dd/MM/yyyy')}</span>
                                </div>
                                <span>Por {article.author}</span>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <PaginationControls 
                currentPage={currentPage} 
                totalPages={totalPages} 
                basePath="/flahistoria" 
            />

            <div className="mt-12">
                <AdBanner width={728} height={90} />
            </div>
        </div>
    );
}
