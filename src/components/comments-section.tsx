'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { MAX_COMMENT_LENGTH } from '@/lib/comment-moderation';
import {
  createCommentAction,
  deleteCommentAction,
  loadCommentsAction,
  reportCommentAction,
  toggleCommentLikeAction,
} from '@/app/actions/comments';
import type { CommentArticleType, CommentItem } from '@/data/comments';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Flag,
  Loader2,
  LogIn,
  MessageSquare,
  Send,
  ShieldAlert,
  Trash2,
  Trophy,
  UserPlus,
} from 'lucide-react';

interface CommentsSectionProps {
  articleType: CommentArticleType;
  articleId: string;
  articleSlug?: string;
  articleTitle?: string;
}

const PAGE_SIZE = 10;

export function CommentsSection({
  articleType,
  articleId,
  articleSlug,
  articleTitle,
}: CommentsSectionProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isAdmin =
    userProfile?.role === 'admin' || userProfile?.role === 'superadmin';

  const handleOpenComments = async () => {
    setIsOpen(true);
    if (hasLoaded || isLoading) return;

    setIsLoading(true);
    const res = await loadCommentsAction(articleType, articleId);
    if (res.success) {
      setComments(res.comments);
      setHasLoaded(true);
    } else {
      toast({
        title: 'Erro',
        description: res.message || 'Não foi possível carregar os comentários.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  const ensureSessionCookie = async () => {
    const current = auth.currentUser;
    if (!current) return;
    const token = await current.getIdToken();
    const base = `path=/; samesite=lax${window.location.protocol === 'https:' ? '; secure' : ''}`;
    document.cookie = `rv_sessao=${token}; max-age=3300; ${base}`;
  };

  const handleGoogleLogin = async () => {
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      await ensureSessionCookie();
      toast({
        title: 'Login realizado!',
        description: 'Agora você já pode deixar seu comentário.',
      });
    } catch (err) {
      console.error('Google sign-in error:', err);
      toast({
        title: 'Erro no login',
        description: 'Não foi possível entrar com o Google. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    await ensureSessionCookie();
    const res = await createCommentAction({
      articleType,
      articleId,
      articleSlug,
      articleTitle,
      text,
    });

    if (res.success && res.comment) {
      setComments((prev) => [res.comment!, ...prev]);
      setText('');
      toast({
        title: 'Comentário publicado!',
        description: res.message,
      });
    } else {
      toast({
        title: 'Comentário não enviado',
        description: res.message,
        variant: 'destructive',
      });
    }
    setIsSubmitting(false);
  };

  const handleToggleLike = async (comment: CommentItem) => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Entre na sua conta para curtir comentários.',
      });
      return;
    }

    setBusyId(comment.id);
    await ensureSessionCookie();
    const res = await toggleCommentLikeAction(comment.id, articleType, articleId);
    if (res.success && typeof res.liked === 'boolean' && typeof res.likesCount === 'number') {
      setComments((prev) =>
        prev.map((item) => {
          if (item.id !== comment.id) return item;
          const nextLikedBy = res.liked
            ? Array.from(new Set([...item.likedBy, user.uid]))
            : item.likedBy.filter((id) => id !== user.uid);
          return {
            ...item,
            likedBy: nextLikedBy,
            likesCount: res.likesCount!,
          };
        })
      );
    } else if (res.message) {
      toast({
        title: 'Erro',
        description: res.message,
        variant: 'destructive',
      });
    }
    setBusyId(null);
  };

  const handleReport = async (comment: CommentItem) => {
    if (!user) {
      toast({
        title: 'Login necessário',
        description: 'Entre na sua conta para denunciar um comentário.',
      });
      return;
    }

    setBusyId(comment.id);
    await ensureSessionCookie();
    const res = await reportCommentAction(comment.id, articleType, articleId);
    if (res.success) {
      if (res.hidden) {
        setComments((prev) => prev.filter((item) => item.id !== comment.id));
      }
      toast({
        title: 'Denúncia registrada',
        description: res.message,
      });
    } else {
      toast({
        title: 'Aviso',
        description: res.message,
        variant: 'destructive',
      });
    }
    setBusyId(null);
  };

  const handleDelete = async (comment: CommentItem) => {
    if (!isAdmin) return;

    setBusyId(comment.id);
    await ensureSessionCookie();
    const res = await deleteCommentAction(comment.id, articleType, articleId);
    if (res.success) {
      setComments((prev) => prev.filter((item) => item.id !== comment.id));
      toast({
        title: 'Comentário apagado',
        description: res.message,
      });
    } else {
      toast({
        title: 'Erro',
        description: res.message,
        variant: 'destructive',
      });
    }
    setBusyId(null);
  };

  if (!isOpen) {
    return (
      <section id="comentarios" className="mt-10 pt-8 border-t flex flex-col items-center">
        <Button
          type="button"
          size="lg"
          onClick={handleOpenComments}
          className="gap-2 font-headline font-bold px-6"
        >
          <MessageSquare className="h-5 w-5" />
          Deixe seu comentário
        </Button>
      </section>
    );
  }

  const visibleComments = comments.slice(0, visibleCount);
  const remainingCount = comments.length - visibleComments.length;

  return (
    <section className="mt-10 pt-8 border-t" id="comentarios">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 font-headline text-2xl">
            <MessageSquare className="h-6 w-6 text-primary" />
            Comentários ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!user ? (
            <div className="rounded-lg border border-border bg-muted/40 p-5 text-center space-y-4">
              <p className="text-sm md:text-base font-medium">
                Faça login ou cadastre-se gratuitamente para comentar e interagir com a Nação Rubro-Negra.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isSigningIn}
                  className="gap-2"
                >
                  {isSigningIn ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogIn className="h-4 w-4" />
                  )}
                  Entrar com Google
                </Button>
                <Button variant="outline" asChild className="gap-2">
                  <Link href="/login">
                    <LogIn className="h-4 w-4" />
                    Entrar com E-mail
                  </Link>
                </Button>
                <Button variant="secondary" asChild className="gap-2">
                  <Link href="/register">
                    <UserPlus className="h-4 w-4" />
                    Criar Conta
                  </Link>
                </Button>
              </div>
            </div>
          ) : userProfile?.isBlocked ? (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 flex items-center gap-3 text-sm text-destructive">
              <ShieldAlert className="h-5 w-5 shrink-0" />
              <span>Sua conta está suspensa para comentários.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                placeholder="Escreva seu comentário respeitoso sobre a matéria..."
                maxLength={MAX_COMMENT_LENGTH}
                rows={3}
                disabled={isSubmitting}
                className="resize-none"
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Proibido links, propagandas, ofensas ou discurso de ódio. ({text.length}/{MAX_COMMENT_LENGTH})
                </p>
                <Button
                  type="submit"
                  disabled={isSubmitting || text.trim().length < 2}
                  className="gap-2 self-end sm:self-auto"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Publicar Comentário
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Carregando comentários...</span>
            </div>
          ) : visibleComments.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              Nenhum comentário ainda. Seja o primeiro a opinar!
            </p>
          ) : (
            <div className="space-y-4">
              {visibleComments.map((comment) => {
                const likedByMe = !!user && comment.likedBy.includes(user.uid);
                const isBusy = busyId === comment.id;
                const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                  locale: ptBR,
                });

                return (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-border p-4 bg-card space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.authorPhoto} alt={comment.authorName} />
                          <AvatarFallback>
                            {comment.authorName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate">{comment.authorName}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                      </div>

                      {isAdmin && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(comment)}
                          disabled={isBusy}
                          title="Apagar comentário (Admin)"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                      {comment.text}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLike(comment)}
                        disabled={isBusy}
                        className={`h-8 px-2.5 gap-1.5 text-xs ${
                          likedByMe
                            ? 'text-amber-500 font-bold bg-amber-500/10 hover:bg-amber-500/20'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                        title="Curtir comentário"
                      >
                        <Trophy className="h-4 w-4" />
                        <span>{comment.likesCount}</span>
                      </Button>

                      {user && user.uid !== comment.uid && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReport(comment)}
                          disabled={isBusy}
                          className="h-8 px-2 gap-1 text-xs text-muted-foreground hover:text-destructive"
                          title="Denunciar comentário"
                        >
                          <Flag className="h-3.5 w-3.5" />
                          <span>Denunciar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}

              {remainingCount > 0 && (
                <div className="flex justify-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  >
                    Carregar mais ({remainingCount})
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
