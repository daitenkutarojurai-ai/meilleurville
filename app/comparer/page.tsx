import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompareTool } from "./CompareTool";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Comparer des villes — MeilleurVille",
  description:
    "Comparez deux ou trois villes françaises côte à côte : qualité de vie, coût, transport, nature, sécurité, écoles. Outil de comparaison gratuit.",
};

const POPULAR_PAIRS = [
  { a: "annecy", labelA: "Annecy", b: "grenoble", labelB: "Grenoble" },
  { a: "nantes", labelA: "Nantes", b: "rennes", labelB: "Rennes" },
  { a: "bordeaux", labelA: "Bordeaux", b: "toulouse", labelB: "Toulouse" },
  { a: "lyon", labelA: "Lyon", b: "grenoble", labelB: "Grenoble" },
  { a: "montpellier", labelA: "Montpellier", b: "marseille", labelB: "Marseille" },
  { a: "nice", labelA: "Nice", b: "aix-en-provence", labelB: "Aix-en-Provence" },
  { a: "marseille", labelA: "Marseille", b: "nice", labelB: "Nice" },
  { a: "strasbourg", labelA: "Strasbourg", b: "lyon", labelB: "Lyon" },
  { a: "lille", labelA: "Lille", b: "strasbourg", labelB: "Strasbourg" },
  { a: "bordeaux", labelA: "Bordeaux", b: "nantes", labelB: "Nantes" },
  { a: "vannes", labelA: "Vannes", b: "rennes", labelB: "Rennes" },
  { a: "chambery", labelA: "Chambéry", b: "annecy", labelB: "Annecy" },
  { a: "cannes", labelA: "Cannes", b: "nice", labelB: "Nice" },
  { a: "mulhouse", labelA: "Mulhouse", b: "strasbourg", labelB: "Strasbourg" },
  { a: "toulouse", labelA: "Toulouse", b: "montpellier", labelB: "Montpellier" },
  { a: "dijon", labelA: "Dijon", b: "besancon", labelB: "Besançon" },
  { a: "la-rochelle", labelA: "La Rochelle", b: "bordeaux", labelB: "Bordeaux" },
  { a: "metz", labelA: "Metz", b: "nancy", labelB: "Nancy" },
  { a: "sete", labelA: "Sète", b: "montpellier", labelB: "Montpellier" },
  { a: "rodez", labelA: "Rodez", b: "toulouse", labelB: "Toulouse" },
  { a: "agen", labelA: "Agen", b: "bordeaux", labelB: "Bordeaux" },
  { a: "macon", labelA: "Mâcon", b: "lyon", labelB: "Lyon" },
  { a: "bourg-en-bresse", labelA: "Bourg-en-Bresse", b: "lyon", labelB: "Lyon" },
  { a: "evreux", labelA: "Évreux", b: "rouen", labelB: "Rouen" },
  { a: "blois", labelA: "Blois", b: "tours", labelB: "Tours" },
  { a: "saintes", labelA: "Saintes", b: "la-rochelle", labelB: "La Rochelle" },
  { a: "figeac", labelA: "Figeac", b: "cahors", labelB: "Cahors" },
  { a: "epinal", labelA: "Épinal", b: "nancy", labelB: "Nancy" },
  { a: "montelimar", labelA: "Montélimar", b: "valence", labelB: "Valence" },
];

export default function ComparerPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <CompareTool />

      {/* Popular comparisons SEO section */}
      <section className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="accent">Populaires</Badge>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Comparaisons fréquentes
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {POPULAR_PAIRS.map(({ a, labelA, b, labelB }) => (
              <Link
                key={`${a}-${b}`}
                href={`/comparer/${a}-vs-${b}`}
                className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
              >
                <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                  {labelA} <span className="text-[var(--text-tertiary)]">vs</span> {labelB}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
