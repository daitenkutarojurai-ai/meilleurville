import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { computeEmploymentMarket } from "@/lib/employment-market";
import { computeDemography } from "@/lib/demography";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { formatNumber } from "@/lib/utils";
import { cityAlternates } from "@/lib/i18n";
import {
  cityIncome,
  incomeRank,
  monthlyEquivalent,
  INCOME_YEAR,
  INCOME_CREDIT,
  INCOME_SOURCE_URL,
  MEDIAN_OF_CITIES,
} from "@/lib/city-income";
import {
  INSEE_POP_BASE_YEAR,
  INSEE_POP_CREDIT,
  INSEE_POP_SOURCE_URL,
  INSEE_POP_YEAR,
  cityPopulation,
  populationTrend,
  seniorShare,
} from "@/lib/city-population";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

type PopBucket = {
  label: string;
  hint: string;
  emoji: string;
};

function popBucket(pop: number | null): PopBucket {
  if (pop == null) return { label: "population non renseignée", hint: "", emoji: "📍" };
  if (pop >= 500_000) return { label: "grande métropole", hint: "> 500 000 hab.", emoji: "🏙️" };
  if (pop >= 200_000) return { label: "métropole régionale", hint: "200 000 – 500 000 hab.", emoji: "🌆" };
  if (pop >= 100_000) return { label: "grande ville", hint: "100 000 – 200 000 hab.", emoji: "🏢" };
  if (pop >= 50_000) return { label: "ville moyenne", hint: "50 000 – 100 000 hab.", emoji: "🏘️" };
  if (pop >= 20_000) return { label: "petite ville", hint: "20 000 – 50 000 hab.", emoji: "🏡" };
  if (pop >= 5_000) return { label: "bourg", hint: "5 000 – 20 000 hab.", emoji: "🏡" };
  return { label: "petite commune", hint: "< 5 000 hab.", emoji: "🏡" };
}

// Salaire net médian dept, INSEE DADS — fourchettes cohérentes avec
// SALARY_HIGH/GOOD/LOW/VERY_LOW_DEPTS de lib/employment-market.ts.
function salaryBracket(score: number): { range: string; note: string; tone: "haut" | "correct" | "moyen" | "bas" | "tres-bas" } {
  if (score <= 1.5) return { range: "> 2 400 €/mois net", note: "au-dessus de la médiane nationale — grande couronne parisienne", tone: "haut" };
  if (score <= 3) return { range: "2 100 – 2 300 €/mois net", note: "légèrement au-dessus de la médiane nationale", tone: "correct" };
  if (score <= 5.5) return { range: "≈ 2 100 €/mois net", note: "proche de la médiane nationale", tone: "moyen" };
  if (score <= 7) return { range: "1 850 – 1 950 €/mois net", note: "sous la médiane nationale", tone: "bas" };
  return { range: "< 1 850 €/mois net", note: "structurellement bas — pouvoir d'achat contraint", tone: "tres-bas" };
}

// Chômage dept, INSEE T4 2024 — fourchettes cohérentes avec
// UNEMP_VERY_LOW/LOW/HIGH/VERY_HIGH de lib/employment-market.ts.
function unemploymentBracket(score: number): { range: string; note: string; tone: "haut" | "correct" | "moyen" | "bas" | "tres-bas" } {
  if (score <= 1.5) return { range: "< 5,5 %", note: "très bas — tension à l'embauche dans plusieurs secteurs", tone: "bas" };
  if (score <= 3) return { range: "5,5 – 7 %", note: "sous la moyenne nationale (7,3 %)", tone: "correct" };
  if (score <= 5.5) return { range: "7 – 8 %", note: "proche de la moyenne nationale", tone: "moyen" };
  if (score <= 7.5) return { range: "8 – 10 %", note: "au-dessus de la moyenne nationale", tone: "haut" };
  return { range: "> 10 %", note: "très élevé (ou DROM en tension chronique)", tone: "tres-bas" };
}

