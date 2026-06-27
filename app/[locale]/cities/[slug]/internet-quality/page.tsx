import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { internetScore, internetLabel } from "@/lib/internet-score";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { Wifi, MapPin, CheckCircle, ExternalLink, ChevronRight } from "lucide-react";

const EN_BASE = ORIGIN_BY_LOCALE.en;

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
  const score = internetScore(city);
  const { label } = internetLabel(score);
  return {
    title: `Broadband & internet quality in ${city.name} 2026 | BestCitiesInFrance`,
    description: `Internet quality in ${city.name}: fibre coverage, estimated speeds, mobile network. Score ${score.toFixed(1)}/10 — ${label}. Source: ARCEP 2024.`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/internet-quality` },
  };
}

export default async function EnCityInternetQuality({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const score = internetScore(city);
  const { tier, label, color } = internetLabel(score);

  const scoreBarWidth = `${Math.round(score * 10)}%`;

  const tierBg: Record<string, string> = {
    "tres-bonne": "bg-purple-500/10 border-purple-500/30 text-purple-600",
    bonne: "bg-green-500/10 border-green-500/30 text-green-600",
    correcte: "bg-amber-400/10 border-amber-400/30 text-amber-600",
    limitee: "bg-red-500/10 border-red-500/30 text-red-600",
  };

  const tierLabel: Record<string, string> = {
    "tres-bonne": "Excellent",
    bonne: "Good",
    correcte: "Adequate",
    limitee: "Limited",
  };

  const tierContext: Record<string, { summary: string; detail: string }> = {
    "tres-bonne": {
      summary: `${city.name} has excellent digital infrastructure. Fibre-to-the-home (FTTH) is very widely deployed, download speeds regularly hit 1 Gbit/s, and 4G/5G coverage is dense.`,
      detail: `In well-covered urban areas several ISPs compete head-to-head, which keeps fibre prices competitive (around €30-40/month for a box). Outages are rare and speeds stay stable at peak hours.`,
    },
    bonne: {
      summary: `Internet connectivity in ${city.name} is good overall. Fibre is available in the majority of homes, with stable speeds for remote work, video calls and 4K streaming.`,
      detail: `Some peripheral areas may still rely on FTTLA cable or VDSL2 — speeds of 100-300 Mbit/s that are comfortable for most uses. Check availability at your exact address before signing a lease.`,
    },
    correcte: {
      summary: `Internet in ${city.name} is adequate for everyday use, but there are gaps between neighbourhoods. FTTH fibre may not cover every address.`,
      detail: `Depending on the address, you may land on cable (FTTLA) or upgraded ADSL. Speeds are sufficient for standard remote work (HD video calls), but may struggle for heavy households or intensive use (simultaneous 4K streaming, cloud gaming).`,
    },
    limitee: {
      summary: `Internet connectivity is still limited in parts of ${city.name}. FTTH fibre is poorly deployed, and a share of homes depends on ADSL or satellite solutions.`,
      detail: `This is usually linked to dispersed housing or a department classified as a "low-density unprofitable zone" by ARCEP. Public deployment plans (Réseau d'Initiative Publique) are under way in most of these areas — check progress on telecom.gouv.fr or contact your future landlord directly.`,
    },
  };

  const context = tierContext[tier];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${slug}` },
    { name: "Internet quality", path: `/cities/${slug}/internet-quality` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Is fibre broadband available in ${city.name}?`,
      a: `The estimated internet connectivity score for ${city.name} is ${score.toFixed(1)}/10 — rated "${tierLabel[tier]}". This score reflects FTTH fibre coverage for the ${city.region} region (ARCEP Q4 2024 data), an urban-density bonus and the city's remote-work score. To confirm availability at your exact address, use the ARCEP eligibility checker at telecom.gouv.fr.`,
    },
    {
      q: `What internet speeds can I expect in ${city.name}?`,
      a:
        tier === "tres-bonne" || tier === "bonne"
          ? `In ${city.name}, FTTH fibre typically delivers download speeds up to 1 Gbit/s and uploads of 700 Mbit/s to 1 Gbit/s depending on the ISP. These speeds are more than enough for remote work, simultaneous video calls and 4K streaming.`
          : `In ${city.name}, speeds vary by technology at the address: FTTH fibre (1 Gbit/s), FTTLA cable (100-700 Mbit/s), VDSL2 (30-100 Mbit/s) or ADSL (< 20 Mbit/s). Always check at your exact address before subscribing.`,
    },
    {
      q: `How do I check fibre availability at my address in ${city.name} before signing?`,
      a: `Use the eligibility checker on telecom.gouv.fr (ARCEP), which lists every technology available address by address across France. You can also check directly with ISPs (Orange, SFR, Bouygues, Free) — each offers an eligibility test showing available plans and guaranteed real-world speeds.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="mb-4 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            {" · "}
            <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
            {" · "}
            <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{city.name}</Link>
            {" · "}
            <span>Internet quality</span>
          </nav>
          <div className="flex items-center gap-3 mt-4 mb-2">
            <Wifi className="h-6 w-6 text-[var(--accent)] shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Internet quality in {city.name}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Fibre coverage, estimated speeds and mobile network. Score estimated from ARCEP 2024
            regional coverage data and the city&apos;s remote-work score.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">

        <section>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold mb-5 ${tierBg[tier]}`}>
            <Wifi className="h-3.5 w-3.5" />
            {tierLabel[tier]}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Internet connectivity score</span>
                <span className={`text-sm font-bold ${color}`}>{score.toFixed(1)}/10</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--border)]">
                <div
                  className={`h-2 rounded-full transition-all ${
                    tier === "tres-bonne" ? "bg-purple-500" :
                    tier === "bonne" ? "bg-green-500" :
                    tier === "correcte" ? "bg-amber-400" : "bg-red-500"
                  }`}
                  style={{ width: scoreBarWidth }}
                />
              </div>
              <p className="text-xs text-[var(--text-tertiary)] mt-2">
                Regional ARCEP estimate Q4 2024. 10 = excellent connectivity (FTTH fibre widespread).
              </p>
            </div>

            <div className="px-5 py-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{context.summary}</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Check at my address</h2>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              The score above is a regional estimate. Actual fibre availability varies building by
              building — especially in areas that are still being rolled out.
            </p>
            <a
              href="https://www.telecom.gouv.fr/accueil-telecom/deploiement-des-reseaux/la-couverture-du-territoire/la-couverture-fixe-et-mobile-en-france"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Check eligibility on telecom.gouv.fr
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            How the score is calculated
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5 space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>{context.detail}</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">Regional fibre coverage (ARCEP Q4 2024)</strong> —
                  share of premises connectable to FTTH by region; the primary driver of the score.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">City remote-work score</strong> —
                  a proxy for remote-worker appeal, correlated with perceived connectivity quality.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">Urban density</strong> —
                  larger cities benefit from denser fibre rollouts and stronger ISP competition.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">Department</strong> —
                  some rural departments (Creuse, Ariège, Lozère...) are classified as
                  &quot;low-density unprofitable zones&quot; by ARCEP and are covered by public
                  deployment plans currently under way.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            4 tips before signing a lease
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5 space-y-3">
            {[
              "Test eligibility at the exact address on each ISP's website before signing — availability can vary building by building on the same street.",
              "Check whether the flat is already connected (fibre socket installed) or merely connectable (extra steps and delays ahead).",
              "Ask the landlord or agency whether a fibre optical terminal (PTO) is already fitted in the apartment.",
              "In low-coverage or grey zones, 4G/5G home broadband can be a solid alternative to a fixed line — compare real-world speeds on nperf.com.",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tip}</p>
              </div>
            ))}
            <p className="text-xs text-[var(--text-tertiary)] pt-1">
              Sources: ARCEP, telecom.gouv.fr, monreseaumobile.fr, nperf.com.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Explore further</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href={`/cities/${slug}/remote-work`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all group"
            >
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  Remote work
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Coworkings, score, profiles</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
            </Link>
            <Link
              href={`/cities/${slug}/cost-of-living`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all group"
            >
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  Cost of living
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Rent, budget, affordability</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/internet-quality"
            className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
          >
            📊 National internet-coverage ranking
          </Link>
          <Link
            href={`/cities/${slug}`}
            className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
          >
            &larr; Back to {city.name}
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
