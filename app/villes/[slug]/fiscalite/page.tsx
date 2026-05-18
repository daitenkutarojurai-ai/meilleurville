import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { fiscalityForCity, TIER_TONE } from "@/lib/fiscalite";
import { deptToSlug } from "@/lib/dept-slug";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Coins, AlertTriangle, Home as HomeIcon, FileText, Info } from "lucide-react";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const f = fiscalityForCity({ department: city.department, region: city.region });
  return {
    title: `Fiscalité immobilière à ${city.name} — Taxe foncière, THRS, DMTO 2026 | MeilleurVille`,
    description: `Estimation départementale 2026 pour ${city.name} (${city.department}) : taxe foncière (${f.taxeFonciereT3}), THRS, droits de mutation. Données DGFiP.`,
    alternates: { canonical: `/villes/${slug}/fiscalite` },
    openGraph: {
      title: `Fiscalité — ${city.name}`,
      description: `${f.tierLabel} (département ${city.department}). Taxe foncière estimée ${f.taxeFonciereT3}.`,
    },
  };
}

export default async function FiscalitePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const f = fiscalityForCity({ department: city.department, region: city.region });
  const tone = TIER_TONE[f.tier];

  const dmtoTotal = (f.dmtoDroitsPercent + 1.5).toFixed(1); // droits + notaire + frais
  const dmtoExample280k = Math.round(280_000 * (f.dmtoDroitsPercent + 1.5) / 100);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Fiscalité immobilière à ${city.name} — Taxe foncière, THRS, DMTO 2026`,
    description: `Estimation départementale 2026 pour ${city.name} (${city.department}) basée sur les données DGFiP.`,
    inLanguage: "fr-FR",
    isPartOf: { "@type": "WebSite", name: "MeilleurVille" },
  };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Fiscalité", path: `/villes/${slug}/fiscalite` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelle est la taxe foncière à ${city.name} ?`,
      a: `Estimation départementale 2026 pour un T3 ancien à ${city.name} (${city.department}) : ${f.taxeFonciereT3}. La valeur exacte dépend du taux communal voté chaque année et de la base locative cadastrale du bien — vérifier sur le dernier avis de taxe foncière du vendeur. ${f.tierLabel}.`,
    },
    {
      q: `${city.name} est-elle en zone tendue pour la THRS ?`,
      a: f.zoneTendue
        ? `${city.department} comporte des communes classées en zone tendue (décret n° 2023-822). Les communes concernées peuvent appliquer une majoration de THRS de +5 % à +60 % pour les résidences secondaires. Vérifier le statut exact de ${city.name} sur service-public.fr avant achat.`
        : `${city.department} n'a pas de commune classée en zone tendue à date. La THRS sur résidence secondaire à ${city.name} est appliquée au taux standard, sans majoration.`,
    },
    {
      q: `Combien coûtent les frais de notaire à ${city.name} ?`,
      a: `Pour un achat dans l'ancien à ${city.name}, prévoir environ ${dmtoTotal} % du prix de vente en droits de mutation (DMTO) + frais de notaire. Sur un bien à 280 000 €, cela représente environ ${dmtoExample280k.toLocaleString("fr-FR")} €. Dans le neuf (VEFA), les frais sont réduits à ~2-3 %.`,
    },
    {
      q: `Comment la taxe foncière est-elle calculée ?`,
      a: `Taxe foncière annuelle = base locative cadastrale (valeur locative théorique brute / 2) × (taux communal + taux département) + frais de gestion 3 %. Le taux communal varie de 20 % à 60 % selon la commune ; le taux département est uniforme dans ${city.department}. Source : DGFiP, Code général des impôts.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-12 pb-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Villes", href: "/villes" },
              { label: city.name, href: `/villes/${slug}` },
              { label: "Fiscalité" },
            ]}
          />
          <div className={`mt-4 inline-flex items-center gap-2 rounded-full border ${tone.border} ${tone.bg} ${tone.text} px-3 py-1 text-xs font-semibold`}>
            <Coins className="h-3.5 w-3.5" />
            {f.tierLabel}
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
            Fiscalité immobilière à {city.name}
          </h1>
          <p className="mt-3 text-[var(--text-secondary)] leading-relaxed">
            Estimation départementale 2026 ({city.department}). Taxe foncière, THRS (résidence secondaire) et droits de mutation à anticiper avant achat.
          </p>
        </div>
      </section>

      <section className="relative pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Disclaimer — first thing the reader sees, before any number. */}
          <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-sm text-[var(--text-primary)] leading-relaxed">
              <strong>Estimation départementale.</strong> Les valeurs ci-dessous sont des
              fourchettes calculées au niveau du département {city.department}. La taxe foncière
              communale et la base locative cadastrale varient fortement d&apos;une commune à l&apos;autre
              (jusqu&apos;à ±30 %). Vérifier impérativement avec le dernier avis de taxe foncière du
              vendeur et l&apos;estimation du notaire avant tout engagement.
            </div>
          </div>

          {/* 3 cards: taxe foncière / THRS / DMTO */}
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
                Taxe d&apos;habitation résidence secondaire. {f.zoneTendue
                  ? `${city.department} compte des communes en zone tendue — majoration possible.`
                  : "Pas de zone tendue connue dans ce département."}
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
                Ancien standard. Pour un achat à 280 000 €, prévoir ~{dmtoExample280k.toLocaleString("fr-FR")} € de frais.
              </p>
            </div>
          </div>

          {/* Detailed sections */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                Ce qu&apos;il faut retenir pour {city.name}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {f.notes}
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                Taxe foncière — comment elle est calculée
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                La taxe foncière annuelle = base locative cadastrale (= valeur locative théorique brute / 2) × taux communal + taux département. La base est révisée chaque année par l&apos;indice IRL ; elle a augmenté de +7,1 % en 2023 et +3,9 % en 2024.
              </p>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span><strong>Taux communal</strong> voté chaque année par le conseil municipal — peut varier de 20 % à 60 % selon les communes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span><strong>Taux département</strong> applicable dans tout le département {city.department} (entre 15 % et 25 % selon les départements).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span><strong>Frais de gestion</strong> de l&apos;État : 3 % en sus.</span>
                </li>
              </ul>
              <p className="text-xs text-[var(--text-tertiary)] mt-4">
                Source : DGFiP, Observatoire des Finances Locales 2024, Code général des impôts.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                THRS — Taxe d&apos;habitation résidence secondaire
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Supprimée pour les résidences principales depuis 2023, mais maintenue pour les résidences secondaires. {f.zoneTendue
                  ? `${city.department} comporte des communes classées en zone tendue (décret n° 2023-822) — les communes concernées peuvent appliquer une majoration de +5 % à +60 % de la THRS pour décourager les résidences vacantes ou secondaires.`
                  : `${city.department} n'a pas de commune classée en zone tendue à date — la THRS est appliquée au taux standard.`}
              </p>
              <p className="text-xs text-[var(--text-tertiary)]">
                Vérifier le statut zone tendue de la commune exacte sur <a href="https://www.service-public.fr/particuliers/vosdroits/F42117" target="_blank" rel="noopener" className="text-[var(--accent)] hover:underline">service-public.fr</a> avant achat d&apos;une résidence secondaire.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
                DMTO — Droits de mutation à titre onéreux (« frais de notaire »)
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                À payer lors de l&apos;achat. Pour un bien ancien à {city.name} : <strong>~{dmtoTotal} %</strong> du prix de vente, soit pour un achat à 280 000 € : <strong>~{dmtoExample280k.toLocaleString("fr-FR")} €</strong>.
              </p>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span><strong>Droits département</strong> : {f.dmtoDroitsPercent.toFixed(2)} %</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span><strong>Taxe communale</strong> : 1.20 % standard</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span><strong>Frais d&apos;assiette + notaire</strong> : ~0.8-1.3 %</span>
                </li>
              </ul>
              <p className="text-xs text-[var(--text-tertiary)] mt-4">
                Neuf (VEFA) : DMTO réduits à ~2-3 % au lieu de ~7-8 %. Économie souvent compensée par la TVA et le prix supérieur.
              </p>
            </div>

            <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-6">
              <h2 className="text-base font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <Info className="h-5 w-5 text-[var(--accent)]" />
                Pour une estimation précise
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Cette page donne une fourchette départementale. Pour une estimation au niveau de la commune (et de la rue) :
              </p>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span>Demander le dernier avis de taxe foncière au vendeur (document obligatoire).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span>Consulter <a href="https://www.impots.gouv.fr/particulier/taxe-fonciere" target="_blank" rel="noopener" className="text-[var(--accent)] hover:underline">la page taxe foncière sur impots.gouv.fr</a>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span>Demander au notaire un devis détaillé des frais d&apos;acquisition.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`/villes/${slug}`}
              className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              ← Profil de {city.name}
            </Link>
            <Link
              href={`/departements/${deptToSlug(city.department)}/fiscalite`}
              className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              Hub fiscalité {city.department} →
            </Link>
            <Link
              href="/glossaire"
              className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              Glossaire →
            </Link>
            <Link
              href="/methode"
              className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
            >
              Méthodologie →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
