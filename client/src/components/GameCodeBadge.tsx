import { cn } from "../lib/format";

export function GameCodeBadge({ code, size = "md" }: { code: string; size?: "md" | "lg" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-amber/30 bg-ink-raised px-6 py-3 font-display font-semibold tracking-[0.35em] text-amber shadow-glow",
        size === "lg" ? "text-5xl md:text-6xl" : "text-3xl"
      )}
    >
      {code}
    </div>
  );
}
