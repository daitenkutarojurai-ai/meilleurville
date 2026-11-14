import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge } from "@/components/EmojiBadge";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { CITIES_SEED } from "@/data/cities-seed";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
  type CitySynthesis,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternates } from "@/lib/i18n";

export const revalidate = false;
// Aligné sur le parent /comparer/[pair] qui accepte les paires ad-hoc.
// Sans ça, la CTA « ✨ Synthèse 8 axes » 404 sur toute paire non curée
// (SEO_PAIRS / SEO_TRIPLETS), notamment la barre « Comparer cette ville
// avec » du profil de ville qui produit des paires triées par slug.
export const dynamicParams = false;

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return [
    ...SEO_PAIRS.map(([a, b]) => ({ pair: `${a}-vs-${b}` })),
    ...SEO_TRIPLETS.map(([a, b, c]) => ({ pair: `${a}-vs-${b}-vs-${c}` })),
  ];
}

// Villes en indigo / rose / cyan (« Couleurs ») — le violet, le vert et l'orange
// restent réservés aux paliers de score. Teintes foncées pour le contraste AA.
const TEXT = ["text-[#4338CA]", "text-[#BE185D]", "text-[#0E7490]"] as const;
const PILL = [
  "bg-[#E0E7FF] text-[#4338CA]",
  "bg-[#FCE7F3] text-[#BE185D]",
  "bg-[#CFFAFE] text-[#0E7490]",
] as const;
const HEAD = ["grad-head-0", "grad-head-1", "grad-head-3"] as const;
const LINK_CARD =
  "group block h-full overflow-hidden rounded-2xl bg-white ring-1 ring-[#DDD6FE] shadow-[0_14px_34px_-26px_rgba(124,58,237,0.55)] hover:ring-[#4F46E5] hover:-translate-y-0.5 hover:shadow-lg transition-all";

/**
 * Titre court si le gabarit long dépasse les ~60 caractères rendus par Google.
 * Même helper que la jumelle EN (`app/[locale]/compare/[pair]/synthesis`), qui
 * l'avait et pas nous : 97 des 771 titres FR dépassaient, jusqu'à 77 caractères
 * sur les paires de communes à nom long (Saint-Chély-d'Apcher vs
 * Florac-Trois-Rivières). Ce qui se faisait couper était la queue de mots-clés,
 * jamais les deux villes — mais autant ne pas la servir.
 */
function fitTitle(long: string, short: string): string {
  return long.length <= 60 ? long : short;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parts = pair.split("-vs-");
  if (parts.length === 3) {
    const cities = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
    if (cities.some((c) => !c)) return {};
    const [a, b, c] = cities as NonNullable<(typeof cities)[number]>[];
    return {
      title: fitTitle(
        `${a.name} vs ${b.name} vs ${c.name} · synthèse 8 axes 3 villes 2026`,
        `${a.name} vs ${b.name} vs ${c.name} · synthèse 8 axes`,
      ),
      description: `Comparatif à 3 entre ${a.name}, ${b.name} et ${c.name} : environnement, santé, emploi, cadre de vie, sécurité, démographie. Verdict axe par axe.`,
      alternates: pathAlternates(`/comparer/${pair}/synthese`, `/compare/${pair}/synthesis`),
      openGraph: {
        // Sans `images`, un openGraph de page remplace celui hérité de la racine
        // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
        images: ["/opengraph-image"],
        title: `${a.name} vs ${b.name} vs ${c.name} · synthèse 8 axes`,
        description: `Les 8 dimensions data du site comparées entre 3 villes.`,
      },
    };
  }
  if (parts.length !== 2) return {};
  const cityA = CITIES_SEED.find((c) => c.slug === parts[0]);
  const cityB = CITIES_SEED.find((c) => c.slug === parts[1]);
  if (!cityA || !cityB) return {};
  return {
    title: fitTitle(
      `${cityA.name} vs ${cityB.name} · synthèse 8 axes comparée 2026`,
      `${cityA.name} vs ${cityB.name} · synthèse 8 axes`,
    ),
    description: `Comparatif ${cityA.name} vs ${cityB.name} : environnement, santé, emploi, cadre de vie, sécurité, démographie. Verdict axe par axe.`,
    alternates: pathAlternates(`/comparer/${pair}/synthese`, `/compare/${pair}/synthesis`),
    openGraph: {
      // Idem branche triplet : sans `images`, plus aucune carte sociale.
      images: ["/opengraph-image"],
      title: `${cityA.name} vs ${cityB.name} · synthèse 8 axes`,
      description: `Les 8 dimensions data du site comparées côte à côte.`,
    },
  };
}

