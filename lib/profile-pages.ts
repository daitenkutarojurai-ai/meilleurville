// F19 — Pages "Pour qui" thématiques.
//
// 10 profils éditoriaux, chacun = recombinaison pondérée des axes seed +
// owner-scores. Top 20 villes par profil + intro/méthodo personnalisée.
// Aucune nouvelle donnée — pure recombinaison.

import type { CitySeed } from "@/data/cities-seed";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSING } from "@/data/housing";
import { computeOwnerScores } from "@/lib/owner-scores";
import { computeSportLeisure } from "@/lib/sport-leisure";
import { rentalTension } from "@/lib/rental-tension";

type ScoreWeights = Partial<{
  // Axes seed (CityScore)
  life: number;
  transport: number;
  nature: number;
  cost: number;
  safety: number;
  culture: number;
  remoteWork: number;
  schools: number;
  // Owner scores (lib/owner-scores)
  canicule: number;
  solitude: number;
  bruit: number;
  securiteNocturne: number;
  sansVoiture: number;
  teletravail: number;
  qualiteAir: number;
  securiteFemmeSeule: number;
  jeuneActif: number;
  famille: number;
  // Cluster composites (F70 sport, R8.2 tension, dérivé investisseurs)
  sportLeisure: number;
  rentalTension: number;
  investorYield: number;
}>;

export interface ProfileDef {
  slug: string;
  emoji: string;
  label: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  weights: ScoreWeights;
  reasonHint: (city: CitySeed) => string;
}

function ownerVal(city: CitySeed, key: string): number {
  const s = computeOwnerScores(city);
  switch (key) {
    case "canicule": return s.find((x) => x.key === "score_canicule")!.value;
    case "solitude": return s.find((x) => x.key === "score_solitude")!.value;
    case "bruit": return s.find((x) => x.key === "score_bruit")!.value;
    case "securiteNocturne": return s.find((x) => x.key === "score_securite_nocturne")!.value;
    case "sansVoiture": return s.find((x) => x.key === "score_sans_voiture")!.value;
    case "teletravail": return s.find((x) => x.key === "score_teletravail")!.value;
    case "qualiteAir": return s.find((x) => x.key === "score_qualite_air")!.value;
    case "securiteFemmeSeule": return s.find((x) => x.key === "score_securite_femme_seule")!.value;
    case "jeuneActif": return s.find((x) => x.key === "score_jeune_actif")!.value;
    case "famille": return s.find((x) => x.key === "score_famille")!.value;
  }
  return 5;
}

// Rendement locatif brut estimé (T2 ~ 45 m²) sur 0-10.
// Yield % = (avgRentT2 × 12) / (45 × avgBuyPriceM2) × 100, normalisé linéairement
// 3 % → 0, 10 % → 10. Fallback (pas de HOUSING) : proxy coût + neutre.
// Pénalité de liquidité : un sous-30 k habitants implique pool locataires plus
// mince et revente plus longue — on déprécie le rendement brut affiché en
// conséquence (un 10 % théorique dans une ville de 12 k = 4,5 % effectif).
export function investorYield(city: CitySeed): number {
  const h = HOUSING[city.slug];
  if (!h) {
    return Math.max(0, Math.min(10, (10 - city.scores.cost) * 0.6 + 2.5));
  }
  const yieldPct = (h.avgRentT2 * 12) / (45 * h.avgBuyPriceM2) * 100;
  const base = (yieldPct - 3) * (10 / 7);
  const pop = city.population ?? 0;
  const liquidity =
    pop < 20000 ? 0.45 :
    pop < 50000 ? 0.62 :
    pop < 100000 ? 0.85 : 1.0;
  return Math.max(0, Math.min(10, base * liquidity));
}

function getScoreValue(city: CitySeed, key: string): number {
  // Axes seed
  if (["life", "transport", "nature", "cost", "safety", "culture", "remoteWork", "schools"].includes(key)) {
    return city.scores[key as keyof typeof city.scores];
  }
  // Cluster composites
  if (key === "sportLeisure") return computeSportLeisure(city).composite;
  if (key === "rentalTension") return rentalTension(city);
  if (key === "investorYield") return investorYield(city);
  return ownerVal(city, key);
}

