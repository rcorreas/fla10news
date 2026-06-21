
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
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
        </>
      ) : (
        "Salvar Alterações"
      )}
    </Button>
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
                <Label htmlFor="videoUrl">Link do Vídeo (Opcional)</Label>
                <Input id="videoUrl" name="videoUrl" type="url" defaultValue={article.videoUrl || ''} />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="content">Matéria Completa</Label>
                <Textarea id="content" name="content" defaultValue={article.content} className="min-h-[300px]" required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <SubmitButton />
            <Button variant="outline" asChild>
                <Link href="/admin/historia" target="_blank">Cancelar</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
