"use client";

// Decorative ambient background — fixed behind everything, very subtle.
// Floating leaves + slow color blobs. CSS-only, no JS animation cost.
export function AmbientBackground() {
  // Pre-randomized leaf positions / delays so they don't overlap awkwardly
  const leaves = [
    { left: "8%", delay: "0s", duration: "26s", size: 28, opacity: 0.15, hue: "#16A34A" },
    { left: "22%", delay: "5s", duration: "32s", size: 20, opacity: 0.12, hue: "#22C55E" },
    { left: "38%", delay: "12s", duration: "28s", size: 24, opacity: 0.13, hue: "#84CC16" },
    { left: "55%", delay: "3s", duration: "35s", size: 18, opacity: 0.10, hue: "#F59E0B" },
    { left: "68%", delay: "9s", duration: "30s", size: 26, opacity: 0.14, hue: "#16A34A" },
    { left: "82%", delay: "15s", duration: "33s", size: 22, opacity: 0.12, hue: "#22C55E" },
    { left: "92%", delay: "7s", duration: "27s", size: 16, opacity: 0.10, hue: "#84CC16" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Slow color blobs */}
      <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-[#22C55E]/8 blur-[120px] animate-blob-slow" />
      <div className="absolute top-1/3 -right-40 h-[600px] w-[600px] rounded-full bg-[#F59E0B]/6 blur-[140px] animate-blob-slower" />
      <div className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full bg-[#EC4899]/5 blur-[110px] animate-blob-slow" />

      {/* Floating leaves */}
      {leaves.map((leaf, i) => (
        <svg
          key={i}
          className="absolute animate-leaf-fall"
          style={{
            left: leaf.left,
            top: "-40px",
            width: leaf.size,
            height: leaf.size,
            opacity: leaf.opacity,
            animationDelay: leaf.delay,
            animationDuration: leaf.duration,
            color: leaf.hue,
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M11 20A7 7 0 0 1 4 13c0-4.51 4.06-7.27 11-9c-1.73 6.94-4.49 11-9 11h0Z" />
        </svg>
      ))}
    </div>
  );
}
