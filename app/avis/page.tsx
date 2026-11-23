import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { CITIES_COUNT } from "@/lib/site-stats";
import { scoreColor, scoreHex, scoreLabel } from "@/lib/utils";
import { hubTitle } from "@/lib/brand";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { pathAlternates } from "@/lib/i18n";

export const revalidate = false;

export const metadata: Metadata = {
  title: hubTitle("Avis et notes des villes : notez la vôtre"),
  description: `La note de qualité de vie des ${CITIES_COUNT} villes françaises, sur 8 critères mesurés — et l'avis des gens qui y vivent. Cherchez la vôtre, lisez, donnez le vôtre.`,
  alternates: pathAlternates("/avis", "/reviews"),
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

const AXES: { key: keyof (typeof CITIES_LIGHT)[number]["scores"]; label: string; emoji: string }[] = [
  { key: "life", label: "Qualité de vie", emoji: "🌿" },
  { key: "transport", label: "Transports", emoji: "🚆" },
  { key: "nature", label: "Nature", emoji: "🌳" },
  { key: "cost", label: "Coût de la vie", emoji: "💶" },
  { key: "safety", label: "Sécurité", emoji: "🛡️" },
  { key: "culture", label: "Culture", emoji: "🎭" },
  { key: "remoteWork", label: "Télétravail", emoji: "💻" },
  { key: "schools", label: "Écoles", emoji: "🎓" },
];

function CityRow({ rank, slug, name, department, score, podium = false }: {
  rank: number;
  podium?: boolean;
  slug: string;
  name: string;
  department: string;
  score: number;
}) {
  return (
    <Link
      href={`/villes/${slug}`}
      className="group flex items-center gap-3 px-4 py-2.5 hover:bg-[#EEF2FF] transition-colors"
    >
      <span
        className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums ${
          podium ? "grad-head-1 shadow-sm" : "bg-[#EEF2FF] text-[#4338CA] ring-1 ring-[#C7D2FE]"
        }`}
      >
        {rank}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
        {name}
        <span className="ml-2 text-xs font-normal text-[var(--text-tertiary)]">{department}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white px-2 py-0.5 ring-1 ring-[var(--border)]">
        <span className="h-2 w-2 rounded-full" style={{ background: scoreHex(score) }} aria-hidden />
        <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>{score.toFixed(1).replace(".", ",")}</span>
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

      <section className="relative overflow-hidden bg-aurora py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-4">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <EmojiBadge emoji="⭐" tone="pink" size="lg" className="shadow-[0_12px_28px_-12px_rgba(219,39,119,0.55)]" />
        <div className="min-w-0">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text">
          Avis et notes des villes de France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Deux choses différentes, sur la même page. La <strong>note</strong> : {CITIES_COUNT} villes
          évaluées sur 10, à partir de huit critères mesurés sur des données publiques. L&apos;
          <strong>avis</strong> : ce que disent les gens qui y vivent, en discussion ouverte sur
          chaque fiche. La note vous dit où regarder, l&apos;avis vous dit ce que la donnée ne
          capte pas.
        </p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#EEF2FF] px-3 py-1.5 text-[#3730A3] ring-1 ring-[#C7D2FE]"><span aria-hidden>🏙️</span>{CITIES_COUNT} villes notées</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FDF2F8] px-3 py-1.5 text-[#9D174D] ring-1 ring-[#FBCFE8]"><span aria-hidden>📏</span>8 critères mesurés</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFEFF] px-3 py-1.5 text-[#155E75] ring-1 ring-[#A5F3FC]"><span aria-hidden>🤝</span>Aucun avis acheté</span>
        </div>
        </div>
        </div>

        {/* Trouver sa ville — l'intention n°1 de cette page */}
        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-[0_18px_40px_-24px_rgba(79,70,229,0.55)] ring-1 ring-[#C7D2FE]">
          <div aria-hidden className="h-1.5 grad-head-5" />
          <div className="p-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Chercher la note d&apos;une ville, ou noter la vôtre
          </h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Tapez son nom dans la recherche, ou parcourez la liste complète plus bas. Vous y habitez ?
            Le bouton « Donnez votre avis » est en haut de chaque fiche ville : votre note s&apos;affiche
            à côté de la nôtre.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/villes"
              className="rounded-xl grad-head-5 px-4 py-2 text-sm font-semibold shadow-[0_10px_24px_-12px_rgba(219,39,119,0.7)] hover:-translate-y-0.5 transition-transform"
            >
              Rechercher une ville →
            </Link>
            <Link
              href="/carte"
              className="rounded-xl bg-[#ECFEFF] px-4 py-2 text-sm font-semibold text-[#155E75] ring-1 ring-[#A5F3FC] hover:bg-[#CFFAFE] transition-colors"
            >
              Voir la carte des notes
            </Link>
          </div>
          </div>
        </div>
        </div>
      </section>

      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Les 8 critères */}
        <div className="flex items-center gap-3">
        <EmojiBadge emoji="📏" tone="indigo" size="sm" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Sur quoi une ville est notée
        </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Chaque axe est noté sur 10, 10 = meilleur. La note globale les agrège, puis retranche
          une pénalité sur l&apos;axe le plus faible : c&apos;est ce qui empêche une ville
          brillante sur trois critères et effondrée sur un quatrième de finir devant une ville
          solide partout.
        </p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AXES.map((a, i) => (
            <div
              key={a.key}
              className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-[0_8px_20px_-16px_rgba(79,70,229,0.6)] ring-1 ring-[#C7D2FE]"
            >
              <EmojiBadge emoji={a.emoji} tone={toneFor(i)} size="sm" className="!h-8 !w-8 !text-base" />
              <span className="min-w-0">{a.label}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Le détail du calcul, source par source, est sur la{" "}
          <Link href="/methode" className="font-medium text-[#4338CA] underline underline-offset-2 hover:text-[#BE185D]">
            page méthode
          </Link>
          .
        </p>
        </div>
      </section>

      <section className="band band-sky py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Mieux notées */}
        <div className="flex items-center gap-3">
        <EmojiBadge emoji="🏆" tone="sky" size="sm" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Les 20 villes les mieux notées
        </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Villes de plus de {MIN_POP.toLocaleString("fr-FR")} habitants, triées par note globale.
        </p>
        <div className="mt-4 divide-y divide-[#E0E7FF] overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_-22px_rgba(3,105,161,0.6)] ring-1 ring-[#BAE6FD]">
          {best.map((c, i) => (
            <CityRow
              key={c.slug}
              rank={i + 1}
              podium={i < 3}
              slug={c.slug}
              name={c.name}
              department={c.department}
              score={c.scores.global}
            />
          ))}
        </div>
        </div>
      </section>

      <section className="band band-pink py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Moins bien notées */}
        <div className="flex items-center gap-3">
        <EmojiBadge emoji="📉" tone="pink" size="sm" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          Les 10 notes les plus basses
        </h2>
        </div>
        <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-3xl">
          Publier uniquement le haut du classement serait malhonnête. Ces villes décrochent sur
          au moins un axe lourd — le plus souvent sécurité, emploi ou coût du logement rapporté
          aux revenus. Ça ne veut pas dire qu&apos;on n&apos;y vit pas bien : ça veut dire
          qu&apos;il faut savoir sur quoi on arbitre.
        </p>
        <div className="mt-4 divide-y divide-[#FCE7F3] overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_-22px_rgba(190,24,93,0.55)] ring-1 ring-[#FBCFE8]">
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
        </div>
        </div>
      </section>

        {/* Donner son avis */}
      <section className="band band-bold py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="flex justify-center"><span aria-hidden className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-3xl ring-1 ring-white/40">💬</span></div>
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold">
            Noter votre ville, ou dire ce qui cloche
          </h2>
          <p className="mt-3 text-base text-white/90">
            La donnée ne capte pas l&apos;ambiance d&apos;un quartier, le bruit d&apos;un axe, ni
            ce qui a changé depuis cinq ans. Chaque fiche ville a une discussion ouverte en bas de
            page : ouvrez la vôtre et écrivez-y ce que vous auriez voulu lire avant
            d&apos;emménager. On ne supprime pas un avis parce qu&apos;il est négatif.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/villes"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#4338CA] shadow-lg hover:-translate-y-0.5 transition-transform"
            >
              Trouver ma ville et donner mon avis →
            </Link>
            <Link
              href="/methode"
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/60 hover:bg-white/20 transition-colors"
            >
              Comment la note est calculée
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-lilac py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Index complet — crawlable, ~100 octets par lien plutôt qu'une carte.
            Cf. « Performance constraints » : jamais une collection entière en
            grille, mais le maillage interne doit rester dans le HTML statique. */}
        <details className="group overflow-hidden rounded-2xl bg-white shadow-[0_14px_32px_-20px_rgba(124,58,237,0.6)]">
          <summary className="grad-head-4 flex cursor-pointer list-none items-center gap-3 px-5 py-4 text-base font-semibold [&::-webkit-details-marker]:hidden">
            <span aria-hidden className="text-lg leading-none">🔤</span>
            <span className="flex-1">
            Toutes les villes notées ({CITIES_COUNT})
            </span>
            <span aria-hidden className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
          </summary>
          <p className="px-5 pt-4 text-sm text-[var(--text-secondary)]">
            Par ordre alphabétique. La note globale suit le nom.
          </p>
          <ul className="columns-1 gap-4 p-5 text-sm sm:columns-2 lg:columns-3">
            {alphabetical.map((c) => (
              <li key={c.slug} className="break-inside-avoid py-0.5">
                <Link href={`/villes/${c.slug}`} className="text-[var(--text-secondary)] hover:text-[var(--accent)] hover:underline">
                  {c.name}
                </Link>{" "}
                <span className={`tabular-nums text-xs font-semibold ${scoreColor(c.scores.global)}`}>
                  {c.scores.global.toFixed(1).replace(".", ",")}
                </span>
              </li>
            ))}
          </ul>
        </details>
        </div>
      </section>

      <section className="band band-aqua py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* Aller plus loin */}
        <div className="flex items-center gap-3">
        <EmojiBadge emoji="🧭" tone="aqua" size="sm" />
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Aller plus loin</h2>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href="/classements"
            className="group rounded-2xl bg-white p-4 shadow-[0_10px_26px_-20px_rgba(14,116,144,0.7)] ring-1 ring-[#C7D2FE] hover:ring-[#818CF8] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
              🏆 Classements par critère
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              La note globale cache les arbitrages. Triez sur le critère qui compte pour vous.
            </div>
          </Link>
          <Link
            href="/city-match"
            className="group rounded-2xl bg-white p-4 shadow-[0_10px_26px_-20px_rgba(14,116,144,0.7)] ring-1 ring-[#FBCFE8] hover:ring-[#F472B6] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
              🎯 Votre note à vous
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Repondérez les huit axes selon votre situation : le classement change.
            </div>
          </Link>
          <Link
            href="/comparer"
            className="group rounded-2xl bg-white p-4 shadow-[0_10px_26px_-20px_rgba(14,116,144,0.7)] ring-1 ring-[#A5F3FC] hover:ring-[#22D3EE] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
              ⚖️ Comparer deux villes
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Face à face sur les huit axes, loyers et profils types.
            </div>
          </Link>
          <Link
            href="/red-flags"
            className="group rounded-2xl bg-white p-4 shadow-[0_10px_26px_-20px_rgba(14,116,144,0.7)] ring-1 ring-[#E9D5FF] hover:ring-[#C084FC] hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#4338CA] transition-colors">
              🚩 Ce qu&apos;on ne vous dit pas
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              Les pièges par type de ville, avant de signer un bail.
            </div>
          </Link>
        </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
