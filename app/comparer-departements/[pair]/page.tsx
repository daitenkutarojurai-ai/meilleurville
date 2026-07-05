import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import { scoreHex } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ pair: string }> };

// Pairs = every 2-combination of departments within the same region (natural
// rivalries: Rhône vs Isère, Nord vs Pas-de-Calais…). Cross-region pairs are
// deliberately excluded to keep the build small and the comparisons meaningful.
function allPairs(): Array<[string, string]> {
  const byRegion: Record<string, string[]> = {};
  for (const c of CITIES_SEED) {
    (byRegion[c.region] ??= []).includes(c.department) || byRegion[c.region].push(c.department);
  }
  const pairs: Array<[string, string]> = [];
  for (const depts of Object.values(byRegion)) {
    const sorted = [...depts].sort((a, b) => a.localeCompare(b, "fr"));
    for (let i = 0; i < sorted.length; i++)
      for (let j = i + 1; j < sorted.length; j++) pairs.push([sorted[i], sorted[j]]);
  }
  return pairs;
}

export function generateStaticParams() {
  return allPairs().map(([a, b]) => ({ pair: `${deptToSlug(a)}-vs-${deptToSlug(b)}` }));
}

function parsePair(pair: string): { a: string; b: string } | null {
  for (const dept of getAllDepartments()) {
    const slug = deptToSlug(dept);
    if (pair.startsWith(`${slug}-vs-`)) {
      const b = slugToDept(pair.slice(slug.length + 4));
      if (b && b !== dept) return { a: dept, b };
    }
  }
  return null;
}

const AXES = [
  ["global", "Score global"],
  ["life", "Vie quotidienne"],
  ["safety", "Sécurité"],
  ["cost", "Coût de la vie"],
  ["transport", "Transports"],
  ["nature", "Nature"],
  ["culture", "Culture"],
  ["schools", "Écoles"],
  ["remoteWork", "Télétravail"],
] as const;

function deptStats(dept: string) {
  const cities = CITIES_SEED.filter((c) => c.department === dept).sort(
    (a, b) => b.scores.global - a.scores.global
  );
  const avg = (k: (typeof AXES)[number][0]) =>
    cities.reduce((s, c) => s + c.scores[k], 0) / cities.length;
  return { cities, avg };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) return {};
  const { a, b } = parsed;
  return {
    title: `${a} ou ${b} : où vivre ? Comparatif 2026`,
    description: `${a} vs ${b} — scores comparés sur 8 critères (sécurité, coût, écoles, transports), meilleures villes de chaque département. Données publiques, verdict chiffré.`,
    alternates: { canonical: `/comparer-departements/${pair}` },
  };
}

export default async function ComparerDepartementsPage({ params }: Props) {
  const { pair } = await params;
  const parsed = parsePair(pair);
  if (!parsed) notFound();
  const { a, b } = parsed;
  const A = deptStats(a);
  const B = deptStats(b);

  const wins = AXES.filter(([k]) => k !== "global").reduce(
    (acc, [k]) => {
      if (A.avg(k) > B.avg(k) + 0.05) acc.a++;
      else if (B.avg(k) > A.avg(k) + 0.05) acc.b++;
      return acc;
    },
    { a: 0, b: 0 }
  );
  const leader = A.avg("global") >= B.avg("global") ? a : b;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Départements", path: "/departements" },
    { name: `${a} vs ${b}`, path: `/comparer-departements/${pair}` },
  ]);

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <AmbientBackground />
      <Navbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">
          Comparatif départements
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          {a} ou {b} : où poser ses valises ?
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
          Deux départements de la même région, comparés sur les scores moyens de
          leurs villes ({A.cities.length} ville{A.cities.length > 1 ? "s" : ""} notée
          {A.cities.length > 1 ? "s" : ""} côté {a}, {B.cities.length} côté {b}).
          Sur les 8 critères, <strong>{a}</strong> l&apos;emporte sur {wins.a},{" "}
          <strong>{b}</strong> sur {wins.b}
          {wins.a === wins.b ? " — égalité, le détail tranche" : ""}. Au score
          global, l&apos;avantage est à <strong>{leader}</strong>.
        </p>

        <Card className="p-5 mb-10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="pb-2 pr-3">Critère</th>
                <th className="pb-2 pr-3 text-right">{a}</th>
                <th className="pb-2 text-right">{b}</th>
              </tr>
            </thead>
            <tbody>
              {AXES.map(([k, label]) => {
                const va = A.avg(k);
                const vb = B.avg(k);
                return (
                  <tr key={k} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-3 font-medium text-[var(--text-secondary)]">{label}</td>
                    <td className="py-2 pr-3 text-right font-bold" style={{ color: scoreHex(va) }}>
                      {va.toFixed(1)}
                      {va > vb + 0.05 ? " ✓" : ""}
                    </td>
                    <td className="py-2 text-right font-bold" style={{ color: scoreHex(vb) }}>
                      {vb.toFixed(1)}
                      {vb > va + 0.05 ? " ✓" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          {[
            { dept: a, s: A },
            { dept: b, s: B },
          ].map(({ dept, s }) => (
            <Card key={dept} className="p-5">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
                Les meilleures villes — {dept}
              </h2>
              <ol className="space-y-2">
                {s.cities.slice(0, 5).map((c, i) => (
                  <li key={c.slug} className="flex items-center justify-between text-sm">
                    <span>
                      <span className="font-bold text-[var(--text-tertiary)] mr-2">{i + 1}.</span>
                      <Link href={`/villes/${c.slug}`} className="text-[var(--accent)] hover:underline font-semibold">
                        {c.name}
                      </Link>
                    </span>
                    <span className="font-bold" style={{ color: scoreHex(c.scores.global) }}>
                      {c.scores.global.toFixed(1)}
                    </span>
                  </li>
                ))}
              </ol>
              <Link
                href={`/departements/${deptToSlug(dept)}`}
                className="inline-block mt-4 text-sm text-[var(--accent)] font-semibold hover:underline"
              >
                Toutes les villes de {dept} →
              </Link>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-2">Aller plus loin</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Comparez deux villes précises avec le{" "}
            <Link href="/comparer" className="text-[var(--accent)] underline underline-offset-2">
              comparateur de villes
            </Link>
            , explorez la{" "}
            <Link href="/carte" className="text-[var(--accent)] underline underline-offset-2">
              carte par département
            </Link>{" "}
            ou laissez le{" "}
            <Link href="/city-match" className="text-[var(--accent)] underline underline-offset-2">
              City Match
            </Link>{" "}
            trancher selon vos priorités.
          </p>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
