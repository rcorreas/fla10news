'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { BookOpen } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

interface RelatedArticleInserterProps {
  onInsert: (html: string) => void;
}

export function RelatedArticleInserter({ onInsert }: RelatedArticleInserterProps) {
  const [open, setOpen] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && articles.length === 0) {
      fetchArticles();
    }
  }, [open]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'news'),
        orderBy('publishedAt', 'desc'),
        limit(40)
      );
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setArticles(fetched);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (article: any) => {
    const slug = article.slug;
    const title = article.title;
    const html = `
<div class="bg-muted border-l-4 border-red-600 dark:bg-muted/30 p-4 rounded-lg my-6">
  <span class="text-sm uppercase font-bold text-red-600 mb-1 block">Leia Também:</span>
  <a href="https://fla10.news/noticias/${slug}" class="text-blue-600 hover:underline dark:text-blue-400 font-semibold text-lg" target="_blank">
    ${title}
  </a>
</div>
<p><br></p>
`;
    onInsert(html);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="ghost" 
          size="sm" 
          title="Inserir Box Leia Também"
          className="h-8 flex gap-1 px-2"
        >
          <BookOpen className="h-4 w-4" />
          <span className="text-xs">Leia Também</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Inserir Matéria Relacionada</DialogTitle>
          <DialogDescription>
            Pesquise e selecione uma matéria para inserir o Box de Destaque no texto.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-hidden flex flex-col gap-4 mt-2">
          <Input 
            placeholder="Buscar por título..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <p className="text-sm text-center text-muted-foreground py-4">Carregando matérias...</p>
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <button
                  key={article.id}
                  onClick={() => handleSelect(article)}
                  className="w-full text-left p-3 rounded-md hover:bg-muted/50 border transition-colors flex flex-col gap-1"
                >
                  <span className="font-medium text-sm line-clamp-2 leading-tight">
                    {article.title}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {article.publishedAt?.toDate?.()?.toLocaleDateString('pt-BR') || 'Data desconhecida'}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-sm text-center text-muted-foreground py-4">Nenhuma matéria encontrada.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
