import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ToolsHub, type HubGroup } from "@/components/ToolsHub";
import { StaticPageCrossLink } from "@/components/StaticPageCrossLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_COUNT, GUIDES_COUNT, GLOSSARY_TERMS_COUNT } from "@/lib/site-stats";
import { pathAlternates } from "@/lib/i18n";
import { clampMeta } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Outils · Quiz, simulateur, glossaire, calendrier",
  description:
    clampMeta("Tous les outils MaVilleIdéale pour choisir, comparer, simuler : quiz, simulateur de pouvoir d'achat, glossaire immobilier, comparateur de villes."),
  alternates: pathAlternates("/outils", "/tools"),
};

type GroupId = "trouver" | "budget" | "comparer" | "reference";

const GROUPS: (HubGroup & { id: GroupId })[] = [
  { id: "trouver", emoji: "🎯", title: "Trouver ma ville", lead: "Quiz, copilote et projections : vos priorités en entrée, une short-list de villes en sortie." },
  { id: "budget", emoji: "💶", title: "Budget et simulateurs", lead: "Loyer, salaire, reste à vivre : ce que la ville vous laisse vraiment chaque mois." },
  { id: "comparer", emoji: "🧭", title: "Comparer et explorer", lead: "Cartes, classements, comparateur et drapeaux rouges pour départager les finalistes." },
  { id: "reference", emoji: "📚", title: "Références", lead: "Le vocabulaire, le calendrier du marché et le flux des guides, à garder sous la main." },
];

type Tool = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  cta: string;
  group: GroupId;
};

