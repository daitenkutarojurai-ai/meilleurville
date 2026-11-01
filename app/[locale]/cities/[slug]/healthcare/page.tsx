import type { Metadata } from "next";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { MapsQuickSearch } from "@/components/MapsQuickSearch";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { computeHealthcareAccess, type HealthLevel } from "@/lib/healthcare-access";
import {
  APL_NATIONAL,
  APL_SOURCE_URL,
  APL_UNDERSERVED,
  APL_YEAR,
  BPE_SOURCE_URL,
  BPE_YEAR,
  residentsPerPharmacy,
} from "@/lib/city-healthcare";
import { cityAlternatesEn } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";
import { fitTitle } from "@/lib/brand";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: fitTitle(`${c.name} healthcare access — GPs, specialists, ER (2026)`),
    description: computeHealthcareAccess(c).measured
      ? `Healthcare access in ${c.name}: GP access measured by DREES (APL), emergency departments and pharmacies counted by INSEE, specialists estimated.`
      : `Healthcare access in ${c.name}: finding a GP, seeing a specialist, reaching emergency care. Commune-level estimate, not a count of practices.`,
    alternates: cityAlternatesEn("healthcare", slug),
  };
}

// The lib's composite is 0-10 where 10 = medical desert. EN labels for the
// French HealthLevel enum.
const LEVEL_LABEL: Record<HealthLevel, string> = {
  facile: "Easy access",
  correct: "Adequate",
  tendu: "Strained",
  desert: "Medical desert",
};

const HERO_VERDICT: Record<HealthLevel, string> = {
  facile: "Finding a GP and seeing a specialist is straightforward here — among the easier French cities for healthcare access.",
  correct: "Healthcare access is adequate: most needs are met, though specialist wait times can run long.",
  tendu: "Healthcare access is strained. Registering with a GP can take effort — sort it out before you move, not after.",
  desert: "This is effectively a medical desert. New arrivals routinely struggle to find a GP at all — investigate very carefully.",
};

const DIMS: { key: "generalistes" | "specialistes" | "urgences" | "pharmacies"; label: string }[] = [
  { key: "generalistes", label: "GPs" },
  { key: "specialistes", label: "Specialists" },
  { key: "urgences", label: "Emergency care" },
  { key: "pharmacies", label: "Pharmacies" },
];

