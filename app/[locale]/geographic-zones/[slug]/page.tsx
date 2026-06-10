import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGIONS, getMacroRegion } from "@/lib/macro-regions";
import { rankInMacroRegion, citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return MACRO_REGIONS.map((m) => ({ locale: "en", slug: m.slug }));
}

const EN_ZONE_NAME: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West Gascony",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Île-de-France",
};

const EN_ZONE_DESC: Record<string, string> = {
  "cote-atlantique":
    "France's western seaboard from Brittany to the Basque Country — oceanic climate, surf culture, affordable cities, and direct rail to Paris from Bordeaux and Nantes.",
  "arc-mediterraneen":
    "Sun-drenched corridor from Perpignan to Nice — 300 days of sun, warm sea, premium prices on the Côte d'Azur, and a more affordable inland belt around Montpellier and Nîmes.",
  "arc-alpin":
    "The mountain crescent east of Lyon — Annecy, Grenoble, Chambéry. Exceptional outdoor access, tech-sector density in Grenoble, and some of France's cleanest air.",
  "sud-ouest-gascon":
    "Périgord, Gers, Landes and Pays Basque — France's most food-obsessed region. Mild Atlantic climate, low density, and the best value-for-quality ratio in the country.",
  "vallee-du-rhone":
    "The spine of south-east France from Lyon to Avignon — major TGV corridor, gastronomic heartland, and a warming climate that is starting to resemble Provence.",
  "ile-de-france-elargie":
    "The Paris basin beyond the périphérique — large-suburb cities plus TGV towns under 90 min from Paris (Rouen, Reims, Orléans, Chartres, Lille).",
};

const THEMATIC_HUBS = [
  { path: "healthcare", label: "Healthcare" },
  { path: "safety", label: "Safety" },
  { path: "employment", label: "Employment" },
  { path: "environment", label: "Environment" },
  { path: "cycling", label: "Cycling" },
  { path: "overall-ranking", label: "Overall ranking" },
  { path: "quality-of-life", label: "Quality of life" },
] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const macro = getMacroRegion(slug);
  if (!macro) return {};
  const zoneName = EN_ZONE_NAME[slug] ?? macro.label;
  return {
    title: `${zoneName} — cities & quality of life 2026`,
    description: `Top cities in the ${zoneName} geographic zone by quality of life score. Browse rankings by theme: healthcare, cycling, safety, employment and more.`,
    alternates: { canonical: `${EN_BASE}/geographic-zones/${slug}` },
    openGraph: {
      title: `${zoneName} — cities & quality of life 2026`,
      description: EN_ZONE_DESC[slug] ?? macro.intro,
    },
  };
}

export default async function EnGeographicZoneSlugPage({ params }: Props) {
  const { slug } = await params;
  const macro = getMacroRegion(slug);
  if (!macro) notFound();

  const zoneName = EN_ZONE_NAME[slug] ?? macro.label;
  const zoneDesc = EN_ZONE_DESC[slug] ?? macro.intro;
  const top = rankInMacroRegion(macro, 30);
  const cityCount = citiesInMacroRegion(macro).length;
  const others = MACRO_REGIONS.filter((m) => m.slug !== slug);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Geographic zones", path: "/geographic-zones" },
    { name: zoneName, path: `/geographic-zones/${slug}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${zoneName} — top cities 2026`,
    description: zoneDesc,
    itemListElement: top.slice(0, 10).map((city, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: city.name,
      url: `${EN_BASE}/cities/${city.slug}`,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/geographic-zones" className="hover:underline">
              ← All geographic zones
            </Link>
          </Badge>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl" aria-hidden>
              {macro.emoji}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {zoneName}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">{zoneDesc}</p>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)]">
              {cityCount} cities profiled
            </span>
            <span className="rounded-full bg-[var(--bg-elevated)] border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)]">
              {macro.departments.length} departments
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-10">
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            Top {top.length} cities in {zoneName}
          </h2>
          <ol className="space-y-2">
            {top.map((city, i) => (
              <li key={city.slug}>
                <Link
                  href={`/cities/${city.slug}`}
                  className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 transition-all"
                >
                  <span className="flex items-baseline gap-3 min-w-0">
                    <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                      #{i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="font-semibold text-[var(--text-primary)] block truncate">
                        {city.name}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)] truncate">
                        {city.department} · {city.region}
                      </span>
                    </span>
                  </span>
                  <span
                    className={`font-mono-data font-bold ${scoreColor(city.scores.global)} flex-shrink-0`}
                  >
                    {city.scores.global.toFixed(1)}
                    <span className="text-xs text-[var(--text-tertiary)]"> /10</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
            Explore {zoneName} by theme
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEMATIC_HUBS.map(({ path, label }) => (
              <Link
                key={path}
                href={`/${path}/${slug}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)]/40 transition-colors text-center"
              >
                {label}
              </Link>
            ))}
          </div>
        </section>

        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Included departments
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {macro.departments.map((d) => (
              <span
                key={d}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)]"
              >
                {d}
              </span>
            ))}
          </div>
        </Card>

        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Other zones</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {others.map((m) => (
              <Link
                key={m.slug}
                href={`/geographic-zones/${m.slug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40 transition-colors"
              >
                <span className="text-xl" aria-hidden>
                  {m.emoji}
                </span>
                <span className="text-[var(--text-primary)]">
                  {EN_ZONE_NAME[m.slug] ?? m.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