function deltaLabel(d: number): string {
  if (Math.abs(d) < 0.3) return "≈ équivalent";
  if (d > 0) return `+${d.toFixed(1)} pt`;
  return `${d.toFixed(1)} pt`;
}

export default async function PairSynthesePage({ params }: Props) {
  const { pair } = await params;
  const parts = pair.split("-vs-");

  // Triplet dispatch — same dynamic segment, different render.
  if (parts.length === 3) {
    const seeds = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
    if (seeds.some((c) => !c)) notFound();
    return renderTriplet(
      seeds as NonNullable<(typeof seeds)[number]>[],
      pair,
    );
  }

  if (parts.length !== 2) notFound();
  const cityA = CITIES_SEED.find((c) => c.slug === parts[0]);
  const cityB = CITIES_SEED.find((c) => c.slug === parts[1]);
  if (!cityA || !cityB) notFound();

  const synA = computeCitySynthesis(cityA);
  const synB = computeCitySynthesis(cityB);

  // Build axis comparison rows by joining on `key`.
  const axesA = new Map(synA.axes.map((a) => [a.key, a]));
  const rows = synB.axes.map((b) => {
    const a = axesA.get(b.key)!;
    const delta = Math.round((a.score - b.score) * 10) / 10;
    return { key: b.key, label: b.label, hint: b.hint, a, b, delta };
  });
  const winsA = rows.filter((r) => r.delta >= 0.3).length;
  const winsB = rows.filter((r) => r.delta <= -0.3).length;
  const draws = rows.length - winsA - winsB;
  const verdict =
    winsA >= winsB + 2
      ? `${cityA.name} domine la synthèse (${winsA}/${rows.length} axes favorables, ${winsB} pour ${cityB.name}, ${draws} équivalents).`
      : winsB >= winsA + 2
        ? `${cityB.name} domine la synthèse (${winsB}/${rows.length} axes favorables, ${winsA} pour ${cityA.name}, ${draws} équivalents).`
        : `Comparatif serré (${winsA} axes pour ${cityA.name}, ${winsB} pour ${cityB.name}, ${draws} équivalents) — le choix dépend des priorités personnelles.`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Comparer", path: "/comparer" },
    { name: `${cityA.name} vs ${cityB.name}`, path: `/comparer/${pair}` },
    { name: "Synthèse", path: `/comparer/${pair}/synthese` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelle ville l'emporte sur la synthèse globale, ${cityA.name} ou ${cityB.name} ?`,
      a: `Score global de synthèse (moyenne des 8 axes normalisés, 10 = excellent) : ${cityA.name} ${synA.global}/10 vs ${cityB.name} ${synB.global}/10. ${verdict}`,
    },
    {
      q: `Sur quels axes ${cityA.name} dépasse-t-elle ${cityB.name} ?`,
      a:
        rows.filter((r) => r.delta >= 0.3).length === 0
          ? `${cityA.name} ne dépasse ${cityB.name} sur aucun axe avec un écart significatif (≥ 0,3 pt).`
          : `Axes favorables à ${cityA.name} : ${rows
              .filter((r) => r.delta >= 0.3)
              .map((r) => `${r.label} (+${r.delta.toFixed(1)})`)
              .join(", ")}.`,
    },
    {
      q: `Sur quels axes ${cityB.name} dépasse-t-elle ${cityA.name} ?`,
      a:
        rows.filter((r) => r.delta <= -0.3).length === 0
          ? `${cityB.name} ne dépasse ${cityA.name} sur aucun axe avec un écart significatif (≥ 0,3 pt).`
          : `Axes favorables à ${cityB.name} : ${rows
              .filter((r) => r.delta <= -0.3)
              .map((r) => `${r.label} (${Math.abs(r.delta).toFixed(1)})`)
              .join(", ")}.`,
    },
    {
      q: `Comment est calculée la synthèse 8 axes ?`,
      a: `Moyenne arithmétique des 8 composites des clusters data du site (environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics) normalisés vers une convention « 10 = excellent ». Calcul déterministe et reproductible.`,
    },
  ]);

  const sides = [
    { city: cityA, syn: synA, wins: winsA, head: HEAD[0], pill: PILL[0] },
    { city: cityB, syn: synB, wins: winsB, head: HEAD[1], pill: PILL[1] },
  ];

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-20 pb-10 sm:pb-12">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-[var(--text-tertiary)]">
            <Link href="/" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Accueil</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <Link href="/comparer" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Comparer</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <Link href={`/comparer/${pair}`} className="font-medium text-[#4338CA] hover:text-[#BE185D]">
              {cityA.name} vs {cityB.name}
            </Link>
          </nav>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <EmojiBadge emoji="✨" tone="pink" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              8 axes comparés
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
            <span className="gradient-text-anim pr-1">{cityA.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2 py-0.5 text-xs sm:text-sm font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{cityB.name}</span>{" "}
            <span className="text-[var(--text-primary)]">— synthèse 8 axes</span>
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
            Comparatif détaillé sur les 8 dimensions data du site : environnement, santé,
            emploi, cadre de vie, vélo, sécurité, démographie, services publics. Convention
            unifiée 10 = excellent, écart significatif fixé à ±0,3 pt.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {sides.map((s) => (
              <span key={s.city.slug} className={`rounded-full px-3 py-1 font-semibold ${s.pill}`}>
                {s.city.name} {s.syn.global}/10
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Verdict */}
      <section className="band band-indigo py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6">
          <div className="flex items-center gap-3">
            <EmojiBadge emoji="⚖️" tone="indigo" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Le verdict</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {sides.map((s) => (
              <div
                key={s.city.slug}
                className="rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] overflow-hidden"
              >
                <div className={`${s.head} px-4 py-2 text-xs font-bold uppercase tracking-widest truncate`}>
                  {s.city.name}
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                    {s.syn.global.toFixed(1)}
                    <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                  </div>
                  <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[s.syn.level]}`}>
                    {SYNTHESIS_LEVEL_LABEL[s.syn.level]} · cohérence ±{s.syn.spread.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] overflow-hidden">
            <div className="h-1.5 grad-head-0" aria-hidden />
            <div className="p-5">
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{verdict}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {sides.map((s) => (
                  <span key={s.city.slug} className={`rounded-full px-3 py-1 font-semibold ${s.pill}`}>
                    {s.wins} axes pour {s.city.name}
                  </span>
                ))}
                <span className="rounded-full px-3 py-1 font-semibold bg-[#F1F5F9] text-[var(--text-secondary)]">
                  {draws} équivalents
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Axis-by-axis comparison */}
      <section className="band band-sky py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <EmojiBadge emoji="📊" tone="sky" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Comparaison axe par axe</span>
            </h2>
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Convention unifiée 10 = excellent. Le « delta » est positif quand {cityA.name}{" "}
            dépasse {cityB.name}. Écart significatif : ≥ 0,3 pt.
          </p>
          <div className="mt-5 rounded-2xl bg-white ring-1 ring-[#BAE6FD] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EEF2FF] text-xs uppercase tracking-wide text-[#4338CA]">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Axe</th>
                    <th className={`px-3 py-2.5 text-right ${TEXT[0]}`}>{cityA.name}</th>
                    <th className={`px-3 py-2.5 text-right ${TEXT[1]}`}>{cityB.name}</th>
                    <th className="px-3 py-2.5 text-right">Δ</th>
                    <th className="px-3 py-2.5 text-left hidden sm:table-cell">Gagnant</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => {
                    const winnerIdx = Math.abs(r.delta) < 0.3 ? -1 : r.delta > 0 ? 0 : 1;
                    return (
                      <tr
                        key={r.key}
                        className={`border-t border-[#E0E7FF] ${idx % 2 === 1 ? "bg-[#F8FAFF]" : ""}`}
                      >
                        <td className="px-3 py-2.5">
                          <Link
                            href={r.a.href}
                            className="font-semibold text-[var(--text-primary)] hover:text-[#4338CA]"
                          >
                            {r.label}
                          </Link>
                          <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                            {r.hint}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[r.a.level]}`}>
                            {r.a.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[r.b.level]}`}>
                            {r.b.score.toFixed(1)}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-xs text-[var(--text-secondary)]">
                          {deltaLabel(r.delta)}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-semibold hidden sm:table-cell">
                          {winnerIdx === -1 ? (
                            <span className="text-[var(--text-tertiary)]">—</span>
                          ) : (
                            <span className={`rounded-full px-2.5 py-0.5 ${PILL[winnerIdx]}`}>
                              {sides[winnerIdx].city.name}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="band band-lilac py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <EmojiBadge emoji="🧭" tone="lilac" size="sm" />
            <h2 className="text-xl sm:text-2xl font-bold">
              <span className="gradient-text">Aller plus loin</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: `/comparer/${pair}`, title: "← Comparatif classique", sub: "Scores seed, coût de la vie, immobilier" },
              { href: `/villes/${cityA.slug}/synthese`, title: `Synthèse ${cityA.name}`, sub: "Forces, tensions, méthodologie" },
              { href: `/villes/${cityB.slug}/synthese`, title: `Synthèse ${cityB.name}`, sub: "Forces, tensions, méthodologie" },
              { href: "/palmares", title: "Palmarès national", sub: "Top 30 profils favorables sur les 8 axes" },
            ].map((l, i) => (
              <Link key={l.href} href={l.href} className={LINK_CARD}>
                <div className={`h-1.5 grad-head-${i % 6}`} aria-hidden />
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                    {l.title}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{l.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="band band-white py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}

// ─── F69 — Triplet synthese ────────────────────────────────────────────────

type SeedCity = (typeof CITIES_SEED)[number];

function renderTriplet(seeds: SeedCity[], pair: string) {
  const [s0, s1, s2] = seeds;
  const syns: CitySynthesis[] = seeds.map((s) => computeCitySynthesis(s));
  const [syn0, syn1, syn2] = syns;

  // Join axes by key from city 0 — same order across all cities.
  const axes0 = syn0.axes;
  const axesByKey = seeds.map((_, i) => new Map(syns[i].axes.map((a) => [a.key, a])));
  const rows = axes0.map((a0) => {
    const scores = seeds.map((_, i) => axesByKey[i].get(a0.key)!.score);
    const max = Math.max(...scores);
    const winners = scores
      .map((s, i) => (s >= max - 0.0001 ? i : -1))
      .filter((i) => i >= 0);
    // Significant winner only if its margin over the next best is ≥ 0,3 pt.
    const sorted = [...scores].sort((a, b) => b - a);
    const winner =
      winners.length === 1 && sorted[0] - sorted[1] >= 0.3 ? winners[0] : -1;
    return {
      key: a0.key,
      label: a0.label,
      hint: a0.hint,
      href: a0.href,
      scores,
      winner,
    };
  });

  // Wins per city — significant wins only.
  const wins = seeds.map((_, i) => rows.filter((r) => r.winner === i).length);
  const draws = rows.length - wins.reduce((a, b) => a + b, 0);
  const overallIdx = wins.indexOf(Math.max(...wins));
  const tiedTop = wins.filter((w) => w === wins[overallIdx]).length > 1;
  const verdict = tiedTop
    ? `Profils très proches sur les 8 axes (${wins.join(" / ")} wins, ${draws} équivalents) — le choix dépend des priorités personnelles.`
    : `${seeds[overallIdx].name} affiche le profil global le plus favorable (${wins[overallIdx]} axes en sa faveur sur ${rows.length}, ${draws} équivalents).`;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Comparer", path: "/comparer" },
    { name: `${s0.name} vs ${s1.name} vs ${s2.name}`, path: `/comparer/${pair}` },
    { name: "Synthèse", path: `/comparer/${pair}/synthese` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelle ville l'emporte sur la synthèse globale entre ${s0.name}, ${s1.name} et ${s2.name} ?`,
      a: `Scores globaux synthèse F61 (moyenne des 8 axes normalisés, 10 = excellent) : ${s0.name} ${syn0.global}/10, ${s1.name} ${syn1.global}/10, ${s2.name} ${syn2.global}/10. ${verdict}`,
    },
    {
      q: `Sur quels axes ${s0.name} se démarque-t-elle ?`,
      a: (() => {
        const won = rows.filter((r) => r.winner === 0);
        return won.length === 0
          ? `${s0.name} ne gagne aucun axe avec un écart significatif (≥ 0,3 pt) sur les 2 autres.`
          : `Axes favorables à ${s0.name} : ${won.map((r) => r.label).join(", ")}.`;
      })(),
    },
    {
      q: `Sur quels axes ${s1.name} se démarque-t-elle ?`,
      a: (() => {
        const won = rows.filter((r) => r.winner === 1);
        return won.length === 0
          ? `${s1.name} ne gagne aucun axe avec un écart significatif (≥ 0,3 pt) sur les 2 autres.`
          : `Axes favorables à ${s1.name} : ${won.map((r) => r.label).join(", ")}.`;
      })(),
    },
    {
      q: `Sur quels axes ${s2.name} se démarque-t-elle ?`,
      a: (() => {
        const won = rows.filter((r) => r.winner === 2);
        return won.length === 0
          ? `${s2.name} ne gagne aucun axe avec un écart significatif (≥ 0,3 pt) sur les 2 autres.`
          : `Axes favorables à ${s2.name} : ${won.map((r) => r.label).join(", ")}.`;
      })(),
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-20 pb-10 sm:pb-12">
        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <nav aria-label="Fil d'Ariane" className="mb-4 text-xs text-[var(--text-tertiary)]">
            <Link href="/" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Accueil</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <Link href="/comparer" className="font-medium text-[#4338CA] hover:text-[#BE185D]">Comparer</Link>
            <span className="mx-1.5" aria-hidden>/</span>
            <Link href={`/comparer/${pair}`} className="font-medium text-[#4338CA] hover:text-[#BE185D]">
              {s0.name} vs {s1.name} vs {s2.name}
            </Link>
          </nav>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <EmojiBadge emoji="✨" tone="pink" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              8 axes comparés
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.1]">
            <span className="gradient-text-anim pr-1">{s0.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2 py-0.5 text-xs sm:text-sm font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{s1.name}</span>{" "}
            <span className="inline-flex align-middle items-center justify-center rounded-full grad-head-5 px-2 py-0.5 text-xs sm:text-sm font-extrabold">vs</span>{" "}
            <span className="gradient-text-anim pr-1">{s2.name}</span>{" "}
            <span className="text-[var(--text-primary)]">— synthèse 8 axes</span>
          </h1>
          <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
            Comparatif à 3 sur les 8 dimensions data du site. Convention unifiée
            10 = excellent. « Gagnant » par axe attribué seulement si la ville en
            tête devance la suivante de ≥ 0,3 pt.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {seeds.map((s, i) => (
              <span key={s.slug} className={`rounded-full px-3 py-1 font-semibold ${PILL[i]}`}>
                {s.name} {syns[i].global}/10
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Verdict — 3 cartes */}
      <section className="band band-indigo py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
          <div className="flex items-center gap-3">
            <EmojiBadge emoji="⚖️" tone="indigo" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Le verdict</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {seeds.map((s, i) => (
              <div
                key={s.slug}
                className="rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] overflow-hidden"
              >
                <div className={`${HEAD[i]} px-4 py-2 text-xs font-bold uppercase tracking-widest truncate`}>
                  {s.name}
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                    {syns[i].global.toFixed(1)}
                    <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                  </div>
                  <div className={`text-[11px] font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[syns[i].level]}`}>
                    {SYNTHESIS_LEVEL_LABEL[syns[i].level]} · ±{syns[i].spread.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white ring-1 ring-[#C7D2FE] shadow-[0_14px_34px_-24px_rgba(79,70,229,0.6)] overflow-hidden">
            <div className="h-1.5 grad-head-0" aria-hidden />
            <div className="p-5">
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">{verdict}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {seeds.map((s, i) => (
                  <span key={s.slug} className={`rounded-full px-3 py-1 font-semibold ${PILL[i]}`}>
                    {wins[i]} axes pour {s.name}
                  </span>
                ))}
                <span className="rounded-full px-3 py-1 font-semibold bg-[#F1F5F9] text-[var(--text-secondary)]">
                  {draws} équivalents
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Axis-by-axis comparison */}
      <section className="band band-sky py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <EmojiBadge emoji="📊" tone="sky" size="sm" />
            <h2 className="text-2xl sm:text-3xl font-bold">
              <span className="gradient-text">Comparaison axe par axe</span>
            </h2>
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Le « gagnant » est la ville en tête, à condition que son avance sur la
            suivante atteigne 0,3 pt. Sinon, les écarts sont jugés non significatifs.
          </p>
          <div className="mt-5 rounded-2xl bg-white ring-1 ring-[#BAE6FD] shadow-[0_14px_34px_-24px_rgba(8,145,178,0.6)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#EEF2FF] text-xs uppercase tracking-wide text-[#4338CA]">
                  <tr>
                    <th className="px-3 py-2.5 text-left">Axe</th>
                    {seeds.map((s, i) => (
                      <th key={s.slug} className={`px-3 py-2.5 text-right ${TEXT[i]}`}>
                        {s.name}
                      </th>
                    ))}
                    <th className="px-3 py-2.5 text-left hidden sm:table-cell">Gagnant</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr
                      key={r.key}
                      className={`border-t border-[#E0E7FF] ${idx % 2 === 1 ? "bg-[#F8FAFF]" : ""}`}
                    >
                      <td className="px-3 py-2.5">
                        <Link
                          href={r.href}
                          className="font-semibold text-[var(--text-primary)] hover:text-[#4338CA]"
                        >
                          {r.label}
                        </Link>
                        <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                          {r.hint}
                        </div>
                      </td>
                      {r.scores.map((score, i) => {
                        const isWinner = r.winner === i;
                        return (
                          <td key={i} className="px-3 py-2.5 text-right">
                            <span
                              className={`tabular-nums ${
                                isWinner ? `font-bold ${TEXT[i]}` : "font-medium text-[var(--text-primary)]"
                              }`}
                            >
                              {score.toFixed(1)}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-xs font-semibold hidden sm:table-cell">
                        {r.winner === -1 ? (
                          <span className="text-[var(--text-tertiary)]">—</span>
                        ) : (
                          <span className={`rounded-full px-2.5 py-0.5 ${PILL[r.winner]}`}>
                            {seeds[r.winner].name}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="band band-lilac py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-4">
            <EmojiBadge emoji="🧭" tone="lilac" size="sm" />
            <h2 className="text-xl sm:text-2xl font-bold">
              <span className="gradient-text">Aller plus loin</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: `/comparer/${pair}`, title: "← Comparatif classique 3 villes", sub: "Radar 3 polygones, scores seed, climat, immobilier" },
              ...seeds.map((s) => ({
                href: `/villes/${s.slug}/synthese`,
                title: `Synthèse ${s.name}`,
                sub: "Forces, tensions, méthodologie",
              })),
              { href: "/synthese", title: "Hub Synthèse 8 axes", sub: "Pyramide complète ville → national" },
            ].map((l, i) => (
              <Link key={l.href} href={l.href} className={LINK_CARD}>
                <div className={`h-1.5 grad-head-${i % 6}`} aria-hidden />
                <div className="px-4 py-3">
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
                    {l.title}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] mt-1">{l.sub}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Feedback */}
      <section className="band band-white py-10 sm:py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
