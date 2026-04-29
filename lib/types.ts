export type LifestagePersona = "famille" | "remote" | "retraite" | "etudiant" | "solo";

export interface CityScore {
  global: number;
  life: number;
  transport: number;
  nature: number;
  cost: number;
  safety: number;
  culture: number;
  remoteWork: number;
  schools: number;
}

export interface City {
  id: string;
  slug: string;
  name: string;
  region: string | null;
  department: string | null;
  population: number | null;
  latitude: number | null;
  longitude: number | null;
  scores: CityScore;
  characterTags: string[];
  reviewCount: number;
  sunshinedays: number | null;
  avgTempJuly: number | null;
  avgTempJanuary: number | null;
}

export interface Review {
  id: string;
  cityId: string | null;
  body: string;
  scoreGlobal: number;
  lifestyleTags: string[];
  pros: string | null;
  cons: string | null;
  livedHere: boolean;
  helpfulVotes: number;
  createdAt: string;
  user: { handle: string | null; badgeLevel: string } | null;
}

export interface QuizAnswers {
  environment: "mer" | "montagne" | "campagne" | "ville";
  situation: "seul" | "couple" | "famille" | "retraite";
  budget: number;
  priorities: string[];
  workStyle: "presentiel" | "hybride" | "remote" | "independant";
  climate?: "soleil" | "tempere" | "ocean" | "montagne";
  currentCityMiss?: string;
}

export interface MatchResult {
  city: City;
  score: number;
  breakdown: Record<string, number>;
  topReason: string;
}

export interface RankingEntry {
  rank: number;
  score: number;
  delta: number;
  city: City;
}

export interface Ranking {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  year: number;
  entries: RankingEntry[];
}
