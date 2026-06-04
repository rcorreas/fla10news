import * as React from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getColumnsByCadernoSlug } from "@/data/columns";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdBanner } from '@/components/ad-banner';
import { slugify, formatPublishedTime } from '@/lib/utils';
import { notFound } from 'next/navigation';



export default async function CadernoPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const columns = await getColumnsByCadernoSlug(slug);

    if (columns.length === 0) {
        notFound();
    }

    const columnName = columns[0].columnName;
    const author = columns[0].author;
    const authorImage = columns[0].authorImage;

    return (
        <div className="container mx-auto py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-primary/40 pb-4">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24 border-4 border-primary/20">
                        <AvatarImage src={authorImage} alt={author} />
                        <AvatarFallback>{author.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-4xl font-headline font-bold text-primary">{columnName}</h1>
                        <p className="text-lg text-muted-foreground mt-2">Por {author}</p>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <AdBanner width={728} height={90} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {columns.flatMap((column, index) => {
                    const card = (
                        <Card key={column.slug} className="flex flex-col group transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                            <CardHeader>
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="default">{column.category}</Badge>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatPublishedTime(column.publishedAt)}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                                        <AvatarImage src={column.authorImage} alt={column.author} />
                                        <AvatarFallback>{column.author.slice(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <Link href={`/colunas/caderno/${slugify(column.columnName)}`} className="hover:underline">
                                            <p className="font-bold text-primary">{column.columnName}</p>
                                        </Link>
                                        <p className="text-sm text-muted-foreground">Por {column.author}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <CardTitle className="text-xl font-bold font-body leading-tight">
                                    <Link href={`/colunas/${column.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                                    {column.title}
                                    </Link>
                                </CardTitle>
                                <p className="text-muted-foreground text-sm line-clamp-3">"{column.excerpt}"</p>
                            </CardContent>
                        </Card>
                    );

                    if ((index + 1) % 2 === 0 && (index + 1) < columns.length) {
                        return [
                            card,
                            <div key={`ad-${index}`} className="col-span-1 md:col-span-2 lg:col-span-3 py-4 flex justify-center">
                                <AdBanner width={728} height={90} />
                            </div>
                        ];
                    }

                    return [card];
                })}
            </div>
        </div>
    );
}
