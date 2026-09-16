import type { Clue } from "../types";
import { ClueCard } from "./ClueCard";
import { cn } from "../lib/format";

interface ClueGridProps {
  clues: (Clue | null)[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ClueGrid({ clues, size = "md", className }: ClueGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:gap-4", size === "lg" && "md:grid-cols-4", className)}>
      {clues.map((clue, i) => (
        <ClueCard key={i} index={i + 1} clue={clue} size={size} />
      ))}
    </div>
  );
}
