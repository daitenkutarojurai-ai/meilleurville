// The brand pin — single source of truth for the in-page logo.
//
// Geometry and colours are copied verbatim from app/icon.svg (the browser-tab
// favicon and PWA icons), so the header/footer logo and the favicon can never
// drift apart. The teal #0D9488 is hardcoded rather than var(--accent) on
// purpose: the favicon file can't read CSS variables, so the in-page mark
// stays pinned to the same hex to guarantee a visual match.

export function BrandMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" fill="#0D9488" />
      <path
        d="M16 4C11.13 4 7 8.13 7 13c0 8 9 15 9 15s9-7 9-15c0-4.87-4.13-9-9-9z"
        fill="white"
      />
      <circle cx="16" cy="13" r="3.5" fill="#0D9488" />
    </svg>
  );
}
