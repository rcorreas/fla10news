import { formatPublishedTime } from '@/lib/utils';

import * as React from 'react';
import Link from "next/link";
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getColumnsByAuthorSlug, getAuthorDetailsBySlug, getAllAuthorSlugs } from "@/data/columns";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AdBanner } from '@/components/ad-banner';
import { Separator } from '@/components/ui/separator';

export async function generateStaticParams() {
    const authors = await getAllAuthorSlugs();
    return authors;
}



export default async function AuthorPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const authorDetails = await getAuthorDetailsBySlug(slug);
    const authorColumns = await getColumnsByAuthorSlug(slug);

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
                        <AvatarImage src={authorDetails.authorImage} alt={authorDetails.author} />
                        <AvatarFallback>
                            <User className="h-12 w-12 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <h1 className="text-4xl font-headline font-bold">{authorDetails.author}</h1>
                    <p className="text-lg text-muted-foreground">Colunista no FLA10 News</p>
                    
                    {authorDetails.author === 'Hélio Pacheco' && (
                        <>
                            <div className="text-base text-foreground/80 max-w-2xl mt-2 space-y-2 text-justify">
                            <p>
                                    Hélio Pacheco é graduado em Administração de Empresas, 1994 e Comunicação Social - Jornalismo, 1999, pela Universidade Gama Filho (UGF).
                                </p>
                                <p>
                                    Concluiu o 1° curso de Jornalismo Esportivo da Fundação Mudes, comandado pelo Jornalista Paulo Júlio Clemant, em 2001, na época de O Globo.
                                </p>
                                <p>
                                    Foi Assessor de Imprensa da FBERJ (Federação de Basquete do RJ) de 1999 a 2006, Locutor do Evento Tim de Música e Esportes de Praia (2004/2005), Produtor e Coordenador do Programa Momento Esportivo da Rádio Brasil 940 AM, em 2001 e colaborador do Blog Puro Esporte de 2001 a 2007.
                                </p>
                                <p>
                                    Desde 2024 comanda o projeto Canal Office Sports e Office Fla e se junta novamente como colaborador do Blog FLA Dez News.
                                </p>
                            </div>
                             <Separator className="bg-primary w-1/2 mx-auto my-6" />
                        </>
                    )}
                </div>
            </header>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {authorColumns.map((column) => (
                    <Card key={column.slug} className="flex flex-col group transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                        <CardHeader>
                            <div className="flex items-center justify-between mb-4">
                                <Badge variant="default">{column.category}</Badge>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatPublishedTime(column.publishedAt)}</span>
                                </div>
                            </div>
                            <div>
                                <p className="font-bold text-primary">{column.columnName}</p>
                                <p className="text-sm text-muted-foreground">Por {column.author}</p>
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
                ))}
            </div>

            {authorColumns.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>Nenhuma coluna encontrada para este autor.</p>
                </div>
            )}
            <div className="mt-12">
                <AdBanner width={728} height={90} />
            </div>
        </div>
    );
}
