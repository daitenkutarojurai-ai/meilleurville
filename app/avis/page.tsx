import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { CITIES_COUNT } from "@/lib/site-stats";
import { scoreColor, scoreLabel } from "@/lib/utils";
import { hubTitle } from "@/lib/brand";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;

export const metadata: Metadata = {
  title: hubTitle("Avis et notes des villes de France"),
  description: `La note de qualité de vie des ${CITIES_COUNT} villes françaises, sur 8 critères mesurés — et l'avis des gens qui y vivent. Cherchez la vôtre, lisez, donnez le vôtre.`,
  alternates: { canonical: "/avis" },
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Avis et notes des villes de France | MaVilleIdéale",
    description: `Note sur 10 et avis d'habitants pour ${CITIES_COUNT} villes. 8 critères mesurés, aucun avis acheté.`,
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

// Seuil de population pour les extraits « mieux / moins bien notées ». Sans
// filtre, les deux listes se remplissent de communes de 3 000 habitants dont
// personne ne cherche l'avis — le même seuil que /palmares.
const MIN_POP = 15_000;

const AXES: { key: keyof (typeof CITIES_LIGHT)[number]["scores"]; label: string }[] = [
  { key: "life", label: "Qualité de vie" },
  { key: "transport", label: "Transports" },
  { key: "nature", label: "Nature" },
  { key: "cost", label: "Coût de la vie" },
  { key: "safety", label: "Sécurité" },
  { key: "culture", label: "Culture" },
  { key: "remoteWork", label: "Télétravail" },
  { key: "schools", label: "Écoles" },
];

function CityRow({ rank, slug, name, department, score }: {
  rank: number;
  slug: string;
  name: string;
  department: string;
  score: number;
}) {
  return (
    <Link
      href={`/villes/${slug}`}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--bg-subtle)] transition-colors"
    >
      <span className="w-6 shrink-0 text-xs tabular-nums text-[var(--text-tertiary)]">{rank}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)]">
        {name}
        <span className="ml-2 text-xs font-normal text-[var(--text-tertiary)]">{department}</span>
      </span>
      <span className={`shrink-0 text-sm font-bold tabular-nums ${scoreColor(score)}`}>
        {score.toFixed(1).replace(".", ",")}
      </span>
      <span className="hidden sm:inline shrink-0 w-24 text-right text-xs text-[var(--text-tertiary)]">
        {scoreLabel(score)}
      </span>
    </Link>
  );
}

