// Mirrors server/src/types.ts's public (sanitized) shapes. Kept as a plain
// duplicate on purpose -- this project intentionally has no shared package,
// see README for why.

export type ClueType = "text" | "image" | "audio";

export interface Clue {
  type: ClueType;
  content: string;
}

export type TeamStatus = "active" | "locked" | "correct";

export interface Team {
  id: string;
  name: string;
  score: number;
  status: TeamStatus;
  connected: boolean;
}

export type QuestionPhase = "active" | "timeup" | "answer_revealed";
export type GameStatus = "lobby" | "playing" | "ended";

export interface TimerState {
  remaining: number;
  running: boolean;
  duration: number;
}

export interface PublicQuestionView {
  id: string;
  round: number;
  roundName: string;
  questionNumberInRound: number;
  totalQuestionsInRound: number;
  questionNumberOverall: number;
  totalQuestionsOverall: number;
  clues: (Clue | null)[];
  revealedClueCount: number;
  answer: string | null;
  solvedAtClue: number | null;
}

export interface PublicGameState {
  code: string;
  status: GameStatus;
  questionPhase: QuestionPhase | null;
  timer: TimerState | null;
  teams: Team[];
  question: PublicQuestionView | null;
  winnerTeamId: string | null;
}

export interface CreateGameAck {
  success: boolean;
  code?: string;
  hostToken?: string;
  error?: string;
}

export interface JoinGameAck {
  success: boolean;
  teamId?: string;
  teamName?: string;
  code?: string;
  error?: string;
}

export interface SimpleAck {
  success: boolean;
  error?: string;
}
