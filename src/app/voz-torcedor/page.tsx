import { formatPublishedTime } from '@/lib/utils';
import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getVozTorcedores } from '@/data/voz-torcedor';
import { Clock, MessageSquare } from 'lucide-react';
import { ShareButton } from '@/components/share-button';
import { AdBanner } from '@/components/ad-banner';
import { PaginationControls } from '@/components/pagination-controls';

export default async function VozTorcedorPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const ITEMS_PER_PAGE = 10;
    
    const allPosts = await getVozTorcedores();
    const totalPages = Math.ceil(allPosts.length / ITEMS_PER_PAGE);
    
    // Get items for the current page
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPosts = allPosts.slice(startIndex, endIndex);
    
    const chunkSize = 2;
    const postChunks = [];
    if (currentPosts.length > 0) {
        for (let i = 0; i < currentPosts.length; i += chunkSize) {
            postChunks.push(currentPosts.slice(i, i + chunkSize));
        }
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="mb-8 border-b border-primary/40 pb-4">
                <div className="flex items-center gap-3">
                    <MessageSquare className="h-10 w-10 text-primary flex-shrink-0" />
                    <div>
                        <h1 className="text-4xl font-headline font-bold">A Voz do Torcedor</h1>
                        <p className="text-lg text-muted-foreground mt-2">O espaço aberto para a Nação Rubro-Negra expressar sua paixão.</p>
                    </div>
                </div>
            </div>
             {allPosts.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">Nenhuma publicação ainda. Seja o primeiro a compartilhar sua voz!</p>
                </div>
            ) : (
                <div className="space-y-8">
                  <AdBanner width={728} height={90} />
                  {postChunks.map((chunk, index) => (
                    <React.Fragment key={index}>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {chunk.map((post) => (
                          <Card key={post.slug} className="relative flex flex-col group transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                            <ShareButton title={post.title} slug={post.slug} type="voz-torcedor" />
                            <CardHeader>
                                <div className="flex items-center justify-between mb-4">
                                    <Badge variant="secondary">Torcedor</Badge>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatPublishedTime(post.publishedAt)}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <CardTitle className="text-xl font-bold font-body leading-tight">
                                    <Link href={`/voz-torcedor/${post.slug}`} className="hover:text-[#FF073A] transition-colors duration-200">
                                    {post.title}
                                    </Link>
                                </CardTitle>
                                <p className="text-muted-foreground text-sm line-clamp-3">"{post.summary}"</p>
                            </CardContent>
                            <CardFooter className="p-4 pt-0 text-xs text-muted-foreground mt-auto">
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-1.5">
                                        <span>Por {post.authorName}</span>
                                    </div>
                                </div>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                      {index < postChunks.length - 1 && (
                         <AdBanner width={728} height={90} />
                      )}
                    </React.Fragment>
                  ))}
                  
                  <PaginationControls 
                    currentPage={currentPage} 
                    totalPages={totalPages} 
                    basePath="/voz-torcedor" 
                  />
                </div>
            )}
        </div>
    )
}
