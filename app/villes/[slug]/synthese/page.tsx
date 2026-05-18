import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
  SYNTHESIS_LEVEL_BG,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

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
  const s = computeCitySynthesis(city);
  const topAxis = s.strengths[0]?.label.toLowerCase() ?? "";
  const bottomAxis = s.tensions[0]?.label.toLowerCase() ?? "";
  return {
    title: `Synthèse complète de ${city.name} · les 8 indicateurs en un coup d'œil`,
    description: `${city.name} (${city.department}) synthèse 8 axes : global ${s.global}/10 (${SYNTHESIS_LEVEL_LABEL[s.level].toLowerCase()}). Force ${topAxis}, tension ${bottomAxis}. ${s.signature}`,
    alternates: { canonical: `/villes/${slug}/synthese` },
    openGraph: {
      title: `Synthèse complète de ${city.name}`,
      description: `Panorama des 8 clusters data en un glance — cadre de vie, environnement, santé, emploi, vélo, sécurité, démographie, services publics.`,
    },
  };
}

function ScoreBar({ score }: { score: number }) {
  const pct = Math.max(0, Math.min(100, score * 10));
  const color =
    score >= 7.5
      ? "bg-emerald-500"
      : score >= 5.5
        ? "bg-lime-500"
        : score >= 4
          ? "bg-amber-500"
          : "bg-red-500";
  return (
    <div className="h-2 w-full rounded-full bg-[var(--bg-elevated)] overflow-hidden">
      <div
        className={`h-full ${color} transition-all`}
        style={{ width: `${pct}%` }}
        aria-hidden="true"
      />
    </div>
  );
}

