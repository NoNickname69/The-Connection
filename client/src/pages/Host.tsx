import { useState, type ReactNode } from "react";
import { useHostGame } from "../hooks/useHostGame";
import { GameCodeBadge } from "../components/GameCodeBadge";
import { ClueGrid } from "../components/ClueGrid";
import { Timer } from "../components/Timer";
import { TeamStatusPanel } from "../components/TeamStatusPanel";
import { Leaderboard } from "../components/Leaderboard";
import { AnswerReveal } from "../components/AnswerReveal";
import { cn } from "../lib/format";

export function Host() {
  const host = useHostGame();
  const { state } = host;

  if (!state || state.status === "lobby") {
    return <HostLobby host={host} />;
  }
  if (state.status === "playing") {
    return <HostQuestion host={host} />;
  }
  return <HostFinal host={host} />;
}

function HostLobby({ host }: { host: ReturnType<typeof useHostGame> }) {
  const { state, code, error, createGame, startGame, removeTeam } = host;

  if (!code) {
    return (
      <Shell>
        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <h1 className="font-display text-4xl font-semibold">Host a game</h1>
          <p className="max-w-sm font-sans text-muted">
            Create a game code, then have teams join from their phones at{" "}
            <span className="text-paper">/join</span>.
          </p>
          <button
            onClick={createGame}
            className="rounded-xl bg-amber px-8 py-4 font-sans text-lg font-semibold text-ink"
          >
            Create game
          </button>
          {error && <p className="text-sm text-alert">{error}</p>}
        </div>
      </Shell>
    );
  }

  const teams = state?.teams ?? [];

  return (
    <Shell>
      <div className="flex flex-1 flex-col items-center gap-8 py-10">
        <div className="flex flex-col items-center gap-3">
          <span className="font-sans text-sm uppercase tracking-widest text-muted">Game code</span>
          <GameCodeBadge code={code} size="lg" />
        </div>

        <div className="w-full max-w-md">
          <h2 className="mb-3 font-sans text-sm font-medium uppercase tracking-wide text-muted">
            Teams ({teams.length})
          </h2>
          <div className="flex flex-col gap-2">
            {teams.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-lg border border-ink-line bg-ink-panel px-4 py-3"
              >
                <span className="font-sans font-medium">{t.name}</span>
                <button
                  onClick={() => removeTeam(t.id)}
                  className="text-sm text-muted hover:text-alert"
                >
                  Remove
                </button>
              </div>
            ))}
            {teams.length === 0 && (
              <p className="rounded-lg border border-dashed border-ink-line py-6 text-center text-sm text-muted">
                Waiting for teams to join...
              </p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-alert">{error}</p>}

        <button
          onClick={() => startGame()}
          disabled={teams.length === 0}
          className="rounded-xl bg-amber px-10 py-4 font-sans text-lg font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start game
        </button>
      </div>
    </Shell>
  );
}

function HostQuestion({ host }: { host: ReturnType<typeof useHostGame> }) {
  const { state, revealClue, pauseTimer, resumeTimer, revealAnswer, nextQuestion, error } = host;
  const q = state!.question!;
  const timer = state!.timer!;
  const phase = state!.questionPhase;
  const allRevealed = q.revealedClueCount >= 4;
  const answerRevealed = phase === "answer_revealed";

  return (
    <Shell>
      <div className="flex flex-1 flex-col gap-6 py-6">
        <div className="flex items-center justify-between rounded-xl border border-ink-line bg-ink-panel px-6 py-4">
          <div>
            <p className="font-sans text-xs uppercase tracking-widest text-amber">
              Round {q.round} · {q.roundName}
            </p>
            <p className="font-display text-2xl font-semibold">
              Question {q.questionNumberInRound} / {q.totalQuestionsInRound}
            </p>
          </div>
          <Timer remaining={timer.remaining} duration={timer.duration} running={timer.running} size="lg" />
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="flex flex-col gap-6">
            {answerRevealed ? (
              <div className="rounded-2xl border border-ink-line bg-ink-panel px-6 py-8">
                <AnswerReveal answer={q.answer!} solvedAtClue={q.solvedAtClue} />
              </div>
            ) : (
              <ClueGrid clues={q.clues} size="md" />
            )}

            <div className="flex flex-wrap gap-3">
              {!answerRevealed && (
                <>
                  <ControlButton onClick={() => revealClue()} disabled={allRevealed || phase === "timeup"}>
                    Reveal next clue
                  </ControlButton>
                  {timer.running ? (
                    <ControlButton onClick={() => pauseTimer()} variant="ghost">
                      Pause
                    </ControlButton>
                  ) : (
                    <ControlButton
                      onClick={() => resumeTimer()}
                      variant="ghost"
                      disabled={phase === "timeup" || timer.remaining === 0}
                    >
                      Resume
                    </ControlButton>
                  )}
                  <ControlButton onClick={() => revealAnswer()} variant="circuit">
                    Reveal answer
                  </ControlButton>
                </>
              )}
              {answerRevealed && (
                <ControlButton onClick={() => nextQuestion()} variant="circuit">
                  Next question
                </ControlButton>
              )}
              <EndGameButton host={host} />
            </div>
            {error && <p className="text-sm text-alert">{error}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-sans text-sm font-medium uppercase tracking-wide text-muted">Teams</h2>
            <TeamStatusPanel teams={state!.teams} />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function HostFinal({ host }: { host: ReturnType<typeof useHostGame> }) {
  const { state } = host;
  const winner = state?.teams.find((t) => t.id === state.winnerTeamId);

  return (
    <Shell>
      <div className="flex flex-1 flex-col items-center gap-8 py-10">
        {winner && (
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="font-sans text-sm uppercase tracking-widest text-amber">
              The Connection champions
            </span>
            <h1 className="font-display text-5xl font-semibold">{winner.name}</h1>
            <span className="font-display text-2xl text-muted">{winner.score} points</span>
          </div>
        )}
        <div className="w-full max-w-md">
          <h2 className="mb-3 text-center font-sans text-sm font-medium uppercase tracking-wide text-muted">
            Final leaderboard
          </h2>
          <Leaderboard teams={state?.teams ?? []} />
        </div>
      </div>
    </Shell>
  );
}

function EndGameButton({ host }: { host: ReturnType<typeof useHostGame> }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-sans text-sm text-muted">End the game for everyone?</span>
        <ControlButton variant="alert" onClick={() => host.endGame()}>
          Yes, end it
        </ControlButton>
        <ControlButton variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </ControlButton>
      </div>
    );
  }
  return (
    <ControlButton variant="alert" onClick={() => setConfirming(true)}>
      End game
    </ControlButton>
  );
}

function ControlButton({
  children,
  onClick,
  disabled,
  variant = "amber",
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "amber" | "ghost" | "circuit" | "alert";
}) {
  const styles = {
    amber: "bg-amber text-ink",
    circuit: "bg-circuit text-ink",
    alert: "border border-alert/50 text-alert bg-transparent",
    ghost: "border border-ink-line text-paper bg-transparent",
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-lg px-5 py-2.5 font-sans text-sm font-semibold transition-opacity disabled:cursor-not-allowed disabled:opacity-30",
        styles
      )}
    >
      {children}
    </button>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6">
      <header className="flex items-center justify-between py-6">
        <span className="font-display text-lg font-semibold tracking-tight">The Connection</span>
        <span className="font-sans text-xs uppercase tracking-widest text-muted">Host</span>
      </header>
      {children}
    </div>
  );
}
