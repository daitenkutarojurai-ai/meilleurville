import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Terms of use · BestCitiesInFrance",
  description:
    "Terms of use for BestCitiesInFrance: access, resident reviews, intellectual property, liability, and the governing law.",
  alternates: {
    ...pathAlternatesEn("/cgu", "/terms"),
    languages: {
      fr: "https://www.mavilleideale.fr/cgu",
      en: `${EN_BASE}/terms`,
    },
  },
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Terms of use · BestCitiesInFrance",
    description:
      "Access, resident reviews, intellectual property, liability, governing law.",
  },
};

// English twin of app/cgu/page.tsx. Same six clauses, same substance — this is
// the same service under the same French law, so the terms cannot diverge.
// What differs is what a non-French reader needs spelled out: which law
// governs (French, and that is not negotiable by reading the site from
// abroad), what the open-data licences behind the figures allow, and that the
// scores are an editorial method rather than professional advice.
const SECTIONS = [
  {
    title: "1. Purpose",
    content: `These terms of use govern access to and use of BestCitiesInFrance (bestcitiesinfrance.com), a site that compares French cities on quality of life.

BestCitiesInFrance is the English edition of MaVilleIdéale (mavilleideale.fr). Both are published by the same person, run on the same data and the same scoring method, and are covered by the same terms.`,
  },
  {
    title: "2. Access to the service",
    content: `BestCitiesInFrance is free to anyone with an internet connection.

The service is free in full. Every feature — rankings, comparison tool, quiz, map, reviews — works without payment and without an account.

We reserve the right to suspend or remove access for any user in case of abuse.`,
  },
  {
    title: "3. Reviews and contributions",
    content: `By posting a review on BestCitiesInFrance, you confirm that:

• You have personally lived or worked in the city concerned
• Your review reflects your real, honest experience
• You do not represent a commercial interest (tourist board, property developer, competitor)
• Your review contains nothing defamatory, discriminatory or unlawful

We reserve the right to moderate or remove any review that does not meet these conditions, without notice and without compensation.

A negative review is not removed for being negative. Only spam, defamation and posts naming private individuals are taken down.`,
  },
  {
    title: "4. Intellectual property",
    content: `The editorial content of BestCitiesInFrance (guides, analysis, scores, algorithms, design) is protected by copyright.

The underlying source data is not ours and keeps its own licence: Insee, SSMSI, data.gouv.fr and OpenStreetMap are published under the French Licence Ouverte, ODbL or CC BY depending on the dataset. Reusing that raw data means complying with the licence attached to it, not with these terms.

Partial reproduction of our editorial content is allowed if you name BestCitiesInFrance explicitly and link back to the source page. Journalists and public bodies have a broader reuse right, described on the press page.`,
  },
  {
    title: "5. Limitation of liability",
    content: `The scores and rankings published on BestCitiesInFrance are indicative. They are not professional property, financial, tax or legal advice, and they do not take your personal situation into account.

We cannot be held liable for decisions taken on the basis of this information. Visit a city before deciding to move there — a score is an average over an entire commune, and you will live on one street.

Data is refreshed regularly but may contain inaccuracies. Report them through the contact form and we will correct or remove the figure.`,
  },
  {
    title: "6. Governing law",
    content: `These terms are governed by French law, and that applies wherever you read the site from. If a dispute arises, both parties undertake to seek an amicable settlement before any legal action. Failing that, the competent court is the one for the publisher's registered address.

If you are a consumer resident in the European Union, this does not deprive you of the protection of the mandatory provisions of your own country's law.`,
  },
];

export default function TermsPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Terms of use
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Last updated: 25 May 2026
          </p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                {s.title}
              </h2>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {s.content}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
          <Link href="/privacy-policy" className="text-sm text-[var(--accent)] hover:underline">
            Privacy policy →
          </Link>
          <Link href="/legal-notice" className="text-sm text-[var(--accent)] hover:underline">
            Legal notice →
          </Link>
          <Link href="/press" className="text-sm text-[var(--accent)] hover:underline">
            Press &amp; reuse →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
