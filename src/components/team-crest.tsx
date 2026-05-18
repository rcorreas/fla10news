import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const teamCrests: Record<string, string> = {
  "Flamengo": "https://i.imgur.com/JV5waDa.png",
  "Palmeiras": "https://i.imgur.com/uhKqeNQ.png",
  "Botafogo": "https://i.imgur.com/7T3si02.png",
  "São Paulo": "https://i.imgur.com/2Zm5eJ5.png",
  "Internacional": "https://i.imgur.com/uYqtPy8.png",
  "Atlético-MG": "https://i.imgur.com/41gxNOo.png",
  "Cruzeiro": "https://i.imgur.com/3YScqkG.png",
  "Grêmio": "https://i.imgur.com/qaA2aCQ.png",
  "Vasco": "https://i.imgur.com/TzTUxXE.png",
  "Corinthians": "https://i.imgur.com/UMAX3vE.png",
  "Fluminense": "https://i.imgur.com/CITw7D3.png",
  "Bahia": "https://i.imgur.com/PWZacaP.png",
  "Fortaleza": "https://i.imgur.com/8BU78Q7.png",
  "Criciúma": "https://i.imgur.com/RMBOoC7.png",
  "Vitória": "https://i.imgur.com/NtoSUhj.png",
  "Juventude": "https://i.imgur.com/dieI3rH.png",
  "Cuiabá": "https://i.imgur.com/BwtmjHh.png",
  "Red Bull Bragantino": "https://i.imgur.com/v7ZxAlE.png",
  "Athletico-PR": "https://i.imgur.com/aQ3Qp9n.png",
  "Atlético-GO": "https://i.imgur.com/wV1RWSn.png",
  "Santos": "https://i.postimg.cc/PrS7QGkR/Escudo-do-Santos-Futebol-Clube.png",
  "CAP": "https://i.imgur.com/9MHMoGv.png",
  "Estudiantes": "https://i.imgur.com/ejaLTel.png",
};


export function TeamCrest({ teamName, size = 'md' }: { teamName: string, size?: 'sm' | 'md' | 'lg' }) {
    const sizeClasses = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10'
    }

    const crestUrl = teamCrests[teamName];

    if (crestUrl) {
        return (
            <div className={cn("relative", sizeClasses[size])}>
                <Image
                    src={crestUrl}
                    alt={`${teamName} crest`}
                    fill
                    className="object-contain"
                />
            </div>
        )
    }
    
    return <Shield className={cn(sizeClasses[size], "text-muted-foreground")} />
}
