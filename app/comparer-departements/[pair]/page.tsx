import { Metadata } from "next";
import Link from "@/components/AppLink";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { DepartmentDuelView, type DuelSide } from "@/components/DepartmentDuelView";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug, slugToDept, getAllDepartments } from "@/lib/dept-slug";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { hreflangLanguages } from "@/lib/i18n";

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
    description: `${a} vs ${b} — scores comparés sur 8 critères (sécurité, coût, écoles, transports), meilleures villes de chaque département.`,
    alternates: {
      canonical: `/comparer-departements/${pair}`,
      languages: hreflangLanguages(`/comparer-departements/${pair}`),
    },
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

  const side = (dept: string, s: typeof A): DuelSide => ({
    dept,
    title: `Les meilleures villes — ${dept}`,
    top: s.cities.slice(0, 5).map((c) => ({
      slug: c.slug,
      name: c.name,
      score: c.scores.global,
      href: `/villes/${c.slug}`,
    })),
    allHref: `/departements/${deptToSlug(dept)}`,
    allLabel: `Toutes les villes de ${dept} →`,
  });

  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />
      <main id="main-content" className="flex-1 w-full">
        <DepartmentDuelView
          a={a}
          b={b}
          rows={AXES.map(([k, label]) => ({ key: k, label, va: A.avg(k), vb: B.avg(k) }))}
          sides={[side(a, A), side(b, B)]}
          eyebrow="Comparatif départements"
          titleLead={`${a} ou ${b} :`}
          titleAccent="où poser ses valises ?"
          criterionLabel="Critère"
          intro={
            <p>
              Deux départements de la même région, comparés sur les scores moyens de
              leurs villes ({A.cities.length} ville{A.cities.length > 1 ? "s" : ""} notée
              {A.cities.length > 1 ? "s" : ""} côté {a}, {B.cities.length} côté {b}).
              Sur les 8 critères, <strong>{a}</strong> l&apos;emporte sur {wins.a},{" "}
              <strong>{b}</strong> sur {wins.b}
              {wins.a === wins.b ? " — égalité, le détail tranche" : ""}. Au score
              global, l&apos;avantage est à <strong>{leader}</strong>.
            </p>
          }
          furtherTitle="Aller plus loin"
          furtherBody={
            <>
              Comparez deux villes précises avec le{" "}
              <Link href="/comparer">comparateur de villes</Link>, explorez la{" "}
              <Link href="/carte">carte par département</Link> ou laissez le{" "}
              <Link href="/city-match">City Match</Link> trancher selon vos priorités.
            </>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
