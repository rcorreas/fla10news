
import * as React from 'react';
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getColumns } from "@/data/columns";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdBanner } from '@/components/ad-banner';
import { slugify } from '@/lib/utils';
import { ShareButton } from '@/components/share-button';

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


export default async function ColunasPage() {
    const allColumns = await getColumns();

    return (
        <div className="container mx-auto py-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-primary/40 pb-4">
                <div>
                    <h1 className="text-4xl font-headline font-bold">Colunas da Nação</h1>
                    <p className="text-lg text-muted-foreground mt-2">O espaço para a opinião de craques e torcedores.</p>
                </div>
            </div>

            <div className="mb-8">
                <AdBanner width={728} height={90} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {allColumns.flatMap((column, index) => {
                    const card = (
                        <Card key={column.slug} className="relative flex flex-col group transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                            <ShareButton title={column.title} slug={column.slug} type="colunas" />
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

                    if ((index + 1) % 2 === 0 && (index + 1) < allColumns.length) {
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
