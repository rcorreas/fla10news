import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

/**
 * Sessão de serviço para escritas no Firestore.
 *
 * As regras restritas exigem um usuário com papel `admin`/`superadmin`. O
 * servidor entra com a conta do pipeline (`PIPELINE_EMAIL`/`PIPELINE_PASSWORD`)
 * uma única vez por instância; o SDK renova o ID token sozinho.
 *
 * O login é preguiçoso: páginas e rotas só autenticam quando vão escrever.
 */
let sessao: Promise<void> | null = null;

export async function garantirSessaoServidor(): Promise<void> {
  if (auth.currentUser) return;

  const email = process.env.PIPELINE_EMAIL;
  const senha = process.env.PIPELINE_PASSWORD;
  if (!email || !senha) {
    throw new Error(
      'PIPELINE_EMAIL/PIPELINE_PASSWORD não configurados: o Firestore recusaria a escrita.',
    );
  }

  if (!sessao) {
    sessao = signInWithEmailAndPassword(auth, email, senha)
      .then(() => undefined)
      .catch((err) => {
        sessao = null;
        throw err;
      });
  }

  await sessao;
}
