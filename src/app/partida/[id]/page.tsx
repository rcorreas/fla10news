import { notFound } from 'next/navigation';
import { getMatchById, getHeadToHead } from '@/data/match-center';
import { MatchHeader } from '@/components/match-center/match-header';
import { StatsComparison } from '@/components/match-center/stats-comparison';
import { HeadToHead } from '@/components/match-center/head-to-head';
import { MatchLineup } from '@/components/match-center/match-lineup';
import { Metadata } from 'next';

export const revalidate = 3600; // Cache de 1 hora (ISR) para economizar leituras no Firebase

interface MatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: MatchPageProps): Promise<Metadata> {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) return { title: 'Partida não encontrada' };
  
  const advNome = match.adversario?.nome || 'Adversário';
  return {
    title: `Flamengo x ${advNome} - Raio-X do Confronto | Fla10 Stats`,
    description: `Acompanhe estatísticas, histórico de confrontos e detalhes da partida entre Flamengo e ${advNome}.`,
  };
}
import Image from 'next/image';

export default async function MatchPage({ params }: MatchPageProps) {
  const { id } = await params;
  const match = await getMatchById(id);

  if (!match) {
    notFound();
  }

  // Busca o Head-to-Head apenas se tivermos o id do adversario
  const h2h = match.adversario?.idFlashscore 
    ? await getHeadToHead(match.adversario.idFlashscore) 
    : null;

  const temEstatisticas = !!match.flashscore?.estatisticas?.Match;

  return (
    <main className="container py-8 max-w-5xl mx-auto min-h-screen">
      <div className="mb-8 flex flex-col gap-4">
        <div className="flex justify-center w-full -mt-16 md:-mt-24">
          <Image 
            src="/fla10-stats-logo.png" 
            alt="Fla10 Stats" 
            width={960} 
            height={360} 
            className="h-48 md:h-64 w-auto object-contain"
          />
        </div>
        <h1 className="text-3xl font-black text-primary uppercase flex items-center gap-2 text-left">
          Raio-X do Confronto
        </h1>
      </div>

      <MatchHeader match={match} h2h={h2h} />

      <div className="flex flex-col gap-6 mb-6 items-center">
        {/* Coluna Central: Estatísticas */}
        <div className="w-full max-w-3xl">
          {temEstatisticas ? (
            <StatsComparison match={match} />
          ) : (
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-white/10 text-center text-zinc-400">
              Estatísticas detalhadas não disponíveis para esta partida.
            </div>
          )}
        </div>

        {/* Coluna Central: Retrospecto Histórico */}
        <div className="w-full max-w-3xl">
          {h2h && (
            <HeadToHead h2h={h2h} adversarioNome={match.adversario?.nome || 'Adversário'} />
          )}
        </div>
      </div>

      <MatchLineup match={match} />
    </main>
  );
}
