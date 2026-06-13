"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { slugify } from "@/lib/utils";

const AuthorSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  link: z.string().url({ message: "Por favor, insira um link válido." }).optional().or(z.literal('')),
  image: z.string().url({ message: "Por favor, insira um link de imagem válido." }).optional().or(z.literal('')),
  description: z.string().optional(),
});

export async function createAuthor(prevState: any, formData: FormData) {
  const validatedFields = AuthorSchema.safeParse({
    name: formData.get("name"),
    link: formData.get("link"),
    image: formData.get("image"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const slug = slugify(validatedFields.data.name);

    const dataToSave = {
      ...validatedFields.data,
      slug: slug,
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "authors"), dataToSave);

    revalidatePath("/admin/autores");
    revalidatePath("/quem-somos");
    revalidatePath(`/autor/${slug}`);
    revalidatePath(`/autores/${slug}`); // If used for columns too

    return { success: true, message: "Autor criado com sucesso!" };

  } catch (error) {
    console.error("Error creating author:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}

export async function updateAuthor(id: string, prevState: any, formData: FormData) {
  if (!id) {
    return { success: false, message: "ID do autor é inválido." };
  }

  const validatedFields = AuthorSchema.safeParse({
    name: formData.get("name"),
    link: formData.get("link"),
    image: formData.get("image"),
    description: formData.get("description"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const authorDocRef = doc(db, "authors", id);
    const slug = slugify(validatedFields.data.name);
    
    const dataToUpdate = {
      ...validatedFields.data,
      slug: slug,
    };
    
    await updateDoc(authorDocRef, dataToUpdate);
    
    revalidatePath("/admin/autores");
    revalidatePath("/quem-somos");
    revalidatePath(`/autor/${slug}`);
    revalidatePath(`/autores/${slug}`);

    return { success: true, message: "Autor atualizado com sucesso!" };

  } catch (error) {
    console.error("Error updating author:", error);
    return { success: false, message: "Ocorreu um erro no servidor ao atualizar. Tente novamente." };
  }
}

export async function deleteAuthor(id: string) {
  if (!id) {
    return { success: false, message: "ID do autor é inválido." };
  }

  try {
    const authorDocRef = doc(db, "authors", id);
    await deleteDoc(authorDocRef);

    revalidatePath("/admin/autores");
    revalidatePath("/quem-somos");
    
    return { success: true, message: "Autor deletado com sucesso!" };
  } catch (error) {
    console.error("Error deleting author:", error);
    return { success: false, message: "Ocorreu um erro ao deletar o autor." };
  }
}
