import { randomUUID } from "node:crypto";
import { QUESTIONS, ROUND_CONFIG, getRoundConfig } from "./questions.js";
import type {
  GameStatus,
  PublicGameState,
  PublicQuestionView,
  Question,
  QuestionPhase,
  Team,
  TimerState,
} from "./types.js";

const QUESTION_DURATION_SECONDS = 60;
const CODE_CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const CODE_LENGTH = 4;

function normalizeAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[-_]/g, " ") // hyphens/underscores -> space, so "spider-man" == "spider man"
    .replace(/[^\p{L}\p{N}\s]/gu, "") // strip punctuation
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

interface Answered {
  teamId: string;
  clueIndexAtSubmit: number;
}

export interface GameCallbacks {
  onStateChange: (code: string) => void;
}

export class Game {
  readonly code: string;
  readonly hostToken: string;
  hostSocketId: string | null = null;

  status: GameStatus = "lobby";
  teams: Map<string, Team> = new Map();

  currentQuestionIndex = -1; // index into `questions`
  currentClueIndex = 0; // 0 = none revealed, 1-4 = that many revealed
  questionPhase: QuestionPhase | null = null;
  timer: TimerState | null = null;
  solvedAtClue: number | null = null;
  private answeredThisQuestion: Answered[] = [];

  private questions: Question[];
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private callbacks: GameCallbacks;

  constructor(code: string, hostToken: string, callbacks: GameCallbacks) {
    this.code = code;
    this.hostToken = hostToken;
    this.callbacks = callbacks;
    this.questions = QUESTIONS;
  }

  private notify() {
    this.callbacks.onStateChange(this.code);
  }

  // ── Teams ────────────────────────────────────────────────────────────

  addTeam(name: string): { team?: Team; error?: string } {
    const trimmed = name.trim();
    if (!trimmed) return { error: "Team name can't be empty." };
    if (trimmed.length > 24) return { error: "Team name is too long." };
    if (this.status !== "lobby") return { error: "Game already in progress." };
    const nameTaken = [...this.teams.values()].some(
      (t) => t.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (nameTaken) return { error: "That team name is already taken." };

    const team: Team = {
      id: randomUUID(),
      name: trimmed,
      score: 0,
      status: "active",
      connected: true,
    };
    this.teams.set(team.id, team);
    this.notify();
    return { team };
  }

  removeTeam(teamId: string): boolean {
    if (this.status !== "lobby") return false;
    const removed = this.teams.delete(teamId);
    if (removed) this.notify();
    return removed;
  }

  setTeamConnected(teamId: string, connected: boolean) {
    const team = this.teams.get(teamId);
    if (!team) return;
    team.connected = connected;
    this.notify();
  }

  // ── Game lifecycle ───────────────────────────────────────────────────

  startGame(): { success: boolean; error?: string } {
    if (this.status !== "lobby") return { success: false, error: "Game already started." };
    if (this.teams.size === 0) return { success: false, error: "No teams have joined yet." };
    this.status = "playing";
    this.currentQuestionIndex = 0;
    this.beginQuestion();
    return { success: true };
  }

  endGame() {
    this.stopInterval();
    this.status = "ended";
    this.questionPhase = null;
    this.timer = null;
    this.notify();
  }

  private currentQuestion(): Question | null {
    if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.questions.length) {
      return null;
    }
    return this.questions[this.currentQuestionIndex];
  }

  private beginQuestion() {
    this.currentClueIndex = 1; // clue 1 is revealed automatically
    this.questionPhase = "active";
    this.solvedAtClue = null;
    this.answeredThisQuestion = [];
    for (const team of this.teams.values()) team.status = "active";
    this.timer = { remaining: QUESTION_DURATION_SECONDS, duration: QUESTION_DURATION_SECONDS, running: true };
    this.startInterval();
    this.notify();
  }

  // ── Host controls ────────────────────────────────────────────────────

  revealNextClue(): { success: boolean; error?: string } {
    if (this.questionPhase !== "active") return { success: false, error: "Can't reveal a clue right now." };
    if (this.currentClueIndex >= 4) return { success: false, error: "All clues are already revealed." };
    this.currentClueIndex += 1;
    this.notify();
    return { success: true };
  }

  pauseTimer(): { success: boolean; error?: string } {
    if (!this.timer || !this.timer.running) return { success: false, error: "Timer isn't running." };
    this.timer.running = false;
    this.stopInterval();
    this.notify();
    return { success: true };
  }

  resumeTimer(): { success: boolean; error?: string } {
    if (!this.timer || this.timer.running) return { success: false, error: "Timer isn't paused." };
    if (this.questionPhase !== "active") return { success: false, error: "Can't resume right now." };
    this.timer.running = true;
    this.startInterval();
    this.notify();
    return { success: true };
  }

