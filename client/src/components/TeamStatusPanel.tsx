import type { Team } from "../types";
import { cn } from "../lib/format";

const STATUS_STYLES: Record<Team["status"], { label: string; className: string }> = {
  active: { label: "Active", className: "text-circuit bg-circuit-dim" },
  locked: { label: "Locked", className: "text-alert bg-alert-dim" },
  correct: { label: "Correct", className: "text-amber bg-amber-dim" },
};

export function TeamStatusPanel({ teams }: { teams: Team[] }) {
  const sorted = [...teams].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((team) => {
        const status = STATUS_STYLES[team.status];
        return (
          <div
            key={team.id}
            className="flex items-center justify-between rounded-lg border border-ink-line bg-ink-panel px-4 py-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full",
                  team.connected ? "bg-circuit" : "bg-muted/50"
                )}
                title={team.connected ? "Connected" : "Disconnected"}
              />
              <span className="truncate font-sans font-medium">{team.name}</span>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-display tabular-nums text-amber">{team.score}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
                  status.className
                )}
              >
                {status.label}
              </span>
            </div>
          </div>
        );
      })}
      {sorted.length === 0 && (
        <p className="py-6 text-center text-sm text-muted">No teams yet.</p>
      )}
    </div>
  );
}
