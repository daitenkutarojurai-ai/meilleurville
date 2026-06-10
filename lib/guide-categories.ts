// Lives outside data/guides.ts so client components (GuidesGrid) can import
// the category list without bundling the multi-MB guides corpus.
export const GUIDE_CATEGORIES = [
  { id: "teletravail", label: "Télétravail", emoji: "💻", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { id: "famille", label: "Famille", emoji: "👨‍👩‍👧", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  { id: "budget", label: "Budget & Coût", emoji: "💰", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { id: "lifestyle", label: "Style de vie", emoji: "🌅", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  { id: "region", label: "Par région", emoji: "🗺️", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { id: "comparaison", label: "Comparaisons", emoji: "⚖️", color: "text-pink-400", bg: "bg-pink-400/10 border-pink-400/20" },
  { id: "tourisme", label: "À faire & voir", emoji: "🎯", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
] as const;
