"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";

const GallerySchema = z.object({
  imageUrl: z.string().url({ message: "Por favor, insira um link válido para a imagem." }),
  caption: z.string().min(5, { message: "A legenda deve ter pelo menos 5 caracteres." }),
  artist: z.string().min(2, { message: "O nome do autor/artista deve ter pelo menos 2 caracteres." }),
  date: z.string().min(1, { message: "Data é obrigatória." }),
});

export async function createGalleryItem(prevState: any, formData: FormData) {
  const validatedFields = GallerySchema.safeParse({
    imageUrl: formData.get("imageUrl"),
    caption: formData.get("caption"),
    artist: formData.get("artist"),
    date: formData.get("date"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    let dataToSave = {
      ...validatedFields.data,
      createdAt: serverTimestamp(),
      views: 0,
    };

    await addDoc(collection(db, "galeria"), dataToSave);

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");
    revalidatePath("/");

    return { success: true, message: "Imagem adicionada à Galeria com sucesso!" };
  } catch (error) {
    console.error("Error creating Gallery Item:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}

export async function updateGalleryItem(id: string, prevState: any, formData: FormData) {
  if (!id) {
    return { success: false, message: "ID é inválido." };
  }

  const validatedFields = GallerySchema.safeParse({
    imageUrl: formData.get("imageUrl"),
    caption: formData.get("caption"),
    artist: formData.get("artist"),
    date: formData.get("date"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const docRef = doc(db, "galeria", id);
    
    let dataToUpdate = {
      ...validatedFields.data,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, dataToUpdate);
    
    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");
    revalidatePath("/");

    return { success: true, message: "Imagem da Galeria atualizada com sucesso!" };

  } catch (error) {
    console.error("Error updating Gallery Item:", error);
    return { success: false, message: "Ocorreu um erro no servidor ao atualizar. Tente novamente." };
  }
}

export async function deleteGalleryItem(id: string) {
  if (!id) {
    return { success: false, message: "ID é inválido." };
  }

  try {
    const docRef = doc(db, "galeria", id);
    await deleteDoc(docRef);

    revalidatePath("/admin/galeria");
    revalidatePath("/galeria");
    revalidatePath("/");
    
    return { success: true, message: "Imagem deletada com sucesso!" };
  } catch (error) {
    console.error("Error deleting Gallery Item:", error);
    return { success: false, message: "Ocorreu um erro ao deletar." };
  }
}
