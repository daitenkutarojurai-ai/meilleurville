import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EXPAT_COUNTRIES } from "@/lib/expat-return";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Moving back to France as an expat 2026 · Practical guide",
  description:
    "Returning to France from Switzerland, Luxembourg, Belgium, UK or Canada? Salary / cost of living / tax / admin comparison by country + quiz + city suggestions.",
  alternates: { canonical: `${EN_BASE}/expat-return` },
};

const EN_COUNTRY_NAME: Record<string, string> = {
  suisse: "Switzerland",
  luxembourg: "Luxembourg",
  belgique: "Belgium",
  "royaume-uni": "United Kingdom",
  canada: "Canada",
};

const EN_COUNTRY_INTRO: Record<string, string> = {
  suisse:
    "Returning from Switzerland is probably the biggest income shock: high gross salaries and low taxation vs the French system's heavy charges. Border cities (Annecy, Annemasse, Thonon) remain attractive as they let you keep your Swiss job. Otherwise, target a secondary French city with a cost of living well below Geneva or Zurich.",
  luxembourg:
    "Returning from Luxembourg has no currency shock, but the salary gap remains real: Luxembourg's effective income tax sits around 15% vs 25-35% in France. Many French nationals stay cross-border workers: Metz, Thionville, and Longwy are the most practical French anchors.",
  belgique:
    "Returning from Belgium is the least painful financially: same currency, comparable net salaries (Belgium pays less gross but charges are close to the French system). The real issue: Belgian public administration is often smoother (faster healthcare, simpler health insurance) — expect an adjustment.",
  "royaume-uni":
    "Returning from the UK post-Brexit is now a full administrative process. London salaries, once converted to euros and adjusted for French cost of living, remain comfortable outside Paris. Lille (Eurostar) and Rennes (TGV-accessible) are good compromises for maintaining a UK foothold during the transition.",
  canada:
    "Returning from Canada (most often Québec) is less difficult financially than Switzerland, but the tax gap is real: the Canadian system is simpler with fewer deductions vs France's multi-layer system. Upside: recovering France's social safety net after years of private Canadian coverage.",
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Moving back to France", path: "/expat-return" },
]);

export default function EnExpatReturnPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            ✈️ Expat return
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            Moving back to France after living abroad
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            Salaries, taxes, healthcare, admin: what really changes when you return from
            Switzerland, Luxembourg, Belgium, the UK, or Canada. Plus a quiz to find the
            right French city for your situation.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 space-y-10">
        {/* Countries grid */}
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Choose your country of origin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXPAT_COUNTRIES.map((country) => (
              <Link
                key={country.slug}
                href={`/expat-return/from-${country.slug}`}
                className="block"
              >
                <Card className="hover:border-[var(--accent)]/40 transition-colors cursor-pointer h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl" aria-hidden>
                      {country.flag}
                    </span>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      From {EN_COUNTRY_NAME[country.slug] ?? country.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-3">
                    {(EN_COUNTRY_INTRO[country.slug] ?? country.intro).slice(0, 160)}…
                  </p>
                  <p className="text-xs text-[var(--accent)] mt-3 underline">
                    Read the full guide →
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quiz CTA */}
        <Card>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="text-4xl" aria-hidden>
              ✨
            </span>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                Not sure which French city suits you?
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">
                The compatibility quiz (5 minutes) matches your profile against all{" "}
                {CITIES_COUNT} cities and weights the results for your return context.
              </p>
            </div>
            <Link
              href="/quiz/compatibility"
              className="rounded-full bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold whitespace-nowrap shadow-sm hover:opacity-90"
            >
              Take the quiz →
            </Link>
          </div>
        </Card>

        {/* Admin guide */}
        <Card>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Moving back to France — the 5 essential admin steps
          </h2>
          <ol className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">1.</span>
              <div>
                <strong className="text-[var(--text-primary)]">
                  Deregister from the consular registry
                </strong>{" "}
                — before leaving, notify the French consulate of your end of foreign
                residence via{" "}
                <a
                  href="https://www.service-public.gouv.fr/particuliers/vosdroits/R43251"
                  className="underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  service-public.fr
                </a>
                .
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">2.</span>
              <div>
                <strong className="text-[var(--text-primary)]">
                  Social security (S1 form or CPAM registration)
                </strong>{" "}
                — allow 3-6 weeks for activation. Keep your previous health coverage
                active until French cover kicks in.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">3.</span>
              <div>
                <strong className="text-[var(--text-primary)]">
                  Tax (French declaration + final return in country of origin)
                </strong>{" "}
                — the year of return is split between two tax systems. Get advice
                from a bilingual tax accountant.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">4.</span>
              <div>
                <strong className="text-[var(--text-primary)]">Driving licence</strong>{" "}
                — country-specific exchange rules apply (see country guide). Up to
                12 months to exchange a CH / UK / CA licence.
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-mono-data text-[var(--accent)] font-bold">5.</span>
              <div>
                <strong className="text-[var(--text-primary)]">
                  Children's schooling + CAF family allowances
                </strong>{" "}
                — register at the town hall and file a CAF dossier on arrival
                (backdated 3 months).
              </div>
            </li>
          </ol>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            This guide is advisory and does not replace advice from a tax accountant or
            consulate. Official links are provided in each country guide.
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
