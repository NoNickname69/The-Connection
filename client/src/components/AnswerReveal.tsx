import { cn } from "../lib/format";

interface AnswerRevealProps {
  answer: string;
  solvedAtClue: number | null;
  size?: "sm" | "lg";
}

export function AnswerReveal({ answer, solvedAtClue, size = "sm" }: AnswerRevealProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center animate-spark-in">
      <span
        className={cn(
          "font-sans uppercase tracking-[0.2em] text-muted",
          size === "lg" ? "text-base" : "text-xs"
        )}
      >
        The answer is
      </span>
      <h2
        className={cn(
          "font-display font-semibold text-amber",
          size === "lg" ? "text-6xl md:text-7xl" : "text-3xl md:text-4xl"
        )}
      >
        {answer}
      </h2>
      <span className={cn("font-sans text-circuit", size === "lg" ? "text-lg" : "text-sm")}>
        {solvedAtClue ? `Solved at Clue ${solvedAtClue}` : "Nobody solved it"}
      </span>
    </div>
  );
}
