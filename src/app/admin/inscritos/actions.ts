
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore/lite";

const RoleSchema = z.enum(["user", "admin", "superadmin"]);

export async function updateUserRole(userId: string, newRole: 'user' | 'admin' | 'superadmin') {
  if (!userId) {
    return { success: false, message: "ID do usuário é inválido." };
  }

  const validatedRole = RoleSchema.safeParse(newRole);

  if (!validatedRole.success) {
    return { success: false, message: "Perfil inválido selecionado." };
  }

  try {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      role: validatedRole.data,
    });
    
    revalidatePath("/admin/inscritos");

    return { success: true, message: "Perfil do usuário atualizado com sucesso!" };

  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, message: "Ocorreu um erro no servidor ao atualizar o perfil." };
  }
}

export async function toggleUserBlockStatus(userId: string, isCurrentlyBlocked: boolean) {
    if (!userId) {
        return { success: false, message: "ID do usuário é inválido." };
    }

    try {
        const userDocRef = doc(db, "users", userId);
        await updateDoc(userDocRef, {
            isBlocked: !isCurrentlyBlocked
        });
        
        revalidatePath("/admin/inscritos");

        const action = isCurrentlyBlocked ? "desbloqueado" : "bloqueado";
        return { success: true, message: `Usuário ${action} com sucesso!` };

    } catch (error) {
        console.error("Error toggling user block status:", error);
        return { success: false, message: "Ocorreu um erro ao alterar o status do usuário." };
    }
}
