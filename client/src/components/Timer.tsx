import { formatTime, cn } from "../lib/format";

interface TimerProps {
  remaining: number;
  duration: number;
  running: boolean;
  size?: "sm" | "lg" | "xl";
}

export function Timer({ remaining, duration, running, size = "sm" }: TimerProps) {
  const pct = duration > 0 ? Math.max(0, Math.min(1, remaining / duration)) : 0;
  const critical = remaining <= 10 && remaining > 0;

  const textSize = size === "xl" ? "text-7xl md:text-8xl" : size === "lg" ? "text-4xl" : "text-2xl";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "font-display tabular-nums tracking-tight",
          textSize,
          critical ? "text-alert" : "text-paper",
          critical && running && "animate-pulse-line"
        )}
      >
        {formatTime(remaining)}
      </div>
      <div className="h-1 w-24 overflow-hidden rounded-full bg-ink-line">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-1000 ease-linear",
            critical ? "bg-alert" : "bg-amber"
          )}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
      {!running && remaining > 0 && (
        <span className="text-xs uppercase tracking-wider text-muted">Paused</span>
      )}
    </div>
  );
}
