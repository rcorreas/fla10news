'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShareButton } from '@/components/share-button';
import { Clock, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { HistoryArticle } from '@/data/history';

interface HistoryCoverflowProps {
  articles: HistoryArticle[];
}

function formatViews(views: number): string {
    if (views >= 1_000_000) {
        return `${(views / 1_000_000).toFixed(1).replace('.', ',')}M`;
    }
    if (views >= 1_000) {
        return `${Math.floor(views / 1_000)}K`;
    }
    return views ? views.toString() : '0';
}

export function HistoryCoverflow({ articles }: HistoryCoverflowProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!articles || articles.length === 0) return null;

  if (articles.length === 1) {
      const article = articles[0];
      return (
         <div className="flex justify-center">
            <Card className="w-full max-w-2xl group overflow-hidden transition-all duration-300 hover:shadow-primary-lg hover:-translate-y-1">
                <Link href={`/flahistoria/${article.slug}`} target="_blank">
                    <CardHeader className="p-0 relative">
                        <Image src={article.image} alt={article.title} width={700} height={400} className="w-full object-cover aspect-video transition-transform duration-300 group-hover:scale-105" data-ai-hint={article.dataAiHint} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <Badge variant="default" className="absolute top-3 left-3">Memória</Badge>
                        <ShareButton title={article.title} slug={article.slug} type="flahistoria" />
                    </CardHeader>
                    <CardContent className="p-6">
                        <CardTitle className="text-2xl font-bold font-body leading-tight mb-2 group-hover:text-[#FF073A] transition-colors duration-200">
                            {article.title}
                        </CardTitle>
                        <p className="text-base text-muted-foreground mb-4">{article.subtitle}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                            <div className="flex items-center gap-1.5">
                                <Eye className="h-3 w-3" />
                                <span>{formatViews(article.views)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                <span>{format(new Date(article.publishedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                            </div>
                        </div>
                    </CardContent>
                </Link>
            </Card>
        </div>
      );
  }

  const getPositionClasses = (index: number) => {
    if (index === activeIndex) {
      return "left-1/2 -translate-x-1/2 scale-100 z-30 opacity-100";
    }
    
    let isLeft = false;
    let isRight = false;
    
    if (articles.length >= 3) {
      isLeft = index === (activeIndex - 1 + articles.length) % articles.length;
      isRight = index === (activeIndex + 1) % articles.length;
    } else if (articles.length === 2) {
      isLeft = index === 0 && activeIndex === 1;
      isRight = index === 1 && activeIndex === 0;
    }

    if (isLeft) {
      return "left-0 md:left-[10%] -translate-x-1/4 md:-translate-x-1/2 scale-[0.85] md:scale-[0.8] z-10 opacity-70 cursor-pointer blur-[1px] hover:blur-none hover:opacity-100 hover:scale-[0.85]";
    } else if (isRight) {
      return "left-full md:left-[90%] -translate-x-[75%] md:-translate-x-1/2 scale-[0.85] md:scale-[0.8] z-10 opacity-70 cursor-pointer blur-[1px] hover:blur-none hover:opacity-100 hover:scale-[0.85]";
    } else {
      // Hidden items
      return "left-1/2 -translate-x-1/2 scale-[0.5] z-0 opacity-0 pointer-events-none";
    }
  };

  return (
    <div className="relative w-full h-[450px] md:h-[550px] flex items-center justify-center overflow-hidden py-8 perspective-[1000px]">
      {articles.map((article, index) => (
        <div 
          key={article.id}
          className={`absolute transition-all duration-500 ease-out w-[85%] sm:w-[70%] md:w-[600px] ${getPositionClasses(index)}`}
          onClick={() => setActiveIndex(index)}
        >
          <Card className={`w-full group overflow-hidden shadow-xl transition-shadow duration-300 ${index === activeIndex ? 'shadow-primary-lg' : ''}`}>
              <div className="block">
                  <CardHeader className="p-0 relative">
                      <Link href={`/flahistoria/${article.slug}`} target="_blank">
                          <Image src={article.image} alt={article.title} width={700} height={400} className="w-full object-cover aspect-video" data-ai-hint={article.dataAiHint} />
                      </Link>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
                      <Badge variant="default" className="absolute top-3 left-3 z-10 pointer-events-none">Memória</Badge>
                      <div className="absolute top-3 right-3 z-20">
                          <ShareButton title={article.title} slug={article.slug} type="flahistoria" />
                      </div>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 bg-card relative z-10">
                      <Link href={`/flahistoria/${article.slug}`} target="_blank">
                          <CardTitle className={`text-lg md:text-2xl font-bold font-body leading-tight mb-2 transition-colors duration-200 line-clamp-2 ${index === activeIndex ? 'group-hover:text-[#FF073A]' : ''}`}>
                              {article.title}
                          </CardTitle>
                          <p className="text-sm md:text-base text-muted-foreground mb-4 line-clamp-2">{article.subtitle}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                  <Eye className="h-3 w-3" />
                                  <span>{formatViews(article.views)}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3" />
                                  <span>{format(new Date(article.publishedAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                              </div>
                          </div>
                      </Link>
                  </CardContent>
              </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
