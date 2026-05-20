import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Legal notice · BestCitiesInFrance",
  description:
    "Publisher details, hosting provider, affiliate disclosure and contact information for BestCitiesInFrance.",
  alternates: {
    canonical: `${EN_BASE}/legal-notice`,
    languages: {
      fr: "https://www.mavilleideale.fr/mentions-legales",
      en: `${EN_BASE}/legal-notice`,
    },
  },
};

export default function LegalNoticePage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Legal notice
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Published in compliance with the French Act for Confidence in the
            Digital Economy (Loi pour la Confiance dans l&apos;Économie
            Numérique, LCEN, n°2004-575 of 21 June 2004, articles 6-III-1 and
            6-III-2).
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Last updated: 19 May 2026.
          </p>
        </div>

        <div className="space-y-8 text-sm text-[var(--text-secondary)] leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Publisher
            </h2>
            <p>
              <strong className="text-[var(--text-primary)]">
                Thomas Fendrich
              </strong>{" "}
              — Sole trader (Entrepreneur individuel under French law)
              <br />
              Val-d&apos;Oise (95), France
              <br />
              SIREN: 797 983 665 · SIRET: 797 983 665 00028
              <br />
              EU VAT number: FR28797983665
              <br />
              Registered in the French National Business Register (RNE) since
              31 October 2013. Not registered with the Trade and Companies
              Register (RCS).
              <br />
              Contact: hello@mavilleideale.fr · GDPR requests:
              privacy@mavilleideale.fr
            </p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              The registered business address is publicly accessible via the
              official French business registers (data.inpi.fr and
              annuaire-entreprises.data.gouv.fr) using the SIREN above, in
              accordance with the statutory publicity requirements applicable
              to sole traders.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Publication director
            </h2>
            <p>Thomas Fendrich.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Hosting provider
            </h2>
            <p>
              Vercel Inc.
              <br />
              340 S Lemon Ave #4133
              <br />
              Walnut, CA 91789, United States
              <br />
              Phone: +1 (559) 288-7060
              <br />
              Website: vercel.com
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Domain names
            </h2>
            <p>
              bestcitiesinfrance.com (English version) and mavilleideale.fr
              (French version). Both domains are operated by the same
              publisher and hosted on the same infrastructure.
            </p>
          </div>

          <div id="affiliate-disclosure">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Affiliate disclosure
            </h2>
            <p>
              BestCitiesInFrance is a member of the Booking.com Partners
              programme. Some outbound links to Booking.com on this website
              are affiliate links. If you book accommodation after clicking
              such a link, the publisher may receive a commission from
              Booking — at no additional cost to you, and with no impact on
              the rates displayed.
            </p>
            <p className="mt-2">
              All affiliate links are clearly labelled as &ldquo;partner
              link&rdquo; and carry the HTML{" "}
              <code className="font-mono text-xs">rel=&quot;sponsored&quot;</code>{" "}
              attribute, in line with the FTC&apos;s endorsement guides, the
              EU Unfair Commercial Practices Directive and the recommendations
              of the French consumer authority (DGCCRF).
            </p>
            <p className="mt-2">
              Editorial content — scores, rankings, reviews — is fully
              independent from any affiliate relationship. No city, no
              accommodation and no brand pays to appear or to rank higher.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Intellectual property
            </h2>
            <p>
              All content on BestCitiesInFrance (text, analyses, design,
              algorithms, source code) is protected by French copyright law.
              Reproduction without express prior authorisation is prohibited.
            </p>
            <p className="mt-2">
              Underlying source datasets (Insee, data.gouv.fr, OpenStreetMap,
              Météo-France, French Ministry of the Interior) are governed by
              their respective licences — primarily the Etalab Open Licence
              v2.0 and the Open Database Licence (ODbL) for OpenStreetMap.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Technical credits
            </h2>
            <p>
              The site is built with Next.js (Vercel), Tailwind CSS, and uses
              the Open-Meteo public weather API alongside open datasets from
              Insee and data.gouv.fr.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Reporting illegal content
            </h2>
            <p>
              In accordance with article 6-I-5 of the LCEN, any content
              deemed illegal can be reported to hello@mavilleideale.fr. The
              notification must include the date, the identity of the
              reporting party, a precise description of the content, and the
              legal grounds for its removal.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Governing law and disputes
            </h2>
            <p>
              These legal terms are governed by French law. In the event of a
              dispute, the parties shall first seek an amicable resolution.
              Failing that, French courts shall have exclusive jurisdiction.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
          <Link
            href="/privacy-policy"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Privacy policy →
          </Link>
          <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
            Home →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
