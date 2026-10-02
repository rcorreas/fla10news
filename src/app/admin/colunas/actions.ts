
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";

const ColumnSchema = z.object({
  columnName: z.string().min(3, { message: "O nome da coluna deve ter pelo menos 3 caracteres." }),
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  author: z.string().min(3, { message: "O nome do autor é obrigatório." }),
  authorImage: z.string().url({ message: "Por favor, insira um link de imagem válido para o autor." }),
  authorLink: z.string().url({ message: "Por favor, insira um link válido para o autor." }).optional().or(z.literal('')),
  authorDescription: z.string().optional(),
  columnImage: z.string().url({ message: "Por favor, insira um link válido para a imagem da coluna." }).optional().or(z.literal('')),
  excerpt: z.string().min(10, { message: "O resumo deve ter pelo menos 10 caracteres." }),
  category: z.string().min(3, { message: "A categoria deve ter pelo menos 3 caracteres." }),
  content: z.string().min(50, { message: "O conteúdo da coluna deve ter pelo menos 50 caracteres." }),
  dataAiHint: z.string().optional(),
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
    .replace(/[^\w-]+/g, '')
    .slice(0, 150);
}

export async function createColumn(prevState: any, formData: FormData) {
  const validatedFields = ColumnSchema.safeParse({
    columnName: formData.get("columnName"),
    title: formData.get("title"),
    author: formData.get("author"),
    authorImage: formData.get("authorImage"),
    authorLink: formData.get("authorLink"),
    authorDescription: formData.get("authorDescription"),
    columnImage: formData.get("columnImage"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    content: formData.get("content"),
    dataAiHint: formData.get("dataAiHint"),
    videoUrl: formData.get("videoUrl"),
    metaTitle: formData.get("metaTitle"),
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

    let dataToSave: any = {
      ...validatedFields.data,
      slug: slug,
      publishedAt: publishedAtVal,
      views: 0,
      status: validatedFields.data.status || 'published',
    };

    if (dataToSave.columnName.trim() === 'Na Pena do Urubu') {
      dataToSave.columnImage = 'https://i.imgur.com/ICtiAp0.png';
    }

    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);

    await addDoc(collection(db, "columns"), dataToSave);

    revalidatePath("/admin/colunas");
    revalidatePath("/colunas");
    revalidatePath(`/colunas/${slug}`);
    revalidatePath("/");

    return { success: true, message: "Coluna criada com sucesso!" };
  } catch (error) {
    console.error("Error creating column:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}

export async function updateColumn(id: string, slug: string, prevState: any, formData: FormData) {
  if (!id) {
    return { success: false, message: "ID da coluna é inválido." };
  }

  const validatedFields = ColumnSchema.safeParse({
    columnName: formData.get("columnName"),
    title: formData.get("title"),
    author: formData.get("author"),
    authorImage: formData.get("authorImage"),
    authorLink: formData.get("authorLink"),
    authorDescription: formData.get("authorDescription"),
    columnImage: formData.get("columnImage"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    content: formData.get("content"),
    dataAiHint: formData.get("dataAiHint"),
    videoUrl: formData.get("videoUrl"),
    metaTitle: formData.get("metaTitle"),
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
    const columnDocRef = doc(db, "columns", id);
    
    let publishedDateStr = validatedFields.data.publishedAt;
    let publishedAtVal = undefined;
    if (publishedDateStr && publishedDateStr.trim() !== '') {
        publishedAtVal = new Date(`${publishedDateStr}-03:00`);
    }

    // Note: We don't update the slug on edit to avoid breaking links.
    let dataToUpdate: any = {
      ...validatedFields.data,
    };

    if (publishedAtVal) {
        dataToUpdate.publishedAt = publishedAtVal;
    }

    if (dataToUpdate.columnName.trim() === 'Na Pena do Urubu') {
      dataToUpdate.columnImage = 'https://i.imgur.com/ICtiAp0.png';
    }
    
    Object.keys(dataToUpdate).forEach(key => dataToUpdate[key] === undefined && delete dataToUpdate[key]);

    await updateDoc(columnDocRef, dataToUpdate);
    
    revalidatePath("/admin/colunas");
    revalidatePath("/colunas");
    revalidatePath(`/colunas/${slug}`);
    revalidatePath("/");

    return { success: true, message: "Coluna atualizada com sucesso!" };

  } catch (error) {
    console.error("Error updating column:", error);
    return { success: false, message: "Ocorreu um erro no servidor ao atualizar. Tente novamente." };
  }
}

export async function deleteColumn(id: string) {
  if (!id) {
    return { success: false, message: "ID da coluna é inválido." };
  }

  try {
    const columnDocRef = doc(db, "columns", id);
    await deleteDoc(columnDocRef);

    revalidatePath("/admin/colunas");
    revalidatePath("/colunas");
    revalidatePath("/");
    
    return { success: true, message: "Coluna deletada com sucesso!" };
  } catch (error) {
    console.error("Error deleting column:", error);
    return { success: false, message: "Ocorreu um erro ao deletar a coluna." };
  }
}

export async function publishDraftActionColumn(formData: FormData) {
  const id = formData.get("id")?.toString();
  const slug = formData.get("slug")?.toString();
  const publishedDateStr = formData.get("publishedAt")?.toString();

  if (!id || !slug) return;

  try {
      const docRef = doc(db, "columns", id);
      
      let publishedAtVal: any = serverTimestamp();
      if (publishedDateStr && publishedDateStr.trim() !== '') {
          publishedAtVal = new Date(`${publishedDateStr}-03:00`);
      }

      await updateDoc(docRef, {
          status: 'published',
          publishedAt: publishedAtVal
      });

      revalidatePath("/admin/colunas");
      revalidatePath("/colunas");
      revalidatePath(`/colunas/${slug}`);
      revalidatePath("/");
  } catch (error) {
      console.error("Error publishing column draft", error);
  }
}
