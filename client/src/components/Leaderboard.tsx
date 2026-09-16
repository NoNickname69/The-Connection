import { useLayoutEffect, useRef } from "react";
import type { Team } from "../types";
import { cn } from "../lib/format";

const MEDALS = ["#F5C067", "#C7CBD6", "#B8804A"];

interface LeaderboardProps {
  teams: Team[];
  size?: "sm" | "lg";
}

export function Leaderboard({ teams, size = "sm" }: LeaderboardProps) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevRects = useRef<Map<string, DOMRect>>(new Map());

  // FLIP: capture previous positions before paint, then animate from the
  // old position to the new one whenever a team's rank changes.
  useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRect>();
    rowRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect();
      nextRects.set(id, rect);
      const prev = prevRects.current.get(id);
      if (prev) {
        const deltaY = prev.top - rect.top;
        if (deltaY !== 0) {
          el.style.transition = "none";
          el.style.transform = `translateY(${deltaY}px)`;
          requestAnimationFrame(() => {
            el.style.transition = "transform 480ms cubic-bezier(0.16,1,0.3,1)";
            el.style.transform = "translateY(0)";
          });
        }
      }
    });
    prevRects.current = nextRects;
  }, [sorted.map((t) => t.id + t.score).join(",")]);

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((team, i) => (
        <div
          key={team.id}
          ref={(el) => {
            if (el) rowRefs.current.set(team.id, el);
            else rowRefs.current.delete(team.id);
          }}
          className={cn(
            "flex items-center justify-between rounded-xl border border-ink-line bg-ink-panel",
            size === "lg" ? "px-8 py-5" : "px-4 py-3"
          )}
        >
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "font-display font-semibold tabular-nums",
                size === "lg" ? "text-3xl" : "text-lg",
                i < 3 ? "" : "text-muted"
              )}
              style={i < 3 ? { color: MEDALS[i] } : undefined}
            >
              {i + 1}
            </span>
            <span className={cn("font-sans font-medium", size === "lg" ? "text-2xl" : "text-base")}>
              {team.name}
            </span>
          </div>
          <span
            className={cn(
              "font-display tabular-nums text-amber",
              size === "lg" ? "text-3xl" : "text-lg"
            )}
          >
            {team.score}
          </span>
        </div>
      ))}
    </div>
  );
}
