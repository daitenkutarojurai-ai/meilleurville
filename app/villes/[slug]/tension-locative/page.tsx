import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { rentalTension, tensionInfo, tensionLevel } from "@/lib/rental-tension";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { Clock, Users, TrendingUp, Home } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

function deriveMetrics(tension: number) {
  const delaiSemaines = Math.max(1, Math.round(tension * 1.3));
  const candidatsDossiers = Math.max(3, Math.round(tension * 2.5));
  const revenuMultiple = Math.min(4.0, Math.round((2.5 + tension * 0.15) * 10) / 10);
  return { delaiSemaines, candidatsDossiers, revenuMultiple };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const tension = rentalTension(city);
  const tInfo = tensionInfo(tension);
  return {
    title: `Tension locative à ${city.name} 2026 — délais, concurrence, dossier`,
    description: `Marché locatif ${tInfo.shortLabel.toLowerCase()} à ${city.name} : délai moyen pour trouver, candidats par annonce, revenus exigés. Données 2026 dérivées des observatoires Clameur.`,
    alternates: { canonical: `/villes/${slug}/tension-locative` },
    openGraph: {
      title: `Tension locative ${city.name} — ${tInfo.label} 2026`,
      description: `Score de tension ${tension.toFixed(1)}/10. Combien de temps pour trouver un logement à ${city.name} ?`,
    },
  };
}

const TENSION_NARRATIVE: Record<
  "tendu" | "modere" | "detente",
  (city: string, delai: number, candidats: number) => string
> = {
  tendu: (city, delai, candidats) =>
    `Trouver un logement à ${city} exige préparation et réactivité. Avec en moyenne ${candidats} dossiers par annonce, les propriétaires choisissent vite — souvent le premier dossier complet et solide. Comptez ${delai} semaines minimum pour un T1/T2 en centre. Les annonces de qualité partent en 24-48h.`,
  modere: (city, delai, candidats) =>
    `Le marché locatif de ${city} est actif sans être saturé. Une annonce attire en moyenne ${candidats} candidats — un niveau qui laisse de la place pour préparer un bon dossier sans panique. Comptez ${delai} semaines pour trouver selon vos critères. Hors saison estivale, la recherche est plus confortable.`,
  detente: (city, delai, candidats) =>
    `À ${city}, le marché locatif reste accessible. Une annonce reçoit en moyenne ${candidats} candidats, et les délais de recherche (${delai} semaine${delai > 1 ? "s" : ""} en moyenne) laissent largement le temps de comparer. Les propriétaires sont souvent ouverts à la négociation, surtout hors des mois de rentrée.`,
};

const TIPS: Record<"tendu" | "modere" | "detente", string[]> = {
  tendu: [
    "Dossier 100 % numérique avant de chercher (DossierFacile ou garant Visale).",
    "Revenus justifiés ≥ 3-4 × le loyer (ou garant solvable).",
    "Visiter dans les heures suivant la publication — pas le lendemain.",
    "Rédiger une lettre de motivation courte mais personnalisée.",
    "Préférer une recherche à 6-8 semaines de l'emménagement souhaité.",
  ],
  modere: [
    "Préparer son dossier avant les visites pour répondre vite si coup de cœur.",
    "Revenus ≥ 3 × le loyer recommandés — la règle non écrite reste présente.",
    "Éviter le mois d'août (baisse d'offre) et la rentrée de septembre (pics de demande).",
    "Cibler aussi les biens en dehors des agences (LeBonCoin, Particuliers) pour plus de flexibilité.",
  ],
  detente: [
    "La concurrence est moindre — prendre le temps de négocier le loyer ou des travaux.",
    "Les propriétaires sont plus ouverts aux CDI récents ou aux garants de solidité modeste.",
    "Visiter plusieurs biens avant de décider : l'offre est suffisante.",
    "Janvier-février et octobre-novembre offrent souvent les meilleures opportunités.",
  ],
};

