import { formatPublishedTime } from '@/lib/utils';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getNewsByCategory } from '@/data/news';
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { Clock } from 'lucide-react';
import { ShareButton } from '@/components/share-button';
import { AdBanner } from '@/components/ad-banner';

const VALID_CATEGORIES: { [key: string]: string } = {
  'futebol': 'Futebol',
  'basquete': 'Basquete',
  'volei': 'Vôlei',
  'e-sports': 'E-Sports',
  'olimpicos': 'Olímpicos'
};

export async function generateStaticParams() {
  return Object.keys(VALID_CATEGORIES).map((slug) => ({
    params: { category: slug },
  }));
}



export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const categoryName = VALID_CATEGORIES[category];

    if (!categoryName) {
        notFound();
    }

    const newsInCategory = await getNewsByCategory(categoryName);

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8 border-b border-primary/40 pb-4">
                <h1 className="text-4xl font-headline font-bold">Notícias de {categoryName}</h1>
                <p className="text-lg text-muted-foreground mt-2">Tudo sobre o {categoryName} do Mengão.</p>
            </div>

            <div className="mb-8">
                <AdBanner width={728} height={90} />
            </div>

            {newsInCategory.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhuma notícia encontrada para esta categoria. Volte em breve!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newsInCategory.map((news) => (
                    <Card key={news.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                    <CardHeader className="p-0 relative">
                        <Link href={`/noticias/${news.slug}`} target="_blank">
                            <Image src={news.image} alt={news.title} width={600} height={400} className="rounded-t-lg object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105" data-ai-hint={news.dataAiHint} />
                        </Link>
                        <Badge className="absolute top-2 left-2">{news.category}</Badge>
                        <ShareButton title={news.title} slug={news.slug} />
                    </CardHeader>
                    <CardContent className="flex-grow p-4 space-y-2">
                        <CardTitle className="text-lg font-bold font-body leading-tight">
                        <Link href={`/noticias/${news.slug}`} className="hover:text-[#FF073A] transition-colors duration-200" target="_blank">
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
                                <span>Por {news.author || 'Redação NRN'}</span>
                            </div>
                        </div>
                    </CardFooter>
                    </Card>
                ))}
                </div>
            )}
             <div className="mt-12">
                <AdBanner width={728} height={90} />
            </div>
        </div>
    )
}
