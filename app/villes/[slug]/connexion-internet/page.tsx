import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_SEED } from "@/data/cities-seed";
import { internetScore, internetLabel } from "@/lib/internet-score";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { Wifi, MapPin, CheckCircle, ExternalLink, ChevronRight } from "lucide-react";

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
  const score = internetScore(city);
  const { label } = internetLabel(score);
  return {
    title: `Connexion internet à ${city.name} — fibre, débit, couverture 2026 | MaVilleIdeal`,
    description: `Qualité de la connexion internet à ${city.name} : couverture fibre, débit estimé, couverture mobile. Score ${score.toFixed(1)}/10 — ${label}. Source : ARCEP 2024.`,
    alternates: { canonical: `/villes/${slug}/connexion-internet` },
  };
}

export default async function ConnexionInternetPage({ params }: Props) {
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

  const tierContext: Record<string, { summary: string; detail: string }> = {
    "tres-bonne": {
      summary: `${city.name} bénéficie d'une excellente infrastructure numérique. La fibre optique est très largement déployée, les débits FTTH atteignent généralement 1 Gbit/s en téléchargement, et la couverture 4G/5G est dense.`,
      detail: `Dans les grandes agglomérations et les zones très bien couvertes, plusieurs opérateurs sont en concurrence directe — ce qui maintient les offres à des tarifs compétitifs (autour de 30-40 €/mois pour une box fibre). Les coupures sont rares et le débit est stable même aux heures de pointe.`,
    },
    bonne: {
      summary: `La connexion internet à ${city.name} est bonne dans l'ensemble. La fibre est disponible dans la majorité des logements, avec des débits stables pour le télétravail, la visioconférence et le streaming en 4K.`,
      detail: `Quelques zones périphériques peuvent encore dépendre de la fibre FTTLA (câble) ou de la VDSL2 — des débits de 100-300 Mbit/s qui restent confortables pour la plupart des usages. Vérifier la disponibilité à l'adresse exacte avant de signer un bail.`,
    },
    correcte: {
      summary: `La connexion internet à ${city.name} est correcte pour les usages courants, mais des disparités existent entre les quartiers. La fibre FTTH peut ne pas couvrir toutes les adresses.`,
      detail: `Selon l'adresse, vous pouvez tomber sur une connexion câble (FTTLA) ou ADSL amélioré. Les débits restent suffisants pour le télétravail standard (visioconférence en HD), mais peuvent montrer des limites pour les familles nombreuses ou les usages intensifs (streaming 4K simultané, cloud gaming).`,
    },
    limitee: {
      summary: `La connexion internet reste limitée dans certaines zones de ${city.name}. La fibre FTTH est encore peu déployée, et une part des logements dépend de solutions ADSL ou satellite.`,
      detail: `Cette situation est souvent liée à un habitat dispersé ou à un département classé en zone "peu dense non rentable" par l'ARCEP. Des plans de déploiement publics (Réseau d'Initiative Publique) sont en cours dans la plupart de ces zones — vérifier l'avancement sur telecom.gouv.fr ou contacter directement votre futur propriétaire.`,
    },
  };

  const context = tierContext[tier];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${slug}` },
    { name: "Connexion internet", path: `/villes/${slug}/connexion-internet` },
  ]);

  const faq = faqJsonLd([
    {
      q: `La fibre est-elle disponible à ${city.name} ?`,
      a: `Le score de connexion internet estimé pour ${city.name} est de ${score.toFixed(1)}/10 — niveau "${label}". Ce score reflète la couverture fibre FTTH de la région ${city.region} (données ARCEP T4 2024), un bonus de densité urbaine et la performance télétravail de la ville. Pour confirmer la disponibilité à votre adresse exacte, utilisez le test ARCEP sur telecom.gouv.fr.`,
    },
    {
      q: `Quels débits peut-on espérer à ${city.name} ?`,
      a: tier === "tres-bonne" || tier === "bonne"
        ? `À ${city.name}, la fibre FTTH offre généralement des débits descendants jusqu'à 1 Gbit/s et ascendants de 700 Mbit/s à 1 Gbit/s selon l'opérateur. Ces débits sont largement suffisants pour le télétravail, la visioconférence simultanée et le streaming 4K.`
        : `À ${city.name}, les débits varient selon la technologie disponible à l'adresse : fibre FTTH (1 Gbit/s), câble FTTLA (100-700 Mbit/s), VDSL2 (30-100 Mbit/s) ou ADSL (< 20 Mbit/s). Vérifier impérativement à l'adresse exacte avant de souscrire.`,
    },
    {
      q: `Comment vérifier la fibre à mon adresse à ${city.name} avant de signer ?`,
      a: `Utilisez l'outil de test d'éligibilité sur telecom.gouv.fr (ARCEP) qui référence toutes les technologies disponibles adresse par adresse sur l'ensemble du territoire. Vous pouvez également consulter les sites des opérateurs (Orange, SFR, Bouygues, Free) directement — chacun propose un test d'éligibilité qui indique les offres disponibles et les débits réels garantis.`,
    },
    {
      q: `La couverture mobile est-elle bonne à ${city.name} ?`,
      a: `La couverture 4G est quasi-universelle en zone urbaine en France. La 5G est déployée dans la majorité des grandes agglomérations. Pour ${city.name}, vérifiez la couverture opérateur par opérateur sur le site de l'ARCEP (monreseaumobile.fr) — la carte est mise à jour trimestriellement.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Villes", href: "/villes" },
              { label: city.name, href: `/villes/${slug}` },
              { label: "Connexion internet" },
            ]}
          />
          <div className="flex items-center gap-3 mt-4 mb-2">
            <Wifi className="h-6 w-6 text-[var(--accent)] shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Connexion internet à {city.name}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Fibre, débit et couverture mobile. Score estimé d&apos;après les données de couverture ARCEP 2024
            et le score télétravail de la ville.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-10">

        <section>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold mb-5 ${tierBg[tier]}`}>
            <Wifi className="h-3.5 w-3.5" />
            {label}
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-[var(--text-primary)]">Score connexion internet</span>
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
                Estimation régionale ARCEP T4 2024. 10 = connexion excellente (fibre FTTH généralisée).
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
            <h2 className="text-base font-semibold text-[var(--text-primary)]">Vérifier à mon adresse</h2>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5">
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Le score ci-dessus est une estimation régionale. La disponibilité réelle de la fibre varie
              immeuble par immeuble — surtout dans les zones en cours de déploiement.
            </p>
            <a
              href="https://www.telecom.gouv.fr/accueil-telecom/deploiement-des-reseaux/la-couverture-du-territoire/la-couverture-fixe-et-mobile-en-france"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Tester mon éligibilité sur telecom.gouv.fr
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            Ce qui détermine le score
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5 space-y-4 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>{context.detail}</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">Couverture fibre régionale (ARCEP T4 2024)</strong> —
                  taux de locaux raccordables au FTTH par région, principal déterminant du score.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">Score télétravail de la ville</strong> —
                  proxy de l&apos;attractivité pour les profils télétravailleur, corrélé à la qualité
                  perçue de la connexion.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">Densité urbaine</strong> —
                  les grandes agglomérations bénéficient d&apos;un déploiement fibre plus dense
                  et d&apos;une concurrence accrue entre opérateurs.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                <span>
                  <strong className="text-[var(--text-primary)]">Département</strong> —
                  certains départements ruraux (Creuse, Ariège, Lozère…) sont classés en zones
                  "peu denses non rentables" par l&apos;ARCEP et font l&apos;objet de RIP (Réseaux d&apos;Initiative
                  Publique) en cours de déploiement.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">
            Conseils avant de signer un bail
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5 space-y-3">
            {[
              "Tester l'éligibilité à l'adresse exacte sur le site de chaque opérateur avant de signer — la disponibilité varie parfois d'un immeuble à l'autre dans la même rue.",
              "Vérifier si le logement est raccordé (prise fibre en place) ou seulement raccordable (démarches et délais supplémentaires à prévoir).",
              "Demander au propriétaire ou à l'agence si une prise fibre optique (PTO) est déjà installée dans l'appartement.",
              "En zone blanche ou grise, les offres 4G/5G box peuvent remplacer avantageusement une connexion fixe — comparer les débits mesurés sur nperf.com.",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 text-[var(--accent)] shrink-0 mt-0.5" />
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{tip}</p>
              </div>
            ))}
            <p className="text-xs text-[var(--text-tertiary)] pt-1">
              Source : ARCEP, telecom.gouv.fr, monreseaumobile.fr, nperf.com.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-3">Aller plus loin</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href={`/villes/${slug}/teletravail`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all group"
            >
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  💻 Télétravail
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Coworkings, score, profils</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
            </Link>
            <Link
              href={`/villes/${slug}/s-installer`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all group"
            >
              <div>
                <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  📦 S&apos;installer
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-0.5">Logement, démarches, conseils</div>
              </div>
              <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
            </Link>
          </div>
        </section>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={`/villes/${slug}`}
            className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
          >
            ← Profil de {city.name}
          </Link>
        </div>

        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </div>

      <Footer />
    </main>
  );
}
