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
          "border-emerald-200 bg-emerald-50 text-emerald-700":
            variant === "success",
          "border-amber-200 bg-amber-50 text-amber-700":
            variant === "warning",
          "border-red-200 bg-red-50 text-red-700": variant === "danger",
          "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--accent)]":
            variant === "accent",
          "border-transparent bg-[var(--bg-elevated)] text-[var(--text-secondary)]":
            variant === "subtle",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
