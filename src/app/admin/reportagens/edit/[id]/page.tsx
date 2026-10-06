"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { getReportagensById } from "@/data/reportagens";
import { updateReportagensArticle } from "@/app/admin/reportagens/actions";
import type { ReportagensArticle } from "@/data/reportagens";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextareaWithFormatting } from "@/components/ui/textarea-with-formatting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const initialState: any = {
  success: false,
  message: "",
  errors: null,
};

const mainCategories = [
  "Futebol",
  "Basquete",
  "Volei",
  "E-Sports",
  "Olímpicos",
];

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

export default function EditMateriasPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [article, setArticle] = useState<ReportagensArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id as string;

  // Bind the action with the article ID and slug
  const updateActionWithId = article ? updateReportagensArticle.bind(null, id, article.slug) : null;
  const [state, formAction] = useActionState(updateActionWithId || (async () => initialState), initialState);
  
  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      const newsArticle = await getReportagensById(id);
      if (newsArticle) {
        setArticle(newsArticle);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar a reportagens.",
          variant: "destructive",
        });
        router.push("/admin/reportagens");
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
        router.push("/admin/reportagens");
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
          <CardTitle>Editar reportagens</CardTitle>
          <CardDescription>
            Faça alterações na reportagens e salve para publicar.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="mainCategory">Categoria Principal</Label>
                    <Select name="mainCategory" required defaultValue={article.mainCategory}>
                        <SelectTrigger id="mainCategory">
                            <SelectValue placeholder="Selecione a categoria principal" />
                        </SelectTrigger>
                        <SelectContent>
                            {mainCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Subcategoria (Tag)</Label>
                    <Input id="category" name="category" defaultValue={article.category} required />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" defaultValue={article.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Subtítulo (Resumo)</Label>
              <Textarea id="excerpt" name="excerpt" defaultValue={article.excerpt} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="author">Autor</Label>
                    <Input id="author" name="author" defaultValue={article.author} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dataAiHint">Dica para IA da Imagem</Label>
                    <Input id="dataAiHint" name="dataAiHint" defaultValue={article.dataAiHint} />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="grid gap-2">
                    <Label htmlFor="image">Link da Foto Principal</Label>
                    <Input id="image" name="image" type="url" defaultValue={article.image} required />
                    <p className="text-xs text-muted-foreground">Recomendação: Imagem na proporção 16:9 (ex: 1200x675 pixels).</p>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="imageCredit">Crédito da Imagem (Opcional)</Label>
                    <Input id="imageCredit" name="imageCredit" defaultValue={article.imageCredit || ''} placeholder="Ex: Foto: Reuters" />
                </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="grid gap-2">
                    <Label htmlFor="image2">Link da Foto Secundária (Opcional)</Label>
                    <Input id="image2" name="image2" type="url" defaultValue={article.image2 || ''} />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="imageCredit2">Crédito da Imagem Secundária (Opcional)</Label>
                    <Input id="imageCredit2" name="imageCredit2" defaultValue={article.imageCredit2 || ''} />
                </div>
            </div>
            <Separator />
            <div className="grid gap-2">
                <Label htmlFor="youtubeUrl">Vídeo do YouTube (Opcional)</Label>
                <Input id="youtubeUrl" name="youtubeUrl" type="url" defaultValue={article.youtubeUrl || ''} placeholder="https://www.youtube.com/watch?v=..." />
                <p className="text-xs text-muted-foreground">O vídeo será exibido no meio do texto do artigo.</p>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="fullArticleLink">Link para a reportagens Completa (Opcional)</Label>
              <Input id="fullArticleLink" name="fullArticleLink" type="url" defaultValue={article.fullArticleLink || ''} placeholder="https://ge.globo.com/..." />
              <p className="text-xs text-muted-foreground">Se preenchido, um botão "Ler reportagens completa" aparecerá no final do artigo.</p>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo da reportagens</Label>
                <TextareaWithFormatting id="content" name="content" defaultValue={article.content} className="min-h-[300px]" required />
            </div>
            <Separator />
            <div className="grid gap-6 bg-muted/50 p-6 rounded-lg border border-border mt-6 mb-6">
              <h3 className="text-lg font-headline font-bold flex items-center gap-2">
                SEO (Google)
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Título SEO (Meta Title)</Label>
                <Input id="metaTitle" name="metaTitle" defaultValue={article.metaTitle || ''} placeholder="Ex: Reportagens: Flamengo x River Plate | Fla10" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Descrição SEO (Meta Description)</Label>
                <Textarea id="metaDescription" name="metaDescription" defaultValue={article.metaDescription || ''} placeholder="Aparece nos resultados do Google. Resuma o reportagens em até 150 caracteres." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="focusKeyword">Palavra-chave Principal</Label>
                <Input id="focusKeyword" name="focusKeyword" defaultValue={article.focusKeyword || ''} placeholder="Ex: Flamengo Libertadores" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryKeywords">Palavras-chave Secundárias</Label>
                <Input id="secondaryKeywords" name="secondaryKeywords" defaultValue={article.secondaryKeywords || ''} placeholder="Ex: tática, libertadores, jorge jesus (separadas por espaço ou vírgula)" />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <SubmitButton />
            <Button variant="outline" asChild>
                <Link href="/admin/reportagens">Cancelar</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
