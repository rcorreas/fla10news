
"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { createRaioxArticle, deleteRaioxArticle } from "./actions";
import { getRaiox } from "@/data/raiox";
import type { RaioxArticle } from "@/data/raiox";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Icons
import { Loader2, FilePen, Trash2 } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
        </>
      ) : (
        "Publicar raio-x"
      )}
    </Button>
  );
}

export default function RaioxPage() {
  const [state, formAction] = useActionState(createRaioxArticle, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [raioxList, setRaioxList] = useState<RaioxArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRaiox = async () => {
    setIsLoading(true);
    const raiox = await getRaiox();
    setRaioxList(raiox);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRaiox();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        formRef.current?.reset();
        fetchRaiox(); // Re-fetch raiox to update the list
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
    const result = await deleteRaioxArticle(id);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setRaioxList(currentRaiox => currentRaiox.filter(raiox => raiox.id !== id));
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
          <CardTitle>Criar Novo Raio-X</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para publicar uma nova raio-x no portal.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="mainCategory">Categoria Principal</Label>
                    <Select name="mainCategory" required defaultValue="Futebol">
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
                    <Input id="category" name="category" placeholder="Ex: Profissional, Base, Feminino" required />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" placeholder="Título que chama a atenção para a raio-x" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Subtítulo (Resumo)</Label>
              <Textarea id="excerpt" name="excerpt" placeholder="Um resumo curto e direto que aparecerá nas listagens de raio-xs" required />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="author">Autor (Opcional)</Label>
                    <Input id="author" name="author" placeholder="Padrão: Redação NRN" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dataAiHint">Dica para IA da Imagem</Label>
                    <Input id="dataAiHint" name="dataAiHint" placeholder="Ex: soccer celebration" />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="image">Link da Foto da raio-x</Label>
                    <Input id="image" name="image" type="url" placeholder="https://exemplo.com/imagem.png" required />
                    <p className="text-xs text-muted-foreground">Recomendação: Imagem na proporção 16:9 (ex: 1200x675 pixels).</p>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="imageCredit">Crédito da Imagem (Opcional)</Label>
                    <Input id="imageCredit" name="imageCredit" placeholder="Ex: Foto: Reuters" />
                </div>
            </div>
            <Separator />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="image2">Link da Foto Secundária (Opcional)</Label>
                    <Input id="image2" name="image2" type="url" placeholder="https://exemplo.com/imagem2.png" />
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="imageCredit2">Crédito da Imagem Secundária (Opcional)</Label>
                    <Input id="imageCredit2" name="imageCredit2" placeholder="Ex: Foto: Agência" />
                </div>
            </div>
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="fullArticleLink">Link para a raio-x Completa (Opcional)</Label>
              <Input id="fullArticleLink" name="fullArticleLink" type="url" placeholder="https://ge.globo.com/..." />
              <p className="text-xs text-muted-foreground">Se preenchido, um botão "Ler raio-x completa" aparecerá no final do artigo.</p>
            </div>
             <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo da raio-x</Label>
                <TextareaWithFormatting id="content" name="content" placeholder="Escreva a raio-x completa aqui. Você pode usar tags HTML como <p>, <h3> e <strong> para formatar o texto." className="min-h-[300px]" required />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Raio-X Publicados</CardTitle>
          <CardDescription>
            Gerencie as raio-xs existentes no portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : raioxList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Tag</TableHead>
                  <TableHead>Data de Publicação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {raioxList.map((raiox) => (
                  <TableRow key={raiox.id}>
                    <TableCell className="font-medium max-w-xs truncate">{raiox.title}</TableCell>
                    <TableCell>{raiox.mainCategory}</TableCell>
                    <TableCell>{raiox.category}</TableCell>
                    <TableCell>{format(raiox.publishedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/raiox/edit/${raiox.id}`}>
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a raio-x.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(raiox.id)}
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
            <p className="text-center text-muted-foreground py-8">Nenhuma raio-x publicada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
