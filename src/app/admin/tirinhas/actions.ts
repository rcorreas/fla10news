"use server";

import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export async function createTirinha(prevState: any, formData: FormData) {
  try {
    const title = formData.get("title") as string;
    const slugRaw = formData.get("slug") as string;
    const slug = slugify(slugRaw);
    const imageHome = formData.get("imageHome") as string;
    const image = formData.get("image") as string;
    const description = formData.get("description") as string;

    const novaTirinha = {
      title,
      slug,
      imageHome,
      image,
      description: description || null,
      publishedAt: new Date(),
      views: 0,
      dataAiHint: 'cartoon',
    };

    await addDoc(collection(db, "tirinhas"), novaTirinha);

    revalidatePath("/admin/tirinhas");
    revalidatePath("/tirinhas");
    revalidatePath("/");
    
    return {
      success: true,
      message: "Tirinha publicada com sucesso!",
    };
  } catch (error: any) {
    console.error("Erro ao criar tirinha:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao tentar criar a tirinha.",
    };
  }
}

export async function updateTirinha(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const slugRaw = formData.get("slug") as string;
    const slug = slugify(slugRaw);
    const imageHome = formData.get("imageHome") as string;
    const image = formData.get("image") as string;
    const description = formData.get("description") as string;

    const tirinhaDoc = doc(db, "tirinhas", id);
    
    await updateDoc(tirinhaDoc, {
      title,
      slug,
      imageHome,
      image,
      description: description || null,
    });

    revalidatePath("/admin/tirinhas");
    revalidatePath("/tirinhas");
    revalidatePath(`/tirinhas/${slug}`);
    revalidatePath("/");

    return {
      success: true,
      message: "Tirinha atualizada com sucesso!",
    };
  } catch (error: any) {
    console.error("Erro ao atualizar tirinha:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao tentar atualizar a tirinha.",
    };
  }
}

export async function deleteTirinha(id: string) {
  try {
    const tirinhaDoc = doc(db, "tirinhas", id);
    await deleteDoc(tirinhaDoc);
    
    revalidatePath("/admin/tirinhas");
    revalidatePath("/tirinhas");
    revalidatePath("/");

    return {
      success: true,
      message: "Tirinha deletada com sucesso!",
    };
  } catch (error: any) {
    console.error("Erro ao deletar tirinha:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao tentar deletar a tirinha.",
    };
  }
}
