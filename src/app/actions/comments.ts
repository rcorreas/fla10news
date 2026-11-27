'use server';

import {
  exigirAdmin,
  exigirUsuarioAutenticado,
  SessaoInvalidaError,
} from '@/lib/autorizacao';
import { validateAndModerateComment } from '@/lib/comment-moderation';
import {
  buildArticleKey,
  getCommentsByArticleKey,
  getRecentCommentsAdmin,
  type CommentArticleType,
  type CommentItem,
} from '@/data/comments';
import { db, invalidateFirestoreCache, withTimeout } from '@/lib/firebase';
import { garantirSessaoServidor } from '@/lib/server-session';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore/lite';

const COOLDOWN_MS = 45_000; // 45s entre comentários do mesmo usuário (anti-flood)
const MAX_REPORTS_BEFORE_HIDE = 3;

const COLLECTION_BY_TYPE: Record<CommentArticleType, string> = {
  noticias: 'news',
  colunas: 'columns',
  reportagens: 'reportagens',
  'raio-x': 'raiox',
  tirinhas: 'tirinhas',
  'voz-torcedor': 'voz_torcedor',
  flahistoria: 'history',
  videos: 'videos',
};

async function adjustArticleCommentsCount(
  articleType: CommentArticleType,
  articleId: string,
  delta: number
): Promise<void> {
  const collectionName = COLLECTION_BY_TYPE[articleType];
  if (!collectionName || !articleId || delta === 0) return;
  try {
    await withTimeout(
      updateDoc(doc(db, collectionName, articleId), {
        commentsCount: increment(delta),
      })
    );
  } catch (err) {
    console.error(`Error updating commentsCount for ${collectionName}/${articleId}:`, err);
  }
}

const globalRateLimit = globalThis as unknown as {
  __fla10CommentCooldown?: Map<string, number>;
};

function getCooldownMap(): Map<string, number> {
  if (!globalRateLimit.__fla10CommentCooldown) {
    globalRateLimit.__fla10CommentCooldown = new Map();
  }
  return globalRateLimit.__fla10CommentCooldown;
}

export async function loadCommentsAction(
  articleType: CommentArticleType,
  articleId: string
): Promise<{ success: boolean; comments: CommentItem[]; message?: string }> {
  try {
    if (!articleId) return { success: true, comments: [] };
    const articleKey = buildArticleKey(articleType, articleId);
    const comments = await getCommentsByArticleKey(articleKey);
    return { success: true, comments };
  } catch (err) {
    console.error('Error loading comments:', err);
    return {
      success: false,
      comments: [],
      message: 'Não foi possível carregar os comentários agora.',
    };
  }
}

export async function createCommentAction(input: {
  articleType: CommentArticleType;
  articleId: string;
  articleSlug?: string;
  articleTitle?: string;
  text: string;
}): Promise<{ success: boolean; comment?: CommentItem; message: string }> {
  try {
    const user = await exigirUsuarioAutenticado();
    const moderation = validateAndModerateComment(input.text);
    if (!moderation.ok) {
      return { success: false, message: moderation.reason };
    }

    const cooldownMap = getCooldownMap();
    const lastAt = cooldownMap.get(user.uid) || 0;
    const now = Date.now();
    if (now - lastAt < COOLDOWN_MS) {
      const waitSec = Math.ceil((COOLDOWN_MS - (now - lastAt)) / 1000);
      return {
        success: false,
        message: `Aguarde ${waitSec}s antes de enviar outro comentário.`,
      };
    }

    const articleKey = buildArticleKey(input.articleType, input.articleId);

    // Bloqueia comentário duplicado recente do mesmo usuário na mesma matéria
    const existing = await getCommentsByArticleKey(articleKey);
    const normalizedNew = moderation.text.toLowerCase();
    const isDuplicate = existing.some(
      (c) => c.uid === user.uid && c.text.trim().toLowerCase() === normalizedNew
    );
    if (isDuplicate) {
      return {
        success: false,
        message: 'Você já enviou esse mesmo comentário nesta publicação.',
      };
    }

    await garantirSessaoServidor();
    const docData = {
      articleKey,
      articleType: input.articleType,
      articleId: input.articleId,
      articleSlug: input.articleSlug || '',
      articleTitle: input.articleTitle || '',
      uid: user.uid,
      authorName: user.authorName,
      authorPhoto: user.authorPhoto || '',
      text: moderation.text,
      createdAt: serverTimestamp(),
      likesCount: 0,
      likedBy: [],
      reportsCount: 0,
      reportedBy: [],
      status: 'approved',
    };

    const docRef = await withTimeout(addDoc(collection(db, 'comments'), docData));
    cooldownMap.set(user.uid, now);
    if (cooldownMap.size > 2000) cooldownMap.clear();

    await adjustArticleCommentsCount(input.articleType, input.articleId, 1);
    invalidateFirestoreCache(`comments:${articleKey}`);

    return {
      success: true,
      message: 'Comentário publicado com sucesso!',
      comment: {
        id: docRef.id,
        articleKey,
        articleType: input.articleType,
        articleId: input.articleId,
        articleSlug: input.articleSlug,
        articleTitle: input.articleTitle,
        uid: user.uid,
        authorName: user.authorName,
        authorPhoto: user.authorPhoto || undefined,
        text: moderation.text,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: [],
        reportsCount: 0,
        status: 'approved',
      },
    };
  } catch (err) {
    if (err instanceof SessaoInvalidaError) {
      return { success: false, message: err.message };
    }
    console.error('Error creating comment:', err);
    return {
      success: false,
      message: 'Erro ao publicar comentário. Tente novamente.',
    };
  }
}

