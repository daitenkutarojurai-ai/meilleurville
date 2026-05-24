import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { rentalTension, tensionInfo } from "@/lib/rental-tension";
import { internetScore, internetLabel } from "@/lib/internet-score";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { Home, Wifi, FileText, MapPin, ChevronRight, AlertCircle } from "lucide-react";

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
  const housing = getHousing(slug);
  return {
    title: `S'installer à ${city.name} — logement, démarches, internet 2026 | MaVilleIdeal`,
    description: `Guide pratique pour s'installer à ${city.name} : loyers (T2 ${housing ? `${housing.avgRentT2} €/mois` : "estimés"}), tension locative, fibre, fiscalité, démarches administratives.`,
    alternates: { canonical: `/villes/${slug}/s-installer` },
    openGraph: {
      title: `S'installer à ${city.name} — guide pratique 2026`,
      description: `Logement, internet, fiscalité, démarches : tout ce qu'il faut savoir avant de s'installer à ${city.name}.`,
    },
  };
}

export default async function SInstallerPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const housing = getHousing(slug);
  const fisc = fiscalityForCity({ department: city.department, region: city.region });
  const tension = rentalTension(city);
  const tensionMeta = tensionInfo(tension);
  const internet = internetScore(city);
  const internetMeta = internetLabel(internet);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "S'installer", path: `/villes/${city.slug}/s-installer` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Combien coûte un loyer à ${city.name} ?`,
      a: housing
        ? `À ${city.name}, un T1 coûte environ ${housing.avgRentT1} €/mois, un T2 ${housing.avgRentT2} €/mois et un T3 ${housing.avgRentT3} €/mois. Pour l'achat, le prix moyen est de ${housing.avgBuyPriceM2} €/m².`
        : `Les loyers à ${city.name} ne sont pas individualisés dans notre base. Comptez sur les moyennes régionales de la zone ${city.region}.`,
    },
    {
      q: `Est-il facile de trouver un logement à ${city.name} ?`,
      a: `Le marché locatif de ${city.name} est qualifié de "${tensionMeta.label.toLowerCase()}" (score ${tension.toFixed(1)}/10, où 10 = très tendu). ${tension >= 7 ? `La demande est forte : anticipez plusieurs semaines de recherche et préparez un dossier solide (3 dernières fiches de paie, avis d'imposition, garanties).` : tension >= 4 ? `Le marché est équilibré : un dossier complet devrait suffire à trouver en quelques semaines.` : `Le marché est détendu : les logements sont disponibles et les délais courts.`}`,
    },
    {
      q: `La fibre est-elle disponible à ${city.name} ?`,
      a: `La connectivité internet à ${city.name} est évaluée "${internetMeta.label}" (${internet.toFixed(1)}/10). ${internet >= 8 ? `La fibre FTTH est généralement bien déployée dans la commune et ses alentours.` : internet >= 6 ? `La fibre est disponible dans la majorité des quartiers centraux. Vérifiez la disponibilité à votre adresse exacte sur telecom.gouv.fr.` : `La couverture fibre peut être partielle selon les quartiers. Vérifiez impérativement à votre adresse avant de signer un bail.`}`,
    },
    {
      q: `Quelles démarches administratives faire en arrivant à ${city.name} ?`,
      a: `À votre arrivée à ${city.name}, les démarches prioritaires sont : (1) signaler votre changement d'adresse sur service-public.fr (diffusion automatique vers CAF, CPAM, impôts), (2) vous inscrire sur les listes électorales si vous arrivez avant le 31 décembre, (3) mettre à jour votre carte vitale auprès de la CPAM de ${city.department}, (4) transférer vos contrats d'énergie et internet.`,
    },
  ]);

  const housingRows: { label: string; value: string }[] = [];
  if (housing) {
    housingRows.push(
      { label: "T1 (studio / 1 pièce)", value: `${housing.avgRentT1} €/mois` },
      { label: "T2 (2 pièces)", value: `${housing.avgRentT2} €/mois` },
      { label: "T3 (3 pièces)", value: `${housing.avgRentT3} €/mois` },
      { label: "Prix d'achat moyen", value: `${housing.avgBuyPriceM2} €/m²` },
    );
  }

  const adminSteps = [
    {
      num: "1",
      title: "Changement d'adresse",
      body: `Déclarez votre nouvelle adresse sur service-public.fr/particuliers/vosdroits/N31. La diffusion est automatique vers la CAF, la CPAM, les impôts et La Poste (sous réserve d'activation).`,
      href: "https://www.service-public.fr/particuliers/vosdroits/N31",
    },
    {
      num: "2",
      title: "Inscription sur les listes électorales",
      body: `Si vous emménagez avant le 31 décembre, inscrivez-vous à la mairie de ${city.name} ou sur mon.service-public.fr avant cette date pour voter l'année suivante.`,
      href: "https://www.service-public.fr/particuliers/vosdroits/F1970",
    },
    {
      num: "3",
      title: "Mise à jour de la carte Vitale",
      body: `Signalez votre changement de département à la CPAM de ${city.department ?? city.region} (ameli.fr). Votre médecin traitant peut être à re-déclarer si vous changez de département.`,
      href: "https://www.ameli.fr",
    },
    {
      num: "4",
      title: "Contrats énergie et internet",
      body: `Résiliez ou transférez vos contrats EDF / Engie / opérateur télécom. Prévenez votre fournisseur au moins 30 jours avant l'emménagement pour éviter les coupures.`,
      href: "https://www.service-public.fr/particuliers/vosdroits/F31",
    },
    {
      num: "5",
      title: "Assurance habitation",
      body: `Obligatoire pour les locataires (et vivement conseillée pour les propriétaires). Comparez via reassurez-moi.fr ou directement votre banque. Présentez l'attestation dès la signature du bail.`,
      href: "https://www.service-public.fr/particuliers/vosdroits/F1350",
    },
  ];

  const relatedPages = [
    { href: `/villes/${city.slug}/fiscalite`, emoji: "💰", label: "Fiscalité", sub: "Taxe foncière, THRS, DMTO" },
    { href: `/villes/${city.slug}/logement`, emoji: "🏠", label: "Logement", sub: "Tension, loyers, quartiers" },
    { href: `/villes/${city.slug}/teletravail`, emoji: "💻", label: "Télétravail", sub: "Fibre, coworking" },
    { href: `/villes/${city.slug}/quartiers`, emoji: "🏘️", label: "Quartiers", sub: "Sécurité, loyers, ambiance" },
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
            <Breadcrumbs
              items={[
                { label: "Accueil", href: "/" },
                { label: "Villes", href: "/villes" },
                { label: city.name, href: `/villes/${city.slug}` },
                { label: "S'installer" },
              ]}
            />
            <div className="flex items-center gap-3 mt-4 mb-2">
              <MapPin className="h-6 w-6 text-[var(--accent)] shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                S&apos;installer à {city.name}
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Logement, internet, fiscalité et démarches administratives — tout ce qu&apos;il faut
              préparer avant d&apos;emménager à {city.name} ({city.department}).
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">

          {/* Logement */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Logement</h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
              {/* Tension badge */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Tension locative</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Difficulté à trouver un logement</div>
                </div>
                <span className={`text-sm font-bold ${tensionMeta.color}`}>
                  {tensionMeta.label} ({tension.toFixed(1)}/10)
                </span>
              </div>

              {/* Loyers */}
              {housing ? (
                housingRows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] last:border-0">
                    <span className="text-sm text-[var(--text-secondary)]">{row.label}</span>
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{row.value}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3 px-5 py-4 text-sm text-[var(--text-secondary)]">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    Données de loyers non individualisées pour {city.name}. Référence régionale :
                    zone {city.region}. Consultez les observatoires locaux des loyers pour une
                    estimation précise.
                  </span>
                </div>
              )}
            </div>

            {tension >= 7 && (
              <div className="mt-3 flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                <span>
                  Marché tendu : anticipez plusieurs semaines de recherche. Préparez un dossier
                  complet (3 fiches de paie, avis d&apos;imposition, garantie Visale ou caution
                  parentale) pour aller vite dès qu&apos;une annonce sort.
                </span>
              </div>
            )}

            <p className="mt-3 text-xs text-[var(--text-tertiary)]">
              Estimation d&apos;après les données de loyers observées (Clameur / observatoires régionaux).
              Les loyers réels varient selon le quartier, l&apos;état et la surface exacte.
            </p>
          </section>

          {/* Connectivité internet */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Wifi className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Connectivité internet</h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Qualité estimée</span>
                <span className={`text-sm font-bold ${internetMeta.color}`}>
                  {internetMeta.label} ({internet.toFixed(1)}/10)
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {internet >= 8
                  ? `La fibre FTTH est généralement bien déployée à ${city.name} et dans les communes limitrophes. Les débits suffisent largement pour le télétravail et le streaming 4K.`
                  : internet >= 6
                  ? `La fibre est disponible dans la majorité des quartiers centraux de ${city.name}. Les zones périphériques peuvent encore être en VDSL ou THD radio — vérifiez à votre adresse sur telecom.gouv.fr.`
                  : `La couverture fibre peut être partielle à ${city.name}. Vérifiez impérativement la disponibilité à votre adresse exacte avant de signer un bail, notamment si le télétravail est essentiel pour vous.`}
              </p>
              <a
                href="https://www.telecom.gouv.fr/fibre-optique/ma-connexion-internet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                Vérifier la disponibilité à mon adresse (telecom.gouv.fr)
                <ChevronRight className="h-3 w-3" />
              </a>
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Score estimé (ARCEP couverture T4 2024 + proxy score télétravail). Aucune donnée ARCEP
              n&apos;est consommée en temps réel.
            </p>
          </section>

          {/* Fiscalité synthèse */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Fiscalité locale</h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">Niveau global</div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Département {city.department}</div>
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)]">{fisc.tierLabel}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">Taxe foncière T3 estimée</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{fisc.taxeFonciereT3}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
                <span className="text-sm text-[var(--text-secondary)]">DMTO (droits de mutation)</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">{fisc.dmtoDroitsPercent.toFixed(2)} %</span>
              </div>
              <div className="flex items-center justify-between px-5 py-3">
                <span className="text-sm text-[var(--text-secondary)]">Zone tendue</span>
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {fisc.zoneTendue ? "Oui — encadrement des loyers possible" : "Non"}
                </span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-[var(--text-tertiary)]">
                Estimation départementale DGFiP. Valeurs indicatives.
              </p>
              <Link
                href={`/villes/${city.slug}/fiscalite`}
                className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1"
              >
                Détail fiscalité <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          {/* Démarches admin */}
          <section>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
              Démarches administratives à l&apos;arrivée
            </h2>

            <ol className="space-y-4">
              {adminSteps.map((step) => (
                <li key={step.num} className="flex gap-4">
                  <span className="flex-none w-7 h-7 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-sm font-bold flex items-center justify-center mt-0.5">
                    {step.num}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] mb-0.5">{step.title}</div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.body}</p>
                    <a
                      href={step.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline mt-1"
                    >
                      service-public.fr <ChevronRight className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Liens vers sous-pages liées */}
          <section>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
              Aller plus loin sur {city.name}
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

          <DiscussionCTA citySlug={city.slug} cityName={city.name} />
        </div>

        <Footer />
      </main>
    </>
  );
}
