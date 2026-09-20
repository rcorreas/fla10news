"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { getVozTorcedorById } from "@/data/voz-torcedor";
import { updateVozTorcedor } from "@/app/admin/voz-torcedor/actions";
import type { VozTorcedor } from "@/data/voz-torcedor";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TextareaWithFormatting } from "@/components/ui/textarea-with-formatting";
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

export default function EditVozTorcedorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [item, setItem] = useState<VozTorcedor | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id as string;

  const updateActionWithId = item ? updateVozTorcedor.bind(null, id, item.slug) : null;
  const [state, formAction] = useActionState(updateActionWithId || (async () => initialState), initialState);
  
  useEffect(() => {
    const fetchItem = async () => {
      setLoading(true);
      const data = await getVozTorcedorById(id);
      if (data) {
        setItem(data);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar a publicação.",
          variant: "destructive",
        });
        router.push("/admin/voz-torcedor");
      }
      setLoading(false);
    };

    if (id) {
        fetchItem();
    }
  }, [id, router, toast]);
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        router.push("/admin/voz-torcedor");
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

  if (loading || !item) {
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
          <CardTitle>Editar Opinião do Torcedor</CardTitle>
          <CardDescription>
            Faça alterações na publicação e salve.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="authorName">Nome do Torcedor</Label>
                    <Input id="authorName" name="authorName" defaultValue={item.authorName} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Link da Imagem (Print ou Foto)</Label>
                  <Input id="image" name="image" type="url" defaultValue={item.image || ''} placeholder="https://exemplo.com/print.png" />
                </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" defaultValue={item.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Resumo</Label>
              <Textarea id="summary" name="summary" defaultValue={item.summary} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="videoUrl">Link do Vídeo (YouTube)</Label>
              <Input id="videoUrl" name="videoUrl" type="url" defaultValue={item.videoUrl || ''} placeholder="https://www.youtube.com/watch?v=..." />
              <p className="text-xs text-muted-foreground">Opcional. Para escolher a posição exata do vídeo no texto, digite <strong>[video]</strong> dentro do conteúdo abaixo.</p>
            </div>
            <Separator />
            <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-lg">SEO (Google)</h3>
              <p className="text-sm text-muted-foreground">Campos opcionais. Se deixados em branco, o sistema usará o título e o subtítulo da matéria.</p>
              <div className="grid gap-2">
                <Label htmlFor="metaTitle">Meta Title (Título no Google)</Label>
                <Input id="metaTitle" name="metaTitle" defaultValue={item.metaTitle || ''} placeholder="Ex: Título focado em SEO | Fla10" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="metaDescription">Meta Description (Resumo no Google)</Label>
                <Textarea id="metaDescription" name="metaDescription" defaultValue={item.metaDescription || ''} placeholder="Resumo chamativo para os resultados de busca..." className="min-h-[80px]" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="focusKeyword">Palavra-chave Principal</Label>
                <Input id="focusKeyword" name="focusKeyword" defaultValue={item.focusKeyword || ''} placeholder="Ex: Flamengo Libertadores" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryKeywords">Palavras-chave Secundárias</Label>
                <Input id="secondaryKeywords" name="secondaryKeywords" defaultValue={item.secondaryKeywords || ''} placeholder="Ex: maracanã, mengão, futebol (separadas por espaço ou vírgula)" />
              </div>
            </div>
            <Separator />
             <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo da Opinião</Label>
                <TextareaWithFormatting id="content" name="content" defaultValue={item.content} className="min-h-[300px]" required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <SubmitButton />
            <Button variant="outline" asChild>
                <Link href="/admin/voz-torcedor">Cancelar</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
