// EN twin of FR F67 — 8-dimension synthesis for a pair of French regions (×78 SSG).
//
// Mirror of `app/comparer-regions/[pair]/synthese/page.tsx`. The engine
// (`computeRegionAverageSynthesis`) is the single source of the numbers, so the
// two locales show exactly the same scores — they are hreflang alternates, and a
// divergent figure would be a bug. Only the wording is English, supplied at the
// display site per CLAUDE.md convention #6.

import { CITIES_LIGHT } from "@/lib/cities-light";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { METRO_REGIONS, REGION_EMOJIS, regionToSlug, slugToRegion } from "@/lib/regions";
import {
  computeRegionAverageSynthesis,
  SYNTHESIS_LEVEL_COLOR,
  SYNTHESIS_LEVEL_BG,
  type SynthesisLevel,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternatesEn } from "@/lib/i18n";
import { clampMeta } from "@/lib/brand";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; pair: string }> };

export function generateStaticParams() {
  const params: Array<{ locale: string; pair: string }> = [];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      params.push({
        locale: "en",
        pair: `${regionToSlug(METRO_REGIONS[i])}-vs-${regionToSlug(METRO_REGIONS[j])}`,
      });
    }
  }
  return params; // 78 = C(13, 2)
}

function parsePair(pair: string): { a: string; b: string } | null {
  // Region slugs contain hyphens of their own, so splitting on "-vs-" is unsafe:
  // scan METRO_REGIONS for the prefix instead (same as the FR twin).
  for (const region of METRO_REGIONS) {
    const slug = regionToSlug(region);
    if (pair.startsWith(`${slug}-vs-`)) {
      const rest = pair.slice(slug.length + 4);
      const b = slugToRegion(rest);
      if (b) return { a: region, b };
    }
  }
  return null;
}

function frPath(pair: string) {
  return `/comparer-regions/${pair}/synthese`;
}
function enPath(pair: string) {
  return `/compare-regions/${pair}/synthesis`;
}

/** Region names are long ("Provence-Alpes-Côte d'Azur"): keep the title under ~60 chars. */
function fitTitle(long: string, short: string): string {
  return long.length <= 60 ? long : short;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { a, b } = parsed;
  return {
    title: fitTitle(`${a} vs ${b} — 8 dimensions compared`, `${a} vs ${b} — 8 dimensions`),
    description: clampMeta(
      `${a} vs ${b} on 8 data dimensions: environment, healthcare, employment, quality of life, cycling, safety, demographics, public services.`,
    ),
    alternates: pathAlternatesEn(frPath(pair), enPath(pair)),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaîtrait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `${a} vs ${b} — regions on 8 dimensions`,
      description: `Average regional profiles compared dimension by dimension. Unified scale: 10 = excellent.`,
    },
  };
}

const EN_LEVEL_LABEL: Record<SynthesisLevel, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Moderate",
  tendu: "Strained",
};

const AXIS_META: Array<{
  key: "cadre-de-vie" | "environnement" | "sante" | "emploi" | "velo" | "securite" | "demographie" | "services-publics";
  label: string;
  hint: string;
  href: string;
}> = [
  { key: "cadre-de-vie", label: "Quality of life", hint: "Mega-index: env + healthcare + employment", href: "/quality-of-life" },
  { key: "environnement", label: "Environment", hint: "Air · noise · water · natural risks", href: "/environment" },
  { key: "sante", label: "Healthcare", hint: "GPs · specialists · A&E · pharmacies", href: "/healthcare" },
  { key: "emploi", label: "Employment", hint: "Unemployment · wages · economic dynamism", href: "/employment" },
  { key: "velo", label: "Cycling", hint: "Cycle network · terrain · safety", href: "/cycling" },
  { key: "securite", label: "Safety", hint: "Property crime · personal safety · night", href: "/safety" },
  { key: "demographie", label: "Demographics", hint: "Ageing · youth · population trajectory", href: "/demographics" },
  { key: "services-publics", label: "Public services", hint: "Schools · post office · town hall · library", href: "/public-services" },
];

function deltaLabel(d: number): string {
  if (Math.abs(d) < 0.3) return "level";
  if (d > 0) return `+${d.toFixed(1)} pts`;
  return `${d.toFixed(1)} pts`;
}

