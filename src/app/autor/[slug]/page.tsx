import { formatPublishedTime } from '@/lib/utils';
import * as React from 'react';
import Link from "next/link";
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { getNewsByAuthorSlug, getNewsAuthorDetailsBySlug, getAllNewsAuthorSlugs } from "@/data/news";
import { getAuthorBySlug } from "@/data/authors";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdBanner } from '@/components/ad-banner';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { ShareButton } from '@/components/share-button';

export async function generateStaticParams() {
    const authors = await getAllNewsAuthorSlugs();
    return authors;
}

export default async function NewsAuthorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const authorDetails = await getNewsAuthorDetailsBySlug(slug);
    const authorData = await getAuthorBySlug(slug);
    const authorNews = await getNewsByAuthorSlug(slug);

    if (!authorDetails) {
        notFound();
    }

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8">
                <AdBanner width={728} height={90} />
            </div>

            <header className="mb-12">
                <div className="flex flex-col items-center text-center gap-4">
                    <Avatar className="h-24 w-24 border-4 border-primary/30">
                        {authorData?.image && (
                            <AvatarImage src={authorData.image} alt={authorDetails.author} className="object-cover" />
                        )}
                        <AvatarFallback>
                            <User className="h-12 w-12 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-4xl font-headline font-bold">{authorDetails.author}</h1>
                    {authorData?.link && (
                        <Link href={authorData.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 transition-colors duration-200">
                            {authorData.link}
                        </Link>
                    )}
                    <p className="text-lg text-muted-foreground">Autor(a) no FLA10 News</p>
                    {authorData?.description && (
                        <p className="text-base text-foreground/80 max-w-2xl mx-auto mt-2 text-justify">
                            {authorData.description}
                        </p>
                    )}
                    <Separator className="bg-primary w-1/4 mx-auto my-6" />
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {authorNews.map((news) => (
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
                            <p className="text-muted-foreground text-sm line-clamp-2">{news.excerpt}</p>
                        </CardContent>
                        <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatPublishedTime(news.publishedAt)}</span>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {authorNews.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhuma notícia encontrada para este autor.</p>
                </div>
            )}
            <div className="mt-12">
                <AdBanner width={728} height={90} />
            </div>
        </div>
    );
}
