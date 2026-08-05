import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_COLOR,
  SYNTHESIS_LEVEL_BG,
  type CitySynthesis,
  type SynthesisLevel,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternatesEn } from "@/lib/i18n";
import { clampMeta } from "@/lib/brand";

export const revalidate = false;
// Aligné sur le parent /compare/[pair] et sur la jumelle FR : la CTA
// « 8-dimension comparison » doit résoudre sur exactement le même jeu de
// paires que la page classique, sinon elle 404 sur une paire curée.
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; pair: string }> };

export function generateStaticParams() {
  return [
    ...SEO_PAIRS.map(([a, b]) => ({ locale: "en", pair: `${a}-vs-${b}` })),
    ...SEO_TRIPLETS.map(([a, b, c]) => ({ locale: "en", pair: `${a}-vs-${b}-vs-${c}` })),
  ];
}

const TRIPLET_COLORS = ["#0ea5e9", "#a78bfa", "#f97316"] as const;

// Le moteur `lib/city-synthesis` est francophone (libellés + href FR) et reste
// la source unique des chiffres : les deux locales affichent exactement les
// mêmes scores. Seul l'habillage est traduit, ici, au point d'affichage —
// mêmes tables que `app/[locale]/cities/[slug]/synthesis/page.tsx`.
const EN_LEVEL_LABEL: Record<SynthesisLevel, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
};

const EN_AXIS_LABEL: Record<string, string> = {
  "Cadre de vie": "Quality of life",
  "Environnement": "Environment",
  "Santé": "Healthcare",
  "Emploi": "Employment",
  "Vélo": "Cycling",
  "Sécurité": "Safety",
  "Démographie": "Demographics",
  "Services publics": "Public services",
};

const EN_AXIS_HINT: Record<string, string> = {
  "Cadre de vie": "Mega-index: env + healthcare + employment",
  "Environnement": "Air · noise · water · natural risks",
  "Santé": "GPs · specialists · A&E · pharmacies",
  "Emploi": "Unemployment · wages · economic dynamism",
  "Vélo": "Cycle network · terrain · safety",
  "Sécurité": "Property crime · personal safety · night",
  "Démographie": "Ageing · youth · population trajectory",
  "Services publics": "Schools · post office · town hall · library",
};

function enAxisHref(key: string, slug: string): string {
  const map: Record<string, string> = {
    "cadre-de-vie": `/cities/${slug}`,
    environnement: `/cities/${slug}/air-quality`,
    sante: `/cities/${slug}/healthcare`,
    emploi: `/cities/${slug}/employment`,
    velo: `/cities/${slug}/cycling`,
    securite: `/cities/${slug}/safety`,
    demographie: `/cities/${slug}/demographics`,
    "services-publics": `/cities/${slug}/public-services`,
  };
  return map[key] ?? `/cities/${slug}`;
}

const axisLabel = (fr: string) => EN_AXIS_LABEL[fr] ?? fr;
const axisHint = (fr: string, fallback: string) => EN_AXIS_HINT[fr] ?? fallback;

/** Titre court si le gabarit long dépasse les ~60 caractères rendus par Google. */
function fitTitle(long: string, short: string): string {
  return long.length <= 60 ? long : short;
}

function deltaLabel(d: number): string {
  if (Math.abs(d) < 0.3) return "level";
  if (d > 0) return `+${d.toFixed(1)} pts`;
  return `${d.toFixed(1)} pts`;
}

