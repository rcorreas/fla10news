"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { getAuthorById } from "@/data/authors";
import { updateAuthor } from "@/app/admin/autores/actions";
import type { Author } from "@/data/authors";

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

export default function EditAuthorPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id as string;

  const updateActionWithId = author ? updateAuthor.bind(null, id) : null;
  const [state, formAction] = useActionState(updateActionWithId || (async () => initialState), initialState);
  
  useEffect(() => {
    const fetchAuthor = async () => {
      setLoading(true);
      const authorData = await getAuthorById(id);
      if (authorData) {
        setAuthor(authorData);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o autor.",
          variant: "destructive",
        });
        router.push("/admin/autores");
      }
      setLoading(false);
    };

    if (id) {
        fetchAuthor();
    }
  }, [id, router, toast]);
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        router.push("/admin/autores");
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

  if (loading || !author) {
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
          <CardTitle>Editar Autor</CardTitle>
          <CardDescription>
            Faça alterações nos dados do autor e salve.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Autor</Label>
              <Input id="name" name="name" defaultValue={author.name} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="link">Link do Autor (Opcional)</Label>
                    <Input id="link" name="link" type="url" defaultValue={author.link} placeholder="Ex: https://twitter.com/autor" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="image">Link da foto do Autor (Opcional)</Label>
                    <Input id="image" name="image" type="url" defaultValue={author.image} placeholder="https://exemplo.com/foto.jpg" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Descrição do Autor (Opcional)</Label>
                <Textarea id="description" name="description" defaultValue={author.description} placeholder="Escreva a biografia ou descrição do autor." className="min-h-[100px]" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <SubmitButton />
            <Button variant="outline" asChild>
                <Link href="/admin/autores">Cancelar</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
