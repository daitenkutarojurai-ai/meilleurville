import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "accent" | "subtle";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        {
          "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-secondary)]":
            variant === "default",
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-400":
            variant === "success",
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-400":
            variant === "warning",
          "border-red-500/30 bg-red-500/10 text-red-400": variant === "danger",
          "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent)]":
            variant === "accent",
          "border-transparent bg-white/5 text-[var(--text-secondary)]":
            variant === "subtle",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
