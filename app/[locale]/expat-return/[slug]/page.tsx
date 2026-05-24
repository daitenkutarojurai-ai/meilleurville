import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { getExpatCountry } from "@/lib/expat-return";
import { CITIES_SEED } from "@/data/cities-seed";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return [
    { locale: "en", slug: "from-suisse" },
    { locale: "en", slug: "from-luxembourg" },
    { locale: "en", slug: "from-belgique" },
    { locale: "en", slug: "from-royaume-uni" },
    { locale: "en", slug: "from-canada" },
  ];
}

// ─── EN country names ────────────────────────────────────────────────────────

const EN_COUNTRY_NAME: Record<string, string> = {
  suisse: "Switzerland",
  luxembourg: "Luxembourg",
  belgique: "Belgium",
  "royaume-uni": "United Kingdom",
  canada: "Canada",
};

// ─── EN intro copy ────────────────────────────────────────────────────────────

const EN_COUNTRY_INTRO: Record<string, string> = {
  suisse:
    "Returning from Switzerland is probably the biggest income shock: high gross salaries and light taxation vs the French system's heavy charges. Border cities (Annecy, Annemasse, Thonon) remain attractive as they let you keep your Swiss job. Otherwise, target a secondary French metro with a cost of living well below Geneva or Zurich.",
  luxembourg:
    "Returning from Luxembourg has no currency shock, but the salary gap is real: Luxembourg's effective income tax sits around 15% vs 25-35% in France. Many French nationals stay cross-border workers, anchored in Metz, Thionville, or Longwy on the French side.",
  belgique:
    "Returning from Belgium is the least financially painful: same currency, comparable net salaries (Belgium pays less gross but charges are close to France). The real adjustment is administrative — Belgian public services are often faster and simpler. Expect a noticeable slowdown after the move.",
  "royaume-uni":
    "Returning from the UK post-Brexit is now a full administrative process. London salaries, once converted to euros and adjusted for French cost of living, remain comfortable outside Paris. Lille (Eurostar) and Rennes (good TGV access) are natural transition cities.",
  canada:
    "Returning from Canada (most often Québec) is less financially brutal than from Switzerland, but the tax gap is real: the Canadian system is simpler with fewer deductions, while France's is multi-layered. The upside: recovering France's comprehensive public healthcare and social safety net after years of private Canadian coverage.",
};

// ─── EN currency notes ───────────────────────────────────────────────────────

const EN_CURRENCY_NOTE: Record<string, string | null> = {
  suisse:
    "Exchange rate reference: 1 CHF ≈ €1.07 (January 2026). When converting a Swiss salary to euros, also account for purchasing-power parity — a net salary in CHF buys significantly more in Switzerland than in France.",
  luxembourg: null,
  belgique: null,
  "royaume-uni":
    "Exchange rate reference: 1 GBP ≈ €1.18 (January 2026). The EUR/GBP rate has been volatile since Brexit — do not plan on the pre-Brexit €1.40 rate. Budget conservatively at €1.15.",
  canada:
    "Exchange rate reference: 1 CAD ≈ €0.68 (January 2026). On a gross basis, a CAD salary converts to euros at a significant haircut. Offset this with France's substantially lower tax burden on modest-to-middle incomes.",
};

// ─── EN 'what you had vs what you'll have' tables ────────────────────────────

interface Comparison {
  topic: string;
  had: string;
  willHave: string;
}

