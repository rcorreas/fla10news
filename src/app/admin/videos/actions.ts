
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";

const VideoSchema = z.object({
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  category: z.string().min(3, { message: "A categoria deve ter pelo menos 3 caracteres." }),
  duration: z.string().regex(/^\d{1,2}:\d{2}$/, { message: "A duração deve estar no formato MM:SS ou M:SS." }),
  image: z.preprocess((val) => typeof val === 'string' ? val.replace(/\[\/?img\]/gi, '').trim() : val, z.string().url({ message: "Por favor, insira um link de imagem válido." })),
  videoUrl: z.preprocess((val) => typeof val === 'string' ? val.replace(/\[\/?img\]/gi, '').trim() : val, z.string().url({ message: "Por favor, insira um link de vídeo válido." })).optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
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

export async function createVideo(prevState: any, formData: FormData) {
  const validatedFields = VideoSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    duration: formData.get("duration"),
    image: formData.get("image"),
    videoUrl: formData.get("videoUrl")?.toString() || undefined,
    dataAiHint: formData.get("dataAiHint")?.toString() || undefined,
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

    await addDoc(collection(db, "videos"), dataToSave);

    revalidatePath("/admin/videos");
    revalidatePath("/videos");
    revalidatePath(`/videos/${slug}`);
    revalidatePath("/");

    return { success: true, message: "Vídeo criado com sucesso!" };
  } catch (error) {
    console.error("Error creating video:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}

export async function updateVideo(id: string, slug: string, prevState: any, formData: FormData) {
  const validatedFields = VideoSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    duration: formData.get("duration"),
    image: formData.get("image"),
    videoUrl: formData.get("videoUrl")?.toString() || undefined,
    dataAiHint: formData.get("dataAiHint")?.toString() || undefined,
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
    const videoDocRef = doc(db, "videos", id);

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

    await updateDoc(videoDocRef, dataToUpdate);
    
    revalidatePath("/admin/videos");
    revalidatePath("/videos");
    revalidatePath(`/videos/${slug}`);
    revalidatePath("/");

    return { success: true, message: "Vídeo atualizado com sucesso!" };
  } catch (error) {
    console.error("Error updating video:", error);
    return { success: false, message: "Ocorreu um erro no servidor ao atualizar. Tente novamente." };
  }
}

export async function deleteVideo(id: string) {
  if (!id) {
    return { success: false, message: "ID do vídeo é inválido." };
  }

  try {
    await deleteDoc(doc(db, "videos", id));

    revalidatePath("/admin/videos");
    revalidatePath("/videos");
    revalidatePath("/");
    
    return { success: true, message: "Vídeo deletado com sucesso!" };
  } catch (error) {
    console.error("Error deleting video:", error);
    return { success: false, message: "Ocorreu um erro ao deletar o vídeo." };
  }
}

export async function publishDraftActionVideo(formData: FormData) {
  const id = formData.get("id")?.toString();
  const slug = formData.get("slug")?.toString();
  const publishedDateStr = formData.get("publishedAt")?.toString();

  if (!id || !slug) return;

  try {
      const docRef = doc(db, "videos", id);
      
      let publishedAtVal: any = serverTimestamp();
      if (publishedDateStr && publishedDateStr.trim() !== '') {
          publishedAtVal = new Date(`${publishedDateStr}-03:00`);
      }

      await updateDoc(docRef, {
          status: 'published',
          publishedAt: publishedAtVal
      });

      revalidatePath("/admin/videos");
      revalidatePath("/videos");
      revalidatePath(`/videos/${slug}`);
      revalidatePath("/");
  } catch (error) {
      console.error("Error publishing video draft", error);
  }
}
