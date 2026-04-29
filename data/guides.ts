export interface Guide {
  slug: string;
  title: string;
  metaTitle: string;
  metaDesc: string;
  category: "lifestyle" | "teletravail" | "famille" | "budget" | "region" | "comparaison";
  emoji: string;
  readMinutes: number;
  publishedAt: string;
  updatedAt: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  relatedCities: string[];
  relatedGuides: string[];
  tags: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "vivre-en-france-teletravail-guide-2025",
    title: "Télétravailler en France : les 10 villes où votre qualité de vie décollera",
    metaTitle: "Top 10 villes pour télétravailler en France — Guide 2025",
    metaDesc:
      "Fibre, coworking, coût de la vie : notre guide complet des meilleures villes françaises pour les télétravailleurs et digital nomads en 2025.",
    category: "teletravail",
    emoji: "💻",
    readMinutes: 8,
    publishedAt: "2025-01-15",
    updatedAt: "2025-04-01",
    intro:
      "Le télétravail a transformé la géographie des choix de vie. Pourquoi payer 1 800€/mois un studio à Paris quand vous pouvez avoir un T3 avec terrasse à Rennes pour 900€, la fibre 1 Gb/s et un vélo pour aller au coworking ? Ce guide analyse objectivement les meilleures villes françaises pour travailler à distance — au-delà des classements génériques.",
    sections: [
      {
        heading: "Les 3 critères que personne ne vous dit",
        body: "La connexion internet ne suffit pas. Ce qui différencie réellement une ville remote-friendly : (1) la densité de coworking abordables (moins de 150€/mois pour un poste fixe), (2) la communauté tech locale — pour les opportunités, la stimulation intellectuelle et les events, (3) le fuseau horaire et les connexions TGV vers votre client principal. Une ville parfaite sur le papier devient un piège si vous passez 4h dans les transports chaque fois qu'il faut «passer au bureau».",
      },
      {
        heading: "Rennes : le secret le mieux gardé des remote workers",
        body: "Score télétravail MeilleurVille : 8.6/10. Rennes cumule tout ce qu'on cherche : fibre partout (>95% de couverture), une communauté tech active (French Tech Rennes, 300+ startups), des coworkings à partir de 80€/mois, et le TGV Paris en 1h25. Le loyer médian d'un T2 est de 750€/mois — soit la moitié d'une chambre à Paris. Bonus : elle est cyclable à 90%, ce qui supprime la voiture du budget.",
      },
      {
        heading: "Nantes : la métropole qui a tout compris",
        body: "Score télétravail : 8.4/10. Nantes est la ville qui ressemble le plus à ce qu'on imagine d'une vie remote bien équilibrée : café culture dense (le Lieu Unique, la Cantine), scène startup dynamique, 45 min de la côte atlantique, et une offre culturelle qui rend le dimanche soir supportable. Loyer médian T2 : 800€.",
      },
      {
        heading: "Grenoble : pour les remote workers qui veulent skier le mercredi",
        body: "Score télétravail : 8.0/10. Grenoble est la ville des ingénieurs et chercheurs. La densité de talent tech est unique en France hors Paris. Le coworking La Turbine est une référence nationale. Et oui, les pistes de ski sont à 45 min en voiture. L'hiver peut sembler long et la pollution atmosphérique est un vrai sujet (inversions thermiques fréquentes) — mais beaucoup l'acceptent pour le cadre montagneux exceptionnel.",
      },
      {
        heading: "Le calcul qui change tout",
        body: "Prenons un remote worker gagnant 3 500€ nets/mois. À Paris : loyer T2 1 400€ + charges 200€ + transport 85€ = 1 685€ de fixes. À Rennes : loyer T2 750€ + charges 150€ + vélo 20€ = 920€. Différence : 765€/mois, soit 9 180€/an. En 10 ans : 91 800€. De quoi acheter un appartement. Ce calcul est banal mais il change des vies quand on le fait réellement.",
      },
      {
        heading: "Les villes à éviter (et pourquoi)",
        body: "Certaines villes sont «à la mode» sans être vraiment remote-friendly. Bordeaux est belle mais la gentrification a fait exploser les loyers (+40% en 5 ans) sans que l'infrastructure tech suive. Nice est chère et la communauté remote y reste concentrée sur quelques quartiers. Marseille monte en puissance mais la connectivité reste inégale selon les quartiers.",
      },
    ],
    relatedCities: ["rennes", "nantes", "grenoble", "bordeaux", "strasbourg"],
    relatedGuides: [
      "budget-vivre-en-france-comparatif",
      "teletravail-bretagne-guide",
      "meilleure-ville-famille-france",
    ],
    tags: ["télétravail", "remote", "digital nomad", "qualité de vie", "coworking"],
  },
  {
    slug: "meilleure-ville-famille-france",
    title: "Où élever ses enfants en France ? Le guide honnête 2025",
    metaTitle: "Meilleures villes pour une famille en France — Guide complet 2025",
    metaDesc:
      "Écoles, sécurité, espaces verts, budget : notre analyse des meilleures villes françaises pour élever des enfants. Sans langue de bois.",
    category: "famille",
    emoji: "👨‍👩‍👧",
    readMinutes: 10,
    publishedAt: "2025-02-01",
    updatedAt: "2025-04-15",
    intro:
      "Choisir où élever ses enfants est peut-être la décision la plus lourde qu'une famille puisse prendre. Les classements habituels mesurent des abstractions. Ce guide mesure ce qui compte vraiment : à quelle vitesse votre enfant peut-il aller à l'école seul ? Y a-t-il un parc à 10 minutes ? Les urgences pédiatriques sont-elles à 20 ou 60 minutes ?",
    sections: [
      {
        heading: "Annecy : le consensus absolu (et ses limites)",
        body: "Score famille MeilleurVille : 8.9/10. Annecy arrive systématiquement en tête des classements familiaux — et pour de bonnes raisons. Le lac est à vélo, les écoles sont excellentes (taux de réussite au bac parmi les plus hauts de France hors grandes métropoles), la sécurité est réelle. Le problème est brutal : le prix du m² a doublé en 10 ans. Un 4 pièces s'achète aujourd'hui entre 400 000 et 600 000€. Pour une famille avec un seul revenu, c'est exclu.",
      },
      {
        heading: "La Rochelle : le choix qu'on regrette rarement",
        body: "Score famille : 8.0/10. La Rochelle est la ville qui revient le plus souvent dans les témoignages «on ne regrette pas». L'île de Ré est à 20 min. Les enfants font du vélo partout (le réseau cyclable est exceptionnel). Les écoles sont de bon niveau et l'immobilier, bien que tendu, reste plus accessible qu'Annecy. La limite : l'emploi est plus contraint qu'une métropole.",
      },
      {
        heading: "Pau : la valeur cachée des Pyrénées",
        body: "Score famille : 7.8/10. Pau est une des villes les moins connues de ce guide et une des plus intéressantes. Les montagnes sont à 40 min. Le coût de l'immobilier est 3x moins cher qu'Annecy pour un cadre naturel comparable. Les écoles sont convenables. La vie associative sportive est intense. Bémol : le bassin d'emploi est limité et la vie culturelle n'est pas Paris.",
      },
      {
        heading: "Ce que les classements ne mesurent pas",
        body: "Les scores agrégés masquent ce qui change vraiment la vie : la présence d'une crèche à moins de 500m, la sécurité de l'itinéraire école-maison, la disponibilité des médecins pédiatres. Ces données existent mais sont éparpillées (RPPS pour les médecins, data.education.gouv.fr pour les écoles). MeilleurVille les intègre progressivement dans les profils de quartiers.",
      },
      {
        heading: "Le budget réel d'une famille",
        body: "Une famille de 4 avec deux salaires médians (2×2 200€ nets = 4 400€) peut vivre confortablement dans la plupart des villes de ce guide — à l'exception des cas extrêmes (Annecy, Biarritz, Bassin d'Arcachon). À Clermont-Ferrand, Limoges ou Caen, le même budget permet d'acheter une maison avec jardin. La question n'est pas «combien ça coûte» mais «quelle qualité de vie pour ce budget».",
      },
    ],
    relatedCities: ["annecy", "la-rochelle", "pau", "nantes", "rennes"],
    relatedGuides: [
      "vivre-en-france-teletravail-guide-2025",
      "budget-vivre-en-france-comparatif",
      "retraite-france-guide",
    ],
    tags: ["famille", "enfants", "écoles", "sécurité", "qualité de vie"],
  },
  {
    slug: "budget-vivre-en-france-comparatif",
    title: "Combien coûte vraiment la vie en dehors de Paris ? Comparatif 2025",
    metaTitle: "Coût de la vie en France hors Paris — Comparatif 20 villes 2025",
    metaDesc:
      "Loyer, courses, transport, loisirs : comparatif du coût de la vie réel dans 20 grandes villes françaises. Données 2025 basées sur les avis habitants.",
    category: "budget",
    emoji: "💰",
    readMinutes: 7,
    publishedAt: "2025-01-20",
    updatedAt: "2025-04-10",
    intro:
      "Le coût de la vie en France hors Paris est en moyenne 40% moins cher. Mais cette moyenne cache d'énormes disparités. Un T2 à Limoges coûte 430€/mois. Le même appartement à Annecy : 900€. Ce guide compare les budgets réels, basés sur les déclarations des habitants de MeilleurVille.",
    sections: [
      {
        heading: "Loyers : l'écart qui change tout",
        body: "Loyer médian T2 selon les avis MeilleurVille (charges comprises) : Limoges 480€, Clermont-Ferrand 520€, Caen 580€, Poitiers 560€, Le Mans 520€, Tours 620€, Rennes 750€, Nantes 800€, Toulouse 750€, Bordeaux 850€, Lyon 900€, Montpellier 820€, Nice 980€, Annecy 950€, Paris 1 350€. L'écart Limoges/Paris : 870€/mois = 10 440€/an = 104 400€ en 10 ans.",
      },
      {
        heading: "Au-delà du loyer : les coûts cachés",
        body: "Le loyer est visible. Voici ce qu'on oublie : (1) La voiture est souvent indispensable hors des métropoles — comptez 300-500€/mois entre assurance, entretien et carburant. (2) Le chauffage varie énormément : une maison mal isolée dans le Massif Central coûte 200€/mois de plus en hiver qu'un appartement en PACA. (3) Les loisirs et restaurants sont moins chers dans les villes moins tendues — un repas au restaurant moyen : 15€ à Limoges, 25€ à Paris.",
      },
      {
        heading: "Les villes avec le meilleur ratio qualité/prix",
        body: "Notre score coût MeilleurVille pondère le loyer, les services, la santé et les loisirs. Le podium : 1. Limoges (8.5/10) — ville sous-estimée, nature exceptionnelle, loyers très bas. 2. Le Mans (8.4/10) — à 55 min de Paris en TGV, loyers ultra-abordables. 3. Clermont-Ferrand (8.1/10) — vie étudiante, volcans, coût contenu. Ces villes offrent une qualité de vie réelle pour un budget serré.",
      },
      {
        heading: "Le calcul du «point de basculement»",
        body: "À quel salaire une ville devient-elle intéressante ? La règle du tiers (loyer = max 33% du revenu) donne : à Limoges, un salaire de 1 500€ nets suffit pour vivre dignement. À Paris, il en faut 4 000€. Cette asymétrie explique l'exode silencieux des classes moyennes des grandes métropoles depuis 2020.",
      },
    ],
    relatedCities: ["limoges", "le-mans", "clermont-ferrand", "tours", "caen"],
    relatedGuides: [
      "meilleure-ville-famille-france",
      "vivre-en-france-teletravail-guide-2025",
      "retraite-france-guide",
    ],
    tags: ["budget", "coût de la vie", "loyer", "économies", "finances"],
  },
  {
    slug: "retraite-france-guide",
    title: "Prendre sa retraite en France : les 8 meilleures villes en 2025",
    metaTitle: "Meilleures villes pour prendre sa retraite en France — Guide 2025",
    metaDesc:
      "Soleil, santé, douceur de vie : notre sélection des meilleures villes françaises pour la retraite. Avec analyse du coût, des services médicaux et du cadre de vie.",
    category: "lifestyle",
    emoji: "🌅",
    readMinutes: 9,
    publishedAt: "2025-03-01",
    updatedAt: "2025-04-20",
    intro:
      "La retraite est un projet de vie, pas un simple déménagement. Les critères changent radicalement : on cherche moins la proximité du bureau et plus celle du médecin, moins le dynamisme nocturne et plus la douceur du quotidien. Ce guide analyse les 8 villes françaises qui cochent vraiment toutes les cases retraite.",
    sections: [
      {
        heading: "Aix-en-Provence : le soleil provençal sans la folie marseillaise",
        body: "Score retraite MeilleurVille : 8.4/10. 300 jours de soleil par an, marchés au pied de chez soi, une vie culturelle intense (Festival de musique d'Aix), des restaurants gastronomiques et un accès à la mer en 30 min. Le CHU de Marseille (15 min) est l'un des meilleurs de France. Seul frein réel : le prix de l'immobilier, parmi les plus élevés de France hors Paris.",
      },
      {
        heading: "La Rochelle : la grande surprise",
        body: "Score retraite : 8.0/10. La Rochelle fait l'unanimité chez les retraités qui y ont sauté le pas. Le port, l'île de Ré, le vélo partout, les marchés le samedi matin. La vie associative y est dense. Et le coût de la vie reste raisonnable pour la côte Atlantique. Les services médicaux sont corrects — l'hôpital est bien équipé même si certaines spécialités font défaut.",
      },
      {
        heading: "Biarritz / Pays Basque : pour ceux qui veulent tout",
        body: "Score retraite : 7.8/10. Le Pays Basque est le territoire qui monte le plus vite dans les recherches retraite. La gastronomie, la culture basque forte, l'océan, les montagnes à 1h — et une douceur climatique remarquable (9.5°C en janvier). Le problème est connu : les prix ont explosé. L'immobilier à Biarritz est désormais inaccessible pour une retraite modeste.",
      },
      {
        heading: "La santé : le critère décisif souvent oublié",
        body: "Un tiers des retraités citent l'accès aux soins comme critère n°1 après 70 ans. Or les déserts médicaux touchent de nombreuses zones pourtant attrayantes. La règle pratique : vérifiez la présence d'un cardiologue, d'un ophtalmologue et d'une clinique avec urgences dans un rayon de 20 minutes. MeilleurVille intègre la densité médicale RPPS dans les scores de ses profils de villes.",
      },
      {
        heading: "Les villes abordables qui méritent votre attention",
        body: "Si votre retraite est de 1 500€/mois, concentrez-vous sur : Tours (patrimoine UNESCO, services médicaux excellents, loyer T2 620€), Limoges (nature, calme, loyer T2 480€), Pau (Pyrénées, 8.0/10 nature, loyer T2 650€). Ces villes offrent une vraie qualité de vie retraite sans les prix qui ont rendu les côtes inaccessibles.",
      },
    ],
    relatedCities: ["aix-en-provence", "la-rochelle", "biarritz", "tours", "pau"],
    relatedGuides: [
      "budget-vivre-en-france-comparatif",
      "meilleure-ville-famille-france",
      "soleil-france-guide",
    ],
    tags: ["retraite", "seniors", "douceur de vie", "soleil", "santé"],
  },
  {
    slug: "teletravail-bretagne-guide",
    title: "Télétravailler en Bretagne : est-ce vraiment possible ?",
    metaTitle: "Télétravail en Bretagne — Guide complet 2025 (Rennes, Brest, Nantes)",
    metaDesc:
      "Fibre, coworking, salaires, connexions TGV : tout ce qu'il faut savoir avant de partir télétravailler en Bretagne. Retours d'expérience et données réelles.",
    category: "teletravail",
    emoji: "🌊",
    readMinutes: 6,
    publishedAt: "2025-02-15",
    updatedAt: "2025-04-05",
    intro:
      "La Bretagne polarise : certains en rêvent (mer, air pur, caractère breton), d'autres s'interrogent sur la pluie, l'isolement et les connexions. Ce guide répond aux vraies questions que se posent les télétravailleurs avant de partir.",
    sections: [
      {
        heading: "La fibre en Bretagne : la bonne surprise",
        body: "Contrairement à l'image «région isolée», la Bretagne est bien connectée. Rennes : 98% fibre. Brest : 94%. Les villes moyennes (Saint-Brieuc, Vannes, Quimper) : 80-90%. La 5G couvre les axes principaux. Le problème reste le bocage et les communes rurales — si vous optez pour une maison de campagne, vérifiez la connexion avant de signer.",
      },
      {
        heading: "Rennes vs Brest : deux visions du télétravail breton",
        body: "Rennes : la métropole tech. Community managée, coworkings modernes (Le Tank, La Cantine), TGV Paris 1h25, vie nocturne active. C'est la ville bretonne pour ceux qui veulent une vraie communauté pro. Brest : l'expérience maritime authentique. Plus calme, moins chère (loyer médian T2 550€ vs 750€ à Rennes), mais moins de networking. Idéale pour les remote workers qui veulent couper avec l'agitation.",
      },
      {
        heading: "Ce qu'on ne vous dit pas sur la pluie",
        body: "Brest est effectivement la ville la plus pluvieuse de France (1 200mm/an). Rennes est plus sèche que Lyon ou Strasbourg. La Bretagne du sud (Vannes, Nantes) a un climat qui ressemble à la façade atlantique — pas tropical mais parfaitement vivable. La vraie question n'est pas la quantité de pluie mais sa forme : crachin breton vs orages méditerranéens. Beaucoup préfèrent le premier.",
      },
      {
        heading: "Connectivité Paris : le calcul TGV",
        body: "Depuis Rennes, Paris est à 1h25 par TGV. Un Paris-Rennes en 2e classe coûte 35-80€ selon les horaires. Si vous devez aller au bureau 2 fois par mois, comptez 600-1 200€/an de train — soit 50-100€/mois. À mettre en regard des 400-600€ économisés sur le loyer mensuel. Le calcul est positif.",
      },
    ],
    relatedCities: ["rennes", "brest", "nantes"],
    relatedGuides: [
      "vivre-en-france-teletravail-guide-2025",
      "budget-vivre-en-france-comparatif",
    ],
    tags: ["télétravail", "Bretagne", "Rennes", "Brest", "remote"],
  },
  {
    slug: "soleil-france-guide",
    title: "Les villes les plus ensoleillées de France : classement et guide de vie",
    metaTitle: "Villes les plus ensoleillées de France — Top 10 avec données réelles",
    metaDesc:
      "Nombre de jours de soleil, températures, qualité de vie : classement des villes françaises les plus ensoleillées avec données météo officielles et avis habitants.",
    category: "lifestyle",
    emoji: "☀️",
    readMinutes: 6,
    publishedAt: "2025-01-10",
    updatedAt: "2025-03-20",
    intro:
      "Le soleil est l'un des facteurs de bien-être les plus documentés scientifiquement. Il influence le moral, le sommeil, la vitamin D, et l'activité physique. Ce guide classe les villes françaises par ensoleillement réel — avec les avis des habitants sur ce que ça change vraiment au quotidien.",
    sections: [
      {
        heading: "Le podium soleil : Méditerranée domine",
        body: "1. Perpignan : 2 800 heures/an — la ville la plus ensoleillée de France. 2. Montpellier : 2 740 heures. 3. Nice : 2 700 heures. 4. Aix-en-Provence : 2 900 jours clairs. 5. Marseille : 2 858 heures. Pour comparaison : Paris totalise 1 630 heures, Brest 1 580 heures. La différence se ressent viscéralement au quotidien.",
      },
      {
        heading: "Ensoleillement ≠ chaleur agréable",
        body: "Attention : ensoleillement ne signifie pas forcément confort thermique. Nice en juillet : 26°C moyens et 2 700 heures de soleil — parfait. Mais les Pyrénées-Orientales font face au Tramontane, vent fort qui rend certaines journées ensoleillées difficilement vivables à l'extérieur. Aix-en-Provence et La Rochelle ont un compromis soleil/vent plus favorable.",
      },
      {
        heading: "La grande oubliée : La Rochelle",
        body: "La Rochelle reçoit 2 190 heures d'ensoleillement par an — plus que Lyon (1 972h), Bordeaux (2 065h) ou Nantes (1 940h). Et à des latitudes atlantiques où l'été est doux plutôt que caniculaire. Pour ceux qui veulent le soleil sans les 40°C de l'été méditerranéen, c'est un choix remarquable.",
      },
      {
        heading: "Ce que disent les habitants",
        body: "Dans les avis MeilleurVille, le soleil revient comme facteur de bonheur de manière répétée. Les habitants de Montpellier et Nice mentionnent systématiquement «les terrasses en mars» et «prendre le café dehors jusqu'en novembre» comme marqueurs de qualité de vie. En revanche, plusieurs mentionnent les étés de plus en plus chauds comme facteur négatif croissant — signe que le changement climatique s'invite dans l'équation.",
      },
    ],
    relatedCities: ["montpellier", "nice", "aix-en-provence", "la-rochelle", "biarritz"],
    relatedGuides: [
      "retraite-france-guide",
      "meilleure-ville-famille-france",
      "budget-vivre-en-france-comparatif",
    ],
    tags: ["soleil", "ensoleillement", "météo", "bien-être", "méditerranée"],
  },
  {
    slug: "quitter-paris-guide-2025",
    title: "Quitter Paris en 2025 : le guide honnête de l'après",
    metaTitle: "Quitter Paris — Guide complet 2025 : où aller, comment, pourquoi",
    metaDesc:
      "Témoignages, données réelles, calcul financier : tout ce qu'il faut savoir avant de quitter Paris. Les vraies questions à se poser, les vraies destinations à considérer.",
    category: "lifestyle",
    emoji: "🚂",
    readMinutes: 12,
    publishedAt: "2025-03-15",
    updatedAt: "2025-04-25",
    intro:
      "Chaque année, 50 000 personnes quittent Paris pour la province. La plupart ne reviennent pas. Mais le départ se prépare — et beaucoup font des erreurs coûteuses en choisissant mal leur destination ou en ne mesurant pas les compromis. Ce guide est celui qu'on aurait aimé avoir avant.",
    sections: [
      {
        heading: "Pourquoi les gens quittent Paris (et pourquoi ils ne reviennent pas)",
        body: "Les études le montrent : les Parisiens quittent principalement pour l'espace (logement plus grand), le coût (loyer divisé par 2-3), et la qualité de vie perçue. Ce qui les retient de revenir : l'espace retrouvé, le rythme de vie, et souvent — la surprise — une vie sociale et culturelle plus riche qu'attendu dans les villes moyennes.",
      },
      {
        heading: "Les 5 questions à se poser avant",
        body: "1. Votre emploi est-il mobile ? Si vous êtes 100% remote, la liberté est totale. Sinon, calculez le coût en transport des allers-retours mensuels. 2. Votre réseau social compte-t-il ? Le départ de Paris brise des réseaux constitués sur 10-20 ans. Ce n'est pas insurmontable mais ça se prépare. 3. Votre partenaire est-il partant ? Les déménagements forcés finissent mal. 4. Avez-vous des enfants scolarisés ? Choisir une ville pour ses écoles change l'équation. 5. Avez-vous essayé avant ? 3-6 mois en mode «test» avant de vendre l'appartement.",
      },
      {
        heading: "Les destinations qui surprennent les ex-Parisiens",
        body: "Les classiques (Bordeaux, Lyon, Montpellier) sont connus. Voici ce que disent les habitants de MeilleurVille sur les destinations moins attendues : Pau ('On a tout de Paris en plus petit, pour trois fois moins cher, avec les Pyrénées à 40 min'). Tours ('Le patrimoine UNESCO, Paris en 1h05, le prix de l'immobilier d'il y a 10 ans'). Dijon ('La gastronomie, la culture bourguignonne, et des Parisiens qui arrivent en se pinçant'). Rennes ('La tech, le vélo, et le TGV — on a tout compris en 6 mois').",
      },
      {
        heading: "Le mythe de l'ennui",
        body: "La peur de s'ennuyer en province est la plus grande barrière psychologique au départ. Elle est en grande partie infondée. La densité d'événements culturels à Nantes, Bordeaux ou Montpellier est supérieure à la plupart des villes européennes. Ce qui manque : la densité sociale spontanée de Paris — les cafés, la rue, la sérendipité urbaine. Ce n'est pas rien, mais ça se compense par une vie associative et des communautés plus soudées.",
      },
      {
        heading: "Le calcul financier complet",
        body: "Comparaison sur 10 ans, profil couple deux salaires 3 000€/mois chacun : Paris (T3 1 700€ + charges 250€ + transport 170€ = 2 120€/mois) vs Nantes (T3 950€ + charges 200€ + vélo 30€ = 1 180€/mois). Différence : 940€/mois = 11 280€/an = 112 800€ en 10 ans. De quoi solder un prêt immobilier, financer les études des enfants, ou juste vivre mieux.",
      },
    ],
    relatedCities: ["nantes", "bordeaux", "rennes", "lyon", "tours"],
    relatedGuides: [
      "vivre-en-france-teletravail-guide-2025",
      "budget-vivre-en-france-comparatif",
      "meilleure-ville-famille-france",
    ],
    tags: ["quitter Paris", "exode urbain", "province", "déménagement", "qualité de vie"],
  },
  {
    slug: "villes-etudiantes-france-guide",
    title: "Les meilleures villes étudiantes en France — Guide honnête 2025",
    metaTitle: "Meilleures villes étudiantes France 2025 — Guide complet",
    metaDesc: "Classement des meilleures villes étudiantes françaises : loyer studio, transport, vie nocturne, universités. Tout ce qu'on ne vous dit pas dans les brochures.",
    category: "lifestyle",
    emoji: "🎓",
    readMinutes: 8,
    publishedAt: "2025-02-15",
    updatedAt: "2025-04-10",
    intro: "Le choix de la ville universitaire est souvent pris à la légère — on suit sa famille, ses amis, ou la réputation de l'école. Pourtant, la qualité de vie étudiante varie énormément selon la ville. Ce guide vous aide à choisir avec les yeux ouverts.",
    sections: [
      {
        heading: "Rennes : la ville étudiante la plus sous-estimée de France",
        body: "Score étudiant MeilleurVille : 8.7/10. 70 000 étudiants dans une ville de 220 000 habitants : Rennes est une ville-campus. Les loyers médians d'un studio tournent autour de 450-550€ — accessibles. Le réseau de bus + vélos couvre tout. La scène musicale est l'une des plus vivantes de France (Les Transmusicales, festival Mythos). Et les universités ont d'excellents résultats.",
      },
      {
        heading: "Nantes vs Bordeaux : le match étudiant",
        body: "Nantes : plus abordable, plus cyclable, mieux connectée Paris. Bordeaux : plus belle, plus branchée, loyers en hausse. Si vous cherchez la qualité de vie maximale avec un budget maîtrisé, Nantes gagne. Si vous cherchez la ville où votre Instagram va décoller, Bordeaux. Le mythe de Bordeaux 'moins chère que Paris' est révolu : comptez 600-700€ pour un studio correct en centre.",
      },
      {
        heading: "Les pièges à éviter",
        body: "1. Choisir une ville pour son école seulement : si votre école est en zone industrielle à 45 min du centre, votre vie sociale sera nulle. 2. Sous-estimer les charges : loyer 500€ + charges 80€ + transport 40€ + alimentation 300€ = 920€/mois minimum. Vérifiez les APL disponibles sur votre commune. 3. Oublier les liaisons retour : une ville mal connectée Paris devient un isolement si votre famille est en Île-de-France.",
      },
      {
        heading: "Les villes sous-estimées",
        body: "Besançon et Angers reviennent régulièrement comme des surprises positives dans les témoignages étudiants. Besançon : campus verdoyant, loyers très accessibles (350-450€ studio), pistes cyclables excellentes. Angers : ville jardin agréable, accès Paris en 1h30, université réputée en médecine et droit. Clermont-Ferrand : loyers parmi les plus bas de France pour une ville universitaire de cette taille.",
      },
    ],
    relatedCities: ["rennes", "nantes", "bordeaux", "besancon", "angers"],
    relatedGuides: ["vivre-en-france-teletravail-guide-2025", "budget-vivre-en-france-comparatif"],
    tags: ["étudiant", "université", "studio", "loyer", "vie étudiante"],
  },
  {
    slug: "villes-seniors-retraite-france",
    title: "Où prendre sa retraite en France ? Le guide des 60+ qui bougent",
    metaTitle: "Meilleures villes pour la retraite en France — Guide 2025",
    metaDesc: "Santé, soleil, coût de la vie, activités : notre guide honnête pour choisir où prendre sa retraite en France. Les vraies bonnes questions à se poser.",
    category: "lifestyle",
    emoji: "🌅",
    readMinutes: 9,
    publishedAt: "2025-03-01",
    updatedAt: "2025-04-20",
    intro: "La retraite en France est une révolution de vie. Pour la première fois depuis 40 ans, vous choisissez librement où habiter. Ce guide vous aide à structurer ce choix — avec des données, des témoignages, et sans vous vendre du rêve.",
    sections: [
      {
        heading: "La densité médicale : le critère le plus important que personne ne mesure",
        body: "La qualité de vie à la retraite dépend massivement de l'accès aux soins. Une belle ville sans rhumatologue ou cardiologue à moins de 30 km devient un piège à 75 ans. La France connaît de fortes inégalités de densité médicale. Les meilleures villes pour la santé retraite : Bordeaux (CHU + densité libérale), Grenoble (CHU + spécialistes), Montpellier (école de médecine + hôpitaux reconnus). À éviter sans screening médical préalable : les zones rurales profondes, même belles.",
      },
      {
        heading: "La Rochelle : la coqueluche des retraités actifs",
        body: "Score retraite MeilleurVille : 8.4/10. La Rochelle cumule tout ce que cherchent les retraités actifs : mer, vélo, culture, et une taille humaine (80 000 hab.) qui permet une vraie vie sociale. Le CHU est à Poitiers (1h), ce qui nécessite une organisation pour les soins spécialisés. L'immobilier reste abordable par rapport à la Côte d'Azur. Le réseau cyclable est exceptionnel — idéal pour garder une activité physique sans voiture.",
      },
      {
        heading: "Annecy : le luxe du cadre naturel",
        body: "La retraite à Annecy est un luxe — au sens littéral. Les prix au m² ont dépassé 5 000€ en centre-ville. Mais pour ceux qui peuvent se l'offrir, c'est peut-être la meilleure retraite de France : le lac est là, les montagnes sont là, les hôpitaux sont de qualité (CHU de Grenoble à 40 min), et l'air est pur. Le bémol : la ville est touristique, l'hiver peut sembler long pour qui n'est pas montagnard.",
      },
      {
        heading: "Le calcul de la retraite en province",
        body: "Une pension de 2 000€/mois (pension moyenne d'un cadre) suffit pour vivre très confortablement dans la plupart des villes de ce guide. À Paris, c'est un budget serré. À Pau, c'est une vie confortable avec épargne. À Annecy, c'est possible en locataire ou propriétaire depuis longtemps. Le vrai calcul : pouvez-vous vendre votre bien parisien ou francilien pour acheter cash à la retraite et conserver votre pension ? Si oui, beaucoup de portes s'ouvrent.",
      },
    ],
    relatedCities: ["la-rochelle", "annecy", "bordeaux", "pau", "montpellier"],
    relatedGuides: ["soleil-france-guide", "meilleure-ville-famille-france", "budget-vivre-en-france-comparatif"],
    tags: ["retraite", "senior", "santé", "qualité de vie", "province"],
  },
  {
    slug: "villes-nature-plein-air-france",
    title: "Les meilleures villes françaises pour vivre près de la nature",
    metaTitle: "Top villes françaises pour la nature et le plein air — Guide 2025",
    metaDesc: "Montagne, mer, forêt, vélo : notre classement des villes françaises les mieux situées pour vivre en contact avec la nature au quotidien.",
    category: "lifestyle",
    emoji: "🌿",
    readMinutes: 7,
    publishedAt: "2025-03-10",
    updatedAt: "2025-04-22",
    intro: "Avoir un grand parc ou une forêt à 15 minutes à pied change radicalement la qualité de vie. Ce n'est pas un luxe — c'est une santé. Ce guide classe les villes françaises où la nature est accessible au quotidien, pas juste le week-end.",
    sections: [
      {
        heading: "Ce que veut dire 'proche de la nature' vraiment",
        body: "La définition qui compte : pouvoir faire une sortie nature de 2h+ sans voiture depuis son domicile. Une ville avec un grand parc (bois de Boulogne à Paris) répond partiellement. Une ville comme Grenoble ou Annecy où la montagne est visible depuis les fenêtres est dans une autre catégorie. La qualité de l'air, l'accès à l'eau (lac, mer, rivière), les km de chemins de randonnée balisés à moins de 10 km : voici les vrais indicateurs.",
      },
      {
        heading: "Grenoble : la capitale française du plein air urbain",
        body: "Score nature MeilleurVille : 9.2/10. Nulle part ailleurs en France une grande ville n'est entourée à 360° de montagnes skiables en hiver et de sentiers de randonnée l'été. La Chartreuse, le Vercors, Belledonne sont toutes accessibles en moins d'une heure. Les clubs de ski, VTT, escalade, trail sont parmi les plus actifs de France. La pollution atmosphérique (inversions thermiques) est le seul bémol sérieux — vérifiable sur Atmo Auvergne-Rhône-Alpes.",
      },
      {
        heading: "Annecy vs Grenoble : laquelle choisir pour la nature ?",
        body: "Annecy : le lac, les Alpes, le calme. Plus touristique, plus cher, plus 'nature contemplative'. Grenoble : montagne omniprésente, communauté sportive intense, plus urbain, moins cher. Annecy est idéal pour les familles et retraités cherchant la beauté calme. Grenoble est idéal pour les actifs sportifs (trail, ski de fond, vélo de montagne) qui veulent une vie sociale active en semaine.",
      },
      {
        heading: "Les alternatives moins connues",
        body: "Besançon : la ville verte de Bourgogne-Franche-Comté. La boucle du Doubs crée une nature intégrée en ville remarquable. Quimper : la Bretagne dans toute sa richesse naturelle, à 30 min de la côte sauvage du Finistère. Pau : plaine et Pyrénées en vue, la nature est spectaculaire et le coût de la vie très raisonnable. Valence : entre Vercors et Ardèche, 2 300 heures de soleil, campagne viticole proche.",
      },
    ],
    relatedCities: ["grenoble", "annecy", "besancon", "quimper", "pau"],
    relatedGuides: ["soleil-france-guide", "vivre-en-france-teletravail-guide-2025"],
    tags: ["nature", "plein air", "montagne", "randonnée", "qualité de l'air"],
  },
];

export const GUIDE_CATEGORIES = [
  { id: "teletravail", label: "Télétravail", emoji: "💻", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  { id: "famille", label: "Famille", emoji: "👨‍👩‍👧", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  { id: "budget", label: "Budget & Coût", emoji: "💰", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  { id: "lifestyle", label: "Style de vie", emoji: "🌅", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/20" },
  { id: "region", label: "Par région", emoji: "🗺️", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20" },
  { id: "comparaison", label: "Comparaisons", emoji: "⚖️", color: "text-pink-400", bg: "bg-pink-400/10 border-pink-400/20" },
] as const;
