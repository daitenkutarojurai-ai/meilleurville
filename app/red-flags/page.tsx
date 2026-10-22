import { Metadata } from "next";
import type { CSSProperties } from "react";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ContributionStats } from "@/components/ContributionStats";
import { CommentSection } from "@/components/CommentSection";
import { AlertTriangle, Volume2, Droplets, Wind, Shield, Flame, Zap, ArrowRight } from "lucide-react";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_SEED } from "@/data/cities-seed";
import { vigilanceSummary } from "@/lib/red-flags-summary";
import { RED_FLAG_THEMES } from "@/lib/red-flag-themes";
import { pathAlternates } from "@/lib/i18n";
import { ReportCTA } from "@/components/ReportCTA";

export const metadata: Metadata = {
  title: "Red Flag Radar · Signalements communautaires",
  description:
    "Découvrez les alertes et signalements communautaires : bruit, inondation, pollution, insécurité. Ce que l'annonce immobilière ne vous dit jamais.",
  alternates: pathAlternates("/red-flags", "/red-flags"),
};

const redFlagsBreadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Red Flags", path: "/red-flags" },
]);

// Carte & plaque (CLAUDE.md) : chaque famille de red flag est un symbole de
// légende hachuré brique, comme sur la RedFlagTeaser de la home. Le rouge, le
// vert, l'orange et le violet restent réservés aux paliers de score.
const HATCH: CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(135deg, color-mix(in srgb, var(--accent-pink) 16%, transparent) 0 2px, transparent 2px 6px)",
};

const FLAG_CATEGORIES = [
  {
    id: "bruit",
    label: "Bruit",
    icon: Volume2,
    examples: ["Couloir aérien", "Autoroute proche", "Voie ferrée", "Bar / discothèque"],
  },
  {
    id: "inondation",
    label: "Inondation & Eau",
    icon: Droplets,
    examples: ["Zone inondable PPRi", "Sous-sol humide récurrent", "Cave inondée", "Ruissellement urbain"],
  },
  {
    id: "pollution",
    label: "Pollution",
    icon: Wind,
    examples: ["PM2.5 élevé", "Zone industrielle proche", "Site pollué BASIAS", "Pesticides agricoles"],
  },
  {
    id: "securite",
    label: "Sécurité",
    icon: Shield,
    examples: ["Cambriolages fréquents", "Dégradations récurrentes", "Squat identifié", "Éclairage insuffisant"],
  },
  {
    id: "construction",
    label: "Construction & Chantier",
    icon: Flame,
    examples: ["Chantier ≥ 2 ans prévu", "Démolition programmée", "PLU modification", "Promoteur actif"],
  },
  {
    id: "infrastructure",
    label: "Infrastructures",
    icon: Zap,
    examples: ["Fibre non disponible", "Coupures électricité", "Réseau eau dégradé", "Route défoncée"],
  },
];


// `/parent-solo` classe les communes au-dessus de 20 000 habitants (`MIN_POP`
// dans `app/parent-solo/page.tsx`), pas les 540 du site : le nombre annoncé ici
// est dérivé du même filtre pour qu'il ne puisse pas dériver de la page qu'il
// décrit — elle imprime elle-même « N villes classées ».
const PARENT_SOLO_MIN_POP = 20_000;
const PARENT_SOLO_RANKED = CITIES_SEED.filter((c) => c.population >= PARENT_SOLO_MIN_POP).length;

// Featured fiches: highest-vigilance cities surface first — that's what users
// land on /red-flags to read. Limited to top 18 to keep the section scannable.
function featuredFiches() {
  return [...CITIES_SEED]
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      department: c.department,
      safety: c.scores.safety,
      cost: c.scores.cost,
      vigilance: vigilanceSummary(c),
    }))
    .sort((a, b) => b.vigilance.score - a.vigilance.score)
    .slice(0, 18);
}

