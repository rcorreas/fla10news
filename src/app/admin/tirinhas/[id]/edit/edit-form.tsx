"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { updateTirinha } from "../../actions";
import type { TirinhaItem } from "@/data/tirinhas";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextareaWithFormatting } from "@/components/ui/textarea-with-formatting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const initialState: any = {
  success: false,
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
        </>
      ) : (
        "Atualizar Tirinha"
      )}
    </Button>
  );
}

export function EditTirinhaForm({ tirinha }: { tirinha: TirinhaItem }) {
  const [state, formAction] = useActionState(updateTirinha, initialState);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        router.push("/admin/tirinhas");
      } else {
        toast({
          title: "Erro",
          description: state.message,
          variant: "destructive",
        });
      }
    }
  }, [state, toast, router]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Tirinha</CardTitle>
        <CardDescription>
          Faça as alterações necessárias para a tirinha <strong>{tirinha.title}</strong>.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <input type="hidden" name="id" value={tirinha.id} />
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                  <Label htmlFor="title">Título da Tirinha</Label>
                  <Input id="title" name="title" defaultValue={tirinha.title} required />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input id="slug" name="slug" defaultValue={tirinha.slug} required />
              </div>
          </div>

          <div className="grid gap-2">
              <Label htmlFor="imageHome">Link para imagem da Home</Label>
              <Input id="imageHome" name="imageHome" type="url" defaultValue={tirinha.imageHome} required />
          </div>

          <div className="grid gap-2">
              <Label htmlFor="image">Link para imagem da Tirinha</Label>
              <Input id="image" name="image" type="url" defaultValue={tirinha.image} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <TextareaWithFormatting id="description" name="description" defaultValue={tirinha.description} />
          </div>
          
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push('/admin/tirinhas')}>
              Cancelar
          </Button>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
