"use client";

import type { ReactNode } from "react";

/**
 * WordsReveal — splits a string by words and reveals each with a stagger.
 * Use `accent` to wrap specific words in italic display-serif gradient.
 *
 * Children variant accepts arbitrary node and just animates as one block.
 */
export function WordsReveal({
  text,
  className = "",
  accentRange,
  perWord = 0.07,
  startDelay = 0.05,
}: {
  text: string;
  className?: string;
  /** [startWordIdx, endWordIdx] (inclusive, 0-based) — gets serif gradient styling */
  accentRange?: [number, number];
  perWord?: number;
  startDelay?: number;
}) {
  const words = text.split(/\s+/);
  return (
    <span className={className}>
      {words.map((w, i) => {
        const isAccent =
          accentRange && i >= accentRange[0] && i <= accentRange[1];
        return (
          <span key={i} className="inline-block whitespace-pre">
            <span
              className={`word-reveal-item ${isAccent ? "font-display gradient-text-anim" : ""}`}
              style={{ animationDelay: `${startDelay + i * perWord}s` }}
            >
              {w}
            </span>
            {i < words.length - 1 && <span> </span>}
          </span>
        );
      })}
    </span>
  );
}

export function FadeBlurIn({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span
      className={`word-reveal-item inline-block ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {children}
    </span>
  );
}
