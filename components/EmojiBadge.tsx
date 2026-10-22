// Pastille d'illustration : un emoji dans un médaillon dégradé coloré.
// Identité « Couleurs » (2026-10-22) : le propriétaire veut des sections et des
// articles illustrés, plus attrayants. Composant serveur, zéro JS.
//
// Les teintes restent dans les familles indigo / rose / ciel / cyan / lilas / pêche
// claire : ce sont des fonds pastel, jamais les couleurs pleines des paliers de score.

const TONES = {
  indigo: "from-[#E0E7FF] to-[#C7D2FE] ring-[#A5B4FC]/60",
  pink: "from-[#FCE7F3] to-[#FBCFE8] ring-[#F9A8D4]/60",
  sky: "from-[#E0F2FE] to-[#BAE6FD] ring-[#7DD3FC]/60",
  aqua: "from-[#CFFAFE] to-[#A5F3FC] ring-[#67E8F9]/60",
  lilac: "from-[#F3E8FF] to-[#E9D5FF] ring-[#D8B4FE]/60",
  peach: "from-[#FFEDE5] to-[#FFD9CC] ring-[#FDBA9F]/60",
} as const;

export type EmojiTone = keyof typeof TONES;
export const EMOJI_TONES = Object.keys(TONES) as EmojiTone[];

const SIZES = {
  sm: "h-9 w-9 text-lg rounded-xl",
  md: "h-12 w-12 text-2xl rounded-2xl",
  lg: "h-16 w-16 text-4xl rounded-2xl",
  xl: "h-20 w-20 text-5xl rounded-3xl",
} as const;

/** Teinte stable dérivée d'un index (rotation) ou d'une chaîne (slug). */
export function toneFor(key: number | string): EmojiTone {
  const n = typeof key === "number" ? key : [...key].reduce((s, c) => s + c.charCodeAt(0), 0);
  return EMOJI_TONES[Math.abs(n) % EMOJI_TONES.length];
}

export function EmojiBadge({
  emoji,
  tone = "indigo",
  size = "md",
  className = "",
}: {
  emoji: string;
  tone?: EmojiTone;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 select-none items-center justify-center bg-gradient-to-br shadow-sm ring-1 ${TONES[tone]} ${SIZES[size]} ${className}`}
    >
      <span className="leading-none">{emoji}</span>
    </span>
  );
}
