"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { createTirinha } from "../actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TextareaWithFormatting } from "@/components/ui/textarea-with-formatting";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";

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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
        </>
      ) : (
        "Publicar Tirinha"
      )}
    </Button>
  );
}

export default function NovaTirinhaPage() {
  const [state, formAction] = useActionState(createTirinha, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

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

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (formRef.current) {
        const slugInput = formRef.current.elements.namedItem("slug") as HTMLInputElement;
        if (slugInput && !slugInput.value) { // Only auto-fill if slug is empty
            slugInput.value = slugify(e.target.value);
        }
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova Tirinha</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para publicar uma nova tirinha.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="title">Título da Tirinha</Label>
                    <Input id="title" name="title" placeholder="Ex: A fuga do Gabigol" required onChange={handleTitleChange} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <Input id="slug" name="slug" placeholder="ex-a-fuga-do-gabigol" required />
                </div>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="imageHome">Link para imagem da Home</Label>
                <Input id="imageHome" name="imageHome" type="url" placeholder="https://exemplo.com/tirinha-thumb.jpg" required />
                <p className="text-xs text-muted-foreground">Esta imagem aparecerá na página inicial.</p>
            </div>

            <div className="grid gap-2">
                <Label htmlFor="image">Link para imagem da Tirinha</Label>
                <Input id="image" name="image" type="url" placeholder="https://exemplo.com/tirinha-full.jpg" required />
                <p className="text-xs text-muted-foreground">Esta imagem aparecerá expandida na página da tirinha.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <TextareaWithFormatting id="description" name="description" placeholder="Uma breve descrição sobre a tirinha." />
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
    </div>
  );
}
