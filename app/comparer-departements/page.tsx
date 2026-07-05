import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug } from "@/lib/dept-slug";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Comparer deux départements · Tous les duels région par région",
  description:
    "390 comparatifs de départements voisins : scores moyens sur 8 critères, meilleures villes de chacun, verdict chiffré. Rhône ou Isère ? Nord ou Pas-de-Calais ?",
  alternates: { canonical: "/comparer-departements" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Comparer les départements", path: "/comparer-departements" },
]);

function pairsByRegion(): Array<[string, Array<[string, string]>]> {
  const byRegion: Record<string, string[]> = {};
  for (const c of CITIES_SEED) {
    (byRegion[c.region] ??= []).includes(c.department) || byRegion[c.region].push(c.department);
  }
  return Object.entries(byRegion)
    .map(([region, depts]): [string, Array<[string, string]>] => {
      const sorted = [...depts].sort((a, b) => a.localeCompare(b, "fr"));
      const pairs: Array<[string, string]> = [];
      for (let i = 0; i < sorted.length; i++)
        for (let j = i + 1; j < sorted.length; j++) pairs.push([sorted[i], sorted[j]]);
      return [region, pairs];
    })
    .filter(([, pairs]) => pairs.length > 0)
    .sort((a, b) => a[0].localeCompare(b[0], "fr"));
}

export default function ComparerDepartementsIndex() {
  const groups = pairsByRegion();
  const total = groups.reduce((s, [, p]) => s + p.length, 0);
  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(breadcrumb) }} />
      <AmbientBackground />
      <Navbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">
          Comparateur
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Comparer deux départements
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
          {total} duels entre départements d&apos;une même région : scores moyens
          sur 8 critères, meilleures villes de chaque camp, verdict chiffré.
          Pour comparer deux villes précises, passez par le{" "}
          <Link href="/comparer" className="text-[var(--accent)] underline underline-offset-2">
            comparateur de villes
          </Link>
          ; pour deux régions entières, le{" "}
          <Link href="/comparer-regions" className="text-[var(--accent)] underline underline-offset-2">
            comparateur de régions
          </Link>
          .
        </p>

        <div className="space-y-6">
          {groups.map(([region, pairs]) => (
            <Card key={region} className="p-5">
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">{region}</h2>
              <div className="flex flex-wrap gap-2">
                {pairs.map(([a, b]) => (
                  <Link
                    key={`${a}-${b}`}
                    href={`/comparer-departements/${deptToSlug(a)}-vs-${deptToSlug(b)}`}
                    className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-colors"
                  >
                    {a} vs {b}
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
