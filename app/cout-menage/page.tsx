import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { HOUSEHOLD_PROFILES, householdBreakdownFor, type HouseholdProfile } from "@/lib/household-cost";

export const metadata: Metadata = {
  title: "Coût de la vie par profil ménage — Solo, couple, famille, retraité (352 villes)",
  description: "Charges fixes mensuelles dans 352 villes françaises selon 4 profils : solo (T1), couple (T2), famille 2 enfants (T3), retraité. Médians DGFiP + ADEME. Indicatif.",
  alternates: { canonical: "/cout-menage" },
  openGraph: {
    title: "Coût ménage — 4 profils, 352 villes",
    description: "Combien coûte une ville par profil ménage. Médians honnêtes, zéro chiffre inventé.",
  },
};

interface TopRow {
  citySlug: string;
  cityName: string;
  region: string | null;
  total: number;
}

function topByProfile(profile: HouseholdProfile, n: number, ascending: boolean): TopRow[] {
  const rows: TopRow[] = [];
  for (const c of CITIES_SEED) {
    const b = householdBreakdownFor(c.slug, profile);
    if (b.total != null) {
      rows.push({ citySlug: c.slug, cityName: c.name, region: c.region, total: b.total });
    }
  }
  rows.sort((a, b) => ascending ? a.total - b.total : b.total - a.total);
  return rows.slice(0, n);
}

export default function CoutMenageIndexPage() {
  const topCheapFamille = topByProfile("famille", 12, true);
  const topCheapSolo = topByProfile("solo", 12, true);
  const topExpensiveRetraite = topByProfile("retraite", 8, false);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <nav className="text-xs text-gray-500 mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Coût de la vie par profil ménage
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-3xl">
          352 villes × 4 profils ménage. Chaque fiche ville liste les charges fixes mensuelles
          pour un·e solo (T1), un couple sans enfant (T2), une famille 2 enfants (T3), et un·e
          retraité·e (T2 sans trajet). Tout dérivé des observatoires loyers, ADEME, DGFiP — aucun
          chiffre inventé.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{CITIES_SEED.length} villes</Badge>
          <Badge>{HOUSEHOLD_PROFILES.length} profils</Badge>
          <Badge>Médians ADEME + DGFiP</Badge>
        </div>

        {/* Top 12 famille moins cher */}
        <h2 className="mt-10 text-xl font-semibold text-gray-900">Top 12 villes les moins chères — famille 2 enfants</h2>
        <p className="mt-1 text-xs text-gray-500">
          T3 + voiture + surcoût scolaire (150 €/mois indicatif). Tri par total mensuel croissant.
        </p>
        <Card className="mt-3 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left w-12">#</th>
                <th className="px-3 py-2 text-left">Ville</th>
                <th className="px-3 py-2 text-left">Région</th>
                <th className="px-3 py-2 text-right">Charges fixes</th>
              </tr>
            </thead>
            <tbody>
              {topCheapFamille.map((r, i) => (
                <tr key={r.citySlug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm tabular-nums text-gray-500">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link href={`/cout-menage/${r.citySlug}`} className="text-gray-900 font-medium hover:underline">
                      {r.cityName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{r.region ?? "—"}</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums font-semibold">
                    {r.total.toLocaleString("fr-FR")} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Top 12 solo */}
        <h2 className="mt-10 text-xl font-semibold text-gray-900">Top 12 villes les moins chères — solo</h2>
        <p className="mt-1 text-xs text-gray-500">T1 + transit prioritaire. Tri par total mensuel croissant.</p>
        <Card className="mt-3 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left w-12">#</th>
                <th className="px-3 py-2 text-left">Ville</th>
                <th className="px-3 py-2 text-left">Région</th>
                <th className="px-3 py-2 text-right">Charges fixes</th>
              </tr>
            </thead>
            <tbody>
              {topCheapSolo.map((r, i) => (
                <tr key={r.citySlug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm tabular-nums text-gray-500">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link href={`/cout-menage/${r.citySlug}`} className="text-gray-900 font-medium hover:underline">
                      {r.cityName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{r.region ?? "—"}</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums font-semibold">
                    {r.total.toLocaleString("fr-FR")} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Top expensive retraite */}
        <h2 className="mt-10 text-xl font-semibold text-gray-900">8 villes les plus chères pour un·e retraité·e</h2>
        <p className="mt-1 text-xs text-gray-500">T2 sans trajet domicile-travail. Tri par total décroissant.</p>
        <Card className="mt-3 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2 text-left w-12">#</th>
                <th className="px-3 py-2 text-left">Ville</th>
                <th className="px-3 py-2 text-left">Région</th>
                <th className="px-3 py-2 text-right">Charges fixes</th>
              </tr>
            </thead>
            <tbody>
              {topExpensiveRetraite.map((r, i) => (
                <tr key={r.citySlug} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 text-sm tabular-nums text-gray-500">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link href={`/cout-menage/${r.citySlug}`} className="text-gray-900 font-medium hover:underline">
                      {r.cityName}
                    </Link>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-600">{r.region ?? "—"}</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums font-semibold">
                    {r.total.toLocaleString("fr-FR")} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="mt-10 text-xs text-gray-500">
          L'URL <code className="px-1 py-0.5 bg-gray-100 rounded">/cout-menage/&lt;slug-ville&gt;</code>{" "}
          fonctionne pour les 352 villes du site.
        </div>
      </section>
      <Footer />
    </main>
  );
}
