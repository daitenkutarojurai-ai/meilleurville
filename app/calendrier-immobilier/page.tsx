import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { StaticPageCrossLink } from "@/components/StaticPageCrossLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Calendrier immobilier 2026 · quand acheter, vendre, déménager ?",
  description:
    "Meilleurs mois pour acheter, vendre, louer ou déménager en France. Saisonnalité du marché immobilier, locations étudiantes, prix au m² mois par mois.",
  alternates: { canonical: "/calendrier-immobilier" },
};

type Month = {
  name: string;
  emoji: string;
  buy: { score: 1 | 2 | 3 | 4 | 5; tip: string };
  sell: { score: 1 | 2 | 3 | 4 | 5; tip: string };
  rent: { score: 1 | 2 | 3 | 4 | 5; tip: string };
  move: { score: 1 | 2 | 3 | 4 | 5; tip: string };
};

const MONTHS: Month[] = [
  {
    name: "Janvier",
    emoji: "❄️",
    buy: { score: 4, tip: "Marché calme, vendeurs motivés par début d'année. Bonne fenêtre de négociation (–3 à –5 % vs prix affichés septembre)." },
    sell: { score: 2, tip: "Très peu d'acheteurs actifs, mettre en vente fin janvier seulement si nécessité. Attendre mars/avril." },
    rent: { score: 2, tip: "Marché locatif faible (peu de mobilité hors étudiants). Locataires limités côté grandes villes." },
    move: { score: 3, tip: "Déménageurs disponibles à prix bas, mais conditions hivernales (verglas, gel) risquées." },
  },
  {
    name: "Février",
    emoji: "🌨️",
    buy: { score: 4, tip: "Continuation du creux hivernal. Visites moins concurrencées, vendeurs ouverts à la négociation." },
    sell: { score: 2, tip: "Préparer la vente (photos, diagnostics) pour mise en ligne mars." },
    rent: { score: 2, tip: "Demande locative faible hors étudiants. Bailleurs ouverts." },
    move: { score: 3, tip: "Tarifs bas mais météo défavorable. Vacances scolaires créent des pics." },
  },
  {
    name: "Mars",
    emoji: "🌷",
    buy: { score: 3, tip: "Le marché redémarre. Plus de biens en ligne, mais aussi plus d'acheteurs — concurrence reprend." },
    sell: { score: 4, tip: "Excellente fenêtre pour mettre en vente (jardins en fleurs, luminosité). Photos réussies essentielles." },
    rent: { score: 3, tip: "Marché locatif revient, surtout sur les villes étudiantes." },
    move: { score: 4, tip: "Conditions météo s'améliorent, tarifs déménageurs encore modérés." },
  },
  {
    name: "Avril",
    emoji: "🌸",
    buy: { score: 3, tip: "Marché tendu, prix à leur pic printanier. Privilégier biens en ligne depuis ≥45 j (vendeurs plus négociables)." },
    sell: { score: 5, tip: "Meilleur mois pour vendre : maximum d'acheteurs actifs, biens valorisés par la lumière et les jardins." },
    rent: { score: 3, tip: "Marché locatif soutenu, surtout meublé." },
    move: { score: 4, tip: "Tarifs en hausse, réserver 4-6 semaines à l'avance." },
  },
  {
    name: "Mai",
    emoji: "🌼",
    buy: { score: 3, tip: "Pic d'activité. Bien défini = vendu rapidement. Surenchères dans les villes tendues." },
    sell: { score: 5, tip: "Pic acheteurs, profiter des week-ends prolongés (1er Mai, 8 Mai, Ascension)." },
    rent: { score: 3, tip: "Bonne fenêtre pour louer, demande équilibrée." },
    move: { score: 3, tip: "Demande forte, tarifs élevés. Réserver bien à l'avance." },
  },
  {
    name: "Juin",
    emoji: "☀️",
    buy: { score: 2, tip: "Fin de cycle printanier, beaucoup de biens vendus. Stock résiduel souvent moins qualitatif." },
    sell: { score: 4, tip: "Encore bon mois mais demande commence à décliner (acheteurs partent en vacances)." },
    rent: { score: 5, tip: "Pic locatif étudiant — bailleurs en position de force, écarter étudiants pour familles plus stables." },
    move: { score: 2, tip: "Pic de la saison, tarifs +30 à +50 %. Réserver 2 mois à l'avance impératif." },
  },
  {
    name: "Juillet",
    emoji: "🌞",
    buy: { score: 2, tip: "Marché en pause, acheteurs en vacances. Quelques bonnes affaires sur biens restés invendus." },
    sell: { score: 1, tip: "Très peu d'acheteurs actifs (vacances). Suspendre la vente jusqu'à septembre." },
    rent: { score: 5, tip: "Pic location vacances. Marché meublé étudiant tendu (rentrée approche)." },
    move: { score: 1, tip: "Pic saison déménagement, tarifs maximaux (+50 à +80 %). Éviter sauf nécessité absolue." },
  },
  {
    name: "Août",
    emoji: "🏖️",
    buy: { score: 2, tip: "Marché quasi à l'arrêt, mais idéal pour visiter en toute tranquillité." },
    sell: { score: 1, tip: "Pas de transactions, attendre septembre." },
    rent: { score: 4, tip: "Forte demande locative étudiante (rentrée). Bailleur en position de force." },
    move: { score: 1, tip: "Saison saturée, tarifs maximaux. Réserver 3 mois à l'avance si nécessaire." },
  },
  {
    name: "Septembre",
    emoji: "🍂",
    buy: { score: 4, tip: "Reprise post-vacances, vendeurs motivés (avant fin d'année). Bonne période pour acheteurs sérieux." },
    sell: { score: 4, tip: "Excellente fenêtre de rentrée. Acheteurs sérieux post-vacances. Photos avec lumière d'automne." },
    rent: { score: 4, tip: "Fin du pic étudiant, marché familles reprend. Bailleur encore en position de force." },
    move: { score: 2, tip: "Demande forte, tarifs élevés. Réserver tôt." },
  },
  {
    name: "Octobre",
    emoji: "🍁",
    buy: { score: 4, tip: "Continuation rentrée, marché actif mais moins frénétique. Bonne fenêtre de négociation." },
    sell: { score: 4, tip: "Vente courante, acheteurs sérieux. Vendre avant Toussaint pour conclure avant fin d'année." },
    rent: { score: 3, tip: "Marché locatif stable. Familles en recherche." },
    move: { score: 3, tip: "Tarifs modérés, météo correcte. Vacances Toussaint créent un pic." },
  },
  {
    name: "Novembre",
    emoji: "🌧️",
    buy: { score: 4, tip: "Marché ralentit, vendeurs cherchent à conclure avant fin d'année. Excellente fenêtre négociation (–3 à –7 %)." },
    sell: { score: 3, tip: "Vendre seulement si bien attractif. Sinon attendre mars." },
    rent: { score: 2, tip: "Marché locatif calme. Mobilité réduite." },
    move: { score: 3, tip: "Tarifs en baisse. Météo variable (pluies)." },
  },
  {
    name: "Décembre",
    emoji: "🎄",
    buy: { score: 4, tip: "Creux annuel — vendeurs très motivés (avantages fiscaux fin d'année). Meilleure fenêtre négociation après janvier." },
    sell: { score: 1, tip: "Très peu d'activité. Suspendre jusqu'à mars." },
    rent: { score: 1, tip: "Marché locatif quasi nul (fêtes). Reporter à janvier." },
    move: { score: 3, tip: "Tarifs bas mais conditions hivernales. Vacances scolaires créent quelques pics." },
  },
];

