"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { createAuthor, deleteAuthor } from "./actions";
import { getAuthors } from "@/data/authors";
import type { Author } from "@/data/authors";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
        </>
      ) : (
        "Adicionar Autor"
      )}
    </Button>
  );
}

export default function AutoresPage() {
  const [state, formAction] = useActionState(createAuthor, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [authorsList, setAuthorsList] = useState<Author[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAuthors = async () => {
    setIsLoading(true);
    const authors = await getAuthors();
    setAuthorsList(authors);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAuthors();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        formRef.current?.reset();
        fetchAuthors(); // Re-fetch authors to update the list
      } else {
        let description = state.message;
        if (state.errors) {
            const errorMessages = Object.values(state.errors).flat().join(' ');
            description += ` ${errorMessages}`;
        }
        toast({
          title: "Erro ao Salvar",
          description: description,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  const handleDelete = async (id: string) => {
    const result = await deleteAuthor(id);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setAuthorsList(current => current.filter(author => author.id !== id));
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
          <CardTitle>Criar Novo Autor</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para adicionar um novo autor ao portal.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome do Autor</Label>
              <Input id="name" name="name" placeholder="Ex: Mariana Costa" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="link">Link do Autor (Opcional)</Label>
                    <Input id="link" name="link" type="url" placeholder="Ex: https://twitter.com/autor" />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="image">Link da foto do Autor (Opcional)</Label>
                    <Input id="image" name="image" type="url" placeholder="https://exemplo.com/foto.jpg" />
                </div>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="description">Descrição do Autor (Opcional)</Label>
                <Textarea id="description" name="description" placeholder="Escreva a biografia ou descrição do autor." className="min-h-[100px]" />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Autores Cadastrados</CardTitle>
          <CardDescription>
            Gerencie as páginas dos autores existentes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : authorsList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorsList.map((author) => (
                  <TableRow key={author.id}>
                    <TableCell className="font-medium max-w-xs truncate">{author.name}</TableCell>
                    <TableCell>{author.slug}</TableCell>
                    <TableCell>{author.createdAt ? format(author.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/autores/edit/${author.id}`} target="_blank">
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o autor.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(author.id)}
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
            <p className="text-center text-muted-foreground py-8">Nenhum autor publicado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
