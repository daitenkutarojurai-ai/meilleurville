/**
 * Métadonnées éditoriales des 19 classements — libellé, accroche, description,
 * méthodologie, sources. Aucune donnée, aucun calcul : le tri des villes vit
 * dans `lib/rankings.ts`, qui réexporte ce module pour que ses appelants
 * historiques n'aient rien à changer.
 *
 * Pourquoi un fichier à part : `components/SearchPalette.tsx` est un composant
 * client et n'a besoin que de la table des accroches. Tant qu'elle vivait dans
 * `lib/rankings.ts`, l'importer tirait `CITIES_SEED` (588 Ko) et
 * `data/housing.ts` dans le bundle de la palette, donc de toutes les pages —
 * le piège « Projections, not entities » de CLAUDE.md § Performance. Ce module
 * n'importe RIEN, et ne doit rien importer.
 */

export const RANKING_META = {
  teletravail: {
    slug: "teletravail",
    label: "Télétravail",
    emoji: "💻",
    headline: "Meilleures villes pour télétravailler en France",
    description:
      "Classement des villes françaises pour le travail à distance : fibre optique, espaces de coworking, cafés adaptés, coût de la vie, qualité de vie et communauté digitale nomade.",
    methodology:
      "Score composite pondéré : Remote Work (×3), Qualité de vie (×2), Coût (×1.5), Transport (×1), Culture (×0.5).",
    weights: { remoteWork: 3, life: 2, cost: 1.5, transport: 1, culture: 0.5 },
    color: "text-blue-400",
    borderColor: "border-blue-400/20",
    bgColor: "bg-blue-400/5",
    scoreKey: "remoteWork" as const,
    why: [
      "Couverture fibre optique et 4G/5G",
      "Nombre d'espaces de coworking",
      "Cafés avec WiFi stable",
      "Coût de la vie vs salaire remote",
      "Communauté digitale active",
    ],
  },
  famille: {
    slug: "famille",
    label: "Famille",
    emoji: "👨‍👩‍👧‍👦",
    headline: "Meilleures villes pour une famille en France",
    description:
      "Classement des villes françaises pour élever des enfants : qualité des écoles, sécurité, espaces verts, prix de l'immobilier et services de santé.",
    methodology:
      "Score composite pondéré : Écoles (×3), Sécurité (×2.5), Nature (×2), Coût (×1.5), Transport (×1).",
    weights: { schools: 3, safety: 2.5, nature: 2, cost: 1.5, transport: 1 },
    color: "text-emerald-400",
    borderColor: "border-emerald-400/20",
    bgColor: "bg-emerald-400/5",
    scoreKey: "schools" as const,
    why: [
      "Qualité des écoles (taux de réussite, offre scolaire)",
      "Indice de sécurité communautaire",
      "Espaces verts et parcs à proximité",
      "Prix médian au m²",
      "Accès aux soins pédiatriques",
    ],
  },
  nature: {
    slug: "nature",
    label: "Nature & Sport",
    emoji: "🌿",
    headline: "Meilleures villes françaises pour les amoureux de la nature",
    description:
      "Classement des villes françaises pour la nature, le sport et le plein air : randonnée, vélo, montagne, mer, qualité de l'air.",
    methodology:
      "Score composite pondéré : Nature (×4), Vie (×2), Sécurité (×1), Transport (×0.5).",
    weights: { nature: 4, life: 2, safety: 1, transport: 0.5 },
    color: "text-green-400",
    borderColor: "border-green-400/20",
    bgColor: "bg-green-400/5",
    scoreKey: "nature" as const,
    why: [
      "Accès forêts, lacs, montagne, mer (< 30 min)",
      "Km de pistes cyclables",
      "Indice de qualité de l'air (PM2.5, PM10)",
      "Ensoleillement annuel (jours)",
      "Clubs sportifs et infrastructures",
    ],
  },
  etudiant: {
    slug: "etudiant",
    label: "Étudiant",
    emoji: "🎓",
    headline: "Meilleures villes étudiantes en France",
    description:
      "Classement des meilleures villes étudiantes françaises : offre universitaire, coût du logement, vie nocturne, mobilité et dynamisme culturel.",
    methodology:
      "Score composite pondéré : Culture (×3), Transport (×2), Coût (×2.5), Nature (×0.5).",
    weights: { culture: 3, transport: 2, cost: 2.5, nature: 0.5 },
    color: "text-violet-400",
    borderColor: "border-violet-400/20",
    bgColor: "bg-violet-400/5",
    scoreKey: "culture" as const,
    why: [
      "Nombre d'universités et grandes écoles",
      "Loyer moyen pour un studio",
      "Transports en commun étudiants",
      "Vie culturelle et nocturne",
      "Réseau alumni et opportunités emploi",
    ],
  },
  retraite: {
    slug: "retraite",
    label: "Retraite",
    emoji: "🌅",
    headline: "Meilleures villes françaises pour la retraite",
    description:
      "Classement des villes françaises pour prendre sa retraite : douceur de vie, santé, calme, soleil et budget.",
    methodology:
      "Score composite pondéré : Vie (×3), Sécurité (×2.5), Nature (×2), Coût (×2), Transport (×0.5).",
    weights: { life: 3, safety: 2.5, nature: 2, cost: 2, transport: 0.5 },
    color: "text-amber-400",
    borderColor: "border-amber-400/20",
    bgColor: "bg-amber-400/5",
    scoreKey: "life" as const,
    why: [
      "Densité médicale (médecins, spécialistes)",
      "Coût de la vie retraité",
      "Ensoleillement et douceur climatique",
      "Calme et sécurité",
      "Activités seniors et vie sociale",
    ],
  },
  budget: {
    slug: "budget",
    label: "Moins chères",
    emoji: "💰",
    headline: "Villes les moins chères de France pour bien vivre",
    description:
      "Classement des villes françaises où votre argent va le plus loin : loyer, course, sorties. Qualité de vie maximale pour budget maîtrisé.",
    methodology:
      "Score composite pondéré : Coût (×4), Qualité de vie (×2), Sécurité (×1.5), Transport (×1).",
    weights: { cost: 4, life: 2, safety: 1.5, transport: 1 },
    color: "text-yellow-400",
    borderColor: "border-yellow-400/20",
    bgColor: "bg-yellow-400/5",
    scoreKey: "cost" as const,
    why: [
      "Loyer médian au m²",
      "Indice des prix à la consommation local",
      "Coût moyen d'un repas au restaurant",
      "Prix de l'immobilier à l'achat",
      "Charges moyennes (énergie, transport)",
    ],
  },
  soleil: {
    slug: "soleil",
    label: "Soleil & Douceur",
    emoji: "☀️",
    headline: "Villes françaises les plus ensoleillées",
    description:
      "Classement des villes françaises par ensoleillement, douceur climatique et qualité de vie en extérieur. Pour ceux qui fuient la grisaille.",
    methodology:
      "Score composite pondéré : Nature (×3), Qualité de vie (×2), Coût (×1.5), Sécurité (×1).",
    weights: { nature: 3, life: 2, cost: 1.5, safety: 1 },
    color: "text-orange-400",
    borderColor: "border-orange-400/20",
    bgColor: "bg-orange-400/5",
    scoreKey: "nature" as const,
    why: [
      "Nombre de jours de soleil par an",
      "Température moyenne estivale et hivernale",
      "Accès à la mer ou à la montagne",
      "Qualité de l'air extérieur",
      "Infrastructure sports de plein air",
    ],
  },
  securite: {
    slug: "securite",
    label: "Sécurité",
    emoji: "🛡️",
    headline: "Villes françaises les plus sûres",
    description:
      "Classement des villes françaises les plus sûres : indice de criminalité, sentiment de sécurité, résultats scolaires, cohésion sociale.",
    methodology:
      "Score composite pondéré : Sécurité (×4), Écoles (×2), Qualité de vie (×2), Nature (×1).",
    weights: { safety: 4, schools: 2, life: 2, nature: 1 },
    color: "text-sky-400",
    borderColor: "border-sky-400/20",
    bgColor: "bg-sky-400/5",
    scoreKey: "safety" as const,
    why: [
      "Taux de criminalité (statistiques préfecture)",
      "Indice de vandalisme et incivilités",
      "Résultats scolaires et décrochage",
      "Cohésion sociale perçue (avis habitants)",
      "Présence de services de proximité (police, pompiers)",
    ],
  },
  culture: {
    slug: "culture",
    label: "Vie culturelle",
    emoji: "🎭",
    headline: "Villes françaises avec la meilleure vie culturelle",
    description:
      "Classement des villes françaises par richesse culturelle : musées, théâtres, concerts, festivals, patrimoine, scène artistique et offre de loisirs.",
    methodology:
      "Score composite pondéré : Culture (×4), Transport (×2), Qualité de vie (×1.5), Écoles (×1).",
    weights: { culture: 4, transport: 2, life: 1.5, schools: 1 },
    color: "text-purple-400",
    borderColor: "border-purple-400/20",
    bgColor: "bg-purple-400/5",
    scoreKey: "culture" as const,
    why: [
      "Nombre de musées et monuments nationaux",
      "Festivals annuels et programmation culturelle",
      "Scène musicale et théâtrale",
      "Universités et grandes écoles",
      "Librairies, galeries, cinémas indépendants",
    ],
  },
  mobilite: {
    slug: "mobilite",
    label: "Sans voiture",
    emoji: "🚲",
    headline: "Meilleures villes françaises pour vivre sans voiture",
    description:
      "Classement des villes françaises où vous pouvez vous passer de voiture : transports en commun, pistes cyclables, commerces de proximité et services accessibles à pied.",
    methodology:
      "Score composite pondéré : Transport (×4), Qualité de vie (×2), Culture (×1.5), Coût (×1).",
    weights: { transport: 4, life: 2, culture: 1.5, cost: 1 },
    color: "text-teal-400",
    borderColor: "border-teal-400/20",
    bgColor: "bg-teal-400/5",
    scoreKey: "transport" as const,
    why: [
      "Réseau tramway / métro / bus (fréquences, couverture)",
      "Km de pistes cyclables sécurisées",
      "Score marchabilité (commerces, services à pied)",
      "Gare TGV ou TER desservie",
      "Disponibilité vélos et trottinettes en libre-service",
    ],
  },
  investissement: {
    slug: "investissement",
    label: "Investissement",
    emoji: "🏠",
    headline: "Meilleures villes françaises pour investir en immobilier",
    description:
      "Classement des villes françaises pour l'investissement immobilier : rendement locatif, tension locative, dynamisme économique et qualité de vie pour attirer des locataires.",
    methodology:
      "Score composite pondéré : Coût (×3 — pour le prix d'achat accessible), Qualité de vie (×2.5), Transport (×2), Culture (×1), Écoles (×1).",
    weights: { cost: 3, life: 2.5, transport: 2, culture: 1, schools: 1 },
    color: "text-rose-400",
    borderColor: "border-rose-400/20",
    bgColor: "bg-rose-400/5",
    scoreKey: "cost" as const,
    why: [
      "Prix au m² accessibles (pour un bon rendement brut)",
      "Tension locative (demande locative forte)",
      "Dynamisme économique et emploi local",
      "Qualité de vie pour attirer des locataires stables",
      "Connectivité (TGV, transports) — critère d'attractivité",
    ],
  },
  sante: {
    slug: "sante",
    label: "Santé & Soins",
    emoji: "❤️",
    headline: "Meilleures villes françaises pour la santé et l'accès aux soins",
    description:
      "Classement des villes françaises par cadre de vie propice à la santé : qualité de vie, sécurité, nature et air, accessibilité, coût. Score estimé depuis nos axes éditoriaux, calé sur les cadres de référence publics (DREES, Assurance Maladie, ATMO France, Insee) sans reprendre leurs relevés.",
    methodology:
      "Score composite pondéré : Qualité de vie (×3), Sécurité (×2.5), Nature/air (×2), Transport (×1), Coût (×1). Ce n'est pas un relevé de densité médicale, de délais d'attente ni de PM2.5 : aucune de ces mesures n'entre dans le calcul, qui repose sur les cinq axes ci-dessus. Pour une estimation d'accès aux soins ville par ville, voir la sous-page « Santé » de chaque fiche.",
    weights: { life: 3, safety: 2.5, nature: 2, transport: 1, cost: 1 },
    color: "text-pink-400",
    borderColor: "border-pink-400/20",
    bgColor: "bg-pink-400/5",
    scoreKey: "life" as const,
    why: [
      "Densité de médecins généralistes et spécialistes (DREES 2025)",
      "Présence d'un CHU ou hôpital de référence",
      "Qualité de l'air extérieur (indice ATMO — PM2.5, NO₂)",
      "Délais d'attente aux urgences et accès à la médecine de ville",
      "Cadre de vie : espaces verts, activité physique, alimentation locale",
    ],
  },
  climat: {
    slug: "climat",
    label: "Climat de comfort",
    emoji: "🌤️",
    headline: "Villes françaises au climat le plus agréable",
    description:
      "Classement basé sur les données réelles d'ensoleillement et de température : ensoleillement annuel, douceur estivale (sans canicule), clémence hivernale (sans gel marqué). Les villes au climat le plus équilibré arrivent en tête.",
    methodology:
      "Score climatique composite : ensoleillement (×3, plafonné à ~315 j/an), douceur d'été (×2, idéal ≈ 23 °C en juillet), clémence d'hiver (×2, idéal ≈ 8 °C en janvier). Calcul à partir des données seed (Météo-France / Open-Meteo agrégées).",
    weights: { nature: 0, life: 0 }, // ignored — climat uses a custom scorer
    color: "text-amber-400",
    borderColor: "border-amber-400/20",
    bgColor: "bg-amber-400/5",
    scoreKey: "nature" as const,
    why: [
      "Heures d'ensoleillement annuel (Météo-France)",
      "Température moyenne de juillet (douceur sans canicule)",
      "Température moyenne de janvier (clémence sans gel)",
      "Pénalité automatique pour les extrêmes (été > 30 °C, hiver < 0 °C)",
      "Classification climatique (méditerranéen / océanique / montagnard / tropical)",
    ],
  },
  logement: {
    slug: "logement",
    label: "Logement abordable",
    emoji: "🔑",
    headline: "Villes françaises où se loger reste accessible en 2026",
    description:
      "Classement basé sur nos repères de loyer (T1, T2, T3) et de prix au m² : où votre budget logement va le plus loin sans renoncer à la qualité de vie. Repères éditoriaux calés sur les Observatoires Locaux des Loyers, pas les médianes de transactions DVF.",
    methodology:
      "Score d'accessibilité au logement : loyer T2 (×3, plus c'est bas, mieux c'est), prix d'achat au m² (×2), score coût de la vie (×1). Loyer et prix viennent de nos repères éditoriaux, dont les médianes de corpus sont de 700 €/mois pour un T2 et 2 500 €/m² à l'achat. Ce sont des repères, un par ville et tous biens confondus, pas les médianes de ventes DVF : celles-ci sont publiées séparément, appartement et maison, sur la sous-page « Logement » de chaque ville.",
    weights: { cost: 3, life: 1, transport: 0.5 }, // ignored — logement uses a custom scorer; values here only drive the sidebar bars
    color: "text-cyan-500",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
    scoreKey: "cost" as const,
    why: [
      "Loyer médian T2 réel (Observatoires Locaux des Loyers 2025)",
      "Prix au m² à l'achat (Demande de Valeurs Foncières — DVF 2024-2025)",
      "Effort financier rapporté à un revenu médian local (INSEE)",
      "Tension locative et délai moyen de relocation",
      "Évolution sur 5 ans (volatilité du marché)",
    ],
  },
  "jeunes-actifs": {
    slug: "jeunes-actifs",
    label: "Jeunes actifs",
    emoji: "🚀",
    headline: "Meilleures villes françaises pour les jeunes actifs en 2026",
    description:
      "Classement des villes françaises où démarrer ou relancer une carrière en 2026 : scène culturelle, mobilité, aptitude au télétravail et coût de la vie compatible avec un premier salaire. Score estimé depuis nos axes éditoriaux, calé sur les cadres de référence publics (Insee, Dares, Arcep, Observatoires Locaux des Loyers) sans reprendre leurs relevés.",
    methodology:
      "Score composite pondéré : Culture (×2.5 — réseau, rencontres, sortir), Transport (×2 — TGV, mobilité), Télétravail (×1.5 — fibre et coworkings), Qualité de vie (×1.5 — équilibre pro/perso), Coût (×1.5 — premier salaire). Ni le taux de cadres, ni la démographie des 25-39 ans, ni les créations d'entreprises, ni la couverture fibre ne sont ingérés commune par commune : ce sont les cinq axes ci-dessus qui trient. Les très petites villes sont défavorisées indirectement via la faible note culture/transport.",
    weights: { culture: 2.5, transport: 2, remoteWork: 1.5, life: 1.5, cost: 1.5 },
    color: "text-fuchsia-400",
    borderColor: "border-fuchsia-400/20",
    bgColor: "bg-fuchsia-400/5",
    scoreKey: "culture" as const,
    why: [
      "Part des 25-39 ans et densité de cadres (Insee Recensement 2022, MAJ 2025)",
      "Créations d'entreprises et dynamisme du marché de l'emploi (DARES 2024)",
      "Couverture fibre optique > 90 % et nombre de coworkings (ARCEP, observatoires locaux)",
      "Scène culturelle et vie nocturne : bars, salles, festivals, restaurants",
      "Loyer T2 compatible avec un premier salaire cadre (Observatoires Locaux des Loyers)",
      "Connexion TGV directe à au moins une métropole majeure (SNCF Connect 2026)",
    ],
  },
  gastronomie: {
    slug: "gastronomie",
    label: "Gastronomie",
    emoji: "🍽️",
    headline: "Meilleures villes françaises pour la gastronomie en 2026",
    description:
      "Classement des villes françaises pour bien manger : scène culturelle et culinaire, ambiance, terroir, accessibilité d'un repas honnête. Score estimé depuis nos axes éditoriaux : ni les étoiles Michelin, ni les Bib Gourmand, ni les appellations INAO ne sont comptés ville par ville.",
    methodology:
      "Score composite pondéré (proxy) : Culture (×2.5 — scène culinaire, densité de restaurants, marchés), Qualité de vie (×2 — terrasses, ambiance, marchés couverts), Nature (×1.5 — terroir local, produits frais, jardins potagers), Coût (×1 — accessibilité d'un repas honnête), Sécurité (×0.5). Approche transparente : le nombre d'étoilés Michelin par ville n'est pas injecté en dur — il est fortement corrélé à la note culture/qualité de vie d'une ville et reste consultable directement sur guide.michelin.com.",
    weights: { culture: 2.5, life: 2, nature: 1.5, cost: 1, safety: 0.5 },
    color: "text-red-500",
    borderColor: "border-red-500/20",
    bgColor: "bg-red-500/5",
    scoreKey: "culture" as const,
    why: [
      "Densité d'établissements de restauration par habitant (Insee SIRENE 2024 — code NAF 56.10A)",
      "Présence d'étoilés Michelin et Bib Gourmand 2025 (proxy : note culture/vie)",
      "Nombre d'AOC/AOP régionales et terroir local (INAO — Institut national de l'origine et de la qualité)",
      "Animation des marchés couverts (Les Halles) et marchés de producteurs hebdomadaires",
      "Tradition culinaire régionale (bouillabaisse, cassoulet, choucroute, galette, daube, etc.)",
      "Diversité de l'offre : bistronomie, brasseries historiques, restaurants de chefs, cuisine du monde",
    ],
  },
  ecologie: {
    slug: "ecologie",
    label: "Écologie & Air",
    emoji: "🌿",
    headline: "Villes françaises les plus engagées pour l'écologie et la qualité de l'air",
    description:
      "Classement des villes françaises par cadre environnemental : nature et air, mobilité douce, qualité de vie. Score estimé depuis nos axes éditoriaux, calé sur les cadres de référence publics (ATMO France, Ademe, Cerema) sans reprendre leurs relevés.",
    methodology:
      "Score composite pondéré : Nature/air (×4), Transport doux (×2.5), Qualité de vie (×2), Coût (×0.5). Ce n'est pas une mesure de PM2.5 ni de NO₂ : aucun indice ATMO, aucune densité d'espaces verts et aucune politique bas-carbone n'est ingéré commune par commune.",
    weights: { nature: 4, transport: 2.5, life: 2, cost: 0.5 },
    color: "text-lime-500",
    borderColor: "border-lime-500/20",
    bgColor: "bg-lime-500/5",
    scoreKey: "nature" as const,
    why: [
      "Indice moyen de qualité de l'air ATMO (PM2.5, NO₂, O₃) — données 2024",
      "Part des déplacements en mobilité douce (vélo, marche, TC) — Cerema 2024",
      "Densité d'espaces verts par habitant (ha/1 000 hab.) — Ademe",
      "Plan Climat-Air-Énergie Territorial (PCAET) adopté et ambitieux",
      "Engagement zéro artificialisation nette et végétalisation urbaine",
    ],
  },
  cyclistes: {
    slug: "cyclistes",
    label: "Vélo & cyclistes",
    emoji: "🚴",
    headline: "Meilleures villes françaises pour les cyclistes en 2026",
    description:
      "Classement des villes françaises les plus cyclables : mobilité, cadre roulant, sécurité de la cohabitation, topographie et climat. Score estimé depuis nos axes éditoriaux : ni les kilomètres d'aménagements, ni la note FUB, ni le stationnement sécurisé ne sont comptés ville par ville.",
    methodology:
      "Score composite pondéré (proxy) : Transport (×3 — réseau cyclable, continuité, intermodalité train+vélo), Nature (×1.5 — voies vertes EuroVelo, ViaRhôna, Loire à vélo, cadre roulant), Sécurité (×1.5 — cohabitation vélo/voiture, accidentologie cyclistes), Qualité de vie (×1 — topographie, climat compatible à l'année). Approche transparente : la note FUB (climat ressenti A+ à G) n'est pas injectée individuellement — elle est très corrélée à la note transport + nature + sécurité d'une ville, et reste consultable sur barometre.parlons-velo.fr.",
    weights: { transport: 3, nature: 1.5, safety: 1.5, life: 1 },
    color: "text-indigo-500",
    borderColor: "border-indigo-500/20",
    bgColor: "bg-indigo-500/5",
    scoreKey: "transport" as const,
    why: [
      "Note FUB Baromètre des villes cyclables 2025 (climat vélo A+ à G — fub.fr)",
      "Kilomètres d'aménagements cyclables sécurisés (Cerema — Observatoire national des mobilités actives 2024)",
      "Continuité du réseau et passage des intersections (proxy : score transport)",
      "Stationnement vélo sécurisé en gare et en pied d'immeuble (SNCF Gares & Connexions, mairies)",
      "Intermodalité train + vélo (TER, Intercités — places vélo embarquées)",
      "Politique locale : Plan vélo communal, ZFE, écoles-rues, vélobus",
      "Accidentologie cycliste (ONISR — Observatoire national de la sécurité routière)",
    ],
  },
  "bord-de-mer": {
    slug: "bord-de-mer",
    label: "Bord de mer",
    emoji: "🌊",
    headline: "Meilleures villes côtières françaises où vivre en 2026",
    description:
      "Classement des villes françaises au bord de l'océan, de la Méditerranée, de la Manche ou de la mer du Nord — celles où l'on peut vivre à l'année sans devenir touriste de sa propre rue. Filtre par caractère maritime puis composite nature + qualité de vie + sécurité, avec bonus ensoleillement. Score estimé depuis nos axes éditoriaux, pas un relevé d'organisme.",
    methodology:
      "Filtre par caractère côtier (tags : mer, plage, balnéaire, océan, surf, station-balnéaire). ⚠️ C'est un caractère éditorial, pas une distance mesurée : le filtre retient des villes que leur identité rattache à la mer, dont quelques-unes sont à plus de 10 km du rivage (Caen, Challans, Quimper). La distance réelle à la mer ouverte, elle, est mesurée et publiée sur chaque fiche ville. Score composite : Nature (×3 — accès à la mer, biodiversité littorale), Qualité de vie (×2,5 — promenade de mer, marchés, lumière), Sécurité (×1,5), Culture (×1 — patrimoine maritime, festivals), Coût (×0,5 — pression touristique sur le logement). Bonus : +0,4 au-delà de 2 400 h d'ensoleillement par an, +0,3 si tag surf/station-balnéaire, +0,2 si population < 30 000 hab. (échelle village vs station). Les communes intérieures sont rangées en queue avec un score à 0.",
    weights: { nature: 3, life: 2.5, safety: 1.5, culture: 1, cost: 0.5 },
    color: "text-cyan-500",
    borderColor: "border-cyan-500/20",
    bgColor: "bg-cyan-500/5",
    scoreKey: "nature" as const,
    why: [
      "Accès direct au trait de côte (SHOM Service hydrographique 2024)",
      "Ensoleillement annuel et nombre de jours de baignade (Météo-France 1991-2020)",
      "Marchés de produits frais et restauration de la pêche locale (DPMA — Direction des pêches)",
      "Patrimoine maritime : remparts, forts Vauban, phares, quartiers de pêcheurs",
      "Pression touristique en juillet-août (Insee — résidences secondaires, population estivale)",
      "Loyer T2 à l'année (Observatoires Locaux des Loyers — hors marché de location saisonnière)",
      "Connexion ferroviaire ou autoroutière (SNCF Connect, Bison Futé 2026)",
    ],
  },
} as const;

export type RankingSlug = keyof typeof RANKING_META;
