// Types + display constants only — lives apart from lib/political-lean so
// client components can use them without bundling the 107 KB results JSON.

export type Bloc = "gauche" | "centre" | "droite" | "extreme_droite";

export type CandidateKey =
  | "arthaud" | "roussel" | "melenchon" | "hidalgo" | "jadot" | "poutou"
  | "macron" | "pecresse" | "lassalle" | "lepen" | "zemmour" | "dupont-aignan";

export interface PoliticalLean {
  lean: Bloc;
  topPct: number;
  blocs: Record<Bloc, number>;
  leanScore: number;
  insee: string;
  matchedBy?: string;
  // Share of votes cast, per candidate. A candidate with zero votes in a
  // commune is absent from the map rather than present at 0.
  cands: Partial<Record<CandidateKey, number>>;
  topCand: CandidateKey | null;
  topCandPct: number;
  turnout: {
    inscrits: number;
    exprimes: number;
    abstentionPct: number;
    blancsNulsPct: number;
  };
}

export interface Candidate {
  key: CandidateKey;
  name: string;
  short: string;
  party: string;
  partyShort: string;
  bloc: Bloc;
  color: string;
}

// The 12 candidates of the 2022 first round, in ballot-panel order within each
// bloc. Colours are shades of the bloc colour so a per-candidate bar still
// reads as its family at a glance.
export const CANDIDATES: Candidate[] = [
  { key: "arthaud",       name: "Nathalie Arthaud", short: "Arthaud",      party: "Lutte ouvrière",              partyShort: "LO",    bloc: "gauche",         color: "#7F1D2B" },
  { key: "poutou",        name: "Philippe Poutou", short: "Poutou",       party: "Nouveau Parti anticapitaliste", partyShort: "NPA", bloc: "gauche",         color: "#9F2436" },
  { key: "roussel",       name: "Fabien Roussel", short: "Roussel",        party: "Parti communiste français",   partyShort: "PCF",   bloc: "gauche",         color: "#BF2B41" },
  { key: "melenchon",     name: "Jean-Luc Mélenchon", short: "Mélenchon",    party: "La France insoumise",         partyShort: "LFI",   bloc: "gauche",         color: "#E2334E" },
  { key: "hidalgo",       name: "Anne Hidalgo", short: "Hidalgo",          party: "Parti socialiste",            partyShort: "PS",    bloc: "gauche",         color: "#EC6E81" },
  { key: "jadot",         name: "Yannick Jadot", short: "Jadot",         party: "Europe Écologie Les Verts",   partyShort: "EELV",  bloc: "gauche",         color: "#4CAF50" },
  { key: "macron",        name: "Emmanuel Macron", short: "Macron",       party: "La République en marche",     partyShort: "LREM",  bloc: "centre",         color: "#F5A623" },
  { key: "lassalle",      name: "Jean Lassalle", short: "Lassalle",         party: "Résistons !",                 partyShort: "RES",   bloc: "droite",         color: "#7BA3E8" },
  { key: "pecresse",      name: "Valérie Pécresse", short: "Pécresse",      party: "Les Républicains",            partyShort: "LR",    bloc: "droite",         color: "#2D6CDF" },
  { key: "dupont-aignan", name: "Nicolas Dupont-Aignan", short: "Dupont-Aignan", party: "Debout la France",            partyShort: "DLF",   bloc: "extreme_droite", color: "#4A6B94" },
  { key: "zemmour",       name: "Éric Zemmour", short: "Zemmour",          party: "Reconquête",                  partyShort: "REC",   bloc: "extreme_droite", color: "#33517A" },
  { key: "lepen",         name: "Marine Le Pen", short: "Le Pen",         party: "Rassemblement national",      partyShort: "RN",    bloc: "extreme_droite", color: "#1F3A5F" },
];

export const CANDIDATE_BY_KEY: Record<CandidateKey, Candidate> = Object.fromEntries(
  CANDIDATES.map((c) => [c.key, c]),
) as Record<CandidateKey, Candidate>;

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
