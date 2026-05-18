// F67 — Comparaison synthèse 2 régions (×78 SSG).
//
// Mirror de F63 (comparaison synthèse 2 villes) au niveau de la région
// administrative. Pour chaque paire (i, j) avec i < j parmi les 13
// METRO_REGIONS, génère une page comparant les profils moyens 8 axes
// des deux régions. Cohérent avec F66 (synthèse par région) qui sert de
// brique de calcul.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { METRO_REGIONS, REGION_EMOJIS, regionToSlug, slugToRegion } from "@/lib/regions";
import {
  computeRegionAverageSynthesis,
  SYNTHESIS_LEVEL_LABEL,
  SYNTHESIS_LEVEL_COLOR,
  SYNTHESIS_LEVEL_BG,
} from "@/lib/city-synthesis";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  const params: Array<{ pair: string }> = [];
  for (let i = 0; i < METRO_REGIONS.length; i++) {
    for (let j = i + 1; j < METRO_REGIONS.length; j++) {
      params.push({
        pair: `${regionToSlug(METRO_REGIONS[i])}-vs-${regionToSlug(METRO_REGIONS[j])}`,
      });
    }
  }
  return params; // 78 = C(13, 2)
}

function parsePair(pair: string): { a: string; b: string } | null {
  // Region slugs may contain hyphens — scan METRO_REGIONS for the prefix.
  for (const region of METRO_REGIONS) {
    const slug = regionToSlug(region);
    if (pair.startsWith(`${slug}-vs-`)) {
      const rest = pair.slice(slug.length + 4);
      const b = slugToRegion(rest);
      if (b) return { a: region, b };
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { a, b } = parsed;
  return {
    title: `${a} vs ${b} — synthèse 8 axes des régions 2026`,
    description: `Comparatif régional ${a} vs ${b} sur les 8 dimensions data : environnement, santé, emploi, cadre de vie, vélo, sécurité, démographie, services publics. Profil moyen agrégé par région.`,
    alternates: { canonical: `/comparer-regions/${pair}/synthese` },
    openGraph: {
      title: `${a} vs ${b} — synthèse régionale 8 axes`,
      description: `Les profils moyens des deux régions comparés axe par axe.`,
    },
  };
}

const AXIS_META: Array<{ key: "cadre-de-vie" | "environnement" | "sante" | "emploi" | "velo" | "securite" | "demographie" | "services-publics"; label: string; hint: string }> = [
  { key: "cadre-de-vie", label: "Cadre de vie", hint: "Méga-index env + santé + emploi (F52)" },
  { key: "environnement", label: "Environnement", hint: "Air · bruit · eau · risques (F44)" },
  { key: "sante", label: "Santé", hint: "MG · spé · urgences · pharma (F47)" },
  { key: "emploi", label: "Emploi", hint: "Chômage · salaires · dynamisme (F50)" },
  { key: "velo", label: "Vélo", hint: "Réseau · relief · sécurité (F57)" },
  { key: "securite", label: "Sécurité", hint: "Biens · personnes · nuit · VFFS (F58)" },
  { key: "demographie", label: "Démographie", hint: "Vieillis. · jeunes · trajectoire (F59)" },
  { key: "services-publics", label: "Services publics", hint: "Écoles · Poste · mairie · médiath. (F60)" },
];

function deltaLabel(d: number): string {
  if (Math.abs(d) < 0.3) return "≈ équivalent";
  if (d > 0) return `+${d.toFixed(1)} pt`;
  return `${d.toFixed(1)} pt`;
}

export default async function PairRegionSynthesePage({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { a, b } = parsed;

  const synA = computeRegionAverageSynthesis(a);
  const synB = computeRegionAverageSynthesis(b);
  if (!synA || !synB) notFound();

  const rows = AXIS_META.map((m) => {
    const sa = synA.byAxis[m.key];
    const sb = synB.byAxis[m.key];
    const delta = Math.round((sa - sb) * 10) / 10;
    return { ...m, a: sa, b: sb, delta };
  });
  const winsA = rows.filter((r) => r.delta >= 0.3).length;
  const winsB = rows.filter((r) => r.delta <= -0.3).length;
  const draws = rows.length - winsA - winsB;
  const verdict =
    winsA >= winsB + 2
      ? `Sur la moyenne régionale, ${a} affiche le profil global le plus favorable (${winsA}/${rows.length} axes en sa faveur, ${winsB} pour ${b}, ${draws} équivalents).`
      : winsB >= winsA + 2
        ? `Sur la moyenne régionale, ${b} affiche le profil global le plus favorable (${winsB}/${rows.length} axes en sa faveur, ${winsA} pour ${a}, ${draws} équivalents).`
        : `Profils régionaux très proches (${winsA} axes pour ${a}, ${winsB} pour ${b}, ${draws} équivalents) — le choix dépend des priorités personnelles et de la ville précise visée.`;

  const emojiA = REGION_EMOJIS[a] ?? "📍";
  const emojiB = REGION_EMOJIS[b] ?? "📍";
  const slugA = regionToSlug(a);
  const slugB = regionToSlug(b);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Comparer régions", path: "/comparer-regions" },
    { name: `${a} vs ${b}`, path: `/comparer-regions/${pair}` },
    { name: "Synthèse", path: `/comparer-regions/${pair}/synthese` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelle région l'emporte sur la synthèse globale, ${a} ou ${b} ?`,
      a: `Score global synthèse F67 (moyenne des 8 axes normalisés agrégée sur toutes les villes de la région) : ${a} ${synA.global}/10 vs ${b} ${synB.global}/10. ${verdict}`,
    },
    {
      q: `Sur quels axes ${a} dépasse-t-elle ${b} ?`,
      a:
        rows.filter((r) => r.delta >= 0.3).length === 0
          ? `${a} ne dépasse ${b} sur aucun axe avec un écart significatif (≥ 0,3 pt).`
          : `Axes favorables à ${a} : ${rows
              .filter((r) => r.delta >= 0.3)
              .map((r) => `${r.label} (+${r.delta.toFixed(1)})`)
              .join(", ")}.`,
    },
    {
      q: `Sur quels axes ${b} dépasse-t-elle ${a} ?`,
      a:
        rows.filter((r) => r.delta <= -0.3).length === 0
          ? `${b} ne dépasse ${a} sur aucun axe avec un écart significatif (≥ 0,3 pt).`
          : `Axes favorables à ${b} : ${rows
              .filter((r) => r.delta <= -0.3)
              .map((r) => `${r.label} (${Math.abs(r.delta).toFixed(1)})`)
              .join(", ")}.`,
    },
    {
      q: `Comment cette comparaison régionale est-elle calculée ?`,
      a: `Pour chaque région, on agrège (moyenne arithmétique sur les villes du seed) les 8 composites des clusters data du site (F44 environnement, F47 santé, F50 emploi, F52 cadre de vie, F57 vélo, F58 sécurité, F59 démographie, F60 services publics), normalisés vers une convention « 10 = excellent ». Calcul déterministe. ${synA.cityCount} ville${synA.cityCount > 1 ? "s" : ""} agrégée${synA.cityCount > 1 ? "s" : ""} pour ${a}, ${synB.cityCount} pour ${b}.`,
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
          <Link href="/comparer-regions" className="hover:underline">Comparer régions</Link> ·{" "}
          <Link href={`/comparer-regions/${pair}`} className="hover:underline">
            {a} vs {b}
          </Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {a} vs {b} — synthèse 8 axes
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Comparatif régional sur les 8 dimensions data du site, agrégées en moyenne
          sur toutes les villes du seed de chaque région. Convention unifiée
          10 = excellent, écart significatif fixé à ±0,3 pt.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>8 axes comparés</Badge>
          <Badge>
            {a} {synA.global}/10 vs {b} {synB.global}/10
          </Badge>
          <Badge>
            {synA.cityCount} villes / {synB.cityCount} villes
          </Badge>
        </div>

        {/* Hero verdict */}
        <Card className="mt-6">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`rounded-2xl border p-4 ${SYNTHESIS_LEVEL_BG[synA.level]}`}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                <span>{emojiA}</span> {a}
              </div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                {synA.global.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
              </div>
              <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[synA.level]}`}>
                {SYNTHESIS_LEVEL_LABEL[synA.level]} · cohérence ±{synA.spread.toFixed(1)}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
                Profil moyen sur {synA.cityCount} ville{synA.cityCount > 1 ? "s" : ""}
              </div>
            </div>
            <div className={`rounded-2xl border p-4 ${SYNTHESIS_LEVEL_BG[synB.level]}`}>
              <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                <span>{emojiB}</span> {b}
              </div>
              <div className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">
                {synB.global.toFixed(1)}
                <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
              </div>
              <div className={`text-xs font-bold uppercase mt-1 ${SYNTHESIS_LEVEL_COLOR[synB.level]}`}>
                {SYNTHESIS_LEVEL_LABEL[synB.level]} · cohérence ±{synB.spread.toFixed(1)}
              </div>
              <div className="text-[11px] text-[var(--text-tertiary)] mt-1">
                Profil moyen sur {synB.cityCount} ville{synB.cityCount > 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{verdict}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <Badge>{winsA} axes pour {a}</Badge>
            <Badge>{winsB} axes pour {b}</Badge>
            <Badge>{draws} équivalents</Badge>
          </div>
        </Card>

        {/* Axis-by-axis comparison */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Comparaison axe par axe
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Convention unifiée 10 = excellent. Le « delta » est positif quand {a} dépasse {b}.
          Écart significatif : ≥ 0,3 pt.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Axe</th>
                  <th className="px-3 py-2 text-right">{a}</th>
                  <th className="px-3 py-2 text-right">{b}</th>
                  <th className="px-3 py-2 text-right">Δ</th>
                  <th className="px-3 py-2 text-left hidden sm:table-cell">Gagnant</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const winner =
                    Math.abs(r.delta) < 0.3 ? "—" : r.delta > 0 ? a : b;
                  const winnerColor =
                    winner === "—"
                      ? "text-[var(--text-tertiary)]"
                      : "text-emerald-700";
                  return (
                    <tr key={r.key} className="border-t border-[var(--border)]">
                      <td className="px-3 py-2">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {r.label}
                        </span>
                        <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                          {r.hint}
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold tabular-nums text-[var(--text-primary)]">
                          {r.a.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold tabular-nums text-[var(--text-primary)]">
                          {r.b.toFixed(1)}
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
          <Link href={`/comparer-regions/${pair}`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ← Comparatif classique régions
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Climat, immobilier, scores agrégés
              </div>
            </Card>
          </Link>
          <Link href={`/regions/${slugA}/synthese`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Synthèse {a}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Palmarès régional + zoom département
              </div>
            </Card>
          </Link>
          <Link href={`/regions/${slugB}/synthese`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Synthèse {b}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Palmarès régional + zoom département
              </div>
            </Card>
          </Link>
          <Link href="/palmares" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Palmarès national
              </div>
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
