// The brand pin — single source of truth for the in-page logo.
//
// Geometry and colours are copied verbatim from app/icon.svg (the browser-tab
// favicon and PWA icons), so the header/footer logo and the favicon can never
// drift apart. The teal #4F46E5 is hardcoded rather than var(--accent) on
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
      <rect width="32" height="32" rx="7" fill="#4F46E5" />
      <rect x="2.25" y="2.25" width="27.5" height="27.5" rx="5" fill="none" stroke="white" strokeOpacity="0.85" strokeWidth="0.9" />
      <path d="M16 6C11.68 6 8 9.68 8 14c0 7.1 8 13.2 8 13.2s8-6.1 8-13.2c0-4.32-3.68-8-8-8z" fill="white" />
      <circle cx="16" cy="14" r="3.1" fill="#4F46E5" />
    </svg>
  );
}