function frPath(pair: string) {
  return `/comparer/${pair}/synthese`;
}
function enPath(pair: string) {
  return `/compare/${pair}/synthesis`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parts = pair.split("-vs-");
  const alternates = pathAlternatesEn(frPath(pair), enPath(pair));

  if (parts.length === 3) {
    const cities = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
    if (cities.some((c) => !c)) return {};
    const [a, b, c] = cities as NonNullable<(typeof cities)[number]>[];
    return {
      title: fitTitle(
        `${a.name} vs ${b.name} vs ${c.name} — 8 dimensions compared`,
        `${a.name} vs ${b.name} vs ${c.name} — 8 dimensions`,
      ),
      description: clampMeta(
        `Three-way comparison of ${a.name}, ${b.name} and ${c.name}: environment, healthcare, employment, quality of life, safety, demographics. Winner per dimension.`,
      ),
      alternates,
      openGraph: {
        // Sans `images`, un openGraph de page remplace celui hérité de la racine
        // — la carte sociale disparaîtrait entièrement au lieu de retomber dessus.
        images: ["/opengraph-image"],
        title: `${a.name} vs ${b.name} vs ${c.name} — 8 dimensions`,
        description: `The site's 8 data dimensions, compared across three French cities.`,
      },
    };
  }

  if (parts.length !== 2) return {};
  const cityA = CITIES_SEED.find((c) => c.slug === parts[0]);
  const cityB = CITIES_SEED.find((c) => c.slug === parts[1]);
  if (!cityA || !cityB) return {};
  return {
    title: fitTitle(
      `${cityA.name} vs ${cityB.name} — 8 dimensions compared`,
      `${cityA.name} vs ${cityB.name} — 8 dimensions`,
    ),
    description: clampMeta(
      `${cityA.name} vs ${cityB.name} on 8 data dimensions: environment, healthcare, employment, quality of life, cycling, safety, demographics, public services.`,
    ),
    alternates,
    openGraph: {
      images: ["/opengraph-image"],
      title: `${cityA.name} vs ${cityB.name} — 8 dimensions`,
      description: `The site's 8 data dimensions, side by side. Unified scale: 10 = excellent.`,
    },
  };
}

