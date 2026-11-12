import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FeedbackWidget } from "@/components/FeedbackWidget";
import { EmojiBadge } from "@/components/EmojiBadge";
import { CompareTool } from "./CompareTool";
import { CITIES_CORE } from "@/lib/cities-light";
import { comparePairSlug } from "@/lib/comparer-pairs";
import Link from "@/components/AppLink";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { hubTitle } from "@/lib/brand";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: hubTitle("Comparer des villes"),
  description:
    "Comparez deux ou trois villes françaises côte à côte : qualité de vie, coût, transport, nature, sécurité, écoles. Outil de comparaison gratuit.",
  alternates: pathAlternates("/comparer", "/compare"),
};

const comparerBreadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Comparer", path: "/comparer" },
]);

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
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(comparerBreadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <EmojiBadge emoji="⚖️" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              Comparateur
            </span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            On <span className="font-display gradient-text-anim italic">tranche</span> entre vos villes
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Choisissez deux villes, on les met côte à côte. Score par score, sans détour.
          </p>
          <p className="mt-4 text-sm text-[var(--text-tertiary)] max-w-2xl mx-auto">
            Vous hésitez plutôt entre deux zones entières ? Passez par les{" "}
            <Link href="/comparer-departements" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
              comparatifs de départements
            </Link>{" "}
            ou les{" "}
            <Link href="/comparer-regions" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
              comparatifs de régions
            </Link>
            .
          </p>
          <p className="mt-2 text-sm text-[var(--text-tertiary)] max-w-2xl mx-auto">
            Le comparateur aligne les scores ; quand c&apos;est le raisonnement qui manque, nos{" "}
            <Link href="/guides/categorie/comparaison" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
              guides qui opposent deux villes en prose
            </Link>{" "}
            reprennent les duels les plus lus et disent laquelle perd, sur quoi.
          </p>
        </div>
      </section>

      <section className="band band-indigo">
        <CompareTool cities={CITIES_CORE} headingLevel="h2" />
      </section>

      <section className="band band-sky py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <EmojiBadge emoji="✨" tone="pink" size="sm" />
              <span className="inline-flex items-center rounded-full grad-head-1 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
                Populaires
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
              Les <span className="font-display gradient-text-anim italic pr-1">duels</span> qu&apos;on lit le plus
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {POPULAR_PAIRS.map(({ a, labelA, b, labelB }) => {
              // La paire éditoriale peut être écrite dans l'ordre inverse de
              // SEO_PAIRS ; trois des cinquante l'étaient et liaient un 404.
              const pairSlug = comparePairSlug(a, b);
              if (!pairSlug) return null;
              return (
              <Link
                key={`${a}-${b}`}
                href={`/comparer/${pairSlug}`}
                className="group relative overflow-hidden rounded-xl bg-white shadow-[0_10px_28px_-20px_rgba(8,145,178,0.6)] ring-1 ring-[#BAE6FD] hover:ring-[#38BDF8] hover:shadow-lg hover:-translate-y-0.5 transition-all px-4 py-3"
              >
                <div className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors leading-snug flex flex-col items-center gap-1 text-center sm:flex-row sm:justify-between sm:gap-2 sm:text-left">
                  <span className="max-w-full sm:truncate">{labelA}</span>
                  <span className="shrink-0 rounded-full grad-head-5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">vs</span>
                  <span className="max-w-full sm:truncate">{labelB}</span>
                </div>
              </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <FeedbackWidget />
        </div>
      </section>

      <Footer />
    </main>
  );
}
