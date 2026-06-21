"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { getVideoById } from "@/data/videos";
import { updateVideo } from "@/app/admin/videos/actions";
import type { Video } from "@/data/videos";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export default function EditVideoPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id as string;

  const updateActionWithId = video ? updateVideo.bind(null, id, video.slug) : null;
  const [state, formAction] = useActionState(updateActionWithId || (async () => initialState), initialState);
  
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;
      setLoading(true);
      const videoData = await getVideoById(id);
      if (videoData) {
        setVideo(videoData);
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o vídeo.",
          variant: "destructive",
        });
        router.push("/admin/videos");
      }
      setLoading(false);
    };
    fetchVideo();
  }, [id, router, toast]);
  
  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        router.push("/admin/videos");
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

  if (loading || !video) {
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
          <CardTitle>Editar Vídeo</CardTitle>
          <CardDescription>
            Faça alterações no vídeo e salve.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="title">Título</Label>
                    <Input id="title" name="title" defaultValue={video.title} required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Input id="category" name="category" defaultValue={video.category} required />
                </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="duration">Duração</Label>
                    <Input id="duration" name="duration" defaultValue={video.duration} placeholder="MM:SS" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="dataAiHint">Dica para IA da Imagem</Label>
                    <Input id="dataAiHint" name="dataAiHint" defaultValue={video.dataAiHint} />
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image">Link da Thumbnail do Vídeo</Label>
              <Input id="image" name="image" type="url" defaultValue={video.image} required />
            </div>
             <div className="grid gap-2">
              <Label htmlFor="videoUrl">Link do Vídeo (YouTube)</Label>
              <Input id="videoUrl" name="videoUrl" type="url" defaultValue={video.videoUrl || ''} placeholder="https://www.youtube.com/watch?v=..." />
               <p className="text-xs text-muted-foreground">Opcional. Cole o link do vídeo do YouTube aqui.</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <SubmitButton />
            <Button variant="outline" asChild>
                <Link href="/admin/videos" target="_blank">Cancelar</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
