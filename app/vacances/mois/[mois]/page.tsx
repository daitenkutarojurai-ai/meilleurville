import type { Metadata } from "next";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BookingCTA } from "@/components/BookingCTA";
import { CITIES_COUNT } from "@/lib/site-stats";
import {
  MONTHS,
  monthSlugToIndex,
  formatMonthLabel,
  monthSignal,
  type MonthIndex,
} from "@/lib/vacation-seasons";
import {
  ACTIVITY_DEFS,
  type ActivitySlug,
} from "@/lib/vacation-activities";
import {
  topCitiesForMonth,
  BUDGET_TIER_LABEL,
} from "@/lib/vacation-fit";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import {
  MapPin,
  ChevronRight,
  Thermometer,
  CloudRain,
  Sun,
  Users,
} from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ mois: string }> };

export function generateStaticParams() {
  return MONTHS.map((slug) => ({ mois: slug }));
}

// Pour chaque mois, on met en avant 3 activités cohérentes saison.
const MONTH_HIGHLIGHT_ACTIVITIES: Record<MonthIndex, ActivitySlug[]> = {
  1: ["ski", "thermal", "citytrip"],
  2: ["ski", "thermal", "citytrip"],
  3: ["citytrip", "thermal", "vignobles"],
  4: ["citytrip", "vignobles", "famille"],
  5: ["citytrip", "vignobles", "famille"],
  6: ["plage", "surf", "montagne"],
  7: ["plage", "montagne", "surf"],
  8: ["plage", "montagne", "surf"],
  9: ["plage", "vignobles", "citytrip"],
  10: ["vignobles", "citytrip", "thermal"],
  11: ["thermal", "citytrip", "gastro"],
  12: ["ski", "citytrip", "thermal"],
};

