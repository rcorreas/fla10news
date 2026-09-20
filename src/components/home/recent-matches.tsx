import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamCrest } from '@/components/team-crest';
import { ChevronRight, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function RecentMatchesWidget({ matches }: { matches: any[] }) {
  if (!matches || matches.length === 0) return null;

  return (
    <Card 
      className="text-white shadow-lg border-2 border-white/10 overflow-hidden relative transition-all duration-300 hover:shadow-primary/20"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.65)', 
        backdropFilter: 'blur(12px)' 
      }}
    >
      <CardHeader className="pb-3 border-b border-white/10 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-white">
            Últimos Resultados
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="flex flex-col divide-y divide-white/10">
          {matches.map((match, index) => {
            const isHome = match.mando === 'casa';
            const flaScore = match.derivado?.gols?.flamengo ?? '-';
            const advScore = match.derivado?.gols?.adversario ?? '-';
            const data = match.inicioEm ? parseISO(match.inicioEm) : new Date(match.data);
            const eventId = match.flashscore?.id || match.eventId || match.id;
            const matchLink = `/partida/${eventId}`;

            return (
              <Link key={eventId || index} href={matchLink} className="group block p-4 hover:bg-white/5 transition-colors relative">
                
                {/* Data e Competição */}
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-semibold uppercase mb-3">
                  <span className="truncate max-w-[60%]">{match.competicao?.nome || 'Competição'}</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-primary" />
                    <span>{format(data, "dd/MM", { locale: ptBR })}</span>
                  </div>
                </div>

                {/* Placar e Escudos */}
                <div className="flex items-center justify-between">
                  {/* Mandante */}
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <span className={`font-bold text-sm truncate ${isHome ? 'text-white' : 'text-zinc-300'}`}>
                      {isHome ? 'Flamengo' : match.adversario?.nome}
                    </span>
                    <div className="w-8 h-8 flex-shrink-0 bg-white/5 rounded-full p-1 border border-white/10">
                      <TeamCrest teamName={isHome ? 'Flamengo' : match.adversario?.nome} size="sm" />
                    </div>
                  </div>

                  {/* Placar */}
                  <div className="px-4 flex items-center gap-2">
                    <div className="bg-white/10 rounded-md px-3 py-1 font-bold text-lg tracking-widest text-white border border-white/5 shadow-inner">
                      {isHome ? flaScore : advScore} - {isHome ? advScore : flaScore}
                    </div>
                  </div>

                  {/* Visitante */}
                  <div className="flex items-center gap-2 flex-1 justify-start">
                    <div className="w-8 h-8 flex-shrink-0 bg-white/5 rounded-full p-1 border border-white/10">
                      <TeamCrest teamName={!isHome ? 'Flamengo' : match.adversario?.nome} size="sm" />
                    </div>
                    <span className={`font-bold text-sm truncate ${!isHome ? 'text-white' : 'text-zinc-300'}`}>
                      {!isHome ? 'Flamengo' : match.adversario?.nome}
                    </span>
                  </div>
                </div>

                {/* Call to action "Ver Raio-X" */}
                <div className="absolute inset-y-0 right-0 flex flex-col justify-center pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-primary/20 p-1.5 rounded-full text-primary">
                     <ChevronRight className="w-4 h-4" />
                   </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