export default async function EnCityHealthcare({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const access = computeHealthcareAccess(c);
  const m = access.measured;
  const perPharmacy = m ? residentsPerPharmacy(m) : null;
  const en2 = (n: number) => n.toFixed(2);
  // Present an intuitive 0-10 "access score" (higher = better) since the
  // lib composite runs the other way (10 = worst).
  const accessScore = Math.round((10 - access.composite) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: c.name, path: `/cities/${slug}` },
    { name: "Healthcare", path: `/cities/${slug}/healthcare` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <section className="relative overflow-hidden bg-aurora">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-10">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Healthcare</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🏥</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Healthcare in <span className="gradient-text">{c.name}</span>
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Access score: <span className={`font-mono-data font-bold ${scoreColor(accessScore)}`}>{accessScore.toFixed(1)}/10</span>{" "}
          ({LEVEL_LABEL[access.level]}). {HERO_VERDICT[access.level]}
        </p>
        {/* The FR twin says what this number is and what it is not, and hreflang
            alternates must not disagree on that. Since 2026-11-01 GP access, A&E
            and pharmacies are measured (DREES APL, INSEE BPE) for 591/593 cities;
            specialists stay estimated. */}
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          {m
            ? "10 = easiest access. GP access, emergency departments and pharmacies are measured (DREES, INSEE); specialists are estimated from the distance to a university hospital and town size."
            : "10 = easiest access. Only the distance to the nearest university-hospital site is measured; the rest is estimated at commune level from the department and town size — calibrated against DREES, CNOM and ARS reference bands, not a count of practices or the ARS zoning in force."}
        </p>
        </div>
      </section>

      <section className="band band-indigo py-10">
        {m && (
          <div className="mx-auto max-w-3xl px-4 sm:px-6 mb-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">The measurements</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {m.apl !== undefined && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{en2(m.apl)}</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">
                    GP consultations within reach per resident per year (France: {en2(APL_NATIONAL)}; under-served below {en2(APL_UNDERSERVED)})
                  </div>
                </div>
              )}
              <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{m.gp.toLocaleString("en-GB")}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">private-practice GPs based in the town</div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{m.pharmacies.toLocaleString("en-GB")}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">
                  pharmacies{perPharmacy ? `, one per ${perPharmacy.toLocaleString("en-GB")} residents` : ""}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{m.emergency}</div>
                <div className="mt-1 text-xs text-[var(--text-secondary)]">emergency department{m.emergency === 1 ? "" : "s"} in the town</div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Sources:{" "}
              <a href={APL_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">
                DREES, localised potential accessibility to GPs, {APL_YEAR}
              </a>{" "}
              ·{" "}
              <a href={BPE_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">
                INSEE, permanent facilities database, 1 January {BPE_YEAR}
              </a>
              . Population 2022: {m.pop.toLocaleString("en-GB")}.
            </p>
          </div>
        )}
        <div className="mx-auto max-w-3xl px-4 sm:px-6 grid sm:grid-cols-2 gap-3">
        {DIMS.map((d) => {
          const dim = access[d.key];
          const dimScore = Math.round((10 - dim.score) * 10) / 10;
          return (
            <div key={d.key} className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              <div className="flex items-baseline justify-between">
                <p className="font-semibold text-[var(--text-primary)]">{d.label}</p>
                <span className={`font-mono-data font-bold ${scoreColor(dimScore)}`}>{dimScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1">{LEVEL_LABEL[dim.level]}</p>
            </div>
          );
        })}
        </div>
      </section>

      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold mb-3"><span className="gradient-text">What this covers</span></h2>
        <ul className="text-[var(--text-secondary)] leading-relaxed space-y-2 mb-8">
          <li>· <strong className="text-[var(--text-primary)]">GPs (médecins généralistes)</strong> — the entry point to French healthcare. {m ? "Measured with the DREES APL indicator: GP consultations within reach per resident per year, counting doctors in neighbouring towns, weighted by distance and activity. Below 1.5 is very low access, below 2.5 is an officially under-served area." : "Estimated from the department's band; no density is recorded for the town."}</li>
          <li>· <strong className="text-[var(--text-primary)]">Specialists</strong> — estimated from the measured distance to the nearest university-hospital site and the size of the town. Wait times are not recorded.</li>
          <li>· <strong className="text-[var(--text-primary)]">Emergency care</strong> — {m ? "whether INSEE records an emergency department in the town; without one, the straight-line distance to the nearest town that has one, with a mountain penalty. Travel and waiting times are not recorded." : "distance to a university hospital, otherwise estimated from town size, with mountain and island penalties."}</li>
          <li>· <strong className="text-[var(--text-primary)]">Pharmacies</strong> — {m ? "pharmacies recorded by INSEE in the town, per resident. Night duty rotas are not recorded." : "estimated from population and urban status."}</li>
        </ul>
        {m ? (
          <p className="text-sm text-[var(--text-tertiary)] mb-8">
            Three of the four scores are <strong>measured</strong> for {c.name}; specialists
            remain an <strong>estimate</strong>. None of these figures tells you which doctors
            take new patients, and the ARS zoning that governs installation grants works by
            health area, not by town. To get care reimbursed you generally need a declared GP
            (médecin traitant) — line one up early, especially where APL is below 2.5.
          </p>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)] mb-8">
            {c.name} is outside the DREES APL dataset, so these four scores are a{" "}
            <strong>commune-level estimate</strong>, worked out from the department, the size
            of the town and whether it has a hospital. They follow the DREES under-provision
            bands, the CNOM demographic atlas and the logic of the ARS ZIP/ZAC zoning, but
            reuse none of their readings: this is not a count of the practices open in{" "}
            {c.name}, and not the ARS zoning in force. To get care reimbursed you generally
            need a declared GP (médecin traitant) — line one up early.
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-3">
          <Link href={`/cities/${slug}`} className="grad-head-0 rounded-full px-5 py-2.5 font-semibold hover:opacity-90">Back to {c.name}</Link>
          <Link href="/rankings/sante" className="rounded-full bg-white px-5 py-2.5 font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]">Healthcare ranking</Link>
        </div>
        </div>
      </section>
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <MapsQuickSearch topic="sante" cityName={c.name} department={c.department} locale="en" className="mb-8" />
          <FeedbackWidget />
        </div>
      </section>
      <Footer />
    </main>
  );
}