const MONTH_ANGLES: Record<MonthIndex, { hook: string; warning: string }> = {
  1: {
    hook: "Janvier ressemble à un grand week-end prolongé : prix bas, calme partout, lumière rasante. Stations de ski en pleine forme, citytrips déserts.",
    warning: "Évitez la plupart des côtes — l'eau est à 12 °C, les restos ferment, et même la Provence n'a aucune raison d'y aller maintenant.",
  },
  2: {
    hook: "Février, c'est encore l'hiver et c'est tant mieux. Stations alpines à pic d'enneigement, citytrips à prix réduits, et le carnaval bat son plein de Dunkerque à Nice.",
    warning: "Vacances scolaires = stations pleines et tarifées. Si vous skiez, visez les premières ou dernières semaines du mois.",
  },
  3: {
    hook: "La nature redémarre, les mimosas explosent, le tourisme ne s'est pas encore réveillé. C'est l'un des meilleurs mois de l'année pour visiter sans foule.",
    warning: "Météo encore instable : la mer reste froide, l'altitude reste enneigée. Bon mois pour les villes, mi-saison ailleurs.",
  },
  4: {
    hook: "Le printemps installe une lumière douce et des températures correctes. Citytrips, vignobles en début de bourgeons, randonnée en moyenne altitude. Pâques met les bouchées doubles sur la fréquentation.",
    warning: "Hors vacances de Pâques, c'est le mois sweet-spot. Pendant les vacances, attendez-vous à des prix d'été en zones touristiques.",
  },
  5: {
    hook: "Mai a tout : journées longues, météo fiable au sud, vignobles ouverts, plages encore peu fréquentées. Les ponts du 1er, du 8 et de l'Ascension piquent les hôtels.",
    warning: "Mer toujours fraîche au nord (16-17 °C). Si vous visez la baignade, attendez juin.",
  },
  6: {
    hook: "Juin, c'est l'été sans le rush. Plages méditerranéennes à 21-23 °C, journées de 16 heures de jour, restos qui rouvrent. C'est aussi le mois préféré des pros du voyage.",
    warning: "Les écoles ne sont pas encore en vacances : les pères Noël touristiques sont pour juillet.",
  },
  7: {
    hook: "Juillet, c'est la haute saison qui démarre. La météo est garantie, mais le portefeuille et les bouchons aussi. Plage, montagne, festivals — tout fonctionne, tout est plein.",
    warning: "Le 14 juillet et les deux semaines suivantes sont le pic absolu sur la côte. Si vous pouvez décaler de 10 jours, faites-le.",
  },
  8: {
    hook: "Août, c'est août. Tout est ouvert, tout est plein, tout coûte +30%. La météo est avec vous, la patience des locaux un peu moins.",
    warning: "Si vous n'avez pas réservé en mars, vous galérez. À considérer : la moitié nord-ouest reste praticable et moins saturée que la Méditerranée.",
  },
  9: {
    hook: "Septembre est mathématiquement le meilleur mois de l'année. Mer encore chaude, prix qui s'écroulent dès le 1er, lumière idéale, vignobles en pleines vendanges. Le secret le mieux gardé du tourisme français.",
    warning: "Aucune mise en garde sérieuse — partez en septembre.",
  },
  10: {
    hook: "Octobre, c'est l'automne qui s'installe et qui rend la France photogénique. Forêts qui changent, vignobles qui terminent les vendanges, citytrips à prix doux.",
    warning: "Au sud, les épisodes cévenols peuvent surprendre. À l'ouest, le crachin breton fait son retour.",
  },
  11: {
    hook: "Novembre est le grand silence touristique. Pour qui aime les paysages dépouillés, les musées vides et les restos qui prennent leur temps, c'est un cadeau.",
    warning: "Beaucoup de stations balnéaires sont fermées. Visez les villes, les vignobles ou le thermal.",
  },
  12: {
    hook: "Décembre, c'est l'illumination des villes, les marchés de Noël (Strasbourg, Colmar, Lille) et l'ouverture des stations. Période chargée mais magique.",
    warning: "Les marchés de Noël emblématiques sont saturés les week-ends et la dernière semaine. Allez-y en semaine.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { mois } = await params;
  const idx = monthSlugToIndex(mois);
  if (!idx) return {};
  const label = formatMonthLabel(idx);
  return {
    title: `Où partir en France en ${label.toLowerCase()} 2026 · meilleures destinations`,
    description: `Le top des destinations françaises en ${label.toLowerCase()} : climat, affluence, activités. ${CITIES_COUNT} villes classées par score d'adéquation au mois. ${MONTH_ANGLES[idx].hook.slice(0, 60)}…`,
    alternates: { canonical: `/vacances/mois/${mois}` },
    openGraph: {
      title: `Où partir en France en ${label.toLowerCase()}`,
      description: `Climat, foule, prix : le bon classement, sans listicle de magazine.`,
    },
  };
}

export default async function MoisPage({ params }: Props) {
  const { mois } = await params;
  const idx = monthSlugToIndex(mois);
  if (!idx) notFound();
  const label = formatMonthLabel(idx);

  const top30 = topCitiesForMonth(idx, CITIES_LIGHT, { limit: 30 });
  const angles = MONTH_HIGHLIGHT_ACTIVITIES[idx];
  const angle = MONTH_ANGLES[idx];

  // Top 3 par activité du mois
  const topsByActivity = angles.map((slug) => ({
    activity: slug,
    list: topCitiesForMonth(idx, CITIES_LIGHT, { activity: slug, limit: 3 }),
  }));

  // Top destinations "calmes" (crowded <= 2)
  const calmPicks = top30
    .filter(({ city }) => monthSignal(city, idx).crowded <= 2)
    .slice(0, 5);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Vacances", path: "/vacances" },
    { name: label, path: `/vacances/mois/${mois}` },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Meilleures destinations en France en ${label.toLowerCase()}`,
    itemListElement: top30.slice(0, 10).map(({ city }, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://mavilleideale.fr/villes/${city.slug}`,
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
            <span className="text-[var(--text-secondary)]">{label}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Où partir en France en <span className="font-display italic gradient-text-anim">{label.toLowerCase()}</span>&nbsp;?
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            {angle.hook}
          </p>
          <div className="mt-4 rounded-xl border border-amber-300/40 bg-amber-50/40 px-4 py-3 text-sm text-[var(--text-primary)]">
            <span className="font-semibold text-amber-700">⚠️ À savoir : </span>
            {angle.warning}
          </div>
          {(idx === 7 || idx === 8) && (
            <div className="mt-3 rounded-xl border border-red-300/40 bg-red-50/40 px-4 py-3 text-sm text-[var(--text-primary)]">
              <span className="font-semibold text-red-700">🥵 Vacances ≠ vie sur place : </span>
              en {label.toLowerCase()}, les cartes postales sud méditerranéennes
              cachent des étés à 34-38 °C. Si vous envisagez de vous y installer
              plutôt que d&apos;y séjourner, lisez le classement des{" "}
              <Link href="/red-flags/villes-belles-invivables-ete" className="underline text-red-700">
                villes belles mais invivables l&apos;été
              </Link>
              .
            </div>
          )}
        </div>
      </section>

      {/* Top 10 du mois */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Top 10 destinations en {label.toLowerCase()}
        </h2>
        <div className="space-y-3">
          {top30.slice(0, 10).map(({ city, fit }, i) => {
            const sig = monthSignal(city, idx);
            return (
              <Card key={city.slug}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex items-center gap-3 sm:flex-col sm:items-center sm:gap-1 shrink-0">
                    <span className="text-2xl font-bold font-mono-data text-[var(--text-tertiary)]">
                      #{i + 1}
                    </span>
                    <span className="text-xl font-bold font-mono-data text-[var(--accent)]">
                      {fit.score.toFixed(1)}
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
                        {sig.tempAvg} °C
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <CloudRain className="h-3 w-3" />
                        {sig.rainDays} j pluie
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Sun className="h-3 w-3" />
                        {sig.sunHoursPerDay} h soleil/j
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[var(--text-secondary)]">
                        <Users className="h-3 w-3" />
                        {sig.crowded <= 2 ? "Calme" : sig.crowded === 3 ? "Modéré" : "Très fréquenté"}
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

      {/* Par activité */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Par envie ce mois-ci
        </h2>
        <div className="grid gap-5 md:grid-cols-3">
          {topsByActivity.map(({ activity, list }) => {
            const def = ACTIVITY_DEFS[activity];
            return (
              <Card key={activity}>
                <div className="flex items-center gap-2 mb-3">
                  <span aria-hidden className="text-lg">{def.emoji}</span>
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {def.label}
                  </h3>
                </div>
                {list.length === 0 ? (
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Pas la saison pour cette activité en {label.toLowerCase()}.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {list.map(({ city, fit }, i) => (
                      <li key={city.slug} className="text-sm">
                        <Link
                          href={`/villes/${city.slug}`}
                          className="flex items-baseline justify-between gap-2 hover:text-[var(--accent)] transition-colors"
                        >
                          <span className="text-[var(--text-primary)] min-w-0 truncate">
                            <span className="font-mono-data text-[var(--text-tertiary)] mr-1.5">
                              #{i + 1}
                            </span>
                            {city.name}
                          </span>
                          <span className="text-xs font-mono-data font-bold text-[var(--accent)] shrink-0">
                            {fit.score.toFixed(1)}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Destinations calmes */}
      {calmPicks.length > 0 && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
            Loin de la foule en {label.toLowerCase()}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Sélection à affluence touristique faible — pour qui préfère le calme.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {calmPicks.map(({ city, fit }) => (
              <Link
                key={city.slug}
                href={`/villes/${city.slug}`}
                className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {city.name}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">
                    {city.department} · score {fit.score.toFixed(1)}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Cross-links autres mois */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
        <h2 className="text-sm font-semibold text-[var(--text-secondary)] mb-3">
          Autres mois
        </h2>
        <div className="flex flex-wrap gap-2">
          {MONTHS.map((slug, i) => {
            const m = (i + 1) as MonthIndex;
            if (m === idx) return null;
            return (
              <Link
                key={slug}
                href={`/vacances/mois/${slug}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-colors"
              >
                {formatMonthLabel(m)}
              </Link>
            );
          })}
          <Link
            href="/vacances"
            className="rounded-full bg-[var(--accent)] text-white px-3 py-1 text-xs font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            ← Hub Vacances
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
            Score composite = activité (~45 %) + adéquation saisonnière (~25 %) +
            profil voyageur (~15 %) + qualité globale de la ville (~15 %). Climat
            mensuel interpolé depuis les normales 1991-2020 de Météo-France ;
            affluence touristique estimée depuis les caractéristiques de la ville
            (taille, littoral, station, etc.) modulée par le mois.
            <br /><br />
            <strong>Limites connues :</strong> climat interpolé à ±1.5 °C, pas de
            données de prix en temps réel, affluence non chiffrée (1-5 qualitatif).
            <Link href="/methode" className="underline ml-1">Méthodologie complète</Link>.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Données climat Météo-France</Badge>
            <Badge>{CITIES_COUNT} villes scorées</Badge>
            <Badge>Mise à jour automatique mensuelle</Badge>
          </div>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