// Vieillissement dept, INSEE RP — fourchettes cohérentes avec ageingRisk
// (AGEING_VERY_HIGH/HIGH/LOW/VERY_LOW_DEPTS de lib/demography.ts).
function ageingBracket(score: number): { range: string; note: string } {
  if (score <= 1.5) return { range: "< 20 % de seniors", note: "démographie très jeune (DROM)" };
  if (score <= 3) return { range: "22 – 27 % de seniors", note: "pyramide jeune — métropoles et IDF dense" };
  if (score <= 5) return { range: "≈ 28 % de seniors", note: "proche de la médiane nationale" };
  if (score <= 7) return { range: "32 – 35 % de seniors", note: "vieillissement marqué — littoral héliotropique" };
  return { range: "35 – 40 % de seniors", note: "vieillissement très avancé — dépts ruraux du centre-est" };
}

const TONE_COLOR: Record<"haut" | "correct" | "moyen" | "bas" | "tres-bas", string> = {
  haut: "text-emerald-700 dark:text-emerald-400",
  correct: "text-lime-700 dark:text-lime-400",
  moyen: "text-amber-700 dark:text-amber-400",
  bas: "text-orange-700 dark:text-orange-400",
  "tres-bas": "text-red-700 dark:text-red-400",
};

const TONE_BG: Record<"haut" | "correct" | "moyen" | "bas" | "tres-bas", string> = {
  haut: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900",
  correct: "bg-lime-50 dark:bg-lime-950/30 border-lime-200 dark:border-lime-900",
  moyen: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900",
  bas: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900",
  "tres-bas": "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  // Population Insee mesurée quand elle existe : la meta ne doit pas annoncer
  // un chiffre que la page contredit trois lignes plus bas.
  const measured = cityPopulation(slug)?.pop2022 ?? city.population;
  const bucket = popBucket(measured);
  const pop = measured ? `${formatNumber(measured)} hab.` : "population indicative";
  return {
    title: `Statistiques de ${city.name} : population, salaire, chômage`.slice(0, 60),
    description: `Chiffres-clés de ${city.name} (${city.department}) : ${pop}, niveau de vie médian, taux de pauvreté, chômage et structure d'âge. Sources INSEE.`.slice(0, 160),
    alternates: cityAlternates("statistiques", slug),
    openGraph: {
      title: `Statistiques de ${city.name}`,
      description: `Population, niveau de vie médian, chômage, structure d'âge — synthèse INSEE ${bucket.label}.`,
    },
  };
}

