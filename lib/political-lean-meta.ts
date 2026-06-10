// Types + display constants only — lives apart from lib/political-lean so
// client components can use them without bundling the 107 KB results JSON.

export type Bloc = "gauche" | "centre" | "droite" | "extreme_droite";

export interface PoliticalLean {
  lean: Bloc;
  topPct: number;
  blocs: Record<Bloc, number>;
  leanScore: number;
  insee: string;
  matchedBy?: string;
}

// Left → right display order (used for the stacked bar and the legend).
export const BLOC_ORDER: Bloc[] = ["gauche", "centre", "droite", "extreme_droite"];

export const BLOC_COLORS: Record<Bloc, string> = {
  gauche: "#E2334E",
  centre: "#F5A623",
  droite: "#2D6CDF",
  extreme_droite: "#1F3A5F",
};

export const BLOC_LABEL: Record<"fr" | "en", Record<Bloc, string>> = {
  fr: { gauche: "Gauche", centre: "Centre", droite: "Droite", extreme_droite: "Extrême droite" },
  en: { gauche: "Left", centre: "Center", droite: "Right", extreme_droite: "Far right" },
};
