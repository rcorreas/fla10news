"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { createGalleryItem, deleteGalleryItem } from "./actions";
import { getGalleryItems } from "@/data/gallery";
import type { GalleryItem } from "@/data/gallery";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

// Icons
import { Loader2, Trash2, Pencil } from "lucide-react";
import { EditDialog } from "./edit-dialog";

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
        "Salvar Imagem"
      )}
    </Button>
  );
}

export default function GaleriaAdminPage() {
  const [state, formAction] = useActionState(createGalleryItem, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  const fetchGalleryItems = async () => {
    setIsLoading(true);
    const dados = await getGalleryItems();
    setGalleryList(dados);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        formRef.current?.reset();
        fetchGalleryItems(); // Re-fetch list
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
    const result = await deleteGalleryItem(id);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setGalleryList(current => current.filter(item => item.id !== id));
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
          <CardTitle>Nova Imagem para a Galeria</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para adicionar uma nova imagem à Galeria de Arte Rubro-Negra.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">Link da Imagem (URL)</Label>
                <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://exemplo.com/imagem.png" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="artist">Autor/Artista (opcional)</Label>
                <Input id="artist" name="artist" placeholder="Ex: João Silva" />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Obra/Foto</Label>
              <Input id="title" name="title" placeholder="Um título para a imagem" required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="legenda">Legenda da Imagem (opcional)</Label>
              <Input id="legenda" name="legenda" placeholder="Informações adicionais sobre a imagem" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="texto">Texto (opcional)</Label>
              <Textarea id="texto" name="texto" placeholder="Texto adicional (história, contexto, etc)" className="min-h-[120px]" />
            </div>

            <div className="grid gap-2 md:w-1/2">
              <Label htmlFor="date">Data da Obra/Foto</Label>
              <Input id="date" name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Imagens na Galeria</CardTitle>
          <CardDescription>
            Gerencie as imagens da Galeria de Arte Rubro-Negra.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : galleryList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagem</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Legenda</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {galleryList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                        <div className="relative w-16 h-16 rounded overflow-hidden">
                            <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate" title={item.title}>{item.title}</TableCell>
                    <TableCell className="max-w-xs truncate" title={item.legenda}>{item.legenda || '-'}</TableCell>
                    <TableCell>{item.artist || '-'}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                        <Pencil className="h-4 w-4 text-blue-500" />
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente a imagem da galeria.
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
            <p className="text-center text-muted-foreground py-8">Nenhuma imagem publicada na galeria ainda.</p>
          )}
        </CardContent>
      </Card>
      
      <EditDialog 
        item={editingItem} 
        onClose={() => setEditingItem(null)} 
        onSuccess={() => fetchGalleryItems()} 
      />
    </div>
  );
}
