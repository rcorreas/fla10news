
"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { createColumn, deleteColumn } from "./actions";
import { getColumns } from "@/data/columns";
import type { OpinionColumn } from "@/data/columns";

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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        "Publicar Coluna"
      )}
    </Button>
  );
}

export default function ColunasPage() {
  const [state, formAction] = useActionState(createColumn, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [columnsList, setColumnsList] = useState<OpinionColumn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States for Column Name selection
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [newColumn, setNewColumn] = useState<string>("");

  const fetchColumns = async () => {
    setIsLoading(true);
    const columns = await getColumns();
    setColumnsList(columns);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        formRef.current?.reset();
        setSelectedColumn("");
        setNewColumn("");
        fetchColumns(); // Re-fetch columns to update the list
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
    const result = await deleteColumn(id);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setColumnsList(currentColumns => currentColumns.filter(column => column.id !== id));
    } else {
      toast({
        title: "Erro ao Deletar",
        description: result.message,
        variant: "destructive",
      });
    }
  };

  const uniqueColumns = Array.from(new Set(columnsList.map(c => c.columnName)));
  const finalColumnName = newColumn.trim() !== "" ? newColumn : selectedColumn;
  const isCreatingNewColumn = newColumn.trim() !== "";
  const existingColumnData = columnsList.find(c => c.columnName === selectedColumn);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Coluna</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para publicar uma nova coluna de opinião no portal.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <input type="hidden" name="columnName" value={finalColumnName} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label>Nome da Coluna (Existente)</Label>
                    <Select onValueChange={setSelectedColumn} value={selectedColumn}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma coluna..." />
                      </SelectTrigger>
                      <SelectContent>
                        {uniqueColumns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="newColumnName">Ou Criar Nova Coluna</Label>
                    <Input 
                      id="newColumnName" 
                      placeholder="Ex: Voz da Torcida" 
                      value={newColumn}
                      onChange={(e) => setNewColumn(e.target.value)}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="category">Categoria (Tag)</Label>
                    <Input id="category" name="category" placeholder="Ex: Opinião, Análise Tática" required />
                </div>
            </div>
            {isCreatingNewColumn ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="author">Autor</Label>
                        <Input id="author" name="author" placeholder="Ex: Zico" required />
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="authorImage">Link da Foto do Autor</Label>
                        <Input id="authorImage" name="authorImage" type="url" placeholder="https://exemplo.com/foto.png" required />
                    </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="authorLink">Link do Autor (Opcional)</Label>
                  <Input id="authorLink" name="authorLink" type="url" placeholder="https://twitter.com/autor" />
                </div>
                <div className="grid gap-2 mt-6">
                  <Label htmlFor="authorDescription">Descrição do Autor (Opcional)</Label>
                  <Textarea id="authorDescription" name="authorDescription" placeholder="Uma breve biografia do autor." />
                </div>
                <div className="grid gap-2 mt-6">
                  <Label htmlFor="columnImage">Link da Imagem da Coluna (Opcional)</Label>
                  <Input id="columnImage" name="columnImage" type="url" placeholder="https://exemplo.com/icone-coluna.png" />
                </div>
              </>
            ) : (
              <>
                <input type="hidden" name="author" value={existingColumnData?.author || ""} />
                <input type="hidden" name="authorImage" value={existingColumnData?.authorImage || ""} />
                <input type="hidden" name="authorLink" value={existingColumnData?.authorLink || ""} />
                <input type="hidden" name="authorDescription" value={existingColumnData?.authorDescription || ""} />
                <input type="hidden" name="columnImage" value={existingColumnData?.columnImage || ""} />
              </>
            )}
            <div className="grid gap-2">
              <Label htmlFor="title">Título do Artigo</Label>
              <Input id="title" name="title" placeholder="Um título chamativo para a coluna de hoje" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="excerpt">Resumo (Excerpt)</Label>
              <Textarea id="excerpt" name="excerpt" placeholder="Um resumo curto que aparecerá nas listagens" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="dataAiHint">Dica para IA da Imagem (Opcional)</Label>
                <Input id="dataAiHint" name="dataAiHint" placeholder="Ex: journalist writing" />
            </div>
             <div className="grid gap-2">
                <Label htmlFor="content">Conteúdo da Coluna</Label>
                <Textarea id="content" name="content" placeholder="Escreva a coluna completa aqui. Você pode usar tags HTML." className="min-h-[300px]" required />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Colunas Publicadas</CardTitle>
          <CardDescription>
            Gerencie as colunas existentes no portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : columnsList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Coluna</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {columnsList.map((column) => (
                  <TableRow key={column.id}>
                    <TableCell className="font-medium max-w-xs truncate">{column.title}</TableCell>
                    <TableCell>{column.author}</TableCell>
                    <TableCell>{column.columnName}</TableCell>
                    <TableCell>{format(column.publishedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/colunas/edit/${column.id}`} target="_blank">
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a coluna.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(column.id)}
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
            <p className="text-center text-muted-foreground py-8">Nenhuma coluna publicada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
