
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
    .normalize("NFD") // split an accented letter in the base letter and the acent
    .replace(/[\u0300-\u036f]/g, "") // remove all previously split accents
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export async function createNewsArticle(prevState: any, formData: FormData) {
  const validatedFields = NewsSchema.safeParse({
    mainCategory: formData.get("mainCategory")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    excerpt: formData.get("excerpt")?.toString() || "",
    category: formData.get("category")?.toString() || "",
    content: formData.get("content")?.toString() || "",
    image: formData.get("image")?.toString() || "",
    imageCredit: formData.get("imageCredit")?.toString() || undefined,
    image2: formData.get("image2")?.toString() || undefined,
    imageCredit2: formData.get("imageCredit2")?.toString() || undefined,
    fullArticleLink: formData.get("fullArticleLink")?.toString() || undefined,
    dataAiHint: formData.get("dataAiHint")?.toString() || undefined,
    author: formData.get("author")?.toString() || undefined,
    videoUrl: formData.get("videoUrl")?.toString() || undefined,
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
    
    // Processamento da data:
    let publishedDateStr = validatedFields.data.publishedAt;
    let publishedAtVal: any = serverTimestamp();
    if (publishedDateStr && publishedDateStr.trim() !== '') {
        publishedAtVal = new Date(`${publishedDateStr}-03:00`);
    }

    const dataToSave = {
      ...validatedFields.data,
      author: validatedFields.data.author || 'Redação NRN',
      slug: slug,
      publishedAt: publishedAtVal,
      views: 0,
      status: validatedFields.data.status || 'published',
    };

    await addDoc(collection(db, "news"), dataToSave);

    revalidatePath("/admin/materias");
    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${slug}`);

    return { success: true, message: "Notícia criada com sucesso!" };

  } catch (error) {
    console.error("Error creating news article:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}

export async function updateNewsArticle(id: string, slug: string, prevState: any, formData: FormData) {
  if (!id) {
    return { success: false, message: "ID da matéria é inválido." };
  }

  const validatedFields = NewsSchema.safeParse({
    mainCategory: formData.get("mainCategory")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    excerpt: formData.get("excerpt")?.toString() || "",
    category: formData.get("category")?.toString() || "",
    content: formData.get("content")?.toString() || "",
    image: formData.get("image")?.toString() || "",
    imageCredit: formData.get("imageCredit")?.toString() || undefined,
    image2: formData.get("image2")?.toString() || undefined,
    imageCredit2: formData.get("imageCredit2")?.toString() || undefined,
    fullArticleLink: formData.get("fullArticleLink")?.toString() || undefined,
    dataAiHint: formData.get("dataAiHint")?.toString() || undefined,
    author: formData.get("author")?.toString() || undefined,
    videoUrl: formData.get("videoUrl")?.toString() || undefined,
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
    const newsDocRef = doc(db, "news", id);
    
    let publishedDateStr = validatedFields.data.publishedAt;
    let publishedAtVal: any = undefined;
    if (publishedDateStr && publishedDateStr.trim() !== '') {
        publishedAtVal = new Date(`${publishedDateStr}-03:00`);
    }

    const dataToUpdate: any = {
      ...validatedFields.data,
      author: validatedFields.data.author || 'Redação NRN',
      status: validatedFields.data.status || 'published',
    };
    
    if (publishedAtVal) {
        dataToUpdate.publishedAt = publishedAtVal;
    }
    
    await updateDoc(newsDocRef, dataToUpdate);
    
    revalidatePath("/admin/materias");
    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${slug}`);

    return { success: true, message: "Notícia atualizada com sucesso!" };

  } catch (error) {
    console.error("Error updating news article:", error);
    return { success: false, message: "Ocorreu um erro no servidor ao atualizar. Tente novamente." };
  }
}

export async function deleteNewsArticle(id: string) {
  if (!id) {
    return { success: false, message: "ID da matéria é inválido." };
  }

  try {
    const newsDocRef = doc(db, "news", id);
    await deleteDoc(newsDocRef);

    revalidatePath("/admin/materias");
    revalidatePath("/");
    revalidatePath("/noticias");
    
    return { success: true, message: "Notícia deletada com sucesso!" };
  } catch (error) {
    console.error("Error deleting news article:", error);
    return { success: false, message: "Ocorreu um erro ao deletar a notícia." };
  }
}

export async function publishDraftAction(formData: FormData) {
  const id = formData.get("id") as string;
  const slug = formData.get("slug") as string;
  const publishedDateStr = formData.get("publishedAt") as string | null;
  if (!id) return;

  try {
    const newsDocRef = doc(db, "news", id);
    
    let publishedAtVal: any = serverTimestamp();
    if (publishedDateStr && publishedDateStr.trim() !== '') {
        publishedAtVal = new Date(`${publishedDateStr}-03:00`);
    }

    await updateDoc(newsDocRef, {
      status: 'published',
      publishedAt: publishedAtVal,
    });

    revalidatePath("/admin/materias");
    revalidatePath("/");
    revalidatePath("/noticias");
    revalidatePath(`/noticias/${slug}`);
  } catch (error) {
    console.error("Erro ao publicar rascunho:", error);
    return;
  }

  redirect(`/noticias/${slug}`);
}
