import { Calendar, Clock, ChevronRight } from 'lucide-react';
import { TeamCrest } from './team-crest';
import { nextGame as defaultGameData } from '@/data/next-game';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';

// Define the type for game data to ensure consistency
type NextGameData = {
    home: string;
    away: string;
    competition: string;
    date: string;
    time: string;
    eventId?: string; // ID for the Match Center
};

async function getNextGameData(): Promise<NextGameData> {
    try {
        const docRef = doc(db, "siteConfig", "nextGame");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data() as NextGameData;
        } else {
            return defaultGameData;
        }
    } catch (error) {
        console.error("Failed to fetch next game data for banner:", error);
        return defaultGameData;
    }
}

function TeamDisplay({ name }: { name: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="md:hidden">
              <TeamCrest teamName={name} size='sm' />
            </div>
            <div className="hidden md:block">
              <TeamCrest teamName={name} size='lg' />
            </div>
            <span className="text-sm md:text-2xl font-bold font-headline text-primary-foreground">{name}</span>
        </div>
    )
}

export async function NextGameBanner() {
    const nextGame = await getNextGameData();

    return (
        <div className="sticky top-16 z-40 w-full bg-accent/40 backdrop-blur text-accent-foreground border-b border-white/10 shadow-md">
            <div className="container mx-auto flex items-center justify-center h-14 px-4">
                <div className="flex flex-col md:flex-row items-center justify-between w-full gap-1 md:gap-4 relative">

                    <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{nextGame.date}</span>
                        <Clock className="h-4 w-4 ml-2" />
                        <span>{nextGame.time}</span>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <TeamDisplay name={nextGame.home} />
                        <span className="text-lg md:text-2xl font-light text-muted-foreground">vs</span>
                        <TeamDisplay name={nextGame.away} />
                    </div>

                    <div className="text-center md:text-right flex items-center gap-4">
                        <div className="hidden md:block">
                            <p className="font-bold font-headline text-primary-foreground text-xs md:text-base">{nextGame.competition}</p>
                        </div>
                        
                        {nextGame.eventId && (
                           <Link href={`/partida/${nextGame.eventId}`} className="hidden md:flex items-center gap-1 bg-primary/20 text-primary px-3 py-1.5 rounded-full text-xs font-bold hover:bg-primary hover:text-white transition-colors">
                             Raio-X <ChevronRight className="w-3 h-3" />
                           </Link>
                        )}
                        
                        <div className="flex md:hidden items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{nextGame.date}</span>
                            <Clock className="h-3 w-3 ml-2" />
                            <span>{nextGame.time}</span>
                            {nextGame.eventId && (
                               <Link href={`/partida/${nextGame.eventId}`} className="ml-2 text-primary font-bold">
                                 Raio-X
                               </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
