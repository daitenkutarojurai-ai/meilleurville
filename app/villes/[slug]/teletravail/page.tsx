import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { computeOwnerScores } from "@/lib/owner-scores";
import { CITIES_COUNT } from "@/lib/site-stats";
import { climateZoneFor, transitPassFor } from "@/lib/cost-living";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

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
    description: `${city.name} pour le télétravail : couverture fibre département, score qualité de vie, coût télétravailleur mensuel, profil idéal. Données calibrées sur les ${CITIES_COUNT} villes du site.`,
    alternates: { canonical: `/villes/${slug}/teletravail` },
    openGraph: {
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

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href={`/villes/${slug}`} className="hover:underline">
              ← {city.name}
            </Link>
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Télétravailler à {city.name}
          </h1>
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

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Verdict */}
        <Card>
          <p className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Verdict</p>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">{profil.match}</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{profil.explanation}</p>
        </Card>

        {/* Scores breakdown */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
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
              <div key={row.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="flex items-baseline justify-between mb-1">
                  <p className="text-sm font-medium text-[var(--text-primary)]">{row.label}</p>
                  <p className={`font-mono-data font-bold ${scoreColor(row.value)}`}>{row.value.toFixed(1)}<span className="text-xs text-[var(--text-tertiary)]">/10</span></p>
                </div>
                <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[var(--accent)]" style={{ width: `${row.value * 10}%` }} />
                </div>
                <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">{row.ctx}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Coworking density */}
        <Card>
          <div className="flex flex-wrap items-baseline gap-3 mb-2">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Densité coworking</h2>
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
        </Card>

        {/* Cost block */}
        <Card>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            Budget télétravailleur — solo en T2
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
          <div className="mt-3 flex items-baseline justify-between border-t border-[var(--border)] pt-3">
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
        </Card>

        {/* Cross-links */}
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href={`/villes/${city.slug}`}>
            <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer">
              Fiche complète {city.name}
            </Badge>
          </Link>
          <Link href={`/calculateur-cout-reel/${city.slug}`}>
            <Badge variant="default" className="px-4 py-2 text-sm cursor-pointer">
              💰 Coût réel
            </Badge>
          </Link>
          <Link href="/classements/teletravail-proprietaire">
            <Badge variant="accent" className="px-4 py-2 text-sm cursor-pointer">
              💻 Classement national
            </Badge>
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
