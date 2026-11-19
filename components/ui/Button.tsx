"use client";
import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
          {
            "bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] text-white hover:from-[#4338CA] hover:to-[#6D28D9] active:scale-[0.98] shadow-lg shadow-[#7C3AED]/25":
              variant === "primary",
            "bg-white border border-[#C9C4FF] text-[#3730A3] shadow-sm shadow-[#4F46E5]/10 hover:bg-[#EEF0FF] hover:border-[#A5A0F8] active:scale-[0.98]":
              variant === "secondary",
            "text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)] active:scale-[0.98]":
              variant === "ghost",
            "bg-[var(--danger)]/10 border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger)]/20":
              variant === "danger",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-5 text-sm": size === "md",
            "h-12 px-7 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
export { Button };
