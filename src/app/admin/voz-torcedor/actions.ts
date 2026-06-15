"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";

const VozTorcedorSchema = z.object({
  authorName: z.string().min(3, { message: "O nome do torcedor é obrigatório." }),
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  summary: z.string().min(10, { message: "O resumo deve ter pelo menos 10 caracteres." }),
  content: z.string().min(10, { message: "O conteúdo deve ter pelo menos 10 caracteres." }),
  image: z.string().url({ message: "Por favor, insira um link válido para a imagem." }).optional().or(z.literal('')),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export async function createVozTorcedor(prevState: any, formData: FormData) {
  const validatedFields = VozTorcedorSchema.safeParse({
    authorName: formData.get("authorName"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const slug = generateSlug(validatedFields.data.title);

    let dataToSave = {
      ...validatedFields.data,
      slug: slug,
      publishedAt: serverTimestamp(),
      views: 0,
    };

    await addDoc(collection(db, "voz_torcedor"), dataToSave);

    revalidatePath("/admin/voz-torcedor");
    revalidatePath("/voz-torcedor");
    revalidatePath(`/voz-torcedor/${slug}`);
    revalidatePath("/");

    return { success: true, message: "A Voz do Torcedor criada com sucesso!" };
  } catch (error) {
    console.error("Error creating Voz do Torcedor:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}

export async function updateVozTorcedor(id: string, slug: string, prevState: any, formData: FormData) {
  if (!id) {
    return { success: false, message: "ID é inválido." };
  }

  const validatedFields = VozTorcedorSchema.safeParse({
    authorName: formData.get("authorName"),
    title: formData.get("title"),
    summary: formData.get("summary"),
    content: formData.get("content"),
    image: formData.get("image"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const docRef = doc(db, "voz_torcedor", id);
    
    let dataToUpdate = {
      ...validatedFields.data,
    };

    await updateDoc(docRef, dataToUpdate);
    
    revalidatePath("/admin/voz-torcedor");
    revalidatePath("/voz-torcedor");
    revalidatePath(`/voz-torcedor/${slug}`);
    revalidatePath("/");

    return { success: true, message: "A Voz do Torcedor atualizada com sucesso!" };

  } catch (error) {
    console.error("Error updating Voz do Torcedor:", error);
    return { success: false, message: "Ocorreu um erro no servidor ao atualizar. Tente novamente." };
  }
}

export async function deleteVozTorcedor(id: string) {
  if (!id) {
    return { success: false, message: "ID é inválido." };
  }

  try {
    const docRef = doc(db, "voz_torcedor", id);
    await deleteDoc(docRef);

    revalidatePath("/admin/voz-torcedor");
    revalidatePath("/voz-torcedor");
    revalidatePath("/");
    
    return { success: true, message: "A Voz do Torcedor deletada com sucesso!" };
  } catch (error) {
    console.error("Error deleting Voz do Torcedor:", error);
    return { success: false, message: "Ocorreu um erro ao deletar." };
  }
}
