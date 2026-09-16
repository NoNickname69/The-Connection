import { Link } from "react-router-dom";

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ink px-6 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <FourDots />

        <h1 className="mt-8 font-display text-5xl font-semibold tracking-tight text-paper sm:text-6xl">
          The Connection
        </h1>
        <p className="mt-4 font-sans text-lg text-muted">Four clues. One answer.</p>

        <div className="mt-12 flex w-full flex-col gap-3">
          <Link
            to="/host"
            className="rounded-xl bg-amber px-8 py-4 text-center font-sans text-lg font-semibold text-ink transition-transform active:scale-[0.98]"
          >
            Host game
          </Link>
          <Link
            to="/join"
            className="rounded-xl border border-ink-line bg-ink-panel px-8 py-4 text-center font-sans text-lg font-semibold text-paper transition-colors hover:border-amber/40 active:scale-[0.98]"
          >
            Join game
          </Link>
        </div>

        <Link
          to="/screen"
          className="mt-8 font-sans text-sm text-muted underline-offset-4 hover:text-paper hover:underline"
        >
          Open projector screen
        </Link>
      </div>
    </div>
  );
}

// Four nodes (the clues) converging into a single point (the answer) --
// a literal, restrained visual for a game called "The Connection".
function FourDots() {
  return (
    <svg width="220" height="72" viewBox="0 0 220 72" fill="none" aria-hidden="true">
      {[16, 74, 146, 204].map((x, i) => (
        <line
          key={i}
          x1={x}
          y1={14}
          x2={110}
          y2={58}
          stroke="#E8A33D"
          strokeWidth="1"
          strokeOpacity={0.35}
          className="animate-pulse-line"
          style={{ animationDelay: `${i * 180}ms` }}
        />
      ))}
      {[16, 74, 146, 204].map((x, i) => (
        <circle key={x} cx={x} cy={14} r={4} fill="#E8A33D" fillOpacity={0.8} />
      ))}
      <circle cx={110} cy={58} r={6} fill="#E8A33D" />
    </svg>
  );
}
