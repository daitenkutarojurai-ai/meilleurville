import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CompareTool } from "./CompareTool";
import Link from "next/link";

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
  { a: "aix-les-bains", labelA: "Aix-les-Bains", b: "annecy", labelB: "Annecy" },
  { a: "arcachon", labelA: "Arcachon", b: "bordeaux", labelB: "Bordeaux" },
  { a: "hyeres", labelA: "Hyères", b: "toulon", labelB: "Toulon" },
  { a: "salon-de-provence", labelA: "Salon-de-Provence", b: "aix-en-provence", labelB: "Aix-en-Provence" },
  { a: "castres", labelA: "Castres", b: "albi", labelB: "Albi" },
  { a: "lens", labelA: "Lens", b: "arras", labelB: "Arras" },
  { a: "haguenau", labelA: "Haguenau", b: "strasbourg", labelB: "Strasbourg" },
  { a: "bergerac", labelA: "Bergerac", b: "bordeaux", labelB: "Bordeaux" },
  { a: "calais", labelA: "Calais", b: "dunkerque", labelB: "Dunkerque" },
  { a: "roanne", labelA: "Roanne", b: "lyon", labelB: "Lyon" },
  { a: "chatellerault", labelA: "Châtellerault", b: "poitiers", labelB: "Poitiers" },
  { a: "paris", labelA: "Paris", b: "lyon", labelB: "Lyon" },
  { a: "paris", labelA: "Paris", b: "bordeaux", labelB: "Bordeaux" },
  { a: "paris", labelA: "Paris", b: "nantes", labelB: "Nantes" },
  { a: "paris", labelA: "Paris", b: "toulouse", labelB: "Toulouse" },
  { a: "versailles", labelA: "Versailles", b: "vincennes", labelB: "Vincennes" },
  { a: "neuilly-sur-seine", labelA: "Neuilly-sur-Seine", b: "vincennes", labelB: "Vincennes" },
  { a: "saint-germain-en-laye", labelA: "St-Germain-en-Laye", b: "versailles", labelB: "Versailles" },
  { a: "boulogne-billancourt", labelA: "Boulogne-Billancourt", b: "vincennes", labelB: "Vincennes" },
  { a: "pantin", labelA: "Pantin", b: "montreuil", labelB: "Montreuil" },
  { a: "bastia", labelA: "Bastia", b: "ajaccio", labelB: "Ajaccio" },
];

export default function ComparerPage() {
  return (
    <main className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-16 pb-6">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            ⚖️ Comparateur
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            On <span className="font-display gradient-text-anim italic">tranche</span> entre vos villes
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Choisissez deux villes, on les met côte à côte. Score par score, sans détour.
          </p>
        </div>
      </section>

      <CompareTool />

      <section className="relative border-t border-[var(--border)] py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
              ✨ Populaires
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Les <span className="font-display gradient-text-anim italic">duels</span> qu&apos;on lit le plus
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {POPULAR_PAIRS.map(({ a, labelA, b, labelB }) => (
              <Link
                key={`${a}-${b}`}
                href={`/comparer/${a}-vs-${b}`}
                className="group relative overflow-hidden rounded-xl border border-[var(--border)] bg-white/70 backdrop-blur hover:border-[var(--accent)]/40 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all px-4 py-3"
              >
                <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-snug flex items-center justify-between gap-2">
                  <span className="truncate">{labelA}</span>
                  <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">vs</span>
                  <span className="truncate">{labelB}</span>
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
