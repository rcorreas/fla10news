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
  videoUrl: z.string().url({ message: "Por favor, insira um link de vídeo válido." }).optional().or(z.literal('')),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  secondaryKeywords: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  publishedAt: z.string().optional(),
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
    videoUrl: formData.get("videoUrl"),
    metaTitle: formData.get("metaTitle")?.toString() || undefined,
    metaDescription: formData.get("metaDescription")?.toString() || undefined,
    focusKeyword: formData.get("focusKeyword")?.toString() || undefined,
    secondaryKeywords: formData.get("secondaryKeywords")?.toString() || undefined,
    status: formData.get("status")?.toString() || "published",
    publishedAt: formData.get("publishedAt")?.toString() || undefined,
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

    let publishedDateStr = validatedFields.data.publishedAt;
    let publishedAtVal: any = serverTimestamp();
    if (publishedDateStr && publishedDateStr.trim() !== '') {
        publishedAtVal = new Date(`${publishedDateStr}-03:00`);
    }

    const dataToSave: any = {
      ...validatedFields.data,
      slug: slug,
      publishedAt: publishedAtVal,
      views: 0,
      status: validatedFields.data.status || 'published',
    };

    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

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
    videoUrl: formData.get("videoUrl"),
    metaTitle: formData.get("metaTitle")?.toString() || undefined,
    metaDescription: formData.get("metaDescription")?.toString() || undefined,
    focusKeyword: formData.get("focusKeyword")?.toString() || undefined,
    secondaryKeywords: formData.get("secondaryKeywords")?.toString() || undefined,
    status: formData.get("status")?.toString() || "published",
    publishedAt: formData.get("publishedAt")?.toString() || undefined,
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
    
    let publishedDateStr = validatedFields.data.publishedAt;
    let publishedAtVal = undefined;
    if (publishedDateStr && publishedDateStr.trim() !== '') {
        publishedAtVal = new Date(`${publishedDateStr}-03:00`);
    }

    const dataToUpdate: any = {
      ...validatedFields.data,
    };

    if (publishedAtVal) {
        dataToUpdate.publishedAt = publishedAtVal;
    }

    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

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

export async function publishDraftActionVozTorcedor(formData: FormData) {
  const id = formData.get("id")?.toString();
  const slug = formData.get("slug")?.toString();
  const publishedDateStr = formData.get("publishedAt")?.toString();

  if (!id || !slug) return;

  try {
      const docRef = doc(db, "voz_torcedor", id);
      
      let publishedAtVal: any = serverTimestamp();
      if (publishedDateStr && publishedDateStr.trim() !== '') {
          publishedAtVal = new Date(`${publishedDateStr}-03:00`);
      }

      await updateDoc(docRef, {
          status: 'published',
          publishedAt: publishedAtVal
      });

      revalidatePath("/admin/voz-torcedor");
      revalidatePath("/voz-torcedor");
      revalidatePath(`/voz-torcedor/${slug}`);
      revalidatePath("/");
  } catch (error) {
      console.error("Error publishing Voz Torcedor draft", error);
  }
}
