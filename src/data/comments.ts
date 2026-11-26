import { db, cachedQuery, withTimeout } from '@/lib/firebase';
import { collection, getDocs, limit, orderBy, query, Timestamp, where } from 'firebase/firestore/lite';

export type CommentArticleType =
  | 'noticias'
  | 'colunas'
  | 'reportagens'
  | 'raio-x'
  | 'tirinhas'
  | 'voz-torcedor'
  | 'flahistoria'
  | 'videos';

export type CommentItem = {
  id: string;
  articleKey: string;
  articleType: CommentArticleType;
  articleId: string;
  articleSlug?: string;
  articleTitle?: string;
  uid: string;
  authorName: string;
  authorPhoto?: string;
  text: string;
  createdAt: string; // ISO string para serialização segura em Server Actions
  likesCount: number;
  likedBy: string[];
  reportsCount: number;
  status: 'approved' | 'hidden';
};

export function buildArticleKey(articleType: CommentArticleType, articleId: string): string {
  return `${articleType}:${articleId}`;
}

function fromFirestore(docSnap: any): CommentItem {
  const data = docSnap.data();
  const createdAtDate =
    data.createdAt instanceof Timestamp
      ? data.createdAt.toDate()
      : data.createdAt?.toDate
        ? data.createdAt.toDate()
        : new Date();

  return {
    id: docSnap.id,
    articleKey: data.articleKey || '',
    articleType: data.articleType || 'noticias',
    articleId: data.articleId || '',
    articleSlug: data.articleSlug,
    articleTitle: data.articleTitle,
    uid: data.uid || '',
    authorName: data.authorName || 'Torcedor Rubro-Negro',
    authorPhoto: data.authorPhoto || undefined,
    text: data.text || '',
    createdAt: createdAtDate.toISOString(),
    likesCount: typeof data.likesCount === 'number' ? data.likesCount : Array.isArray(data.likedBy) ? data.likedBy.length : 0,
    likedBy: Array.isArray(data.likedBy) ? data.likedBy : [],
    reportsCount: typeof data.reportsCount === 'number' ? data.reportsCount : 0,
    status: data.status === 'hidden' ? 'hidden' : 'approved',
  };
}

/**
 * Busca comentários aprovados de uma publicação.
 * Consulta por igualdade em `articleKey` (sem índice composto manual) e ordena em memória.
 */
export async function getCommentsByArticleKey(articleKey: string): Promise<CommentItem[]> {
  return cachedQuery(
    `comments:${articleKey}`,
    async () => {
      const q = query(
        collection(db, 'comments'),
        where('articleKey', '==', articleKey),
        limit(200)
      );
      const snapshot = await withTimeout(getDocs(q));
      if (snapshot.empty) return [];

      return snapshot.docs
        .map(fromFirestore)
        .filter((c) => c.status === 'approved')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    { ttlMs: 30_000 }
  );
}

/**
 * Lista os comentários mais recentes para o painel administrativo.
 */
export async function getRecentCommentsAdmin(maxItems = 100): Promise<CommentItem[]> {
  const q = query(
    collection(db, 'comments'),
    orderBy('createdAt', 'desc'),
    limit(maxItems)
  );
  const snapshot = await withTimeout(getDocs(q));
  if (snapshot.empty) return [];
  return snapshot.docs.map(fromFirestore);
}
