import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ORIGIN_SLUGS, getOriginCity } from "@/lib/city-commute";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Weekend getaways from your city · Destinations by travel time 2026",
  description:
    "Pick your departure city and see every French destination ranked by travel time. Ideal for planning a weekend or a short break.",
  alternates: { canonical: `${EN_BASE}/weekend-getaways` },
  openGraph: {
    title: "Weekend getaways from your city · France 2026",
    description:
      "26 major French cities, every destination within 5 hours. SNCF estimates + local access.",
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Weekend getaways", path: "/weekend-getaways" },
]);

export default function EnWeekendGetawaysIndexPage() {
  const origins = ORIGIN_SLUGS.map((slug) => getOriginCity(slug)).filter(Boolean);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-1">›</span>
          <span>Weekend getaways</span>
        </nav>

        <div className="flex flex-wrap items-baseline gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Where to go for a weekend from your city
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Pick your departure city. For each destination we estimate the fastest travel time
          (direct TGV, via Paris, or road). Every French city, ranked by proximity.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>26 departure cities</Badge>
          <Badge>540 destinations</Badge>
          <Badge>SNCF estimates + local access</Badge>
        </div>

        <div className="mt-8">
          <Link href="/from-paris" className="block mb-3">
            <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🗼</span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">Paris</p>
                    <p className="text-xs text-[var(--text-secondary)]">Île-de-France</p>
                  </div>
                </div>
                <span className="text-xs text-[var(--accent)] underline">See destinations →</span>
              </div>
            </Card>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {origins.map((city) => {
              if (!city) return null;
              return (
                <Link key={city.slug} href={`/weekend-getaways/${city.slug}`} className="block">
                  <Card className="hover:border-[var(--accent)]/40 cursor-pointer transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-[var(--text-primary)]">{city.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{city.region ?? "—"}</p>
                      </div>
                      <span className="text-xs text-[var(--accent)] underline">See →</span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <p className="mt-8 text-xs text-[var(--text-tertiary)]">
          Travel times are estimates based on published SNCF schedules (oui.sncf, June 2025) for the
          main stations, plus a local-access heuristic (0.5 min/km) for intermediate cities. Modes
          considered: direct TGV, via Paris, or car — whichever is fastest.
        </p>
      </section>

      <Footer />
    </main>
  );
}