export async function toggleCommentLikeAction(
  commentId: string,
  articleType: CommentArticleType,
  articleId: string
): Promise<{ success: boolean; liked?: boolean; likesCount?: number; message?: string }> {
  try {
    const user = await exigirUsuarioAutenticado();
    await garantirSessaoServidor();

    const docRef = doc(db, 'comments', commentId);
    const snap = await withTimeout(getDoc(docRef));
    if (!snap.exists()) {
      return { success: false, message: 'Comentário não encontrado.' };
    }

    const data = snap.data();
    const likedBy: string[] = Array.isArray(data.likedBy) ? data.likedBy : [];
    const alreadyLiked = likedBy.includes(user.uid);
    const currentCount = typeof data.likesCount === 'number' ? data.likesCount : likedBy.length;
    const nextCount = alreadyLiked ? Math.max(0, currentCount - 1) : currentCount + 1;

    await withTimeout(
      updateDoc(docRef, {
        likedBy: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likesCount: nextCount,
      })
    );

    const articleKey = buildArticleKey(articleType, articleId);
    invalidateFirestoreCache(`comments:${articleKey}`);

    return { success: true, liked: !alreadyLiked, likesCount: nextCount };
  } catch (err) {
    if (err instanceof SessaoInvalidaError) {
      return { success: false, message: err.message };
    }
    console.error('Error toggling comment like:', err);
    return { success: false, message: 'Não foi possível registrar a curtida.' };
  }
}

export async function reportCommentAction(
  commentId: string,
  articleType: CommentArticleType,
  articleId: string
): Promise<{ success: boolean; hidden?: boolean; message: string }> {
  try {
    const user = await exigirUsuarioAutenticado();
    await garantirSessaoServidor();

    const docRef = doc(db, 'comments', commentId);
    const snap = await withTimeout(getDoc(docRef));
    if (!snap.exists()) {
      return { success: false, message: 'Comentário não encontrado.' };
    }

    const data = snap.data();
    const reportedBy: string[] = Array.isArray(data.reportedBy) ? data.reportedBy : [];
    if (reportedBy.includes(user.uid)) {
      return { success: false, message: 'Você já denunciou este comentário.' };
    }

    const nextReports = (typeof data.reportsCount === 'number' ? data.reportsCount : reportedBy.length) + 1;
    const shouldHide = nextReports >= MAX_REPORTS_BEFORE_HIDE;

    await withTimeout(
      updateDoc(docRef, {
        reportedBy: arrayUnion(user.uid),
        reportsCount: increment(1),
        ...(shouldHide ? { status: 'hidden' } : {}),
      })
    );

    if (shouldHide && data.status !== 'hidden') {
      await adjustArticleCommentsCount(articleType, articleId, -1);
    }

    const articleKey = buildArticleKey(articleType, articleId);
    invalidateFirestoreCache(`comments:${articleKey}`);

    return {
      success: true,
      hidden: shouldHide,
      message: shouldHide
        ? 'Comentário ocultado automaticamente após denúncias para revisão.'
        : 'Denúncia registrada. Nossa moderação irá analisar.',
    };
  } catch (err) {
    if (err instanceof SessaoInvalidaError) {
      return { success: false, message: err.message };
    }
    console.error('Error reporting comment:', err);
    return { success: false, message: 'Erro ao denunciar comentário.' };
  }
}