  revealAnswer(): { success: boolean; error?: string } {
    if (this.questionPhase === "answer_revealed") return { success: false, error: "Answer already revealed." };
    this.stopInterval();
    if (this.timer) this.timer.running = false;
    this.questionPhase = "answer_revealed";
    this.notify();
    return { success: true };
  }

  nextQuestion(): { success: boolean; error?: string } {
    if (this.status !== "playing") return { success: false, error: "Game isn't in progress." };
    this.currentQuestionIndex += 1;
    if (this.currentQuestionIndex >= this.questions.length) {
      this.stopInterval();
      this.status = "ended";
      this.questionPhase = null;
      this.timer = null;
      this.currentClueIndex = 0;
      this.notify();
      return { success: true };
    }
    this.beginQuestion();
    return { success: true };
  }

  // ── Answers ──────────────────────────────────────────────────────────

  submitAnswer(teamId: string, rawText: string): { success: boolean; error?: string } {
    const team = this.teams.get(teamId);
    if (!team) return { success: false, error: "Team not found." };
    if (this.questionPhase !== "active") return { success: false, error: "Time's up." };
    if (team.status === "locked") return { success: false, error: "You're locked out for this question." };
    if (team.status === "correct") return { success: false, error: "You've already submitted." };

    const question = this.currentQuestion();
    if (!question) return { success: false, error: "No active question." };

    const normalized = normalizeAnswer(rawText);
    const isCorrect = question.acceptedAnswers.some((a) => normalizeAnswer(a) === normalized);

    this.answeredThisQuestion.push({ teamId, clueIndexAtSubmit: this.currentClueIndex });

    if (isCorrect) {
      const roundConfig = getRoundConfig(question.round);
      const points = roundConfig.points[this.currentClueIndex - 1];
      team.score += points;
      team.status = "correct";
      if (this.solvedAtClue === null) this.solvedAtClue = this.currentClueIndex;
    } else {
      team.status = "locked";
    }
    this.notify();
    return { success: true };
  }

  // ── Timer internals ─────────────────────────────────────────────────

  private startInterval() {
    this.stopInterval();
    this.intervalHandle = setInterval(() => this.tick(), 1000);
  }

  private stopInterval() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  private tick() {
    if (!this.timer || !this.timer.running) return;
    this.timer.remaining -= 1;
    if (this.timer.remaining <= 0) {
      this.timer.remaining = 0;
      this.timer.running = false;
      this.questionPhase = "timeup";
      this.stopInterval();
    }
    this.notify();
  }

  // ── Public (sanitized) view ─────────────────────────────────────────

  getPublicState(): PublicGameState {
    const question = this.currentQuestion();
    let questionView: PublicQuestionView | null = null;

    if (question) {
      const roundConfig = getRoundConfig(question.round);
      const questionsInRound = this.questions.filter((q) => q.round === question.round);
      const revealAnswerNow = this.questionPhase === "answer_revealed";
      const clues: (typeof question.clues[number] | null)[] = question.clues.map((clue, idx) =>
        idx < this.currentClueIndex ? clue : null
      );
      questionView = {
        id: question.id,
        round: question.round,
        roundName: roundConfig.name,
        questionNumberInRound: question.order,
        totalQuestionsInRound: questionsInRound.length,
        questionNumberOverall: this.currentQuestionIndex + 1,
        totalQuestionsOverall: this.questions.length,
        clues,
        revealedClueCount: this.currentClueIndex,
        answer: revealAnswerNow ? question.answer : null,
        solvedAtClue: revealAnswerNow ? this.solvedAtClue : null,
      };
    }

    let winnerTeamId: string | null = null;
    if (this.status === "ended" && this.teams.size > 0) {
      const sorted = [...this.teams.values()].sort((a, b) => b.score - a.score);
      winnerTeamId = sorted[0].id;
    }

    return {
      code: this.code,
      status: this.status,
      questionPhase: this.questionPhase,
      timer: this.timer,
      teams: [...this.teams.values()].sort((a, b) => b.score - a.score),
      question: questionView,
      winnerTeamId,
    };
  }
}

export class GameManager {
  private games: Map<string, Game> = new Map();
  private callbacks: GameCallbacks;

  constructor(callbacks: GameCallbacks) {
    this.callbacks = callbacks;
  }

  private generateCode(): string {
    let code: string;
    do {
      code = Array.from({ length: CODE_LENGTH }, () => CODE_CHARSET[Math.floor(Math.random() * CODE_CHARSET.length)]).join("");
    } while (this.games.has(code));
    return code;
  }

  createGame(): Game {
    const code = this.generateCode();
    const hostToken = randomUUID();
    const game = new Game(code, hostToken, this.callbacks);
    this.games.set(code, game);
    return game;
  }

  getGame(code: string): Game | undefined {
    return this.games.get(code.toUpperCase());
  }
}