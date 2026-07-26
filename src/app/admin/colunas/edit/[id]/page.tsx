
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { getColumnById } from "@/data/columns";
import { updateColumn } from "@/app/admin/colunas/actions";
import type { OpinionColumn } from "@/data/columns";

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

function o fi == SubmitButton() {
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

export default function EditColunasPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [column, setColumn] = useState<OpinionColumn | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id as string;

  const updateActionWithId = column ? updateColumn.bind(null, id, column.slug) : null;
  const [state, formAction] = useActionState(updateActionWithId || (async () => initialState), initialState);

  useEffect(() => {
    const fetchColumn = async () => {
      setLoading(true);
      const columnData = await getColumnById(id);
      if (columnData) {
        setColumn(columnData);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar a coluna.",
          variant: "destructive",
        });
        router.push("/admin/colunas");
      }
      setLoading(false);
    };

    if (id) {
      fetchColumn();
    }
  }, [id, router, toast]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        router.push("/admin/colunas");
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

  if (loading || !column) {
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
          <CardTitle>Editar Coluna</CardTitle>
          <CardDescription>
            Faça alterações na coluna e salve para publicar.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="columnName">Nome da Coluna</Label>
                <Input id="columnName" name="columnName" defaultValue={column.columnName} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria (Tag)</Label>
                <Input id="category" name="category" defaultValue={column.category} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="author">Autor</Label>
                <Input id="author" name="author" defaultValue={column.author} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="authorImage">Link da Foto do Autor</Label>
                <Input id="authorImage" name="authorImage" type="url" defaultValue={column.authorImage} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authorLink">Link do Autor (Opcional)</Label>
              <Input id="authorLink" name="authorLink" type="url" defaultValue={column.authorLink || ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="authorDescription">Descrição do Autor (Opcional)</Label>
              <Textarea id="authorDescription" name="authorDescription" defaultValue={column.authorDescription || ''} placeholder="Uma breve biografia do autor." />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="columnImage">Link da Imagem da Coluna (Opcional)</Label>
              <Input id="columnImage" name="columnImage" type="url" defaultValue={column.columnImage || ''} placeholder="https://exemplo.com/icone-coluna.png" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Título do Artigo</Label>
              <Input id="title" name="title" defaultValue={column.title} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Resumo (Excerpt)</Label>
              <Textarea id="excerpt" name="excerpt" defaultValue={column.excerpt} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dataAiHint">Dica para IA da Imagem (Opcional)</Label>
              <Input id="dataAiHint" name="dataAiHint" defaultValue={column.dataAiHint || ''} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Conteúdo da Coluna</Label>
              <Textarea id="content" name="content" defaultValue={column.content} className="min-h-[300px]" required />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <SubmitButton />
            <Button variant="outline" asChild>
              <Link href="/admin/colunas">Cancelar</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
