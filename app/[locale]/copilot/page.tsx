import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CopilotClient } from "@/app/copilot/CopilotClient";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternatesEn } from "@/lib/i18n";
import { CITIES_COUNT } from "@/lib/site-stats";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "AI Relocation Copilot — ask anything about French cities",
  description: `Ask our AI assistant about any of ${CITIES_COUNT} French cities: rents, quality-of-life scores, taxes, transport. Personalised recommendations in seconds. Ask in English or French.`,
  alternates: pathAlternatesEn("/copilot", "/copilot"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "AI Relocation Copilot · BestCitiesInFrance",
    description: `${CITIES_COUNT} cities · 2026 data · personalised recommendations`,
  },
};

export default function EnCopilotPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "AI Copilot", path: "/copilot" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <div className="pt-16">
          <div className="mx-auto max-w-2xl px-0 sm:px-4">
            <div className="sm:rounded-2xl sm:border sm:border-[var(--border)] overflow-hidden bg-[var(--bg-canvas)] shadow-lg">
              <CopilotClient locale="en" citiesCount={CITIES_COUNT} />
            </div>
          </div>
        </div>
        <div className="sm:hidden">
          <Footer />
        </div>
      </main>
    </>
  );
}
