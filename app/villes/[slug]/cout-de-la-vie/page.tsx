import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { scoreColor, scoreLabel } from "@/lib/utils";
import { Coins, ChevronRight, Home, TrendingUp, Calculator, Users2 } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

function costVerdict(score: number): string {
  if (score >= 8) return "Très accessible. Le pouvoir d'achat y est nettement au-dessus de la moyenne française.";
  if (score >= 7) return "Abordable. Pression sur les loyers et les prix sous la moyenne nationale.";
  if (score >= 6) return "Modéré. Le coût de la vie est globalement aligné sur la médiane française.";
  if (score >= 5) return "Au-dessus de la moyenne. Le loyer occupera une part importante du budget.";
  if (score >= 4) return "Cher. La ville fait partie du tiers supérieur des prix en France.";
  return "Très cher. Tension forte sur loyers et prix de consommation, comparable à Paris.";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const score = city.scores.cost;
  return {
    title: `Coût de la vie à ${city.name} en 2026 — loyers, achat, budget`,
    description: `Ce que coûte vraiment vivre à ${city.name} en 2026 : loyer T2, prix au m², et budget mensuel réaliste. Score coût ${score.toFixed(1)}/10.`,
    alternates: { canonical: `/villes/${slug}/cout-de-la-vie` },
    openGraph: {
      title: `Coût de la vie à ${city.name} · Budget mensuel 2026`,
      description: `Loyers, prix d'achat et budget réaliste à ${city.name}. Sources : DVF + observatoires locaux des loyers.`,
    },
  };
}