const EN_HAD_VS_WILL_HAVE: Record<string, Comparison[]> = {
  suisse: [
    {
      topic: "Net salary",
      had: "100 CHF net",
      willHave: "~€55 purchasing power equivalent (provincial metro)",
    },
    {
      topic: "T3 rent",
      had: "CHF 2,800–4,000 (Geneva / Lausanne)",
      willHave: "€1,100–1,800 (Annecy / Lyon / Grenoble)",
    },
    {
      topic: "Healthcare",
      had: "LAMal insurance CHF 350–500/month",
      willHave: "Sécu + top-up health €80–200/month",
    },
    {
      topic: "Income tax",
      had: "12–25% effective",
      willHave: "20–35% effective (income tax + CSG + social charges)",
    },
    { topic: "Car", had: "Diesel at CHF 1.60/L", willHave: "Diesel at €1.65/L" },
    {
      topic: "Childcare",
      had: "Nursery CHF 1,800–3,000/month",
      willHave: "€0–450/month after CAF/CMG subsidies",
    },
  ],
  luxembourg: [
    {
      topic: "Net salary",
      had: "€5,000 net (senior manager LU)",
      willHave: "€3,200 net equivalent in France after charges",
    },
    {
      topic: "T3 rent",
      had: "€1,800–2,500 in Luxembourg City",
      willHave: "€700–1,100 in Metz / Nancy",
    },
    { topic: "VAT", had: "16–17% (consumer advantage)", willHave: "20% standard FR" },
    { topic: "Fuel", had: "€1.40–1.50/L", willHave: "€1.65–1.85/L" },
    {
      topic: "Income tax",
      had: "~15% effective (single)",
      willHave: "25–35% effective",
    },
  ],
  belgique: [
    {
      topic: "Net salary",
      had: "€2,800 net (manager Brussels)",
      willHave: "€2,600–2,900 net equivalent in France",
    },
    {
      topic: "T3 rent",
      had: "€1,100–1,600 in Brussels / Antwerp",
      willHave: "€650–1,100 in Lille / Reims / Amiens",
    },
    {
      topic: "Healthcare",
      had: "Health insurance + low co-pay",
      willHave: "Sécu + top-up (expect slower reimbursements)",
    },
    {
      topic: "Childcare",
      had: "Subsidised nursery (~€500)",
      willHave: "Nursery €150–400/month after CAF, or childminder €1,000 before subsidies",
    },
    {
      topic: "Income tax",
      had: "~30–35% effective",
      willHave: "~25–32% effective",
    },
  ],
  "royaume-uni": [
    {
      topic: "Net salary",
      had: "£45,000 gross (manager London)",
      willHave: "€3,500–4,500 net equivalent (Paris or Lyon)",
    },
    {
      topic: "T3 rent",
      had: "£1,800–2,800/month (London)",
      willHave:
        "€900–1,400 in Paris / €700–1,100 in Lyon, Rennes, Lille",
    },
    {
      topic: "Healthcare",
      had: "NHS (free at point of use)",
      willHave: "Sécu + top-up €80–200/month (excellent coverage)",
    },
    {
      topic: "Income tax",
      had: "20–40% + NI contributions",
      willHave: "20–35% effective (income tax + CSG)",
    },
    {
      topic: "Pension",
      had: "NEST / workplace pension",
      willHave:
        "French AGIRC-ARRCO mandatory pension (transferable from UK after 10 years)",
    },
    {
      topic: "Post-Brexit status",
      had: "EU right of movement removed",
      willHave: "French citizenship or titre de séjour required if not already French",
    },
  ],
  canada: [
    {
      topic: "Net salary",
      had: "CAD 5,000/month gross (engineer Québec)",
      willHave: "€2,800–3,500 net equivalent in France",
    },
    {
      topic: "T3 rent",
      had: "CAD 1,400–2,200 (Montréal)",
      willHave: "€700–1,100 in Bordeaux / Nantes / Rennes",
    },
    {
      topic: "Healthcare",
      had: "Provincial RAMQ (Québec) — free, with wait times",
      willHave: "Sécu + top-up €80–200/month — better specialist access",
    },
    {
      topic: "Income tax",
      had: "~25–32% effective (QC)",
      willHave: "25–38% effective — more complex but many deductions",
    },
    {
      topic: "Childcare",
      had: "CAD 10/day subsidised (CPE Québec)",
      willHave: "€150–400/month after CAF — comparable post-subsidies",
    },
    {
      topic: "RRSP / pension",
      had: "RRSP + QPP contributions",
      willHave:
        "French AGIRC-ARRCO (new contributions); RRSP can remain in Canada",
    },
  ],
};

// ─── EN admin steps ───────────────────────────────────────────────────────────

interface AdminStep {
  step: string;
  detail: string;
  officialUrl?: string;
}