export default async function PairSynthesisENPage({ params }: Props) {
  const { pair } = await params;
  const parts = pair.split("-vs-");

  // Triplet dispatch — same dynamic segment, different render (mirrors FR).
  if (parts.length === 3) {
    const seeds = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
    if (seeds.some((c) => !c)) notFound();
    return renderTriplet(seeds as NonNullable<(typeof seeds)[number]>[], pair);
  }

  if (parts.length !== 2) notFound();
  const cityA = CITIES_SEED.find((c) => c.slug === parts[0]);
  const cityB = CITIES_SEED.find((c) => c.slug === parts[1]);
  if (!cityA || !cityB) notFound();

  const synA = computeCitySynthesis(cityA);
  const synB = computeCitySynthesis(cityB);

  const axesA = new Map(synA.axes.map((a) => [a.key, a]));
  const rows = synB.axes.map((b) => {
    const a = axesA.get(b.key)!;
    const delta = Math.round((a.score - b.score) * 10) / 10;
    return { key: b.key, label: b.label, hint: b.hint, a, b, delta };
  });
  const winsA = rows.filter((r) => r.delta >= 0.3).length;
  const winsB = rows.filter((r) => r.delta <= -0.3).length;
  const draws = rows.length - winsA - winsB;
  const verdict =
    winsA >= winsB + 2
      ? `${cityA.name} takes the synthesis (${winsA}/${rows.length} dimensions ahead, ${winsB} for ${cityB.name}, ${draws} level).`
      : winsB >= winsA + 2
        ? `${cityB.name} takes the synthesis (${winsB}/${rows.length} dimensions ahead, ${winsA} for ${cityA.name}, ${draws} level).`
        : `Close call (${winsA} dimensions for ${cityA.name}, ${winsB} for ${cityB.name}, ${draws} level) — the decision comes down to your own priorities.`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: `${cityA.name} vs ${cityB.name}`, path: `/compare/${pair}` },
    { name: "8 dimensions", path: enPath(pair) },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which city scores higher overall, ${cityA.name} or ${cityB.name}?`,
      a: `Composite synthesis score (mean of 8 normalised dimensions, 10 = excellent): ${cityA.name} ${synA.global}/10 vs ${cityB.name} ${synB.global}/10. ${verdict}`,
    },
    {
      q: `Where does ${cityA.name} beat ${cityB.name}?`,
      a:
        rows.filter((r) => r.delta >= 0.3).length === 0
          ? `${cityA.name} is not ahead of ${cityB.name} on any dimension by a meaningful margin (≥ 0.3 pts).`
          : `Dimensions favouring ${cityA.name}: ${rows
              .filter((r) => r.delta >= 0.3)
              .map((r) => `${axisLabel(r.label)} (+${r.delta.toFixed(1)})`)
              .join(", ")}.`,
    },
    {
      q: `Where does ${cityB.name} beat ${cityA.name}?`,
      a:
        rows.filter((r) => r.delta <= -0.3).length === 0
          ? `${cityB.name} is not ahead of ${cityA.name} on any dimension by a meaningful margin (≥ 0.3 pts).`
          : `Dimensions favouring ${cityB.name}: ${rows
              .filter((r) => r.delta <= -0.3)
              .map((r) => `${axisLabel(r.label)} (${Math.abs(r.delta).toFixed(1)})`)
              .join(", ")}.`,
    },
    {
      q: `How is the 8-dimension synthesis calculated?`,
      a: `Arithmetic mean of the site's 8 data-cluster composites (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services), all normalised to a "10 = excellent" convention. Deterministic and reproducible — the French version of this page shows the same figures.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/compare" className="hover:underline">Compare</Link> ·{" "}
          <Link href={`/compare/${pair}`} className="hover:underline">
            {cityA.name} vs {cityB.name}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {cityA.name} vs {cityB.name} — 8 dimensions compared
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Head-to-head on the site&apos;s 8 data dimensions: environment, healthcare,
          employment, quality of life, cycling, safety, demographics, public services.
          Unified scale, 10 = excellent. A gap counts as meaningful from 0.3 pts.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8 dimensions</Badge>
          <Badge>
            {cityA.name} {synA.global}/10 vs {cityB.name} {synB.global}/10
          </Badge>
        </div>

        {/* Hero verdict */}
        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-2xl border p-4 ${SYNTHESIS_LEVEL_BG[synA.level]}`}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                {cityA.name}
              </div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                {synA.global.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
              </div>
              <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[synA.level]}`}>
                {EN_LEVEL_LABEL[synA.level]} · consistency ±{synA.spread.toFixed(1)}
              </div>
            </div>
            <div className={`rounded-2xl border p-4 ${SYNTHESIS_LEVEL_BG[synB.level]}`}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                {cityB.name}
              </div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                {synB.global.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
              </div>
              <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[synB.level]}`}>
                {EN_LEVEL_LABEL[synB.level]} · consistency ±{synB.spread.toFixed(1)}
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{verdict}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge>{winsA} for {cityA.name}</Badge>
            <Badge>{winsB} for {cityB.name}</Badge>
            <Badge>{draws} level</Badge>
          </div>
        </Card>

        {/* Dimension-by-dimension comparison */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Dimension by dimension
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Unified scale, 10 = excellent. The delta is positive when {cityA.name} is ahead
          of {cityB.name}. Anything under 0.3 pts is treated as level.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Dimension</th>
                  <th className="px-3 py-2 text-right">{cityA.name}</th>
                  <th className="px-3 py-2 text-right">{cityB.name}</th>
                  <th className="px-3 py-2 text-right">Δ</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Ahead</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const winner =
                    Math.abs(r.delta) < 0.3 ? "—" : r.delta > 0 ? cityA.name : cityB.name;
                  const winnerColor =
                    winner === "—" ? "text-[var(--text-tertiary)]" : "text-emerald-700";
                  return (
                    <tr key={r.key} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2">
                        <Link
                          href={enAxisHref(r.key, cityA.slug)}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {axisLabel(r.label)}
                        </Link>
                        <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                          {axisHint(r.label, r.hint)}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[r.a.level]}`}>
                          {r.a.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[r.b.level]}`}>
                          {r.b.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-xs text-[var(--text-secondary)]">
                        {deltaLabel(r.delta)}
                      </td>
                      <td className={`px-3 py-2 text-xs font-semibold hidden sm:table-cell ${winnerColor}`}>
                        {winner}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Go further</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/compare/${pair}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ← Standard comparison
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Core scores, cost of living, housing
              </div>
            </Card>
          </Link>
          <Link href={`/cities/${cityA.slug}/synthesis`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {cityA.name} full profile
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Strengths, tensions, methodology
              </div>
            </Card>
          </Link>
          <Link href={`/cities/${cityB.slug}/synthesis`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {cityB.name} full profile
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Strengths, tensions, methodology
              </div>
            </Card>
          </Link>
          <Link href="/overall-ranking" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                National ranking
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                The 30 strongest profiles across the 8 dimensions
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ─── Triplet synthesis (EN twin of the FR renderTriplet) ───────────────────

type SeedCity = (typeof CITIES_SEED)[number];

function renderTriplet(seeds: SeedCity[], pair: string) {
  const [s0, s1, s2] = seeds;
  const syns: CitySynthesis[] = seeds.map((s) => computeCitySynthesis(s));
  const [syn0, syn1, syn2] = syns;

  const axes0 = syn0.axes;
  const axesByKey = seeds.map((_, i) => new Map(syns[i].axes.map((a) => [a.key, a])));
  const rows = axes0.map((a0) => {
    const scores = seeds.map((_, i) => axesByKey[i].get(a0.key)!.score);
    const max = Math.max(...scores);
    const leaders = scores
      .map((s, i) => (s >= max - 0.0001 ? i : -1))
      .filter((i) => i >= 0);
    const sorted = [...scores].sort((a, b) => b - a);
    // Only a margin of ≥ 0.3 pts over the runner-up counts as being ahead.
    const winner = leaders.length === 1 && sorted[0] - sorted[1] >= 0.3 ? leaders[0] : -1;
    return { key: a0.key, label: a0.label, hint: a0.hint, scores, winner };
  });

  const wins = seeds.map((_, i) => rows.filter((r) => r.winner === i).length);
  const draws = rows.length - wins.reduce((a, b) => a + b, 0);
  const overallIdx = wins.indexOf(Math.max(...wins));
  const tiedTop = wins.filter((w) => w === wins[overallIdx]).length > 1;
  const verdict = tiedTop
    ? `The three profiles sit very close across the 8 dimensions (${wins.join(" / ")} wins, ${draws} level) — the decision comes down to your own priorities.`
    : `${seeds[overallIdx].name} has the strongest overall profile (${wins[overallIdx]} of ${rows.length} dimensions ahead, ${draws} level).`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Compare", path: "/compare" },
    { name: `${s0.name} vs ${s1.name} vs ${s2.name}`, path: `/compare/${pair}` },
    { name: "8 dimensions", path: enPath(pair) },
  ]);

  const aheadOn = (i: number) => {
    const won = rows.filter((r) => r.winner === i);
    return won.length === 0
      ? `${seeds[i].name} is not ahead of the other two on any dimension by a meaningful margin (≥ 0.3 pts).`
      : `Dimensions favouring ${seeds[i].name}: ${won.map((r) => axisLabel(r.label)).join(", ")}.`;
  };

  const faq = faqJsonLd([
    {
      q: `Which scores highest overall: ${s0.name}, ${s1.name} or ${s2.name}?`,
      a: `Composite synthesis scores (mean of 8 normalised dimensions, 10 = excellent): ${s0.name} ${syn0.global}/10, ${s1.name} ${syn1.global}/10, ${s2.name} ${syn2.global}/10. ${verdict}`,
    },
    { q: `Where does ${s0.name} stand out?`, a: aheadOn(0) },
    { q: `Where does ${s1.name} stand out?`, a: aheadOn(1) },
    { q: `Where does ${s2.name} stand out?`, a: aheadOn(2) },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/compare" className="hover:underline">Compare</Link> ·{" "}
          <Link href={`/compare/${pair}`} className="hover:underline">
            {s0.name} vs {s1.name} vs {s2.name}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {s0.name} vs {s1.name} vs {s2.name} — 8 dimensions compared
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Three-way comparison on the site&apos;s 8 data dimensions. Unified scale,
          10 = excellent. A city is only marked as ahead on a dimension if it leads
          the runner-up by at least 0.3 pts.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8 dimensions</Badge>
          <Badge>{s0.name} {syn0.global}/10</Badge>
          <Badge>{s1.name} {syn1.global}/10</Badge>
          <Badge>{s2.name} {syn2.global}/10</Badge>
        </div>

        {/* Hero — 3 cards */}
        <Card className="mt-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {seeds.map((s, i) => (
              <div
                key={s.slug}
                className={`rounded-2xl border p-3 sm:p-4 ${SYNTHESIS_LEVEL_BG[syns[i].level]}`}
              >
                <div
                  className="text-xs uppercase tracking-wide mb-1 font-semibold"
                  style={{ color: TRIPLET_COLORS[i] }}
                >
                  {s.name}
                </div>
                <div className="text-2xl sm:text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                  {syns[i].global.toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">
                    /10
                  </span>
                </div>
                <div
                  className={`text-[11px] font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[syns[i].level]}`}
                >
                  {EN_LEVEL_LABEL[syns[i].level]} · ±{syns[i].spread.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{verdict}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {seeds.map((s, i) => (
              <Badge key={s.slug}>
                {wins[i]} for {s.name}
              </Badge>
            ))}
            <Badge>{draws} level</Badge>
          </div>
        </Card>

        {/* Dimension-by-dimension comparison */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Dimension by dimension
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          The city in front is only credited when it leads the runner-up by 0.3 pts or
          more. Below that, the gap is not treated as meaningful.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Dimension</th>
                  {seeds.map((s, i) => (
                    <th key={s.slug} className="px-3 py-2 text-right">
                      <span style={{ color: TRIPLET_COLORS[i] }}>{s.name}</span>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Ahead</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const winnerName = r.winner === -1 ? "—" : seeds[r.winner].name;
                  return (
                    <tr key={r.key} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2">
                        <Link
                          href={enAxisHref(r.key, s0.slug)}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {axisLabel(r.label)}
                        </Link>
                        <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                          {axisHint(r.label, r.hint)}
                        </div>
                      </td>
                      {r.scores.map((score, i) => {
                        const isWinner = r.winner === i;
                        return (
                          <td key={i} className="px-3 py-2 text-right">
                            <span
                              className={`tabular-nums ${isWinner ? "font-bold" : "font-medium"}`}
                              style={isWinner ? { color: TRIPLET_COLORS[i] } : undefined}
                            >
                              {score.toFixed(1)}
                            </span>
                          </td>
                        );
                      })}
                      <td
                        className={`px-3 py-2 text-xs font-semibold hidden sm:table-cell ${
                          r.winner === -1 ? "text-[var(--text-tertiary)]" : ""
                        }`}
                        style={r.winner === -1 ? undefined : { color: TRIPLET_COLORS[r.winner] }}
                      >
                        {winnerName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Go further</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/compare/${pair}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ← Standard 3-city comparison
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Core scores, climate, housing
              </div>
            </Card>
          </Link>
          {seeds.map((s) => (
            <Link key={s.slug} href={`/cities/${s.slug}/synthesis`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  {s.name} full profile
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Strengths, tensions, methodology
                </div>
              </Card>
            </Link>
          ))}
          <Link href="/synthesis" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                8-dimension hub
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                From a single city up to the national picture
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
