// Lives outside data/guides.ts so client components (GuidesGrid) can import
// the category list without bundling the multi-MB guides corpus.
//
// `glow` is the ambient wash behind the guide-page hero. Tailwind scans for
// literal class names, so it has to be spelled out — it cannot be derived from
// `color` at runtime.
//
// `color` is TEXT on the light canvas: the -400 hues it used to carry measured
// 1.7-2.7:1 (cyan-400 on white 1.81:1), far below WCAG AA's 4.5:1 (audit
// 2026-10-09). -700 keeps each category's hue and clears AA; `bg`/`glow`,
// which are fills, keep the brighter shades.
export const GUIDE_CATEGORIES = [
  { id: "teletravail", label: "Télétravail", emoji: "💻", color: "text-blue-700", bg: "bg-blue-400/10 border-blue-400/20", glow: "bg-blue-400" },
  { id: "famille", label: "Famille", emoji: "👨‍👩‍👧", color: "text-emerald-700", bg: "bg-emerald-400/10 border-emerald-400/20", glow: "bg-emerald-400" },
  { id: "budget", label: "Budget & Coût", emoji: "💰", color: "text-yellow-700", bg: "bg-yellow-400/10 border-yellow-400/20", glow: "bg-yellow-400" },
  { id: "lifestyle", label: "Style de vie", emoji: "🌅", color: "text-violet-700", bg: "bg-violet-400/10 border-violet-400/20", glow: "bg-violet-400" },
  { id: "region", label: "Par région", emoji: "🗺️", color: "text-orange-700", bg: "bg-orange-400/10 border-orange-400/20", glow: "bg-orange-400" },
  { id: "comparaison", label: "Comparaisons", emoji: "⚖️", color: "text-pink-700", bg: "bg-pink-400/10 border-pink-400/20", glow: "bg-pink-400" },
  { id: "tourisme", label: "À faire & voir", emoji: "🎯", color: "text-cyan-700", bg: "bg-cyan-400/10 border-cyan-400/20", glow: "bg-cyan-400" },
] as const;