export default async function CoutDeLaViePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const housing = getHousing(slug);
  const paris = getHousing("paris");
  const score = city.scores.cost;
  const verdict = costVerdict(score);
  const color = scoreColor(score);
  const label = scoreLabel(score);

  // Paris ratio (loyer T2) — seulement si on a la donnée des deux côtés
  // et si la ville n'est pas Paris elle-même.
  const parisRatio = housing && paris && slug !== "paris"
    ? Math.round((housing.avgRentT2 / paris.avgRentT2) * 100)
    : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Coût de la vie", path: `/villes/${city.slug}/cout-de-la-vie` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quel budget mensuel prévoir pour vivre à ${city.name} en 2026 ?`,
      a: housing
        ? `Pour un actif célibataire en T2 à ${city.name}, comptez environ ${housing.avgRentT2} €/mois de loyer, 120-180 € de charges (électricité, eau, internet, mobile), 280-420 € d'alimentation, 50-80 € de transports en commun (ou 150-250 € avec une voiture), et 150-400 € pour les loisirs. Soit un budget total réaliste entre ${housing.avgRentT2 + 600} et ${housing.avgRentT2 + 1230} €/mois selon le mode de vie.`
        : `Le budget mensuel à ${city.name} dépend essentiellement du loyer. Le score coût de la vie est ${score.toFixed(1)}/10 (${label}). Pour un actif célibataire en T2, comptez 120-180 € de charges, 280-420 € d'alimentation, 50-150 € de transports et 150-400 € de loisirs en plus du loyer médian local.`,
    },
    {
      q: `Combien coûte un loyer T2 à ${city.name} en 2026 ?`,
      a: housing
        ? `Le loyer médian d'un T2 à ${city.name} est d'environ ${housing.avgRentT2} €/mois (T1 ${housing.avgRentT1} €, T3 ${housing.avgRentT3} €). Source : observatoires locaux des loyers (Clameur 2024, ANIL).`
        : `Les loyers à ${city.name} ne sont pas individualisés dans notre base. Consultez les annonces récentes (PAP, Leboncoin, Se Loger) pour le prix du marché.`,
    },
    {
      q: `Le coût de la vie à ${city.name} est-il élevé ?`,
      a: `Le score coût de la vie de ${city.name} est de ${score.toFixed(1)}/10 (10 = très abordable). ${verdict} ${parisRatio !== null && parisRatio < 100 ? `Le loyer T2 y est environ ${100 - parisRatio} % moins cher qu'à Paris.` : parisRatio !== null && parisRatio >= 100 ? `Le loyer T2 y est aligné voire au-dessus de Paris (${parisRatio} % du loyer parisien).` : ""}`,
    },
    {
      q: `Quels coûts cachés prévoir en s'installant à ${city.name} ?`,
      a: `Au-delà du loyer, prévoyez la taxe d'habitation sur les résidences secondaires (si applicable), la taxe foncière en cas d'achat (variable par commune), la TEOM (ordures ménagères), l'assurance habitation (200-400 €/an), et le chauffage qui varie fortement selon la zone climatique. Notre calculateur "coût réel" intègre tous ces postes.`,
    },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />

        {/* Hero */}
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Breadcrumbs
              items={[
                { label: "Accueil", href: "/" },
                { label: "Villes", href: "/villes" },
                { label: city.name, href: `/villes/${city.slug}` },
                { label: "Coût de la vie" },
              ]}
            />
            <div className="flex items-center gap-3 mt-4 mb-2">
              <Coins className="h-6 w-6 text-[var(--accent)] shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Coût de la vie à {city.name}
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Score coût de la vie :{" "}
              <span className={`font-semibold ${color}`}>
                {score.toFixed(1)}/10 — {label}
              </span>
              . {verdict}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">

          {/* Loyers + achat — snapshot 3 cartes */}
          {housing && (
            <section>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Home className="h-5 w-5 text-[var(--accent)]" />
                Loyers de référence
              </h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">T1 / mois</p>
                  <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)] mt-1">{housing.avgRentT1} €</p>
                </div>
                <div className="rounded-2xl border border-[var(--accent)]/40 bg-[var(--accent)]/5 p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">T2 / mois</p>
                  <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)] mt-1">{housing.avgRentT2} €</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Référence actif solo</p>
                </div>
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Achat / m²</p>
                  <p className="font-mono-data text-2xl font-bold text-[var(--text-primary)] mt-1">
                    {housing.avgBuyPriceM2.toLocaleString("fr-FR")} €
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Sources : DVF (transactions réelles, data.gouv.fr) pour l&apos;achat ; observatoires
                locaux des loyers (Clameur 2024, ANIL) pour les loyers. Médianes indicatives :
                la fourchette réelle varie selon le quartier, la surface et l&apos;état du bien.
              </p>
            </section>
          )}

          {/* Budget mensuel réaliste */}
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Budget mensuel réaliste — actif célibataire
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Pour un actif solo en T2 à {city.name}, voici la décomposition typique. Les fourchettes
              reflètent l&apos;écart entre un mode de vie sobre et un mode de vie confortable, hors
              dépenses exceptionnelles (vacances, achat de mobilier, santé non remboursée).
            </p>
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Loyer (T2)</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {housing ? `${housing.avgRentT2} €` : "selon marché local"}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Charges (énergie, internet, mobile)</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">120-180 €</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Alimentation</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">280-420 €</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">
                  Transports {city.scores.transport >= 7 ? "(abonnement TC)" : "(abonnement TC ou voiture)"}
                </span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {city.scores.transport >= 7 ? "50-80 €" : "50-250 €"}
                </span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-[var(--text-secondary)]">Loisirs, sorties</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">150-400 €</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-[var(--text-tertiary)]">
              Hypothèses : actif célibataire, T2 médian, mode de vie urbain. Les retraités et
              familles ont une structure de coûts différente — voir notre simulateur par profil.
            </p>
          </section>

          {/* Comparaison Paris */}
          {parisRatio !== null && (
            <section>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[var(--accent)]" />
                Comparé à Paris
              </h2>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5">
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm text-[var(--text-secondary)]">Loyer T2 à {city.name}</span>
                  <span className="text-2xl font-bold font-mono-data text-[var(--text-primary)]">
                    {parisRatio} %
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {parisRatio < 50
                    ? `Le loyer T2 à ${city.name} représente moins de la moitié du loyer parisien (${paris!.avgRentT2} €/mois en moyenne). À salaire identique, le reste à vivre y est nettement supérieur.`
                    : parisRatio < 80
                    ? `Le loyer T2 à ${city.name} est ${100 - parisRatio} % moins cher qu'à Paris (${paris!.avgRentT2} €/mois en moyenne). Le pouvoir d'achat y reste meilleur, à salaire équivalent.`
                    : parisRatio < 100
                    ? `Le loyer T2 à ${city.name} est légèrement inférieur au loyer parisien (${paris!.avgRentT2} €/mois). L'écart de pouvoir d'achat est faible.`
                    : parisRatio < 130
                    ? `${city.name} est désormais alignée voire plus chère que Paris sur le T2 (${paris!.avgRentT2} €/mois côté capitale). La pression locative locale est élevée.`
                    : `${city.name} dépasse Paris sur le T2 (${paris!.avgRentT2} €/mois côté capitale). Marché extrêmement tendu.`}
                </p>
                <Link
                  href={`/comparer/${[city.slug, "paris"].sort().join("-vs-")}`}
                  className="inline-flex items-center gap-1 mt-3 text-xs text-[var(--accent)] hover:underline"
                >
                  Comparer {city.name} et Paris en détail <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </section>
          )}

          {/* Aller plus loin */}
          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
              Affiner le calcul
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href={`/calculateur-cout-reel/${city.slug}`}
                className="flex items-center justify-between rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 hover:border-[var(--accent)] hover:shadow-md transition-all px-5 py-4 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Calculator className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      Calculateur coût réel
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      Slider salaire, chauffage par zone, comparatif Paris auto
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
              </Link>
              <Link
                href={`/cout-menage/${city.slug}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <Users2 className="h-5 w-5 text-[var(--text-secondary)] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      Coût par profil de ménage
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      Solo · couple · famille · retraité
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
              </Link>
              {[
                { href: `/villes/${city.slug}/logement`, emoji: "🏠", label: "Logement", sub: "Tension, quartiers, loyers détaillés" },
                { href: `/villes/${city.slug}/fiscalite`, emoji: "💰", label: "Fiscalité", sub: "Taxe foncière, THRS, DMTO" },
                { href: `/villes/${city.slug}/louer-ou-acheter`, emoji: "🔑", label: "Louer ou acheter", sub: "Seuil de rentabilité, mensualités" },
                { href: `/villes/${city.slug}/tension-locative`, emoji: "📈", label: "Tension locative", sub: "Délai, candidats par annonce" },
              ].map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-5 py-4 group"
                >
                  <div className="min-w-0">
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

          <DiscussionCTA citySlug={city.slug} cityName={city.name} />
        </div>

        <Footer />
      </main>
    </>
  );
}
