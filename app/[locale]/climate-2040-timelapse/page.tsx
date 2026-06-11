import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { TimelapseClient } from "@/app/climat-2040-timelapse/TimelapseClient";
import { CITIES_LIGHT_METRO } from "@/lib/cities-light";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "Climate 2040 Timelapse — France warming year by year | BestCitiesInFrance",
  description:
    "Scrub from 2026 to 2040 and watch France warm in real time. ARPEGE/IPCC-interpolated projection by macro-region, across 352 cities.",
  alternates: { canonical: `${EN_BASE}/climate-2040-timelapse` },
  openGraph: {
    title: "Climate 2040 Timelapse · BestCitiesInFrance",
    description: "France year by year, 2026 → 2040. Not a forecast — a projection.",
  },
};

export default function EnClimate2040TimelapsePage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Climate 2040 Timelapse", path: "/climate-2040-timelapse" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Climate visualisation</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Climate 2040 Timelapse
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Scrub the timeline from 2026 to 2040 and watch France warm city by city.
            Projection based on ARPEGE / IPCC macro-regional data — not a forecast,
            a plausible trajectory. The South heats up, the coast faces more
            extreme summers, and some surprising northern cities hold up well.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <TimelapseClient locale="en" cities={CITIES_LIGHT_METRO} />
      </div>

      <Footer />
    </main>
  );
}
