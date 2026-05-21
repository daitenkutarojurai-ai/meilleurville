import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGIONS, citiesInMacroRegion } from "@/lib/macro-regions";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "French geographic zones 2026 · Atlantic coast, Mediterranean arc, Alps and more",
  description:
    "6 thematic zones that match real relocation projects: Atlantic coast, Mediterranean arc, Alpine arc, South-West, Rhône Valley, Greater Paris. Beyond administrative regions.",
  alternates: { canonical: `${EN_BASE}/geographic-zones` },
};

const EN_ZONE_NAME: Record<string, string> = {
  "cote-atlantique": "Atlantic Coast",
  "arc-mediterraneen": "Mediterranean Arc",
  "arc-alpin": "Alpine Arc",
  "sud-ouest-gascon": "South-West (Gascony)",
  "vallee-du-rhone": "Rhône Valley",
  "ile-de-france-elargie": "Greater Paris area",
};

const EN_ZONE_INTRO: Record<string, string> = {
  "cote-atlantique":
    "France's Atlantic coastline stretches 2,700 km from Brest to the Spanish border. Oceanic climate: mild winters, temperate summers, dominant westerly winds. Brings together coastal cities of Brittany, Pays de la Loire, and Nouvelle-Aquitaine. Shared vibe: maritime, surf and sailing nearby, seafood, but prices have climbed sharply since 2020.",
  "arc-mediterraneen":
    "The Mediterranean arc from Perpignan to Menton plus Corsica. 295+ sunny days a year, genuinely hot summers (40°C increasingly common), sea close at hand. Premium prices on the Côte d'Azur, more accessible in Occitanie. Massive tourism in July-August: factor this into your relocation plan.",
  "arc-alpin":
    "France's Alpine arc from the Swiss border to Nice. Lakes (Annecy, Léman, Bourget), skiing in winter, hiking in summer, and a tech cluster in Grenoble. Continental climate softened by altitude. Premium prices in showpiece cities (especially Annecy), more affordable in less-exposed valleys.",
  "sud-ouest-gascon":
    "The South-West: Pays Basque, Béarn, Dordogne, Lot — duck gastronomy, rugby, surf, and the Pyrenees within reach. Mild Atlantic climate. Strong regional identity. Affordable inland, pricier on the Basque coast (Biarritz, Bayonne).",
  "vallee-du-rhone":
    "The Rhône Valley: the TGV axis running from Lyon to the Mediterranean. Continental climate turning increasingly Mediterranean (hotter summers). World-class gastronomy. Exceptional connectivity — Paris, Marseille, Geneva, and the Alps all within 2 hours.",
  "ile-de-france-elargie":
    "Greater Paris: the outer suburbs PLUS TGV cities reachable from Paris in under 1h30. For those who want to keep one foot in Paris (work, family) without paying Parisian prices: Rouen, Reims, Orléans, Lille, Chartres. A common post-COVID compromise.",
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Geographic zones", path: "/geographic-zones" },
]);

export default function EnGeographicZonesPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            🗺️ Geographic zones
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Beyond administrative regions
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            6 thematic zones that match real relocation projects: the Atlantic coast, the
            Mediterranean arc, the Alpine arc, the South-West, the Rhône Valley, and Greater Paris.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => {
            const count = citiesInMacroRegion(m).length;
            const enName = EN_ZONE_NAME[m.slug] ?? m.label;
            const enIntro = EN_ZONE_INTRO[m.slug] ?? m.intro;
            return (
              <Link key={m.slug} href={`/regions`} className="block">
                <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors h-full">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl" aria-hidden>
                      {m.emoji}
                    </span>
                    <h2 className="text-base font-bold text-[var(--text-primary)]">{enName}</h2>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3 mb-2">
                    {enIntro.slice(0, 160)}…
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {count} cities profiled · {m.departments.length} departments
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card>
          <p className="text-sm text-[var(--text-secondary)]">
            See also:{" "}
            <Link href="/regions" className="underline text-[var(--accent)]">
              administrative regions
            </Link>{" "}
            ·{" "}
            <Link href="/compare-regions" className="underline text-[var(--accent)]">
              compare 2 regions
            </Link>{" "}
            ·{" "}
            <Link href="/departments" className="underline text-[var(--accent)]">
              all departments
            </Link>
            .
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
