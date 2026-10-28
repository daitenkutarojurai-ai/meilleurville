import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { getNeighborhoods } from "@/data/neighborhoods";
import { rentalTension, tensionInfo, TENSION_LABEL } from "@/lib/rental-tension";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { Home, TrendingUp, MapPin, AlertCircle, ChevronRight } from "lucide-react";
import { scoreColor, scoreLabel } from "@/lib/utils";
import { cityAlternates } from "@/lib/i18n";
import { PropertyPriceTable } from "@/components/PropertyPriceTable";
import { cityPropertyPrices } from "@/lib/property-prices";

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
  const h = getHousing(slug);
  const p = cityPropertyPrices(slug);
  // Les deux médianes mesurées valent mieux qu'une phrase générique dans le
  // snippet : c'est le chiffre que le lecteur cherche, et il est sourcé.
  const measured =
    p?.apartment?.medianM2 && p.house?.medianM2
      ? `${p.apartment.medianM2.toLocaleString("fr-FR")} €/m² en appartement, ${p.house.medianM2.toLocaleString("fr-FR")} € en maison (ventes ${p.years[0]}-${p.years[p.years.length - 1]})`
      : null;
  return {
    title: `Logement à ${city.name} — loyers, prix, tension locative 2026`,
    description: measured
      ? `Loyers T1/T2/T3 et prix au m² à ${city.name} : ${measured}. Tension du marché et comparaison location vs achat.`
      : `Loyers T1/T2/T3 et prix d'achat au m² à ${city.name}. Tension du marché, quartiers abordables, comparaison location vs achat. Données Clameur 2024.`,
    alternates: cityAlternates("logement", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Logement à ${city.name} · Loyers et marché immobilier 2026`,
      description: h
        ? `T2 ${h.avgRentT2} €/mois · Achat ${h.avgBuyPriceM2} €/m² · Score coût ${city.scores.cost.toFixed(1)}/10`
        : `Marché immobilier de ${city.name} — loyers, tension locative, logements par quartier.`,
    },
  };
}

const TYPE_LABELS: Record<string, string> = {
  "centre-ville": "Centre-ville",
  "résidentiel": "Résidentiel",
  "étudiant": "Étudiant",
  "branché": "Branché",
  "populaire": "Populaire",
  "pavillonnaire": "Pavillonnaire",
};

export default async function LogementPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const h = getHousing(slug);
  const neighborhoods = getNeighborhoods(slug);
  const tension = rentalTension(city);
  const tInfo = tensionInfo(tension);
  const costColor = scoreColor(city.scores.cost);
  const costLabel = scoreLabel(city.scores.cost);

  // Estimate buying power: how many years of T2 rent to buy a T2 (45 m²)
  const buyRatioYears = h
    ? Math.round((h.avgBuyPriceM2 * 45) / (h.avgRentT2 * 12))
    : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Logement", path: `/villes/${city.slug}/logement` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Combien coûte un loyer à ${city.name} en 2026 ?`,
      a: h
        ? `À ${city.name}, les loyers observés sont : studio / T1 environ ${h.avgRentT1} €/mois, T2 autour de ${h.avgRentT2} €/mois et T3 environ ${h.avgRentT3} €/mois. Ces chiffres proviennent des observatoires locaux des loyers (Clameur 2024).`
        : `Les loyers à ${city.name} ne sont pas individualisés dans notre base. Consultez les annonces récentes sur PAP, Leboncoin ou Se Loger pour les prix du marché.`,
    },
    {
      q: `Est-il facile de trouver un logement à ${city.name} ?`,
      a: `La tension locative à ${city.name} est de ${tension.toFixed(1)}/10 (10 = marché très tendu). Le niveau est "${tInfo.label}". ${tension >= 7 ? `Trouver un logement peut prendre plusieurs semaines. Préparez un dossier complet en avance (fiches de paie, avis d'imposition, justificatifs de garantie).` : tension >= 4 ? `Le marché est équilibré. Un dossier sérieux suffit pour trouver dans des délais raisonnables.` : `Le marché est détendu, les délais sont courts et les offres nombreuses.`}`,
    },
    {
      q: `Vaut-il mieux acheter ou louer à ${city.name} ?`,
      a: buyRatioYears
        ? `À ${city.name}, il faut théoriquement ${buyRatioYears} années de loyer pour amortir un achat équivalent (T2 de 45 m² au prix de ${h!.avgBuyPriceM2} €/m²). ${buyRatioYears <= 15 ? `L'achat est rentable à moyen terme.` : buyRatioYears <= 22 ? `L'achat est pertinent si vous restez au moins 10 ans.` : `Louer reste souvent plus avantageux financièrement dans ce marché.`} Consultez notre outil "Louer ou acheter" pour une analyse personnalisée.`
        : `Comparez loyer et mensualité d'emprunt sur notre outil "Louer ou acheter" disponible sur la fiche ville.`,
    },
    {
      q: `Quels sont les quartiers les moins chers pour se loger à ${city.name} ?`,
      a: neighborhoods.length > 0
        ? `Les quartiers analysés à ${city.name} montrent des loyers T2 allant de ${Math.min(...neighborhoods.map(n => n.avgRentT2))} € à ${Math.max(...neighborhoods.map(n => n.avgRentT2))} €/mois. ${neighborhoods.sort((a,b) => a.avgRentT2 - b.avgRentT2)[0]?.name} figure parmi les zones les plus abordables.`
        : `Consultez notre fiche quartiers de ${city.name} pour les loyers par zone.`,
    },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />

        {/* Hero */}
        <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Breadcrumbs
              items={[
                { label: "Accueil", href: "/" },
                { label: "Villes", href: "/villes" },
                { label: city.name, href: `/villes/${city.slug}` },
                { label: "Logement" },
              ]}
            />
            <div className="flex items-center gap-3 mt-4 mb-2">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-head-0 text-white shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)]">
                <Home className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Logement à {city.name}
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Loyers, prix d&apos;achat et tension du marché locatif à {city.name} ({city.department}).
              Score coût de vie :{" "}
              <span className={`font-semibold ${costColor}`}>
                {city.scores.cost.toFixed(1)}/10 — {costLabel}
              </span>
            </p>
          </div>
        </section>

        {/* Marché locatif + prix mesurés — bande indigo */}
        <section className="band band-indigo py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-10">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">Marché locatif</h2>

            <div className="rounded-2xl bg-white overflow-hidden shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
              {/* Tension */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Tension locative</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">10 = marché très tendu</div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Visual bar */}
                  <div className="hidden sm:flex items-center gap-1">
                    {[...Array(10)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 w-2 rounded-full ${i < Math.round(tension) ? "bg-current" : "bg-[var(--border)]"} ${tInfo.color}`}
                      />
                    ))}
                  </div>
                  <span className={`text-sm font-bold ${tInfo.color}`}>
                    {tension.toFixed(1)}/10 — {tInfo.shortLabel}
                  </span>
                </div>
              </div>

              {/* Rents */}
              {h ? (
                <>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                    <span className="text-sm text-[var(--text-secondary)]">Studio / T1</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{h.avgRentT1} €/mois</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                    <span className="text-sm text-[var(--text-secondary)]">T2 (2 pièces)</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{h.avgRentT2} €/mois</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                    <span className="text-sm text-[var(--text-secondary)]">T3 (3 pièces)</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{h.avgRentT3} €/mois</span>
                  </div>
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-[var(--text-secondary)]">Prix d&apos;achat moyen</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{h.avgBuyPriceM2.toLocaleString("fr-FR")} €/m²</span>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3 px-5 py-4 text-sm text-[var(--text-secondary)]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#DB2777]" />
                  <span>
                    Données de loyers non individualisées pour {city.name}. Consultez PAP.fr,
                    Se Loger ou Leboncoin pour les offres actuelles.
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Estimation d&apos;après les observatoires locaux des loyers (Clameur 2024, ANIL).
              Les loyers réels varient selon la surface exacte, l&apos;état du bien et le quartier.
            </p>
          </div>

          {/* Prix mesurés, par type de bien */}
          <PropertyPriceTable slug={city.slug} name={city.name} />
          </div>
        </section>

        {/* Louer ou acheter + loyers par quartier — bande ciel */}
        {(buyRatioYears || neighborhoods.length > 0) && (
        <section className="band band-sky py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-10">
          {/* Buy vs rent */}
          {buyRatioYears && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-[#4338CA]" />
                <h2 className="text-lg font-bold"><span className="gradient-text">Louer ou acheter ?</span></h2>
              </div>

              <div className="rounded-2xl bg-white px-5 py-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[var(--text-secondary)]">Seuil de rentabilité (T2 de 45 m²)</span>
                  <span className="text-lg font-bold text-[var(--text-primary)]">{buyRatioYears} ans</span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                  {buyRatioYears <= 12
                    ? `À ${city.name}, l'achat devient rentable relativement vite. Avec un marché à ${h!.avgBuyPriceM2} €/m², investir est pertinent dès que vous envisagez de rester plus de 10 ans.`
                    : buyRatioYears <= 20
                    ? `Le seuil d'équilibre est autour de ${buyRatioYears} ans. L'achat est pertinent si vous envisagez une installation durable à ${city.name}.`
                    : `À ${city.name}, louer reste souvent plus avantageux sur le court et moyen terme — les prix d'achat élevés (${h!.avgBuyPriceM2} €/m²) allongent le seuil de rentabilité.`}
                </p>
                <Link
                  href={`/villes/${city.slug}/louer-ou-acheter`}
                  className="inline-flex items-center gap-1 mt-4 rounded-full bg-[var(--band-indigo)] px-3 py-1.5 text-xs font-semibold text-[#3730A3] transition-colors hover:bg-[#DCD7FF]"
                >
                  Analyse détaillée louer / acheter <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Neighborhoods housing */}
          {neighborhoods.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-[#4338CA]" />
                <h2 className="text-lg font-bold"><span className="gradient-text">Loyers par quartier</span></h2>
              </div>

              <div className="rounded-2xl bg-white overflow-hidden shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                {neighborhoods
                  .slice()
                  .sort((a, b) => a.avgRentT2 - b.avgRentT2)
                  .map((nb, i, arr) => (
                    <div
                      key={nb.name}
                      className={`flex items-center justify-between px-5 py-3 ${i < arr.length - 1 ? "border-b border-[var(--border)]" : ""}`}
                    >
                      <div>
                        <div className="text-sm font-semibold text-[var(--text-primary)]">{nb.name}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">{TYPE_LABELS[nb.type] ?? nb.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-[var(--text-primary)]">{nb.avgRentT2} €/mois</div>
                        <div className="text-xs text-[var(--text-tertiary)]">T2</div>
                      </div>
                    </div>
                  ))}
              </div>
              <Link
                href={`/villes/${city.slug}/quartiers`}
                className="inline-flex items-center gap-1 mt-3 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#3730A3] shadow-sm transition-colors hover:bg-[var(--band-indigo)]"
              >
                Voir tous les quartiers de {city.name} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
          </div>
        </section>
        )}

        {/* Conseils — bande rose */}
        <section className="band band-pink py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="text-lg font-bold mb-3">
              <span className="gradient-text">
              Conseils pour trouver un logement à {city.name}</span>
            </h2>
            <div className="rounded-2xl bg-white px-5 py-5 shadow-[0_10px_28px_-18px_rgba(219,39,119,0.55)] space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              {tension >= 7 ? (
                <>
                  <p>
                    <strong className="text-[var(--text-primary)]">Marché tendu :</strong> les bons appartements partent en quelques heures.
                    Activez les alertes sur Leboncoin et Se Loger, et répondez dans l&apos;heure qui suit.
                  </p>
                  <p>
                    Préparez votre dossier à l&apos;avance : 3 dernières fiches de paie, avis d&apos;imposition,
                    pièce d&apos;identité, RIB et (si possible) garantie Visale ou caution parentale.
                    Un dossier incomplet est éliminatoire.
                  </p>
                  <p>
                    Élargissez votre périmètre de 5-10 km autour de {city.name} : les communes
                    limitrophes offrent souvent les mêmes services à 10-15 % moins cher.
                  </p>
                </>
              ) : tension >= 4 ? (
                <>
                  <p>
                    <strong className="text-[var(--text-primary)]">Marché équilibré :</strong> prévoyez 2 à 4 semaines pour trouver.
                    Un dossier complet et réactif suffit dans la majorité des cas.
                  </p>
                  <p>
                    Vérifiez la disponibilité des transports en commun depuis les zones périphériques :
                    l&apos;écart de loyer peut valoir le temps de trajet supplémentaire.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong className="text-[var(--text-primary)]">Marché détendu :</strong> vous avez le choix.
                    Prenez le temps de visiter plusieurs biens et de négocier le loyer — c&apos;est
                    possible dans ce type de marché.
                  </p>
                  <p>
                    Attention : un marché détendu peut indiquer un bassin d&apos;emploi en transition.
                    Vérifiez les perspectives économiques locales avant de vous engager sur un achat.
                  </p>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Renvois + discussion — bande blanche */}
        <section className="band band-white py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 space-y-10">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
              Aller plus loin
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { href: `/villes/${city.slug}/louer-ou-acheter`, emoji: "🔑", label: "Louer ou acheter", sub: "Seuil de rentabilité, mensualités" },
                { href: `/villes/${city.slug}/quartiers`, emoji: "🏘️", label: "Quartiers", sub: "Sécurité, ambiance, loyers par zone" },
                { href: `/villes/${city.slug}/fiscalite`, emoji: "💰", label: "Fiscalité", sub: "Taxe foncière, DMTO, zone tendue" },
                { href: `/villes/${city.slug}/s-installer`, emoji: "📦", label: "S'installer", sub: "Démarches admin, internet, conseils" },
              ].map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="flex items-center justify-between rounded-2xl bg-[var(--band-indigo)] px-5 py-4 hover:bg-[#DCD7FF] transition-colors group"
                >
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {p.emoji} {p.label}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-0.5">{p.sub}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#4338CA] shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          <DiscussionCTA citySlug={city.slug} cityName={city.name} />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
