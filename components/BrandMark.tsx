// The brand pin — single source of truth for the in-page logo.
//
// Geometry and colours are copied verbatim from app/icon.svg (favicon, PWA and
// Apple icons are rendered from that file), so the header/footer logo and the
// favicon can never drift apart. Colours are hardcoded rather than CSS variables
// on purpose: the favicon file can't read them.
//
// 2026-10-22 (« Couleurs »): indigo → violet → pink gradient, white pin with a
// house. The old thin white keyline is gone: it turned to mush at 16 px, which
// is the size Google shows next to a search result.

import { useId } from "react";

export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  const id = `bm-${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4F46E5" />
          <stop offset="0.55" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="11" fill={`url(#${id})`} />
      <path d="M24 7.5c-7.2 0-13 5.6-13 12.6C11 30 24 41 24 41s13-11 13-20.9C37 13.1 31.2 7.5 24 7.5z" fill="#fff" />
      <path d="M17.6 21.6 24 16l6.4 5.6V28h-4.3v-4.2h-4.2V28h-4.3z" fill="#5B3FE0" />
    </svg>
  );
}
