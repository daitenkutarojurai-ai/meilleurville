import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  HOUSEHOLD_PROFILES,
  householdBreakdownsAllProfiles,
  type HouseholdProfile,
} from "@/lib/household-cost";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

type Props = { params: Promise<{ ville: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ ville: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const city = CITIES_SEED.find((c) => c.slug === ville);
  if (!city) return {};
  return {
    title: `Coût de la vie à ${city.name} par profil ménage — Solo, couple, famille, retraité 2026`,
    description: `Coût mensuel réel à ${city.name} pour 4 profils : solo (T1), couple (T2), famille 2 enfants (T3), retraité. Loyer, chauffage, mobilité, taxes — médians honnêtes.`,
    alternates: { canonical: `/cout-menage/${ville}` },
    openGraph: {
      title: `Coût ménage à ${city.name} — 4 profils 2026`,
      description: `Solo, couple, famille, retraité : combien ça coûte vraiment chaque mois à ${city.name} ?`,
    },
  };
}

function Row({ label, values, highlight = false }: { label: string; values: (number | null)[]; highlight?: boolean }) {
  return (
    <tr className={`${highlight ? "bg-gray-50 font-semibold" : "border-b border-gray-100"}`}>
      <td className="px-3 py-2 text-sm text-gray-800">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-3 py-2 text-right text-sm tabular-nums">
          {v != null ? `${v.toLocaleString("fr-FR")} €` : "—"}
        </td>
      ))}
    </tr>
  );
}

export default async function CoutMenageCityPage({ params }: Props) {
  const { ville } = await params;
  const city = CITIES_SEED.find((c) => c.slug === ville);
  if (!city) notFound();

  const breakdowns = householdBreakdownsAllProfiles(ville);
  const order: HouseholdProfile[] = ["solo", "couple", "famille", "retraite"];
  const byKey = new Map(breakdowns.map((b) => [b.profile, b]));
  const cols = order.map((k) => byKey.get(k)!);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Coût ménage", path: "/cout-menage" },
    { name: city.name, path: `/cout-menage/${city.slug}` },
  ]);

  // Cheapest / most expensive profile (excluding null totals)
  const totals = cols.map((c) => c.total).filter((v): v is number => v != null);
  const cheapest = totals.length ? Math.min(...totals) : null;
  const priciest = totals.length ? Math.max(...totals) : null;

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <nav className="text-xs text-gray-500 mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/cout-menage" className="hover:underline">Coût ménage</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Coût de la vie à {city.name} par profil ménage
        </h1>
        <p className="mt-3 text-base text-gray-600 max-w-3xl">
          Charges fixes mensuelles à {city.name} pour 4 profils : solo, couple sans enfant,
          famille 2 enfants, retraité. Médians dérivés des observatoires loyers, ADEME (zone
          climatique), France Assureurs et DGFiP. Indicatif — votre situation peut varier.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{HOUSEHOLD_PROFILES.length} profils</Badge>
          <Badge>Médians DGFiP + ADEME</Badge>
          {cheapest != null && priciest != null && (
            <Badge>Écart solo ↔ famille : {(priciest - cheapest).toLocaleString("fr-FR")} €/mois</Badge>
          )}
        </div>

        {/* Profile headers */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HOUSEHOLD_PROFILES.map((p, i) => {
            const b = cols[i];
            const isCheapest = b.total != null && b.total === cheapest;
            const isPriciest = b.total != null && b.total === priciest;
            return (
              <Card key={p.key} className="p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500">{p.surface}</div>
                <div className="mt-1 text-sm font-semibold text-gray-900">{p.label}</div>
                <div className="mt-1 text-xs text-gray-500">{p.tagline}</div>
                <div className="mt-3 text-xl font-bold tabular-nums">
                  {b.total != null ? `${b.total.toLocaleString("fr-FR")} €` : "—"}
                  <span className="text-xs font-normal text-gray-500">/mois</span>
                </div>
                {isCheapest && totals.length > 1 && (
                  <div className="mt-1 text-xs text-emerald-700 font-semibold">Le moins cher</div>
                )}
                {isPriciest && totals.length > 1 && (
                  <div className="mt-1 text-xs text-red-700 font-semibold">Le plus cher</div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Detailed table */}
        <h2 className="mt-10 text-xl font-semibold text-gray-900">Détail par poste</h2>
        <Card className="mt-3 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2 text-left">Poste</th>
                  {HOUSEHOLD_PROFILES.map((p) => (
                    <th key={p.key} className="px-3 py-2 text-right">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <Row label="Loyer" values={cols.map((c) => c.rent)} />
                <Row label="Chauffage" values={cols.map((c) => c.heating)} />
                <Row label="Mobilité" values={cols.map((c) => c.mobility)} />
                <Row label="Taxe foncière" values={cols.map((c) => c.taxeFonciere)} />
                <Row label="TEOM (ordures)" values={cols.map((c) => c.teom)} />
                <Row label="Surcoût scolaire" values={cols.map((c) => c.schoolExtra || null)} />
                <Row label="Total mensuel" values={cols.map((c) => c.total)} highlight />
              </tbody>
            </table>
          </div>
        </Card>

        <p className="mt-3 text-xs text-gray-500">
          Hypothèses : <strong>Solo</strong> = T1, transit prioritaire si dispo. <strong>Couple</strong>{" "}
          = T2, mode mobilité par défaut. <strong>Famille</strong> = T3, voiture (école run) + 150 €/mois
          surcoût scolaire indicatif (cantine, fournitures, péri). <strong>Retraité</strong> = T2, pas de
          trajet domicile-travail (carburant retiré), chauffage +10 % (présence journée). Le poste alimentation
          n'est pas inclus — il varie peu géographiquement et dépend du panier individuel.
        </p>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-gray-900">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href={`/villes/${city.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-gray-500">Fiche ville</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">{city.name}</div>
            </Card>
          </Link>
          <Link href={`/calculateur-cout-reel/${city.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-gray-500">Calculateur interactif</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">Saisir mon salaire</div>
            </Card>
          </Link>
          <Link href="/salaire-equivalent" className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-gray-500">Salaire équivalent</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">Reste-à-vivre inter-villes</div>
            </Card>
          </Link>
          <Link href={`/quitter/paris-pour-${city.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-gray-500">Quitter Paris</div>
              <div className="mt-1 text-sm font-semibold text-gray-900">pour {city.name}</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