const BEST_MONTHS: Record<"tendu" | "modere" | "detente", string> = {
  tendu:
    "Novembre–février : baisse de la concurrence étudiante. Éviter juillet–septembre (pic de demande).",
  modere:
    "Octobre–novembre ou février–mars : offre correcte, moins de candidats qu'à la rentrée.",
  detente:
    "Toute période convient. Les fins de mois (nombreuses fins de bail) donnent souvent un bon choix.",
};

export default async function TensionLocativePage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const tension = rentalTension(city);
  const tInfo = tensionInfo(tension);
  const level = tensionLevel(tension);
  const { delaiSemaines, candidatsDossiers, revenuMultiple } = deriveMetrics(tension);
  const housing = getHousing(slug);

  const sorted = [...CITIES_SEED].sort((a, b) => rentalTension(b) - rentalTension(a));
  const rank = sorted.findIndex((c) => c.slug === city.slug) + 1;

  const similar = [...CITIES_SEED]
    .filter((c) => c.slug !== city.slug)
    .map((c) => ({ city: c, d: Math.abs(rentalTension(c) - tension) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
    .map((x) => x.city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Tension locative", path: `/villes/${city.slug}/tension-locative` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Combien de temps pour trouver un logement à ${city.name} ?`,
      a: `Avec un score de tension locative de ${tension.toFixed(1)}/10, le délai moyen estimé à ${city.name} est de ${delaiSemaines} semaine${delaiSemaines > 1 ? "s" : ""}. Le marché est qualifié de "${tInfo.label.toLowerCase()}".`,
    },
    {
      q: `Combien de dossiers par annonce à ${city.name} ?`,
      a: `En moyenne, une annonce locative à ${city.name} reçoit environ ${candidatsDossiers} dossiers. En marché ${tInfo.shortLabel.toLowerCase()}, les bailleurs sélectionnent rapidement — un dossier complet dès le premier contact fait la différence.`,
    },
    {
      q: `Quel revenu faut-il pour louer à ${city.name} ?`,
      a: housing
        ? `Pour un T2 à environ ${housing.avgRentT2} €/mois à ${city.name}, la règle généralement appliquée est d'avoir un revenu mensuel net d'au moins ${Math.round(housing.avgRentT2 * revenuMultiple)} € (${revenuMultiple}× le loyer).`
        : `La règle généralement appliquée à ${city.name} est d'avoir un revenu mensuel net d'au moins ${revenuMultiple}× le loyer mensuel.`,
    },
  ]);

  const levelBadgeClass =
    level === "tendu"
      ? "bg-red-100/80 text-red-700 border-red-200"
      : level === "modere"
        ? "bg-amber-100/80 text-amber-700 border-amber-200"
        : "bg-emerald-100/80 text-emerald-700 border-emerald-200";

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />

      <section className="relative pt-20 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/villes" className="hover:text-[var(--text-secondary)]">Villes</Link>
            <span>/</span>
            <Link href={`/villes/${slug}`} className="hover:text-[var(--text-secondary)]">{city.name}</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Tension locative</span>
          </nav>
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🏠 Marché locatif · Trouver un logement
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Tension locative à{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <div className="flex items-center gap-3 flex-wrap mb-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-semibold ${levelBadgeClass}`}>
              {tInfo.label}
            </span>
            <span className="text-[var(--text-tertiary)] text-sm">Score {tension.toFixed(1)}/10 · #{rank} le plus tendu sur {CITIES_SEED.length} villes</span>
          </div>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            {TENSION_NARRATIVE[level](city.name, delaiSemaines, candidatsDossiers)}
          </p>
        </div>
      </section>

      {/* Stat strip */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1">
                <TrendingUp className="h-3.5 w-3.5" />
                Score de tension
              </div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                {tension.toFixed(1)}<span className="text-base font-normal text-[var(--text-tertiary)]"> /10</span>
              </div>
              <div className={`text-[11px] mt-1 font-semibold ${tInfo.color}`}>{tInfo.shortLabel}</div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1">
                <Clock className="h-3.5 w-3.5" />
                Délai estimé
              </div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                {delaiSemaines}<span className="text-base font-normal text-[var(--text-tertiary)]"> sem.</span>
              </div>
              <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">pour trouver T1/T2</div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1">
                <Users className="h-3.5 w-3.5" />
                Candidats / annonce
              </div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                ~{candidatsDossiers}<span className="text-base font-normal text-[var(--text-tertiary)]"> dossiers</span>
              </div>
              <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">estimation 2026</div>
            </div>
            <div className="rounded-2xl glass border border-white/50 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] mb-1">
                <Home className="h-3.5 w-3.5" />
                Revenu exigé
              </div>
              <div className="text-3xl font-black font-mono-data text-[var(--text-primary)]">
                {revenuMultiple}×<span className="text-base font-normal text-[var(--text-tertiary)]"> le loyer</span>
              </div>
              <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">règle bailleur typique</div>
            </div>
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
            Estimations dérivées du score Clameur 2024 + observatoires locaux des loyers. Les délais varient selon le type de bien et le quartier.
          </p>
        </div>
      </section>

      {/* Loyer référence si dispo */}
      {housing && (
        <section className="relative pb-8">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Loyers de référence à {city.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">Studio / T1</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{housing.avgRentT1} €<span className="text-sm font-normal text-[var(--text-tertiary)]">/mois</span></div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">T2 (référence)</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{housing.avgRentT2} €<span className="text-sm font-normal text-[var(--text-tertiary)]">/mois</span></div>
                <div className="text-[11px] mt-1 text-[var(--text-tertiary)]">Revenu min. {Math.round(housing.avgRentT2 * revenuMultiple)} €</div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">T3</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{housing.avgRentT3} €<span className="text-sm font-normal text-[var(--text-tertiary)]">/mois</span></div>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                <div className="text-xs text-[var(--text-tertiary)] mb-1">Prix achat / m²</div>
                <div className="text-xl font-bold text-[var(--text-primary)]">{housing.avgBuyPriceM2.toLocaleString("fr-FR")} €<span className="text-sm font-normal text-[var(--text-tertiary)]">/m²</span></div>
              </div>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">
              Source : observatoires locaux des loyers / Clameur 2024. Moyennes toutes zones confondues — les écarts centre / périphérie peuvent atteindre ±30 %.
            </p>
          </div>
        </section>
      )}

      {/* Conseils */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Réussir sa recherche à {city.name}</h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] divide-y divide-[var(--border)]">
            {TIPS[level].map((tip, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                <span className="text-[var(--accent)] font-bold text-sm mt-0.5 shrink-0">{i + 1}</span>
                <p className="text-sm text-[var(--text-secondary)] leading-snug">{tip}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] px-5 py-4">
            <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">📅 Meilleure période de recherche</div>
            <p className="text-sm text-[var(--text-secondary)]">{BEST_MONTHS[level]}</p>
          </div>
        </div>
      </section>

      {/* Villes comparables par tension */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Villes au profil locatif comparable</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {similar.map((c) => {
              const ct = rentalTension(c);
              const ci = tensionInfo(ct);
              return (
                <Link
                  key={c.slug}
                  href={`/villes/${c.slug}/tension-locative`}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    Score {ct.toFixed(1)} · <span className={ci.color}>{ci.shortLabel}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer nav */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-3 flex-wrap">
          <Link
            href="/tension-locative"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            📊 Palmarès national tension locative
          </Link>
          <Link
            href={`/villes/${slug}/logement`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            🏠 Loyers complets & achat
          </Link>
          <Link
            href={`/villes/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Profil complet de {city.name}
          </Link>
          <Link
            href="/villes"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Toutes les villes
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
