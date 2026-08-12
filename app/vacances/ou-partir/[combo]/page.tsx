import type { Metadata } from "next";
import { CITIES_LIGHT, type CityLight } from "@/lib/cities-light";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { CITIES_COUNT } from "@/lib/site-stats";
import { getTransit, transitTags } from "@/lib/transit";
import {
  MONTHS,
  formatMonthLabel,
  monthSignal,
  type MonthIndex,
} from "@/lib/vacation-seasons";
import { CROSSINGS, getCrossing, crossingSlug } from "@/lib/vacation-crossing";
import {
  topCitiesForMonth,
  topCitiesForProfile,
  BUDGET_TIER_LABEL,
  VACATION_PROFILES,
  VACATION_PROFILE_DEFS,
  type VacationProfile,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import {
  MapPin,
  Thermometer,
  CloudRain,
  Users,
  TrainFront,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Croisement mois × profil : « où partir en avril en famille monoparentale ».
// Le moteur savait déjà répondre (`topCitiesForMonth` accepte un profil depuis
// F61) — il manquait la surface. Aucun chiffre saisi à la main ici : tout sort
// de lib/vacation-fit, lib/vacation-seasons et lib/transit.
//
// L'adressage (un seul segment, en ASCII) et la raison de ce choix sont dans
// lib/vacation-crossing.ts — lire le bandeau avant de déplacer la route.

// Canonical FR origin is the www host (worker/index.ts 301s the apex to it).
// JSON-LD must name the canonical URL, not one that redirects.
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ combo: string }> };

export function generateStaticParams() {
  return CROSSINGS.map((c) => ({ combo: c.slug }));
}

// Le libellé d'un profil (« Seniors », « Célibataire ») ne s'insère pas tel
// quel dans « Où partir en avril … » : il faut la tournure prépositionnelle.
const PROFILE_PHRASE: Record<VacationProfile, string> = {
  famille: "en famille",
  monoparental: "en famille monoparentale",
  couple: "en couple",
  solo: "en solo",
  celibataire: "quand on est célibataire",
  amis: "entre amis",
  seniors: "quand on est senior",
};

// Ce que le profil regarde en premier, pour dire au lecteur ce que le
// classement pondère — les poids réels sont ceux de `profileFit`.
const PROFILE_PIVOT: Record<VacationProfile, string> = {
  famille: "sécurité du quotidien, qualité de vie, nature et écoles",
  monoparental: "sécurité, transports et coût — un seul adulte, un seul budget",
  couple: "culture, qualité de vie et cadre",
  solo: "sécurité, culture et facilité de déplacement",
  celibataire: "densité culturelle et vie locale, pour ne pas atterrir dans une station vide",
  amis: "culture, vie nocturne, transports et budget partagé",
  seniors: "sécurité, qualité de vie, nature et coût",
};

const POOL_SIZE = 60;
const TOP_SHOWN = 12;
const COMPARE_DEPTH = 15;

// Décimale française. `dec1` pour les scores et les températures (une
// décimale, comme partout ailleurs sur le site), `loose` pour les grandeurs
// entières par nature — « 7,0 j de pluie » n'a pas de sens.
function dec1(n: number): string {
  return n.toFixed(1).replace(".", ",");
}

function loose(n: number): string {
  return String(n).replace(".", ",");
}

