import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { PeopleLikeYouClient } from "@/app/people-like-you/PeopleLikeYouClient";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "People Like You — where profiles like yours are moving | BestCitiesInFrance",
  description:
    "11 lifestyle personas × 50 major French cities: see where people like you (family, freelance, retiree…) gain the most by relocating from your current city.",
  alternates: { canonical: `${EN_BASE}/people-like-you` },
  openGraph: {
    title: "People Like You · BestCitiesInFrance",
    description: "Your persona × your origin city → top relocation destinations.",
  },
};

export default function EnPeopleLikeYouPage() {
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "People Like You", path: "/people-like-you" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Personas</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            Where people like you are moving
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Select your lifestyle profile and current city: we calculate where
            people sharing your priorities — budget, family, remote work,
            retirement — tend to gain the most by relocating.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <PeopleLikeYouClient locale="en" />
      </div>

      <Footer />
    </main>
  );
}