export const PROFILE_PAGES: ProfileDef[] = [
  {
    slug: "familles-avec-enfants",
    emoji: "👨‍👩‍👧",
    label: "Familles avec enfants",
    metaTitle: "Meilleures villes familles avec enfants 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises adaptées aux familles avec enfants : écoles, sécurité, espaces verts, coût accessible. Score composite calibré sur Insee + DEPP + SSMSI.",
    intro:
      "Familles avec enfants : la combinaison qui compte vraiment, c'est écoles + sécurité + espaces verts + coût accessible. Pas le top 5 du palmarès culture ou nightlife — les familles ne s'y intéressent pas. Ce classement reflète l'arbitrage réel.",
    weights: { schools: 2.5, safety: 2.0, famille: 2.0, nature: 1.5, cost: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Écoles ${c.scores.schools.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "jeunes-actifs",
    emoji: "🚀",
    label: "Jeunes actifs",
    metaTitle: "Meilleures villes jeunes actifs 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour jeunes actifs 25-35 ans : carrière + culture + télétravail + coût accessible. Calibré sur démographie et SIRENE.",
    intro:
      "Jeunes actifs : il faut un cocktail spécifique — un marché de l'emploi qui bouge, une scène culturelle qui ne s'arrête pas à 22 h, des loyers où on peut commencer sans hériter, et un réseau pour se faire des amis. Ces 20 villes cochent tout ça.",
    weights: { jeuneActif: 2.5, culture: 2.0, remoteWork: 1.5, cost: 1.5, life: 1.0 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · télétravail ${c.scores.remoteWork.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "retraites",
    emoji: "🌅",
    label: "Retraités",
    metaTitle: "Meilleures villes retraités 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour retraités : santé, sécurité, climat doux, calme, coût accessible. Sélection 2026 calibrée.",
    intro:
      "Retraités : santé d'abord, sécurité ensuite, climat agréable, qualité de vie quotidienne. Le coût compte mais moins que pour des actifs (la pension est fixe — c'est la valeur de l'immobilier déjà acquis qui importe). Ces 20 villes maximisent ce mélange.",
    weights: { safety: 2.5, life: 2.5, nature: 1.5, securiteNocturne: 1.5, qualiteAir: 1.5, canicule: 1.0 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "freelances",
    emoji: "💼",
    label: "Freelances et indépendants",
    metaTitle: "Meilleures villes freelances 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour freelances et indépendants : fibre + coworking + culture + coût optimisé. Calibré 2026.",
    intro:
      "Freelances : fibre, coworking, communauté locale d'indépendants, qualité de vie pour ne pas crever sous le travail. Ces 20 villes ont le bon mélange — pas juste les grandes métros, plusieurs villes moyennes en montée s'y glissent.",
    weights: { remoteWork: 2.5, teletravail: 2.0, culture: 1.5, life: 1.5, cost: 1.0, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Télétravail ${c.scores.remoteWork.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "teletravailleurs",
    emoji: "💻",
    label: "Télétravailleurs salariés",
    metaTitle: "Meilleures villes télétravail salarié 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour salarié·e·s en télétravail : fibre, qualité de vie, accès week-end, coût raisonnable. Calibré 2026.",
    intro:
      "Salariés en télétravail : différents des freelances. Vous gardez votre employeur (souvent parisien), donc l'éloignement coûte zéro côté carrière mais beaucoup côté loyer. Ces 20 villes optimisent le rapport qualité de vie / connectivité / accessibilité Paris.",
    weights: { remoteWork: 2.5, teletravail: 2.0, life: 2.0, transport: 1.5, nature: 1.5, cost: 1.0 },
    reasonHint: (c) =>
      `Télétravail ${c.scores.remoteWork.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "etudiants",
    emoji: "🎓",
    label: "Étudiants",
    metaTitle: "Meilleures villes étudiantes 2026 — Top 20 France",
    metaDescription: "Top 20 villes étudiantes en France : universités, culture, transports, coût logement étudiant abordable. Calibré 2026.",
    intro:
      "Étudiants : universités, vie nocturne, transports, et surtout des loyers compatibles avec une bourse Crous. Ces 20 villes ont le mélange — Toulouse, Montpellier, Rennes en tête sans surprise, mais aussi des petites villes universitaires sous-cotées.",
    weights: { culture: 2.0, transport: 2.0, cost: 2.0, schools: 1.5, jeuneActif: 1.5 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "sans-voiture",
    emoji: "🚲",
    label: "Vivre sans voiture",
    metaTitle: "Meilleures villes pour vivre sans voiture 2026 — Top 20",
    metaDescription: "Top 20 villes françaises où vivre sans voiture : tram, métro, bus, vélo. Score sans-voiture propriétaire + transport.",
    intro:
      "Si vous voulez vivre sans permis ou simplement laisser la voiture au garage, ces 20 villes ont le réseau pour. Le score combine la densité du tram/métro/bus avec la walkability et le réseau cyclable.",
    weights: { sansVoiture: 3.0, transport: 2.0, life: 1.5, culture: 1.0 },
    reasonHint: (c) =>
      `Transport ${c.scores.transport.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "premium",
    emoji: "✨",
    label: "Vie premium",
    metaTitle: "Villes françaises premium 2026 — Top 20",
    metaDescription: "Top 20 villes françaises premium : qualité de vie haut de gamme, sécurité, cadre exceptionnel, écoles + culture. Pour budgets > 4 000 €/mois.",
    intro:
      "Vie premium : pas une question de prestige, mais de combinaison rare. Sécurité élevée, cadre exceptionnel, écoles renommées, scène culturelle riche, et un coût qui reflète tout ça. Ces 20 villes sont pour les budgets ≥ 4 000 €/mois.",
    weights: { life: 2.5, safety: 2.0, schools: 1.5, culture: 1.5, nature: 1.5 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "solo-femme",
    emoji: "👤",
    label: "Femme seule",
    metaTitle: "Meilleures villes femme seule 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises adaptées aux femmes seules : sécurité nocturne, densité transport tardif, qualité de vie urbaine.",
    intro:
      "Femme seule : sécurité globale ne suffit pas — il faut sécurité nocturne ET transport tardif. Ces 20 villes maximisent le retour soir serein, sans renoncer à la qualité de vie urbaine et culturelle.",
    weights: { securiteFemmeSeule: 3.0, securiteNocturne: 2.0, transport: 1.5, culture: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Sécurité ${c.scores.safety.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "couple-sans-enfant",
    emoji: "👫",
    label: "Couple sans enfant",
    metaTitle: "Meilleures villes couple sans enfant 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour couples sans enfant : culture, restaurants, sorties, week-ends nature, transport. Score composite calibré 2026.",
    intro:
      "Couple sans enfant : les écoles ne pèsent rien dans l'arbitrage, et avec deux salaires le coût du logement passe au second plan. Ce qui compte vraiment, c'est une scène culturelle vivante, des restaurants et des sorties qui ne ferment pas à 22 h, une nature accessible pour les week-ends à deux, et des transports qui suivent. Ces 20 villes maximisent exactement ce mélange.",
    weights: { culture: 2.5, life: 2.0, jeuneActif: 1.5, nature: 1.5, transport: 1.5, remoteWork: 1.0 },
    reasonHint: (c) =>
      `Culture ${c.scores.culture.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "expat-retour",
    emoji: "✈️",
    label: "Retour d'expatriation",
    metaTitle: "Meilleures villes retour expatriation 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour Français rentrant d'expatriation : qualité de vie + international + frontalières. Suisse, Lux, UK, Canada inclus.",
    intro:
      "Retour d'expat : transition entre un mode de vie international (souvent confort élevé) et une rentrée française. Ces 20 villes combinent qualité de vie, accessibilité internationale (aéroports, frontalières) et un cadre qui ne dépaysera pas trop.",
    weights: { life: 2.5, culture: 1.5, transport: 2.0, remoteWork: 1.5, safety: 1.5, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Qualité de vie ${c.scores.life.toFixed(1)} · culture ${c.scores.culture.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "primo-accedants",
    emoji: "🔑",
    label: "Primo-accédants",
    metaTitle: "Meilleures villes primo-accédants 2026 — Top 20 France",
    metaDescription: "Top 20 villes françaises pour acheter son premier logement : prix au m² accessibles, qualité de vie correcte, sécurité, transport. Sélection 2026.",
    intro:
      "Primo-accédants : le premier achat se joue d'abord sur le prix au m². Pas la peine de viser une métropole où le ticket d'entrée pour un T3 correct dépasse 350 000 € — la mensualité étouffe tout le reste. Ces 20 villes mettent en avant un prix d'achat raisonnable sans sacrifier la qualité de vie quotidienne ni la valeur de revente à 10 ans.",
    weights: { cost: 3.0, life: 1.5, safety: 1.5, transport: 1.0, nature: 1.0, schools: 1.0, jeuneActif: 1.0 },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "familles-monoparentales",
    emoji: "👩‍👧",
    label: "Familles monoparentales",
    metaTitle: "Meilleures villes familles monoparentales 2026 — Top 20",
    metaDescription: "Top 20 villes pour parents solos : coût accessible avec un seul revenu, sécurité, écoles, transport, services famille. Sélection 2026 calibrée.",
    intro:
      "Familles monoparentales : un seul revenu, des contraintes d'organisation doublées et zéro marge sur le budget. Le triangle qui compte vraiment, c'est coût accessible, sécurité (jour et soir) et école proche d'un transport efficace. Le réseau de garde et les services famille font la différence entre survivre et tenir. Ces 20 villes maximisent ce mélange — souvent des préfectures moyennes plus que des grandes métropoles, parce qu'elles concentrent les services à un coût soutenable.",
    weights: {
      cost: 2.5,
      safety: 2.0,
      schools: 2.0,
      transport: 1.5,
      famille: 1.5,
      securiteFemmeSeule: 1.0,
      life: 1.0,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)}`,
  },
  {
    slug: "familles-nombreuses",
    emoji: "👨‍👩‍👧‍👦",
    label: "Familles nombreuses",
    metaTitle: "Meilleures villes familles nombreuses 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour familles nombreuses : logement spacieux abordable, écoles, sécurité, espaces verts. Score composite calibré 2026.",
    intro:
      "Familles nombreuses : trois enfants ou plus, et tout change d'échelle. Le critère qui domine, c'est le logement — il faut un T4 ou un T5, et dans une métropole tendue le ticket d'entrée devient vite infranchissable. Vient ensuite la capacité des écoles, la sécurité, et des espaces verts où plusieurs enfants peuvent réellement respirer. Ces 20 villes mettent en avant l'espace abordable sans sacrifier les services. Souvent des villes moyennes plutôt que de grandes métropoles : elles offrent le mètre carré qui manque ailleurs.",
    weights: {
      cost: 2.5,
      schools: 2.0,
      famille: 2.0,
      nature: 2.0,
      safety: 1.5,
      life: 1.0,
    },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)} · nature ${c.scores.nature.toFixed(1)}`,
  },
  {
    slug: "amateurs-de-plein-air",
    emoji: "🥾",
    label: "Amateurs de plein air",
    metaTitle: "Meilleures villes nature et plein air 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour les amateurs de plein air : accès nature, air respirable, climat tempéré pour rando, vélo, mer. Score composite calibré 2026.",
    intro:
      "Amateurs de plein air : votre semaine se construit autour de ce qui se passe dehors — la rando du week-end, le vélo après le boulot, la baignade ou la montagne à portée. Le critère qui domine reste l'accès à la nature, mais il ne suffit pas seul. Un air respirable change tout quand on passe ses journées dehors, et un climat tempéré évite les étés où la moindre sortie devient un supplice. Ce classement combine nature, qualité de l'air et confort climatique plutôt que la seule animation urbaine. Résultat : des villes moyennes proches du relief ou du littoral se hissent souvent devant les grandes métropoles.",
    weights: { nature: 3.0, qualiteAir: 1.5, canicule: 1.5, life: 1.5, transport: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "neo-ruraux",
    emoji: "🌾",
    label: "Néo-ruraux",
    metaTitle: "Meilleures villes pour néo-ruraux 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes pour quitter la métropole et s'installer au vert : coût abordable, nature, calme, fibre télétravail. Score composite calibré 2026.",
    intro:
      "Néo-ruraux : vous voulez quitter la métropole sans pour autant disparaître au fond d'un hameau sans connexion. La bonne cible, c'est la petite ou moyenne ville bien placée — celle où le loyer redevient soutenable, où la nature commence au bout de la rue, et où le calme tient sans couper la fibre ni l'épicerie. Ce classement pondère d'abord le coût et la nature, complète avec le calme sonore, garde un œil sur la qualité de vie et la connectivité télétravail, et laisse une marge pour le lien social — parce qu'une installation rurale qui se solde par l'isolement total tient rarement plus de deux ans. Résultat : peu de grandes métropoles, beaucoup de préfectures et de villes moyennes accessibles en train.",
    weights: { cost: 3.0, nature: 2.5, bruit: 2.0, life: 1.5, teletravail: 1.5, solitude: 1.0 },
    reasonHint: (c) =>
      `Coût ${c.scores.cost.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
  },
  {
    slug: "anti-canicule",
    emoji: "🧊",
    label: "Anti-canicule",
    metaTitle: "Meilleures villes anti-canicule 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises où l'été reste vivable : étés tempérés, air respirable, nature accessible. Pour les personnes sensibles à la chaleur.",
    intro:
      "Anti-canicule : la décennie à venir verra les étés français devenir plus longs, plus secs et plus suffocants. Choisir aujourd'hui une ville fraîche n'est plus une lubie de retraité, c'est une stratégie de santé pour les asthmatiques, les seniors, les jeunes enfants et toute personne qui supporte mal les pics au-delà de 32 °C. Le critère qui domine, c'est la résistance climatique — dérivée des températures moyennes de juillet et du potentiel de canicule projeté à 2040. On ajoute une qualité de l'air correcte (les pics d'ozone s'aggravent dans le sud), de la nature accessible pour respirer hors des îlots de chaleur urbains, et une qualité de vie générale qui ne s'effondre pas l'été. Résultat : un classement dominé par les façades atlantique et nord, le piémont alpin et les villes d'altitude — les zones qui resteront vivables même après dix années de réchauffement supplémentaires.",
    weights: { canicule: 3.0, qualiteAir: 2.0, nature: 1.5, life: 1.5, safety: 1.0 },
    reasonHint: (c) =>
      `Juillet ${(c.avgTempJuly ?? 23).toFixed(1)} °C · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
  },
  {
    slug: "sensibles-au-bruit",
    emoji: "🤫",
    label: "Sensibles au bruit",
    metaTitle: "Meilleures villes pour sensibles au bruit 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises où le calme tient toute la journée : faible exposition sonore, nature accessible, air respirable. Pour hypersensibles et télétravail.",
    intro:
      "Sensibles au bruit : la circulation continue, les terrasses ouvertes tard, les sirènes nocturnes, l'école juste sous les fenêtres — autant de petits stimuli qui usent sur la durée. Pour qui supporte mal l'exposition sonore quotidienne — hypersensibles, hyperacousie, jeunes parents en gestion de nourrisson, télétravailleurs enchaînant les visios — le critère cardinal n'est ni le dynamisme culturel ni la sécurité, c'est le bruit ambiant moyen. Ce classement pondère d'abord l'exposition sonore (dérivée des cartes de bruit stratégiques d'agglomération et de la densité du trafic), complète par une nature proche pour décompresser hors des îlots sonores urbains, garde un œil sur la qualité de l'air (bruit routier et particules fines vont souvent ensemble) et sur la qualité de vie générale — parce qu'une rue silencieuse au fond d'un désert de services tient rarement plus de six mois. Résultat : beaucoup de préfectures moyennes et de villes côtières atlantiques, peu de grandes métropoles, et zéro ville traversée par une autoroute ou un axe TGV non protégé.",
    weights: { bruit: 3.0, nature: 2.0, qualiteAir: 1.5, life: 1.5, safety: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · sécurité ${c.scores.safety.toFixed(1)}`,
  },
  {
    slug: "asthmatiques-allergiques",
    emoji: "🌬️",
    label: "Asthmatiques et allergiques",
    metaTitle: "Meilleures villes pour asthmatiques et allergiques 2026",
    metaDescription:
      "Top 20 villes françaises où l'air respire et les crises s'espacent : air propre, étés tempérés, nature non saturée de pollens. Asthme, rhinite, allergies.",
    intro:
      "Asthmatiques et allergiques : les déclencheurs s'enchaînent vite — particules fines et NO₂ près des grands axes, pics d'ozone l'été, pollens d'arbres dès mars (bouleau, cyprès), graminées en juin, ambroisie dès août dans le couloir rhodanien. Pour qui souffre d'un système respiratoire ou immunitaire fragile, choisir une ville devient un arbitrage de santé publique avant d'être un arbitrage de cadre de vie. Ce classement pondère d'abord la qualité de l'air ambiante (dérivée des stations ATMO et des données Lcsqa par agglomération), ajoute le potentiel anti-canicule (la chaleur concentre l'ozone et déclenche les crises), garde une nature accessible mais pas dominée par les sources polliniques sensibilisantes, et tient compte du bruit ambiant — facteur de stress chronique qui aggrave l'asthme. Résultat : un palmarès tiré par les façades atlantique et nord, le piémont alpin et les villes ventées de Bretagne ou du Cotentin, où le brassage d'air maintient l'indice ATMO en zone « bon » la majorité de l'année. Les grandes plaines céréalières, le couloir rhodanien (ambroisie) et les agglomérations enclavées sortent du top.",
    weights: { qualiteAir: 3.0, canicule: 2.0, nature: 1.5, bruit: 1.0, life: 1.0 },
    reasonHint: (c) =>
      `Nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)} · transport ${c.scores.transport.toFixed(1)}`,
  },
  {
    slug: "jeunes-parents",
    emoji: "🍼",
    label: "Jeunes parents (0-3 ans)",
    metaTitle: "Meilleures villes pour jeunes parents 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour jeunes parents avec un enfant 0-3 ans : air respirable, sécurité poussette, parcs accessibles, coût soutenable, services petite enfance. Calibré 2026.",
    intro:
      "Jeunes parents : un enfant de 0-3 ans, ce n'est pas la même équation qu'une famille avec un collégien. L'école attendra encore quatre ans ; ce qui compte immédiatement, c'est la qualité de l'air que respirent des poumons en formation, la sécurité d'un trottoir où la poussette tient sans gêner personne, des parcs accessibles à pied pour la balade quotidienne, un loyer ou une mensualité qui résiste à un congé parental ou à un passage temporaire à un seul revenu, et le calme ambiant qui ne réveille pas systématiquement la sieste. La densité de crèches, de PMI et de pédiatres conventionnés pèse aussi lourd que les écoles dans les classements concurrents — mais reste plus difficile à mesurer ville par ville. Ce classement pondère d'abord la sécurité globale et la nature accessible (parcs urbains et premier rang d'arbres), ajoute une qualité de l'air sérieuse, intègre les services famille agrégés (crèches, ludothèques, PMI proxy) et le calme sonore, et garde une marge sur le coût — parce qu'une fenêtre de un à trois ans à 100 % du loyer plus 600 €/mois de crèche réduit toute la marge financière du foyer. Résultat : peu de très grandes métropoles centrales (air dégradé, espaces verts saturés, trottoirs étroits), beaucoup de villes moyennes côtières ou de couronnes pavillonnaires bien équipées en services petite enfance.",
    weights: {
      safety: 2.0,
      nature: 2.0,
      qualiteAir: 2.0,
      famille: 2.0,
      bruit: 1.5,
      cost: 1.5,
      life: 1.0,
      transport: 1.0,
    },
    reasonHint: (c) =>
      `Sécurité ${c.scores.safety.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · coût ${c.scores.cost.toFixed(1)}`,
  },
  {
    slug: "investisseurs-locatifs",
    emoji: "🏘️",
    label: "Investisseurs locatifs",
    metaTitle: "Meilleures villes investissement locatif 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour investir en locatif : rendement brut estimé, tension de marché, demande jeunes actifs, sécurité de l'actif. Calibré 2026.",
    intro:
      "Investisseurs locatifs : votre arbitrage ne se joue pas comme celui d'un primo-accédant. Vous ne choisissez pas la ville où vous voulez vivre, vous choisissez celle qui dégage le meilleur rendement net une fois la fiscalité passée, sans rogner sur les fondamentaux qui protègent l'actif à dix ans. Le triangle qui compte vraiment, c'est rendement brut (loyer annuel rapporté au prix d'acquisition), tension de marché (un appartement qui se reloue en quinze jours et pas en trois mois) et qualité de la demande locative (bassin de jeunes actifs, de cadres en télétravail et d'étudiants qui paient à l'heure). Le rendement seul, sans demande, c'est une vacance locative qui ronge la rentabilité ; la tension seule, sans rendement, c'est un cash-flow négatif qui ne tient que par l'espoir de la plus-value. Ce classement pondère d'abord le rendement brut estimé sur un T2 — dérivé du loyer médian T2 et du prix m² appartement par ville — complète par l'indicateur de tension de marché, intègre le poids démographique des 25-35 ans (premier bassin de locataires français), garde un œil sur la couverture fibre et la part de cadres (qui tirent le loyer vers le haut), et ne sacrifie pas la sécurité de l'actif. Résultat : peu de grandes métropoles ultra-tendues comme Paris ou Lyon (rendement effondré sous 4 %), beaucoup de villes moyennes industrielles ou universitaires en reconversion où l'on trouve encore du 7-9 % brut avec une demande locale solide.",
    weights: {
      investorYield: 2.5,
      rentalTension: 2.0,
      jeuneActif: 1.5,
      teletravail: 0.8,
      safety: 0.5,
      remoteWork: 0.5,
    },
    reasonHint: (c) => {
      const h = HOUSING[c.slug];
      if (h) {
        const y = (h.avgRentT2 * 12) / (45 * h.avgBuyPriceM2) * 100;
        return `Rendement brut ~ ${y.toFixed(1)} % · T2 ${h.avgRentT2} € · m² ${h.avgBuyPriceM2} €`;
      }
      return `Coût ${c.scores.cost.toFixed(1)} · tension ${rentalTension(c).toFixed(1)} · jeunes actifs ${c.scores.life.toFixed(1)}`;
    },
  },
  {
    slug: "familles-avec-ados",
    emoji: "🎒",
    label: "Familles avec ados (12-17 ans)",
    metaTitle: "Meilleures villes familles avec ados 2026 — Top 20",
    metaDescription:
      "Top 20 villes françaises pour familles avec adolescents 12-17 ans : lycée, transport autonomie ado, sécurité nocturne, scène culturelle, espaces pour s'aérer. Calibré 2026.",
    intro:
      "Familles avec ados : un adolescent de 12-17 ans, ce n'est ni l'enfant scolarisé en primaire couvert par familles avec enfants, ni le nourrisson de jeunes parents. Ce qui change brutalement à l'adolescence, c'est l'autonomie : votre ado rentre seul du lycée, traverse la ville pour son sport ou son club, sort le soir en groupe au cinéma ou au concert, prend les transports pour ses amis. La qualité du lycée pèse plus que celle du primaire — l'orientation post-bac se joue dès la seconde. La sécurité nocturne devient un vrai critère, plus une abstraction : un retour de l'arrêt de bus à 22 h en hiver n'a pas la même tête à Annecy qu'à Aubervilliers. La densité culturelle se met à compter — cinéma, salle de concert, club sportif fédéré, médiathèque ouverte le samedi — parce qu'un ado qui s'ennuie est un ado qui s'isole. Le réseau de transport en commun fait la différence entre un parent-taxi épuisé et un ado autonome. Ce classement pondère d'abord les transports et la sécurité, intègre lourdement la sécurité nocturne et l'offre culturelle, garde le poids des établissements scolaires (lycée + supérieur de proximité) et ajoute la vitalité jeune-actif — les ados ont besoin d'une ville qui ne se vide pas le soir. La nature reste utile pour les week-ends, mais moins centrale qu'à l'âge primaire. Résultat : un palmarès tiré par les villes universitaires moyennes bien desservies, les métropoles régionales équilibrées, et beaucoup moins par les petites communes isolées où l'autonomie de l'ado se résume à la voiture des parents.",
    weights: {
      transport: 2.0,
      schools: 2.0,
      securiteNocturne: 1.5,
      safety: 1.5,
      culture: 1.5,
      jeuneActif: 1.0,
      famille: 1.0,
      life: 1.0,
      nature: 0.5,
    },
    reasonHint: (c) =>
      `Transport ${c.scores.transport.toFixed(1)} · écoles ${c.scores.schools.toFixed(1)} · culture ${c.scores.culture.toFixed(1)}`,
  },
  {
    slug: "sportifs",
    emoji: "🏋️",
    label: "Sportifs réguliers",
    metaTitle: "Meilleures villes pour sportifs 2026 — Top 20 France",
    metaDescription:
      "Top 20 villes françaises pour pratiquants réguliers : équipements (piscines, gymnases, salles), clubs, cadre outdoor, climat propice. Calibré 2026.",
    intro:
      "Sportifs réguliers : votre semaine se construit autour de la pratique — l'entraînement du mardi soir au gymnase, la sortie longue du dimanche, la piscine deux fois par semaine, le club de tennis qui reprend en mars. Ce profil n'est pas celui du randonneur du dimanche déjà couvert par les amateurs de plein air. Le critère qui domine, c'est la densité d'équipements municipaux ouverts jusqu'à 22 h, le maillage des fédérations agréées Jeunesse & Sport qui ouvrent un vrai créneau adulte, et un climat qui ne réduit pas la pratique à trois mois par an. Ce classement pondère d'abord le composite sport et loisirs (équipements + clubs + outdoor + climat) dérivé du Recensement des Équipements Sportifs INJEP et des données fédérales, complète avec la nature accessible pour les sorties trail, vélo et rando, garde un œil sur le confort climatique d'été et d'hiver, et la qualité de vie générale — parce qu'une ville bien équipée mais vidée le soir tient rarement les pratiquants au-delà de deux saisons. Résultat : un palmarès tiré par les grandes métropoles dotées (Lyon, Bordeaux, Nantes, Toulouse), les pôles d'excellence sportive (Annecy, Chambéry, Antibes, Grenoble, Talence, Vichy) et plusieurs villes moyennes au tissu associatif dense — peu de petites communes rurales et zéro département en déprise.",
    weights: {
      sportLeisure: 3.0,
      nature: 1.5,
      life: 1.0,
      canicule: 1.0,
      jeuneActif: 0.5,
    },
    reasonHint: (c) =>
      `Sport ${computeSportLeisure(c).composite.toFixed(1)} · nature ${c.scores.nature.toFixed(1)} · qualité de vie ${c.scores.life.toFixed(1)}`,
  },
];

export const PROFILE_SLUGS = PROFILE_PAGES.map((p) => p.slug);

export interface ProfileMatch {
  city: CitySeed;
  score: number;
  reason: string;
}

export function rankByProfile(profile: ProfileDef, limit = 20): ProfileMatch[] {
  const totalWeight = Object.values(profile.weights).reduce<number>((s, v) => s + (v ?? 0), 0);
  const rows: ProfileMatch[] = CITIES_SEED.map((city) => {
    let weightedSum = 0;
    for (const [key, weight] of Object.entries(profile.weights)) {
      if (weight == null) continue;
      weightedSum += getScoreValue(city, key) * weight;
    }
    const score = totalWeight > 0 ? weightedSum / totalWeight : 5;
    return {
      city,
      score: Math.round(score * 10) / 10,
      reason: profile.reasonHint(city),
    };
  });
  rows.sort((a, b) => b.score - a.score);
  return rows.slice(0, limit);
}

export function getProfile(slug: string): ProfileDef | undefined {
  return PROFILE_PAGES.find((p) => p.slug === slug);
}
