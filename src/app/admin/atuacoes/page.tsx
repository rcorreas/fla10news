"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from 'next/link';
import { createMatchRating, deleteMatchRating, closeMatchRating } from "./actions";
import { getMatchRatings } from "@/data/match-ratings";
import type { MatchRating, MatchPlayer } from "@/types/match-ratings";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Icons
import { Loader2, Trash2, Lock, Plus, X } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const initialState: any = {
  success: false,
  message: "",
  errors: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...
        </>
      ) : (
        "Criar Partida"
      )}
    </Button>
  );
}

export default function AtuacoesAdminPage() {
  const [state, formAction] = useActionState(createMatchRating, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const [matches, setMatches] = useState<MatchRating[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Players State for the form
  const [players, setPlayers] = useState<MatchPlayer[]>([
    { id: '1', name: '', position: 'Goleiro', photoUrl: '', minutesPlayed: '90' }
  ]);

  const addPlayer = () => {
    setPlayers([...players, { id: Date.now().toString(), name: '', position: '', photoUrl: '', minutesPlayed: '90' }]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, field: keyof MatchPlayer, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const fetchMatches = async () => {
    setIsLoading(true);
    const m = await getMatchRatings();
    setMatches(m);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "Sucesso!", description: state.message });
        formRef.current?.reset();
        setPlayers([{ id: '1', name: '', position: 'Goleiro', photoUrl: '', minutesPlayed: '90' }]);
        fetchMatches();
      } else {
        let description = state.message;
        if (state.errors) {
            const errorMessages = Object.values(state.errors).flat().join(' ');
            description += ` ${errorMessages}`;
        }
        toast({ title: "Erro", description: description, variant: "destructive" });
      }
    }
  }, [state, toast]);

  const handleDelete = async (id: string) => {
    const result = await deleteMatchRating(id);
    if (result.success) {
      toast({ title: "Sucesso!", description: result.message });
      fetchMatches();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  const handleClose = async (id: string) => {
    const result = await closeMatchRating(id);
    if (result.success) {
      toast({ title: "Sucesso!", description: result.message });
      fetchMatches();
    } else {
      toast({ title: "Erro", description: result.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Nova Votação de Atuações</CardTitle>
          <CardDescription>Crie uma nova partida para a torcida avaliar.</CardDescription>
        </CardHeader>
        <form ref={formRef} action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="score">Placar (ex: Flamengo 2 x 0 Vasco)</Label>
                <Input id="score" name="score" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="competition">Competição</Label>
                <Input id="competition" name="competition" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attendanceAndStadium">Público e Estádio (opcional)</Label>
                <Input id="attendanceAndStadium" name="attendanceAndStadium" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coachName">Treinador do Flamengo</Label>
                <Input id="coachName" name="coachName" required />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tacticalSummary">Síntese Tática (2-3 linhas)</Label>
              <Textarea id="tacticalSummary" name="tacticalSummary" required />
            </div>

            <Separator />
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Jogadores que atuaram</h3>
                <Button type="button" variant="outline" size="sm" onClick={addPlayer}>
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Jogador
                </Button>
              </div>
              
              <div className="space-y-4">
                {players.map((player, index) => (
                  <div key={index} className="flex flex-wrap md:flex-nowrap items-end gap-2 p-4 border rounded-lg">
                    <div className="grid gap-2 flex-1">
                      <Label>Nome</Label>
                      <Input value={player.name} onChange={(e) => updatePlayer(index, 'name', e.target.value)} required />
                    </div>
                    <div className="grid gap-2 flex-1">
                      <Label>Posição</Label>
                      <Input value={player.position} onChange={(e) => updatePlayer(index, 'position', e.target.value)} required />
                    </div>
                    <div className="grid gap-2 flex-1">
                      <Label>Minutos/Situação</Label>
                      <Input value={player.minutesPlayed} onChange={(e) => updatePlayer(index, 'minutesPlayed', e.target.value)} required />
                    </div>
                    <div className="grid gap-2 flex-1">
                      <Label>Foto URL (opcional)</Label>
                      <Input value={player.photoUrl} onChange={(e) => updatePlayer(index, 'photoUrl', e.target.value)} />
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removePlayer(index)}>
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <input type="hidden" name="playersJson" value={JSON.stringify(players)} />
            </div>

          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Partidas Criadas</CardTitle>
          <CardDescription>Gerencie as votações existentes.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : matches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partida</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-medium">{match.header.score}</TableCell>
                    <TableCell>{format(match.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${match.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {match.status === 'open' ? 'Aberta' : 'Fechada'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={`/atuacoes/${match.id}`} target="_blank">Ver</Link>
                      </Button>
                      {match.status === 'open' && (
                        <Button variant="outline" size="sm" onClick={() => handleClose(match.id)}>
                          <Lock className="h-4 w-4 mr-2" /> Encerrar
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>Deletar esta partida apagará todos os votos.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => handleDelete(match.id)}>
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma partida criada ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
