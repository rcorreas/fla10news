import { notFound } from "next/navigation";
import { getMatchRatingById } from "@/data/match-ratings";
import MatchRatingForm from "@/components/match-ratings/match-rating-form";

export async function generateMetadata({ params }: { params: { matchId: string } }) {
  const match = await getMatchRatingById(params.matchId);
  if (!match) return { title: 'Atuações Não Encontradas' };
  
  return {
    title: `Atuações: ${match.header.score} | NRN`,
    description: match.header.tacticalSummary,
  };
}

export default async function AtuacoesPage({ params }: { params: { matchId: string } }) {
  const match = await getMatchRatingById(params.matchId);

  if (!match) {
    notFound();
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center space-y-4">
        <h2 className="text-sm font-semibold tracking-wide uppercase text-red-600">{match.header.competition}</h2>
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl">{match.header.score}</h1>
        {match.header.attendanceAndStadium && (
          <p className="text-muted-foreground">{match.header.attendanceAndStadium}</p>
        )}
        <p className="text-lg text-gray-700 max-w-2xl mx-auto italic border-l-4 border-red-500 pl-4 text-left bg-gray-50 py-2 rounded-r-md">
          "{match.header.tacticalSummary}"
        </p>
      </div>

      <div className="mt-12">
        <MatchRatingForm match={match} />
      </div>
    </main>
  );
}
