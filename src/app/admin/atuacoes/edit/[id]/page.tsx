"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { updateMatchRating } from "../../actions";
import { getMatchRatingById } from "@/data/match-ratings";
import type { MatchRating, MatchPlayer } from "@/types/match-ratings";
import flamengoPlayers from "@/data/flamengo_players.json";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
        </>
      ) : (
        "Salvar Alterações"
      )}
    </Button>
  );
}

export default function EditAtuacaoPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  
  const updateWithId = updateMatchRating.bind(null, id);
  const [state, formAction] = useActionState(updateWithId, initialState);
  const { toast } = useToast();
  
  const [match, setMatch] = useState<MatchRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [players, setPlayers] = useState<MatchPlayer[]>([]);

  useEffect(() => {
    const fetchMatch = async () => {
      setIsLoading(true);
      const m = await getMatchRatingById(id);
      if (m) {
        setMatch(m);
        setPlayers(m.players || []);
      }
      setIsLoading(false);
    };
    fetchMatch();
  }, [id]);

  useEffect(() => {
    if (state.message) {
      if (state.success) {
        toast({ title: "Sucesso!", description: state.message });
        router.push("/admin/atuacoes");
      } else {
        let description = state.message;
        if (state.errors) {
            const errorMessages = Object.values(state.errors).flat().join(' ');
            description += ` ${errorMessages}`;
        }
        toast({ title: "Erro", description: description, variant: "destructive" });
      }
    }
  }, [state, toast, router]);

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

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  if (!match) {
    return <div className="text-center p-8">Partida não encontrada.</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/atuacoes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Editar Votação</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Partida: {match.header.score}</CardTitle>
          <CardDescription>Modifique os dados da partida e jogadores atuantes.</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="grid gap-2">
                <Label htmlFor="score">Placar</Label>
                <Input id="score" name="score" defaultValue={match.header.score} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="competition">Competição</Label>
                <Input id="competition" name="competition" defaultValue={match.header.competition} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="attendanceAndStadium">Público e Estádio</Label>
                <Input id="attendanceAndStadium" name="attendanceAndStadium" defaultValue={match.header.attendanceAndStadium} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coachName">Treinador do Flamengo</Label>
                <Input id="coachName" name="coachName" defaultValue={match.coach.name} required />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="tacticalSummary">Síntese Tática</Label>
              <Textarea id="tacticalSummary" name="tacticalSummary" defaultValue={match.header.tacticalSummary} required />
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
                    <div className="grid gap-2 flex-1 min-w-[200px]">
                      <Label>Jogador</Label>
                      <Select 
                        value={player.name} 
                        onValueChange={(val) => {
                          const p = flamengoPlayers.find(x => x.name === val);
                          if (p) {
                            const newPlayers = [...players];
                            newPlayers[index] = { 
                              ...newPlayers[index], 
                              name: p.name, 
                              position: p.position, 
                              photoUrl: p.photo 
                            };
                            setPlayers(newPlayers);
                          } else {
                            updatePlayer(index, 'name', val);
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Selecione um jogador" />
                        </SelectTrigger>
                        <SelectContent>
                          {flamengoPlayers.map(p => (
                            <SelectItem key={p.name} value={p.name}>{p.position} - {p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
    </div>
  );
}