export async function deleteCommentAction(
  commentId: string,
  articleType: CommentArticleType,
  articleId: string
): Promise<{ success: boolean; message: string }> {
  try {
    await exigirAdmin();
    await garantirSessaoServidor();

    const commentRef = doc(db, 'comments', commentId);
    const snap = await withTimeout(getDoc(commentRef));
    const wasApproved = snap.exists() && snap.data()?.status !== 'hidden';

    await withTimeout(deleteDoc(commentRef));
    if (wasApproved) {
      await adjustArticleCommentsCount(articleType, articleId, -1);
    }
    const articleKey = buildArticleKey(articleType, articleId);
    invalidateFirestoreCache(`comments:${articleKey}`);

    return { success: true, message: 'Comentário apagado.' };
  } catch (err) {
    if (err instanceof SessaoInvalidaError) {
      return { success: false, message: err.message };
    }
    console.error('Error deleting comment:', err);
    return { success: false, message: 'Erro ao apagar comentário.' };
  }
}

export async function listCommentsAdminAction(): Promise<{
  success: boolean;
  comments: CommentItem[];
  message?: string;
}> {
  try {
    await exigirAdmin();
    const comments = await getRecentCommentsAdmin(120);
    return { success: true, comments };
  } catch (err) {
    if (err instanceof SessaoInvalidaError) {
      return { success: false, comments: [], message: err.message };
    }
    console.error('Error listing admin comments:', err);
    return { success: false, comments: [], message: 'Erro ao carregar comentários.' };
  }
}

export async function setCommentStatusAdminAction(
  commentId: string,
  articleKey: string,
  status: 'approved' | 'hidden'
): Promise<{ success: boolean; message: string }> {
  try {
    await exigirAdmin();
    await garantirSessaoServidor();

    const commentRef = doc(db, 'comments', commentId);
    const snap = await withTimeout(getDoc(commentRef));
    const prevData = snap.exists() ? snap.data() : null;

    await withTimeout(updateDoc(commentRef, { status }));
    if (prevData && prevData.status !== status) {
      await adjustArticleCommentsCount(
        prevData.articleType,
        prevData.articleId,
        status === 'approved' ? 1 : -1
      );
    }
    invalidateFirestoreCache(`comments:${articleKey}`);

    return {
      success: true,
      message: status === 'approved' ? 'Comentário aprovado.' : 'Comentário ocultado.',
    };
  } catch (err) {
    if (err instanceof SessaoInvalidaError) {
      return { success: false, message: err.message };
    }
    console.error('Error updating comment status:', err);
    return { success: false, message: 'Erro ao atualizar status.' };
  }
}

export async function blockCommentAuthorAdminAction(
  uid: string,
  commentId: string,
  articleKey: string
): Promise<{ success: boolean; message: string }> {
  try {
    await exigirAdmin();
    await garantirSessaoServidor();

    const commentRef = doc(db, 'comments', commentId);
    const snap = await withTimeout(getDoc(commentRef));
    const prevData = snap.exists() ? snap.data() : null;

    await withTimeout(updateDoc(doc(db, 'users', uid), { isBlocked: true }));
    await withTimeout(updateDoc(commentRef, { status: 'hidden' }));
    if (prevData && prevData.status !== 'hidden') {
      await adjustArticleCommentsCount(prevData.articleType, prevData.articleId, -1);
    }
    invalidateFirestoreCache(`comments:${articleKey}`);

    return { success: true, message: 'Usuário bloqueado e comentário ocultado.' };
  } catch (err) {
    if (err instanceof SessaoInvalidaError) {
      return { success: false, message: err.message };
    }
    console.error('Error blocking comment author:', err);
    return { success: false, message: 'Erro ao bloquear usuário.' };
  }
}
