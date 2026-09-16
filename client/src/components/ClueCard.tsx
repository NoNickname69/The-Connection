import type { Clue } from "../types";
import { cn } from "../lib/format";

interface ClueCardProps {
  index: number; // 1-4
  clue: Clue | null; // null = not yet revealed
  size?: "sm" | "md" | "lg";
}

export function ClueCard({ index, clue, size = "md" }: ClueCardProps) {
  const revealed = clue !== null;

  const padding = size === "lg" ? "p-8 md:p-10" : size === "sm" ? "p-3" : "p-5";
  const labelSize = size === "lg" ? "text-sm" : "text-xs";
  const contentSize =
    size === "lg" ? "text-3xl md:text-5xl" : size === "sm" ? "text-base" : "text-xl md:text-2xl";

  return (
    <div
      className={cn(
        "relative flex min-h-[7rem] flex-col justify-between rounded-2xl border transition-all duration-300",
        padding,
        revealed
          ? "animate-spark-in border-amber/40 bg-ink-raised shadow-glow"
          : "border-ink-line bg-ink-panel/60"
      )}
    >
      <span
        className={cn(
          "font-sans font-medium uppercase tracking-widest",
          labelSize,
          revealed ? "text-amber" : "text-muted/60"
        )}
      >
        Clue {index}
      </span>

      {revealed ? (
        <ClueContent clue={clue} className={cn("font-display font-medium leading-tight text-paper", contentSize)} />
      ) : (
        <div className="flex items-center gap-2 text-muted/50">
          <LockIcon />
          <span className={cn("font-sans", size === "lg" ? "text-lg" : "text-sm")}>Locked</span>
        </div>
      )}
    </div>
  );
}

function ClueContent({ clue, className }: { clue: Clue; className?: string }) {
  if (clue.type === "image") {
    return (
      <img
        src={clue.content}
        alt={`Clue ${clue.type}`}
        className="mt-2 max-h-40 w-auto rounded-lg object-contain"
      />
    );
  }
  if (clue.type === "audio") {
    return (
      <audio controls src={clue.content} className="mt-2 w-full">
        Your browser does not support audio playback.
      </audio>
    );
  }
  return <p className={className}>{clue.content}</p>;
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
      <rect x="5" y="11" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
