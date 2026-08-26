import { formatPublishedTime } from '@/lib/utils';

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRaiox } from '@/data/raiox'
import { format, differenceInMinutes, differenceInHours, differenceInDays } from 'date-fns'
import { Clock } from 'lucide-react'
import { ShareButton } from '@/components/share-button'
import { AdBanner } from '@/components/ad-banner'
import { PaginationControls } from '@/components/pagination-controls'



export default async function RaioxPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const ITEMS_PER_PAGE = 10;
    
    const allRaiox = await getRaiox();
    const totalPages = Math.ceil(allRaiox.length / ITEMS_PER_PAGE);
    
    // Get items for the current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentRaiox = allRaiox.slice(startIndex, endIndex);
    
    const chunkSize = 2;
    const raioxChunks = [];
    if (currentRaiox.length > 0) {
        for (let i = 0; i < currentRaiox.length; i += chunkSize) {
            raioxChunks.push(currentRaiox.slice(i, i + chunkSize));
        }
    }

    return (
        <div className="container mx-auto py-12">
            <div className="mb-8 border-b border-primary/40 pb-4">
                <h1 className="text-4xl font-headline font-bold">Raio-X Tático</h1>
                <p className="text-lg text-muted-foreground mt-2">As melhores análises táticas do Mengão.</p>
            </div>
             {allRaiox.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhuma análise publicada ainda. Volte em breve!</p>
                </div>
            ) : (
                <div className="space-y-8">
                  <AdBanner width={728} height={90} />
                  {raioxChunks.map((chunk, index) => (
                    <React.Fragment key={index}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {chunk.map((raiox) => (
                          <Card key={raiox.slug} className="flex flex-col group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                            <CardHeader className="p-0 relative">
                                <Link href={`/raio-x/${raiox.slug}`}>
                                    <Image src={raiox.image} alt={raiox.title} width={600} height={400} className="rounded-t-lg object-cover aspect-[3/2] transition-transform duration-300 group-hover:scale-105" data-ai-hint={raiox.dataAiHint} />
                                </Link>
                              <Badge className="absolute top-2 left-2">{raiox.category}</Badge>
                              <ShareButton title={raiox.title} slug={raiox.slug} />
                            </CardHeader>
                            <CardContent className="flex-grow p-4 space-y-2">
                              <CardTitle className="text-lg font-bold font-body leading-tight">
                                <Link href={`/raio-x/${raiox.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                                   {raiox.title}
                                </Link>
                              </CardTitle>
                              <p className="text-sm text-muted-foreground line-clamp-2">{raiox.excerpt}</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 text-xs text-muted-foreground">
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatPublishedTime(raiox.publishedAt)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span>Por {raiox.author || 'Redação NRN'}</span>
                                    </div>
                                </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                      {index < raioxChunks.length - 1 && (
                         <AdBanner width={728} height={90} />
                      )}
                    </React.Fragment>
                  ))}
                  
                  <PaginationControls 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    basePath="/raio-x" 
                  />
                </div>
            )}
        </div>
    )
}
