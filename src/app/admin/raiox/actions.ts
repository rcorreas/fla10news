
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";

const NewsSchema = z.object({
  mainCategory: z.string().min(1, { message: "A categoria principal é obrigatória." }),
  title: z.string().min(5, { message: "O título deve ter pelo menos 5 caracteres." }),
  excerpt: z.string().min(10, { message: "O subtítulo deve ter pelo menos 10 caracteres." }),
  category: z.string().min(3, { message: "A subcategoria (tag) deve ter pelo menos 3 caracteres." }),
  content: z.string().min(50, { message: "O conteúdo da matéria deve ter pelo menos 50 caracteres." }),
  image: z.string().url({ message: "Por favor, insira um link de imagem válido." }),
  imageCredit: z.string().optional(),
  image2: z.string().url({ message: "O link da imagem 2 deve ser uma URL válida." }).optional().or(z.literal('')),
  imageCredit2: z.string().optional(),
  fullArticleLink: z.string().url({ message: "Por favor, insira um link válido para a matéria completa." }).optional().or(z.literal('')),
  dataAiHint: z.string().optional(),
  author: z.string().optional(),
});

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export async function createRaioxArticle(prevState: any, formData: FormData) {
  const validatedFields = NewsSchema.safeParse({
    mainCategory: formData.get("mainCategory"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    content: formData.get("content"),
    image: formData.get("image"),
    imageCredit: formData.get("imageCredit"),
    image2: formData.get("image2"),
    imageCredit2: formData.get("imageCredit2"),
    fullArticleLink: formData.get("fullArticleLink"),
    dataAiHint: formData.get("dataAiHint"),
    author: formData.get("author"),
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

    const dataToSave = {
      ...validatedFields.data,
      author: validatedFields.data.author || 'Redação NRN',
      slug: slug,
      publishedAt: serverTimestamp(),
      views: 0,
    };

    await addDoc(collection(db, "raiox"), dataToSave);

    revalidatePath("/admin/raiox");
    revalidatePath("/");
    revalidatePath("/raio-x");
    revalidatePath(`/raio-x/${slug}`);

    return { success: true, message: "Notícia criada com sucesso!" };

  } catch (error) {
    console.error("Error creating news article:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}

export async function updateRaioxArticle(id: string, slug: string, prevState: any, formData: FormData) {
  if (!id) {
    return { success: false, message: "ID da matéria é inválido." };
  }

  const validatedFields = NewsSchema.safeParse({
    mainCategory: formData.get("mainCategory"),
    title: formData.get("title"),
    excerpt: formData.get("excerpt"),
    category: formData.get("category"),
    content: formData.get("content"),
    image: formData.get("image"),
    imageCredit: formData.get("imageCredit"),
    image2: formData.get("image2"),
    imageCredit2: formData.get("imageCredit2"),
    fullArticleLink: formData.get("fullArticleLink"),
    dataAiHint: formData.get("dataAiHint"),
    author: formData.get("author"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const newsDocRef = doc(db, "raiox", id);
    
    const dataToUpdate = {
      ...validatedFields.data,
      author: validatedFields.data.author || 'Redação NRN',
    };
    
    await updateDoc(newsDocRef, dataToUpdate);
    
    revalidatePath("/admin/raiox");
    revalidatePath("/");
    revalidatePath("/raio-x");
    revalidatePath(`/raio-x/${slug}`);

    return { success: true, message: "Notícia atualizada com sucesso!" };

  } catch (error) {
    console.error("Error updating news article:", error);
    return { success: false, message: "Ocorreu um erro no servidor ao atualizar. Tente novamente." };
  }
}

export async function deleteRaioxArticle(id: string) {
  if (!id) {
    return { success: false, message: "ID da matéria é inválido." };
  }

  try {
    const newsDocRef = doc(db, "raiox", id);
    await deleteDoc(newsDocRef);

    revalidatePath("/admin/raiox");
    revalidatePath("/");
    revalidatePath("/raio-x");
    
    return { success: true, message: "Notícia deletada com sucesso!" };
  } catch (error) {
    console.error("Error deleting news article:", error);
    return { success: false, message: "Ocorreu um erro ao deletar a notícia." };
  }
}
