import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeadToHeadProps {
  h2h: any;
  adversarioNome: string;
}

export function HeadToHead({ h2h, adversarioNome }: HeadToHeadProps) {
  if (!h2h || h2h.jogos === 0) return null;

  return (
    <Card 
      className="text-white shadow-lg border-2 border-white/10 overflow-hidden"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(12px)' }}
    >
      <CardHeader className="border-b border-white/10 bg-white/5 pb-3">
        <CardTitle className="text-lg font-bold text-center text-white">
          Retrospecto Recente
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-center text-zinc-400 text-xs uppercase tracking-wider mb-6">
          Últimos {h2h.jogos} confrontos diretos
        </p>

        <div className="grid grid-cols-3 gap-2 text-center mb-6">
          <div className="bg-white/5 p-3 rounded border border-white/10">
            <p className="text-2xl font-black text-primary">{h2h.vitorias}</p>
            <p className="text-[10px] text-zinc-400 uppercase mt-1">Vitórias Fla</p>
          </div>
          <div className="bg-white/5 p-3 rounded border border-white/10">
            <p className="text-2xl font-black text-zinc-300">{h2h.empates}</p>
            <p className="text-[10px] text-zinc-400 uppercase mt-1">Empates</p>
          </div>
          <div className="bg-white/5 p-3 rounded border border-white/10">
            <p className="text-2xl font-black text-white">{h2h.derrotas}</p>
            <p className="text-[10px] text-zinc-400 uppercase mt-1">Vitórias {adversarioNome}</p>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm p-3 rounded-lg border border-white/10 bg-white/5">
          <div className="flex flex-col items-center flex-1">
            <span className="font-bold text-white text-lg">{h2h.golsPro}</span>
            <span className="text-[10px] text-zinc-400 uppercase">Gols Pró</span>
          </div>
          <div className="w-px h-8 bg-white/10"></div>
          <div className="flex flex-col items-center flex-1">
            <span className="font-bold text-white text-lg">{h2h.golsSofridos}</span>
            <span className="text-[10px] text-zinc-400 uppercase">Sofridos</span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
