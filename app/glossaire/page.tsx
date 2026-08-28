import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { StaticPageCrossLink } from "@/components/StaticPageCrossLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Glossaire immobilier, aides, école, santé & mobilité",
  description:
    "DPE, TAEG, ZFE, Crit'Air, APL, MaPrimeRénov', carte scolaire, cat-nat, médecin traitant, FPS : les termes utiles pour s'installer quelque part en France.",
  alternates: pathAlternates("/glossaire", "/glossary"),
};

type Term = { term: string; def: string };
type Section = { title: string; emoji: string; terms: Term[] };

const SECTIONS: Section[] = [
  {
    title: "Immobilier · achat et location",
    emoji: "🏠",
    terms: [
      {
        term: "DPE (Diagnostic de Performance Énergétique)",
        def: "Classe la consommation énergétique d'un logement de A (≤70 kWh/m²/an) à G (>420 kWh/m²/an). Depuis 2025, les logements G sont interdits à la location ; F le seront en 2028, E en 2034. À vérifier impérativement avant achat — un DPE F/G impose des travaux d'isolation parfois lourds (10-30 k€).",
      },
      {
        term: "Frais de notaire",
        def: "Droits de mutation + émoluments + débours, ~7-8 % du prix d'achat dans l'ancien, ~2-3 % dans le neuf. À ajouter au prix d'achat dans tout calcul de capacité d'emprunt. Pour un T3 à 250 k€ dans l'ancien : ~17-19 k€ de frais de notaire.",
      },
      {
        term: "Taxe foncière",
        def: "Impôt local annuel payé par le propriétaire (résidence principale ou secondaire). Calculée sur la valeur locative cadastrale × taux communal + départemental. Varie fortement : ~600 €/an pour un T3 à Limoges, ~1 800 €/an pour un T3 à Marseille. À vérifier avant achat — peut peser sur la rentabilité locative.",
      },
      {
        term: "Taxe d'habitation",
        def: "Supprimée pour les résidences principales depuis 2023. Toujours due sur les résidences secondaires, avec majoration possible (jusqu'à +60 %) dans les communes en zone tendue. À vérifier avant achat secondaire en bord de mer ou ville touristique.",
      },
      {
        term: "Encadrement des loyers",
        def: "Plafond légal du loyer/m² pour un logement, modulé par typologie, époque de construction, étage. En vigueur à Paris, Lille, Lyon-Villeurbanne, Bordeaux, Montpellier, Plaine-Commune et Est-Ensemble. Dépassement seulement avec complément de loyer justifié (charme architectural, équipements premium). Faute : restitution rétroactive + amende ~5 000 €.",
      },
      {
        term: "Loi Carrez",
        def: "Mesure officielle de la surface privative d'un bien en copropriété : sont déduits les zones de hauteur sous plafond <1,80 m, murs, cloisons, escaliers, gaines. Mentionnée obligatoirement dans toute promesse de vente. Une erreur >5 % donne droit à une diminution proportionnelle du prix.",
      },
      {
        term: "Loi Boutin",
        def: "Mesure de la surface habitable d'un logement loué (vide ou meublé). Plus restrictive que Carrez : exclut aussi les balcons, terrasses, caves, garages, sous-sols. Doit être indiquée dans le bail.",
      },
      {
        term: "Charges récupérables / non récupérables",
        def: "Charges de copropriété qu'un propriétaire bailleur peut (récupérables : entretien parties communes, ascenseur, eau froide) ou ne peut pas (non-récupérables : ravalement, gros travaux, syndic) refacturer au locataire. Le ratio non-récupérables / loyer brut est un déterminant clé du rendement net.",
      },
    ],
  },
  {
    title: "Investissement locatif",
    emoji: "💼",
    terms: [
      {
        term: "LMNP (Loueur Meublé Non Professionnel)",
        def: "Statut fiscal pour bailleur louant en meublé, recettes <23 k€/an OU <50 % revenus du foyer. Deux régimes : micro-BIC (abattement 50 %, simple) ou réel (amortissement du bien — souvent fiscalement neutre les premières années). Régime favorable pour investisseur particulier.",
      },
      {
        term: "LMP (Loueur Meublé Professionnel)",
        def: "Statut quand recettes >23 k€/an ET >50 % revenus foyer. Plus contraignant administrativement (BIC professionnel, cotisations sociales URSSAF) mais permet déficit imputable sur revenu global. Rentable au-delà de 3-4 biens loués.",
      },
      {
        term: "Rendement brut / net",
        def: "Brut = loyer annuel ÷ prix d'achat. Net = (loyer - taxe foncière - charges non récup. - assurances - vacance estimée - travaux annuels) ÷ (prix d'achat + frais notaire). L'écart brut/net est typiquement de 1-1,5 point en France (ex : 5,5 % brut → 4 % net).",
      },
      {
        term: "Encadrement loyer de référence",
        def: "Loyer médian par zone géographique, typologie, époque de construction et caractère meublé/vide. Publié par OLAP (Paris) et observatoires régionaux. Sert de base à l'encadrement légal et permet d'évaluer la cohérence d'un loyer proposé avant achat.",
      },
      {
        term: "Vacance locative",
        def: "Période où un logement est non loué. À Bordeaux, Lyon, Toulouse : ~2-4 % moyens (15-22 jours/an). À Limoges, Saint-Étienne : ~6-8 %. À budgétiser dans tout calcul de rendement réaliste — un mois de vacance/an retire ~8 % au rendement brut.",
      },
      {
        term: "Pinel / Pinel+",
        def: "Réduction d'impôt pour acquisition logement neuf locatif (12 % du prix sur 6 ans, 18 % sur 9 ans, 21 % sur 12 ans, Pinel+ avec critères énergétiques). En extinction depuis 2024, prolongée éventuellement 2025-2027. Méfiance : programmes Pinel souvent surcôtés vs ancien comparable.",
      },
      {
        term: "Denormandie",
        def: "Réduction d'impôt similaire au Pinel, mais pour acquisition + rénovation dans l'ancien en centre-ville de communes éligibles (≤200 000 hab., revitalisation centre). Travaux ≥25 % prix total. Particulièrement intéressant Limoges, Saintes, Roubaix, Cherbourg.",
      },
    ],
  },
  {
    title: "Urbanisme et environnement",
    emoji: "🌳",
    terms: [
      {
        term: "ZFE (Zone à Faibles Émissions)",
        def: "Périmètre urbain où les véhicules les plus polluants sont progressivement interdits, obligatoire dans les agglomérations de plus de 150 000 habitants (Lyon, Marseille, Toulouse, Bordeaux, Nantes, Strasbourg, Montpellier, Nice…). Le dispositif a été donné pour mort au printemps 2026, à tort : sa suppression, votée le 15 avril 2026 dans la loi de simplification de la vie économique, a été censurée par le Conseil constitutionnel le 21 mai 2026 comme cavalier législatif — une censure de procédure au titre de l'article 45 de la Constitution, et non sur le fond. Le cadre légal des ZFE reste donc en vigueur, et la vignette Crit'Air reste exigée pour y circuler. Ce qui varie, et beaucoup, c'est le calendrier d'exclusion des vignettes et le régime de sanction, décidés métropole par métropole et souvent repoussés : à vérifier sur le site de la métropole concernée avant d'acheter un véhicule ancien ou de déménager.",
      },
      {
        term: "PLU (Plan Local d'Urbanisme)",
        def: "Document communal/métropolitain fixant les règles d'occupation des sols. Détermine si vous pouvez surélever, agrandir, changer destination d'un bien. À consulter avant achat avec projet de travaux. Consultable en mairie ou sur Géoportail-urbanisme.gouv.fr.",
      },
      {
        term: "Zonage A/B1/B2/C (logement)",
        def: "Zonage national mesurant la tension du marché immobilier, déterminant éligibilité Pinel, PTZ, etc. A bis (Paris) > A (grandes métropoles) > B1 (villes moyennes tendues) > B2 (villes moyennes détendues) > C (rural). Une commune en B2 ouvre droit au PTZ ancien (avec travaux) jusqu'en 2027.",
      },
      {
        term: "PTZ (Prêt à Taux Zéro)",
        def: "Prêt sans intérêts pour primo-accédants, sous conditions de revenus, complémentaire d'un prêt classique. Limité à 50 % du montant total (selon zone). Recentré 2024-2027 sur neuf en collectif zones tendues + ancien avec travaux en B2/C. Souvent décisif pour primo-accédants modestes.",
      },
      {
        term: "DROM",
        def: "Départements et Régions d'Outre-Mer : Guadeloupe (971), Martinique (972), Guyane (973), Réunion (974), Mayotte (976). Régime fiscal et logement spécifique (LBU, défiscalisation outre-mer). Saint-Pierre-et-Miquelon et certains TOM (Polynésie, Nouvelle-Calédonie) ne sont pas DROM.",
      },
      {
        term: "Carte ATMO (qualité de l'air)",
        def: "Indice quotidien de qualité de l'air par agglomération (1-10), publié par associations agréées (AirParif, Atmo Sud, Atmo Auvergne-Rhône-Alpes...). Mesure 5 polluants : PM10, PM2,5, NO2, O3, SO2. Consultable sur atmo-france.org. Utile avant déménagement avec asthme/allergies.",
      },
    ],
  },
  {
    title: "Connectivité et télétravail",
    emoji: "📡",
    terms: [
      {
        term: "Fibre FTTH (Fiber To The Home)",
        def: "Connexion fibre optique jusqu'à l'intérieur du logement. Débit symétrique 1-8 Gbps selon offre. Couverture FTTH en France : ~95 % théorique fin 2025, mais variable rue par rue. Vérifier précisément l'adresse sur carte ARCEP (cartefibre.arcep.fr) avant achat en télétravail.",
      },
      {
        term: "DSL / VDSL",
        def: "Anciennes technologies cuivre (jusqu'à 100 Mbps selon distance au répartiteur). En extinction progressive d'ici 2030. Si une adresse n'a que du VDSL et pas de fibre prévue, télétravail intensif risqué.",
      },
      {
        term: "4G fixe / 5G fixe",
        def: "Solution mobile remplaçant le fixe quand fibre/DSL indisponibles. Débit variable selon couverture (10-300 Mbps). Compromis acceptable rural, mais saturé en zone touristique l'été (juillet-août : débit divisé par 3-5 en Hossegor, Île de Ré, Cassis, etc.).",
      },
      {
        term: "Couverture mobile (carte ARCEP)",
        def: "Carte officielle de couverture 2G/3G/4G/5G par opérateur. À consulter avant tout déménagement rural ou côtier. Disponible sur monreseaumobile.arcep.fr. Permet de tester un signal réel à une adresse précise.",
      },
      {
        term: "Coworking",
        def: "Espace de travail partagé avec abonnement (200-400 €/mois). Utile pour rompre l'isolement télétravailleur, accéder à un réseau professionnel, avoir une adresse pro. Quasi tous les chefs-lieux de département ont au moins un espace ; les villes moyennes (Brest, Quimper, La Rochelle) en ont plusieurs.",
      },
    ],
  },
  {
    title: "Crédit immobilier et financement",
    emoji: "🏦",
    terms: [
      {
        term: "TAEG (Taux Annuel Effectif Global)",
        def: "Coût total du crédit en pourcentage annuel, intégrant taux nominal, frais de dossier, assurance emprunteur obligatoire, garantie (caution ou hypothèque) et frais de tenue de compte. C'est le seul indicateur qui permet de comparer honnêtement deux offres : un prêt à 3,2 % peut afficher un TAEG à 4,1 % une fois l'assurance ajoutée. Tout établissement bancaire est tenu de l'afficher dans la fiche d'information précontractuelle.",
      },
      {
        term: "Taux d'usure",
        def: "Plafond légal du TAEG fixé chaque trimestre par la Banque de France. Au-delà, une banque ne peut légalement pas prêter. Calculé comme le TAEG moyen pratiqué le trimestre précédent majoré d'un tiers. Important pour les profils limites (revenus modestes, primo-accédants, seniors) — quand les taux montent vite, le taux d'usure peut bloquer des dossiers même solvables.",
      },
      {
        term: "Capacité d'emprunt",
        def: "Montant maximum qu'une banque accepte de prêter, dérivé du taux d'endettement maximal (35 % des revenus nets, assurance comprise, règle HCSF) et de la durée (25 ans maximum dans l'ancien, 27 ans avec différé dans le neuf). Pour un couple à 4 500 €/mois nets, capacité ~230-260 k€ sur 20 ans selon taux et apport. Hors apport personnel, qui s'ajoute au montant emprunté.",
      },
      {
        term: "HCSF (Haut Conseil de Stabilité Financière)",
        def: "Autorité fixant les règles prudentielles du crédit immobilier en France depuis janvier 2022. Deux verrous : taux d'effort ≤35 % et durée ≤25 ans (27 ans dans le neuf avec différé). Les banques disposent d'une marge de dérogation de 20 % de leur production trimestrielle pour des dossiers atypiques (revenus élevés, primo-accédants).",
      },
      {
        term: "Assurance emprunteur",
        def: "Assurance obligatoire couvrant décès, invalidité, parfois perte d'emploi du souscripteur. Représente 25-35 % du coût total d'un crédit. La loi Lemoine (2022) autorise sa résiliation et son changement à tout moment, sans frais — un levier d'économie de 5 000-20 000 € sur un crédit de 250 k€. Délégation possible dès la signature : ne pas accepter l'assurance groupe de la banque sans comparer.",
      },
      {
        term: "Garantie (caution vs hypothèque)",
        def: "Sûreté exigée par la banque pour se protéger du défaut de paiement. Deux options : caution (organisme type Crédit Logement, ~1-1,5 % du capital, partiellement restituée en fin de prêt) ou hypothèque/IPPD (~1,5-2 %, frais de mainlevée si revente avant terme). La caution est plus souple, l'hypothèque s'impose pour certains profils (SCI familiale, revenus atypiques).",
      },
      {
        term: "Apport personnel",
        def: "Somme apportée par l'acquéreur en complément du prêt. Standard exigé par les banques en 2026 : 10-15 % du prix d'achat hors frais de notaire, ou 20 % frais inclus. En dessous de 10 %, dossier rarement accepté hors primo-accédants jeunes à fort potentiel salarial. L'apport idéal couvre frais de notaire + frais de dossier + garantie, ce qui évite d'emprunter pour des coûts non amortissables.",
      },
      {
        term: "Prêt in fine",
        def: "Crédit dont seuls les intérêts sont remboursés mensuellement, le capital étant restitué en une seule fois à l'échéance (souvent via un nantissement assurance-vie). Utilisé surtout en investissement locatif : intérêts plus élevés mais 100 % déductibles des revenus fonciers. Réservé à des profils patrimoniaux — pas adapté à une résidence principale.",
      },
      {
        term: "Renégociation et rachat de crédit",
        def: "Deux leviers pour réduire le coût d'un prêt en cours. Renégociation : avec sa banque actuelle, en cas de baisse de taux ≥0,7-1 point sur le capital restant dû. Rachat : par une banque concurrente, qui solde l'ancien prêt et propose un nouveau taux. Pertinent quand le capital restant dépasse 70 k€ et qu'il reste au moins 10 ans de remboursement. Frais à anticiper : indemnités de remboursement anticipé (max 3 % ou 6 mois d'intérêts) + nouveaux frais de dossier.",
      },
    ],
  },
  {
    title: "Fiscalité locale et déménagement",
    emoji: "📑",
    terms: [
      {
        term: "Quotient familial",
        def: "Mécanisme français de calcul de l'IR tenant compte de la composition du foyer (1 part par adulte, 0,5 par enfant à charge, 1 pour 3e enfant et plus). Détermine la tranche marginale d'imposition (TMI). À recalculer si déménagement avec changement de situation familiale.",
      },
      {
        term: "TMI (Tranche Marginale d'Imposition)",
        def: "Taux d'impôt sur le revenu appliqué à la dernière tranche de revenu. Tranches 2025 : 0 %, 11 %, 30 %, 41 %, 45 %. Détermine fiscalité réelle d'un investissement locatif (revenus fonciers s'ajoutent au revenu global).",
      },
      {
        term: "Prélèvements Sociaux (PS)",
        def: "17,2 % sur revenus du capital (loyers, plus-values immobilières, dividendes). S'ajoutent à l'IR. Pour un investisseur TMI 30 % : taux fiscal total revenus locatifs = 30 + 17,2 = 47,2 % sur la base imposable.",
      },
      {
        term: "Cotisation Foncière des Entreprises (CFE)",
        def: "Impôt local payé par les indépendants/auto-entrepreneurs domiciliés à leur adresse résidentielle. Varie fortement par commune (~200 €/an à Marseille, jusqu'à ~600 €/an à Paris). À anticiper pour télétravailleurs freelance changeant de ville.",
      },
      {
        term: "ISF / IFI (Impôt sur la Fortune Immobilière)",
        def: "Remplaçant de l'ISF depuis 2018, ne porte que sur le patrimoine immobilier net >1,3 M€. Tranches 0,5 %-1,5 %. Concerne investisseurs avec plusieurs biens. La résidence principale bénéficie d'un abattement 30 %.",
      },
      {
        term: "Plus-value immobilière",
        def: "Différence entre prix de vente et prix d'achat (+ frais et travaux). Exonérée pour résidence principale. Pour résidence secondaire ou locatif : 19 % IR + 17,2 % PS, soit 36,2 %, avec abattements progressifs (exonération totale IR après 22 ans détention, exonération PS après 30 ans).",
      },
    ],
  },
  {
    title: "Aides au logement et soutiens publics",
    emoji: "🤝",
    terms: [
      {
        term: "APL (Aide Personnalisée au Logement)",
        def: "Aide mensuelle versée par la CAF aux locataires (et à certains accédants) sous condition de ressources. Montant variable selon revenus N-2 du foyer, loyer payé, zone géographique (I/II/III), composition familiale. Pour un étudiant seul en T1 à 600 €/mois en zone II : ~100-180 €/mois. À demander dès la signature du bail — rétroactif uniquement sur le mois de la demande. Versement direct au bailleur possible (tiers payant).",
      },
      {
        term: "Visale (garantie locative gratuite)",
        def: "Caution locative gratuite proposée par Action Logement, ouverte aux moins de 31 ans (tous statuts, étudiants compris) et aux salariés du privé en mobilité dans les 6 mois suivant l'embauche. Couvre les impayés de loyer pendant toute la durée du bail (jusqu'à 36 mensualités). Visa à demander en ligne avant la signature du bail — le bailleur en récupère le numéro et l'enregistre. Souvent plus simple qu'un garant familial, notamment pour primo-locataires ou expat retour.",
      },
      {
        term: "Loc'Avantages (ex-Cosse)",
        def: "Dispositif fiscal incitant les bailleurs à louer en dessous du marché en échange d'une réduction d'impôt (15 % à 65 % des loyers selon le niveau de décote : Loc1 / Loc2 / Loc3). Conventionnement de 6 ans minimum avec l'Anah. Pour un locataire : loyer 15-45 % sous le marché, plafonds de ressources à respecter, dépôt de dossier directement auprès du propriétaire conventionné. Surfaces concernées surtout dans les zones tendues (Paris, Lyon, Bordeaux, Lille).",
      },
      {
        term: "Action Logement (ex-1 % logement)",
        def: "Organisme paritaire collectant la contribution des employeurs ≥50 salariés (0,45 % de la masse salariale) pour financer aides au logement et logements sociaux. Gère Visale, Mobili-Pass, Mobili-Jeune, Loca-Pass, AIDE Mobili-Aide, et propose des logements intermédiaires. À solliciter dès qu'un déménagement est lié à une mutation, embauche, alternance ou formation — la plupart des aides sont gratuites mais peu connues.",
      },
      {
        term: "Mobili-Pass / Mobili-Jeune",
        def: "Aides Action Logement pour salariés du privé mutés ou embauchés à plus de 70 km de leur domicile (Mobili-Pass : prise en charge double loyer ou frais d'agence jusqu'à 3 500 €) ou pour jeunes actifs/alternants de moins de 30 ans en formation pro (Mobili-Jeune : subvention loyer 10-100 €/mois pendant 11 mois, sous plafond de revenus). Demande en ligne dans les 6 mois suivant l'événement déclencheur.",
      },
      {
        term: "Loca-Pass (avance dépôt de garantie)",
        def: "Prêt à 0 % d'Action Logement finançant le dépôt de garantie d'un logement locatif privé ou social, jusqu'à 1 200 €. Remboursable en 25 mois maximum après une franchise de 3 mois. Ouvert aux moins de 30 ans, alternants, salariés du privé en mobilité. Utile pour déménager sans immobiliser de trésorerie — souvent décisif quand le dépôt + 1er loyer + frais d'agence dépassent 3 000 €.",
      },
      {
        term: "FSL (Fonds de Solidarité Logement)",
        def: "Dispositif départemental d'aide d'urgence pour locataires en difficulté : impayés de loyer, dépôt de garantie, premiers loyers, factures d'énergie, frais d'assurance habitation. Conditions de ressources strictes, instruction par le département (CCAS ou travailleurs sociaux). Montant et plafonds variables selon le département. À mobiliser tôt en cas de fragilité financière — la commission peut suspendre une procédure d'expulsion.",
      },
      {
        term: "GLI (Garantie Loyers Impayés)",
        def: "Assurance souscrite par le propriétaire bailleur (et non le locataire) couvrant impayés de loyer, dégradations, frais de procédure. Coût : 2-4 % du loyer annuel charges comprises, payé par le bailleur. Conditions d'éligibilité du locataire : revenus nets ≥ 2,7-3,3 fois le loyer, CDI confirmé ou équivalent. Incompatible avec Visale (un seul dispositif à la fois). Souvent imposée par les agences pour les profils non-CDI standard — connaître les seuils permet de préparer son dossier.",
      },
      {
        term: "MaPrimeAdapt'",
        def: "Aide forfaitaire de l'Anah pour adapter un logement au vieillissement ou au handicap (douche de plain-pied, monte-escalier, élargissement de portes, WC surélevés). Ouverte aux 60+ en perte d'autonomie (GIR 1-6) ou aux personnes en situation de handicap, sous conditions de ressources. Couverture 50-70 % des travaux jusqu'à 22 000 €. Décisive avant un déménagement vers une résidence principale destinée à durer 15-20 ans — préparer le logement pour les années 75-85.",
      },
    ],
  },
  {
    title: "Bail, état des lieux et droits du locataire",
    emoji: "📝",
    terms: [
      {
        term: "Bail (contrat de location)",
        def: "Contrat écrit entre bailleur et locataire, obligatoire pour toute location en résidence principale. Durée minimale : 3 ans (bail vide) ou 1 an (bail meublé, 9 mois pour étudiant). Reconduction tacite à l'identique sauf congé valide. Mentions obligatoires : identité des parties, surface loi Boutin, loyer, charges, dépôt de garantie, DPE, état des risques. Un bail incomplet ou non écrit reste valide mais ouvre des contestations — exiger systématiquement la version signée des deux côtés.",
      },
      {
        term: "État des lieux d'entrée et de sortie",
        def: "Constat écrit et contradictoire de l'état du logement à la remise des clés (entrée) puis à la restitution (sortie). Sert d'unique référence pour évaluer dégradations imputables au locataire. À détailler pièce par pièce, équipement par équipement, idéalement avec photos datées. En cas de désaccord, recourir à un commissaire de justice (huissier) : frais ~150-250 € partagés à 50/50 entre bailleur et locataire. Sans état des lieux, le logement est réputé en bon état à l'entrée — le bailleur ne peut rien retenir au départ.",
      },
      {
        term: "Dépôt de garantie",
        def: "Somme versée à la signature du bail pour couvrir d'éventuels impayés ou dégradations. Plafonné par la loi : 1 mois de loyer hors charges en location vide, 2 mois en meublé. À restituer dans les 1 mois (logement rendu conforme à l'état d'entrée) ou 2 mois (en cas de retenues) après remise des clés. Au-delà, le bailleur doit 10 % du loyer mensuel par mois de retard. À ne pas confondre avec la caution, qui désigne le garant.",
      },
      {
        term: "Caution / Garant",
        def: "Personne (physique ou morale) qui s'engage à payer le loyer si le locataire fait défaut. Caution simple : le bailleur poursuit d'abord le locataire ; caution solidaire (cas courant) : le bailleur peut réclamer directement au garant. Acte de cautionnement obligatoirement manuscrit, daté, signé, avec montant maximal couvert et durée. Visale (Action Logement) remplace gratuitement un garant familial — utile pour primo-locataires, expat retour, jeunes actifs.",
      },
      {
        term: "Préavis de départ (locataire)",
        def: "Délai pendant lequel le locataire doit continuer à payer le loyer après notification de son départ. Bail vide : 3 mois, réduit à 1 mois en zone tendue, mutation pro, perte d'emploi, premier emploi, état de santé, bénéficiaire RSA/AAH, attribution logement social. Bail meublé : 1 mois partout. Notification par lettre recommandée avec AR, remise en main propre contre récépissé, ou acte d'huissier — sinon le préavis n'a pas démarré. Date d'envoi = point de départ.",
      },
      {
        term: "Préavis de congé (bailleur)",
        def: "Le bailleur ne peut donner congé qu'à l'échéance du bail, avec préavis de 6 mois (vide) ou 3 mois (meublé), et uniquement pour vente, reprise (habitation personnelle ou proche désigné) ou motif légitime et sérieux (impayés répétés, troubles de voisinage). Notification par lettre recommandée AR ou acte d'huissier. En cas de vente, le locataire bénéficie d'un droit de préemption au prix proposé. Locataires 65+ aux ressources modestes : congé limité, sauf relogement assuré.",
      },
      {
        term: "Bail mobilité",
        def: "Bail meublé court (1 à 10 mois, non renouvelable, non reconductible) réservé aux salariés en mission, étudiants, alternants, stagiaires, formations pro ou mutations temporaires. Aucun dépôt de garantie possible, mais Visale gratuit obligatoirement accepté. Pas de préavis légal côté locataire (sortie au terme du bail). Utile pour tester une ville avant de s'y installer définitivement — pratique pour expat retour ou candidat à la relocation.",
      },
      {
        term: "Charges et régularisation annuelle",
        def: "Provisions mensuelles versées en plus du loyer pour couvrir les charges récupérables (eau, ascenseur, entretien parties communes, taxe d'enlèvement des ordures ménagères). Régularisation obligatoire chaque année : le bailleur fournit un décompte précis. Si le total réel est inférieur, il rembourse ; supérieur, il facture le complément. Demande de justificatifs possible jusqu'à 6 mois après envoi du décompte. Provisions chroniquement sous-estimées = mauvaise surprise au moment du solde.",
      },
      {
        term: "Trêve hivernale",
        def: "Période du 1ᵉʳ novembre au 31 mars pendant laquelle aucune expulsion locative ne peut être exécutée, même avec décision de justice. Concerne aussi les coupures d'énergie (électricité, gaz, chaleur) à la résidence principale. Ne suspend pas l'obligation de payer le loyer ni les procédures en cours — une expulsion ordonnée avant le 31 octobre s'exécutera dès le 1ᵉʳ avril. Cas exclus : squatteurs, logement insalubre, relogement assuré.",
      },
      {
        term: "Loi Alur (Accès au Logement et un Urbanisme Rénové)",
        def: "Loi de 2014 ayant largement encadré le rapport locatif : bail type obligatoire, plafonnement des frais d'agence, encadrement des loyers en zone tendue, état des lieux normalisé, transparence des charges. Définit aussi la liste limitative des justificatifs qu'un bailleur peut demander (CNI, justificatif de domicile, 3 derniers bulletins de salaire, dernier avis d'imposition, RIB) — toute pièce demandée hors liste est illégale et passible d'amende.",
      },
      {
        term: "Complément de loyer",
        def: "Supplément que peut ajouter un bailleur en zone d'encadrement (Paris, Lille, Lyon-Villeurbanne, Bordeaux, Montpellier, Plaine-Commune, Est-Ensemble) au-dessus du loyer de référence majoré, justifié par des caractéristiques exceptionnelles : terrasse spacieuse, vue dégagée sur monument, équipements premium, prestations haut de gamme. Doit être détaillé dans le bail. Contestable dans les 3 mois suivant la signature devant la commission départementale de conciliation — restitution rétroactive possible.",
      },
      {
        term: "Décence du logement",
        def: "Critères minimaux légaux d'un logement loué à titre de résidence principale : surface minimale 9 m² et 2,20 m sous plafond (ou volume 20 m³), pas de risque pour la santé/sécurité, équipements essentiels (chauffage, eau potable chaude/froide, évacuation eaux usées, sanitaires intérieurs, électricité aux normes, cuisine), performance énergétique minimale (DPE F maxi à partir de 2025, E en 2034, D en 2034 pour les nouvelles locations). Un logement indécent ouvre droit à : travaux à charge du bailleur, baisse de loyer, suspension de l'APL, dommages et intérêts.",
      },
    ],
  },
  {
    title: "Copropriété et charges collectives",
    emoji: "🏢",
    terms: [
      {
        term: "Copropriété",
        def: "Statut juridique d'un immeuble divisé en lots privatifs (appartement, cave, parking) et parties communes (escalier, toit, façade, ascenseur, jardin). Tout propriétaire d'un lot devient automatiquement copropriétaire des parties communes au prorata de ses tantièmes. Régie par la loi de 1965 et son décret d'application, complétée par la loi ELAN (2018) et la loi Climat & Résilience (2021). À distinguer de la monopropriété : un immeuble entier appartenant à un seul propriétaire ne suit pas ce régime.",
      },
      {
        term: "Syndic de copropriété",
        def: "Mandataire chargé d'administrer l'immeuble : exécution des décisions d'AG, tenue des comptes, paiement des fournisseurs, suivi des travaux, gestion du personnel (gardien). Syndic professionnel (cabinet rémunéré, ~150-300 €/lot/an) ou bénévole (un copropriétaire élu, gratuit, fréquent dans les petites copros <10 lots). Mandat de 1 à 3 ans, renouvelable. Changer de syndic suppose une mise en concurrence : la loi ALUR oblige le conseil syndical à présenter plusieurs devis en AG si demandé.",
      },
      {
        term: "Assemblée générale (AG)",
        def: "Réunion annuelle obligatoire de tous les copropriétaires (parfois extraordinaire en cours d'année) où sont votées les décisions de gestion : approbation des comptes, budget prévisionnel, travaux, élection du conseil syndical, renouvellement du syndic. Convocation par lettre recommandée AR 21 jours avant. Trois majorités : simple (art. 24), absolue (art. 25), double (art. 26) selon la nature de la décision. Un copropriétaire absent peut donner pouvoir, dans la limite de 3 mandats par mandataire (10 % des voix maximum).",
      },
      {
        term: "Conseil syndical",
        def: "Groupe de 3 à 9 copropriétaires bénévoles élus en AG pour assister et contrôler le syndic. Vérifie les comptes, examine les devis travaux, prépare l'ordre du jour des AG, sert d'interlocuteur entre copropriétaires et syndic. Pouvoir consultatif uniquement — les décisions appartiennent à l'AG. Obligatoire dans toute copropriété sauf vote contraire à la majorité absolue. Un conseil actif est l'un des meilleurs indicateurs de santé d'une copro avant achat.",
      },
      {
        term: "Règlement de copropriété",
        def: "Acte notarié fondateur de la copropriété fixant les règles d'usage (destination des lots, autorisations de travaux, usage des parties communes, animaux, bruit) et la répartition des charges. Annexé à tout acte de vente — un copropriétaire ne peut s'y opposer après acquisition. À lire impérativement avant achat : certains règlements interdisent l'exercice d'une activité professionnelle, la location meublée touristique, ou imposent une homogénéité de façade qui empêche le double-vitrage extérieur.",
      },
      {
        term: "Tantièmes / millièmes",
        def: "Quote-part de chaque lot dans la copropriété, exprimée en millièmes (ou parfois dix-millièmes) du total. Détermine deux choses : la répartition des charges générales (entretien, syndic, ascenseur si commun à tous) et le poids des voix en AG. Un T3 de 70 m² au 4ᵉ étage peut représenter ~85/1000 ; un studio en RDC sans ascenseur, ~25/1000. Le calcul tient compte de la surface, l'étage, l'exposition et la consistance du lot — il ne se modifie qu'à l'unanimité.",
      },
      {
        term: "Charges courantes vs travaux",
        def: "Deux budgets distincts en copropriété. Charges courantes (budget prévisionnel) : eau, électricité parties communes, ménage, ascenseur, assurance, honoraires syndic, gardien — payées par provisions trimestrielles, régularisées une fois par an. Charges travaux (hors budget) : ravalement, toiture, ascenseur, chaudière collective — votées au cas par cas en AG et appelées séparément. Un acheteur doit demander au syndic l'état des charges sur les 3 dernières années + le carnet d'entretien pour anticiper les appels futurs.",
      },
      {
        term: "Fonds travaux (loi ALUR)",
        def: "Réserve financière obligatoire depuis 2017 dans toute copropriété de plus de 5 ans, alimentée par une cotisation annuelle d'au moins 5 % du budget prévisionnel (relevée à 2,5 % du montant des travaux du PPT depuis 2024). Versement non remboursable au copropriétaire vendeur — le fonds reste attaché au lot. Indispensable pour amortir les gros travaux sans appel de fonds brutal. Un fonds bien doté (>5 000 €/lot) est un excellent signal de santé ; un fonds proche de 0 dans une vieille copro = alerte.",
      },
      {
        term: "Appel de fonds",
        def: "Demande de paiement émise par le syndic aux copropriétaires : provision trimestrielle (charges courantes), avance de trésorerie (avance permanente), ou appel exceptionnel pour travaux votés. Délai de paiement : 30 jours après notification. Impayés : majoration légale 10 %, puis mise en demeure, puis procédure judiciaire. Les impayés de plusieurs copropriétaires fragilisent la copro entière — toujours vérifier le taux d'impayés (consultable auprès du syndic) avant d'acheter.",
      },
      {
        term: "Plan pluriannuel de travaux (PPT)",
        def: "Document obligatoire depuis la loi Climat & Résilience (2021) pour toute copropriété de plus de 15 ans, projetant les travaux à réaliser sur 10 ans (entretien, sauvegarde de l'immeuble, économies d'énergie). Élaboré par un professionnel certifié, voté à la majorité absolue, mis à jour tous les 10 ans. Sert de base au fonds travaux et permet d'anticiper les ravalements, mises aux normes ascenseur, isolation thermique. Doit être consultable avant tout acte de vente — son absence dans une copro >15 ans est un manquement légal.",
      },
      {
        term: "DPE collectif et audit énergétique",
        def: "Évaluation énergétique de l'immeuble entier (et non lot par lot). DPE collectif obligatoire depuis 2024 pour les copros de plus de 50 lots, étendu à toutes les copros >15 lots en 2025 puis toutes les copros en 2026. Audit énergétique réglementaire requis avant tout PPT dans les copropriétés classées D, E, F ou G. Conditionne l'éligibilité à MaPrimeRénov' Copropriétés (jusqu'à 25 % des travaux d'isolation collective). Un classement F ou G en collectif annonce des travaux lourds à voter dans les 5 ans.",
      },
      {
        term: "Pré-état daté",
        def: "Document remis par le syndic avant la signature du compromis de vente d'un lot en copropriété : montant des charges courantes appelées sur l'année, état des sommes dues par le vendeur, fonds travaux versé, procédures en cours. Complété par l'état daté définitif (article 5 du décret de 1967) à la signature notariée. Permet à l'acquéreur de connaître exactement les engagements financiers transmis avec le lot. Document payant (~250-500 € selon syndic) facturé au vendeur. À examiner ligne par ligne avant tout achat.",
      },
    ],
  },
  {
    title: "Diagnostics, compromis et signature de vente",
    emoji: "🔍",
    terms: [
      {
        term: "DDT (Dossier de Diagnostic Technique)",
        def: "Ensemble obligatoire de diagnostics annexé au compromis puis à l'acte authentique de vente. Réunit DPE, amiante, plomb (CREP), termites, état des installations gaz et électricité, ERP, assainissement non collectif, mérule (zones à risque), bruit (zones aéroportuaires) selon la nature du bien et sa localisation. Coût total ~400-800 € pour un appartement, ~600-1 200 € pour une maison. À la charge du vendeur. Absence ou diagnostic erroné : le vendeur engage sa responsabilité et l'acquéreur peut demander réduction du prix voire annulation de la vente.",
      },
      {
        term: "Diagnostic amiante",
        def: "Repérage obligatoire de l'amiante pour tout logement dont le permis de construire est antérieur au 1ᵉʳ juillet 1997. Vérifie matériaux des listes A (flocages, calorifugeages, faux plafonds) et B (toitures, bardages, conduits, dalles vinyle). Durée de validité illimitée si négatif, repérage périodique tous les 3 ans si positif. Présence d'amiante non dégradée n'interdit pas la vente — la dégradation (état 3) impose travaux de désamiantage (10-50 k€). Diagnostic obligatoire aussi pour les travaux ou la démolition.",
      },
      {
        term: "CREP (Constat de Risque d'Exposition au Plomb)",
        def: "Diagnostic plomb obligatoire pour les logements dont le permis de construire est antérieur au 1ᵉʳ janvier 1949. Repère les revêtements (peintures murales, boiseries, plinthes) contenant plus de 1 mg/cm² de plomb. Validité : 1 an si positif, illimitée si négatif, 6 ans en location. Plomb à un niveau dégradé impose travaux de mise en sécurité avant occupation par des enfants ou femmes enceintes (intoxication = saturnisme). Vendeur tenu d'informer l'acquéreur des risques.",
      },
      {
        term: "État termites et mérule",
        def: "Diagnostic termites obligatoire dans les zones délimitées par arrêté préfectoral (large bande Sud-Ouest, Nouvelle-Aquitaine, Occitanie, vallée du Rhône, Île-de-France partielle). Validité : 6 mois. La mérule (champignon lignivore) fait l'objet d'une obligation déclarative dans les zones identifiées, mais pas d'un diagnostic systématique : le vendeur doit informer l'acquéreur s'il connaît une infestation. Infestation active = travaux 5-30 k€ et dévalorisation immédiate du bien.",
      },
      {
        term: "État des installations gaz et électricité",
        def: "Diagnostics obligatoires pour toute installation gaz ou électricité de plus de 15 ans, à l'occasion d'une vente. Vérifient la sécurité (vétusté, mise à la terre, disjoncteur différentiel, tableau, prises) et signalent les anomalies sans imposer leur réparation avant vente. Validité : 3 ans. Une installation très dégradée n'empêche pas la vente mais informe l'acquéreur du coût futur de mise aux normes (3-15 k€ pour une remise à niveau complète).",
      },
      {
        term: "ERP / ERRIAL (État des Risques)",
        def: "État des Risques et Pollutions, document obligatoire informant l'acquéreur ou locataire des risques naturels (inondation, séisme, mouvement de terrain, retrait-gonflement argiles), miniers, technologiques, radon et pollution des sols affectant le bien. Établi à partir du formulaire officiel et des arrêtés préfectoraux, validité 6 mois. Téléchargeable gratuitement sur errial.georisques.gouv.fr. Indispensable pour mesurer le risque d'un bien en zone PPRI, PPRT ou de retrait-gonflement (fissures structurelles).",
      },
      {
        term: "PPRI / PPRT (Plans de Prévention des Risques)",
        def: "Documents réglementaires délimitant les zones exposées aux risques d'inondation (PPRI) ou technologiques (PPRT, autour de sites SEVESO). Trois niveaux : zone rouge (constructions interdites), zone bleue (constructions autorisées avec prescriptions), zone blanche (sans contrainte). Un bien en zone rouge peut être inconstructible et difficilement assurable. À consulter sur Géorisques avant toute promesse d'achat — déterminant pour les villes littorales, fluviales et industrielles.",
      },
      {
        term: "Diagnostic assainissement non collectif",
        def: "Obligatoire pour les maisons non raccordées au tout-à-l'égout, à effectuer par le SPANC (Service Public d'Assainissement Non Collectif) de la commune. Évalue conformité de la fosse septique ou filière équivalente (filtre à sable, microstation). Validité : 3 ans. Installation non conforme : travaux à exécuter dans l'année suivant la vente (3-12 k€). Souvent négocié en moins-value sur le prix de vente — à ne pas négliger en milieu rural ou périurbain.",
      },
      {
        term: "Compromis de vente (promesse synallagmatique)",
        def: "Avant-contrat engageant réciproquement vendeur et acquéreur : le vendeur s'engage à céder, l'acquéreur à acheter, sous conditions suspensives (obtention du prêt, absence de servitude, etc.). Signature avec un acompte de 5-10 % du prix (séquestre chez le notaire ou l'agence). Rétractation possible par l'acquéreur dans les 10 jours (loi SRU) sans motif ni pénalité. Au-delà, défaut d'exécution = perte de l'acompte ou poursuite en exécution forcée. Délai standard jusqu'à la signature notariée : 2 à 3 mois.",
      },
      {
        term: "Promesse unilatérale de vente",
        def: "Avant-contrat où seul le vendeur s'engage à vendre à un prix fixé pendant un délai d'option (souvent 2-3 mois). L'acquéreur paie une indemnité d'immobilisation (5-10 % du prix), perdue s'il renonce hors conditions suspensives. À enregistrer aux impôts dans les 10 jours (~125 €) sous peine de nullité. Plus souple côté acquéreur que le compromis, moins fréquente — surtout utilisée pour les transactions atypiques (immeubles, terrains à bâtir, biens à diviser).",
      },
      {
        term: "Conditions suspensives",
        def: "Événements futurs et incertains qui conditionnent la conclusion définitive de la vente. La plus courante : obtention du prêt immobilier dans un délai (45 à 60 jours) et à des conditions précises (taux maximal, montant minimal, durée). Autres : purge du droit de préemption urbain, absence de servitude grevant le bien, obtention d'un permis de construire. Si la condition n'est pas réalisée, la vente est caduque et l'acompte restitué à l'acquéreur. À rédiger précisément : taux trop bas ou montant exagéré = clause requalifiée en condition potestative (nulle).",
      },
      {
        term: "Délai de rétractation SRU",
        def: "Délai légal de 10 jours calendaires accordé à tout acquéreur non professionnel d'un logement après signature du compromis (ou de la promesse). Court à partir du lendemain de la première présentation de la lettre recommandée notifiant l'acte signé, ou de la remise en main propre. Rétractation par lettre recommandée AR sans motif à fournir, sans pénalité, avec restitution intégrale de l'acompte sous 21 jours. S'applique aussi aux ventes en VEFA. Ne concerne pas le vendeur, qui est engagé dès signature.",
      },
      {
        term: "Mandat de vente (simple, exclusif, semi-exclusif)",
        def: "Contrat par lequel un vendeur confie la commercialisation de son bien à une agence. Mandat simple : plusieurs agences peuvent vendre + le vendeur lui-même (concurrence, délais longs, prix souvent décoté). Mandat exclusif : une seule agence (engagement de moyens renforcé, durée 3 mois irrévocable, prix mieux tenu, 70 % des ventes nettes plus rapides). Mandat semi-exclusif : une agence + le vendeur (compromis). Durée maximale 3 mois renouvelable, dénonciation après le délai irrévocable. Honoraires payés par le vendeur, parfois renégociés en cas de baisse de prix.",
      },
      {
        term: "VEFA (Vente en l'État Futur d'Achèvement)",
        def: "Achat sur plan d'un logement neuf à construire. L'acquéreur devient propriétaire au fur et à mesure des travaux et paie selon un échéancier réglementaire : 35 % à l'achèvement des fondations, 70 % à la mise hors d'eau, 95 % à l'achèvement, 5 % à la livraison (consignables en cas de réserves). Protégée par la garantie financière d'achèvement (GFA) et la garantie de parfait achèvement (1 an), biennale (2 ans), décennale (10 ans). Délai de réserve à signaler à la livraison : 1 mois. À distinguer du contrat de construction de maison individuelle (CCMI).",
      },
    ],
  },
  {
    title: "Rénovation énergétique et aides travaux",
    emoji: "⚡",
    terms: [
      {
        term: "MaPrimeRénov'",
        def: "Aide principale de l'État pour la rénovation énergétique des logements construits depuis plus de 15 ans. Deux parcours depuis 2024 : par geste (chauffage, isolation ponctuelle, ventilation) et parcours accompagné (rénovation d'ampleur, gain d'au moins deux classes DPE, accompagnateur Rénov' agréé obligatoire). Montants modulés selon quatre profils de revenus (Bleu très modestes, Jaune modestes, Violet intermédiaires, Rose supérieurs). Demande en ligne sur maprimerenov.gouv.fr avant tout démarrage de chantier — devis d'entreprise RGE obligatoire. Cumulable avec CEE, éco-PTZ et aides locales.",
      },
      {
        term: "CEE (Certificats d'Économie d'Énergie)",
        def: "Dispositif qui impose aux fournisseurs d'énergie (EDF, TotalEnergies, Engie, enseignes de carburants) de financer des économies d'énergie chez les particuliers, sous peine d'amende. Se traduit par des primes énergie (chèque, virement, remise en caisse) pour l'isolation, le chauffage, la ventilation ou un thermostat programmable. Cumulables avec MaPrimeRénov'. Deux niveaux : Coup de pouce (montants renforcés sur des gestes prioritaires) et CEE classique. Les offres varient d'un obligé à l'autre pour un même geste — comparer trois ou quatre devis avant de s'engager change souvent la prime de plusieurs centaines d'euros.",
      },
      {
        term: "Éco-PTZ (éco-prêt à taux zéro)",
        def: "Prêt sans intérêts jusqu'à 50 000 € pour une rénovation d'ampleur, 30 000 € pour un bouquet de trois travaux, ou 15 000 € pour un geste unique. Remboursable sur 20 ans maximum. Ouvert à tout propriétaire sans condition de ressources, pour une résidence principale de plus de deux ans. Cumulable avec MaPrimeRénov' et les CEE. Distribué par les banques partenaires, sur présentation de devis d'entreprises RGE. Prolongé jusqu'au 31 décembre 2027.",
      },
      {
        term: "RGE (Reconnu Garant de l'Environnement)",
        def: "Label obligatoire pour qu'une entreprise ouvre droit aux aides (MaPrimeRénov', CEE, éco-PTZ). Décliné par métier : Qualibat, Qualifelec, Qualit'EnR, Qualipac, RGE Éco-Artisan. Renouvellement tous les quatre ans, avec audit chantier. Vérifiable gratuitement sur france-renov.gouv.fr — un devis d'entreprise non RGE est disqualifiant, même pour des travaux parfaitement exécutés. Piège fréquent : un artisan qui sous-traite à une entreprise RGE ne suffit pas ; le titulaire du label doit signer le devis et émettre la facture.",
      },
      {
        term: "Audit énergétique réglementaire",
        def: "Étude obligatoire depuis avril 2023 avant la vente d'une maison individuelle ou d'un immeuble en monopropriété classé F ou G, étendue aux E depuis janvier 2025 et aux D à partir de 2034. Réalisée par un professionnel certifié, elle décrit l'état du bien et propose deux scénarios de travaux, dont un permettant d'atteindre au moins la classe B. Coût de 500 à 1 200 € à la charge du vendeur, valable cinq ans. Annexée à la promesse de vente au même titre que le DPE. À ne pas confondre avec l'audit énergétique incitatif du parcours MaPrimeRénov' accompagné, qui conditionne l'accès aux plafonds d'aide les plus élevés.",
      },
      {
        term: "Passoire thermique",
        def: "Logement classé F ou G au DPE — consommation supérieure à 330 kWh/m²/an d'énergie primaire. Interdit à la location neuve depuis 2025 pour les G, en 2028 pour les F et en 2034 pour les E. Loyer déjà non révisable depuis août 2022. En 2026, environ 4,8 millions de résidences principales concernées en France, dont près d'un tiers louées. Décote fréquente à la revente en zone détendue (5 à 15 % vs équivalent D). Sortie du statut : rénovation d'ampleur permettant un gain d'au moins deux classes, souvent 30 000 à 80 000 € de travaux selon la surface et l'état initial.",
      },
      {
        term: "Pompe à chaleur (PAC)",
        def: "Système de chauffage récupérant les calories de l'air (aérothermie), du sol (géothermie) ou de l'eau (aquathermie) pour chauffer un logement, avec un rendement de 3 à 5 kWh restitués par kWh consommé (coefficient de performance ou COP). Trois familles : air/air (climatisation réversible, ~5 000 à 10 000 € posée), air/eau (remplace une chaudière sur radiateurs ou plancher chauffant, 10 000 à 18 000 €), géothermie (18 000 à 30 000 €, très efficace mais chantier lourd avec captage). Aides possibles : MaPrimeRénov' jusqu'à 5 000 €, CEE Coup de pouce 2 500 à 4 000 €, éco-PTZ, TVA à 5,5 %. Rentabilité par rapport à une chaudière gaz : 6 à 10 ans avec les aides.",
      },
      {
        term: "Isolation thermique (ITE vs ITI)",
        def: "Deux techniques d'isolation des murs. Isolation par l'extérieur (ITE) : bardage ou enduit posé sur un isolant fixé au mur extérieur — préserve la surface habitable, supprime les ponts thermiques, mais coûte 130 à 200 €/m² et nécessite une déclaration préalable de travaux (modification d'aspect de façade). Isolation par l'intérieur (ITI) : contre-cloison isolante posée à l'intérieur, 40 à 90 €/m², perd 5 à 10 cm par mur traité, sans démarche administrative. En copropriété, l'ITE est votée collectivement (façade commune) et revient régulièrement à l'ordre du jour des AG. Aides MaPrimeRénov' : 15 à 75 €/m² selon revenus pour l'ITE, 15 à 25 €/m² pour l'ITI.",
      },
      {
        term: "VMC (Ventilation Mécanique Contrôlée)",
        def: "Système d'aération obligatoire dans tout logement neuf depuis l'arrêté du 24 mars 1982. Simple flux : extrait l'air vicié par les pièces humides et fait entrer l'air neuf par des entrées d'air en menuiserie (400 à 1 200 € posé). Double flux : récupère les calories de l'air extrait pour préchauffer l'air neuf entrant, avec un gain de 10 à 15 % sur la facture chauffage (3 000 à 6 000 € posé, éligible MaPrimeRénov' et CEE). Nettoyage obligatoire des bouches et gaines tous les trois à cinq ans — une VMC encrassée dégrade la qualité de l'air intérieur et favorise humidité, condensation et moisissures.",
      },
      {
        term: "RE2020 (Réglementation Environnementale 2020)",
        def: "Norme applicable à toute construction neuve depuis le 1ᵉʳ janvier 2022 pour le logement, et le 1ᵉʳ juillet 2022 pour les bureaux et l'enseignement. Trois exigences : sobriété énergétique renforcée (besoin bioclimatique Bbio abaissé d'environ 30 % par rapport à la RT 2012), réduction de l'empreinte carbone du bâtiment sur son cycle de vie (indicateurs Ic construction et Ic énergie) et confort d'été mesuré en degrés-heures d'inconfort. En pratique, le chauffage au gaz est de fait exclu en maison individuelle neuve (seuil carbone incompatible) — pompe à chaleur, réseau de chaleur ou solaire thermique s'imposent. Successeur de la RT 2012.",
      },
      {
        term: "Coup de pouce chauffage et isolation",
        def: "Renforcement temporaire des CEE sur des gestes prioritaires : remplacement d'une chaudière fioul ou gaz par une pompe à chaleur, une chaudière biomasse ou un raccordement à un réseau de chaleur, ou isolation des combles et planchers bas. Montants majorés (jusqu'à ~5 000 € pour une PAC air/eau chez les ménages modestes, plusieurs milliers d'euros pour l'isolation d'un plancher bas de maison). Cumulable avec MaPrimeRénov'. À manier avec méfiance : les offres à « 1 € » ont largement disparu, mais des variantes de démarchage agressif subsistent — ne jamais signer un devis présenté à domicile ou par téléphone sans le comparer.",
      },
      {
        term: "Chèque énergie",
        def: "Aide annuelle nominative envoyée par l'État aux foyers modestes, sous plafond de revenu fiscal de référence par unité de consommation. Montant compris entre ~48 € et ~277 € selon les revenus et la composition du foyer. Utilisable pour payer une facture d'électricité, de gaz, de fioul ou de bois, ou pour financer des travaux d'économies d'énergie sur facture d'artisan RGE. Validité un an, avec trois mois supplémentaires pour l'utiliser. Depuis 2024, l'attribution automatique aux nouveaux éligibles a été supprimée : demande à faire sur chequeenergie.gouv.fr si le chèque n'arrive pas alors que les revenus sont éligibles.",
      },
    ],
  },
  {
    title: "École, garde d'enfants et scolarité",
    emoji: "🎒",
    terms: [
      {
        term: "Carte scolaire (sectorisation)",
        def: "Découpage administratif qui rattache chaque adresse à un établissement public précis. Trois autorités se partagent le travail : la commune sectorise les écoles maternelles et élémentaires, le conseil départemental les collèges, la région les lycées. Conséquence directe sur un projet d'installation : deux logements de la même rue peuvent dépendre de deux collèges différents, et le secteur ne se déduit ni du quartier ni de la distance à vol d'oiseau. Se vérifie en mairie pour le premier degré, auprès du conseil départemental pour le collège, avant de signer un bail ou un compromis et non après.",
      },
      {
        term: "Dérogation à la carte scolaire",
        def: "Demande d'inscription dans un établissement public hors de son secteur. Les motifs habituellement recevables sont hiérarchisés par l'académie : situation de handicap, prise en charge médicale à proximité de l'établissement, boursier, fratrie déjà scolarisée sur place, rapprochement du domicile du parent qui garde l'enfant, parcours scolaire particulier (section internationale, bilangue, option rare non proposée dans le secteur). Une dérogation ne s'accorde que dans la limite des places restantes une fois les élèves du secteur affectés : un motif recevable ne garantit rien dans un établissement saturé. Dépôt en mairie pour le premier degré, auprès de la DSDEN ou du conseil départemental pour le collège, au printemps précédant la rentrée.",
      },
      {
        term: "Certificat de radiation",
        def: "Document délivré par le directeur de l'école ou le chef d'établissement quitté, attestant que l'élève n'y est plus inscrit. Il conditionne l'inscription dans le nouvel établissement, qui ne peut pas être finalisée sans lui. À demander dès que le déménagement est certain, avec le dossier scolaire (livret scolaire, bulletins, attestations de compétences), plutôt qu'à la fin du mois d'août quand les secrétariats sont fermés. C'est la démarche la plus souvent oubliée dans un déménagement en cours d'année scolaire.",
      },
      {
        term: "Instruction obligatoire de 3 à 16 ans",
        def: "Depuis la rentrée 2019, l'instruction est obligatoire dès l'âge de 3 ans (contre 6 ans auparavant), et s'y ajoute une obligation de formation jusqu'à 18 ans qui peut prendre la forme d'une scolarité, d'un apprentissage, d'un service civique ou d'un parcours d'insertion. L'obligation porte sur l'instruction, pas sur l'école : l'instruction en famille reste possible mais est passée d'un régime de simple déclaration à un régime d'autorisation préalable délivrée par l'académie, sur l'un des quatre motifs prévus (état de santé, pratique sportive ou artistique intensive, itinérance de la famille, situation propre à l'enfant motivant un projet éducatif).",
      },
      {
        term: "REP / REP+ (éducation prioritaire)",
        def: "Classement des établissements dont le public est socialement le plus défavorisé, assorti de moyens renforcés : classes de grande section, CP et CE1 dédoublées en éducation prioritaire (plafonnées à 24 élèves ailleurs), indemnités et formation spécifiques pour les personnels, dispositifs d'accompagnement et de suivi. REP+ correspond au niveau de difficulté le plus marqué. Le label décrit la composition sociale du secteur, pas la qualité des enseignants ni le destin des élèves : il se lit comme un signal de moyens supplémentaires, jamais comme un verdict sur un établissement ou sur les familles qui y scolarisent leurs enfants.",
      },
      {
        term: "IPS (indice de position sociale)",
        def: "Indicateur construit par la DEPP à partir de la profession des parents, qui résume l'origine sociale moyenne des élèves d'un établissement. Publié en données ouvertes établissement par établissement depuis 2022. C'est le meilleur prédicteur connu des résultats moyens au brevet et au bac, ce qui en fait l'outil de lecture indispensable des palmarès : comparer deux lycées sans regarder leur IPS revient à comparer des recrutements, pas des enseignements. Un établissement à IPS bas dont les résultats dépassent ceux attendus fait mieux son travail qu'un établissement à IPS élevé aux résultats bruts supérieurs.",
      },
      {
        term: "Affelnet",
        def: "Application nationale d'affectation, utilisée pour l'entrée en seconde générale, technologique ou professionnelle, et pour l'entrée en sixième dans certaines académies. L'affectation ne résulte pas du seul ordre des vœux : elle est calculée sur un barème de points combinant secteur géographique, résultats scolaires, situation sociale et priorités académiques. À Paris, le barème intègre depuis 2021 l'IPS du collège d'origine, dans un objectif de mixité. Saisie des vœux au printemps, résultats fin juin ; en cas de déménagement tardif, c'est le service d'affectation de la nouvelle académie qu'il faut saisir directement.",
      },
      {
        term: "Parcoursup",
        def: "Plateforme nationale d'accès à la première année d'enseignement supérieur : formulation des vœux de janvier à mars, confirmation début avril, réponses des formations à partir de fin mai, puis phase complémentaire jusqu'en septembre pour les candidats sans proposition. Compte dans un choix de ville : une commune dotée d'un lycée à CPGE ou d'un pôle BTS et IUT permet de poursuivre sur place, une commune qui n'en a pas impose une décohabitation dès 18 ans, avec le double logement que cela suppose.",
      },
      {
        term: "Établissement privé sous contrat / hors contrat",
        def: "Sous contrat, l'établissement applique les programmes nationaux et prépare les diplômes nationaux, ses enseignants sont rémunérés par l'État, et il n'est pas soumis à la carte scolaire : le recrutement est libre, ce qui en fait la porte de sortie classique quand le collège de secteur ne convient pas. En contrepartie, une contribution familiale est demandée, très variable d'un établissement à l'autre. Environ un élève sur six est scolarisé dans le privé en France. Hors contrat, l'établissement choisit ses programmes et ses méthodes, se finance intégralement sur les frais de scolarité, et reste contrôlé par l'État sur le socle commun de connaissances.",
      },
      {
        term: "Périscolaire et extrascolaire",
        def: "Accueils organisés autour du temps de classe : garderie du matin et du soir, pause méridienne, mercredis, et vacances scolaires pour l'extrascolaire. La compétence est communale ou intercommunale, pas celle de l'Éducation nationale : à programme scolaire identique, l'amplitude horaire, le taux d'encadrement et le tarif changent d'une commune à l'autre. Poste de contrainte majeur pour deux parents qui travaillent, et souvent décisif entre deux communes voisines. À vérifier avec le règlement du service, dont dépendent aussi l'inscription à l'année ou à la carte et les délais de réservation.",
      },
      {
        term: "Quotient familial CAF (à ne pas confondre avec le quotient familial fiscal)",
        def: "Indicateur calculé par la CAF à partir des ressources mensuelles du foyer, des prestations perçues et du nombre de parts. Il sert à tarifer les services locaux : cantine, périscolaire, crèche, centre de loisirs, conservatoire, parfois piscine et transports. Chaque commune fixe librement ses tranches et ses tarifs, si bien qu'un même quotient donne un prix de repas différent d'une commune à l'autre. Rien à voir avec le quotient familial fiscal défini plus haut, qui sert au calcul de l'impôt sur le revenu : les deux portent le même nom et ne se calculent pas de la même façon.",
      },
      {
        term: "Modes de garde : crèche, assistante maternelle, MAM",
        def: "La crèche collective attribue ses places en commission, sur des critères communaux publiés (activité des parents, fratrie, domiciliation, situation sociale) ; dans les communes tendues, l'inscription se dépose pendant la grossesse et une place n'est jamais acquise. L'assistante maternelle est agréée par la PMI du département et accueille les enfants à son domicile : les parents deviennent employeurs, avec contrat de travail, salaire, congés payés et déclaration Pajemploi. La MAM (maison d'assistantes maternelles) regroupe deux à quatre assistantes maternelles dans un local commun, avec le même statut d'emploi direct mais des horaires souvent plus larges.",
      },
      {
        term: "CMG (complément de libre choix du mode de garde)",
        def: "Aide de la CAF qui prend en charge une partie du coût d'une assistante maternelle agréée, d'une garde à domicile ou d'une place en micro-crèche, pour un enfant de moins de 6 ans. Son barème a été refondu en septembre 2025 : la prise en charge suit désormais un taux d'effort progressif selon les revenus, pour rapprocher le reste à charge de celui d'une place en crèche collective, et le droit est étendu au-delà des 6 ans de l'enfant pour les familles monoparentales. Le CMG ne s'applique pas à une place en crèche collective, dont le tarif est déjà calculé sur les ressources.",
      },
      {
        term: "PAI, PAP et PPS",
        def: "Trois dispositifs souvent confondus. Le PAI (projet d'accueil individualisé) organise la scolarité d'un enfant atteint d'une pathologie chronique (allergie alimentaire, asthme, diabète, épilepsie) : traitement, régime, protocole d'urgence. Le PAP (plan d'accompagnement personnalisé) aménage la scolarité en cas de trouble des apprentissages durable, sur constat du médecin scolaire, sans passer par la MDPH. Le PPS (projet personnalisé de scolarisation) relève d'une décision de la CDAPH au sein de la MDPH et peut ouvrir droit à un accompagnement humain (AESH), à du matériel adapté ou à une orientation en ULIS. Aucun des trois ne suit automatiquement l'enfant : un changement d'établissement suppose de le transmettre et de le faire réactiver.",
      },
      {
        term: "Transport scolaire",
        def: "Compétence transférée aux régions par la loi NOTRe, qui peuvent la déléguer aux intercommunalités et aux syndicats de transport. Conséquence : ni le tarif ni les règles d'éligibilité ne sont nationaux. Selon la région, le service est gratuit, forfaitaire ou facturé par trimestre, et il est fréquemment réservé aux élèves habitant au-delà d'une distance minimale de leur établissement de secteur. Une dérogation obtenue hors secteur fait souvent perdre le droit au transport pris en charge. À vérifier auprès de l'autorité organisatrice avant d'arbitrer entre deux communes en périurbain, où le budget transport peut peser autant que l'écart de loyer.",
      },
    ],
  },
  {
    title: "Assurance habitation et catastrophes naturelles",
    emoji: "🌊",
    terms: [
      {
        term: "Multirisque habitation (MRH) : qui doit s'assurer",
        def: "Le locataire est tenu de s'assurer contre les risques locatifs et de remettre une attestation chaque année : à défaut, le bailleur peut souscrire un contrat pour son compte et lui en refacturer le coût, ou engager la résiliation du bail. Le copropriétaire, occupant ou bailleur, doit au minimum une responsabilité civile depuis la loi ALUR. Le propriétaire qui occupe sa maison individuelle n'a, lui, aucune obligation légale — mais sa banque l'exigera tant que le prêt court, et un sinistre non assuré reste intégralement à sa charge. Un contrat qui couvre les dommages aux biens embarque obligatoirement la garantie catastrophes naturelles décrite ci-dessous.",
      },
      {
        term: "Garantie catastrophes naturelles (cat-nat)",
        def: "Régime créé par la loi du 13 juillet 1982 : tout contrat couvrant les dommages aux biens comporte d'office cette garantie, aucun assureur ne peut l'exclure et aucune franchise contractuelle ne s'y substitue. Elle indemnise les dommages matériels directs causés par l'intensité anormale d'un agent naturel — inondation, coulée de boue, submersion marine, sécheresse et réhydratation des sols, séisme, mouvement de terrain, avalanche, cyclone. Attention au périmètre : la tempête, la grêle et le poids de la neige n'en relèvent pas, ils dépendent d'une garantie distincte du contrat, généralement acquise mais avec ses propres plafonds et franchises. Vérifier laquelle joue évite de croire à tort qu'un arrêté est nécessaire.",
      },
      {
        term: "Arrêté de catastrophe naturelle",
        def: "La garantie cat-nat ne se déclenche pas parce que le sinistre est spectaculaire : il faut un arrêté interministériel publié au Journal officiel, qui nomme la commune, le phénomène et la période concernée. C'est le maire qui dépose la demande auprès de la préfecture, à partir des déclarations des habitants — d'où l'intérêt de se signaler en mairie même quand on ne sait pas encore si le dossier aboutira. Depuis la réforme de 2021, l'assuré dispose de 30 jours après publication de l'arrêté pour déclarer son sinistre, l'assureur doit verser une provision dans les deux mois et solder l'indemnité dans le mois suivant l'accord, et les frais de relogement d'urgence d'une résidence principale devenue inhabitable sont pris en charge. Un refus de reconnaissance est motivé et peut être contesté.",
      },
      {
        term: "Franchise légale cat-nat",
        def: "Elle est fixée par l'État, pas par le contrat : 380 € pour les biens à usage d'habitation, et 1 520 € lorsque les dommages sont dus à la sécheresse et à la réhydratation des sols. Elle n'est pas rachetable — aucune formule, si complète soit-elle, ne la fait disparaître, et une publicité qui promet le contraire parle d'autre chose. Conséquence pratique sur des fissures de sécheresse : les premiers 1 520 € de reprise restent à votre charge à chaque sinistre reconnu, ce qui rend le petit désordre récurrent bien moins couvert qu'on ne le croit.",
      },
      {
        term: "Surprime cat-nat",
        def: "Le régime est financé par une majoration uniforme ajoutée à la prime de tous les contrats dommages aux biens, quel que soit le niveau d'exposition du logement — c'est le mécanisme de solidarité qui permet d'assurer une maison en zone inondable au même taux qu'un appartement à l'abri. Son taux est fixé par l'État et non par l'assureur : porté au 1ᵉʳ janvier 2025 à 20 % de la prime pour les biens et 9 % pour les véhicules, contre 12 % et 6 % auparavant. Cette hausse explique une part de l'augmentation des cotisations constatée cette année-là, indépendamment de tout changement de garanties. Elle figure sur l'avis d'échéance sous une ligne dédiée.",
      },
      {
        term: "CCR (Caisse centrale de réassurance)",
        def: "Réassureur public qui bénéficie de la garantie de l'État et auprès duquel la plupart des assureurs se réassurent pour la part cat-nat de leur portefeuille. C'est ce qui permet au régime d'absorber un événement majeur sans que l'assureur d'une région sinistrée fasse défaut, et ce qui justifie que le tarif et la franchise soient fixés par la puissance publique plutôt que par le marché. La CCR publie chaque année des projections de coût du régime : c'est la source qui documente la montée en charge de la sécheresse et de l'inondation à l'horizon 2050.",
      },
      {
        term: "RGA (retrait-gonflement des argiles)",
        def: "Les sols argileux se rétractent en période sèche et gonflent en se réhydratant ; ce mouvement différentiel sous les fondations fissure les maisons individuelles, presque jamais les immeubles collectifs correctement fondés. C'est devenu, avec l'inondation, l'un des deux grands postes de coût du régime cat-nat. L'exposition se lit commune par commune sur Géorisques : en aléa moyen ou fort, la loi ÉLAN impose une étude géotechnique préalable à la vente d'un terrain constructible non bâti, puis une étude de conception ou le respect de techniques constructives définies pour la maison qui y sera bâtie. Un régime propre aux désordres de sécheresse s'applique aux sinistres les plus récents : il vise à financer la réparation durable de la cause, pas seulement les reprises esthétiques de la fissure.",
      },
      {
        term: "Fonds Barnier (FPRNM)",
        def: "Fonds de prévention des risques naturels majeurs, alimenté par un prélèvement sur la surprime cat-nat et inscrit au budget de l'État depuis 2021. Il finance deux choses très différentes : l'acquisition amiable ou l'expropriation des biens les plus gravement menacés, indemnisés sans tenir compte de la décote due au risque, et la subvention des travaux de réduction de vulnérabilité — jusqu'à 80 % du coût pour un particulier lorsque les travaux sont prescrits par un plan de prévention des risques approuvé. C'est le seul dispositif qui rend finançable la mise en sécurité d'un logement déjà exposé : à vérifier auprès de la mairie ou de la DDT avant d'écarter un bien pour son coût de mise à niveau.",
      },
      {
        term: "Taxe GEMAPI",
        def: "La gestion des milieux aquatiques et la prévention des inondations est une compétence obligatoire des intercommunalités depuis 2018 : digues, berges, ouvrages de ralentissement. Pour la financer, l'intercommunalité peut lever une taxe facultative plafonnée à 40 € par habitant et par an, répartie sur les taxes foncières et la cotisation foncière des entreprises. Elle n'apparaît pas comme une ligne « inondation » sur l'avis d'imposition mais gonfle la taxe foncière, ce qui explique une partie des écarts entre deux communes voisines. Son existence signale un territoire qui investit dans la protection : à lire comme une information sur le risque local autant que comme un coût.",
      },
      {
        term: "Recul du trait de côte",
        def: "L'érosion littorale est un phénomène lent et prévisible, donc explicitement hors du champ de la garantie cat-nat, qui ne couvre que l'intensité anormale d'un événement : une maison qui perd la falaise sous elle n'est pas indemnisée à ce titre, contrairement à la submersion marine lors d'une tempête. La loi Climat et Résilience de 2021 a créé une liste de communes exposées, fixée par décret et élargie depuis, tenues de cartographier l'horizon 0-30 ans et 30-100 ans dans leur document d'urbanisme et d'en informer acquéreurs et locataires. Dans ces zones, la constructibilité et la valeur de revente sont conditionnées par un horizon daté, et un bail réel d'adaptation à l'érosion côtière permet une occupation à durée limitée. Le vérifier avant tout achat en front de mer.",
      },
      {
        term: "BCT (Bureau central de tarification)",
        def: "Instance à saisir quand un assureur refuse de couvrir un logement jugé trop exposé — zone rouge d'un plan de prévention, sinistres cat-nat répétés, désordres de sécheresse en cours. Le BCT ne cherche pas un assureur à votre place : il fixe la prime à laquelle l'assureur que vous avez désigné est tenu de vous couvrir. La saisine est gratuite et se fait par lettre recommandée avec le refus écrit à l'appui. C'est le recours qui manque le plus souvent au dossier d'un acheteur qui s'entend dire qu'un bien est « inassurable » : l'assurabilité se négocie, elle ne s'obtient pas seulement au guichet.",
      },
      {
        term: "Valeur à neuf et vétusté déduite",
        def: "L'indemnisation de base d'un sinistre se calcule en valeur d'usage : coût de reconstruction ou de remplacement, moins un abattement de vétusté qui peut atteindre plusieurs dizaines de pourcents sur une toiture ou une installation ancienne. La garantie « valeur à neuf » rembourse tout ou partie de cette vétusté, le plus souvent dans une limite exprimée en pourcentage de la valeur du bien et à condition de reconstruire ou de remplacer dans un délai contractuel. C'est la clause qui décide de ce que vous touchez réellement après un dégât des eaux ou un incendie, bien plus que le montant du capital mobilier affiché en tête de contrat.",
      },
    ],
  },
  {
    title: "Santé, médecin traitant et accès aux soins",
    emoji: "🩺",
    terms: [
      {
        term: "Médecin traitant",
        def: "Le médecin que vous désignez comme porte d'entrée de vos soins. La déclaration est conjointe — elle se fait en consultation, par télétransmission depuis la carte Vitale ou sur le formulaire S3704 — gratuite, et modifiable à tout moment sans avoir à vous justifier. Ce n'est pas une obligation légale, mais son absence coûte cher au remboursement (voir ci-dessous). Deux points que personne ne dit à un nouvel arrivant : un médecin n'est pas tenu d'accepter, et il peut refuser au seul motif que sa patientèle est complète ; et pour un enfant de moins de 16 ans, c'est un parent qui déclare, en général le pédiatre ou le généraliste de famille. Changer de région n'annule pas la déclaration précédente : tant que vous n'en faites pas une nouvelle, votre médecin traitant reste celui d'avant, à 500 km.",
      },
      {
        term: "Parcours de soins coordonnés",
        def: "Règle qui veut que le médecin traitant oriente vers le spécialiste. Hors de ce circuit — pas de médecin traitant déclaré, ou spécialiste consulté de sa propre initiative — le taux de remboursement de l'Assurance maladie tombe de 70 % à 30 % du tarif de base, et s'y ajoute une majoration du ticket modérateur qu'un contrat responsable n'a pas le droit de couvrir. L'accès reste direct, sans pénalité, pour le gynécologue, l'ophtalmologiste, le stomatologue, la sage-femme et le psychiatre entre 16 et 25 ans, ainsi qu'en urgence ou loin de chez soi. C'est le premier poste de reste à charge évitable après un déménagement, et il court tant que la nouvelle déclaration n'est pas faite.",
      },
      {
        term: "Ticket modérateur",
        def: "La part du tarif de base laissée à votre charge après le remboursement de l'Assurance maladie : 30 % sur une consultation remboursée à 70 %, davantage sur certains actes. C'est ce que couvre en priorité une complémentaire santé. À ne pas confondre avec le dépassement d'honoraires, qui se situe au-delà du tarif de base, ni avec les franchises ci-dessous, qu'aucune complémentaire n'a le droit de rembourser. Trois lignes différentes sur un même relevé, trois logiques différentes.",
      },
      {
        term: "Participation forfaitaire et franchise médicale",
        def: "Sommes retenues d'office sur vos remboursements, indépendantes du taux de prise en charge. La participation forfaitaire est de 2 € par consultation et par acte de biologie ou de radiologie depuis le 15 mai 2024. La franchise médicale est de 1 € par boîte de médicament, 1 € par acte paramédical et 4 € par transport sanitaire, avec des butoirs journaliers de 4 € et 8 €. Chacun des deux dispositifs est plafonné à 50 € par an et par personne. Aucun contrat responsable ne peut les rembourser — c'est le sens même du mécanisme. Sont exonérés les moins de 18 ans, les femmes enceintes à partir du 6ᵉ mois et les bénéficiaires de la CSS ou de l'AME ; les personnes en ALD, contrairement à une idée très répandue, les paient comme tout le monde. ⚠️ Le 23 juillet 2026, le gouvernement a annoncé le doublement des deux plafonds, à 100 € chacun. Le décret n'était pas publié au Journal officiel à la rédaction de cette fiche et le texte s'applique environ deux mois après sa parution : vérifiez ce qui est en vigueur avant de bâtir un budget dessus.",
      },
      {
        term: "Secteur 1, secteur 2 et OPTAM",
        def: "Un médecin de secteur 1 applique le tarif conventionné : 30 € pour une consultation de généraliste depuis le 22 décembre 2024, contre 26,50 € auparavant. Un médecin de secteur 2 fixe librement ses honoraires. La nuance qui coûte, et qui n'apparaît sur aucune plaque : s'il n'a pas adhéré à l'OPTAM (option de pratique tarifaire maîtrisée, par laquelle il s'engage à contenir ses dépassements), la base même du remboursement retombe à 23 € pour une consultation de généraliste — vous perdez donc sur le tarif de référence en plus de payer le dépassement. Adhérent OPTAM, il rembourse sur la base du secteur 1. Le secteur et l'adhésion figurent dans l'annuaire santé de l'Assurance maladie : à regarder avant de prendre rendez-vous, pas après.",
      },
      {
        term: "ALD (affection de longue durée)",
        def: "Statut ouvert par un protocole de soins rédigé par le médecin traitant et validé par le service médical de la caisse, pour une trentaine d'affections listées et quelques situations hors liste. Il exonère du ticket modérateur, à 100 %, mais uniquement sur les soins en rapport avec l'affection : le reste de la médecine courante est remboursé normalement. Restent dus dans tous les cas les dépassements d'honoraires, le forfait journalier hospitalier, les participations forfaitaires et les franchises. Un déménagement ne remet pas l'exonération en cause — le dossier suit le transfert de caisse — mais le protocole est lié au médecin traitant : le redéclarer fait partie des démarches à ne pas repousser.",
      },
      {
        term: "Complémentaire santé, contrat responsable et 100 % Santé",
        def: "La complémentaire (« mutuelle » dans le langage courant, quel que soit le statut de l'organisme) rembourse principalement le ticket modérateur et une part des dépassements. La quasi-totalité des contrats sont dits responsables, ce qui n'est pas un label commercial mais un cahier des charges fiscal : le contrat doit prendre en charge intégralement les paniers 100 % Santé en optique, en audiologie et en dentaire prothétique — lunettes, appareils auditifs et prothèses sans reste à charge — et il lui est interdit de rembourser les franchises, les participations forfaitaires et la majoration hors parcours de soins. Un salarié du secteur privé bénéficie du contrat collectif de son employeur, financé au moins pour moitié par lui : à intégrer dans la comparaison quand un déménagement s'accompagne d'un changement de statut.",
      },
      {
        term: "CSS (Complémentaire santé solidaire)",
        def: "Remplace depuis 2019 la CMU-C et l'ACS. Sous plafond de ressources elle est gratuite ; au-dessus d'un second plafond elle est payante, avec une participation plafonnée à 1 € par jour et par personne, barème par âge allant de 8 €/mois avant 30 ans à 30 €/mois à partir de 70 ans. Du 1ᵉʳ avril 2026 au 31 mars 2027, le plafond de la version gratuite est de 868 €/mois pour une personne seule et 1 303 € pour un couple ; celui de la version payante, de 1 172 € et 1 759 €. Elle couvre le ticket modérateur, le forfait journalier hospitalier et les paniers 100 % Santé, et les professionnels ne peuvent pas facturer de dépassement à ses bénéficiaires.",
      },
      {
        term: "Carte Vitale et Mon espace santé",
        def: "Deux choses distinctes qu'on confond souvent. La carte Vitale porte vos droits, pas votre dossier médical : elle est nationale, un déménagement ne la remplace pas, et sa mise à jour en pharmacie ou en borne ne sert qu'à y réinscrire des droits qui ont changé. Mon espace santé est le carnet de santé numérique, ouvert automatiquement à chaque assuré sauf refus explicite, qui héberge le dossier médical partagé : comptes rendus, résultats, vaccinations. C'est lui qui rend un changement de médecin traitant moins coûteux en informations perdues, à condition que les documents y aient été déposés — beaucoup de praticiens ne le font pas encore systématiquement, et rien ne vous empêche d'y verser vous-même ce que vous détenez avant de partir.",
      },
      {
        term: "Changer de caisse en déménageant",
        def: "Le changement d'adresse se déclare depuis le compte ameli, rubrique « Mes démarches », ou au 36 46. Si vous changez de département, votre dossier est transféré à la caisse primaire correspondante — droits, historique de remboursements, ALD — et la nouvelle caisse vous écrit une fois l'opération faite ; c'est la seule confirmation fiable que le transfert a abouti. Prévenir une quinzaine de jours avant le déménagement évite les remboursements envoyés à l'ancienne adresse. Ce qui ne se fait pas tout seul, en revanche : redéclarer un médecin traitant, et prévenir votre complémentaire, dont les tarifs sont souvent zonés.",
      },
      {
        term: "APL (accessibilité potentielle localisée)",
        def: "⚠️ Rien à voir avec l'Aide personnalisée au logement, qui porte le même sigle dans ce glossaire : c'est l'indicateur d'accès aux soins construit par la DREES et l'IRDES depuis 2012, calculé commune par commune. Il s'interprète comme le nombre de consultations accessibles par an et par habitant, en tenant compte de l'activité réelle des médecins environnants et d'une demande pondérée par l'âge de la population — donc bien plus fin qu'une densité de médecins au kilomètre carré, qui ignore aussi bien les cabinets saturés que les communes voisines. Le seuil de sous-densité usuel est de 2,5 consultations par an et par habitant chez les généralistes ; en 2024, 6,3 millions de personnes vivaient sous ce seuil, soit environ 9 % de la population. C'est la mesure à demander quand une annonce immobilière parle de « proximité des services ».",
      },
      {
        term: "Désert médical, ZIP et ZAC",
        def: "« Désert médical » est une expression de presse, pas une catégorie administrative — aucune aide, aucun droit n'y est attaché. Ce qui existe juridiquement, c'est le zonage arrêté par chaque agence régionale de santé selon une méthodologie nationale fixée en 2017 en application de la loi de modernisation du système de santé de 2016. Il distingue les zones d'intervention prioritaire (ZIP), les plus dépourvues, qui ouvrent droit aux aides conventionnelles de l'Assurance maladie à l'installation et au maintien, et les zones d'action complémentaire (ZAC), moins touchées, soutenues pour éviter que la situation ne se dégrade. Le zonage se consulte sur le site de l'ARS de la région et se révise périodiquement : regarder le millésime avant de conclure quoi que ce soit d'une carte trouvée en ligne.",
      },
      {
        term: "MSP, centre de santé et CPTS",
        def: "Trois structures qu'on croise partout dans les communes qui recrutent des médecins, et qui ne sont pas interchangeables. La maison de santé pluriprofessionnelle (MSP) réunit des professionnels libéraux, payés à l'acte, autour d'un projet de santé commun : 2 644 recensées en 2024, pour un objectif national de 4 000 en 2027. Le centre de santé emploie des soignants salariés — par une commune, une mutuelle, une association — pratique le tiers payant et les tarifs de secteur 1. La communauté professionnelle territoriale de santé (CPTS) n'est pas un lieu mais une coordination à l'échelle d'un bassin de vie, qui peut fédérer plusieurs MSP, des cabinets isolés et des centres. En pratique, quand vous cherchez un médecin traitant dans une zone tendue, ce sont souvent la MSP et le centre de santé qui prennent encore de nouveaux patients.",
      },
      {
        term: "Forfait journalier hospitalier et forfait patient urgences",
        def: "Le forfait journalier est la participation aux frais d'hébergement à l'hôpital, due par jour de séjour y compris le jour de sortie, quel que soit votre taux de remboursement et même en ALD : 23 € par jour depuis le 1ᵉʳ mars 2026, 17 € en service psychiatrique, contre 20 € et 15 € auparavant. Le forfait patient urgences (FPU) est dû pour un passage aux urgences non suivi d'une hospitalisation : 23 € depuis la même date, contre 19,61 €, avec un montant minoré pour les personnes en ALD ou en accident du travail. Ces deux forfaits-là, à la différence des franchises, sont couverts par la quasi-totalité des complémentaires — vérifiable en une ligne sur le tableau de garanties.",
      },
      {
        term: "SAS (service d'accès aux soins) et 116 117",
        def: "Cabinet fermé, aucun rendez-vous avant trois semaines : le réflexe des urgences est souvent le mauvais. Le 116 117, numéro de la permanence des soins ambulatoires, et le 15 mènent tous deux à une régulation médicale qui trie l'urgence vitale et le soin non programmé, et qui peut orienter vers un praticien de garde ou un créneau libéré, avec pour objectif affiché une prise en charge sous 48 heures. Le décret qui en fixe l'organisation date de juin 2024, mais le déploiement est inégal d'un département à l'autre et l'offre de garde varie selon les territoires. C'est une chose à vérifier à l'arrivée dans une nouvelle commune — pas le soir où l'on en a besoin.",
      },
    ],
  },
  {
    title: "Transports, voiture et stationnement",
    emoji: "🚉",
    terms: [
      {
        term: "AOM (autorité organisatrice de la mobilité)",
        def: "La collectivité qui décide du réseau : tracés, fréquences, tarifs, et s'il y aura un tramway ou seulement des bus. C'est presque toujours l'intercommunalité, pas la commune — d'où le fait qu'un réseau s'arrête à la limite de l'agglomération et non à celle de la ville. La loi d'orientation des mobilités (LOM) laissait aux communautés de communes jusqu'au 31 décembre 2020 pour prendre la compétence ; à défaut, la région est devenue AOM à leur place le 1ᵉʳ juillet 2021, l'objectif étant qu'aucun territoire ne reste sans autorité responsable. Avant de signer un bail en périphérie, la question utile n'est donc pas « y a-t-il un bus » mais « quelle AOM couvre cette commune » : c'est elle qui répond de la desserte, et elle seule qui peut la faire évoluer.",
      },
      {
        term: "Versement mobilité",
        def: "Contribution due par les employeurs d'au moins 11 salariés implantés sur le territoire d'une AOM qui l'a instituée. Collectée par l'Urssaf puis reversée à l'autorité, elle finance l'essentiel de l'exploitation des réseaux urbains ; le taux est fixé librement par l'AOM dans la limite d'un plafond légal qui dépend du type de territoire (le plus élevé, en Île-de-France, dépasse 3 % de la masse salariale), et il est révisé deux fois par an, au 1ᵉʳ janvier et au 1ᵉʳ juillet. C'est la mécanique qui explique une bonne part de la carte des transports français : un réseau se paie d'abord avec les salaires versés sur place. À population égale, une ville qui concentre des emplois peut financer un tramway là où une ville résidentielle tient difficilement un réseau de bus — la qualité de desserte suit l'emploi avant de suivre le nombre d'habitants.",
      },
      {
        term: "Prise en charge à 50 % de l'abonnement de transport",
        def: "Une obligation de l'employeur, pas un avantage à négocier : l'article L3261-2 du code du travail lui impose de rembourser au moins la moitié du coût de l'abonnement de transport en commun ou de vélo en libre-service utilisé pour le trajet domicile-travail, sur présentation du titre. Elle vaut pour tout le monde — CDI, CDD, apprentis, intérimaires, temps partiel. L'employeur peut aller au-delà : la part facultative reste exonérée de cotisations sociales et d'impôt jusqu'à 75 % du prix de l'abonnement, régime prolongé jusqu'au 31 décembre 2026. À intégrer dans la comparaison de deux villes : un abonnement urbain affiché 600 €/an coûte au maximum 300 € au salarié.",
      },
      {
        term: "Forfait mobilités durables (FMD)",
        def: "Somme que l'employeur peut verser — facultative, à la différence des 50 % ci-dessus — au salarié qui vient travailler à vélo, en covoiturage, en trottinette électrique ou en autopartage peu émetteur. Exonérée de cotisations et d'impôt jusqu'à 600 €/an dans le secteur privé et 300 €/an dans la fonction publique d'État ; cumulable avec la prise en charge de l'abonnement de transport dans une limite globale de 900 €/an. Beaucoup d'accords d'entreprise l'ont ouvert sans que personne ne le demande : le réclamer suppose d'abord de savoir qu'il existe.",
      },
      {
        term: "Vignette Crit'Air (certificat qualité de l'air)",
        def: "Pastille qui classe un véhicule d'après sa motorisation et sa norme Euro, obligatoire pour circuler dans une ZFE (définie plus haut, section urbanisme) et lors des épisodes de pollution. Le classement dépend de la date de première immatriculation et de la motorisation, pas de l'état apparent du véhicule, et la vignette se commande sur le site officiel de l'État. Les dérogations existent mais sont locales et datées : la métropole de Lyon a par exemple ouvert aux véhicules Crit'Air 3 une dérogation pour les personnes travaillant entre 21 h et 6 h plus de 52 jours par an, valable du 1ᵉʳ janvier 2025 au 31 décembre 2026. Avant d'acheter un diesel ancien ou de déménager dans une métropole, le calendrier à lire est celui de cette métropole, pas la règle nationale.",
      },
      {
        term: "FPS (forfait post-stationnement)",
        def: "Depuis le 1ᵉʳ janvier 2018, ne pas payer son stationnement en voirie n'est plus une amende pénale mais un forfait dont chaque commune fixe le montant, rue par rue si elle le souhaite : l'ancien tarif national de 17 € a disparu, et deux villes voisines peuvent afficher des barèmes sans rapport l'un avec l'autre. La contestation passe obligatoirement par un RAPO (recours administratif préalable obligatoire) déposé dans le mois suivant la notification, puis, en cas de rejet ou de silence d'un mois, par la Commission du contentieux du stationnement payant, juridiction spécialisée qui siège à Limoges. Le piège est là : le RAPO n'interrompt pas le délai de paiement de trois mois, et le forfait impayé est majoré de 50 € au-delà.",
      },
      {
        term: "Gratuité des transports et tarification solidaire",
        def: "Une quarantaine de réseaux français sont aujourd'hui entièrement gratuits, presque tous portés par des agglomérations moyennes : le Niortais en 2017, Dunkerque en 2018, Grand Calais en 2020. Montpellier a franchi le pas le 21 décembre 2023 pour les habitants des 31 communes de la métropole, ce qui en fait la plus grande métropole européenne à l'avoir fait. Deux précisions avant d'en faire un critère de choix : la gratuité est réservée aux résidents et suppose de demander un pass, elle ne couvre donc ni les visiteurs ni les salariés qui habitent hors du périmètre ; et elle est financée par le versement mobilité, pas par la billetterie. Gratuit ne veut pas dire bon : la question qui décide d'un quotidien reste la fréquence.",
      },
      {
        term: "Carte grise : changement d'adresse",
        def: "Un déménagement oblige à déclarer sa nouvelle adresse sur le certificat d'immatriculation dans le mois qui suit l'installation, en ligne sur l'ANTS ; au-delà, c'est 135 € en cas de contrôle. Pour un véhicule déjà immatriculé au format SIV, les trois premiers changements d'adresse sont gratuits : l'ANTS envoie une étiquette autocollante à apposer sur la carte grise existante. Au quatrième, un titre neuf est édité et facturé au tarif de la redevance d'acheminement, 2,76 € en 2026. La démarche se fait seul sur le site officiel — les intermédiaires payants n'accélèrent rien.",
      },
      {
        term: "CMI stationnement (carte mobilité inclusion)",
        def: "Donne le droit de stationner gratuitement et sans limitation de durée sur toutes les places ouvertes au public, y compris celles qui ne sont pas réservées aux personnes handicapées. Une commune peut plafonner cette durée, mais jamais en dessous de douze heures. Les places réservées, matérialisées par arrêté du maire, sont destinées aux seuls titulaires de cette carte ou de la carte européenne de stationnement. À regarder avant un déménagement concernant une personne à mobilité réduite : le droit est national et identique partout, mais la densité de places réservées est une décision communale, donc très variable d'une ville à l'autre.",
      },
      {
        term: "Barème kilométrique",
        def: "Barème publié par l'administration fiscale, croisant la puissance fiscale du véhicule et les kilomètres parcourus, qui sert à déduire ses trajets domicile-travail en frais réels plutôt que par l'abattement forfaitaire de 10 %. Il n'a pas été revalorisé en 2026, pour la quatrième année consécutive — la dernière hausse remonte à 2023 — alors que le prix d'achat et l'entretien d'un véhicule, eux, ont bougé. Les véhicules électriques bénéficient d'une majoration de 20 % du barème. C'est l'outil qui rend chiffrable l'arbitrage central d'un déménagement en périphérie : un loyer plus bas contre trente kilomètres de plus, deux fois par jour.",
      },
      {
        term: "Stationnement vélo sécurisé en gare",
        def: "Le décret n° 2021-741 du 8 juin 2021, pris pour l'application de la LOM, impose des stationnements vélo sécurisés à 1 133 gares — celles dont la fréquentation dépasse 100 000 voyageurs par an, soit environ 37 % des gares françaises — avec un nombre minimal de places calculé sur la fréquentation quotidienne entrante (4 %, 2 % en Île-de-France) et une échéance fixée au 1ᵉʳ janvier 2024. L'échéance n'a pas été tenue : 46 % des gares concernées atteignaient l'objectif à la date limite, 54 % six mois plus tard. Pour qui envisage un quotidien vélo + train, l'équipement de sa gare se vérifie donc sur place et ne se déduit pas du texte.",
      },
      {
        term: "Aides à l'achat d'un vélo",
        def: "Le bonus vélo national et la prime à la conversion ont pris fin le 14 février 2025 : il n'existe plus d'aide de l'État à l'achat d'un vélo, électrique ou non. Ce qui subsiste est local — région, département, métropole, parfois commune — donc très inégal d'un territoire à l'autre, avec des montants, des plafonds de ressources et des conditions de résidence qui changent d'une année sur l'autre. C'est un critère rarement regardé au moment de choisir une ville alors qu'il peut valoir plusieurs centaines d'euros, et il se vérifie auprès de la collectivité, pas auprès du vendeur.",
      },
      {
        term: "TER : c'est la région qui fixe les prix",
        def: "La région est l'autorité organisatrice du transport express régional : elle décide de l'offre, et depuis la réforme ferroviaire de 2014 elle fixe librement les tarifs des lignes qu'elle organise, avec ses propres abonnements et cartes de réduction. Conséquence pratique pour un navetteur : deux trajets de longueur comparable peuvent coûter des sommes très différentes de part et d'autre d'une limite régionale, et un déménagement qui traverse cette limite change la grille tarifaire et pas seulement la distance. Le prix réel se lit sur le site TER de la région d'arrivée, jamais sur une moyenne nationale.",
      },
    ],
  },
];

