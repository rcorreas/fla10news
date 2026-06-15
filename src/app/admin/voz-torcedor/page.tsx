"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { createVozTorcedor, deleteVozTorcedor } from "./actions";
import { getVozTorcedores } from "@/data/voz-torcedor";
import type { VozTorcedor } from "@/data/voz-torcedor";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Publicando...
        </>
      ) : (
        "Publicar Opinião"
      )}
    </Button>
  );
}

export default function VozTorcedorPage() {
  const [state, formAction] = useActionState(createVozTorcedor, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [vozList, setVozList] = useState<VozTorcedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVozTorcedores = async () => {
    setIsLoading(true);
    const dados = await getVozTorcedores();
    setVozList(dados);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVozTorcedores();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        formRef.current?.reset();
        fetchVozTorcedores(); // Re-fetch list
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
    const result = await deleteVozTorcedor(id);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setVozList(current => current.filter(item => item.id !== id));
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
          <CardTitle>Nova Opinião de Torcedor</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para publicar uma nova opinião de torcedor no portal.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="authorName">Nome do Torcedor</Label>
                    <Input id="authorName" name="authorName" placeholder="Ex: João Silva" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="image">Link da Imagem (Print ou Foto)</Label>
                  <Input id="image" name="image" type="url" placeholder="https://exemplo.com/print.png" />
                </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Título</Label>
              <Input id="title" name="title" placeholder="Um título chamativo para a opinião" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="summary">Resumo</Label>
              <Textarea id="summary" name="summary" placeholder="Um resumo curto que aparecerá nas listagens" required />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo da Opinião</Label>
                <Textarea id="content" name="content" placeholder="Escreva o texto completo da opinião aqui. Você pode usar tags HTML." className="min-h-[300px]" required />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Opiniões Publicadas</CardTitle>
          <CardDescription>
            Gerencie as publicações existentes no portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : vozList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Torcedor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vozList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium max-w-xs truncate">{item.title}</TableCell>
                    <TableCell>{item.authorName}</TableCell>
                    <TableCell>{format(item.publishedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/voz-torcedor/edit/${item.id}`}>
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a opinião.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(item.id)}
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
            <p className="text-center text-muted-foreground py-8">Nenhuma opinião publicada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
