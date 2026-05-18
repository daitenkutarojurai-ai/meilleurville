import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { SEO_PAIRS } from "@/lib/comparer-pairs";
import {
  computeCitySynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
  SYNTHESIS_LEVEL_BG,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return SEO_PAIRS.map(([a, b]) => ({ pair: `${a}-vs-${b}` }));
}

function parsePair(pair: string): { a: string; b: string } | null {
  const m = pair.match(/^(.+?)-vs-(.+)$/);
  if (!m) return null;
  return { a: m[1], b: m[2] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const cityA = CITIES_SEED.find((c) => c.slug === parsed.a);
  const cityB = CITIES_SEED.find((c) => c.slug === parsed.b);
  if (!cityA || !cityB) return {};
  return {
    title: `${cityA.name} vs ${cityB.name} — synthèse 8 axes comparée 2026`,
    description: `Comparatif ${cityA.name} vs ${cityB.name} sur les 8 dimensions data : environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics. Verdict axe par axe.`,
    alternates: { canonical: `/comparer/${pair}/synthese` },
    openGraph: {
      title: `${cityA.name} vs ${cityB.name} — synthèse 8 axes`,
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
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const cityA = CITIES_SEED.find((c) => c.slug === parsed.a);
  const cityB = CITIES_SEED.find((c) => c.slug === parsed.b);
  if (!cityA || !cityB) notFound();

  const synA = computeCitySynthesis(cityA);
  const synB = computeCitySynthesis(cityB);

  // Build axis comparison rows by joining on `key`.
  const axesA = new Map(synA.axes.map((a) => [a.key, a]));
  const rows = synB.axes.map((b) => {
    const a = axesA.get(b.key)!;
    const delta = Math.round((a.score - b.score) * 10) / 10;
    return { key: b.key, label: b.label, hint: b.hint, tag: b.tag, a, b, delta };
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
      a: `Score global synthèse F61 (moyenne des 8 axes normalisés, 10 = excellent) : ${cityA.name} ${synA.global}/10 vs ${cityB.name} ${synB.global}/10. ${verdict}`,
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
      a: `Moyenne arithmétique des 8 composites des clusters data du site (F44 environnement, F47 santé, F50 emploi, F52 cadre de vie, F57 vélo, F58 sécurité, F59 démographie, F60 services publics) normalisés vers une convention « 10 = excellent ». Calcul déterministe et reproductible.`,
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