export default async function SynthesePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const s = computeCitySynthesis(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Synthèse", path: `/villes/${city.slug}/synthese` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quel est le profil global de ${city.name} ?`,
      a: `${city.name} (${city.department}) totalise un score global de synthèse de ${s.global}/10 (10 = excellent). ${s.signature} Écart-type entre axes : ${s.spread} (mesure de cohérence du profil).`,
    },
    {
      q: `Quels sont les points forts de ${city.name} ?`,
      a: `Top 3 axes : ${s.strengths.map((a) => `${a.label} (${a.score}/10)`).join(", ")}. Ces dimensions tirent le profil vers le haut.`,
    },
    {
      q: `Quels sont les points faibles de ${city.name} ?`,
      a: `Top 3 tensions : ${s.tensions.map((a) => `${a.label} (${a.score}/10)`).join(", ")}. Ces dimensions méritent une attention particulière avant de s'installer.`,
    },
    {
      q: `Comment la synthèse est-elle calculée ?`,
      a: `Moyenne arithmétique des 8 composites des clusters data du site (F44 environnement, F47 santé, F50 emploi, F52 cadre de vie, F57 vélo, F58 sécurité, F59 démographie, F60 services publics). Tous les axes sont normalisés vers une convention « 10 = excellent » pour un panorama unifié. Le calcul est déterministe et reproductible — aucun chiffre inventé.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Synthèse complète de {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Les 8 dimensions du profil ville en un seul écran — environnement, santé, emploi,
          cadre de vie, vélo, sécurité, démographie, services publics. Convention unifiée :
          10 = excellent. Cliquez un axe pour ouvrir le détail méthodologique.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse 8 axes</Badge>
          <Badge>Clusters F44 / F47 / F50 / F52 / F57-F60</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${SYNTHESIS_LEVEL_BG[s.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score global</h2>
            <span className={`text-xs font-bold uppercase ${SYNTHESIS_LEVEL_COLOR[s.level]}`}>
              Profil {SYNTHESIS_LEVEL_LABEL[s.level].toLowerCase()}
            </span>
          </div>
          <div className="flex items-baseline gap-3 mb-3">
            <span className="text-4xl font-bold tabular-nums text-[var(--text-primary)]">
              {s.global.toFixed(1)}
              <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              Cohérence : écart-type {s.spread}/10 entre axes
            </span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{s.signature}</p>
        </Card>

        {/* 8 axes — main grid */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les 8 axes en détail</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Triés du score le plus élevé au plus bas. Chaque axe pointe vers la sous-page
          méthodologique du cluster.
        </p>
        <div className="mt-4 space-y-2">
          {s.axes.map((a) => (
            <Link
              key={a.key}
              href={a.href}
              className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all p-4 group"
            >
              <div className="flex items-center justify-between mb-2 gap-3">
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {a.label}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] font-mono">
                      {a.tag}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{a.hint}</div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
                    {a.score.toFixed(1)}
                    <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                  </div>
                  <div className={`text-[10px] font-bold uppercase ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {SYNTHESIS_LEVEL_LABEL[a.level]}
                  </div>
                </div>
              </div>
              <ScoreBar score={a.score} />
            </Link>
          ))}
        </div>

        {/* Strengths + Tensions */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card className="border-emerald-200">
            <h3 className="text-sm font-semibold text-emerald-700 mb-3 uppercase tracking-wide">
              ✓ Points forts
            </h3>
            <ul className="space-y-2 text-sm">
              {s.strengths.map((a) => (
                <li key={a.key} className="flex items-center justify-between gap-3">
                  <Link href={a.href} className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium">
                    {a.label}
                  </Link>
                  <span className={`font-bold tabular-nums text-sm ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {a.score.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="border-red-200">
            <h3 className="text-sm font-semibold text-red-700 mb-3 uppercase tracking-wide">
              ⚠ Points de vigilance
            </h3>
            <ul className="space-y-2 text-sm">
              {s.tensions.map((a) => (
                <li key={a.key} className="flex items-center justify-between gap-3">
                  <Link href={a.href} className="text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors font-medium">
                    {a.label}
                  </Link>
                  <span className={`font-bold tabular-nums text-sm ${SYNTHESIS_LEVEL_COLOR[a.level]}`}>
                    {a.score.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            La synthèse agrège les 8 composites des clusters data du site.
            <strong className="text-[var(--text-primary)]"> Convention unifiée :</strong> tous
            les axes sont normalisés vers <strong>10 = excellent</strong> pour permettre
            comparaison directe et calcul moyenne arithmétique. Les clusters d&apos;origine
            « 10 = pire » (env, santé, emploi, sécurité, démo, services) sont inversés via
            <code className="px-1 mx-1 rounded bg-[var(--bg-elevated)] text-xs">10 − composite</code>.
            Vélo (F57) et Cadre de vie (F52) sont déjà orientés positif.
          </p>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
            <strong className="text-[var(--text-primary)]">Cohérence :</strong> l&apos;écart-type
            entre les 8 axes mesure si le profil est uniforme ({s.spread} ≤ 1,2 = cohérent)
            ou contrasté (≥ 2 = forces et tensions très marquées). Une ville moyenne
            partout est différente d&apos;une ville excellente sur 4 dimensions et tendue
            sur 4 autres — la moyenne ne dit pas tout.
          </p>
          <p className="text-xs text-[var(--text-tertiary)]">
            Calcul déterministe et reproductible — aucun chiffre inventé. Les sources
            de chaque cluster sont documentées sur leur sous-page respective.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/avis-honnete`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🧭</span><span>Avis honnête</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Verdict éditorial profil par profil</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Fiche complète</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Scores, narratif, quartiers</div>
            </Card>
          </Link>
          <Link href={`/cadre-de-vie/personnaliser`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Pondère toi-même</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Quiz cadre de vie personnalisé</div>
            </Card>
          </Link>
          <Link href={`/red-flags`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red Flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">15 angles « ne pas y aller »</div>
            </Card>
          </Link>
        </div>

        <div className="mt-8 text-sm">
          <Link href="/palmares" className="text-[var(--accent)] hover:underline">
            → Voir le palmarès national (classement universel 8 axes)
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
