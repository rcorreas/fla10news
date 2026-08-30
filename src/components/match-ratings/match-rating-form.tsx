"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { MatchRating } from '@/types/match-ratings';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function MatchRatingForm({ match }: { match: MatchRating }) {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [playerRatings, setPlayerRatings] = useState<Record<string, number>>({});
  const [coachRating, setCoachRating] = useState<number>(5);
  const [craqueId, setCraqueId] = useState<string>('');
  const [bagreId, setBagreId] = useState<string>('');

  useEffect(() => {
    // Inicializar notas com 5 (médio)
    const initial: Record<string, number> = {};
    match.players.forEach(p => initial[p.id] = 5);
    setPlayerRatings(initial);
  }, [match]);

  useEffect(() => {
    if (user && match.id) {
      // Checar se já votou
      const checkVote = async () => {
        const voteRef = doc(db, 'match_ratings', match.id, 'user_votes', user.uid);
        const snap = await getDoc(voteRef);
        if (snap.exists()) {
          setHasVoted(true);
        }
      };
      checkVote();
    }
  }, [user, match.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({ title: 'Atenção', description: 'Você precisa estar logado para votar.', variant: 'destructive' });
      return;
    }

    if (!craqueId || !bagreId) {
      toast({ title: 'Atenção', description: 'Por favor, escolha o Craque e o Bagre do jogo.', variant: 'destructive' });
      return;
    }

    if (craqueId === bagreId) {
      toast({ title: 'Atenção', description: 'O Craque e o Bagre não podem ser o mesmo jogador.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const voteRef = doc(db, 'match_ratings', match.id, 'user_votes', user.uid);
      await setDoc(voteRef, {
        userId: user.uid,
        matchId: match.id,
        createdAt: serverTimestamp(),
        playerRatings,
        coachRating,
        craqueId,
        bagreId
      });

      setHasVoted(true);
      toast({ title: 'Sucesso', description: 'Seu voto foi registrado com sucesso!' });
      
      // Opcional: A gente poderia disparar uma Cloud Function aqui ou deixar um trigger cuidar de agregar.
      
    } catch (error) {
      console.error(error);
      toast({ title: 'Erro', description: 'Ocorreu um erro ao salvar seu voto.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8" /></div>;

  if (match.status === 'closed') {
    return (
      <div className="bg-gray-100 p-8 rounded-lg text-center">
        <h3 className="text-xl font-bold text-gray-800 mb-2">Votação Encerrada</h3>
        <p className="text-gray-600">A avaliação para esta partida já foi finalizada.</p>
        {/* Aqui poderia entrar o PartialResultsWidget mais tarde */}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 p-8 rounded-lg text-center border border-red-200">
        <h3 className="text-xl font-bold text-red-800 mb-2">Avalie os Jogadores</h3>
        <p className="text-red-600 mb-4">Você precisa estar logado para dar suas notas.</p>
        <Button onClick={() => window.location.href = '/entrar'}>Fazer Login</Button>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <div className="bg-green-50 p-8 rounded-lg text-center border border-green-200">
        <h3 className="text-xl font-bold text-green-800 mb-2">Voto Registrado!</h3>
        <p className="text-green-600">Obrigado por avaliar a atuação do Flamengo nesta partida.</p>
        {/* Aqui poderia entrar o PartialResultsWidget mais tarde */}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid gap-6">
        {match.players.map((player) => (
          <Card key={player.id}>
            <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-4 w-full sm:w-1/3">
                {player.photoUrl ? (
                  <img src={player.photoUrl} alt={player.name} className="w-16 h-16 rounded-full object-cover bg-gray-200" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                    {player.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-lg">{player.name}</h4>
                  <p className="text-sm text-gray-500">{player.position} • {player.minutesPlayed}</p>
                </div>
              </div>
              
              <div className="flex-1 w-full flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500 w-8">0</span>
                <Slider 
                  value={[playerRatings[player.id] || 5]} 
                  onValueChange={(val) => setPlayerRatings(prev => ({ ...prev, [player.id]: val[0] }))}
                  max={10} 
                  step={0.5} 
                  className="flex-1"
                />
                <span className="text-sm font-medium text-gray-500 w-8 text-right">10</span>
              </div>
              
              <div className="w-full sm:w-24 text-center">
                <span className="text-3xl font-black text-red-600">
                  {(playerRatings[player.id] || 5).toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="my-8">
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/3">
              <h4 className="font-bold text-lg">{match.coach.name}</h4>
              <p className="text-sm text-gray-500">Treinador</p>
            </div>
            <div className="flex-1 w-full flex items-center gap-4">
              <span className="text-sm font-medium text-gray-500 w-8">0</span>
              <Slider 
                value={[coachRating]} 
                onValueChange={(val) => setCoachRating(val[0])}
                max={10} 
                step={0.5} 
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-500 w-8 text-right">10</span>
            </div>
            <div className="w-full sm:w-24 text-center">
              <span className="text-3xl font-black text-red-600">{coachRating.toFixed(1)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
        <div className="space-y-2">
          <label className="font-bold text-lg flex items-center gap-2">
            👑 O Craque
          </label>
          <p className="text-sm text-gray-500 mb-2">Quem foi o melhor em campo?</p>
          <Select value={craqueId} onValueChange={setCraqueId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione um jogador" />
            </SelectTrigger>
            <SelectContent>
              {match.players.map(p => (
                <SelectItem key={`c-${p.id}`} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="font-bold text-lg flex items-center gap-2">
            ⚠️ O Bagre
          </label>
          <p className="text-sm text-gray-500 mb-2">Quem foi o pior em campo?</p>
          <Select value={bagreId} onValueChange={setBagreId}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Selecione um jogador" />
            </SelectTrigger>
            <SelectContent>
              {match.players.map(p => (
                <SelectItem key={`b-${p.id}`} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? (
             <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Salvando votos...</>
          ) : (
            'Enviar Minhas Notas'
          )}
        </Button>
      </div>
    </form>
  );
}
