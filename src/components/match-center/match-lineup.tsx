import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MatchLineupProps {
  match: any;
}

export function MatchLineup({ match }: MatchLineupProps) {
  if (!match) return null;

  // Como o JSON atual não possui os dados de escalação detalhados,
  // vamos deixar o componente preparado para receber isso no futuro.
  const hasLineupData = false;

  const isHome = match.mando === 'casa';
  const adversario = match.adversario?.nome || 'Adversário';

  if (!hasLineupData) {
    return (
      <Card 
        className="text-white shadow-lg border-2 border-white/10 overflow-hidden mb-6"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(12px)' }}
      >
        <CardHeader className="border-b border-white/10 bg-white/5 pb-3">
          <CardTitle className="text-lg font-bold text-center text-white">
            Escalações
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="p-12 text-center text-zinc-400 border border-white/10 rounded-xl bg-black/20">
            <p>As escalações para esta partida não estão disponíveis no momento.</p>
            <p className="text-xs mt-2 opacity-70">Aguardando dados oficiais...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="text-white shadow-lg border-2 border-white/10 overflow-hidden mb-6"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(12px)' }}
    >
      <CardHeader className="border-b border-white/10 bg-white/5 pb-3">
        <CardTitle className="text-lg font-bold text-center text-white">
          Escalações Táticas
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Time Mandante (Simulação) */}
          <div>
            <h3 className="text-center font-bold text-lg mb-4 text-primary">
              {isHome ? 'Flamengo' : adversario}
            </h3>
            {/* Campo de Futebol (Simulação visual) */}
            <div className="relative w-full aspect-[2/3] bg-green-900/40 border-2 border-white/20 rounded-lg overflow-hidden">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white/20" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/20 border-t-0 rounded-b-lg" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/20 border-b-0 rounded-t-lg" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-zinc-500/50 text-sm font-bold rotate-90">Em Breve</span>
                </div>
            </div>
          </div>

          {/* Time Visitante (Simulação) */}
          <div>
            <h3 className="text-center font-bold text-lg mb-4 text-white">
              {!isHome ? 'Flamengo' : adversario}
            </h3>
            <div className="relative w-full aspect-[2/3] bg-green-900/40 border-2 border-white/20 rounded-lg overflow-hidden">
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/20" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border-2 border-white/20" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/20 border-t-0 rounded-b-lg" />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-16 border-2 border-white/20 border-b-0 rounded-t-lg" />
                
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-zinc-500/50 text-sm font-bold rotate-90">Em Breve</span>
                </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
