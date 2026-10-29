import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { computeOwnerScores } from "@/lib/owner-scores";
import { climateZoneFor, transitPassFor } from "@/lib/cost-living";
import { borderCommute, metroAccess, metroAccessCommute, HUB_LABEL } from "@/lib/profile-pages";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternates } from "@/lib/i18n";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  return {
    title: `Télétravailler à ${city.name} 2026 · Fibre, coworking, coût réel`,
    description: `${city.name} pour le télétravail : couverture fibre département, score qualité de vie, coût télétravailleur mensuel, profil idéal.`,
    alternates: cityAlternates("teletravail", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Télétravailler à ${city.name} · Guide 2026`,
      description: `FTTH, coworking, coût mensuel, profil adapté.`,
    },
  };
}

// Density-of-coworking heuristic — derived from population + tags. Replaces
// a future SIRENE flux import.
function coworkingDensity(city: (typeof CITIES_SEED)[number]): {
  label: string;
  count: string;
  tone: string;
} {
  const pop = city.population ?? 50000;
  const isMetro = city.characterTags.some((t) => ["métropole", "dynamique", "tech", "étudiant"].includes(t));
  if (pop > 300000 || (pop > 150000 && isMetro)) {
    return { label: "Dense", count: "20-40+ espaces", tone: "text-emerald-700 bg-emerald-100 border-emerald-300" };
  }
  if (pop > 100000 || isMetro) {
    return { label: "Bonne", count: "10-20 espaces", tone: "text-lime-700 bg-lime-100 border-lime-300" };
  }
  if (pop > 50000) {
    return { label: "Moyenne", count: "3-10 espaces", tone: "text-amber-700 bg-amber-100 border-amber-300" };
  }
  return { label: "Limitée", count: "0-3 espaces", tone: "text-orange-700 bg-orange-100 border-orange-300" };
}

function profilFor(city: (typeof CITIES_SEED)[number]): { match: string; explanation: string } {
  const remote = city.scores.remoteWork;
  const life = city.scores.life;
  const cost = city.scores.cost;
  const culture = city.scores.culture;

  if (remote >= 8 && life >= 8 && cost >= 6.5) {
    return {
      match: "Idéal pour télétravailleurs senior",
      explanation: "Score remote-work élevé + qualité de vie + coût raisonnable. Combinaison rare — c'est typiquement la cible des relocations « quitter Paris ».",
    };
  }
  if (remote >= 7.5 && culture >= 8) {
    return {
      match: "Adapté aux profils créatifs",
      explanation: "Bonne infrastructure remote ET scène culturelle dense — bonne pour freelance créa, journaliste, consultant indé.",
    };
  }
  if (remote >= 7 && cost >= 7.5) {
    return {
      match: "Bon rapport budget / télétravail",
      explanation: "Infra correcte avec un coût de la vie bien sous la moyenne nationale.",
    };
  }
  if (remote >= 7) {
    return {
      match: "Convient au télétravail occasionnel",
      explanation: "Infra OK pour 2-3 jours/semaine, mais sans bénéfice particulier vs une autre ville de même taille.",
    };
  }
  if (remote < 5.5) {
    return {
      match: "Peu adapté à un télétravail 100 %",
      explanation: "Réseau / cadre / culture remote en dessous de la moyenne — convient mieux à un mode présentiel ou hybride.",
    };
  }
  return {
    match: "Mixte — dépend de votre situation",
    explanation: "Score remote-work moyen — ni un bon ni un mauvais choix. Cocher selon votre profil personnel.",
  };
}

export default async function VilleTeletravailPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const ownerScores = computeOwnerScores(city);
  const ownerTeletravail = ownerScores.find((s) => s.key === "score_teletravail")!;
  const ownerLienSocial = ownerScores.find((s) => s.key === "score_solitude")!;
  const ownerBruit = ownerScores.find((s) => s.key === "score_bruit")!;
  const ownerQualiteAir = ownerScores.find((s) => s.key === "score_qualite_air")!;

  const housing = getHousing(city.slug);
  const zone = climateZoneFor(city.department);
  const transitPass = transitPassFor(city.slug);
  // Pôle d'emploi étranger le plus proche, s'il en existe un dans le champ du
  // barème frontalier : là où il y en a un, le nombre de jours télétravaillés
  // n'est plus un confort mais un paramètre fiscal.
  const border = borderCommute(city);
  // Pôle d'emploi français le plus proche. Cette page note la ville pour les
  // jours passés à la maison ; le renvoi s'adresse à ceux qui reviennent au
  // siège deux ou trois fois par semaine, et il n'a de sens que là où la
  // navette existe : `metroAccess` tombe à 0 au-delà de deux heures et demie,
  // et `metroAccessCommute` rend `null` pour les DROM et la Corse, où aucun
  // des douze pôles ne se rejoint — une mesure, pas une donnée manquante.
  const metroHub = metroAccess(city) > 0 ? metroAccessCommute(city) : null;

  // Rough monthly fixed budget for a remote worker (single, T2)
  const ROUGH_HEATING = { H1a: 95, H1b: 90, H1c: 80, H2a: 65, H2b: 60, H2c: 55, H2d: 70, H3: 40 } as const;
  const heating = zone ? ROUGH_HEATING[zone] : 65;
  const housingBudget = (housing?.avgRentT2 ?? 800) + heating + (transitPass ?? 80);

  const cowork = coworkingDensity(city);
  const profil = profilFor(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Télétravail", path: `/villes/${slug}/teletravail` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href={`/villes/${slug}`} className="hover:underline">
              ← {city.name}
            </Link>
          </Badge>
          <div className="flex items-center gap-3 mb-2">
            <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-head-0 text-xl shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)]">💻</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              Télétravailler à {city.name}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)]">
            Score remote-work site :{" "}
            <strong className={scoreColor(city.scores.remoteWork)}>
              {city.scores.remoteWork.toFixed(1)}/10
            </strong>{" "}
            · score propriétaire FTTH inclus :{" "}
            <strong className={scoreColor(ownerTeletravail.value)}>
              {ownerTeletravail.value.toFixed(1)}/10
            </strong>
          </p>
        </div>
      </section>

      {/* Verdict + signaux — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
            <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Verdict</p>
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{profil.match}</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{profil.explanation}</p>
          </div>

          <h2 className="mt-10 text-2xl font-bold text-[var(--text-primary)] mb-4">
            Les signaux télétravail
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "Score remote site", value: city.scores.remoteWork, ctx: "Fibre + cadre télétravail (axe officiel)" },
              { label: "Score remote propriétaire", value: ownerTeletravail.value, ctx: ownerTeletravail.source },
              { label: "Calme sonore", value: ownerBruit.value, ctx: "Important quand on bosse depuis le canapé" },
              { label: "Qualité de l'air", value: ownerQualiteAir.value, ctx: "PM2.5 — pertinent quand on ouvre les fenêtres" },
              { label: "Lien social", value: ownerLienSocial.value, ctx: "Moins de risques de solitude pour les solo" },
              { label: "Qualité de vie", value: city.scores.life, ctx: "L'air, l'eau, le quotidien" },
            ].map((row) => (
              <div key={row.label} className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{row.label}</p>
                  <p className={`font-mono-data font-bold ${scoreColor(row.value)}`}>{row.value.toFixed(1)}<span className="text-xs text-[var(--text-tertiary)]">/10</span></p>
                </div>
                <div className="h-1.5 bg-[var(--band-indigo)] rounded-full overflow-hidden mb-2">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#4F46E5] to-[#DB2777]" style={{ width: `${row.value * 10}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">{row.ctx}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coworking + budget — bande ciel */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <h2 className="text-lg font-bold"><span className="gradient-text">Densité coworking</span></h2>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cowork.tone}`}
              >
                {cowork.label}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">{cowork.count}</span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Estimation basée sur la population et les tags ville. À enrichir avec un import SIRENE
              spécifique (NAF 70.22Z et 68.20A pour les espaces dédiés télétravail).
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
            <h2 className="text-lg font-bold mb-3">
              <span className="gradient-text">Budget télétravailleur — solo en T2</span>
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between border-b border-[var(--border)]/40 py-1.5">
                <span>Loyer T2 médian</span>
                <span className="font-mono-data font-bold">{(housing?.avgRentT2 ?? 800).toLocaleString("fr-FR")} €/mois</span>
              </li>
              <li className="flex justify-between border-b border-[var(--border)]/40 py-1.5">
                <span>Chauffage (zone {zone ?? "moyenne"})</span>
                <span className="font-mono-data font-bold">{heating} €/mois</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span>
                  {transitPass != null ? "Abonnement transports" : "Voiture (estimation, sans tram)"}
                </span>
                <span className="font-mono-data font-bold">{transitPass ?? 80} €/mois</span>
              </li>
            </ul>
            <div className="mt-3 flex items-baseline justify-between gap-3 rounded-xl bg-[var(--band-sky)] px-4 py-3">
              <span className="text-sm font-semibold text-[var(--text-primary)]">Coût mobilité + logement</span>
              <span className="font-mono-data font-bold text-xl text-[var(--accent)]">
                {housingBudget.toLocaleString("fr-FR")} €/mois
              </span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-3">
              <Link href={`/calculateur-cout-reel/${city.slug}`} className="underline">
                Calcul complet (incluant taxes, mutuelle, garde) →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Renvois — bande rose */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-xl font-bold mb-4"><span className="gradient-text">Aller plus loin</span></h2>
          <div className="flex flex-wrap gap-3">
            <Link href={`/villes/${city.slug}`} className="grad-head-0 rounded-full px-4 py-2.5 text-sm font-semibold hover:opacity-90">
              Fiche complète {city.name}
            </Link>
            <Link href={`/calculateur-cout-reel/${city.slug}`} className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">
              💰 Coût réel
            </Link>
            <Link href="/classements/teletravail-proprietaire" className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">
              💻 Classement national
            </Link>
            <Link href="/classements/jeune-actif" className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">
              🚀 Télétravail + culture + coût
            </Link>
            {metroHub && (
              <Link href="/pour-qui/navetteurs-hybrides" className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">
                🚆{" "}
                {metroHub.hub === city.slug
                  ? "Et si le bureau reste à rejoindre deux ou trois jours par semaine"
                  : `Rentrer à ${HUB_LABEL[metroHub.hub]} deux ou trois jours par semaine`}
              </Link>
            )}
            {metroHub && (
              <Link href="/pour-qui/couples-a-deux-carrieres" className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">
                💼 Si le conjoint doit aussi trouver un poste sur place
              </Link>
            )}
            {border && (
              <Link href="/pour-qui/travailleurs-frontaliers" className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">
                🛂 Employeur à {border.hub} : les jours à la maison se comptent
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Discussion — bande blanche */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <DiscussionCTA citySlug={city.slug} cityName={city.name} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
