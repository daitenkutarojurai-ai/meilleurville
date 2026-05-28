import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import { SEO_TRIPLETS } from "@/lib/comparer-triplets";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
  SYNTHESIS_LEVEL_BG,
  type CitySynthesis,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

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

const TRIPLET_COLORS = ["#0ea5e9", "#a78bfa", "#f97316"] as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parts = pair.split("-vs-");
  if (parts.length === 3) {
    const cities = parts.map((s) => CITIES_SEED.find((c) => c.slug === s));
    if (cities.some((c) => !c)) return {};
    const [a, b, c] = cities as NonNullable<(typeof cities)[number]>[];
    return {
      title: `${a.name} vs ${b.name} vs ${c.name} · synthèse 8 axes 3 villes 2026`,
      description: `Comparatif à 3 entre ${a.name}, ${b.name} et ${c.name} sur les 8 dimensions data : environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics. Verdict axe par axe.`,
      alternates: { canonical: `/comparer/${pair}/synthese` },
      openGraph: {
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
    title: `${cityA.name} vs ${cityB.name} · synthèse 8 axes comparée 2026`,
    description: `Comparatif ${cityA.name} vs ${cityB.name} sur les 8 dimensions data : environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics. Verdict axe par axe.`,
    alternates: { canonical: `/comparer/${pair}/synthese` },
    openGraph: {
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

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/comparer" className="hover:underline">Comparer</Link> ·{" "}
          <Link href={`/comparer/${pair}`} className="hover:underline">
            {cityA.name} vs {cityB.name}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {cityA.name} vs {cityB.name} — synthèse 8 axes
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Comparatif détaillé sur les 8 dimensions data du site : environnement, santé,
          emploi, cadre de vie, vélo, sécurité, démographie, services publics. Convention
          unifiée 10 = excellent, écart significatif fixé à ±0,3 pt.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8 axes comparés</Badge>
          <Badge>
            {cityA.name} {synA.global}/10 vs {cityB.name} {synB.global}/10
          </Badge>
        </div>

        {/* Hero verdict */}
        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-2xl border p-4 ${SYNTHESIS_LEVEL_BG[synA.level]}`}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                {cityA.name}
              </div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                {synA.global.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
              </div>
              <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[synA.level]}`}>
                {SYNTHESIS_LEVEL_LABEL[synA.level]} · cohérence ±{synA.spread.toFixed(1)}
              </div>
            </div>
            <div className={`rounded-2xl border p-4 ${SYNTHESIS_LEVEL_BG[synB.level]}`}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1">
                {cityB.name}
              </div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                {synB.global.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
              </div>
              <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[synB.level]}`}>
                {SYNTHESIS_LEVEL_LABEL[synB.level]} · cohérence ±{synB.spread.toFixed(1)}
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{verdict}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge>{winsA} axes pour {cityA.name}</Badge>
            <Badge>{winsB} axes pour {cityB.name}</Badge>
            <Badge>{draws} équivalents</Badge>
          </div>
        </Card>

        {/* Axis-by-axis comparison */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Comparaison axe par axe
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Convention unifiée 10 = excellent. Le « delta » est positif quand {cityA.name}
          dépasse {cityB.name}. Écart significatif : ≥ 0,3 pt.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Axe</th>
                  <th className="px-3 py-2 text-right">{cityA.name}</th>
                  <th className="px-3 py-2 text-right">{cityB.name}</th>
                  <th className="px-3 py-2 text-right">Δ</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Gagnant</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const winner =
                    Math.abs(r.delta) < 0.3 ? "—" : r.delta > 0 ? cityA.name : cityB.name;
                  const winnerColor =
                    winner === "—"
                      ? "text-[var(--text-tertiary)]"
                      : winner === cityA.name
                        ? "text-emerald-700"
                        : "text-emerald-700";
                  return (
                    <tr key={r.key} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2">
                        <Link
                          href={r.a.href}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {r.label}
                        </Link>
                        <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                          {r.hint}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[r.a.level]}`}>
                          {r.a.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className={`font-bold tabular-nums ${SYNTHESIS_LEVEL_COLOR[r.b.level]}`}>
                          {r.b.score.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-xs text-[var(--text-secondary)]">
                        {deltaLabel(r.delta)}
                      </td>
                      <td className={`px-3 py-2 text-xs font-semibold hidden sm:table-cell ${winnerColor}`}>
                        {winner}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/comparer/${pair}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ← Comparatif classique
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Scores seed, coût de la vie, immobilier
              </div>
            </Card>
          </Link>
          <Link href={`/villes/${cityA.slug}/synthese`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Synthèse {cityA.name}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Forces, tensions, méthodologie
              </div>
            </Card>
          </Link>
          <Link href={`/villes/${cityB.slug}/synthese`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Synthèse {cityB.name}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Forces, tensions, méthodologie
              </div>
            </Card>
          </Link>
          <Link href="/palmares" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">Palmarès national</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Top 30 profils favorables sur les 8 axes
              </div>
            </Card>
          </Link>
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

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/comparer" className="hover:underline">Comparer</Link> ·{" "}
          <Link href={`/comparer/${pair}`} className="hover:underline">
            {s0.name} vs {s1.name} vs {s2.name}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {s0.name} vs {s1.name} vs {s2.name} — synthèse 8 axes
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Comparatif à 3 sur les 8 dimensions data du site. Convention unifiée
          10 = excellent. « Gagnant » par axe attribué seulement si la ville en
          tête devance la suivante de ≥ 0,3 pt.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8 axes comparés</Badge>
          <Badge>{s0.name} {syn0.global}/10</Badge>
          <Badge>{s1.name} {syn1.global}/10</Badge>
          <Badge>{s2.name} {syn2.global}/10</Badge>
        </div>

        {/* Hero — 3 cartes */}
        <Card className="mt-6">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {seeds.map((s, i) => (
              <div
                key={s.slug}
                className={`rounded-2xl border p-3 sm:p-4 ${SYNTHESIS_LEVEL_BG[syns[i].level]}`}
              >
                <div
                  className="text-xs uppercase tracking-wide mb-1 font-semibold"
                  style={{ color: TRIPLET_COLORS[i] }}
                >
                  {s.name}
                </div>
                <div className="text-2xl sm:text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                  {syns[i].global.toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">
                    /10
                  </span>
                </div>
                <div
                  className={`text-[11px] font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[syns[i].level]}`}
                >
                  {SYNTHESIS_LEVEL_LABEL[syns[i].level]} · ±{syns[i].spread.toFixed(1)}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{verdict}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {seeds.map((s, i) => (
              <Badge key={s.slug}>
                {wins[i]} axes pour {s.name}
              </Badge>
            ))}
            <Badge>{draws} équivalents</Badge>
          </div>
        </Card>

        {/* Axis-by-axis comparison */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Comparaison axe par axe
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Le « gagnant » est la ville en tête, à condition que son avance sur la
          suivante atteigne 0,3 pt. Sinon, les écarts sont jugés non significatifs.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Axe</th>
                  {seeds.map((s, i) => (
                    <th key={s.slug} className="px-3 py-2 text-right">
                      <span style={{ color: TRIPLET_COLORS[i] }}>{s.name}</span>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Gagnant</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const winnerName = r.winner === -1 ? "—" : seeds[r.winner].name;
                  return (
                    <tr key={r.key} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2">
                        <Link
                          href={r.href}
                          className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
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
                          <td key={i} className="px-3 py-2 text-right">
                            <span
                              className={`tabular-nums ${isWinner ? "font-bold" : "font-medium"}`}
                              style={isWinner ? { color: TRIPLET_COLORS[i] } : undefined}
                            >
                              {score.toFixed(1)}
                            </span>
                          </td>
                        );
                      })}
                      <td
                        className={`px-3 py-2 text-xs font-semibold hidden sm:table-cell ${
                          r.winner === -1 ? "text-[var(--text-tertiary)]" : ""
                        }`}
                        style={
                          r.winner === -1 ? undefined : { color: TRIPLET_COLORS[r.winner] }
                        }
                      >
                        {winnerName}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/comparer/${pair}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ← Comparatif classique 3 villes
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Radar 3 polygones, scores seed, climat, immobilier
              </div>
            </Card>
          </Link>
          {seeds.map((s) => (
            <Link key={s.slug} href={`/villes/${s.slug}/synthese`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-sm font-semibold text-[var(--text-primary)]">
                  Synthèse {s.name}
                </div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">
                  Forces, tensions, méthodologie
                </div>
              </Card>
            </Link>
          ))}
          <Link href="/synthese" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Hub Synthèse 8 axes
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Pyramide complète ville → national
              </div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
