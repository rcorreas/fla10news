import type { MatchRating } from '@/types/match-ratings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PartialResultsWidget({ match }: { match: MatchRating }) {
  const { results, players } = match;

  if (!results || Object.keys(results.players).length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-4">Ainda não há avaliações suficientes para esta partida.</p>
          <Button asChild>
            <Link href={`/atuacoes/${match.id}`}>Seja o primeiro a avaliar</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Encontrar o jogador com mais votos de Craque
  let topCraque = null;
  let maxCraqueVotes = 0;

  // Encontrar o jogador com mais votos de Bagre
  let topBagre = null;
  let maxBagreVotes = 0;

  // Ordenar jogadores por média de nota (Top 3)
  const playersWithAverages = players.map(p => {
    const res = results.players[p.id];
    if (res) {
      if (res.craqueVotes > maxCraqueVotes) {
        maxCraqueVotes = res.craqueVotes;
        topCraque = p;
      }
      if (res.bagreVotes > maxBagreVotes) {
        maxBagreVotes = res.bagreVotes;
        topBagre = p;
      }
    }
    return {
      ...p,
      average: res?.averageScore || 0,
      votes: res?.voteCount || 0
    };
  }).filter(p => p.votes > 0).sort((a, b) => b.average - a.average);

  const top3 = playersWithAverages.slice(0, 3);

  return (
    <Card className="bg-white overflow-hidden border-2 border-gray-100">
      <div className="bg-red-600 text-white p-4 text-center">
        <h3 className="font-black text-xl uppercase tracking-wide">Notas da Torcida</h3>
        <p className="text-sm opacity-90">{match.header.score}</p>
      </div>
      
      <CardContent className="p-0">
        <div className="p-6 space-y-6">
          
          <div>
            <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">Top 3 Jogadores</h4>
            <div className="space-y-4">
              {top3.map((p, index) => (
                <div key={p.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-sm">
                    {index + 1}º
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.votes} votos</p>
                  </div>
                  <div className="text-2xl font-black text-red-600">
                    {p.average.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-100">
              <Trophy className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
              <p className="text-xs font-bold text-yellow-700 uppercase mb-1">O Craque</p>
              <p className="font-bold text-gray-900 line-clamp-1">{topCraque ? topCraque.name : '-'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200">
              <AlertTriangle className="w-6 h-6 mx-auto text-gray-400 mb-2" />
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">O Bagre</p>
              <p className="font-bold text-gray-900 line-clamp-1">{topBagre ? topBagre.name : '-'}</p>
            </div>
          </div>

          <div className="pt-4 text-center">
             <Button asChild variant="outline" className="w-full">
                <Link href={`/atuacoes/${match.id}`}>Ver todas as notas</Link>
             </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
