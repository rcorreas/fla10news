"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import { deleteTirinha } from "./actions";
import { getTirinhas } from "@/data/tirinhas";
import type { TirinhaItem } from "@/data/tirinhas";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

import { Loader2, FilePen, Trash2, Plus } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function TirinhasListPage() {
  const { toast } = useToast();
  const [tirinhas, setTirinhas] = useState<TirinhaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTirinhas = async () => {
    setIsLoading(true);
    const data = await getTirinhas();
    setTirinhas(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTirinhas();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await deleteTirinha(id);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setTirinhas(current => current.filter(t => t.id !== id));
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
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold">Gerenciar Tirinhas</h1>
            <p className="text-muted-foreground">Administre as tirinhas publicadas no portal.</p>
        </div>
        <Button asChild>
          <Link href="/admin/tirinhas/nova">
            <Plus className="mr-2 h-4 w-4" /> Nova Tirinha
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : tirinhas.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Data de Publicação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tirinhas.map((tirinha) => (
                  <TableRow key={tirinha.id}>
                    <TableCell className="font-medium max-w-xs truncate">{tirinha.title}</TableCell>
                    <TableCell className="text-muted-foreground">{tirinha.slug}</TableCell>
                    <TableCell>{format(tirinha.publishedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/tirinhas/${tirinha.id}/edit`}>
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a tirinha.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(tirinha.id)}
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
            <p className="text-center text-muted-foreground py-8">Nenhuma tirinha publicada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
