import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  glow?: boolean;
}

export function Card({ className, children, hover = false, glow = false }: CardProps) {
  return (
    <div
      className={cn(
        // Premium relief: a top-edge light catch (card-sheen), a top→bottom
        // sheen fill, a defined hairline ring outline beyond the border, and a
        // 3-layer drop shadow that clearly lifts the box off the canvas. Hover
        // deepens the shadow and the ring picks up a faint accent tint.
        "card-sheen rounded-2xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 p-6",
        "shadow-[0_1px_2px_rgba(15,23,42,0.05),0_8px_18px_-8px_rgba(15,23,42,0.12),0_22px_46px_-24px_rgba(15,23,42,0.16)]",
        "ring-1 ring-black/[0.04] transition-[box-shadow,transform] duration-200",
        "hover:shadow-[0_2px_5px_rgba(15,23,42,0.07),0_30px_58px_-28px_rgba(13,148,136,0.22)] hover:ring-[var(--accent)]/15",
        hover && "card-hover cursor-pointer",
        glow && "shadow-lg shadow-[var(--accent)]/5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h3 className={cn("text-base font-semibold text-[var(--text-primary)]", className)}>
      {children}
    </h3>
  );
}
