import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useProjector } from "../hooks/useProjector";
import { ClueGrid } from "../components/ClueGrid";
import { Timer } from "../components/Timer";
import { Leaderboard } from "../components/Leaderboard";
import { AnswerReveal } from "../components/AnswerReveal";
import { GameCodeBadge } from "../components/GameCodeBadge";

export function Screen() {
  const projector = useProjector();
  const { state, code, connect } = projector;
  const [params] = useSearchParams();

  useEffect(() => {
    const fromUrl = params.get("code");
    if (fromUrl && !code) connect(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!code) return <ConnectForm projector={projector} />;
  if (!state) return <StageMessage title="Connecting..." />;

  if (state.status === "lobby") return <LobbyStage code={code} teamCount={state.teams.length} />;
  if (state.status === "ended") return <FinalStage teams={state.teams} winnerTeamId={state.winnerTeamId} />;
  if (state.question) return <QuestionStage state={state} />;

  return <StageMessage title="The Connection" subtitle="Get ready..." />;
}

function ConnectForm({ projector }: { projector: ReturnType<typeof useProjector> }) {
  const [code, setCode] = useState("");
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.trim()) projector.connect(code);
  };
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6">
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-4 text-center">
        <h1 className="font-display text-3xl font-semibold">Connect projector</h1>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={4}
          placeholder="Game code"
          className="w-full rounded-xl border border-ink-line bg-ink-panel px-4 py-4 text-center font-display text-2xl tracking-[0.3em] text-amber"
        />
        {projector.error && <p className="text-sm text-alert">{projector.error}</p>}
        <button type="submit" className="rounded-xl bg-amber px-6 py-3 font-sans font-semibold text-ink">
          Connect
        </button>
      </form>
    </div>
  );
}

function LobbyStage({ code, teamCount }: { code: string; teamCount: number }) {
  return (
    <Stage>
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="font-display text-6xl font-semibold md:text-7xl">The Connection</h1>
        <p className="font-sans text-2xl text-muted">Four clues. One answer.</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <span className="font-sans text-lg uppercase tracking-widest text-muted">
            Join at theconnection.local
          </span>
          <GameCodeBadge code={code} size="lg" />
        </div>
        <p className="mt-4 font-sans text-xl text-circuit">
          {teamCount} {teamCount === 1 ? "team" : "teams"} joined
        </p>
      </div>
    </Stage>
  );
}

function QuestionStage({ state }: { state: NonNullable<ReturnType<typeof useProjector>["state"]> }) {
  const q = state.question!;
  const timer = state.timer!;
  const answerRevealed = state.questionPhase === "answer_revealed";

  return (
    <Stage>
      <div className="flex w-full max-w-5xl flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="font-sans text-lg uppercase tracking-widest text-amber">
            Round {q.round} · {q.roundName}
          </span>
          <span className="font-display text-3xl font-semibold">
            Question {q.questionNumberInRound} / {q.totalQuestionsInRound}
          </span>
        </div>

        {answerRevealed ? (
          <>
            <AnswerReveal answer={q.answer ?? ""} solvedAtClue={q.solvedAtClue} size="lg" />
            <div className="w-full max-w-xl">
              <Leaderboard teams={state.teams} size="lg" />
            </div>
          </>
        ) : (
          <>
            <Timer remaining={timer.remaining} duration={timer.duration} running={timer.running} size="xl" />
            <ClueGrid clues={q.clues} size="lg" className="w-full" />
          </>
        )}
      </div>
    </Stage>
  );
}

function FinalStage({
  teams,
  winnerTeamId,
}: {
  teams: NonNullable<ReturnType<typeof useProjector>["state"]>["teams"];
  winnerTeamId: string | null;
}) {
  const winner = teams.find((t) => t.id === winnerTeamId);
  return (
    <Stage>
      <div className="flex flex-col items-center gap-8 text-center">
        <span className="font-sans text-xl uppercase tracking-widest text-amber">
          The Connection Champions
        </span>
        <h1 className="font-display text-7xl font-semibold">{winner?.name}</h1>
        <span className="font-display text-4xl text-muted">{winner?.score} points</span>
        <div className="mt-6 w-full max-w-xl">
          <Leaderboard teams={teams} size="lg" />
        </div>
      </div>
    </Stage>
  );
}

function StageMessage({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Stage>
      <div className="text-center">
        <h1 className="font-display text-5xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-2 font-sans text-xl text-muted">{subtitle}</p>}
      </div>
    </Stage>
  );
}

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-ink px-10 py-10">
      {children}
    </div>
  );
}
