"use server";

import { z } from 'zod';
import { db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { nextGame as gameSchema } from '@/data/next-game';
import { revalidatePath } from 'next/cache';

type NextGameData = typeof gameSchema;

const NextGameSchema = z.object({
    home: z.string().min(1, "Time da casa é obrigatório"),
    away: z.string().min(1, "Time visitante é obrigatório"),
    competition: z.string().min(1, "Competição é obrigatória"),
    date: z.string().min(1, "Data é obrigatória"),
    time: z.string().min(1, "Hora é obrigatória"),
});

export async function updateNextGame(data: NextGameData) {
    const validatedFields = NextGameSchema.safeParse(data);

    if (!validatedFields.success) {
        const firstError = Object.values(validatedFields.error.flatten().fieldErrors)[0]?.[0];
        return {
            success: false,
            message: firstError || "Ocorreu um erro de validação.",
        };
    }

    try {
        const configDocRef = doc(db, 'siteConfig', 'nextGame');
        await setDoc(configDocRef, validatedFields.data, { merge: true });

        // Revalida a página principal e o layout para atualizar o banner do próximo jogo
        revalidatePath('/', 'layout');

        return {
            success: true,
            message: "Informações do próximo jogo foram atualizadas com sucesso!",
        }

    } catch (error) {
        console.error("Error updating next game:", error);
        return {
            success: false,
            message: "Ocorreu um erro ao salvar as informações. Tente novamente."
        }
    }
}
