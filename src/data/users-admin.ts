import { db } from '@/lib/firebase';
import { garantirSessaoServidor } from '@/lib/server-session';
import { collection, getDocs } from 'firebase/firestore/lite';

/**
 * Contagem de perfis cadastrados.
 *
 * A coleção `users` só pode ser lida pelo próprio usuário ou por um admin, então
 * a leitura do servidor usa a sessão de serviço do pipeline.
 */
export async function getUserCount(): Promise<number> {
  try {
    await garantirSessaoServidor();
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.size;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 0;
  }
}