export default async function EnPairRegionSynthesisPage({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { a, b } = parsed;

  const synA = computeRegionAverageSynthesis(a, CITIES_LIGHT);
  const synB = computeRegionAverageSynthesis(b, CITIES_LIGHT);
  if (!synA || !synB) notFound();

  const rows = AXIS_META.map((m) => {
    const sa = synA.byAxis[m.key];
    const sb = synB.byAxis[m.key];
    const delta = Math.round((sa - sb) * 10) / 10;
    return { ...m, a: sa, b: sb, delta };
  });
  const winsA = rows.filter((r) => r.delta >= 0.3).length;
  const winsB = rows.filter((r) => r.delta <= -0.3).length;
  const draws = rows.length - winsA - winsB;
  const verdict =
    winsA >= winsB + 2
      ? `Averaged across their cities, ${a} has the stronger regional profile (${winsA} of ${rows.length} dimensions ahead, ${winsB} for ${b}, ${draws} level).`
      : winsB >= winsA + 2
        ? `Averaged across their cities, ${b} has the stronger regional profile (${winsB} of ${rows.length} dimensions ahead, ${winsA} for ${a}, ${draws} level).`
        : `The two regional profiles sit close together (${winsA} dimensions for ${a}, ${winsB} for ${b}, ${draws} level) — the decision comes down to your own priorities and to the specific town you settle in.`;

  const emojiA = REGION_EMOJIS[a] ?? "📍";
  const emojiB = REGION_EMOJIS[b] ?? "📍";
  const slugA = regionToSlug(a);
  const slugB = regionToSlug(b);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Compare regions", path: "/compare-regions" },
    { name: `${a} vs ${b}`, path: `/compare-regions/${pair}` },
    { name: "8 dimensions", path: enPath(pair) },
  ]);

  const faq = faqJsonLd([
    {
      q: `Which region scores higher overall, ${a} or ${b}?`,
      a: `Composite synthesis score (mean of 8 normalised dimensions, averaged over every city we profile in the region): ${a} ${synA.global}/10 vs ${b} ${synB.global}/10. ${verdict}`,
    },
    {
      q: `Where does ${a} beat ${b}?`,
      a:
        rows.filter((r) => r.delta >= 0.3).length === 0
          ? `${a} is not ahead of ${b} on any dimension by a meaningful margin (≥ 0.3 pts).`
          : `Dimensions favouring ${a}: ${rows
              .filter((r) => r.delta >= 0.3)
              .map((r) => `${r.label} (+${r.delta.toFixed(1)})`)
              .join(", ")}.`,
    },
    {
      q: `Where does ${b} beat ${a}?`,
      a:
        rows.filter((r) => r.delta <= -0.3).length === 0
          ? `${b} is not ahead of ${a} on any dimension by a meaningful margin (≥ 0.3 pts).`
          : `Dimensions favouring ${b}: ${rows
              .filter((r) => r.delta <= -0.3)
              .map((r) => `${r.label} (${Math.abs(r.delta).toFixed(1)})`)
              .join(", ")}.`,
    },
    {
      q: `How is this regional comparison calculated?`,
      a: `For each region we take the arithmetic mean, across the cities we profile, of the site's 8 data composites (environment, healthcare, employment, quality of life, cycling, safety, demographics, public services), all normalised to a "10 = excellent" convention. Deterministic and reproducible: ${synA.cityCount} ${synA.cityCount > 1 ? "cities" : "city"} averaged for ${a}, ${synB.cityCount} for ${b}. The French version of this page shows the same figures.`,
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
          <Link href="/compare-regions" className="hover:underline">Compare regions</Link> ·{" "}
          <Link href={`/compare-regions/${pair}`} className="hover:underline">
            {a} vs {b}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {a} vs {b} — 8 dimensions compared
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Region against region on the site&apos;s 8 data dimensions, each one averaged
          over every city we profile in that region. Unified scale, 10 = excellent.
          A gap counts as meaningful from 0.3 pts.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8 dimensions</Badge>
          <Badge>
            {a} {synA.global}/10 vs {b} {synB.global}/10
          </Badge>
          <Badge>
            {synA.cityCount} vs {synB.cityCount} cities
          </Badge>
        </div>

        {/* Hero verdict */}
        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-2xl border p-4 ${SYNTHESIS_LEVEL_BG[synA.level]}`}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                <span aria-hidden>{emojiA}</span> {a}
              </div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                {synA.global.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
              </div>
              <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[synA.level]}`}>
                {EN_LEVEL_LABEL[synA.level]} · consistency ±{synA.spread.toFixed(1)}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
                Averaged over {synA.cityCount} {synA.cityCount > 1 ? "cities" : "city"}
              </div>
            </div>
            <div className={`rounded-2xl border p-4 ${SYNTHESIS_LEVEL_BG[synB.level]}`}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                <span aria-hidden>{emojiB}</span> {b}
              </div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                {synB.global.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
              </div>
              <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[synB.level]}`}>
                {EN_LEVEL_LABEL[synB.level]} · consistency ±{synB.spread.toFixed(1)}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
                Averaged over {synB.cityCount} {synB.cityCount > 1 ? "cities" : "city"}
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{verdict}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge>{winsA} for {a}</Badge>
            <Badge>{winsB} for {b}</Badge>
            <Badge>{draws} level</Badge>
          </div>
        </Card>

        {/* Dimension-by-dimension comparison */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Dimension by dimension
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Unified scale, 10 = excellent. The delta is positive when {a} is ahead of {b}.
          Anything under 0.3 pts is treated as level.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Dimension</th>
                  <th className="px-3 py-2 text-right">{a}</th>
                  <th className="px-3 py-2 text-right">{b}</th>
                  <th className="px-3 py-2 text-right">Δ</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Ahead</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const winner = Math.abs(r.delta) < 0.3 ? "—" : r.delta > 0 ? a : b;
                  const winnerColor =
                    winner === "—" ? "text-[var(--text-tertiary)]" : "text-emerald-700";
                  return (
                    <tr key={r.key} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2">
                        <Link
                          href={r.href}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {r.label}
                        </Link>
                        <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                          {r.hint}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold tabular-nums text-[var(--text-primary)]">
                          {r.a.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold tabular-nums text-[var(--text-primary)]">
                          {r.b.toFixed(1)}
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

        <p className="mt-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
          A regional average smooths out a lot: both of these regions contain cities well
          above and well below the figure shown here. Use it to shortlist a region, then
          compare the actual towns.
        </p>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Go further</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/compare-regions/${pair}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ← Standard region comparison
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Climate, housing costs, core scores
              </div>
            </Card>
          </Link>
          <Link href={`/regions/${slugA}/synthesis`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {a} — city ranking
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Every city in the region, ranked on the 8 dimensions
              </div>
            </Card>
          </Link>
          <Link href={`/regions/${slugB}/synthesis`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {b} — city ranking
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Every city in the region, ranked on the 8 dimensions
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