export default function RedFlagsPage() {
  const fiches = featuredFiches();
  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(redFlagsBreadcrumb)} />
      <Navbar />

      {/* Header */}
      <section className="topo-bg border-b border-[var(--border)] bg-[var(--bg-canvas)]">
        {/* Voile papier : le relief reste lisible sans traverser le texte. */}
        <div className="bg-[var(--bg-canvas)]/80 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="mb-4 inline-flex items-center gap-2 border-b border-[var(--accent-pink)]/40 pb-1 font-mono-data text-xs font-semibold uppercase tracking-widest text-[var(--accent-pink)]">
            <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
            Red Flag Radar
          </p>
          <h1 className="mb-4 text-3xl sm:text-5xl font-bold leading-[1.05] tracking-tight text-[var(--text-primary)]">
            Ce que l&apos;annonce immobilière{" "}
            <span className="font-display italic text-[var(--accent-pink)]">ne vous dira jamais.</span>
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)] text-lg">
            On agrège les données ouvertes (Géorisques, ATMO, SSMSI) et on ouvre la discussion
            aux habitants : ce que les annonces immobilières taisent — bruit, inondations,
            pollution, insécurité — vous le voyez avant la signature.
          </p>
          <ReportCTA variant="inline" className="mt-5" kinds={["red-flag", "erreur"]} />
        </div>
      </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
        {/* F4 — Thematic red-flag pages (data-driven rankings) */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
              Red Flags thématiques
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {RED_FLAG_THEMES.length} classements data-driven. Touchez une vignette pour voir les villes concernées.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:auto-rows-fr">
            {RED_FLAG_THEMES.map((t, i) => (
              <Link
                key={t.slug}
                href={`/red-flags/${t.slug}`}
                className="group h-full rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-sm hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--accent-pink)] transition-all p-4 flex flex-col gap-2"
              >
                <span className="flex items-center justify-between gap-2">
                  <EmojiBadge emoji={t.emoji} tone={toneFor(i)} size="md" />
                  <span className="font-mono-data text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-pink)]">
                    N° {String(i + 1).padStart(2, "0")}
                  </span>
                </span>
                <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)] transition-colors">
                  {t.title}
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  {t.intro.slice(0, 110)}…
                </p>
                <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)]">
                  Voir le classement <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Per-city fiches — surfaced first: that's what users actually want when
            landing on /red-flags. Sorted worst-first to highlight what to read. */}
        <div>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                Fiches red-flag par ville
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Neuf catégories de risques croisées avec Géorisques, SSMSI, ATMO et BRGM. Une fiche
                disponible pour chacune des {CITIES_SEED.length} villes — les plus exposées d&apos;abord.
              </p>
            </div>
            <Link
              href="/villes"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline shrink-0"
            >
              Toutes les villes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fiches.map((f) => (
              <Link
                key={f.slug}
                href={`/red-flags/${f.slug}`}
                className={`group rounded-md border ${f.vigilance.ring} hover:border-[var(--accent-pink)] transition-colors p-4 flex flex-col gap-2`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)] transition-colors truncate">
                      {f.name}
                    </div>
                    <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                      {f.department}
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent-pink)] flex-shrink-0 transition-colors" />
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-dashed border-[var(--border)]">
                  <span className={`text-xs font-semibold ${f.vigilance.tone}`}>
                    {f.vigilance.label}
                  </span>
                  {f.vigilance.criticalCount > 0 && (
                    <span className="text-[10px] font-mono text-[var(--text-tertiary)]">
                      {f.vigilance.criticalCount} signal{f.vigilance.criticalCount > 1 ? "s" : ""} fort{f.vigilance.criticalCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Toutes les {CITIES_SEED.length} villes ont leur fiche : <code className="text-[var(--text-secondary)]">/red-flags/&lt;slug-de-la-ville&gt;</code>.
          </p>
        </div>

        {/* Honest stats — derived from canonical sources, not hardcoded */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-md border border-[var(--text-primary)]/15 bg-[var(--text-primary)]/15">
          {[
            { label: "Catégories surveillées", value: FLAG_CATEGORIES.length.toString() },
            { label: "Sources publiques", value: "5" }, // Géorisques, ATMO, SSMSI, BRGM, Insee
            { label: "Villes couvertes", value: CITIES_SEED.length.toString() },
            { label: "Données ouvertes", value: "100%" },
          ].map(({ label, value }, i) => (
            <div key={label} className="bg-[var(--bg-surface)] px-4 py-5 text-center">
              <div className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)] mb-2" aria-hidden="true">
                N° {String(i + 1).padStart(2, "0")}
              </div>
              <div className="text-2xl font-bold font-mono-data mb-1 text-[var(--accent)]">{value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Categories — secondary, explains the methodology behind the fiches */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Catégories de signalements
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Les six familles de red flags suivies sur chaque fiche ville.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLAG_CATEGORIES.map(({ id, label, icon: Icon, examples }, i) => (
              <div key={id} className="rounded-md border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="flex items-center gap-4 mb-3 border-b border-[var(--text-primary)]/15 pb-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-2 border-[var(--accent-pink)] bg-[var(--bg-surface)] text-[var(--accent-pink)]"
                    style={HATCH}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <h3 className="min-w-0 flex-1 font-semibold text-[var(--text-primary)]">{label}</h3>
                  <span className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--text-tertiary)]" aria-hidden="true">
                    R{i + 1}
                  </span>
                </div>
                <ul className="space-y-1">
                  {examples.map((ex) => (
                    <li key={ex} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <span className="h-px w-2 bg-[var(--accent-pink)] flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Community stats */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            La communauté en action
          </h2>
          <ContributionStats />
        </div>

        {/* Contribute CTA */}
        <div className="topo-bg rounded-md border border-[var(--border)] bg-[var(--bg-canvas)] p-1.5">
        <div className="rounded border border-[var(--text-primary)]/15 bg-[var(--bg-surface)]/90 p-8 sm:p-10 text-center">
          <span className="plaque plaque-small mx-auto mb-4 flex h-12 w-12 items-center justify-center" aria-hidden="true">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Vous connaissez un problème non signalé ?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Aidez des milliers de personnes à éviter une mauvaise surprise.
            Les signalements vérifiés par 3+ utilisateurs sont publiés.
          </p>
          <Link
            href="/contact?topic=red-flag"
            className="inline-flex items-center gap-2 rounded-sm border-2 border-[var(--accent-pink)] bg-[var(--bg-surface)] px-6 py-3 font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--accent-pink)] hover:text-white"
          >
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Signaler un point noir
          </Link>
        </div>
        </div>

        {/* Texte de lecture — en fin de page depuis le 2026-10-17 (demande du
            propriétaire : les vignettes d'abord, le texte ensuite). */}
        <section aria-labelledby="pour-aller-plus-loin" className="max-w-3xl">
          <h2 id="pour-aller-plus-loin" className="text-xl font-bold text-[var(--text-primary)] mb-3">
            Pour aller plus loin
          </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {RED_FLAG_THEMES.length} angles de lecture data-driven : regrets d&apos;achat, vivre
              sans voiture difficile, villes belles mais invivables l&apos;été, air irrespirable
              l&apos;hiver, risques naturels (Géorisques), bruit cauchemar, manque d&apos;eau l&apos;été
              (Propluvia / BRGM), désert médical (DREES / CNOM / ARS), chômage élevé, cadre
              de vie tendu, coûts explosifs, désert de services publics, villes anti-vélo,
              vieillissement critique, sécurité nocturne tendue, hivers rudes, logement
              locatif introuvable, économies mono-touristiques (saison morte), fuite
              silencieuse des 25-35 ans et fiscalité immobilière la plus lourde (DGFiP / OFL).
            </p>
            <p className="mt-3 text-sm text-[var(--text-secondary)]">
              Ces angles sont universels ; pour une lecture calibrée sur un profil précis, croisez
              plutôt avec le{" "}
              <Link href="/pour-qui/sensibles-au-bruit" className="text-[var(--accent)] hover:underline">
                classement villes pour sensibles au bruit
              </Link>
              , les{" "}
              <Link href="/pour-qui/asthmatiques-allergiques" className="text-[var(--accent)] hover:underline">
                villes pour asthmatiques et allergiques
              </Link>{" "}
              ou l&apos;ensemble des{" "}
              <Link href="/pour-qui" className="text-[var(--accent)] hover:underline">
                33 profils de vie
              </Link>{" "}
              qui repondèrent les axes selon ce qui compte pour vous.
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Certains red flags se déclenchent surtout sur un revenu fixe : la facture
              énergétique est le cas d&apos;école. Le classement des{" "}
              <Link href="/red-flags/villes-chauffage-hivernal-couteux" className="text-[var(--accent)] hover:underline">
                villes où le chauffage hivernal pèse le plus sur le salaire local
              </Link>{" "}
              croise la facture ADEME d&apos;un T2 (zone H1a-b-c, correction altitude) avec le
              net médian départemental — un ratio à intégrer avant tout achat en Creuse,
              Cantal, Lozère, Vosges, Haute-Marne ou en montagne habitée.
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Le déclencheur est différent — mais tout aussi silencieux — pour un
              foyer avec un enfant de 0-3 ans : le classement des{" "}
              <Link href="/red-flags/villes-manque-de-creches" className="text-[var(--accent)] hover:underline">
                villes où la place de crèche est un vrai goulot d&apos;étranglement
              </Link>{" "}
              croise le taux Onape de couverture places de crèche par département
              avec la pression foncière et la densité, sur Paris intra-muros, la
              Petite et Grande Couronne, la Riviera et l&apos;ensemble des DROM. Un
              critère à sortir avant tout congé maternité ou déménagement, avant
              même la question école.
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Quand ces déclencheurs se cumulent sur un seul revenu et un seul
              conducteur, le classement des{" "}
              <Link href="/parent-solo" className="text-[var(--accent)] hover:underline">
                villes qui tiennent en parent solo
              </Link>{" "}
              re-priorise coût, transports, écoles et sécurité (mêmes poids que le
              profil City Match dédié) sur les {PARENT_SOLO_RANKED} villes du site
              qui dépassent 20 000 habitants, avec le
              loyer T3 moyen et le revenu net minimum estimé par ville — les
              red flags budget-énergie et crèche s&apos;y lisent en creux.
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Le prix au m² très en dessous du marché régional a presque toujours une
              explication, et elle est mesurée : le classement des{" "}
              <Link href="/red-flags/villes-pauvrete-elevee" className="text-[var(--accent)] hover:underline">
                villes où la pauvreté monétaire pèse au quotidien
              </Link>{" "}
              retient les communes ≥ 20 000 hab. dont le taux Insee Filosofi 2021 dépasse
              22 %, contre 14,4 % de moyenne nationale. Ce n&apos;est ni un verdict sur les
              habitants ni un pronostic de trajectoire — c&apos;est le chiffre qui structure
              la carte scolaire, l&apos;offre commerciale de proximité et l&apos;équilibre du
              parc locatif du bassin, et que l&apos;annonce remplace par « quartier en
              pleine reconversion ».
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Le red flag{" "}
              <Link href="/red-flags/villes-desert-medical" className="text-[var(--accent)] hover:underline">
                désert médical
              </Link>{" "}
              dit où l&apos;accès aux soins s&apos;effondre ; il ne dit pas où aller quand
              on ne peut pas s&apos;en passer. C&apos;est l&apos;objet des{" "}
              <Link href="/pour-qui/suivi-medical-regulier" className="text-[var(--accent)] hover:underline">
                villes pour un suivi médical régulier
              </Link>
              , seule page du site où l&apos;accès aux soins est le critère cardinal :
              elle le croise avec le trajet répété, le coût restant à charge et la
              résistance à la canicule, et elle rappelle que l&apos;indicateur reste
              une estimation départementale, pas un relevé de cabinets. Pour un
              soignant, la même carte se lit à l&apos;envers : la page{" "}
              <Link href="/pour-qui/professionnels-de-sante" className="text-[var(--accent)] hover:underline">
                s&apos;installer là où l&apos;on manque de soignants
              </Link>{" "}
              classe les villes sur la pénurie plutôt que sur l&apos;accès. Et pour
              qui supporte mal les étés qui s&apos;allongent, la page{" "}
              <Link href="/pour-qui/anti-canicule" className="text-[var(--accent)] hover:underline">
                villes anti-canicule
              </Link>{" "}
              retient la fraîcheur estivale comme critère de départ.
            </p>
        </section>

        <div className="mt-16">
          <CommentSection
            topic="red-flags:public"
            title="Témoignages et signalements"
            emptyHint="Vous avez vécu un truc qui ne va pas dans une ville ? Partagez-le ici (sans nommer de personnes ni d'adresses)."
          />
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-10">

        <FeedbackWidget />

      </div>

      <Footer />
    </main>
  );
}
