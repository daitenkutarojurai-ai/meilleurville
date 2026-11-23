import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { DepartmentDuelsHub, type DeptDuelGroup } from "@/components/AreaDuelsHub";
import { REGION_EMOJIS, regionToSlug } from "@/lib/regions";
import { CITIES_SEED } from "@/data/cities-seed";
import { deptToSlug } from "@/lib/dept-slug";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { hreflangLanguages } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Comparer deux départements · Tous les duels par région",
  description:
    "390 comparatifs de départements voisins : scores moyens sur 8 critères, meilleures villes de chacun, verdict chiffré. Rhône ou Isère ? Nord ou Pas-de-Calais ?",
  // La jumelle EN existe (`/compare-departments`) : sans `languages`, l'objet
  // `alternates` de page remplacerait celui du layout et la paire hreflang
  // disparaîtrait en silence.
  alternates: {
    canonical: "/comparer-departements",
    languages: hreflangLanguages("/comparer-departements"),
  },
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
  const groups: DeptDuelGroup[] = pairsByRegion().map(([region, pairs]) => ({
    id: `region-${regionToSlug(region)}`,
    region,
    emoji: REGION_EMOJIS[region] ?? "📍",
    pairs: pairs.map(([a, b]) => ({
      a,
      b,
      href: `/comparer-departements/${deptToSlug(a)}-vs-${deptToSlug(b)}`,
    })),
  }));
  const total = groups.reduce((s, g) => s + g.pairs.length, 0);
  return (
    <div className="min-h-screen flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />
      <main id="main-content" className="flex-1 w-full">
        <DepartmentDuelsHub
          groups={groups}
          eyebrow="Comparateur"
          titleLead="Comparer deux"
          titleAccent="départements"
          jumpLabel="Aller à une région"
          countLabel={(n) => `${n} duel${n > 1 ? "s" : ""}`}
          intro={
            <p>
              {total}{" "}duels entre départements d&apos;une même région : scores moyens
              sur 8 critères, meilleures villes de chaque camp, verdict chiffré.
              Pour comparer deux villes précises, passez par le{" "}
              <Link href="/comparer" className="font-semibold text-[#4338CA] underline underline-offset-2">
                comparateur de villes
              </Link>
              ; pour deux régions entières, le{" "}
              <Link href="/comparer-regions" className="font-semibold text-[#4338CA] underline underline-offset-2">
                comparateur de régions
              </Link>
              .
            </p>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
