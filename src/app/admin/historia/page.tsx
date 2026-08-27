
"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { createHistoryArticle, deleteHistoryArticle } from "./actions";
import { getHistoryArticles } from "@/data/history";
import type { HistoryArticle } from "@/data/history";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextareaWithFormatting } from "@/components/ui/textarea-with-formatting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Icons
import { Loader2, FilePen, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const initialState: any = {
  success: false,
  message: "",
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
        </>
      ) : (
        "Publicar Artigo"
      )}
    </Button>
  );
}

export default function HistoriaPage() {
  const [state, formAction] = useActionState(createHistoryArticle, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [articles, setArticles] = useState<HistoryArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    setIsLoading(true);
    const data = await getHistoryArticles();
    setArticles(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        formRef.current?.reset();
        fetchArticles();
      } else {
        let description = state.message;
        if (state.errors) {
            const errorMessages = Object.values(state.errors).flat().join(' ');
            description += ` ${errorMessages}`;
        }
        toast({
          title: "Erro ao Publicar",
          description: description,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  const handleDelete = async (id: string) => {
    const result = await deleteHistoryArticle(id);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setArticles(current => current.filter(item => item.id !== id));
    } else {
      toast({
        title: "Erro ao Deletar",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Artigo Histórico</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para publicar um novo artigo na seção "Flamengo na História".
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" placeholder="Ex: Mundial de 1981: O dia em que o mundo se curvou" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Textarea id="subtitle" name="subtitle" placeholder="Um resumo curto sobre o evento histórico" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="grid gap-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input id="author" name="author" placeholder="Padrão: Redação NRN" defaultValue="Redação NRN" required />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="dataAiHint">Dica para IA da Imagem</Label>
                  <Input id="dataAiHint" name="dataAiHint" placeholder="Ex: historic trophy" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="grid gap-2">
                  <Label htmlFor="image">Link da Foto Principal</Label>
                  <Input id="image" name="image" type="url" placeholder="https://exemplo.com/imagem.png" required />
              </div>
               <div className="grid gap-2">
                  <Label htmlFor="imageCredit1">Crédito da Foto Principal</Label>
                  <Input id="imageCredit1" name="imageCredit1" type="text" placeholder="Ex: Divulgação / Flamengo" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="grid gap-2">
                  <Label htmlFor="image2">Link da Foto Secundária (Opcional)</Label>
                  <Input id="image2" name="image2" type="url" placeholder="https://exemplo.com/outra-imagem.png" />
              </div>
               <div className="grid gap-2">
                  <Label htmlFor="imageCredit2">Crédito da Foto Secundária</Label>
                  <Input id="imageCredit2" name="imageCredit2" type="text" placeholder="Ex: Agência Reuters" />
              </div>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="videoUrl">Link do Vídeo (Opcional)</Label>
                <Input id="videoUrl" name="videoUrl" type="url" placeholder="https://youtube.com/watch?v=..." />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="content">Matéria Completa</Label>
                <TextareaWithFormatting id="content" name="content" placeholder="Escreva o artigo completo aqui." className="min-h-[300px]" required />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Artigos Históricos Publicados</CardTitle>
          <CardDescription>
            Gerencie os artigos existentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : articles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium max-w-xs truncate">{article.title}</TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>{format(article.publishedAt, "dd/MM/yyyy", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/historia/edit/${article.id}`}>
                          <FilePen className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o artigo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(article.id)}
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhum artigo histórico publicado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
