export type MatchRatingStatus = 'open' | 'closed';

export type MatchPlayer = {
  id: string;
  name: string;
  position: string;
  photoUrl: string;
  minutesPlayed: string;
};

export type MatchCoach = {
  id: string;
  name: string;
  photoUrl?: string;
};

export type PlayerRatingResult = {
  averageScore: number;
  voteCount: number;
  craqueVotes: number;
  bagreVotes: number;
};

export type CoachRatingResult = {
  averageScore: number;
  voteCount: number;
};

export type MatchRating = {
  id: string; // The match ID (e.g. 'fla-x-vas-2023-10-22')
  status: MatchRatingStatus;
  createdAt: number;
  header: {
    score: string;
    competition: string;
    attendanceAndStadium: string;
    tacticalSummary: string;
  };
  players: MatchPlayer[];
  coach: MatchCoach;
  results: {
    players: Record<string, PlayerRatingResult>;
    coach: CoachRatingResult;
  };
};

export type UserVote = {
  userId: string; // User ID from Firebase Auth
  matchId: string;
  createdAt: number;
  playerRatings: Record<string, number>; // player.id -> score (0-10)
  coachRating: number; // 0-10
  craqueId: string; // player.id
  bagreId: string; // player.id
};
