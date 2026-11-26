'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  blockCommentAuthorAdminAction,
  deleteCommentAction,
  listCommentsAdminAction,
  setCommentStatusAdminAction,
} from '@/app/actions/comments';
import type { CommentItem } from '@/data/comments';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Ban, CheckCircle2, EyeOff, Loader2, Trash2, Trophy } from 'lucide-react';

export default function AdminComentariosPage() {
  const { toast } = useToast();
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadAll = async () => {
    setIsLoading(true);
    const res = await listCommentsAdminAction();
    if (res.success) {
      setComments(res.comments);
    } else if (res.message) {
      toast({
        title: 'Erro',
        description: res.message,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleStatus = async (comment: CommentItem) => {
    const nextStatus = comment.status === 'approved' ? 'hidden' : 'approved';
    setBusyId(comment.id);
    const res = await setCommentStatusAdminAction(comment.id, comment.articleKey, nextStatus);
    if (res.success) {
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: nextStatus } : c))
      );
      toast({ title: 'Atualizado', description: res.message });
    } else {
      toast({ title: 'Erro', description: res.message, variant: 'destructive' });
    }
    setBusyId(null);
  };

  const handleDelete = async (comment: CommentItem) => {
    setBusyId(comment.id);
    const res = await deleteCommentAction(comment.id, comment.articleType, comment.articleId);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== comment.id));
      toast({ title: 'Apagado', description: res.message });
    } else {
      toast({ title: 'Erro', description: res.message, variant: 'destructive' });
    }
    setBusyId(null);
  };

  const handleBlockUser = async (comment: CommentItem) => {
    setBusyId(comment.id);
    const res = await blockCommentAuthorAdminAction(comment.uid, comment.id, comment.articleKey);
    if (res.success) {
      setComments((prev) =>
        prev.map((c) => (c.id === comment.id ? { ...c, status: 'hidden' } : c))
      );
      toast({ title: 'Usuário bloqueado', description: res.message });
    } else {
      toast({ title: 'Erro', description: res.message, variant: 'destructive' });
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Gerenciar Comentários</CardTitle>
            <CardDescription>
              Modere comentários dos leitores, revise denúncias e bloqueie usuários abusivos.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={loadAll} disabled={isLoading}>
            Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum comentário registrado ainda.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Leitor</TableHead>
                  <TableHead>Comentário</TableHead>
                  <TableHead>Publicação</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Taças / Denúncias</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => {
                  const isBusy = busyId === comment.id;
                  return (
                    <TableRow key={comment.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {comment.authorName}
                      </TableCell>
                      <TableCell className="max-w-sm">
                        <p className="text-sm whitespace-pre-wrap break-words">{comment.text}</p>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                        [{comment.articleType}] {comment.articleTitle || comment.articleSlug || comment.articleId}
                      </TableCell>
                      <TableCell>
                        {comment.status === 'approved' ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Visível</Badge>
                        ) : (
                          <Badge variant="secondary">Oculto</Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        <span className="inline-flex items-center gap-1 mr-3">
                          <Trophy className="h-3.5 w-3.5 text-amber-500" />
                          {comment.likesCount}
                        </span>
                        <span className={comment.reportsCount > 0 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                          {comment.reportsCount} denúncia(s)
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs">
                        {format(new Date(comment.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          onClick={() => handleToggleStatus(comment)}
                          title={comment.status === 'approved' ? 'Ocultar' : 'Aprovar'}
                        >
                          {comment.status === 'approved' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          onClick={() => handleBlockUser(comment)}
                          title="Bloquear usuário"
                        >
                          <Ban className="h-4 w-4 text-amber-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isBusy}
                          onClick={() => handleDelete(comment)}
                          title="Apagar comentário"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