const SCORE_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-red-500/15 text-red-400 border-red-500/30",
  2: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  3: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  4: "bg-lime-500/15 text-lime-400 border-lime-500/30",
  5: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const SCORE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Très défavorable",
  2: "Défavorable",
  3: "Moyen",
  4: "Favorable",
  5: "Très favorable",
};

export default function CalendrierPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Outils", href: "/outils" },
              { label: "Calendrier immobilier" },
            ]}
          />
          <Badge variant="accent" className="mb-3">Calendrier 2026</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Quand acheter, vendre, louer ou déménager ?
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Saisonnalité du marché immobilier français mois par mois. Note de 1 (très défavorable)
            à 5 (très favorable) pour chaque action. Basé sur les patterns observés notaires.fr,
            SeLoger et Olap depuis 2018.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        {/* Quick legend */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
            Légende des notes
          </p>
          <div className="flex flex-wrap gap-2">
            {([1, 2, 3, 4, 5] as const).map((s) => (
              <span
                key={s}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${SCORE_COLORS[s]}`}
              >
                <span className="font-mono-data font-bold">{s}/5</span> {SCORE_LABELS[s]}
              </span>
            ))}
          </div>
        </div>

        {/* Months */}
        <div className="space-y-6">
          {MONTHS.map((m) => (
            <article
              key={m.name}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6"
            >
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl">{m.emoji}</span>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{m.name}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {([
                  ["Acheter", m.buy],
                  ["Vendre", m.sell],
                  ["Louer / louer à un locataire", m.rent],
                  ["Déménager", m.move],
                ] as const).map(([label, item]) => (
                  <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold font-mono-data ${SCORE_COLORS[item.score]}`}
                      >
                        {item.score}/5
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Related */}
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Tous les guides →
          </Link>
          <Link
            href="/glossaire"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Glossaire immobilier →
          </Link>
          <Link
            href="/quiz"
            className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
          >
            ✨ Trouver ma ville idéale →
          </Link>
        </div>
      </div>

      <StaticPageCrossLink exclude="/calendrier-immobilier" />
      <Footer />
    </main>
  );
}
