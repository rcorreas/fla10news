
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { getHistoryArticleById } from "@/data/history";
import { updateHistoryArticle } from "@/app/admin/historia/actions";
import type { HistoryArticle } from "@/data/history";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextareaWithFormatting } from "@/components/ui/textarea-with-formatting";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";

const initialState: any = {
  success: false,
  message: "",
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
      <Button type="submit" name="status" value="draft" variant="outline" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Salvar Rascunho
      </Button>
      <Button type="submit" name="status" value="published" disabled={pending}>
        {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Publicar Imediatamente
      </Button>
    </div>
  );
}

export default function EditHistoriaPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [article, setArticle] = useState<HistoryArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id as string;

  const updateActionWithId = updateHistoryArticle.bind(null, id);
  const [state, formAction] = useActionState(updateActionWithId, initialState);
  
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const articleData = await getHistoryArticleById(id);
      if (articleData) {
        setArticle(articleData);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o artigo histórico.",
          variant: "destructive",
        });
        router.push("/admin/historia");
      }
      setLoading(false);
    };

    if (id) {
        fetchArticle();
    }
  }, [id, router, toast]);
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        router.push("/admin/historia");
      } else {
        let description = state.message;
        if (state.errors) {
            const errorMessages = Object.values(state.errors).flat().join(' ');
            description += ` ${errorMessages}`;
        }
        toast({
          title: "Erro ao Atualizar",
          description: description,
          variant: "destructive",
        });
      }
    }
  }, [state, toast, router]);

  if (loading || !article) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Editar Artigo Histórico</CardTitle>
          <CardDescription>
            Faça alterações no artigo e salve para publicar.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
           <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" defaultValue={article.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="subtitle">Subtítulo</Label>
              <Textarea id="subtitle" name="subtitle" defaultValue={article.subtitle} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="grid gap-2">
                  <Label htmlFor="author">Autor</Label>
                  <Input id="author" name="author" defaultValue={article.author} required />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="dataAiHint">Dica para IA da Imagem</Label>
                  <Input id="dataAiHint" name="dataAiHint" defaultValue={article.dataAiHint || ''} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="grid gap-2">
                  <Label htmlFor="image">Link da Foto Principal</Label>
                  <Input id="image" name="image" type="url" defaultValue={article.image} required />
              </div>
               <div className="grid gap-2">
                  <Label htmlFor="imageCredit1">Crédito da Foto Principal</Label>
                  <Input id="imageCredit1" name="imageCredit1" type="text" defaultValue={article.imageCredit1 || ''} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="grid gap-2">
                  <Label htmlFor="image2">Link da Foto Secundária (Opcional)</Label>
                  <Input id="image2" name="image2" type="url" defaultValue={article.image2 || ''} />
              </div>
               <div className="grid gap-2">
                  <Label htmlFor="imageCredit2">Crédito da Foto Secundária</Label>
                  <Input id="imageCredit2" name="imageCredit2" type="text" defaultValue={article.imageCredit2 || ''} />
              </div>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="videoUrl">Link do Vídeo (YouTube)</Label>
                <Input id="videoUrl" name="videoUrl" type="url" defaultValue={article.videoUrl || ''} placeholder="https://www.youtube.com/watch?v=..." />
                <p className="text-xs text-muted-foreground">Opcional. Para escolher a posição exata do vídeo no texto, digite <strong>[video]</strong> dentro do conteúdo abaixo.</p>
            </div>
            <Separator />
            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-lg">SEO (Google)</h3>
              <p className="text-sm text-muted-foreground">Campos opcionais. Se deixados em branco, o sistema usará o título e o subtítulo do artigo.</p>
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta Title (Título no Google)</Label>
                <Input id="metaTitle" name="metaTitle" defaultValue={article.metaTitle || ''} placeholder="Ex: Mundial de 1981: O Dia em que o Mundo se Curvou ao Flamengo | Fla10" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta Description (Resumo no Google)</Label>
                <Textarea id="metaDescription" name="metaDescription" defaultValue={article.metaDescription || ''} placeholder="Resumo otimizado para aparecer nos resultados de busca..." className="min-h-[80px]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="focusKeyword">Palavra-chave Principal</Label>
                <Input id="focusKeyword" name="focusKeyword" defaultValue={article.focusKeyword || ''} placeholder="Ex: Flamengo Mundial 1981" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryKeywords">Palavras-chave Secundárias</Label>
                <Input id="secondaryKeywords" name="secondaryKeywords" defaultValue={article.secondaryKeywords || ''} placeholder="Ex: Zico, Tóquio, Liverpool, história do Flamengo" />
              </div>
            </div>
            <Separator />
            <div className="grid gap-2">
                <Label htmlFor="content">Matéria Completa</Label>
                <TextareaWithFormatting id="content" name="content" defaultValue={article.content} className="min-h-[300px]" required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center">
            <SubmitButton />
            <div className="flex gap-4">
              <Button variant="ghost" asChild>
                <Link href={`/flahistoria/${article.slug}?preview=1`} target="_blank">Ver Preview</Link>
              </Button>
              <Button variant="outline" asChild>
                  <Link href="/admin/historia">Cancelar</Link>
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
