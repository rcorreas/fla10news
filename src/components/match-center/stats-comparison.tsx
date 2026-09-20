import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface StatsComparisonProps {
  match: any;
}

export function StatsComparison({ match }: StatsComparisonProps) {
  if (!match || !match.flashscore?.estatisticas?.Match) return null;

  const isHome = match.mando === 'casa';
  const stats = match.flashscore.estatisticas.Match;

  const getStatValues = (statName: string) => {
    const data = stats[statName];
    if (!data) return { fla: 0, adv: 0, total: 0 };
    
    // Some values have '%'
    const flaStr = isHome ? data.casa : data.fora;
    const advStr = isHome ? data.fora : data.casa;
    
    const fla = parseInt(String(flaStr).replace(/\D/g, '')) || 0;
    const adv = parseInt(String(advStr).replace(/\D/g, '')) || 0;
    
    return { fla, adv, total: fla + adv };
  };

  const StatBar = ({ label, statName }: { label: string, statName: string }) => {
    const { fla, adv, total } = getStatValues(statName);
    
    // If total is 0, render empty bar
    const flaPercent = total > 0 ? (fla / total) * 100 : 50;
    const advPercent = total > 0 ? (adv / total) * 100 : 50;

    return (
      <div className="mb-4">
        <div className="relative flex justify-between items-end mb-1 h-7">
          <span className="font-bold text-lg text-primary">{stats[statName] ? (isHome ? stats[statName].casa : stats[statName].fora) : '0'}</span>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-0 text-xs font-semibold text-white drop-shadow-sm uppercase tracking-wider text-center w-full">{label}</span>
          <span className="font-bold text-lg text-white">{stats[statName] ? (isHome ? stats[statName].fora : stats[statName].casa) : '0'}</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-primary transition-all duration-1000 ease-out"
            style={{ width: `${flaPercent}%` }}
          />
          <div 
            className="h-full bg-zinc-500 transition-all duration-1000 ease-out"
            style={{ width: `${advPercent}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <Card 
      className="text-white shadow-lg border-2 border-white/10 overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(12px)' }}
    >
      <CardHeader className="border-b border-white/10 bg-white/5 pb-3">
        <CardTitle className="text-lg font-bold text-center text-white">
          Estatísticas da Partida
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <StatBar label="Posse de Bola" statName="Ball possession" />
        <StatBar label="Finalizações" statName="Total shots" />
        <StatBar label="Chutes no Gol" statName="Shots on target" />
        <StatBar label="Escanteios" statName="Corner kicks" />
        <StatBar label="Faltas" statName="Fouls" />
        <StatBar label="Cartões Amarelos" statName="Yellow cards" />
      </CardContent>
    </Card>
  );
}
