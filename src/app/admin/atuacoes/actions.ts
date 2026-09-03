"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";

const MatchRatingSchema = z.object({
  score: z.string().min(1, { message: "Placar é obrigatório" }),
  competition: z.string().min(1, { message: "Competição é obrigatória" }),
  attendanceAndStadium: z.string().optional(),
  tacticalSummary: z.string().min(10, { message: "Síntese tática deve ter pelo menos 10 caracteres" }),
  playersJson: z.string().min(2, { message: "Jogadores são obrigatórios" }),
  coachName: z.string().min(2, { message: "Nome do treinador é obrigatório" }),
});

export async function createMatchRating(prevState: any, formData: FormData) {
  const validatedFields = MatchRatingSchema.safeParse({
    score: formData.get("score"),
    competition: formData.get("competition"),
    attendanceAndStadium: formData.get("attendanceAndStadium"),
    tacticalSummary: formData.get("tacticalSummary"),
    playersJson: formData.get("playersJson"),
    coachName: formData.get("coachName"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    let players = [];
    try {
      players = JSON.parse(validatedFields.data.playersJson);
    } catch (e) {
      return { success: false, message: "Erro ao interpretar jogadores" };
    }

    const dataToSave = {
      status: 'open',
      createdAt: serverTimestamp(),
      header: {
        score: validatedFields.data.score,
        competition: validatedFields.data.competition,
        attendanceAndStadium: validatedFields.data.attendanceAndStadium || '',
        tacticalSummary: validatedFields.data.tacticalSummary,
      },
      players: players,
      coach: {
        id: 'coach-1',
        name: validatedFields.data.coachName,
      },
      results: {
        players: {},
        coach: { averageScore: 0, voteCount: 0 }
      }
    };

    await addDoc(collection(db, "match_ratings"), dataToSave);

    revalidatePath("/admin/atuacoes");
    revalidatePath("/atuacoes");

    return { success: true, message: "Partida criada com sucesso!" };

  } catch (error) {
    console.error("Error creating match rating:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}

export async function closeMatchRating(id: string) {
  if (!id) return { success: false, message: "ID inválido." };
  try {
    const docRef = doc(db, "match_ratings", id);
    await updateDoc(docRef, { status: 'closed' });
    revalidatePath("/admin/atuacoes");
    revalidatePath(`/atuacoes/${id}`);
    return { success: true, message: "Votação encerrada!" };
  } catch (error) {
    return { success: false, message: "Erro ao encerrar." };
  }
}

export async function deleteMatchRating(id: string) {
  if (!id) return { success: false, message: "ID inválido." };
  try {
    const docRef = doc(db, "match_ratings", id);
    await deleteDoc(docRef);
    revalidatePath("/admin/atuacoes");
    revalidatePath("/atuacoes");
    return { success: true, message: "Partida excluída!" };
  } catch (error) {
    return { success: false, message: "Erro ao excluir." };
  }
}

export async function updateMatchRating(id: string, prevState: any, formData: FormData) {
  const validatedFields = MatchRatingSchema.safeParse({
    score: formData.get("score"),
    competition: formData.get("competition"),
    attendanceAndStadium: formData.get("attendanceAndStadium"),
    tacticalSummary: formData.get("tacticalSummary"),
    playersJson: formData.get("playersJson"),
    coachName: formData.get("coachName"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Erro de validação. Verifique os campos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    let players = [];
    try {
      players = JSON.parse(validatedFields.data.playersJson);
    } catch (e) {
      return { success: false, message: "Erro ao interpretar jogadores" };
    }

    const docRef = doc(db, "match_ratings", id);
    
    await updateDoc(docRef, {
      "header.score": validatedFields.data.score,
      "header.competition": validatedFields.data.competition,
      "header.attendanceAndStadium": validatedFields.data.attendanceAndStadium || '',
      "header.tacticalSummary": validatedFields.data.tacticalSummary,
      "coach.name": validatedFields.data.coachName,
      players: players,
    });

    revalidatePath("/admin/atuacoes");
    revalidatePath(`/atuacoes/${id}`);

    return { success: true, message: "Partida atualizada com sucesso!" };

  } catch (error) {
    console.error("Error updating match rating:", error);
    return { success: false, message: "Ocorreu um erro no servidor. Tente novamente." };
  }
}
