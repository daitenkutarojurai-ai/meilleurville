// Lives outside data/guides.ts so client components (GuidesGrid) can import
// the category list without bundling the multi-MB guides corpus.
//
// `glow` is the ambient wash behind the guide-page hero. Tailwind scans for
// literal class names, so it has to be spelled out — it cannot be derived from
// `color` at runtime.
export const GUIDE_CATEGORIES = [
  { id: "teletravail", label: "Télétravail", emoji: "💻", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20", glow: "bg-blue-400" },
  { id: "famille", label: "Famille", emoji: "👨‍👩‍👧", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20", glow: "bg-emerald-400" },
  { id: "budget", label: "Budget & Coût", emoji: "💰", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", glow: "bg-yellow-400" },
  { id: "lifestyle", label: "Style de vie", emoji: "🌅", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20", glow: "bg-violet-400" },
  { id: "region", label: "Par région", emoji: "🗺️", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", glow: "bg-orange-400" },
  { id: "comparaison", label: "Comparaisons", emoji: "⚖️", color: "text-pink-400", bg: "bg-pink-400/10 border-pink-400/20", glow: "bg-pink-400" },
  { id: "tourisme", label: "À faire & voir", emoji: "🎯", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20", glow: "bg-cyan-400" },
] as const;
