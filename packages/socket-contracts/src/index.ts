export const SocketEvents = {
  // Matchmaking
  MATCHMAKING_JOIN: 'matchmaking:join',
  MATCHMAKING_LEAVE: 'matchmaking:leave',
  MATCHMAKING_MATCHED: 'matchmaking:matched',

  // Direct Challenge
  CHALLENGE_INVITE: 'challenge:invite',
  CHALLENGE_INVITED: 'challenge:invited',
  CHALLENGE_ACCEPT: 'challenge:accept',
  CHALLENGE_DECLINE: 'challenge:decline',
  CHALLENGE_DECLINED: 'challenge:declined',

  // Match Play
  MATCH_INIT: 'match:init',
  MATCH_COUNTDOWN: 'match:countdown',
  ROUND_START: 'round:start',
  ROUND_SUBMIT: 'round:submit',
  ROUND_OPPONENT_SUBMITTED: 'round:opponent_submitted',
  ROUND_END: 'round:end',
  MATCH_END: 'match:end',
  MATCH_FORFEIT: 'match:forfeit',
} as const;

export interface PlayerInfo {
  id: string;
  username: string;
  avatar: string | null;
  score: number;
}

export interface QuestionSummary {
  id: string;
  question: string;
  options: string[];
}

export interface MatchInitPayload {
  matchId: string;
  opponent: PlayerInfo;
  player: PlayerInfo;
  questionsCount: number;
}

export interface RoundStartPayload {
  roundIndex: number;
  question: string;
  options: string[];
  limitTime: number; // in seconds, e.g. 15
}

export interface RoundSubmitPayload {
  matchId: string;
  roundIndex: number;
  selectedIndex: number;
  timeTakenMs: number;
}

export interface RoundEndPayload {
  roundIndex: number;
  correctIndex: number;
  scores: {
    [userId: string]: number;
  };
  answers: {
    [userId: string]: number;
  };
}

export interface MatchEndPayload {
  matchId: string;
  winnerId: string | null; // null for draw
  finalScores: {
    [userId: string]: number;
  };
  xpEarned: {
    [userId: string]: number;
  };
}
