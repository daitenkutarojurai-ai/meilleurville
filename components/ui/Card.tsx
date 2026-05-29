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
        // Premium relief: layered soft shadow lifts the box off the canvas, a
        // hairline top highlight (inset) reads as a subtle emboss, and the
        // border is the crisp "outline". Hover deepens the shadow slightly.
        "rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_24px_-14px_rgba(15,23,42,0.12)]",
        "ring-1 ring-inset ring-white/50 transition-shadow duration-200",
        "hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_16px_36px_-18px_rgba(15,23,42,0.18)]",
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
