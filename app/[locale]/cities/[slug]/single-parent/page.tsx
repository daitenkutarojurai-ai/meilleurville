import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { parentSoloFit, fitLabel, minIncomeForT3 } from "@/lib/parent-solo";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternatesEn } from "@/lib/i18n";
import {
  Users,
  Home,
  Bus,
  GraduationCap,
  Shield,
  ChevronRight,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { clampMeta } from "@/lib/brand";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const fit = parentSoloFit(city);
  const label = fitLabel(fit.score).label.toLowerCase();
  return {
    title: `Single parent in ${city.name} — fit score, rent, schools, transit`,
    description: clampMeta(`${city.name} for a single-parent household: fit score ${fit.score.toFixed(1)}/10 (${label}), 3-bedroom rent, public schools, life without a car, minimum estimated income. Honest read, no sugarcoating.`),
    alternates: cityAlternatesEn("single-parent", slug),
    openGraph: {
      title: `Single parent in ${city.name} — fit ${fit.score.toFixed(1)}/10`,
      description: `What it actually costs and how it actually works to raise a child alone in ${city.name}. Data-first, no clichés.`,
    },
  };
}

export default async function SingleParentPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const housing = getHousing(slug);
  const fit = parentSoloFit(city);
  const meta = fitLabel(fit.score);
  const s = city.scores;
  const minIncome = housing ? minIncomeForT3(housing.avgRentT3, s.cost) : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "Single parent", path: `/cities/${city.slug}/single-parent` },
  ]);

  const carVerdict =
    s.transport >= 8
      ? `Dense public transit (${s.transport.toFixed(1)}/10) — a car-free life is realistic here, even with school-work-daycare to juggle solo.`
      : s.transport >= 6.5
      ? `Decent network (${s.transport.toFixed(1)}/10) — going car-free is doable if home, school and daycare are well placed, but a cargo bike or a shared car helps on busy days.`
      : s.transport >= 4.5
      ? `Average network (${s.transport.toFixed(1)}/10) — solo parenting without a car gets tight: the after-school window becomes too short.`
      : `Weak network (${s.transport.toFixed(1)}/10) — a car is almost mandatory when you're the only driver.`;

  const schoolVerdict =
    s.schools >= 7.5
      ? `Strong school coverage (${s.schools.toFixed(1)}/10) — a public school within walking distance, means-tested cantine, after-school care and Wednesday activity centres nearby.`
      : s.schools >= 6
      ? `Solid public schools (${s.schools.toFixed(1)}/10) — check which mairie you fall under for evening after-school hours and school-holiday centres.`
      : `Modest school offering (${s.schools.toFixed(1)}/10) — as a single parent, verify the municipal after-school hours and Wednesday options early.`;

  const safetyVerdict =
    s.safety >= 7.5
      ? `Solid overall safety (${s.safety.toFixed(1)}/10) — school pickups and evening returns feel safe in most neighbourhoods.`
      : s.safety >= 5.5
      ? `Average safety (${s.safety.toFixed(1)}/10) — filtering neighbourhood by neighbourhood matters more than in quieter cities: prefer a flat near a well-lit, well-used street.`
      : `Below-average safety (${s.safety.toFixed(1)}/10) — inspect the micro-neighbourhood before you sign, especially for late returns after activities.`;

  const costVerdict =
    s.cost >= 7
      ? `Favourable cost of living (${s.cost.toFixed(1)}/10) — a single income holds without squeezing every child-related budget line.`
      : s.cost >= 5
      ? `Mid-range cost of living (${s.cost.toFixed(1)}/10) — the 3-bedroom setup works on a comfortable income; tighter on a median salary.`
      : `High cost of living (${s.cost.toFixed(1)}/10) — one income rarely covers the private market: social housing, intermediate housing or a smaller flat become real levers to activate.`;

  const faq = faqJsonLd([
    {
      q: `Is it viable to be a single parent in ${city.name} in 2026?`,
      a: `Composite single-parent score: ${fit.score.toFixed(1)}/10 (${meta.label.toLowerCase()}). ${meta.hint}. Breakdown: cost ${s.cost.toFixed(1)}, transit ${s.transport.toFixed(1)}, schools ${s.schools.toFixed(1)}, safety ${s.safety.toFixed(1)} — all on a 10 scale.`,
    },
    {
      q: `What monthly budget covers a 3-bedroom flat as a single parent in ${city.name}?`,
      a: housing && minIncome
        ? `Average T3 (3-room = 2 bedrooms + living room) rent in ${city.name}: €${housing.avgRentT3}/month (source: data/housing.ts). On the classic one-third-of-net-income rule (33%${s.cost < 5 ? ", stretched to 35% in this tight market" : ""}), you need at least €${minIncome} net/month to hold the T3 without a housing lever. Below that, look at social housing (HLM), intermediate housing (LLI) or a T2 with a shared bedroom.`
        : `${city.name} rents aren't individually recorded in our dataset. Check regional observatories (Clameur, DGALN) for a realistic T3 rent, then apply the one-third rule to get your minimum viable net income.`,
    },
    {
      q: `Can you raise a child car-free in ${city.name}?`,
      a: carVerdict,
    },
    {
      q: `What French government support exists for single parents in ${city.name}?`,
      a: `CAF benefits are national and means-tested by "quotient familial" (QF): ASF (single-parent maintenance allowance), Complément Familial (large-family top-up), APL/ALF (rent aid), and a RSA parent-isolé top-up. School canteen, after-school care and holiday centres are billed on a QF sliding scale by the ${city.name} mairie. The CCAS (municipal social action centre) is the right first door for city and département aid — ask explicitly for the "priorité famille monoparentale" (single-parent priority), which is granted on request, not automatically.`,
    },
  ]);

  const relatedPages = [
    { href: `/cities/${city.slug}/housing`, emoji: "🏠", label: "Housing", sub: "Rents, market pressure, districts" },
    { href: `/cities/${city.slug}/schools`, emoji: "🎓", label: "Schools", sub: "Public, private, after-school" },
    { href: `/cities/${city.slug}/transport`, emoji: "🚊", label: "Transport", sub: "Metro, tram, bus, bike" },
    { href: `/cities/${city.slug}/safety`, emoji: "🛡️", label: "Safety", sub: "SSMSI detail by category" },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />

        {/* Hero */}
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <nav className="mb-6 text-sm text-[var(--text-secondary)]">
              <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
              {" · "}
              <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
              {" · "}
              <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
              {" · "}
              <span>Single parent</span>
            </nav>
            <div className="flex items-center gap-3 mt-4 mb-2">
              <Users className="h-6 w-6 text-[var(--accent)] shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Single parent in {city.name}
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              One income, one driver, one adult morning and evening. What that actually changes
              in {city.name} — no clichés, no condescending praise. Figures traced back to the
              seed and <code className="text-xs">data/housing.ts</code>.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">
          {/* Fit score composite */}
          <section>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--border)]">
                <div>
                  <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                    Single-parent fit score
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    Weighted composite: cost + transit + schools + safety
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">{meta.hint}</div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${scoreColor(fit.score)}`}>
                    {fit.score.toFixed(1)}
                    <span className="text-base text-[var(--text-tertiary)] font-normal">/10</span>
                  </div>
                  <div className={`text-xs font-semibold uppercase tracking-wide ${scoreColor(fit.score)}`}>
                    {meta.label}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-[var(--border)]">
                {[
                  { label: "Cost", value: fit.breakdown.cost, weight: "×0.30" },
                  { label: "Transit", value: fit.breakdown.transport, weight: "×0.20" },
                  { label: "Schools", value: fit.breakdown.schools, weight: "×0.25" },
                  { label: "Safety", value: fit.breakdown.safety, weight: "×0.25" },
                ].map((row) => (
                  <div key={row.label} className="bg-[var(--bg-surface)] px-4 py-3 text-center">
                    <div className="text-[11px] text-[var(--text-tertiary)] uppercase tracking-wide">
                      {row.label}
                    </div>
                    <div className={`text-lg font-bold mt-1 ${scoreColor(row.value)}`}>
                      {row.value.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{row.weight}</div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Same weights as the <em>single-parent</em> profile on the{" "}
              <Link href="/city-match" className="underline hover:text-[var(--accent)]">
                City Match
              </Link>{" "}
              quiz — cost 0.30 · transit 0.20 · schools 0.25 · safety 0.25.
            </p>
          </section>

          {/* Budget T3 on a single income */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Renting a 3-room flat on one income
              </h2>
            </div>

            {housing && minIncome ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">Average T3 rent (2 bed)</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    €{housing.avgRentT3}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">T2 (1 bed) — fallback</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    €{housing.avgRentT2}/mo
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Estimated minimum net income ({s.cost < 5 ? "35%" : "33%"}-of-net rule)
                  </span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    €{minIncome}/mo
                  </span>
                </div>
                <div className="px-5 py-4">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{costVerdict}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 text-sm text-[var(--text-secondary)]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Rents for {city.name} are not individually recorded in our dataset. Check the
                  regional observatories (Clameur, DGALN, ADIL {city.department}) for a realistic
                  T3 rent, then apply the one-third rule to estimate your minimum viable income.
                </span>
              </div>
            )}

            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              The one-third rule is the classic landlord cap. In tight markets (cost score &lt; 5),
              landlords often go up to 35% with a Visale guarantee or a family guarantor.
            </p>
          </section>

          {/* Car-free */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bus className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Life without a car (or with)
              </h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Transit score</span>
                <span className={`text-sm font-bold ${scoreColor(s.transport)}`}>
                  {s.transport.toFixed(1)}/10
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{carVerdict}</p>
            </div>

            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Critical for single-parent life: you're the only person who drives. A transit and
              bike network that holds up absorbs the unexpected (medical appointments, school
              closures, activities that run late).
            </p>
          </section>

          {/* Schools + after-school */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Schools, canteen, after-school care
              </h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Schools score</span>
                <span className={`text-sm font-bold ${scoreColor(s.schools)}`}>
                  {s.schools.toFixed(1)}/10
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{schoolVerdict}</p>
            </div>

            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]/60 px-5 py-4">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Benefits and schemes worth knowing
              </div>
              <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1.5 list-disc pl-5">
                <li>
                  <strong>Allocation de soutien familial (ASF)</strong> — a monthly CAF allowance
                  for parents raising a child alone.
                </li>
                <li>
                  <strong>Means-tested school canteen (QF)</strong> — the mairie of {city.name}{" "}
                  bills school lunches on a sliding scale (typically up to 10 income brackets).
                </li>
                <li>
                  <strong>Complément mode de garde (CMG)</strong> — significantly reduces the cost
                  of daycare or a childminder for a single parent.
                </li>
                <li>
                  <strong>APL / ALF</strong> — housing benefit calculated by CAF from your rent
                  and net taxable income.
                </li>
              </ul>
              <a
                href="https://www.caf.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline mt-3"
              >
                Simulate your rights on caf.fr
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </section>

          {/* Safety */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Everyday safety</h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Safety score</span>
                <span className={`text-sm font-bold ${scoreColor(s.safety)}`}>
                  {s.safety.toFixed(1)}/10
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{safetyVerdict}</p>
              <Link
                href={`/cities/${city.slug}/safety`}
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                SSMSI detail by category <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          {/* Verdict */}
          <section>
            <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-5">
              <div className="text-xs uppercase tracking-wide text-[var(--accent)] mb-2 font-semibold">
                Verdict — which single-parent profile {city.name} fits
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {fit.score >= 6.8
                  ? `${city.name} is one of the French cities where single-parent life holds up without painful trade-offs: the four core axes (${fit.breakdown.cost.toFixed(1)} / ${fit.breakdown.transport.toFixed(1)} / ${fit.breakdown.schools.toFixed(1)} / ${fit.breakdown.safety.toFixed(1)}) sit above the national median. A median regional salary is enough to hold a T3.`
                  : fit.score >= 5.5
                  ? `${city.name} is workable as a single parent — with trade-offs: ${
                      fit.breakdown.cost < 5
                        ? "activate a housing lever (social, intermediate, flat-share)"
                        : fit.breakdown.transport < 5
                        ? "accept a car and its budget"
                        : fit.breakdown.schools < 5
                        ? "compensate with private schooling or an after-school association"
                        : "vet the neighbourhood carefully"
                    }. With those adjustments, day-to-day life holds.`
                  : `${city.name} penalises the single-parent profile on ${
                      [
                        fit.breakdown.cost < 5 && "cost",
                        fit.breakdown.transport < 5 && "transit",
                        fit.breakdown.schools < 5 && "schools",
                        fit.breakdown.safety < 5 && "safety",
                      ].filter(Boolean).join(", ") || "several axes"
                    }. If you can choose the commune, a neighbouring town scoring better on those axes saves daily energy. If the choice is forced (job, family, shared custody), it's the moment to actively chase CAF/CCAS benefits and social/intermediate housing.`}
              </p>
            </div>
          </section>

          {/* Related sub-pages */}
          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
              Dig deeper on {city.name}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {relatedPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {p.emoji} {p.label}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{p.sub}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          </section>

          <DiscussionCTA citySlug={city.slug} cityName={city.name} locale="en" />
        </div>

        <Footer />
      </main>
    </>
  );
}
