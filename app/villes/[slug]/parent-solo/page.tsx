import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { GUIDES } from "@/data/guides";
import { parentSoloFit, fitLabel, minIncomeForT3 } from "@/lib/parent-solo";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternates } from "@/lib/i18n";
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
  const fit = parentSoloFit(city);
  const label = fitLabel(fit.score).label.toLowerCase();
  return {
    title: `Parent solo à ${city.name} — score, budget T3, écoles, transports`,
    description: `${city.name} en configuration parent solo : score fit ${fit.score.toFixed(1)}/10 (${label}), loyer T3, écoles publiques, transports sans voiture, budget minimum estimé.`,
    alternates: cityAlternates("parent-solo", slug),
    openGraph: {
      title: `Parent solo à ${city.name} — fit ${fit.score.toFixed(1)}/10`,
      description: `Le vrai calcul pour un parent seul à ${city.name} : coût, transports, écoles, sécurité. Sans misérabilisme, sans « courage ».`,
    },
  };
}

export default async function ParentSoloPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const housing = getHousing(slug);
  const fit = parentSoloFit(city);
  const meta = fitLabel(fit.score);
  const s = city.scores;
  const relatedGuide = GUIDES.find((g) => g.slug === `parent-solo-a-${slug}-2026`);
  const minIncome = housing ? minIncomeForT3(housing.avgRentT3, s.cost) : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Parent solo", path: `/villes/${city.slug}/parent-solo` },
  ]);

  const carVerdict =
    s.transport >= 8
      ? `Transports publics très denses (${s.transport.toFixed(1)}/10) — vivre sans voiture est réaliste, même avec école-boulot-nourrice à jongler.`
      : s.transport >= 6.5
      ? `Réseau correct (${s.transport.toFixed(1)}/10) — sans voiture c'est jouable si domicile-école-crèche sont bien placés, mais une voiture partagée ou un vélo cargo aide les jours chargés.`
      : s.transport >= 4.5
      ? `Réseau moyen (${s.transport.toFixed(1)}/10) — parent solo sans voiture peu pratique : les crèneaux périscolaires deviennent trop serrés.`
      : `Réseau faible (${s.transport.toFixed(1)}/10) — voiture quasi indispensable en configuration parent solo.`;

  const schoolVerdict =
    s.schools >= 7.5
      ? `Maillage scolaire dense (${s.schools.toFixed(1)}/10) — école publique et périscolaire à proximité, cantine à quotient familial CAF, centres de loisirs le mercredi et vacances.`
      : s.schools >= 6
      ? `Écoles publiques correctes (${s.schools.toFixed(1)}/10) — vérifier la commune de rattachement pour le périscolaire du soir et les vacances scolaires.`
      : `Offre scolaire modeste (${s.schools.toFixed(1)}/10) — un parent solo doit vérifier tôt les horaires de la garderie municipale et l'offre du mercredi.`;

  const safetyVerdict =
    s.safety >= 7.5
      ? `Sécurité globale solide (${s.safety.toFixed(1)}/10) — sortie école et retour de nuit sereins dans la plupart des quartiers.`
      : s.safety >= 5.5
      ? `Sécurité moyenne (${s.safety.toFixed(1)}/10) — filtrer quartier par quartier compte plus qu'en ville plus tranquille : préférer un logement proche d'un axe éclairé et fréquenté.`
      : `Sécurité en dessous de la moyenne (${s.safety.toFixed(1)}/10) — vérifier le micro-quartier avant de signer, notamment pour les rentrées de nuit après les activités.`;

  const costVerdict =
    s.cost >= 7
      ? `Coût de la vie favorable (${s.cost.toFixed(1)}/10) — un revenu unique tient sans compresser tout le budget loisirs enfants.`
      : s.cost >= 5
      ? `Coût de la vie moyen (${s.cost.toFixed(1)}/10) — la maquette T3 tient sur un revenu confortable, plus tendu sur un salaire médian.`
      : `Coût de la vie élevé (${s.cost.toFixed(1)}/10) — un seul revenu ne suffit rarement sur le marché libre : logement social, intermédiaire ou colocation deviennent des leviers à activer.`;

  const faq = faqJsonLd([
    {
      q: `Est-ce viable d'être parent solo à ${city.name} en 2026 ?`,
      a: `Score composite parent solo : ${fit.score.toFixed(1)}/10 (${meta.label.toLowerCase()}). ${meta.hint}. Détail : coût ${s.cost.toFixed(1)}, transports ${s.transport.toFixed(1)}, écoles ${s.schools.toFixed(1)}, sécurité ${s.safety.toFixed(1)} — tout sur 10.`,
    },
    {
      q: `Quel budget mensuel minimum pour tenir un T3 à ${city.name} en parent solo ?`,
      a: housing && minIncome
        ? `Loyer T3 moyen à ${city.name} : ${housing.avgRentT3} €/mois (source : data/housing.ts). Sur la règle du tiers du revenu net (33 %${s.cost < 5 ? ", relâchée à 35 % sur ce marché tendu" : ""}), il faut au minimum ${minIncome} € net/mois pour tenir sans levier logement. Sous ce seuil, il faut regarder logement social, intermédiaire, ou un T2 avec chambre partagée.`
        : `Les loyers ${city.name} ne sont pas individualisés dans notre base ; référez-vous aux observatoires locaux (Clameur, DGALN) pour un T3 réaliste, puis appliquez la règle du tiers du revenu net.`,
    },
    {
      q: `Peut-on élever seul·e sans voiture à ${city.name} ?`,
      a: carVerdict,
    },
    {
      q: `Quelles aides CAF pour un parent solo à ${city.name} ?`,
      a: `Les dispositifs CAF sont nationaux et fonction du quotient familial : allocation de soutien familial (ASF) pour parent isolé, complément familial, aide au logement (APL/ALF/ALS), majoration RSA pour parent isolé. La cantine scolaire, le périscolaire et les centres de loisirs sont facturés en tranches QF par la mairie de ${city.name}. Le CCAS (Centre communal d'action sociale) local est le bon point d'entrée pour les aides mairie et département — pensez à mentionner la « priorité famille monoparentale » à demander sur dossier (pas automatique).`,
    },
  ]);

  const relatedPages = [
    { href: `/villes/${city.slug}/logement`, emoji: "🏠", label: "Logement", sub: "Loyers, tension marché, quartiers" },
    { href: `/villes/${city.slug}/ecoles`, emoji: "🎓", label: "Écoles", sub: "Publiques, privées, périscolaire" },
    { href: `/villes/${city.slug}/transports`, emoji: "🚊", label: "Transports", sub: "Métro, tram, bus, vélo" },
    { href: `/villes/${city.slug}/securite`, emoji: "🛡️", label: "Sécurité", sub: "Détail SSMSI par catégorie" },
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
                { label: "Parent solo" },
              ]}
            />
            <div className="flex items-center gap-3 mt-4 mb-2">
              <Users className="h-6 w-6 text-[var(--accent)] shrink-0" />
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
                Parent solo à {city.name}
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              Un seul revenu, un seul conducteur, un seul parent le matin comme le soir. Ce que ça
              change concrètement à {city.name} — sans misérabilisme, sans « courage » condescendant.
              Chiffres tirés du seed et de <code className="text-xs">data/housing.ts</code>.
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
                    Score parent solo
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    Composite pondéré coût + transports + écoles + sécurité
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
                  { label: "Coût", value: fit.breakdown.cost, weight: "×0,30" },
                  { label: "Transports", value: fit.breakdown.transport, weight: "×0,20" },
                  { label: "Écoles", value: fit.breakdown.schools, weight: "×0,25" },
                  { label: "Sécurité", value: fit.breakdown.safety, weight: "×0,25" },
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
              Mêmes poids que le profil <em>parent solo</em> de la page{" "}
              <Link href="/city-match" className="underline hover:text-[var(--accent)]">
                City Match
              </Link>{" "}
              — coût 0,30 · transports 0,20 · écoles 0,25 · sécurité 0,25.
            </p>
          </section>

          {/* Budget T3 sur un revenu */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Home className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Budget T3 sur un seul revenu
              </h2>
            </div>

            {housing && minIncome ? (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">Loyer T3 moyen</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {housing.avgRentT3} €/mois
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">Loyer T2 (repli possible)</span>
                  <span className="text-sm font-semibold text-[var(--text-primary)]">
                    {housing.avgRentT2} €/mois
                  </span>
                </div>
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
                  <span className="text-sm text-[var(--text-secondary)]">
                    Revenu net minimum estimé (règle {s.cost < 5 ? "35 %" : "33 %"} du net)
                  </span>
                  <span className="text-sm font-bold text-[var(--text-primary)]">
                    {minIncome} €/mois
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
                  Loyers de {city.name} non individualisés dans notre base. Consultez les
                  observatoires régionaux (Clameur, DGALN, ADIL {city.department}) pour un T3
                  réaliste. Appliquez ensuite la règle du tiers du revenu net pour estimer le
                  minimum viable.
                </span>
              </div>
            )}

            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              La règle du tiers est un plafond bailleur classique. Sur les marchés tendus (score
              coût &lt; 5), les bailleurs acceptent souvent jusqu&apos;à 35 % avec caution Visale
              ou garant familial.
            </p>
          </section>

          {/* Sans voiture */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bus className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Vivre sans voiture (ou avec)
              </h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Score transports</span>
                <span className={`text-sm font-bold ${scoreColor(s.transport)}`}>
                  {s.transport.toFixed(1)}/10
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{carVerdict}</p>
            </div>

            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Point sensible en parent solo : c&apos;est la seule personne qui conduit. Un réseau
              transport et vélo qui tient absorbe les imprévus (rendez-vous médical, école qui
              ferme, activité qui déborde).
            </p>
          </section>

          {/* Écoles + périscolaire */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Écoles, cantine, périscolaire
              </h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Score écoles</span>
                <span className={`text-sm font-bold ${scoreColor(s.schools)}`}>
                  {s.schools.toFixed(1)}/10
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{schoolVerdict}</p>
            </div>

            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]/60 px-5 py-4">
              <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                Aides et dispositifs à connaître
              </div>
              <ul className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-1.5 list-disc pl-5">
                <li>
                  <strong>Allocation de soutien familial (ASF)</strong> — versée aux parents
                  isolés élevant seul·e·s au moins un enfant (CAF).
                </li>
                <li>
                  <strong>Cantine à quotient familial</strong> — barème municipal, jusqu&apos;à ~10
                  tranches selon la ville, à demander à la mairie de {city.name} dès l&apos;inscription.
                </li>
                <li>
                  <strong>Complément mode de garde (CMG)</strong> — allège fortement la crèche ou
                  l&apos;assistant·e maternel·le pour un parent isolé.
                </li>
                <li>
                  <strong>APL / ALF</strong> — allocation logement, calcul CAF à partir du loyer
                  et du revenu net imposable.
                </li>
              </ul>
              <a
                href="https://www.caf.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline mt-3"
              >
                Simuler mes droits sur caf.fr
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </section>

          {/* Sécurité */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-[var(--accent)]" />
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Sécurité au quotidien</h2>
            </div>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-secondary)]">Score sécurité</span>
                <span className={`text-sm font-bold ${scoreColor(s.safety)}`}>
                  {s.safety.toFixed(1)}/10
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{safetyVerdict}</p>
              <Link
                href={`/villes/${city.slug}/securite`}
                className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
              >
                Détail SSMSI par catégorie <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </section>

          {/* Verdict */}
          <section>
            <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-5">
              <div className="text-xs uppercase tracking-wide text-[var(--accent)] mb-2 font-semibold">
                Verdict — pour quel profil {city.name} fonctionne
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {fit.score >= 6.8
                  ? `${city.name} est une des villes françaises où la configuration parent solo tient sans arbitrage douloureux : les quatre axes clés (${fit.breakdown.cost.toFixed(1)} / ${fit.breakdown.transport.toFixed(1)} / ${fit.breakdown.schools.toFixed(1)} / ${fit.breakdown.safety.toFixed(1)}) sont au-dessus de la médiane nationale. Un revenu médian de la région suffit à porter un T3.`
                  : fit.score >= 5.5
                  ? `${city.name} est faisable en parent solo à condition d'arbitrer : ${
                      fit.breakdown.cost < 5
                        ? "activer un levier logement (social, intermédiaire, colocation)"
                        : fit.breakdown.transport < 5
                        ? "accepter la voiture et son budget"
                        : fit.breakdown.schools < 5
                        ? "compenser par le privé ou le périscolaire associatif"
                        : "vérifier soigneusement le quartier"
                    }. Avec ces ajustements, le quotidien tient.`
                  : `${city.name} pénalise le profil parent solo sur ${
                      [
                        fit.breakdown.cost < 5 && "coût",
                        fit.breakdown.transport < 5 && "transports",
                        fit.breakdown.schools < 5 && "écoles",
                        fit.breakdown.safety < 5 && "sécurité",
                      ].filter(Boolean).join(", ") || "plusieurs axes"
                    }. Si vous avez le choix de la commune, une ville limitrophe mieux notée sur ces axes économise de l'énergie au quotidien. Si le choix est contraint (travail, famille, garde alternée), c'est le moment d'aller chercher activement les aides CAF/CCAS et un logement social/intermédiaire.`}
              </p>
            </div>
          </section>

          {/* Guide dédié */}
          {relatedGuide && (
            <section>
              <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
                Guide long à lire ensuite
              </h2>
              <Link
                href={`/guides/${relatedGuide.slug}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {relatedGuide.emoji} {relatedGuide.title}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    {relatedGuide.readMinutes} min · {relatedGuide.metaDesc}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
              </Link>
            </section>
          )}

          {/* Liens sous-pages liées */}
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
