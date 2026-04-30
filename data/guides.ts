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
  {
    slug: "vivre-bord-mer-france-guide",
    title: "Vivre au bord de la mer en France : les 8 villes où la qualité de vie bat Paris",
    metaTitle: "Meilleures villes bord de mer France 2025 — Guide complet",
    metaDesc: "La Rochelle, Biarritz, Saint-Malo, Vannes... notre guide des meilleures villes côtières françaises pour y vivre vraiment, pas juste pour les vacances.",
    category: "lifestyle",
    emoji: "🌊",
    readMinutes: 7,
    publishedAt: "2025-02-10",
    updatedAt: "2025-04-15",
    intro: "Vivre au bord de la mer, pas juste y passer ses vacances. Il y a une différence fondamentale entre les villes côtières «touristiques» et celles où on peut réellement bien vivre toute l'année. Ce guide classe les meilleures villes maritimes françaises selon des critères de qualité de vie réelle : emploi, prix, services, vie hors saison.",
    sections: [
      {
        heading: "Le piège des villes touristiques : l'hiver mort",
        body: "Biarritz, Arcachon, La Baule... ces villes sont paradisiaques en juillet. En novembre, c'est une autre histoire : commerces fermés, solitude, manque de services. Le test clé : cherchez le ratio population permanente / saisonnière. Une ville où 40% des logements sont des résidences secondaires aura une ambiance désertique hors saison. Privilégiez les villes avec une économie permanente : port de pêche, université, tourisme d'affaires.",
      },
      {
        heading: "La Rochelle : la ville côtière la plus équilibrée",
        body: "Score MeilleurVille : 7.8/10, coût de vie : 8.5/10. La Rochelle est notre référence absolue pour vivre au bord de la mer. Port maritime actif, université (25 000 étudiants), industries navales, tourisme mais équilibré. Le vieux port est une des plus belles architectures côtières d'Europe. Loyer T2 médian : 820€/mois. Soleil : 2 100 heures/an. Service TGV vers Paris en 3h.",
      },
      {
        heading: "Vannes : le Golfe du Morbihan, joyau sous-estimé",
        body: "Score : 7.9/10. Vannes est la porte d'entrée du Golfe du Morbihan, l'une des plus belles mers intérieures d'Europe. La ville intra-muros médiévale est magnifique. La vie culturelle est riche, les prix encore raisonnables (loyer T2 : 850€), et la Bretagne côtière reste préservée. Idéal pour les familles, retraités et télétravailleurs cherchant beauté et calme.",
      },
      {
        heading: "Saint-Malo : l'âme bretonne face à la mer",
        body: "Score : 7.5/10. Saint-Malo est unique : une cité corsaire fortifiée face à l'Atlantique. Le cadre est incomparable. La vie culturelle est dense (festivals, marchés, théâtre). Les connexions TGV vers Paris (2h20) permettent des allers-retours. Attention : les prix ont beaucoup augmenté depuis Covid (prix achat : 4 000€/m²) et le stock locatif est tendu.",
      },
      {
        heading: "Biarritz : lifestyle premium au pied des Pyrénées",
        body: "Score : 7.6/10, coût de vie : 5.0/10. Biarritz est la ville des surfeurs, entrepreneurs et bobos qui ont quitté Paris. Le lifestyle y est incomparable : Atlantique, surf, gastronomie basque, montagne à 1h. Mais les prix ont explosé depuis 2020 (+35%). Loyer T2 : 1 000€/mois, achat : 6 500€/m². Vérifiez bien votre budget avant de vous y projeter.",
      },
      {
        heading: "Le critère décisif : la mobilité professionnelle",
        body: "La mer c'est beau mais si vous devez voyager pour le travail, vérifiez la connectivité TGV/aéroport. La Rochelle (TGV 3h Paris), Biarritz (aéroport international), Vannes (TGV 2h45), Saint-Malo (TGV 2h20 via Rennes). Certaines villes côtières idylliques sont à 5h de Paris — ce qui peut tuer votre projet professionnel en 6 mois.",
      },
    ],
    relatedCities: ["la-rochelle", "vannes", "saint-malo", "biarritz", "lorient"],
    relatedGuides: ["vivre-en-france-teletravail-guide-2025", "budget-vivre-en-france-comparatif"],
    tags: ["mer", "côte", "qualité de vie", "La Rochelle", "Bretagne"],
  },
  {
    slug: "bordeaux-lyon-nantes-quelle-ville-choisir",
    title: "Bordeaux, Lyon ou Nantes : laquelle choisir en 2025 ?",
    metaTitle: "Bordeaux vs Lyon vs Nantes — Quelle grande ville choisir en 2025 ?",
    metaDesc: "Comparaison approfondie entre Bordeaux, Lyon et Nantes : coût de la vie, emploi, qualité de vie, quartiers. Le guide pour choisir la bonne métropole.",
    category: "comparaison",
    emoji: "⚖️",
    readMinutes: 9,
    publishedAt: "2025-01-20",
    updatedAt: "2025-04-20",
    intro: "Vous hésitez entre les trois grandes métropoles françaises hors Paris ? Bordeaux, Lyon et Nantes sont les destinations favorites des Parisiens qui cherchent à partir. Mais elles ne se ressemblent pas. Ce guide les compare honnêtement — sans langue de bois — sur les critères qui comptent vraiment.",
    sections: [
      {
        heading: "Le verdict express : à qui s'adresse chaque ville",
        body: "Lyon : pour les ambitieux qui veulent une vraie grande ville avec une économie solide. Bordeaux : pour ceux qui cherchent la dolce vita, le vin et le cadre de vie premium. Nantes : pour les familles et remote workers qui veulent qualité de vie + dynamisme sans sacrifier le budget. Ce n'est pas une question de «meilleure» ville mais de quel profil vous correspond.",
      },
      {
        heading: "Coût de la vie : le classement honnête",
        body: "Nantes gagne sur le budget. Loyer T2 médian : 850€ contre 1 000€ à Lyon et 900€ à Bordeaux. Les prix Bordeaux ont explosé (+45% en 8 ans) — c'est aujourd'hui plus cher que Lyon en centre-ville. Lyon reste chère dans la Presqu'île et les Pentes de la Croix-Rousse, mais offre des alternatives abordables (Villeurbanne, Vénissieux). Nantes est la seule des trois à rester dans des prix «acceptables» pour une grande ville.",
      },
      {
        heading: "Marché de l'emploi : Lyon est hors catégorie",
        body: "Lyon est la 2e économie de France après Paris. Les sièges sociaux, le secteur médical (CHU), la chimie/pharma, la tech (la French Tech Lyon est l'une des plus dynamiques) offrent un bassin d'emploi incomparable. Bordeaux et Nantes ont des marchés solides mais moins profonds. Si l'emploi est votre priorité n°1, Lyon s'impose.",
      },
      {
        heading: "Qualité de vie vécue : l'avantage Bordeaux et Nantes",
        body: "Sur le ressenti quotidien, Bordeaux et Nantes battent Lyon. Bordeaux : le charme de l'architecture XVIIIe, les quais de la Garonne, le bassin d'Arcachon à 1h, le vin. Nantes : le vélo, la scène culturelle avant-gardiste (le Voyage à Nantes), la proximité de l'Atlantique. Lyon est une grande ville efficace mais moins «glamour» — même si la gastronomie y est inégalée.",
      },
      {
        heading: "Le choc thermique : soleil et météo",
        body: "Bordeaux remporte largement la météo : 2 050h de soleil/an, étés secs et chauds. Nantes : 1 940h, doux et humide (vents de l'Atlantique). Lyon : 2 000h mais le mistral... pardon, la bise ! — et les hivers brumeux dans la vallée peuvent être déprimants. Si le soleil est un facteur, Bordeaux ou Nantes devant Lyon.",
      },
      {
        heading: "Notre verdict final",
        body: "Famille cherchant équilibre vie/travail : Nantes. Ambitieux orienté carrière : Lyon. Style de vie, gastronomie, cadre : Bordeaux si votre budget le permet. Et si vous hésitez encore : notre quiz IA intègre vos priorités exactes pour personnaliser la recommandation.",
      },
    ],
    relatedCities: ["bordeaux", "lyon", "nantes", "toulouse", "rennes"],
    relatedGuides: ["budget-vivre-en-france-comparatif", "meilleure-ville-famille-france"],
    tags: ["Bordeaux", "Lyon", "Nantes", "comparaison", "grande ville", "métropole"],
  },
  {
    slug: "toulouse-montpellier-quelle-ville-choisir",
    title: "Toulouse ou Montpellier : laquelle choisir en 2025 ?",
    metaTitle: "Toulouse vs Montpellier — Comparaison complète 2025",
    metaDesc:
      "Coût de la vie, emploi, soleil, ambiance : notre guide honnête pour choisir entre Toulouse et Montpellier. Données réelles et retours d'habitants.",
    category: "comparaison",
    emoji: "⚖️",
    readMinutes: 8,
    publishedAt: "2025-04-01",
    updatedAt: "2025-04-28",
    intro:
      "Toulouse et Montpellier sont les deux métropoles rivales du Sud-Ouest et du Languedoc. Elles partagent le soleil, le dynamisme et la jeunesse — mais leurs personnalités sont radicalement différentes. Laquelle correspond à votre projet de vie ?",
    sections: [
      {
        heading: "Le verdict en une phrase",
        body: "Toulouse est pour les ingénieurs, les familles et ceux qui veulent une grande ville avec un marché de l'emploi solide. Montpellier est pour les étudiants, les amateurs de méditerranée, et ceux qui veulent une ville plus petite mais très dynamique. Aucune n'est objectivement meilleure — tout dépend de votre profil.",
      },
      {
        heading: "L'emploi : l'avantage Toulouse",
        body: "Toulouse est la capitale européenne de l'aéronautique (Airbus, Safran, Thales). Le bassin d'emploi pour les ingénieurs, techniciens et profils tech est sans égal en province française. La French Tech Toulouse est en plein essor. Montpellier mise sur la santé (CHU, Sanofi), le numérique (IBM, Dell) et la recherche universitaire — solid mais plus étroit. Pour un CDI stable en grande entreprise, Toulouse gagne.",
      },
      {
        heading: "Le coût de la vie : avantage Montpellier",
        body: "Loyer médian T2 : Toulouse 820€, Montpellier 820€ également — quasi identique. Mais l'immobilier à l'achat est légèrement plus accessible à Montpellier (3 200€/m² vs 3 500€/m² à Toulouse). Les restaurants et loisirs sont comparables. L'avantage Montpellier : la mer est à 15 km, ce qui remplace des vacances coûteuses. L'inconvénient : les embouteillages sont pires par rapport à la taille de la ville.",
      },
      {
        heading: "Le soleil et le cadre de vie",
        body: "Montpellier : 2 740 heures de soleil/an, la mer à 15 min, une architecture de charme avec l'Écusson médiéval. Toulouse : 2 010 heures de soleil/an, la Garonne, les Pyrénées à 1h30. Sur le soleil pur, Montpellier écrase. Mais Toulouse est une ville plus chaleureuse (au sens humain), la culture rugby crée une cohésion sociale unique, et les Toulousains ont la réputation d'être parmi les plus accueillants de France.",
      },
      {
        heading: "Pour les familles",
        body: "Toulouse est généralement préférée pour les familles : réseau scolaire plus dense, quartiers résidentiels avec maisons et jardins plus accessibles, moins de trafic stressant qu'à Montpellier. Les familles Montpelliéraines citent régulièrement les embouteillages et le manque de logement familiaux à prix raisonnables en inconvénient majeur. Mais la proximité de la mer et le cadre languedocien compensent pour beaucoup.",
      },
      {
        heading: "Notre verdict",
        body: "Ingénieur ou technicien cherchant un emploi stable : Toulouse. Étudiant, remote worker ou amateur de Méditerranée : Montpellier. Famille cherchant une grande ville sud : Toulouse pour la stabilité, Montpellier pour le cadre. Retraité voulant le soleil : Montpellier si la mer est prioritaire, Toulouse si vous aimez les grandes villes animées.",
      },
    ],
    relatedCities: ["toulouse", "montpellier", "bordeaux", "nimes", "perpignan"],
    relatedGuides: [
      "bordeaux-lyon-nantes-quelle-ville-choisir",
      "budget-vivre-en-france-comparatif",
      "soleil-france-guide",
    ],
    tags: ["Toulouse", "Montpellier", "Occitanie", "comparaison", "Sud de la France"],
  },
  {
    slug: "vivre-sans-voiture-france-guide-2025",
    title: "Vivre sans voiture en France : les 10 villes où c'est vraiment possible",
    metaTitle: "Vivre sans voiture en France — Top villes 2025 (vélo, tramway, TGV)",
    metaDesc:
      "Tramway, vélo, marchabilité : notre classement des villes françaises où vous pouvez vous passer de voiture au quotidien. Données transports 2025.",
    category: "lifestyle",
    emoji: "🚲",
    readMinutes: 7,
    publishedAt: "2025-03-20",
    updatedAt: "2025-04-26",
    intro:
      "La voiture coûte en moyenne 6 000€/an en France (assurance, carburant, entretien, stationnement). Se passer de voiture, c'est potentiellement 500€/mois de pouvoir d'achat retrouvé. Ce guide identifie les villes françaises où c'est réellement possible — pas théoriquement, mais dans la pratique du quotidien.",
    sections: [
      {
        heading: "Les 3 critères qui font la différence",
        body: "1. La marchabilité : pouvez-vous faire 80% de vos courses, rendez-vous médicaux et loisirs à pied ou à vélo ? 2. La fréquence des transports : un réseau de bus toutes les 20 min n'est pas sans-voiture. 15 min ou moins, ça l'est. 3. La connexion TGV : pour les déplacements professionnels ponctuels, un TGV à 1h30 de Paris remplace avantageusement une voiture.",
      },
      {
        heading: "Strasbourg : le modèle européen",
        body: "Score transport MeilleurVille : 9.1/10. Strasbourg est la référence française du sans-voiture. Son réseau de tramway (6 lignes, 69 km) est le plus dense de France. La ville est officiellement la capitale du vélo français avec 600 km de pistes cyclables. 25% des habitants n'ont pas de voiture. Les connexions TGV (Paris 1h50, Lyon 3h, Bruxelles 4h) permettent tous les déplacements professionnels. L'hiver est froid mais les Strasbourgeois ont appris à vivre avec.",
      },
      {
        heading: "Grenoble et Nantes : les challengers",
        body: "Grenoble : tramway + câble + vélos en libre-service, et la montagne accessible en bus de nuit pour les week-ends ski. Score transport 8.9/10. Nantes : le premier tramway de France (modernisé), un réseau de bus dense, et un plan vélo ambitieux. L'effort de la métropole en mobilité douce depuis 10 ans est remarquable. Score transport 8.7/10. Les deux villes permettent une vie sans voiture confortable.",
      },
      {
        heading: "Le piège des villes moyennes",
        body: "Beaucoup de villes moyennes ont un bus central mais laissent les quartiers périphériques sans desserte. Le test : regardez les horaires du dernier bus vers votre quartier un vendredi soir. S'il part à 20h30, vous aurez besoin d'une voiture pour sortir. Les réseaux «politiques» font bonne figure dans les brochures mais ne résistent pas à l'usage quotidien.",
      },
      {
        heading: "Rennes : la montée en puissance",
        body: "Rennes a investi massivement en mobilité ces dernières années : 2 lignes de métro, réseau de bus amélioré, vélos STAR en libre-service. Score transport 8.5/10. La ville est également cyclable à 90% selon les habitants. Et la taille humaine (220 000 hab.) fait que la plupart des destinations quotidiennes sont à 15-20 min à vélo.",
      },
      {
        heading: "Le calcul sans-voiture",
        body: "Abonnement transport mensuel : 50-75€. Location vélo : 15-20€/mois. Taxis/VTC ponctuels : 30-50€/mois. Total : 100-150€/mois. Voiture : 400-600€/mois (assurance, carburant, crédit, entretien). Économie mensuelle : 250-450€. Sur 5 ans : 15 000 à 27 000€. De quoi financer un projet de vie. Et une empreinte carbone divisée par 3.",
      },
    ],
    relatedCities: ["strasbourg", "grenoble", "nantes", "rennes", "bordeaux"],
    relatedGuides: [
      "vivre-en-france-teletravail-guide-2025",
      "budget-vivre-en-france-comparatif",
      "villes-etudiantes-france-guide",
    ],
    tags: ["sans voiture", "vélo", "transport", "tramway", "mobilité douce"],
  },
  {
    slug: "vivre-en-alsace-guide-2025",
    title: "Vivre en Alsace en 2025 : Strasbourg, Colmar, Mulhouse — Guide complet",
    metaTitle: "Vivre en Alsace 2025 — Guide Strasbourg, Colmar, Mulhouse",
    metaDesc:
      "Qualité de vie, emploi, gastronomie, culture : notre guide complet pour s'installer en Alsace. Comparaison Strasbourg vs Colmar vs Mulhouse avec données réelles.",
    category: "region",
    emoji: "🥨",
    readMinutes: 8,
    publishedAt: "2025-04-10",
    updatedAt: "2025-04-28",
    intro:
      "L'Alsace est la région française la plus singulière : culturellement entre France et Allemagne, gastronomiquement incomparable, géographiquement entre Rhin et Vosges. S'y installer est un choix de vie fort. Ce guide compare les trois villes principales et vous aide à décider.",
    sections: [
      {
        heading: "Strasbourg : la capitale européenne",
        body: "Score global MeilleurVille : 8.2/10. Strasbourg est unique en France : siège du Parlement européen et du Conseil de l'Europe, elle concentre les institutions supranationales et attire profils internationaux et fonctionnaires européens. Son architecture renaissance et son centre médiéval (Grande Île classée UNESCO) en font l'une des plus belles villes de France. Le réseau de tramway est le meilleur de France. Seul bémol : les loyers ont augmenté (+30% en 5 ans) avec l'attractivité.",
      },
      {
        heading: "Colmar : le charme sans les inconvénients de la grande ville",
        body: "Score global : 7.9/10. Colmar est la «petite Venise d'Alsace» : ses maisons à colombages sont parmi les plus photographiées de France. La ville de 70 000 habitants a la taille idéale — tout est accessible à pied ou à vélo, sans les embouteillages et l'agitation de Strasbourg. Les loyers sont significativement plus bas (T2 médian : 620€ vs 850€ à Strasbourg). La Route des Vins débute à ses portes. Bémol : bassin d'emploi limité — préférez le remote ou les pendulaires vers Strasbourg (20 min de TER).",
      },
      {
        heading: "Mulhouse : la valeur confidentielle",
        body: "Score global : 6.8/10. Mulhouse est la plus incomprise des villes alsaciennes. Son passé industriel a laissé des quartiers populaires mais aussi des musées uniques (Cité de l'Automobile, Musée du Chemin de Fer). La ville est la moins chère d'Alsace (T2 médian : 540€) et bénéficie d'une position stratégique : 25 min de Bâle (Suisse) et ses salaires suisses, 45 min de Fribourg-en-Brisgau. Pour les travailleurs frontaliers, c'est une base remarquable.",
      },
      {
        heading: "L'identité alsacienne : ce qu'on ne vous dit pas",
        body: "L'Alsace a une identité culturelle forte et parfois fermée. Les Alsaciens de souche (environ 50% de la population régionale) peuvent sembler froids aux nouveaux arrivants. Mais ceux qui s'y établissent décrivent une intégration progressive chaleureuse — particulièrement si vous vous intéressez à la culture locale (marché de Noël, Winstubs, Bredele). La frontière culturelle franco-allemande crée aussi une richesse linguistique et gastronomique sans équivalent.",
      },
      {
        heading: "L'avantage frontalier",
        body: "Mulhouse et le Bas-Rhin sont à proximité de la Suisse et de l'Allemagne. Travailler à Bâle en habitant à Mulhouse (salaire suisse, loyer français) est un calcul financier redoutable : salaires 40-60% supérieurs en CHF, loyers 2x moins chers qu'à Bâle. 80 000 frontaliers font ce choix chaque jour. Pour les profils santé, ingénierie et finance, c'est un avantage compétitif majeur.",
      },
      {
        heading: "Gastronomie et qualité de vie",
        body: "L'Alsace est régulièrement classée première région de France pour la gastronomie. La densité de restaurants étoilés Michelin par habitant est la plus haute de France. Le vin d'Alsace (Riesling, Gewurztraminer, Pinot Gris) est produit à 20 minutes en voiture. Les marchés de Noël de Colmar et Strasbourg sont les plus beaux d'Europe. Pour la qualité de vie culinaire et culturelle, la région n'a pas d'équivalent.",
      },
    ],
    relatedCities: ["strasbourg", "colmar", "mulhouse"],
    relatedGuides: [
      "budget-vivre-en-france-comparatif",
      "vivre-sans-voiture-france-guide-2025",
      "quitter-paris-guide-2025",
    ],
    tags: ["Alsace", "Strasbourg", "Colmar", "Mulhouse", "Grand Est", "frontalier"],
  },
  {
    slug: "paris-province-guide-demenagement-2025",
    title: "Quitter Paris pour la province : le guide complet 2025",
    metaTitle: "Quitter Paris : guide demenagement province 2025 — Choisir sa ville",
    metaDesc: "Salaire, loyer, TGV, qualité de vie : tout ce que vous devez savoir avant de quitter Paris pour une ville de province en 2025. Villes recommandées selon votre profil.",
    category: "lifestyle",
    emoji: "🚂",
    readMinutes: 10,
    publishedAt: "2025-03-01",
    updatedAt: "2025-04-25",
    intro: "400 000 Parisiens ont quitté Île-de-France depuis 2020. Si vous y pensez, vous n'êtes pas seul. Mais «quitter Paris» est un projet qui peut se passer à merveille ou tourner au drame si mal préparé. Ce guide couvre les vraies questions — pas les clichés.",
    sections: [
      {
        heading: "La première erreur : choisir une ville pour ses vacances",
        body: "Tout le monde a un biais touristique : «j'ai adoré Biarritz cet été, j'y déménage». Mais vivre quelque part en novembre, avec votre vie professionnelle, votre réseau social à reconstruire et vos enfants à scolariser — c'est un test très différent d'un week-end au soleil. La règle d'or : passez au moins 2 semaines en hiver dans la ville avant de signer un bail.",
      },
      {
        heading: "Votre réseau professionnel vaut de l'argent",
        body: "À Paris, votre réseau représente souvent 30 à 50% de votre valeur professionnelle — clients potentiels, opportunités d'emploi, recommandations. En province, ce réseau s'effondre sauf si vous êtes full remote ou indépendant avec des clients nationaux/internationaux. Les salariés en CDI ont plus de flexibilité (télétravail) mais une vraie limite : le jour où vous voudrez changer de poste.",
      },
      {
        heading: "Le calcul financier réel",
        body: "Gain côté budget : loyer -600 à -1 000€/mois, charges -200€, transports -80€ = 880 à 1 280€/mois d'économies. Perte côté salaire : -10 à -25% selon le secteur et la ville. En tech/remote : 0% de perte. En finance/luxe/grands groupes : -15 à -25%. Pour un cadre à 55 000€ brut, perdre 15% = -8 250€/an. Gain logement = +13 000€/an. Bilan positif — mais vérifiez votre secteur précisément.",
      },
      {
        heading: "Les villes qui absorbent le mieux les Parisiens",
        body: "Rennes, Nantes et Bordeaux ont les communautés d'expatriés parisiens les plus structurées. Des groupes Facebook actifs, des associations de networking, des événements spécifiques. Strasbourg attire les profils UE / institutions européennes. Lyon absorbe les carrières ambitieuses. Montpellier et Nice attirent les profils soleil/lifestyle. Chacune a une «identité d'accueil» différente.",
      },
      {
        heading: "Le facteur partenaire",
        body: "Si vous êtes en couple et que votre partenaire reste attaché à Paris (famille, amis, emploi non transférable) : votre déménagement a moins de 30% de chances de durer 5 ans. Ce n'est pas un jugement, c'est une statistique. Assurez-vous que votre projet est partagé à 100% avant de signer quoi que ce soit. Beaucoup de gens reviennent à Paris non pas à cause de la ville choisie, mais à cause de cette asymétrie dans le couple.",
      },
      {
        heading: "Notre recommandation selon votre profil",
        body: "Remote worker/freelance : Rennes, Nantes, Bordeaux ou Montpellier selon votre préférence climat. Salarié en hybride (2j/semaine au bureau) : choisissez selon le TGV — 1h30 max. Famille avec enfants : Rennes, Nantes, Annecy, Aix-en-Provence. Retraite ou semi-retraite : La Rochelle, Vannes, Pau, Avignon. Utilisez notre quiz IA pour affiner selon vos critères personnels.",
      },
    ],
    relatedCities: ["rennes", "nantes", "bordeaux", "montpellier", "annecy"],
    relatedGuides: ["quitter-paris-guide-2025", "vivre-en-france-teletravail-guide-2025"],
    tags: ["déménagement", "quitter Paris", "télétravail", "province", "expatrié"],
  },
  {
    slug: "vivre-en-normandie-guide-2025",
    title: "Vivre en Normandie en 2025 : Rouen, Caen ou Le Havre ?",
    metaTitle: "Vivre en Normandie 2025 — Rouen, Caen, Le Havre : laquelle choisir ?",
    metaDesc:
      "Guide complet pour s'installer en Normandie : comparatif Rouen vs Caen vs Le Havre, loyers, qualité de vie, TGV Paris, économie locale. Tout ce qu'il faut savoir avant de déménager.",
    category: "region",
    emoji: "⚓",
    readMinutes: 7,
    publishedAt: "2025-03-20",
    updatedAt: "2025-04-28",
    intro:
      "La Normandie souffre d'une image injuste. On y pense pluie, pommes et plages du Débarquement — alors que la région offre l'une des meilleures qualités de vie de France à moins de 2h de Paris. Rouen, Caen et Le Havre sont trois profils radicalement différents. Ce guide vous aide à choisir selon votre situation.",
    sections: [
      {
        heading: "Rouen : la métropole qui ressemble à Paris mais coûte deux fois moins cher",
        body: "Score qualité de vie MeilleurVille : 7.0/10. Rouen est la grande surprise de la Normandie. Métropole de 500 000 habitants, elle concentre tous les atouts d'une vraie ville : scène culturelle dense (le 106, l'opéra, les musées), université active, tissu commercial complet. Le TGV la place à 1h10 de Paris Saint-Lazare — parfait pour les hybrides. Loyer T2 médian : 680€. Le bémol ? La pollution atmosphérique, amplifiée par la vallée de la Seine et les industries pétrochimiques.",
      },
      {
        heading: "Caen : la ville la plus «vivable» de Normandie",
        body: "Score qualité de vie : 7.0/10. Caen est la ville des familles et des étudiants. Son université accueille 30 000 étudiants, ce qui maintient une ambiance jeune et une vie nocturne décente. Les espaces verts sont nombreux, les quartiers résidentiels calmes et le prix de l'immobilier parmi les plus accessibles de France (T2 médian : 650€). Paris est à 2h en train — trop loin pour le quotidien hybride, mais parfait pour une vie décorrélée de la capitale.",
      },
      {
        heading: "Le Havre : la ville patrimoniale méconnue",
        body: "Score qualité de vie : 6.8/10. Le Havre est la ville surprenante de ce trio. Classé au Patrimoine mondial UNESCO pour son architecture d'après-guerre signée Auguste Perret, il connaît une renaissance culturelle portée par l'ESAM et la scène artistique. Son port en fait un hub économique solide avec des emplois stables dans la logistique et l'industrie. Loyer T2 médian : 580€ — un des plus bas de la région. L'accès à la mer est immédiat : les plages d'Étretat sont à 30 min.",
      },
      {
        heading: "Le facteur décisif : le TGV",
        body: "Si vous êtes en mode hybride Paris, la distance en train est cruciale. Rouen (1h10) est la seule option réaliste pour des allers-retours fréquents. Caen (2h) et Le Havre (2h10) sont mieux adaptés à des vies entièrement délocalisées. La ligne ferroviaire Paris-Rouen est dense (un train toutes les 30 min aux heures de pointe) et régulière — un avantage concret par rapport à d'autres régions.",
      },
      {
        heading: "Notre verdict selon votre profil",
        body: "Hybride Paris 2-3j/semaine : Rouen sans hésitation. Remote total ou salarié local : Caen pour les familles, Le Havre pour les budgets serrés ou les profils maritime/industriel. Investissement locatif : Le Havre offre les meilleures rentabilités brutes (5 à 7%). Le Havre est aussi la ville qui monte le plus vite — bonne nouvelle pour les primo-investisseurs.",
      },
    ],
    relatedCities: ["rouen", "caen", "le-havre"],
    relatedGuides: ["quitter-paris-guide-2025", "vivre-en-france-teletravail-guide-2025"],
    tags: ["Normandie", "Rouen", "Caen", "Le Havre", "déménagement", "région"],
  },
  {
    slug: "cote-atlantique-bordeaux-la-rochelle-bayonne",
    title: "Côte Atlantique : Bordeaux, La Rochelle ou Bayonne — Laquelle vous correspond ?",
    metaTitle: "Bordeaux vs La Rochelle vs Bayonne — Vivre sur la Côte Atlantique 2025",
    metaDesc:
      "Comparatif complet des trois grandes villes de la côte atlantique française : Bordeaux (métropole), La Rochelle (port), Bayonne (Pays Basque). Loyers, qualité de vie, profils d'habitants.",
    category: "comparaison",
    emoji: "🌊",
    readMinutes: 8,
    publishedAt: "2025-04-01",
    updatedAt: "2025-04-28",
    intro:
      "La côte atlantique concentre trois des villes les plus convoitées de France. Bordeaux la métropole branchée, La Rochelle la cité portuaire ensoleillée, Bayonne la porte du Pays Basque. Chacune cible un profil différent — voici lequel vous correspond.",
    sections: [
      {
        heading: "Bordeaux : la métropole qui a tout, mais qui le fait payer",
        body: "Score MeilleurVille : 8.0/10. Bordeaux est l'une des grandes métropoles françaises les plus attractives. En 10 ans, elle a connu une gentrification spectaculaire : les loyers ont bondi de 40% et le prix au m² avoisine 4 500€. Ce n'est plus «la province accessible» d'avant 2015. En échange, vous avez : un tramway efficace, une scène gastronomique et culturelle de premier ordre, la mer à 45 min et les vignobles en vélo. Profil type : cadre en télétravail partiel, famille avec revenu dual.",
      },
      {
        heading: "La Rochelle : soleil, vélos et 75 000 étudiants",
        body: "Score MeilleurVille : 7.9/10. La Rochelle est la ville qui surprend. Avec 340 jours de soleil par an (plus que Nice selon certaines statistiques), un réseau de vélos exemplaire (30% des déplacements), une université dynamique et un port de plaisance de carte postale, elle cumule les atouts à un prix encore raisonnable : T2 médian à 870€. Le hic : le marché immobilier s'est tendu depuis le COVID et les prix à l'achat ont doublé en 8 ans. Profil type : remote worker lifestyle, retraité actif, famille primo-accédante.",
      },
      {
        heading: "Bayonne : la ville la plus singulière des trois",
        body: "Score MeilleurVille : 7.8/10. Bayonne n'est pas une métropole — elle est la capitale d'un territoire, le Pays Basque français. Ce qui la distingue : une identité culturelle forte (fêtes de Bayonne, gastronomie, pelote basque), une économie locale résiliente, et une proximité avec Biarritz et la côte à 8 km. Le revers : le marché immobilier est devenu tendu avec l'afflux de Parisiens post-COVID. T2 médian : 850€. Profil type : lifestyle fort, attachement au terroir, télétravail ou indépendant.",
      },
      {
        heading: "Le tableau comparatif en 4 critères",
        body: "Budget logement (loyer T2) : Le Havre 580€ < La Rochelle 870€ ≈ Bayonne 850€ < Bordeaux 950€. Transports Paris : Bordeaux 2h TGV ≈ La Rochelle 2h10 TGV < Bayonne 2h TGV. Ensoleillement : La Rochelle (2 400h/an) ≈ Bayonne (2 000h) < Bordeaux (2 050h). Métropole / services : Bordeaux >>> La Rochelle > Bayonne.",
      },
      {
        heading: "Notre recommandation selon votre profil",
        body: "Vous cherchez une vraie métropole avec une vie urbaine complète → Bordeaux. Vous voulez le soleil, le vélo et une ville à taille humaine → La Rochelle. Vous cherchez une identité culturelle forte et la montagne à 1h → Bayonne. Pour l'investissement locatif, La Rochelle reste la meilleure option en 2025 (rendement 4-5%, demande locative étudiante stable).",
      },
    ],
    relatedCities: ["bordeaux", "la-rochelle", "bayonne", "biarritz", "pau"],
    relatedGuides: ["quitter-paris-guide-2025", "vivre-bord-mer-france-guide"],
    tags: ["côte atlantique", "Bordeaux", "La Rochelle", "Bayonne", "comparaison", "déménagement"],
  },
  {
    slug: "investissement-locatif-meilleures-villes-2025",
    title: "Investissement locatif 2025 : les 8 meilleures villes françaises",
    metaTitle: "Meilleures villes investissement locatif France 2025 — Rendement & Tension",
    metaDesc:
      "Classement des meilleures villes françaises pour investir dans l'immobilier locatif en 2025 : rendement brut, tension locative, prix au m², perspectives de valorisation.",
    category: "budget",
    emoji: "🏘️",
    readMinutes: 9,
    publishedAt: "2025-04-10",
    updatedAt: "2025-04-28",
    intro:
      "Avec des taux en baisse et un marché immobilier qui cherche son équilibre, 2025 offre des opportunités concrètes pour l'investisseur locatif bien informé. Mais toutes les villes ne se valent pas : certaines ont une rentabilité brute de 3%, d'autres de 7%. Ce guide classe les 8 meilleures villes françaises selon 4 critères : rendement brut, tension locative, perspectives de valorisation et risque de vacance.",
    sections: [
      {
        heading: "Comment évaluer la qualité d'un investissement locatif",
        body: "Le rendement brut (loyer annuel / prix d'achat) est le premier indicateur mais pas le seul. Une ville avec 7% brut mais 20% de vacance locative est pire qu'une ville à 4% brut avec un taux de vacance de 2%. Les 4 critères à croiser : rendement brut, tension locative (rapport offre/demande), dynamisme démographique (population croissante ou décroissante) et qualité du tissu économique local.",
      },
      {
        heading: "Mulhouse : le rendement le plus élevé de France",
        body: "Rendement brut moyen : 7 à 9%. Prix d'achat T2 : 70 000 à 100 000€. Loyer médian T2 : 580€/mois. Mulhouse est la ville des investisseurs à la recherche de cash-flow immédiat. Les prix restent très bas malgré une demande locative soutenue par la présence de l'Université de Haute-Alsace et des zones industrielles. Le risque : la tension sociale dans certains quartiers et une valorisation faible à long terme. À réserver aux investisseurs chevronnés qui savent sélectionner les bons secteurs.",
      },
      {
        heading: "Le Havre : la ville qui monte",
        body: "Rendement brut : 5 à 7%. Prix T2 : 90 000 à 140 000€. Loyer T2 : 580€. Le Havre combine des prix encore accessibles avec une revalorisation en cours (son classement UNESCO attire de nouveaux investisseurs, la fibre est déployée massivement). La demande locative est portée par le port, l'université et les étudiants. Profil idéal pour un investisseur à horizon 10-15 ans.",
      },
      {
        heading: "Limoges et Poitiers : sécurité et régularité",
        body: "Rendement brut : 5 à 6.5%. Ces deux villes universitaires de taille moyenne offrent des marchés locatifs stables sans les à-coups des grandes métropoles. À Limoges, un T2 s'achète entre 80 000 et 110 000€ pour un loyer de 500 à 600€. La demande locative est structurellement soutenue par les 18 000 étudiants de l'université. Peu spectaculaire, mais fiable.",
      },
      {
        heading: "Toulouse et Montpellier : croissance démographique = sécurité locative",
        body: "Rendement brut : 3.5 à 4.5%. Ces deux métropoles ont des rendements plus modestes mais une valorisation patrimoniale forte. Toulouse gagne 15 000 habitants par an, Montpellier 7 000. Les prix ont monté mais le déséquilibre offre/demande reste structurel. À privilégier si vous cherchez la plus-value plutôt que le cash-flow immédiat.",
      },
      {
        heading: "Le trio à éviter pour un premier investissement",
        body: "Paris : rendements de 2 à 3%, réglementation forte (encadrement des loyers), prix d'entrée prohibitifs. Nice : forte saisonnalité, prix élevés, marché tendu pour les locataires de longue durée. Cannes : marché ultra-saisonnier, inadapté à l'investissement locatif classique. Ces villes ont des qualités intrinsèques, mais elles ne sont pas optimales pour un investisseur cherchant régularité et rendement.",
      },
      {
        heading: "Le bon moment pour investir en 2025",
        body: "Avec des taux directeurs en baisse (-1 point en 12 mois) et des prix immobiliers stabilisés dans la plupart des villes secondaires, 2025 offre la meilleure fenêtre d'entrée depuis 2016. Les vendeurs acceptent plus de négociation, les acheteurs récupèrent du pouvoir d'achat. La stratégie recommandée : cibler des T2 dans les villes universitaires à tension locative forte, avec un prix d'achat permettant un rendement net (après charges) d'au moins 3.5%.",
      },
    ],
    relatedCities: ["mulhouse", "le-havre", "limoges", "toulouse", "montpellier", "poitiers"],
    relatedGuides: ["budget-vivre-en-france-comparatif", "quitter-paris-guide-2025"],
    tags: ["investissement locatif", "immobilier", "rendement", "SCPI", "patrimoine"],
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