const EN_ADMIN_STEPS: Record<string, AdminStep[]> = {
  suisse: [
    {
      step: "Deregister from consular registry",
      detail:
        "Notify the French consulate before leaving; request a radiation certificate.",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/R43251",
    },
    {
      step: "Social security",
      detail:
        "Transfer S1 form if staying cross-border, otherwise open a CPAM file on arrival (registration + 3 months of Swiss employment certificate).",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824",
    },
    {
      step: "Tax",
      detail:
        "Split-year return for the year of return. Keep Swiss bank account for one year (CFE + 3169 Bis for residual Swiss income).",
    },
    {
      step: "Driving licence",
      detail:
        "Swiss licence exchangeable for a French one within 12 months of return, otherwise must be retaken.",
    },
    {
      step: "Children's schooling",
      detail:
        "Register at the town hall + CAF application. School equivalences from Swiss system usually straightforward into public collège.",
    },
  ],
  luxembourg: [
    {
      step: "Cross-border or full return",
      detail:
        "If keeping LU job: cross-border status is valid as long as ≥75% of income comes from LU and your country of residence changes (declaration on both sides).",
    },
    {
      step: "Social security",
      detail:
        "Keep CNS (LU health insurance) if cross-border + open S1 with CPAM for French coverage.",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824",
    },
    {
      step: "Income tax",
      detail:
        "LU-FR tax treaty: taxed in LU, informative declaration in FR + CSG correction on non-salaried income.",
    },
    {
      step: "Driving licence",
      detail: "Luxembourg licence recognised in France with no exchange required.",
    },
    {
      step: "Banking",
      detail:
        "Keep LU account for one year (family allowances, end-of-year bonuses). Open French RIB before the school year starts.",
    },
  ],
  belgique: [
    {
      step: "Social security",
      detail:
        "Request S1 form to transfer health coverage. Allow 3–6 weeks for French activation.",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824",
    },
    {
      step: "Income tax",
      detail:
        "Split-year return: Belgian income declared in Belgium, French income from day of return declared in France.",
    },
    {
      step: "Driving licence",
      detail: "Belgian licence recognised in France with no exchange required.",
    },
    {
      step: "Banking",
      detail:
        "Belgian and French banking are close. Inform Belgian bank of address change; no tax withholding issue for current accounts.",
    },
    {
      step: "Children's schooling",
      detail:
        "Register at the town hall + CAF application; ONEM unemployment entitlements are NOT transferable to France (check Pôle Emploi eligibility separately).",
    },
  ],
  "royaume-uni": [
    {
      step: "Visa / residency status",
      detail:
        "UK nationals who are not French citizens need a long-stay visa (visa de long séjour) if staying >90 days. Apply at the French consulate in the UK before departure.",
      officialUrl: "https://france-visas.gouv.fr",
    },
    {
      step: "Social security",
      detail:
        "Register with CPAM on arrival. Bring P45 (employment termination certificate) and last 3 payslips. Allow 6 weeks.",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824",
    },
    {
      step: "Driving licence",
      detail:
        "UK licence valid in France for 12 months, then must be exchanged (no test required but administrative process). Start early: processing takes 6–8 months.",
    },
    {
      step: "Banking",
      detail:
        "French banks require proof of French address. Open a Nickel or N26 account immediately on arrival; switch to a traditional bank once you have a French address document (quittance de loyer).",
    },
    {
      step: "Pension portability",
      detail:
        "UK state pension and NEST contributions are not automatically portable. Get a personalised statement from HMRC before leaving; a pension transfer specialist can advise on whether to transfer or leave in the UK.",
    },
  ],
  canada: [
    {
      step: "Social security (CPAM)",
      detail:
        "Register within 3 months of arrival. Bring health insurance certificate from RAMQ or your Canadian insurer to cover the transition period.",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32824",
    },
    {
      step: "Income tax",
      detail:
        "The year of return is split: Canadian income declared in Canada (T1 final return), French income from day of arrival declared in France. Canada-France tax treaty prevents double taxation but requires careful calculation.",
    },
    {
      step: "Driving licence",
      detail:
        "Quebec and most Canadian provinces have reciprocal agreements with France: exchange within 6 months of arrival (no test required).",
      officialUrl: "https://www.service-public.gouv.fr/particuliers/vosdroits/F2209",
    },
    {
      step: "Children's schooling",
      detail:
        "Register at the town hall on arrival. French public school is free; international sections (EMILE bilingual) are available in many larger cities.",
    },
    {
      step: "RRSP / banking",
      detail:
        "RRSP can remain in Canada; no French tax liability as long as it stays invested. You must declare it on form 3916-bis (foreign accounts). Open a French bank account before arrival if possible (Société Générale or BNP have Canada-France account-opening services).",
    },
  ],
};