export default async function StatistiquesPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const emp = computeEmploymentMarket(city);
  const demo = computeDemography(city);
  const bucket = popBucket(cityPopulation(city.slug)?.pop2022 ?? city.population);
  const salary = salaryBracket(emp.salary.score);
  const unemp = unemploymentBracket(emp.unemployment.score);
  const ageing = ageingBracket(demo.ageing.score);
  const income = cityIncome(city.slug);
  const pop = cityPopulation(city.slug);
  const trend = populationTrend(city.slug);
  const seniors = seniorShare(city.slug);
  const incRank = income ? incomeRank(city.slug) : null;

  const trajectoryLabel =
    demo.trajectory.score <= 3
      ? { label: "croissance démographique", tone: "haut" as const }
      : demo.trajectory.score <= 5.5
        ? { label: "trajectoire stable", tone: "moyen" as const }
        : { label: "décroissance structurelle", tone: "tres-bas" as const };

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Statistiques", path: `/villes/${city.slug}/statistiques` },
  ]);

  const popLine = city.population
    ? `${formatNumber(city.population)} habitants — ${bucket.label} (${bucket.hint})`
    : `${bucket.label} — population indicative`;

  const faq = faqJsonLd([
    {
      q: `Combien d'habitants compte ${city.name} ?`,
      a: `${city.name} (${city.department}) : ${popLine}. Source : INSEE, recensement de la population (RP) — millésime le plus récent publié.`,
    },
    {
      q: `Quel est le niveau de vie médian à ${city.name} ?`,
      a: income
        ? `À ${city.name}, le niveau de vie médian est de ${formatNumber(income.medianIncome)} € par an, soit environ ${formatNumber(monthlyEquivalent(income.medianIncome))} € par mois et par unité de consommation${
            income.povertyRate !== undefined
              ? `, et le taux de pauvreté de ${String(income.povertyRate).replace(".", ",")} %`
              : ""
          }. C'est un revenu disponible (salaires et prestations, impôts déduits) rapporté à la composition du ménage, pas un salaire. Source : ${INCOME_CREDIT}.`
        : `Le niveau de vie médian de ${city.name} n'est pas publié par l'INSEE (secret statistique ou commune hors champ Filosofi). À défaut, le salaire net mensuel médian du département (${city.department}) se situe autour de ${salary.range} — ${salary.note}.`,
    },
    {
      q: `Quel est le taux de chômage à ${city.name} ?`,
      a: `Le taux de chômage départemental de ${city.department} est estimé à ${unemp.range} — ${unemp.note}. Source : INSEE, taux de chômage trimestriel par département (T4 2024). Le taux communal n'est pas publié séparément par l'INSEE.`,
    },
    {
      q: `${city.name} est-elle une ville jeune ou vieillissante ?`,
      a: `${city.name} (${city.department}) : ${
        seniors !== null
          ? `${String(seniors).replace(".", ",")} % de la population a 60 ans ou plus (mesure communale, recensement Insee ${INSEE_POP_YEAR})`
          : `structure d'âge estimée à ${ageing.range} — ${ageing.note}`
      }. Trajectoire : ${trajectoryLabel.label}. Source : INSEE, recensement de la population (structure par âge par département).`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Statistiques de {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse des chiffres-clés utiles pour situer {city.name} : population,
          salaire net médian, taux de chômage, structure d&apos;âge et trajectoire
          démographique. Sources publiques :{" "}
          <a
            href="https://www.insee.fr/fr/statistiques"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            INSEE
          </a>{" "}
          (RP, DADS, chômage trimestriel).
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Chiffres INSEE</Badge>
          <Badge>Fourchettes départementales</Badge>
        </div>

        {/* Hero — population */}
        <Card className="mt-6 border-l-4 border-l-[var(--accent)]">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
              Population
            </h2>
            <span className="text-xs font-bold uppercase text-[var(--accent)]">
              {bucket.emoji} {bucket.label}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-2">
            {pop ? formatNumber(pop.pop2022) : city.population != null ? formatNumber(city.population) : "—"}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">
              habitants
            </span>
          </div>
          {trend && (
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              {trend.direction === "stable" ? (
                <>Population stable depuis {INSEE_POP_BASE_YEAR}</>
              ) : (
                <>
                  {trend.direction === "hausse" ? "En hausse de " : "En baisse de "}
                  <strong className="tabular-nums">
                    {Math.abs(trend.changePct).toFixed(1).replace(".", ",")} %
                  </strong>{" "}
                  depuis {INSEE_POP_BASE_YEAR}
                </>
              )}{" "}
              <span className="text-[var(--text-tertiary)]">
                ({trend.gained > 0 ? "+" : ""}
                {formatNumber(trend.gained)} habitants en six ans)
              </span>{" "}
              ·{" "}
              <Link
                href={`/villes/${city.slug}/demographie`}
                className="text-[var(--accent)] hover:underline"
              >
                pyramide des âges
              </Link>{" "}
              ·{" "}
              <Link
                href="/villes-qui-grandissent"
                className="text-[var(--accent)] hover:underline"
              >
                comparer au reste de la France
              </Link>
            </p>
          )}
          <p className="text-xs text-[var(--text-tertiary)]">
            {pop ? (
              <>
                Population municipale {INSEE_POP_YEAR} ·{" "}
                <a
                  href={INSEE_POP_SOURCE_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {INSEE_POP_CREDIT}
                </a>
                {" · "}
              </>
            ) : null}
            {bucket.hint} · Département : {city.department ?? "—"}
            {city.region ? ` · Région : ${city.region}` : ""}
          </p>
        </Card>

        {/* Niveau de vie — seule donnée de cette page publiée à la commune. */}
        {income && (
          <>
            <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
              Niveau de vie
            </h2>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Contrairement aux indicateurs suivants, celui-ci est publié pour la
              commune elle-même, pas pour le département.
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--border)] p-4">
                <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Niveau de vie médian
                </div>
                <div className="text-lg font-bold tabular-nums text-[var(--text-primary)]">
                  {formatNumber(income.medianIncome)} €/an
                </div>
                <div className="text-sm tabular-nums text-[var(--text-secondary)] mb-2">
                  soit ≈ {formatNumber(monthlyEquivalent(income.medianIncome))} €/mois
                  par unité de consommation
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Revenu disponible du ménage (salaires et prestations, impôts
                  déduits) rapporté à sa composition — ce n&apos;est pas un
                  salaire. Médiane des villes du site :{" "}
                  {formatNumber(MEDIAN_OF_CITIES)} €.
                  {incRank
                    ? ` ${city.name} se situe au ${incRank.rank}ᵉ rang sur ${incRank.total} villes couvertes.`
                    : ""}
                </p>
              </div>

              {income.povertyRate !== undefined && (
                <div className="rounded-2xl border border-[var(--border)] p-4">
                  <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Taux de pauvreté
                  </div>
                  <div className="text-lg font-bold tabular-nums text-[var(--text-primary)] mb-2">
                    {String(income.povertyRate).replace(".", ",")} %
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    Part des habitants vivant sous 60 % du niveau de vie médian
                    national. Ici, un chiffre élevé est mauvais. Moyenne
                    nationale : 14,4 %. Pour situer ce taux à l&apos;échelle du
                    pays, voir les{" "}
                    <Link
                      href="/red-flags/villes-pauvrete-elevee"
                      className="text-[var(--accent)] hover:underline"
                    >
                      villes où la pauvreté monétaire dépasse 22 %
                    </Link>
                    .
                  </p>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Source :{" "}
              <a
                href={INCOME_SOURCE_URL}
                target="_blank"
                rel="noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                {INCOME_CREDIT}
              </a>{" "}
              (millésime {INCOME_YEAR}, dernière année publiée à la commune).
            </p>
          </>
        )}

        {/* 3 blocs — salaire, chômage, structure d'âge */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Salaire, emploi, structure d&apos;âge
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Ces trois indicateurs ne sont publiés qu&apos;au niveau départemental.
          Les fourchettes reflètent la moyenne du département — pas la valeur
          exacte de la commune.
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`rounded-2xl border p-4 ${TONE_BG[salary.tone]}`}>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Salaire net médian
              </div>
              <div className={`text-xs font-bold uppercase ${TONE_COLOR[salary.tone]}`}>
                {salary.tone === "haut"
                  ? "élevé"
                  : salary.tone === "correct"
                    ? "correct"
                    : salary.tone === "moyen"
                      ? "médian"
                      : salary.tone === "bas"
                        ? "bas"
                        : "très bas"}
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums text-[var(--text-primary)] mb-2">
              {salary.range}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {salary.note}. Estimation à partir de nos indices, calée sur les
              fourchettes INSEE DADS du département de {city.department}.
            </p>
          </div>

          <div className={`rounded-2xl border p-4 ${TONE_BG[unemp.tone]}`}>
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Taux de chômage
              </div>
              <div className={`text-xs font-bold uppercase ${TONE_COLOR[unemp.tone]}`}>
                {unemp.tone === "bas"
                  ? "très bas"
                  : unemp.tone === "correct"
                    ? "bas"
                    : unemp.tone === "moyen"
                      ? "moyen"
                      : unemp.tone === "haut"
                        ? "élevé"
                        : "très élevé"}
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums text-[var(--text-primary)] mb-2">
              {unemp.range}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {unemp.note}. Source INSEE, taux trimestriel département T4 2024.
            </p>
          </div>

          <div className="rounded-2xl border p-4 bg-[var(--bg-surface)] border-[var(--border)]">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Structure d&apos;âge
              </div>
              <div className="text-xs font-bold uppercase text-[var(--text-tertiary)]">
                60 ans et +
              </div>
            </div>
            <div className="text-lg font-bold tabular-nums text-[var(--text-primary)] mb-2">
              {seniors !== null ? `${seniors.toFixed(1).replace(".", ",")} %` : ageing.range}
            </div>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {seniors !== null ? (
                <>
                  Part des 60 ans et plus, mesurée sur la commune (France ≈ 28 %).
                  Source : {INSEE_POP_CREDIT}.{" "}
                  <Link
                    href={`/villes/${city.slug}/demographie`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    Pyramide des âges
                  </Link>
                </>
              ) : (
                <>
                  {ageing.note}. Source INSEE recensement (RP) — département{" "}
                  {city.department}.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Trajectoire */}
        <Card className={`mt-6 ${TONE_BG[trajectoryLabel.tone]}`}>
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              Trajectoire démographique
            </div>
            <div className={`text-xs font-bold uppercase ${TONE_COLOR[trajectoryLabel.tone]}`}>
              {trajectoryLabel.label}
            </div>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {demo.trajectory.reason}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Source : INSEE, bilan démographique départemental (solde naturel + solde
            migratoire annuel).
          </p>
        </Card>

        {/* Bloc « ce qu'on ne mesure pas au niveau communal » — transparence */}
        <Card className="mt-6 border-dashed">
          <div className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Ce que l&apos;INSEE ne publie pas à l&apos;échelle communale
          </div>
          <ul className="space-y-1.5 text-xs text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Taux de chômage :</strong>{" "}
              publié uniquement au trimestre par département (INSEE) et par zone
              d&apos;emploi. Aucun chiffre commune-par-commune.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Salaire net médian :</strong>{" "}
              publié par département (DADS). La statistique communale existe pour les
              plus grandes villes mais avec beaucoup de bruit sur les petites.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Structure par âge :</strong>{" "}
              publiée par commune dans le RP mais les tranches fines sont bruitées en
              dessous de 20 000 habitants — la référence robuste reste
              départementale.
            </li>
          </ul>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Aller plus loin
        </h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/emploi`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>💼</span>
                <span>Marché du travail</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Chômage, dynamisme, mix sectoriel, salaires
              </div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/demographie`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>👥</span>
                <span>Démographie</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Vieillissement, jeunes actifs, renouvellement
              </div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/cout-de-la-vie`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>🪙</span>
                <span>Coût de la vie</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Loyer, budget mensuel, comparaison Paris
              </div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/logement`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>🏠</span>
                <span>Logement</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Prix m², loyer T1/T2, tension locative
              </div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/fiscalite`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>💶</span>
                <span>Fiscalité locale</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Taxe foncière, TEOM, taux communal
              </div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/services-publics`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <span aria-hidden>🏛️</span>
                <span>Services publics</span>
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Poste, mairie, école, médiathèque
              </div>
            </Card>
          </Link>
        </div>

        <p className="mt-6 text-xs text-[var(--text-tertiary)]">
          Fourchettes départementales dérivées des séries INSEE publiques (RP, DADS,
          chômage trimestriel). Pour une valeur exacte à un millésime précis,
          consulter{" "}
          <a
            href={`https://www.insee.fr/fr/recherche/recherche-statistiques?q=${encodeURIComponent(city.name)}`}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            la fiche INSEE de {city.name}
          </a>
          .
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
