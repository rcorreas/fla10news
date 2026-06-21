
"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { createVideo, deleteVideo } from "./actions";
import { getVideos } from "@/data/videos";
import type { Video } from "@/data/videos";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adicionando...
        </>
      ) : (
        "Adicionar Vídeo"
      )}
    </Button>
  );
}

export default function VideosPage() {
  const [state, formAction] = useActionState(createVideo, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [videoList, setVideoList] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideos = async () => {
    setIsLoading(true);
    const videos = await getVideos();
    setVideoList(videos);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        formRef.current?.reset();
        fetchVideos(); // Re-fetch videos to update the list
      } else {
        let description = state.message;
        if (state.errors) {
            const errorMessages = Object.values(state.errors).flat().join(' ');
            description += ` ${errorMessages}`;
        }
        toast({
          title: "Erro ao Adicionar",
          description: description,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  const handleDelete = async (id: string) => {
    const result = await deleteVideo(id);
    if (result.success) {
      toast({
        title: "Sucesso!",
        description: result.message,
      });
      setVideoList(currentVideos => currentVideos.filter(video => video.id !== id));
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
          <CardTitle>Adicionar Novo Vídeo</CardTitle>
          <CardDescription>
            Preencha os campos abaixo para adicionar um novo vídeo ao portal.
          </CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" name="title" placeholder="Título do vídeo" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input id="category" name="category" placeholder="Ex: Bastidores, Gols, Entrevistas" required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Input id="duration" name="duration" placeholder="MM:SS (ex: 10:32)" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dataAiHint">Dica para IA da Imagem</Label>
                    <Input id="dataAiHint" name="dataAiHint" placeholder="Ex: soccer goal" />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Link da Thumbnail do Vídeo</Label>
              <Input id="image" name="image" type="url" placeholder="https://exemplo.com/imagem.png" required />
              <p className="text-xs text-muted-foreground">Recomendação: Imagem na proporção 16:9.</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="videoUrl">Link do Vídeo (YouTube)</Label>
              <Input id="videoUrl" name="videoUrl" type="url" placeholder="https://www.youtube.com/watch?v=..." />
              <p className="text-xs text-muted-foreground">Opcional. Cole o link do vídeo do YouTube aqui.</p>
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Vídeos Publicados</CardTitle>
          <CardDescription>
            Gerencie os vídeos existentes no portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : videoList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Duração</TableHead>
                  <TableHead>Data de Publicação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {videoList.map((video) => (
                  <TableRow key={video.id}>
                    <TableCell className="font-medium max-w-xs truncate">{video.title}</TableCell>
                    <TableCell>{video.category}</TableCell>
                    <TableCell>{video.duration}</TableCell>
                    <TableCell>{format(video.publishedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="ghost" size="icon">
                        <Link href={`/admin/videos/edit/${video.id}`} target="_blank">
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
                              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o vídeo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDelete(video.id)}
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
            <p className="text-center text-muted-foreground py-8">Nenhum vídeo publicado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
