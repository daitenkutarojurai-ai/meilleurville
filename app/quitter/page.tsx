import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QUITTER_PAIRS, buildQuitterPairData, pairToSlug } from "@/lib/quitter-pairs";
import { CITIES_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Quitter une ville pour une autre · Comparatifs honnêtes 2026",
  description: `Plus de ${QUITTER_PAIRS.length} comparatifs origine → destination : Paris → Lyon, Marseille → Aix, Lille → Lille, etc. Charges fixes, owner scores, verdict pour qui le move a du sens.`,
  alternates: { canonical: "/quitter" },
  openGraph: {
    title: "Quitter une ville pour une autre",
    description: `Comparatifs argumentés sur ${QUITTER_PAIRS.length} paires. Charges fixes + qualité de vie + profil.`,
  },
};

function groupByOrigin(): Map<string, ReturnType<typeof buildQuitterPairData>[]> {
  const grouped = new Map<string, ReturnType<typeof buildQuitterPairData>[]>();
  for (const pair of QUITTER_PAIRS) {
    const data = buildQuitterPairData(pair[0], pair[1]);
    if (!data) continue;
    const list = grouped.get(data.origin.name) ?? [];
    list.push(data);
    grouped.set(data.origin.name, list);
  }
  return grouped;
}

export default function QuitterIndexPage() {
  const grouped = groupByOrigin();

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-5xl px-4 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Quitter une ville pour une autre
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          {QUITTER_PAIRS.length} comparatifs origine → destination. Chaque page chiffre l&apos;écart de
          charges fixes (loyer, chauffage, mobilité, taxes), compare les 10 owner scores et tranche
          pour qui le move a du sens. Données dérivées des {CITIES_COUNT} villes du site — aucun chiffre inventé.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{QUITTER_PAIRS.length} paires</Badge>
          <Badge>Données calibrées sur {CITIES_COUNT} villes</Badge>
        </div>

        {[...grouped.entries()].map(([originName, pairs]) => (
          <div key={originName} className="mt-10">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Depuis {originName}</h2>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pairs
                .filter((p): p is NonNullable<typeof p> => p !== null)
                .map((p) => {
                  const slug = pairToSlug([p.origin.slug, p.destination.slug] as const);
                  return (
                    <Link key={slug} href={`/quitter/${slug}`} className="block">
                      <Card className="p-4 hover:shadow-md transition h-full">
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="text-sm font-semibold text-[var(--text-primary)]">
                            → {p.destination.name}
                          </div>
                          <div className={`text-xs font-semibold ${p.globalDelta > 0 ? "text-emerald-700" : p.globalDelta < 0 ? "text-red-700" : "text-[var(--text-tertiary)]"}`}>
                            {p.globalDelta > 0 ? "+" : ""}{p.globalDelta} pts
                          </div>
                        </div>
                        {p.monthlySavings != null && (
                          <div className="mt-2 text-xs text-[var(--text-secondary)]">
                            Charges fixes :{" "}
                            <span className={p.monthlySavings > 0 ? "text-emerald-700 font-semibold" : "text-red-700 font-semibold"}>
                              {p.monthlySavings > 0 ? "−" : "+"}{Math.abs(Math.round(p.monthlySavings))} €/mois
                            </span>
                          </div>
                        )}
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}

        <div className="mt-12 text-xs text-[var(--text-tertiary)]">
          Une paire vous intéresse mais n&apos;est pas listée ? L&apos;URL{" "}
          <code className="px-1 py-0.5 bg-[var(--bg-elevated)] rounded">/quitter/&lt;ville-a&gt;-pour-&lt;ville-b&gt;</code>{" "}
          fonctionne pour toute combinaison de deux villes du site.
        </div>
      </section>
      <Footer />
    </main>
  );
}