export default function AvisHubPage() {
  const eligible = CITIES_LIGHT.filter((c) => c.population >= MIN_POP);
  const best = [...eligible].sort((a, b) => b.scores.global - a.scores.global).slice(0, 20);
  const worst = [...eligible].sort((a, b) => a.scores.global - b.scores.global).slice(0, 10);
  const alphabetical = [...CITIES_LIGHT].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Avis et notes des villes", path: "/avis" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Comment est calculée la note d'une ville ?",
      a: `Chaque ville est notée sur 10 sur huit critères mesurés (${AXES.map((a) => a.label.toLowerCase()).join(", ")}), à partir de données publiques : criminalité SSMSI, loyers Insee et observatoires locaux, offre de transport, densité d'équipements. La note globale est une moyenne pondérée à laquelle on retranche une pénalité sur l'axe le plus faible — une ville très forte sur trois critères et effondrée sur un quatrième ne peut pas masquer ce trou. Le calcul est déterministe et reproductible : la même donnée donne toujours la même note.`,
    },
    {
      q: "Peut-on donner son avis sur sa ville ?",
      a: "Oui. Chaque fiche ville a une discussion ouverte en bas de page : vous pouvez y écrire ce que la donnée ne dit pas — l'ambiance d'un quartier, le bruit d'un axe, ce qui a changé en cinq ans. Aucun compte n'est nécessaire pour lire.",
    },
    {
      q: "Les avis sont-ils achetés ou filtrés ?",
      a: "Non. Aucun avis n'est acheté, aucune commune ne paie pour améliorer sa note, et un avis négatif n'est pas supprimé parce qu'il est négatif. Seuls le spam et les propos diffamatoires ou nominatifs sont écartés.",
    },
    {
      q: "Quelles villes françaises ont la meilleure note ?",
      a: `Parmi les villes de plus de ${MIN_POP.toLocaleString("fr-FR")} habitants, les mieux notées sont ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${c.scores.global.toFixed(1).replace(".", ",")}/10)`)
        .join(", ")}. Une note élevée signale un profil sans point faible marqué, pas une ville parfaite pour tout le monde.`,
    },
    {
      q: "Une mauvaise note veut-elle dire qu'il ne faut pas y vivre ?",
      a: "Non. La note agrège huit critères avec le même poids pour tout le monde, or personne ne vit avec cette pondération : un télétravailleur sans voiture et une famille de quatre ne lisent pas la même ville. Une note de 4,5 tirée vers le bas par le coût du logement reste une bonne ville pour qui est déjà propriétaire.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Avis et notes des villes de France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Deux choses différentes, sur la même page. La <strong>note</strong> : {CITIES_COUNT} villes
          évaluées sur 10, à partir de huit critères mesurés sur des données publiques. L&apos;
          <strong>avis</strong> : ce que disent les gens qui y vivent, en discussion ouverte sur
          chaque fiche. La note vous dit où regarder, l&apos;avis vous dit ce que la donnée ne
          capte pas.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{CITIES_COUNT} villes notées</Badge>
          <Badge>8 critères mesurés</Badge>
          <Badge>Aucun avis acheté</Badge>
        </div>

        {/* Trouver sa ville — l'intention n°1 de cette page */}
        <Card className="mt-6 p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Chercher la note d&apos;une ville
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Tapez son nom dans la recherche, ou parcourez la liste complète plus bas.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/villes"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Rechercher une ville →
            </Link>
            <Link
              href="/carte"
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              Voir la carte des notes
            </Link>
          </div>
        </Card>

        {/* Les 8 critères */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Sur quoi une ville est notée
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Chaque axe est noté sur 10, 10 = meilleur. La note globale les agrège, puis retranche
          une pénalité sur l&apos;axe le plus faible : c&apos;est ce qui empêche une ville
          brillante sur trois critères et effondrée sur un quatrième de finir devant une ville
          solide partout.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AXES.map((a) => (
            <div
              key={a.key}
              className="rounded-xl border border-[var(--border)] px-3 py-2.5 text-sm text-[var(--text-primary)]"
            >
              {a.label}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Le détail du calcul, source par source, est sur la{" "}
          <Link href="/methode" className="text-[var(--accent)] hover:underline">
            page méthode
          </Link>
          .
        </p>

        {/* Mieux notées */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Les 20 villes les mieux notées
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Villes de plus de {MIN_POP.toLocaleString("fr-FR")} habitants, triées par note globale.
        </p>
        <Card className="mt-3 divide-y divide-[var(--border)] p-0 overflow-hidden">
          {best.map((c, i) => (
            <CityRow
              key={c.slug}
              rank={i + 1}
              slug={c.slug}
              name={c.name}
              department={c.department}
              score={c.scores.global}
            />
          ))}
        </Card>

        {/* Moins bien notées */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Les 10 notes les plus basses
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Publier uniquement le haut du classement serait malhonnête. Ces villes décrochent sur
          au moins un axe lourd — le plus souvent sécurité, emploi ou coût du logement rapporté
          aux revenus. Ça ne veut pas dire qu&apos;on n&apos;y vit pas bien : ça veut dire
          qu&apos;il faut savoir sur quoi on arbitre.
        </p>
        <Card className="mt-3 divide-y divide-[var(--border)] p-0 overflow-hidden">
          {worst.map((c, i) => (
            <CityRow
              key={c.slug}
              rank={i + 1}
              slug={c.slug}
              name={c.name}
              department={c.department}
              score={c.scores.global}
            />
          ))}
        </Card>

        {/* Donner son avis */}
        <Card className="mt-10 p-5 border-l-4 border-l-[var(--accent)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Noter votre ville, ou dire ce qui cloche
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            La donnée ne capte pas l&apos;ambiance d&apos;un quartier, le bruit d&apos;un axe, ni
            ce qui a changé depuis cinq ans. Chaque fiche ville a une discussion ouverte en bas de
            page : ouvrez la vôtre et écrivez-y ce que vous auriez voulu lire avant
            d&apos;emménager. On ne supprime pas un avis parce qu&apos;il est négatif.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/villes"
              className="rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Trouver ma ville et donner mon avis →
            </Link>
            <Link
              href="/methode"
              className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
            >
              Comment la note est calculée
            </Link>
          </div>
        </Card>

        {/* Index complet — crawlable, ~100 octets par lien plutôt qu'une carte.
            Cf. « Performance constraints » : jamais une collection entière en
            grille, mais le maillage interne doit rester dans le HTML statique. */}
        <details className="mt-10 rounded-2xl border border-[var(--border)] p-5">
          <summary className="cursor-pointer text-lg font-semibold text-[var(--text-primary)]">
            Toutes les villes notées ({CITIES_COUNT})
          </summary>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Par ordre alphabétique. La note globale suit le nom.
          </p>
          <ul className="mt-4 columns-1 sm:columns-2 lg:columns-3 gap-4 text-sm">
            {alphabetical.map((c) => (
              <li key={c.slug} className="break-inside-avoid py-0.5">
                <Link href={`/villes/${c.slug}`} className="hover:underline text-[var(--text-secondary)]">
                  {c.name}
                </Link>{" "}
                <span className={`tabular-nums text-xs font-semibold ${scoreColor(c.scores.global)}`}>
                  {c.scores.global.toFixed(1).replace(".", ",")}
                </span>
              </li>
            ))}
          </ul>
        </details>

        {/* Aller plus loin */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/classements"
            className="rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              🏆 Classements par critère
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              La note globale cache les arbitrages. Triez sur le critère qui compte pour vous.
            </div>
          </Link>
          <Link
            href="/city-match"
            className="rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              🎯 Votre note à vous
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Repondérez les huit axes selon votre situation : le classement change.
            </div>
          </Link>
          <Link
            href="/comparer"
            className="rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              ⚖️ Comparer deux villes
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Face à face sur les huit axes, loyers et profils types.
            </div>
          </Link>
          <Link
            href="/red-flags"
            className="rounded-2xl border border-[var(--border)] p-4 hover:border-[var(--accent)] transition-colors"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)]">
              🚩 Ce qu&apos;on ne vous dit pas
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Les pièges par type de ville, avant de signer un bail.
            </div>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
