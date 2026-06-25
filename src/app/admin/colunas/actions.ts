
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

    if (dataToSave.columnName.trim() === 'Na Pena do Urubu') {
      dataToSave.columnImage = 'https://i.imgur.com/ICtiAp0.png';
    }

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
    
    // Note: We don't update the slug on edit to avoid breaking links.
    let dataToUpdate = {
      ...validatedFields.data,
    };

    if (dataToUpdate.columnName.trim() === 'Na Pena do Urubu') {
      dataToUpdate.columnImage = 'https://i.imgur.com/ICtiAp0.png';
    }
    
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
