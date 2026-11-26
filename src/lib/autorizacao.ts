import { cookies } from 'next/headers';

/**
 * Cookie de sessão do painel.
 *
 * O cliente grava o ID token do Firebase Auth aqui (ver `auth-context.tsx`)
 * sempre que o login muda ou o token é renovado. As server actions leem esse
 * cookie para confirmar **quem** está chamando antes de escrever com a conta de
 * serviço — sem isso qualquer visitante poderia invocar uma action do admin.
 */
export const COOKIE_SESSAO = 'rv_sessao';

const PAPEIS_ADMIN = new Set(['admin', 'superadmin']);
const VALIDADE_CACHE_MS = 60_000;
const LIMITE_CACHE = 500;

type Sessao = {
  uid: string;
  email: string | null;
  papel: string;
  authorName: string;
  authorPhoto: string | null;
};

const cache = new Map<string, Sessao & { expiraEm: number }>();

export class SessaoInvalidaError extends Error {
  constructor(mensagem: string) {
    super(mensagem);
    this.name = 'SessaoInvalidaError';
  }
}

const MENSAGEM_PADRAO =
  'Sessão administrativa inválida ou expirada. Recarregue a página e entre novamente.';

function apiKey(): string {
  const chave = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!chave) throw new SessaoInvalidaError('Firebase não configurado no servidor.');
  return chave;
}

function projeto(): string {
  const id = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!id) throw new SessaoInvalidaError('Firebase não configurado no servidor.');
  return id;
}

/**
 * Confirma o token no Identity Toolkit. Barato o suficiente para cachear por
 * um minuto: evita uma chamada externa a cada action.
 */
async function verificarToken(token: string): Promise<Sessao> {
  const resposta = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey()}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: token }),
      cache: 'no-store',
    },
  );

  if (!resposta.ok) throw new SessaoInvalidaError(MENSAGEM_PADRAO);

  const dados = (await resposta.json()) as {
    users?: {
      localId?: string;
      email?: string;
      displayName?: string;
      photoUrl?: string;
      disabled?: boolean;
    }[];
  };
  const conta = dados.users?.[0];
  if (!conta?.localId || conta.disabled) throw new SessaoInvalidaError(MENSAGEM_PADRAO);

  // O próprio usuário pode ler o seu documento em `users`; a regra garante isso.
  const consulta = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projeto()}/databases/(default)/documents/users/${conta.localId}?key=${apiKey()}`,
    {
      headers: { authorization: `Bearer ${token}` },
      cache: 'no-store',
    },
  );

  let papel = 'user';
  let authorName = conta.displayName || conta.email?.split('@')[0] || 'Torcedor Rubro-Negro';
  let authorPhoto: string | null = conta.photoUrl || null;

  if (consulta.ok) {
    const documento = (await consulta.json()) as {
      fields?: {
        role?: { stringValue?: string };
        isBlocked?: { booleanValue?: boolean };
        firstName?: { stringValue?: string };
        lastName?: { stringValue?: string };
        username?: { stringValue?: string };
        photoURL?: { stringValue?: string };
      };
    };

    if (documento.fields?.isBlocked?.booleanValue) {
      throw new SessaoInvalidaError('Esta conta está bloqueada.');
    }

    papel = documento.fields?.role?.stringValue ?? 'user';
    const fullName = [
      documento.fields?.firstName?.stringValue,
      documento.fields?.lastName?.stringValue,
    ]
      .filter(Boolean)
      .join(' ')
      .trim();

    authorName =
      fullName ||
      documento.fields?.username?.stringValue ||
      conta.displayName ||
      conta.email?.split('@')[0] ||
      'Torcedor Rubro-Negro';
    authorPhoto = documento.fields?.photoURL?.stringValue || conta.photoUrl || null;
  }

  return { uid: conta.localId, email: conta.email ?? null, papel, authorName, authorPhoto };
}

async function obterSessaoPorCookie(): Promise<Sessao> {
  const store = await cookies();
  const token = store.get(COOKIE_SESSAO)?.value?.trim();
  if (!token) throw new SessaoInvalidaError('Faça login para continuar.');

  const agora = Date.now();
  const cacheada = cache.get(token);
  if (cacheada && cacheada.expiraEm > agora) {
    return cacheada;
  }

  const sessao = await verificarToken(token);

  if (cache.size >= LIMITE_CACHE) cache.clear();
  cache.set(token, { ...sessao, expiraEm: agora + VALIDADE_CACHE_MS });

  return sessao;
}

/**
 * Exige qualquer usuário autenticado e não bloqueado (usado em comentários, likes e denúncias).
 */
export async function exigirUsuarioAutenticado(): Promise<Sessao> {
  return obterSessaoPorCookie();
}

/**
 * Exige um administrador autenticado. Deve ser a primeira linha de toda server
 * action do painel: sem isso, a action escreveria com a conta de serviço em nome
 * de qualquer visitante.
 */
export async function exigirAdmin(): Promise<{ uid: string; email: string | null }> {
  const sessao = await obterSessaoPorCookie();
  if (!PAPEIS_ADMIN.has(sessao.papel)) {
    throw new SessaoInvalidaError('Sua conta não tem permissão de administrador.');
  }
  return { uid: sessao.uid, email: sessao.email };
}
