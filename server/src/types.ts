// ── Core domain types ────────────────────────────────────────────────────

export type ClueType = "text" | "image" | "audio";

export interface Clue {
  type: ClueType;
  content: string;
}

export interface Question {
  id: string;
  round: number; // 1-4
  order: number; // order within the round, 1-based
  answer: string;
  acceptedAnswers: string[];
  clues: [Clue, Clue, Clue, Clue]; // always exactly 4
}

export interface RoundConfig {
  round: number;
  name: string;
  points: [number, number, number, number]; // points for clue 1..4
}

export type TeamStatus = "active" | "locked" | "correct";

export interface Team {
  id: string;
  name: string;
  score: number;
  status: TeamStatus; // resets each question
  connected: boolean;
}

export type QuestionPhase = "active" | "timeup" | "answer_revealed";
export type GameStatus = "lobby" | "playing" | "ended";

export interface TimerState {
  remaining: number; // seconds
  running: boolean;
  duration: number; // total seconds for this question
}

// ── Sanitized state sent to all connected clients ──────────────────────────
// Never includes acceptedAnswers, and only includes `answer` once revealed.

export interface PublicQuestionView {
  id: string;
  round: number;
  roundName: string;
  questionNumberInRound: number;
  totalQuestionsInRound: number;
  questionNumberOverall: number;
  totalQuestionsOverall: number;
  clues: (Clue | null)[]; // length 4; unrevealed slots are null
  revealedClueCount: number;
  answer: string | null; // only populated when phase === 'answer_revealed'
  solvedAtClue: number | null; // clue index (1-4) the first correct team solved at
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

// ── Socket payloads ─────────────────────────────────────────────────────

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

export interface SubmitAnswerAck {
  success: boolean;
  error?: string;
}

export interface HostRejoinAck {
  success: boolean;
  error?: string;
}

export interface PlayerRejoinAck {
  success: boolean;
  error?: string;
}