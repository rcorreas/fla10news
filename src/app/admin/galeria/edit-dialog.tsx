"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { updateGalleryItem } from "./actions";
import type { GalleryItem } from "@/data/gallery";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
        "Atualizar Imagem"
      )}
    </Button>
  );
}

interface EditDialogProps {
  item: GalleryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditDialog({ item, onClose, onSuccess }: EditDialogProps) {
  // Bind the item ID to the update action
  const updateWithId = item ? updateGalleryItem.bind(null, item.id) : updateGalleryItem.bind(null, "");
  const [state, formAction] = useActionState(updateWithId, initialState);
  const { toast } = useToast();
  
  // We need to track open state locally for smooth closing animation
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (item) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [item]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setOpen(false);
      setTimeout(onClose, 200); // Give time for close animation
    }
  };

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({
          title: "Sucesso!",
          description: state.message,
        });
        handleOpenChange(false);
        onSuccess();
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
  }, [state, toast]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Imagem</DialogTitle>
          <DialogDescription>
            Atualize as informações da imagem na galeria.
          </DialogDescription>
        </DialogHeader>
        
        <form action={formAction}>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-imageUrl">Link da Imagem (URL)</Label>
              <Input id="edit-imageUrl" name="imageUrl" type="url" defaultValue={item.imageUrl} required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Título da Obra/Foto</Label>
              <Input id="edit-title" name="title" defaultValue={item.title} required />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-legenda">Legenda da Imagem (opcional)</Label>
              <Input id="edit-legenda" name="legenda" defaultValue={item.legenda} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-artist">Autor/Artista (opcional)</Label>
                <Input id="edit-artist" name="artist" defaultValue={item.artist} />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-date">Data da Obra/Foto</Label>
                <Input id="edit-date" name="date" type="date" required defaultValue={item.date} />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