function crowdLabel(c: number): string {
  return c <= 2 ? "Calme" : c === 3 ? "Modéré" : "Très fréquenté";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { combo } = await params;
  const crossing = getCrossing(combo);
  if (!crossing) return {};
  const slug = crossing.profile;
  const monthLower = formatMonthLabel(crossing.month).toLowerCase();
  const phrase = PROFILE_PHRASE[slug];
  return {
    title: `Où partir en ${monthLower} ${phrase} · 2026`,
    description: `Où partir en ${monthLower} ${phrase} : climat, affluence, budget et accès sans voiture. Classement mesuré sur ${CITIES_COUNT} villes, pas un top d'agence.`,
    alternates: { canonical: `/vacances/ou-partir/${combo}` },
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaîtrait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Où partir en ${monthLower} ${phrase}`,
      description: VACATION_PROFILE_DEFS[slug].intro,
    },
  };
}

interface CarFreePick {
  city: CityLight;
  score: number;
  tags: string[];
}

// Arriver en train ET tenir sur place sans louer de voiture. Même règle que
// la section « sans voiture » du profil monoparental : gare TGV/RER d'un côté,
// réseau lourd ou score transport suffisant de l'autre.
function carFreePicks(
  pool: ReturnType<typeof topCitiesForMonth>,
): CarFreePick[] {
  return pool
    .map(({ city, fit }) => {
      const t = getTransit(city.slug);
      const arrivable = !!(t.tgv || t.rer);
      const local = !!(t.metro || t.tram || t.bhns) || city.scores.transport >= 6.8;
      if (!arrivable || !local) return null;
      return { city, score: fit.score, tags: transitTags(t) };
    })
    .filter((d): d is CarFreePick => d !== null)
    .slice(0, 8);
}

export default async function MoisProfilPage({ params }: Props) {
  const { combo } = await params;
  const crossing = getCrossing(combo);
  if (!crossing) notFound();
  const { month: idx, monthSlug: mois, profile: slug } = crossing;
  const def = VACATION_PROFILE_DEFS[slug];
  const label = formatMonthLabel(idx);
  const monthLower = label.toLowerCase();
  const phrase = PROFILE_PHRASE[slug];

  // Même seuil de population que le classement par profil (8 000 hab.), pour
  // que la comparaison des deux classements porte sur le même vivier.
  const pool = topCitiesForMonth(idx, CITIES_LIGHT, {
    profile: slug,
    limit: POOL_SIZE,
    minPop: 8_000,
  });
  const top = pool.slice(0, TOP_SHOWN);
  const profileOnly = topCitiesForProfile(slug, CITIES_LIGHT, { limit: POOL_SIZE });

  // Repères du mois, mesurés sur le haut de classement affiché.
  const signals = top.map(({ city }) => monthSignal(city, idx));
  const median = (xs: number[]) => {
    const s = [...xs].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 10) / 10;
  };
  const medTemp = median(signals.map((s) => s.tempAvg));
  const medRain = median(signals.map((s) => s.rainDays));
  const calmShare = signals.filter((s) => s.crowded <= 2).length;

  // Ce que le mois change : entrants et sortants face au classement du profil
  // seul (le même profil, sans contrainte de saison).
  const profileTopSlugs = new Set(profileOnly.slice(0, COMPARE_DEPTH).map((r) => r.city.slug));
  const monthTopSlugs = new Set(pool.slice(0, COMPARE_DEPTH).map((r) => r.city.slug));
  const entrantsAll = pool.slice(0, COMPARE_DEPTH).filter((r) => !profileTopSlugs.has(r.city.slug));
  const sortantsAll = profileOnly
    .slice(0, COMPARE_DEPTH)
    .filter((r) => !monthTopSlugs.has(r.city.slug));
  const entrants = entrantsAll.slice(0, 6);
  const sortants = sortantsAll.slice(0, 6);

  // « Ce qu'avril », « Ce qu'août », « Ce qu'octobre » — l'élision se calcule,
  // elle ne se rend pas en JSX (les nœuds texte y sont séparés par un blanc).
  const ceQue = /^[aeiouâàéèêîôûù]/i.test(monthLower)
    ? `Ce qu'${monthLower}`
    : `Ce que ${monthLower}`;

  const carFree = carFreePicks(pool);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Vacances", path: "/vacances" },
    { name: label, path: `/vacances/mois/${mois}` },
    { name: def.label, path: `/vacances/ou-partir/${combo}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Où partir en ${monthLower} ${phrase} — meilleures destinations`,
    itemListElement: top.slice(0, 10).map(({ city }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/villes/${city.slug}`,
      name: city.name,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <Navbar />

      <section className="relative overflow-hidden pt-12 pb-10 sm:pt-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:underline">Accueil</Link>
            <span className="mx-1">·</span>
            <Link href="/vacances" className="hover:underline">Vacances</Link>
            <span className="mx-1">·</span>
            <Link href={`/vacances/mois/${mois}`} className="hover:underline">{label}</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">{def.label}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Où partir en <span className="font-display italic gradient-text-anim">{monthLower}</span>{" "}
            {phrase}&nbsp;?
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Le classement général du mois ne dit rien de qui voyage. Celui-ci croise les
            deux : d&apos;un côté le climat et l&apos;affluence de {monthLower}, de
            l&apos;autre ce que ce profil regarde en premier — {PROFILE_PIVOT[slug]}.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge>{pool.length} destinations classées</Badge>
            <Badge>{dec1(medTemp)} °C de médiane sur le top {TOP_SHOWN}</Badge>
            <Badge>{loose(medRain)} j de pluie</Badge>
            <Badge>
              {calmShare}/{TOP_SHOWN} à affluence faible
            </Badge>
          </div>
        </div>
      </section>

      {/* Top du mois pour ce profil */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top {TOP_SHOWN} en {monthLower} {phrase}
        </h2>
        <div className="space-y-3">
          {top.map(({ city, fit }, i) => {
            const sig = monthSignal(city, idx);
            return (
              <Card key={city.slug}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 shrink-0">
                    <span className="text-2xl font-bold font-mono-data text-[var(--text-tertiary)]">
                      #{i + 1}
                    </span>
                    <span className="text-xl font-bold font-mono-data text-[var(--accent)]">
                      {dec1(fit.score)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between flex-wrap gap-2 mb-1">
                      <Link
                        href={`/villes/${city.slug}`}
                        className="text-lg font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {city.name}
                      </Link>
                      <span className="text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {city.department}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-snug mb-2">
                      {fit.whyOneLine}
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px]">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Thermometer className="h-3 w-3" />
                        {dec1(sig.tempAvg)} °C
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <CloudRain className="h-3 w-3" />
                        {sig.rainDays} j pluie
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Users className="h-3 w-3" />
                        {crowdLabel(sig.crowded)}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                        Profil {def.label.toLowerCase()} : {dec1(fit.profileScore)}/10
                      </span>
                      <span className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)] font-mono-data">
                        {BUDGET_TIER_LABEL[fit.budgetTier]}
                      </span>
                    </div>
                    <div className="mt-3">
                      <BookingCTA cityName={city.name} variant="compact" month={idx} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Ce que le mois change */}
      {(entrants.length > 0 || sortants.length > 0) && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            {ceQue} change
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl">
            Comparaison avec le classement{" "}
            <Link href={`/vacances/profil/${slug}`} className="underline">
              {def.label.toLowerCase()}
            </Link>{" "}
            pris hors saison, sur le même vivier de villes :{" "}
            <strong>
              {entrantsAll.length} des {COMPARE_DEPTH} premiers changent
            </strong>{" "}
            une fois la date posée.{" "}
            {entrantsAll.length >= COMPARE_DEPTH / 2
              ? `En ${monthLower}, la saison décide donc davantage que le profil.`
              : `Le socle du profil tient donc largement en ${monthLower}.`}{" "}
            Ci-dessous les mouvements les plus nets.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                {monthLower.charAt(0).toUpperCase() + monthLower.slice(1)} les fait entrer
              </h3>
              {entrants.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)]">
                  Aucune : en {monthLower}, le haut du classement de ce profil ne bouge pas.
                </p>
              ) : (
                <ul className="space-y-2">
                  {entrants.map(({ city, fit }) => {
                    const sig = monthSignal(city, idx);
                    return (
                      <li key={city.slug} className="text-sm">
                        <Link
                          href={`/villes/${city.slug}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {city.name}
                        </Link>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {" "}— {dec1(sig.tempAvg)} °C, {sig.rainDays} j de pluie,{" "}
                          {crowdLabel(sig.crowded).toLowerCase()} · score {dec1(fit.score)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
            <Card>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-1.5">
                <ArrowDownRight className="h-4 w-4 text-amber-600" />
                Et ce qu&apos;il fait reculer
              </h3>
              {sortants.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)]">
                  Aucune : les valeurs sûres du profil tiennent aussi en {monthLower}.
                </p>
              ) : (
                <ul className="space-y-2">
                  {sortants.map(({ city }) => {
                    const sig = monthSignal(city, idx);
                    return (
                      <li key={city.slug} className="text-sm">
                        <Link
                          href={`/villes/${city.slug}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                        >
                          {city.name}
                        </Link>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {" "}— {dec1(sig.tempAvg)} °C, {sig.rainDays} j de pluie,{" "}
                          {crowdLabel(sig.crowded).toLowerCase()} ce mois-ci
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </div>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">
            Reculer n&apos;est pas être disqualifié : ces villes restent bien notées pour ce
            profil, elles sont simplement moins dans leur saison en {monthLower}.
          </p>
        </section>
      )}

      {/* Sans voiture */}
      {carFree.length >= 2 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
            <TrainFront className="h-5 w-5 text-[var(--accent)]" aria-hidden />
            En {monthLower}, sans louer de voiture
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4 max-w-2xl">
            {slug === "monoparental"
              ? "Un seul adulte au volant, c'est aussi un seul adulte qui ne conduit pas si on prend le train. Ces destinations du classement de ce mois se rejoignent en TGV ou en RER et se parcourent ensuite en réseau lourd — ou avec un score transport assez haut pour se passer de location."
              : "Ces destinations du classement de ce mois se rejoignent en TGV ou en RER et se parcourent ensuite en métro, tram ou BHNS — ou avec un score transport assez haut pour se passer d'une location."}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {carFree.map(({ city, score, tags }) => (
              <Link
                key={city.slug}
                href={`/villes/${city.slug}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {city.name}
                  </span>
                  <span className="text-xs font-mono-data font-bold text-[var(--accent)] shrink-0">
                    {dec1(score)}
                  </span>
                </div>
                <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                  {tags.length > 0
                    ? tags.join(" · ")
                    : `Score transport ${dec1(city.scores.transport)}/10`}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Croisements : les autres mois pour ce profil */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Le même profil, mois par mois
        </h2>
        <div className="flex flex-wrap gap-2 mb-6">
          {MONTHS.map((m, i) => {
            const mi = (i + 1) as MonthIndex;
            if (mi === idx) return null;
            return (
              <Link
                key={m}
                href={`/vacances/ou-partir/${crossingSlug(mi, slug)}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                {formatMonthLabel(mi)}
              </Link>
            );
          })}
        </div>

        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Le même mois, avec qui d&apos;autre
        </h2>
        <div className="flex flex-wrap gap-2">
          {VACATION_PROFILES.filter((p) => p !== slug).map((p) => (
            <Link
              key={p}
              href={`/vacances/ou-partir/${crossingSlug(idx, p)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
            >
              <span aria-hidden>{VACATION_PROFILE_DEFS[p].emoji}</span>
              {VACATION_PROFILE_DEFS[p].label}
            </Link>
          ))}
          <Link
            href={`/vacances/mois/${mois}`}
            className="rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← Tout {monthLower}
          </Link>
          <Link
            href={`/vacances/profil/${slug}`}
            className="rounded-full border border-[var(--accent)]/40 px-3 py-1 text-xs font-medium text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
          >
            Profil {def.label.toLowerCase()} toute l&apos;année
          </Link>
        </div>
      </section>

      {/* Méthodo */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-14">
        <Card className="bg-[var(--bg-elevated)]/40">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Comment ce classement est construit
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Score composite = adéquation saisonnière (~45 %) + profil voyageur (~25 %) +
            qualité globale de la ville (~30 %). Le profil{" "}
            <strong>{def.label.toLowerCase()}</strong> agrège différemment les scores du
            site ({PROFILE_PIVOT[slug]}). Climat mensuel issu des normales Météo-France
            1991-2020 de la station la plus proche, complété par interpolation quand la
            station n&apos;expose pas la variable ; affluence estimée depuis les
            caractéristiques de la ville, modulée par le mois. Filtre population
            ≥ 8 000 hab., le même que le classement par profil — c&apos;est ce qui rend les
            deux comparables.
            <br /><br />
            <strong>À lire dans le bon sens :</strong> la saison pèse plus lourd que le
            profil dans le composite. Cette page répond donc à « parmi ce qui se tient en{" "}
            {monthLower}, qu&apos;est-ce qui va le mieux à ce profil », pas à « quelle est
            la meilleure destination pour ce profil ». Pour cette seconde question, le{" "}
            <Link href={`/vacances/profil/${slug}`} className="underline">
              classement du profil
            </Link>{" "}
            est le bon point d&apos;entrée.
            <br /><br />
            <strong>Limites connues :</strong> climat interpolé à ±1,5 °C, aucune donnée de
            prix en temps réel, affluence qualitative (1-5) et non chiffrée.
            <Link href="/methode" className="underline ml-1">Méthodologie complète</Link>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Données climat Météo-France</Badge>
            <Badge>{CITIES_COUNT} villes scorées</Badge>
          </div>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
