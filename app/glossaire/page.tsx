import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { StaticPageCrossLink } from "@/components/StaticPageCrossLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Glossaire immobilier & relocation · MaVilleIdeal",
  description:
    "Glossaire complet : DPE, LMNP, TAEG, taxe foncière, ZFE, HCSF, assurance emprunteur, fibre FTTH... Tous les termes utiles pour acheter, emprunter ou déménager en France.",
  alternates: { canonical: "/glossaire" },
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
        def: "Périmètre urbain interdisant progressivement les véhicules les plus polluants. Obligatoire pour agglomérations >150 000 hab. depuis 2024 (Lyon, Marseille, Toulouse, Bordeaux, Nantes, Strasbourg, Montpellier, Nice, etc.). Calendrier d'exclusion : Crit'Air 5 → 4 → 3 → 2 selon villes. À vérifier avant achat voiture diesel ancienne ou avant déménagement.",
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
];

const TERM_COUNT = SECTIONS.reduce((n, s) => n + s.terms.length, 0);

export default function GlossairePage() {
  const definedTermsJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Glossaire immobilier et relocation · MaVilleIdeal",
    description:
      "Termes clés pour acheter, louer, investir ou déménager en France : DPE, LMNP, ZFE, taxe foncière, fibre FTTH, encadrement loyers et plus.",
    hasDefinedTerm: SECTIONS.flatMap((s) =>
      s.terms.map((t) => ({
        "@type": "DefinedTerm",
        name: t.term,
        description: t.def,
        inDefinedTermSet: "MaVilleIdeal Glossaire",
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
            locatif et le déménagement en France en 2026. Pas de jargon inutile, juste les
            définitions qu&apos;il faut connaître avant de signer.
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
