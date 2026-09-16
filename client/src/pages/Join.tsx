import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePlayerGame } from "../hooks/usePlayerGame";
import { ClueGrid } from "../components/ClueGrid";
import { Timer } from "../components/Timer";
import { Leaderboard } from "../components/Leaderboard";
import { AnswerReveal } from "../components/AnswerReveal";
import { cn } from "../lib/format";

export function Join() {
  const player = usePlayerGame();
  const { state, team, myTeam } = player;

  if (!team) return <JoinForm player={player} />;
  if (!state || state.status === "lobby") return <Waiting teamName={team.teamName} />;
  if (state.status === "ended") return <Final player={player} />;
  if (state.question) return <QuestionView player={player} />;
  return <Waiting teamName={team.teamName} />;
}

function JoinForm({ player }: { player: ReturnType<typeof usePlayerGame> }) {
  const [code, setCode] = useState("");
  const [teamName, setTeamName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !teamName.trim()) return;
    player.join(code, teamName);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6">
      <div className="w-full max-w-xs">
        <h1 className="mb-1 text-center font-display text-3xl font-semibold">The Connection</h1>
        <p className="mb-8 text-center font-sans text-sm text-muted">Enter your game code to join</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Game code">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={4}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="7K4P"
              className="w-full rounded-xl border border-ink-line bg-ink-panel px-4 py-4 text-center font-display text-3xl tracking-[0.3em] text-amber placeholder:text-muted/30"
            />
          </Field>
          <Field label="Team name">
            <input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={24}
              placeholder="Team Nexus"
              className="w-full rounded-xl border border-ink-line bg-ink-panel px-4 py-4 text-center font-sans text-lg text-paper placeholder:text-muted/30"
            />
          </Field>

          {player.error && <p className="text-center text-sm text-alert">{player.error}</p>}

          <button
            type="submit"
            disabled={player.joining}
            className="mt-2 rounded-xl bg-amber px-6 py-4 font-sans text-lg font-semibold text-ink disabled:opacity-50"
          >
            {player.joining ? "Joining..." : "Join game"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-center font-sans text-xs uppercase tracking-widest text-muted">{label}</span>
      {children}
    </label>
  );
}

function Waiting({ teamName }: { teamName: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
      <span className="rounded-full bg-circuit-dim px-4 py-1 font-sans text-sm text-circuit">
        Joined successfully
      </span>
      <h1 className="font-display text-3xl font-semibold">{teamName}</h1>
      <p className="font-sans text-muted">Waiting for the host to start...</p>
    </div>
  );
}

function QuestionView({ player }: { player: ReturnType<typeof usePlayerGame> }) {
  const { state, myTeam, submitAnswer } = player;
  const q = state!.question!;
  const timer = state!.timer!;
  const phase = state!.questionPhase;
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scoreAtQuestionStart = useRef(myTeam?.score ?? 0);

  useEffect(() => {
    scoreAtQuestionStart.current = myTeam?.score ?? 0;
    setAnswer("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);

  const canSubmit = myTeam?.status === "active" && phase === "active";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!answer.trim() || !canSubmit) return;
    setSubmitting(true);
    submitAnswer(answer, () => setSubmitting(false));
  };

  if (myTeam?.status === "correct") {
    const earned = myTeam.score - scoreAtQuestionStart.current;
    return (
      <FeedbackScreen tone="correct" title="Correct!" subtitle={`+${earned} points`} />
    );
  }
  if (myTeam?.status === "locked") {
    return (
      <FeedbackScreen
        tone="wrong"
        title="Wrong"
        subtitle="You're locked out for this question."
      />
    );
  }
  if (phase === "answer_revealed") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-ink px-6">
        <AnswerReveal answer={q.answer ?? ""} solvedAtClue={q.solvedAtClue} />
        <p className="font-sans text-sm text-muted">Get ready for the next question...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 py-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="font-sans text-xs uppercase tracking-widest text-amber">
            Round {q.round}
          </p>
          <p className="font-display text-xl font-semibold">
            Question {q.questionNumberInRound} / {q.totalQuestionsInRound}
          </p>
        </div>
        <Timer remaining={timer.remaining} duration={timer.duration} running={timer.running} />
      </header>

      <ClueGrid clues={q.clues} size="sm" />

      {phase === "timeup" ? (
        <p className="text-center font-sans text-muted">Time's up. Waiting for the answer...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-auto flex flex-col gap-3 pb-4">
          <span className="font-sans text-xs uppercase tracking-widest text-muted">Your answer</span>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!canSubmit || submitting}
            autoComplete="off"
            placeholder="Type your answer"
            className="w-full rounded-xl border border-ink-line bg-ink-panel px-4 py-4 font-sans text-lg text-paper placeholder:text-muted/30"
          />
          <button
            type="submit"
            disabled={!canSubmit || submitting || !answer.trim()}
            className="rounded-xl bg-amber px-6 py-4 font-sans text-lg font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit
          </button>
        </form>
      )}
    </div>
  );
}

function FeedbackScreen({
  tone,
  title,
  subtitle,
}: {
  tone: "correct" | "wrong";
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink px-6 text-center">
      <div
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full text-3xl",
          tone === "correct" ? "bg-circuit-dim text-circuit" : "animate-shake bg-alert-dim text-alert"
        )}
      >
        {tone === "correct" ? "✓" : "✕"}
      </div>
      <h1
        className={cn(
          "font-display text-4xl font-semibold",
          tone === "correct" ? "text-circuit" : "text-alert"
        )}
      >
        {title}
      </h1>
      <p className="font-sans text-lg text-muted">{subtitle}</p>
      <p className="font-sans text-sm text-muted/70">Waiting for the next question...</p>
    </div>
  );
}

function Final({ player }: { player: ReturnType<typeof usePlayerGame> }) {
  const { state, team } = player;
  const winner = state?.teams.find((t) => t.id === state.winnerTeamId);
  const isWinner = winner?.id === team?.teamId;

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-8 px-5 py-10">
      <div className="text-center">
        <span className="font-sans text-xs uppercase tracking-widest text-amber">
          {isWinner ? "You won!" : "Final results"}
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold">{winner?.name}</h1>
        <p className="font-sans text-muted">{winner?.score} points</p>
      </div>
      <div className="w-full">
        <Leaderboard teams={state?.teams ?? []} />
      </div>
    </div>
  );
}
