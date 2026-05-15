import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { fiscalityForCity, TIER_TONE } from "@/lib/fiscalite";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Coins, AlertTriangle, Home as HomeIcon, FileText, MapPin } from "lucide-react";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

type Props = { params: Promise<{ dept: string }> };

export function generateStaticParams() {
  return getAllDepartments().map((d) => ({ dept: deptToSlug(d) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) return {};
  const sampleCity = CITIES_SEED.find((c) => c.department === dept);
  if (!sampleCity) return {};
  const f = fiscalityForCity({ department: dept, region: sampleCity.region });
  const cityCount = CITIES_SEED.filter((c) => c.department === dept).length;
  return {
    title: `Fiscalité immobilière ${dept} — Taxe foncière, THRS, DMTO 2026 | MeilleurVille`,
    description: `Estimation fiscale 2026 dans le département ${dept} : taxe foncière (${f.taxeFonciereT3}), THRS, droits de mutation. ${cityCount} ville${cityCount > 1 ? "s" : ""} couverte${cityCount > 1 ? "s" : ""}. Données DGFiP.`,
    alternates: { canonical: `/departements/${deptSlug}/fiscalite` },
    openGraph: {
      title: `Fiscalité — ${dept}`,
      description: `${f.tierLabel}. Taxe foncière estimée ${f.taxeFonciereT3}. ${cityCount} villes profilées.`,
    },
  };
}

export default async function DeptFiscalitePage({ params }: Props) {
  const { dept: deptSlug } = await params;
  const dept = slugToDept(deptSlug);
  if (!dept) notFound();

  const citiesInDept = CITIES_SEED.filter((c) => c.department === dept)
    .sort((a, b) => b.scores.global - a.scores.global);
  if (citiesInDept.length === 0) notFound();

  const region = citiesInDept[0].region;
  const f = fiscalityForCity({ department: dept, region });
  const tone = TIER_TONE[f.tier];

  const dmtoTotal = (f.dmtoDroitsPercent + 1.5).toFixed(1);
  const dmtoExample280k = Math.round(280_000 * (f.dmtoDroitsPercent + 1.5) / 100);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Départements", path: "/departements" },
    { name: dept, path: `/departements/${deptSlug}` },
    { name: "Fiscalité", path: `/departements/${deptSlug}/fiscalite` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelle est la taxe foncière moyenne dans le département ${dept} ?`,
      a: `Estimation 2026 pour un T3 ancien dans le département ${dept} : ${f.taxeFonciereT3}. ${f.tierLabel}. La valeur exacte varie de ±30 % selon la commune et la base locative cadastrale du bien.`,
    },
    {
      q: `Quels frais de notaire prévoir pour un achat dans ${dept} ?`,
      a: `Pour un achat dans l'ancien : environ ${dmtoTotal} % du prix de vente (DMTO + frais de notaire). Sur un bien à 280 000 €, cela représente ~${dmtoExample280k.toLocaleString("fr-FR")} €. Le neuf (VEFA) bénéficie de droits réduits à ~2-3 %.`,
    },
    {
      q: `Y a-t-il une zone tendue dans ${dept} ?`,
      a: f.zoneTendue
        ? `Oui, ${dept} comporte des communes classées en zone tendue (décret n° 2023-822). Les communes concernées peuvent appliquer une majoration de THRS jusqu'à +60 % pour les résidences secondaires.`
        : `À date, ${dept} n'a pas de commune en zone tendue. La THRS résidence secondaire y est appliquée au taux standard.`,
    },
    {
      q: `Combien de villes sont couvertes dans ${dept} ?`,
      a: `${citiesInDept.length} ville${citiesInDept.length > 1 ? "s sont profilées" : " est profilée"} dans le département ${dept}, chacune avec sa fiche fiscalité dédiée accessible depuis cette page.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-12 pb-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Départements", href: "/departements" },
              { label: dept, href: `/departements/${deptSlug}` },
              { label: "Fiscalité" },
            ]}
          />
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full border ${tone.border} ${tone.bg} ${tone.text} px-3 py-1 text-xs font-semibold`}>
            <Coins className="h-3.5 w-3.5" />
            {f.tierLabel}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Fiscalité immobilière — {dept}
          </h1>
          <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
            Estimation départementale 2026. Taxe foncière, THRS, droits de mutation pour acheter dans le département {dept} ({region}). {citiesInDept.length} ville{citiesInDept.length > 1 ? "s" : ""} profilée{citiesInDept.length > 1 ? "s" : ""}.
          </p>
        </div>
      </section>

      <section className="relative pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Disclaimer */}
          <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--text-primary)] leading-relaxed">
              <strong>Estimation départementale.</strong> Les valeurs ci-dessous sont des
              fourchettes calculées au niveau du département {dept}. La taxe foncière communale
              et la base locative cadastrale varient fortement d&apos;une commune à l&apos;autre
              (jusqu&apos;à ±30 %). Pour une estimation par ville, consultez la fiche fiscalité
              de chaque commune ci-dessous.
            </div>
          </div>

          {/* 3 cards: same anatomy as per-city, all department-level */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <HomeIcon className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">Taxe foncière</span>
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono-data mb-1">
                {f.taxeFonciereT3}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                T3 ancien (base cadastrale ~3 500-4 500 €). Payée par le propriétaire chaque année.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">THRS</span>
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono-data mb-1">
                {f.zoneTendue ? "+0 à +60 %" : "Standard"}
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {f.zoneTendue
                  ? `${dept} compte des communes en zone tendue — majoration possible.`
                  : `Pas de zone tendue connue dans ${dept}.`}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <div className="flex items-center gap-2 mb-3">
                <Coins className="h-4 w-4 text-[var(--text-secondary)]" />
                <span className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] font-semibold">DMTO + notaire</span>
              </div>
              <p className="text-xl font-bold text-[var(--text-primary)] font-mono-data mb-1">
                ~{dmtoTotal} %
              </p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                Ancien standard. Pour un achat à 280 000 € : ~{dmtoExample280k.toLocaleString("fr-FR")} € de frais.
              </p>
            </div>
          </div>

          {/* Narrative */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 mb-8">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Ce qu&apos;il faut retenir — {dept}
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {f.notes}
            </p>
          </div>

          {/* Cities in this department, with link to per-city fiche */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              Fiches fiscalité par ville
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-5">
              {citiesInDept.length} commune{citiesInDept.length > 1 ? "s" : ""} couverte{citiesInDept.length > 1 ? "s" : ""} dans le département {dept}. Triées par score global.
            </p>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {citiesInDept.map((c) => (
                <Link
                  key={c.slug}
                  href={`/villes/${c.slug}/fiscalite`}
                  className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                      Score global {c.scores.global.toFixed(1)}/10
                    </div>
                  </div>
                  <MapPin className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] shrink-0 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`/departements/${deptSlug}`}
              className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              ← Département {dept}
            </Link>
            <Link
              href="/glossaire"
              className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              Glossaire (DPE, LMNP, Pinel...) →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
