import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, Timestamp, doc, getDoc, limit, updateDoc, setDoc } from 'firebase/firestore';
import type { MatchRating, UserVote } from '@/types/match-ratings';

const fromFirestoreMatchRating = (docSnap: any): MatchRating => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    status: data.status || 'closed',
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : (data.createdAt || Date.now()),
    header: data.header || { score: '', competition: '', attendanceAndStadium: '', tacticalSummary: '' },
    players: data.players || [],
    coach: data.coach || { id: '', name: '' },
    results: data.results || {
      players: {},
      coach: { averageScore: 0, voteCount: 0 }
    }
  };
};

export async function getMatchRatings(): Promise<MatchRating[]> {
  try {
    const q = query(collection(db, 'match_ratings'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [];
    return snapshot.docs.map(fromFirestoreMatchRating);
  } catch (error) {
    console.error("Error fetching match ratings:", error);
    return [];
  }
}

export async function getMatchRatingById(id: string): Promise<MatchRating | null> {
  try {
    const docRef = doc(db, 'match_ratings', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestoreMatchRating(docSnap);
    }
    return null;
  } catch (error) {
    console.error(`Error fetching match rating ${id}:`, error);
    return null;
  }
}

export async function getUserVote(matchId: string, userId: string): Promise<UserVote | null> {
  try {
    const voteRef = doc(db, 'match_ratings', matchId, 'user_votes', userId);
    const voteSnap = await getDoc(voteRef);
    if (voteSnap.exists()) {
      return voteSnap.data() as UserVote;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching user vote for match ${matchId} and user ${userId}:`, error);
    return null;
  }
}