const TOOLS: Tool[] = [
  {
    href: "/copilot",
    group: "trouver",
    emoji: "🤖",
    title: "Copilote Déménagement IA",
    desc:
      `Posez vos questions en langage naturel : budget, profil, priorités. L'IA connaît les ${CITIES_COUNT} villes, leurs loyers, scores et fiscalité — et vous répond en quelques secondes.`,
    cta: "Parler au copilote",
  },
  {
    href: "/projection-5ans",
    group: "trouver",
    emoji: "🔭",
    title: "Projection 5 ans",
    desc: "Votre situation dans 5 ans : famille, carrière, budget. Quelles villes correspondent à ce que vous serez (pas ce que vous êtes), avec le risque climatique 2040 intégré.",
    cta: "Projeter ma vie",
  },
  {
    href: "/city-match",
    group: "trouver",
    emoji: "🌸",
    title: "City Match",
    desc:
      `8 questions, 90 secondes. Top 3 ville mis à jour à chaque réponse + un match surprise, et un lien partageable pour montrer le résultat à vos proches. Aucun email demandé.`,
    cta: "Lancer City Match",
  },
  {
    href: "/future-you",
    group: "trouver",
    emoji: "✨",
    title: "Future You — la vie en chiffres",
    desc:
      "Salaire, foyer, mode de vie, priorités : reste à vivre, heures libres par semaine, niveau de stress et match climat dans les 3 villes qui vous conviennent le mieux.",
    cta: "Simuler ma vie",
  },
  {
    href: "/people-like-you",
    group: "trouver",
    emoji: "👥",
    title: "People like you",
    desc:
      "11 profils types × 50 grandes villes : où des gens comme vous (famille, freelance, retraité·e…) gagneraient à s'installer en quittant leur ville actuelle.",
    cta: "Voir les destinations",
  },
  {
    href: "/vibe",
    group: "trouver",
    emoji: "✨",
    title: "Ambiance par ville",
    desc: "Estimations éditoriales : quelle énergie se dégage de chaque ville ? Calme, animé, festif, ressourcant. Dérivé des scores officiels, pas de données en temps réel.",
    cta: "Explorer les vibes",
  },
  {
    href: "/climat-2040-timelapse",
    group: "comparer",
    emoji: "🌡️",
    title: "Climat 2040 — timelapse",
    desc:
      "Glissez le curseur de 2026 à 2040 : la France passe du bleu au rouge à mesure que le climat se réchauffe. Métriques : température juillet, jours > 30 °C, nuits tropicales.",
    cta: "Lancer le timelapse",
  },
  {
    href: "/city-match",
    group: "trouver",
    emoji: "🧠",
    title: "Quiz IA classique",
    desc:
      `Répondez à 7 questions sur vos priorités (climat, budget, écoles, mobilité) — on classe les ${CITIES_COUNT} villes selon votre profil personnel.`,
    cta: "Faire le quiz",
  },
  {
    href: "/#simulateur",
    group: "budget",
    emoji: "💸",
    title: "Simulateur de pouvoir d'achat",
    desc:
      "Comparez ce qui resterait sur votre compte à Paris vs province : loyer + salaire en entrée, écart mensuel en sortie, ville par ville.",
    cta: "Lancer le simulateur",
  },
  {
    href: "/vivre-avec",
    group: "budget",
    emoji: "💶",
    title: "Vivre avec X €/mois",
    desc:
      "Vous connaissez votre salaire net, pas votre ville. Six niveaux de revenu, de 1 500 à 5 000 € : les villes où le reste à vivre tient une fois loyer, chauffage, mobilité et taxes payés, avec le comparatif Paris.",
    cta: "Choisir mon niveau de salaire",
  },
  {
    href: "/comparer",
    group: "comparer",
    emoji: "⚖️",
    title: "Comparateur de villes",
    desc:
      "Mettez deux villes côte à côte sur 8 critères (qualité de vie, transport, coût, sécurité, climat, écoles...). Décision en 30 secondes.",
    cta: "Comparer deux villes",
  },
  {
    href: "/carte",
    group: "comparer",
    emoji: "🗺️",
    title: "Carte interactive",
    desc:
      "Toutes les villes françaises sur une carte heatmap, filtres par critère (nature, transport, coût...). Zoom + clic pour voir le profil détaillé.",
    cta: "Ouvrir la carte",
  },
  {
    href: "/leaderboard",
    group: "comparer",
    emoji: "🏆",
    title: "Top 100 villes France",
    desc:
      `Le classement global des ${CITIES_COUNT} villes, triable et filtrable par région, taille, score thématique. La référence rapide.`,
    cta: "Voir le classement",
  },
  {
    href: "/parent-solo",
    group: "budget",
    emoji: "🧑‍🍼",
    title: "Parent solo — villes qui tiennent",
    desc:
      "Un revenu, un conducteur. Top 30 villes ≥ 20 000 hab. classées sur 4 axes re-pondérés (coût, transports, écoles, sécurité) avec loyer T3 moyen et revenu net minimum estimé par ville.",
    cta: "Voir le classement",
  },
  {
    href: "/red-flags",
    group: "comparer",
    emoji: "🚩",
    title: "Red Flag Radar",
    desc:
      "Avant d'acheter ou de déménager : les drapeaux rouges qu'on ne vous dit pas (sécurité ressentie, dérèglement climat, marché tendu, services en déclin).",
    cta: "Consulter les red flags",
  },
  {
    href: "/glossaire",
    group: "reference",
    emoji: "📑",
    title: "Glossaire immobilier",
    desc:
      `${GLOSSARY_TERMS_COUNT} termes clés (DPE, LMNP, ZFE, taxe foncière, fibre FTTH, encadrement loyers, Pinel...) expliqués clairement. À consulter avant tout achat.`,
    cta: "Ouvrir le glossaire",
  },
  {
    href: "/calendrier-immobilier",
    group: "reference",
    emoji: "📅",
    title: "Calendrier 2026",
    desc:
      "Quand acheter, vendre, louer ou déménager ? Saisonnalité du marché immobilier mois par mois, avec conseils tactiques par action.",
    cta: "Voir le calendrier",
  },
  {
    href: "/expat-retour/quiz",
    group: "trouver",
    emoji: "✈️",
    title: "Quiz retour d'expatriation",
    desc:
      "Vous rentrez de Suisse, du Luxembourg, du Royaume-Uni, du Canada, des Émirats ? Le quiz pondère le matching selon le pays quitté et le contexte du retour, puis renvoie vers la fiche pays correspondante.",
    cta: "Faire le quiz expat",
  },
  {
    href: "/depuis",
    group: "comparer",
    emoji: "🚄",
    title: "Destinations depuis votre ville",
    desc:
      "Choisissez votre ville de départ : toutes les destinations françaises classées par temps de trajet (TGV, Intercités ou voiture). Idéal pour planifier un week-end.",
    cta: "Choisir ma ville",
  },
  {
    href: "/feed.xml",
    group: "reference",
    emoji: "📡",
    title: "Flux RSS des guides",
    desc:
      `Suivez les ${GUIDES_COUNT} guides en RSS dans votre lecteur (Feedly, Inoreader, NetNewsWire). Mis à jour à chaque publication.`,
    cta: "S'abonner au flux",
  },
];

export default function OutilsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Outils MaVilleIdéale",
    description: "Liste des outils interactifs et de référence MaVilleIdéale",
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      description: t.desc,
      url: `https://www.mavilleideale.fr${t.href}`,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ToolsHub
        tools={TOOLS}
        groups={GROUPS}
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Outils" },
            ]}
          />
        }
        eyebrow="Outils"
        titleLead={`${TOOLS.length} outils pour`}
        titleAccent="choisir où vivre"
        intro="Quiz, simulateurs, comparateur, glossaire, calendrier. Tout ce qu'il faut pour décider, sans bullshit et avec les données vraies."
        countLabel={(n) => `${n} outil${n > 1 ? "s" : ""}`}
        jumpLabel="Familles d'outils"
      />

      <StaticPageCrossLink exclude="/outils" />
      <Footer />
    </main>
  );
}
