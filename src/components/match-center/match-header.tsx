"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TeamCrest } from '@/components/team-crest';

interface MatchHeaderProps {
  match: any;
  h2h?: any;
}

export function MatchHeader({ match, h2h }: MatchHeaderProps) {
  if (!match) return null;

  const isHome = match.mando === 'casa';
  const flaScore = match.derivado?.gols?.flamengo ?? '-';
  const advScore = match.derivado?.gols?.adversario ?? '-';
  const data = match.inicioEm ? parseISO(match.inicioEm) : new Date(match.data);

  return (
    <Card 
      className="text-white shadow-lg border-2 border-white/10 overflow-hidden relative mb-6"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(12px)' }}
    >
      <CardContent className="pt-6 pb-6 relative z-10">
        
        {/* Info Topo */}
        <div className="flex justify-between items-center mb-6 text-sm text-zinc-300">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="font-semibold uppercase tracking-wider">{match.competicao?.nome || 'Competição'}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
              <Calendar className="w-3 h-3 text-primary" />
              <span>{format(data, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
            </div>
          </div>
        </div>

        {/* Placar e Escudos */}
        <div className="flex justify-between items-center px-4 md:px-12">
          {/* Time Mandante */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 md:w-28 md:h-28 relative mb-3 bg-white/5 rounded-full flex items-center justify-center p-4 border border-white/10 shadow-inner">
               <TeamCrest teamName={isHome ? 'Flamengo' : match.adversario?.nome} size="2xl" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-center tracking-tight">
              {isHome ? 'Flamengo' : match.adversario?.nome}
            </h2>
          </div>

          {/* Placar */}
          <div className="flex flex-col items-center justify-center px-4 md:px-8">
            <div className="flex items-center gap-4 text-5xl md:text-7xl font-black tabular-nums tracking-tighter drop-shadow-lg">
              <span className={flaScore > advScore && isHome ? 'text-primary' : (advScore > flaScore && !isHome ? 'text-primary' : 'text-white')}>
                {isHome ? flaScore : advScore}
              </span>
              <span className="text-zinc-600 text-3xl md:text-5xl font-light">-</span>
              <span className={advScore > flaScore && isHome ? 'text-primary' : (flaScore > advScore && !isHome ? 'text-primary' : 'text-white')}>
                {isHome ? advScore : flaScore}
              </span>
            </div>
            <Badge variant="outline" className="mt-4 bg-white/10 border-white/20 text-white font-semibold">
              {match.derivado?.resultado === 'V' ? 'Vitória do Flamengo' : match.derivado?.resultado === 'D' ? 'Vitória do Adversário' : match.derivado?.resultado === 'E' ? 'Empate' : 'Aguardando'}
            </Badge>
          </div>

          {/* Time Visitante */}
          <div className="flex flex-col items-center flex-1">
            <div className="w-20 h-20 md:w-28 md:h-28 relative mb-3 bg-white/5 rounded-full flex items-center justify-center p-4 border border-white/10 shadow-inner">
               <TeamCrest teamName={!isHome ? 'Flamengo' : match.adversario?.nome} size="2xl" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-center tracking-tight">
              {!isHome ? 'Flamengo' : match.adversario?.nome}
            </h2>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
