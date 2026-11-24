import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCalendar, type CalendarMonth } from "@/components/PropertyCalendar";
import { StaticPageCrossLink } from "@/components/StaticPageCrossLink";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Calendrier immobilier 2027 · acheter, vendre, déménager",
  description:
    "Meilleurs mois pour acheter, vendre, louer ou déménager en France. Saisonnalité du marché immobilier, locations étudiantes, prix au m² mois par mois.",
  alternates: pathAlternates("/calendrier-immobilier", "/property-calendar"),
};

type Month = CalendarMonth;

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

export default function CalendrierPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <PropertyCalendar
        locale="fr"
        months={MONTHS}
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Outils", href: "/outils" },
              { label: "Calendrier immobilier" },
            ]}
          />
        }
        title="Quand acheter, vendre, louer ou déménager ?"
        intro="Saisonnalité du marché immobilier français mois par mois. Note de 1 (très défavorable) à 5 (très favorable) pour chaque action. Basé sur les patterns observés notaires.fr, SeLoger et Olap depuis 2018."
        links={[
          { href: "/guides", label: "Tous les guides →" },
          { href: "/glossaire", label: "Glossaire immobilier →" },
          { href: "/city-match", label: "✨ Trouver ma ville idéale →" },
        ]}
      />
      <StaticPageCrossLink exclude="/calendrier-immobilier" />
      <Footer />
    </main>
  );
}
