import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CITIES_SEED } from "@/data/cities-seed";
import { fiscalityForCity, TIER_TONE } from "@/lib/fiscalite";
import { FISC_EN, fiscStateEn } from "@/lib/fiscalite-en";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import { Coins, AlertTriangle, Home as HomeIcon, FileText, MapPin } from "lucide-react";
import { faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";
import { clampMeta, fitTitle } from "@/lib/brand";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; dept: string }> };

export function generateStaticParams() {
  return getAllDepartments().map((d) => ({ locale: "en", dept: deptToSlug(d) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) return {};
  const sampleCity = CITIES_SEED.find((c) => c.department === dept);
  if (!sampleCity) return {};
  const en = FISC_EN[fiscStateEn({ department: dept, region: sampleCity.region })];
  const cityCount = CITIES_SEED.filter((c) => c.department === dept).length;
  return {
    title: fitTitle(`Property tax in ${dept} — 2026 estimate`),
    description: clampMeta(
      `2026 property-tax estimate for the ${dept} department: taxe foncière (${en.taxeFonciere}), second-home tax, transfer duties. ${cityCount} cit${cityCount > 1 ? "ies" : "y"} covered. DGFiP data.`,
    ),
    alternates: pathAlternatesEn(`/departements/${deptSlug}/fiscalite`, `/departments/${deptSlug}/tax`),
    openGraph: {
      // Un openGraph de page remplace celui hérité de la racine : sans
      // `images`, la carte sociale disparaît au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Property tax — ${dept}`,
      description: `${en.label}. Estimated annual property tax ${en.taxeFonciere}. ${cityCount} cities profiled.`,
    },
  };
}

export default async function EnDeptTaxPage({ params }: Props) {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) notFound();

  const citiesInDept = CITIES_SEED.filter((c) => c.department === dept).sort(
    (a, b) => b.scores.global - a.scores.global,
  );
  if (citiesInDept.length === 0) notFound();

  const region = citiesInDept[0].region;
  const f = fiscalityForCity({ department: dept, region });
  const en = FISC_EN[fiscStateEn({ department: dept, region })];
  const tone = TIER_TONE[f.tier];

  // Same arithmetic as the FR twin: department duties + ~1.5 pts of municipal
  // duty, assessment fees and notary fees. Both locales must show the same
  // number — they are hreflang alternates.
  const dmtoTotal = (f.dmtoDroitsPercent + 1.5).toFixed(1);
  const dmtoExample280k = Math.round((280_000 * (f.dmtoDroitsPercent + 1.5)) / 100);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: EN_BASE },
      { "@type": "ListItem", position: 2, name: "Departments", item: `${EN_BASE}/departments` },
      { "@type": "ListItem", position: 3, name: dept, item: `${EN_BASE}/departments/${deptSlug}` },
      { "@type": "ListItem", position: 4, name: "Property tax", item: `${EN_BASE}/departments/${deptSlug}/tax` },
    ],
  };

  const faq = faqJsonLd([
    {
      q: `How much is property tax in the ${dept} department?`,
      a: `2026 estimate for an older two-bedroom flat in ${dept}: ${en.taxeFonciere}. ${en.label}. The exact figure swings by up to ±30% between communes, because the municipal rate is voted locally and the cadastral rental base differs from one property to the next.`,
    },
    {
      q: `What are the closing costs when buying in ${dept}?`,
      a: `On a resale property, budget around ${dmtoTotal}% of the sale price in transfer duties (droits de mutation, or DMTO) plus notary fees. On a €280,000 purchase that is about €${dmtoExample280k.toLocaleString("en-GB")}. New-build (VEFA) purchases carry reduced duties of roughly 2-3%.`,
    },
    {
      q: `Is ${dept} a "zone tendue"?`,
      a: f.zoneTendue
        ? `Yes — ${dept} contains communes classified as "zone tendue" (decree 2023-822), meaning the local housing market is officially considered strained. Those communes may add a surcharge of up to +60% to the second-home tax.`
        : `No commune in ${dept} is currently classified as "zone tendue". The second-home tax applies at the standard rate, with no surcharge.`,
    },
    {
      q: `How many cities are covered in ${dept}?`,
      a: `${citiesInDept.length} cit${citiesInDept.length > 1 ? "ies are" : "y is"} profiled in the ${dept} department, each with its own property-tax page linked from here.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
            {" · "}
            <Link href="/departments" className="hover:text-[var(--accent)]">Departments</Link>
            {" · "}
            <Link href={`/departments/${deptSlug}`} className="hover:text-[var(--accent)]">{dept}</Link>
            {" · "}
            <span>Property tax</span>
          </nav>
          <div className="mt-5 flex items-center gap-3">
            <EmojiBadge emoji="💰" tone={toneFor(deptSlug)} />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Property tax
            </span>
          </div>
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full border bg-white/85 ${tone.border} ${tone.text} px-3 py-1 text-xs font-semibold`}>
            <Coins className="h-3.5 w-3.5" />
            {en.label}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Property tax in <span className="font-display gradient-text-anim italic">{dept}</span>
          </h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            A 2026 estimate for the {dept} department ({region}): the annual property tax an owner
            pays, the second-home surcharge, and the duties due on the day you buy.{" "}
            {citiesInDept.length} cit{citiesInDept.length > 1 ? "ies" : "y"} profiled.
          </p>
        </div>
      </section>

      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Disclaimer before any figure — the department average is not a quote. */}
          <div className="mb-8 rounded-2xl bg-white p-4 flex gap-3 ring-1 ring-[#FBCFE8] shadow-[0_10px_28px_-20px_rgba(219,39,119,0.5)]">
            <AlertTriangle className="h-5 w-5 text-[#BE185D] shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--text-primary)] leading-relaxed">
              <strong>Department-level estimate.</strong> The figures below are ranges computed for
              the {dept} department as a whole. The municipal share of the property tax and the
              cadastral rental base vary sharply between communes — up to ±30%. Before making an
              offer, ask the seller for their latest tax notice and the notary for an itemised
              quote.
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              <div className="flex items-center gap-2 mb-3">
                <HomeIcon className="h-4 w-4 text-[#4F46E5]" />
                <span className="text-xs uppercase tracking-wider text-[#4338CA] font-semibold">Property tax</span>
              </div>
              <p className="text-xl font-bold text-[#312E81] font-mono-data mb-1">
                {en.taxeFonciere}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Older two-bedroom flat. The taxe foncière is paid by the owner every year, whether
                the property is occupied or not.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-[#4F46E5]" />
                <span className="text-xs uppercase tracking-wider text-[#4338CA] font-semibold">Second-home tax</span>
              </div>
              <p className="text-xl font-bold text-[#312E81] font-mono-data mb-1">
                {f.zoneTendue ? "+0 to +60%" : "Standard"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {f.zoneTendue
                  ? `${dept} has communes in "zone tendue" — a surcharge is possible.`
                  : `No "zone tendue" commune known in ${dept}.`}
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="h-4 w-4 text-[#4F46E5]" />
                <span className="text-xs uppercase tracking-wider text-[#4338CA] font-semibold">Duties + notary</span>
              </div>
              <p className="text-xl font-bold text-[#312E81] font-mono-data mb-1">
                ~{dmtoTotal}%
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Resale standard. On a €280,000 purchase: about €{dmtoExample280k.toLocaleString("en-GB")} in closing costs.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="band band-pink py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
            <h2 className="text-xl font-bold gradient-text mb-3">
              The takeaway for {dept}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{en.notes}</p>
          </div>

          {/* The three French terms a foreign buyer will meet on paper. */}
          <div className="rounded-2xl bg-white p-6 shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
            <h2 className="text-xl font-bold gradient-text mb-4">
              What you are actually paying
            </h2>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#DB2777] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">Taxe foncière</strong> — the annual
                  property tax, owed by whoever owns the property on 1 January. It is calculated
                  from the cadastral rental base (a theoretical rental value set by the tax office)
                  times rates voted by the commune and the department, plus a 3% state fee.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#DB2777] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">THRS</strong> — the second-home
                  tax. Abolished on main residences in 2023, kept on second homes, and surchargeable
                  by up to 60% in communes classified as &quot;zone tendue&quot;.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#DB2777] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">DMTO</strong> — transfer duties,
                  paid once at completion. In {dept} the department share is{" "}
                  {f.dmtoDroitsPercent.toFixed(2)}%, on top of which come a 1.20% municipal duty and
                  roughly 0.8-1.3% of assessment and notary fees. What English-speaking buyers call
                  &quot;notary fees&quot; is mostly tax, not the notary&apos;s pay.
                </span>
              </li>
            </ul>
            <p className="text-xs text-[var(--text-tertiary)] mt-4">
              Source: DGFiP, Observatoire des Finances Locales 2024, French tax code.
            </p>
          </div>
        </div>
      </section>

      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div>
            <h2 className="text-xl font-bold gradient-text mb-1">
              Property tax by city
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              {citiesInDept.length} commune{citiesInDept.length > 1 ? "s" : ""} covered in {dept},
              sorted by overall score.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {citiesInDept.map((c) => (
                <Link
                  key={c.slug}
                  href={`/cities/${c.slug}/tax`}
                  className="group flex items-center justify-between rounded-xl bg-white ring-1 ring-transparent hover:ring-[#A5F3FC] shadow-[0_8px_22px_-16px_rgba(8,145,178,0.6)] hover:-translate-y-0.5 transition-all px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {c.name}
                    </div>
                    <div className="text-[11px] font-medium text-[#0E7490] mt-0.5">
                      Overall score {c.scores.global.toFixed(1)}/10
                    </div>
                  </div>
                  <MapPin className="h-4 w-4 text-[#0891B2] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="band band-lilac py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/departments/${deptSlug}`}
              className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all"
            >
              ← {dept} department
            </Link>
            <Link
              href={`/departments/${deptSlug}/synthesis`}
              className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all"
            >
              8-dimension profile →
            </Link>
            <Link
              href="/glossary"
              className="rounded-full bg-white ring-1 ring-[#C7D2FE] px-4 py-2.5 text-sm font-medium text-[#4338CA] hover:ring-[#818CF8] transition-all"
            >
              Glossary (DPE, PLU, taxe foncière…) →
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget locale="en" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