// ─── EN warnings ─────────────────────────────────────────────────────────────

const EN_WARNINGS: Record<string, string[]> = {
  suisse: [
    "The salary shock is real: Swiss gross salaries are 60–80% higher than French equivalents in the same sector. Budget carefully before assuming your French quality of life will be equivalent.",
    "If keeping a Swiss job as a cross-border worker: check that your new French commune is within the official cross-border zone (no more than 20 km from the Swiss border for Geneva canton).",
    "LAMal → Sécu transition: there is a mandatory 3-month gap period. Keep private CH coverage active until your Carte Vitale arrives.",
  ],
  luxembourg: [
    "The net salary gap between Luxembourg and equivalent French jobs is real and persistent: budget for a 20–35% drop in purchasing power after tax.",
    "Cross-border status is not automatic: your new French home must be in a department within the official cross-border zone (Moselle 57, Meurthe-et-Moselle 54, Meuse 55).",
  ],
  belgique: [
    "Belgian administrative processes are often faster than French ones (healthcare, housing). Expect a noticeable slowdown after the move, particularly with CPAM.",
    "Belgian unemployment (ONEM) is not portable to France. If you are between jobs, check Pôle Emploi eligibility before leaving.",
  ],
  "royaume-uni": [
    "Post-Brexit: UK nationals are no longer EU citizens in France. A titre de séjour is required after 90 days. The process takes 3–6 months — start immediately on arrival.",
    "NHS vs French healthcare: France's system is arguably better for specialist access, but requires active management (finding a médecin traitant first, then referrals). Don't assume walk-in access.",
    "UK pension contributions made before returning to France are not lost, but require active paperwork to preserve or transfer. Do this before leaving the UK.",
  ],
  canada: [
    "The healthcare transition gap: between leaving Québec's RAMQ and activating your CPAM coverage, you'll have no public insurance. Take out private travel insurance for this period (1–3 months).",
    "The tax complexity is real: the year of return requires two country declarations and often a bilateral correction. Use a bilingual (French-Canadian) accountant.",
    "Québec French vs Metropolitan French: the adjustment is real but fast. Professional context may feel more formal; written French registration forms are straightforward.",
  ],
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const countryKey = slug.replace(/^from-/, "");
  const country = getExpatCountry(countryKey);
  if (!country) return {};

  const name = EN_COUNTRY_NAME[countryKey] ?? country.name;
  return {
    title: `Moving back to France from ${name} — 2026 guide`,
    description: `Salary, tax, healthcare, admin steps: everything that changes when you return to France from ${name}. Practical per-country guide with city suggestions.`,
    alternates: { canonical: `${EN_BASE}/expat-return/from-${countryKey}` },
    openGraph: {
      title: `Returning to France from ${name} — practical guide 2026`,
      description: `What changes when you move back: purchasing power, healthcare, tax year split, driving licence exchange, and the best French cities to land in.`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function EnExpatReturnCountryPage({ params }: Props) {
  const { slug } = await params;
  const countryKey = slug.replace(/^from-/, "");
  const country = getExpatCountry(countryKey);
  if (!country) notFound();

  const name = EN_COUNTRY_NAME[countryKey] ?? country.name;
  const intro = EN_COUNTRY_INTRO[countryKey] ?? country.intro;
  const currencyNote = EN_CURRENCY_NOTE[countryKey] ?? null;
  const comparisons = EN_HAD_VS_WILL_HAVE[countryKey] ?? country.hadVsWillHave;
  const adminSteps = EN_ADMIN_STEPS[countryKey] ?? country.adminPriorities;
  const warnings = EN_WARNINGS[countryKey] ?? country.warnings;

  const bestCities = country.bestSuitedCities
    .map((s) => CITIES_SEED.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Moving back to France", path: "/expat-return" },
    { name: `From ${name}`, path: `/expat-return/from-${countryKey}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="mb-5 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)]">
              Home
            </Link>
            {" · "}
            <Link href="/expat-return" className="hover:text-[var(--accent)]">
              Moving back to France
            </Link>
            {" · "}
            <span>From {name}</span>
          </nav>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl" aria-hidden>
              {country.flag}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight leading-tight">
              Moving back to France from {name}
            </h1>
          </div>

          <p className="text-[var(--text-secondary)] text-base leading-relaxed max-w-3xl">
            {intro}
          </p>

          {currencyNote && (
            <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-900 leading-relaxed">
              {currencyNote}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 pb-16 space-y-10">

        {/* What you had vs what you'll have */}
        <section>
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            What you had vs what you&apos;ll have
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-canvas)]">
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] w-1/4">
                    Topic
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] w-[37.5%]">
                    In {name}
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-[var(--text-secondary)] w-[37.5%]">
                    In France
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {comparisons.map((row, i) => (
                  <tr
                    key={i}
                    className="bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      {row.topic}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{row.had}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{row.willHave}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Best French cities */}
        {bestCities.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Best French cities for people returning from {name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {bestCities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/cities/${city.slug}`}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 flex items-center justify-between transition-all hover:border-[var(--accent)]/40 hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{city.name}</p>
                    {city.region && (
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">{city.region}</p>
                    )}
                  </div>
                  <span
                    className={`font-mono-data font-bold text-xl ${scoreColor(city.scores.global)}`}
                    aria-label={`Quality-of-life score ${city.scores.global.toFixed(1)} out of 10`}
                  >
                    {city.scores.global.toFixed(1)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Key admin steps */}
        <section>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Key admin steps — returning from {name}
            </h2>
            <ol className="space-y-5">
              {adminSteps.map((item, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-mono-data text-[var(--accent)] font-bold text-base shrink-0 pt-0.5">
                    {i + 1}.
                  </span>
                  <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)] block mb-0.5">
                      {item.step}
                    </strong>
                    {item.detail}
                    {item.officialUrl && (
                      <>
                        {" "}
                        <a
                          href={item.officialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--accent)] underline hover:opacity-80"
                        >
                          Official reference →
                        </a>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Warnings */}
        {warnings.length > 0 && (
          <section>
            <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-6 space-y-3">
              <h2 className="text-base font-bold text-orange-900 flex items-center gap-2">
                <span aria-hidden>⚠️</span> Watch out for these
              </h2>
              <ul className="space-y-3">
                {warnings.map((w, i) => (
                  <li
                    key={i}
                    className="text-sm text-orange-900 leading-relaxed flex gap-2"
                  >
                    <span
                      className="inline-block mt-1.5 h-1.5 w-1.5 rounded-full bg-orange-500 shrink-0"
                      aria-hidden
                    />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Quiz CTA */}
        <section>
          <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-4xl" aria-hidden>
                ✨
              </span>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">
                  Not sure which French city suits your return profile?
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Take the 5-minute compatibility quiz — it matches your lifestyle,
                  budget, and work situation against all 540 cities.
                </p>
              </div>
              <Link
                href="/quiz/compatibility"
                className="rounded-full bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold whitespace-nowrap shadow-sm hover:opacity-90"
              >
                Take the quiz →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer disclaimer */}
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
          Indicative figures (exchange rates January 2026, median values). This guide is
          advisory and does not replace advice from a bilingual tax accountant or the
          relevant consulate.
        </p>

        {/* Back link */}
        <div>
          <Link
            href="/expat-return"
            className="text-sm text-[var(--accent)] underline hover:opacity-80"
          >
            ← All countries — Moving back to France
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
