import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { StaticPageCrossLink } from "@/components/StaticPageCrossLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_COUNT, GUIDES_COUNT, GLOSSARY_TERMS_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Outils — Quiz, simulateur, glossaire, calendrier | MeilleurVille",
  description:
    "Tous les outils MeilleurVille pour choisir, comparer, simuler. Quiz IA, simulateur de pouvoir d'achat, glossaire immobilier, calendrier de saisonnalité, comparateur de villes.",
  alternates: { canonical: "/outils" },
};

type Tool = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  cta: string;
};

const TOOLS: Tool[] = [
  {
    href: "/quiz",
    emoji: "✨",
    title: "Quiz IA",
    desc:
      `Répondez à 7 questions sur vos priorités (climat, budget, écoles, mobilité) — on classe les ${CITIES_COUNT} villes selon votre profil personnel.`,
    cta: "Faire le quiz",
  },
  {
    href: "/#simulateur",
    emoji: "💸",
    title: "Simulateur de pouvoir d'achat",
    desc:
      "Comparez ce qui resterait sur votre compte à Paris vs province : loyer + salaire en entrée, écart mensuel en sortie, ville par ville.",
    cta: "Lancer le simulateur",
  },
  {
    href: "/comparer",
    emoji: "⚖️",
    title: "Comparateur de villes",
    desc:
      "Mettez deux villes côte à côte sur 8 critères (qualité de vie, transport, coût, sécurité, climat, écoles...). Décision en 30 secondes.",
    cta: "Comparer deux villes",
  },
  {
    href: "/carte",
    emoji: "🗺️",
    title: "Carte interactive",
    desc:
      "Toutes les villes françaises sur une carte heatmap, filtres par critère (nature, transport, coût...). Zoom + clic pour voir le profil détaillé.",
    cta: "Ouvrir la carte",
  },
  {
    href: "/leaderboard",
    emoji: "🏆",
    title: "Top 100 villes France",
    desc:
      `Le classement global des ${CITIES_COUNT} villes, triable et filtrable par région, taille, score thématique. La référence rapide.`,
    cta: "Voir le classement",
  },
  {
    href: "/red-flags",
    emoji: "🚩",
    title: "Red Flag Radar",
    desc:
      "Avant d'acheter ou de déménager : les drapeaux rouges qu'on ne vous dit pas (sécurité ressentie, dérèglement climat, marché tendu, services en déclin).",
    cta: "Consulter les red flags",
  },
  {
    href: "/glossaire",
    emoji: "📑",
    title: "Glossaire immobilier",
    desc:
      `${GLOSSARY_TERMS_COUNT} termes clés (DPE, LMNP, ZFE, taxe foncière, fibre FTTH, encadrement loyers, Pinel...) expliqués clairement. À consulter avant tout achat.`,
    cta: "Ouvrir le glossaire",
  },
  {
    href: "/calendrier-immobilier",
    emoji: "📅",
    title: "Calendrier 2026",
    desc:
      "Quand acheter, vendre, louer ou déménager ? Saisonnalité du marché immobilier mois par mois, avec conseils tactiques par action.",
    cta: "Voir le calendrier",
  },
  {
    href: "/feed.xml",
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
    name: "Outils MeilleurVille",
    description: "Liste des outils interactifs et de référence MeilleurVille",
    numberOfItems: TOOLS.length,
    itemListElement: TOOLS.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.title,
      description: t.desc,
      url: `https://meilleurville.fr${t.href}`,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Outils" },
            ]}
          />
          <Badge variant="accent" className="mb-3">Outils</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            {TOOLS.length} outils pour choisir où vivre
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Quiz, simulateurs, comparateur, glossaire, calendrier. Tout ce qu&apos;il faut pour
            décider, sans bullshit et avec les données vraies.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-2 gap-4">
          {TOOLS.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 hover:border-[var(--accent)] transition-colors flex flex-col"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{t.emoji}</span>
                <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {t.title}
                </h2>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1 mb-4">
                {t.desc}
              </p>
              <span className="text-sm font-semibold text-[var(--accent)] group-hover:underline">
                {t.cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>

      <StaticPageCrossLink exclude="/outils" />
      <Footer />
    </main>
  );
}