const TERM_COUNT = SECTIONS.reduce((n, s) => n + s.terms.length, 0);

export default function GlossairePage() {
  const definedTermsJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Glossaire immobilier et relocation",
    description:
      "Termes clés pour acheter, louer, investir, assurer, déménager, scolariser ses enfants, se faire soigner ou se déplacer en France : DPE, LMNP, ZFE, taxe foncière, fibre FTTH, encadrement des loyers, carte scolaire, IPS, garantie cat-nat, médecin traitant, ALD, zonage ZIP, Crit'Air, forfait mobilités durables, FPS et plus.",
    hasDefinedTerm: SECTIONS.flatMap((s) =>
      s.terms.map((t) => ({
        "@type": "DefinedTerm",
        name: t.term,
        description: t.def,
        inDefinedTermSet: "MaVilleIdéale Glossaire",
      }))
    ),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermsJsonLd) }}
      />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Outils", href: "/outils" },
              { label: "Glossaire" },
            ]}
          />
          <Badge variant="accent" className="mb-3">Glossaire</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Glossaire immobilier & relocation
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            {TERM_COUNT} termes clés pour comprendre l&apos;immobilier, la location, l&apos;investissement
            locatif, l&apos;assurance du logement, le déménagement, la scolarisation des enfants et
            l&apos;accès aux soins en France en 2026. Pas de jargon inutile, juste les définitions
            qu&apos;il faut connaître avant de signer.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        {/* TOC */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
            Sections
          </p>
          <ol className="space-y-2">
            {SECTIONS.map((s, i) => (
              <li key={i}>
                <a
                  href={`#section-${i}`}
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-2"
                >
                  <span className="text-xl">{s.emoji}</span>
                  {s.title} <span className="text-[var(--text-tertiary)]">({s.terms.length})</span>
                </a>
              </li>
            ))}
          </ol>
        </div>

        {SECTIONS.map((section, i) => (
          <section key={i} id={`section-${i}`} className="mb-12 scroll-mt-20">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl">{section.emoji}</span>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">{section.title}</h2>
            </div>
            <dl className="space-y-5">
              {section.terms.map((t, j) => (
                <div key={j} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                  <dt className="font-semibold text-[var(--text-primary)] mb-2">{t.term}</dt>
                  <dd className="text-sm text-[var(--text-secondary)] leading-relaxed">{t.def}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>

      <StaticPageCrossLink exclude="/glossaire" />
      <Footer />
    </main>
  );
}
