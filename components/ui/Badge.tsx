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
          // « Couleurs » (2026-11-19): pastel indigo chip, fixed ink colours so
          // the label stays readable inside a `.band-bold` (where the text
          // variables turn white). #3730A3 on #EEF0FF ≈ 9:1.
          "border-[#D6D2FF] bg-gradient-to-r from-[#EEF0FF] to-[#F6EEFF] text-[#3730A3]":
            variant === "default",
          "border-emerald-200 bg-emerald-50 text-emerald-700":
            variant === "success",
          "border-amber-200 bg-amber-50 text-amber-700":
            variant === "warning",
          "border-red-200 bg-red-50 text-red-700": variant === "danger",
          // Vivid gradient pill (indigo → pink). White text ≥ 4.9:1 at both ends.
          "border-transparent bg-gradient-to-r from-[#4F46E5] to-[#DB2777] font-semibold text-white shadow-sm shadow-[#4F46E5]/25":
            variant === "accent",
          // Soft aqua tag. #155E75 on #E0F7FB ≈ 7:1.
          "border-[#BDEBF3] bg-[#E0F7FB] text-[#155E75]":
            variant === "subtle",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
