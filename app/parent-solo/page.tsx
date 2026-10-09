import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { GUIDES } from "@/data/guides";
import { parentSoloFit, fitLabel, minIncomeForT3 } from "@/lib/parent-solo";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";
import { Users, ChevronRight } from "lucide-react";
import { pathAlternates } from "@/lib/i18n";

export const revalidate = false;

// Ranking with a population floor: the parent-solo score composite spikes on
// tiny communes where cost/safety are structurally favourable but scholar and
// transport signals go noisy. The 20 000 floor is the same threshold used by
// F52 quality-of-life rankings.
const MIN_POP = 20_000;
// Quotas indicatifs : ce sont des cibles, pas des coupes. `cutAtTier` s'arrête
// avant le palier qui les dépasserait, donc la table publiée peut compter un
// peu moins de lignes — jamais un palier tronqué.
const TOP_N = 30;
const BOTTOM_N = 10;

interface Row {
  slug: string;
  name: string;
  region: string;
  department: string;
  fit: number;
  label: string;
  breakdown: { cost: number; transport: number; schools: number; safety: number };
  rentT3: number | null;
  minIncome: number | null;
}

function buildRows(): Row[] {
  const rows: Row[] = [];
  for (const city of CITIES_SEED) {
    if (city.population < MIN_POP) continue;
    const f = parentSoloFit(city);
    const housing = getHousing(city.slug);
    const rentT3 = housing?.avgRentT3 ?? null;
    const minIncome = rentT3 ? minIncomeForT3(rentT3, city.scores.cost) : null;
    rows.push({
      slug: city.slug,
      name: city.name,
      region: city.region,
      department: city.department,
      fit: f.score,
      label: fitLabel(f.score).label,
      breakdown: f.breakdown,
      rentT3,
      minIncome,
    });
  }
  return rows;
}

/**
 * Coupe une liste triée AVANT le palier qui déborde du quota.
 *
 * Un `sort` suivi d'un `slice(0, N)` sur un score à une décimale **fabrique** la
 * fin de sa liste. Mesuré sur ce classement : le palier 6,6 compte dix communes
 * et occupe les rangs 27 à 36, si bien qu'un `slice(0, 30)` en publiait quatre
 * et laissait six ex æquo dehors, départagées par l'ordre alphabétique ; côté
 * bas, le palier 4,1 compte onze communes et un `slice(0, 10)` en nommait trois
 * parmi « les dix villes qui pénalisent le plus », ce qui est une affirmation
 * négative sur une commune réelle décidée par son initiale.
 *
 * Convention de `lib/owner-rankings.ts` : on groupe par valeur, on s'arrête
 * avant le palier qui déborde, et la page dit combien de villes suivaient et à
 * quelle note. Si le premier palier dépasse déjà le quota, on le publie entier
 * — le quota est une cible, la coupe d'une égalité est une faute.
 */
function cutAtTier(sorted: Row[], quota: number): {
  rows: Row[];
  followers: number;
  followerFit: number | null;
} {
  let end = 0;
  while (end < sorted.length) {
    const fit = sorted[end].fit;
    let next = end;
    while (next < sorted.length && sorted[next].fit === fit) next++;
    if (next > quota && end > 0) break;
    end = next;
    if (end >= quota) break;
  }
  return {
    rows: sorted.slice(0, end),
    followers: sorted.length - end,
    followerFit: end < sorted.length ? sorted[end].fit : null,
  };
}

/**
 * Rang d'un palier, et sa taille. Toutes les communes d'un palier partagent le
 * même rang : l'ordre alphabétique qui les sépare dans la table est un ordre
 * **stable**, pas un départage, et publier une position dedans reviendrait à
 * publier l'initiale de la commune. Mesuré sur ce classement : 340 des 363
 * communes changent de rang si l'on inverse ce seul départage.
 */
function tierOf(rows: Row[], fit: number, better: (a: number, b: number) => boolean) {
  return {
    rank: rows.filter((r) => better(r.fit, fit)).length + 1,
    size: rows.filter((r) => r.fit === fit).length,
  };
}

export const metadata: Metadata = {
  title: "Parent solo : les villes qui tiennent en 2026",
  description:
    "Les villes françaises où la vie de parent solo tient : coût, transports, écoles, sécurité. Composite 4 axes pondérés, mêmes poids que City Match, budget T3 estimé.",
  alternates: pathAlternates("/parent-solo", "/single-parent"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Parent solo · Les villes françaises qui tiennent en 2026",
    description:
      `Un seul revenu, un seul conducteur. Classement 4 axes (coût, transports, écoles, sécurité) sur ${CITIES_COUNT} villes.`,
  },
};

export default function ParentSoloHubPage() {
  const rows = buildRows();
  const topCut = cutAtTier(
    [...rows].sort((a, b) => b.fit - a.fit || a.name.localeCompare(b.name, "fr")),
    TOP_N,
  );
  const bottomCut = cutAtTier(
    [...rows].sort((a, b) => a.fit - b.fit || a.name.localeCompare(b.name, "fr")),
    BOTTOM_N,
  );
  const top = topCut.rows;
  const bottom = bottomCut.rows;
  // Les 5 « meilleures » citées en FAQ suivent la même règle : on ne coupe pas
  // un palier au rang 5 pour faire un chiffre rond.
  const faqTop = cutAtTier(top, 5).rows;
  const higher = (a: number, b: number) => a > b;
  const lower = (a: number, b: number) => a < b;

  const relatedGuides = GUIDES.filter((g) => g.slug.startsWith("parent-solo-a-")).sort((a, b) =>
    a.title.localeCompare(b.title, "fr"),
  );

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Parent solo", path: "/parent-solo" },
  ]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Villes françaises les mieux adaptées au profil parent solo",
    numberOfItems: top.length,
    // Les premières villes comportent des ex æquo (deux communes à 7,2/10, trois
    // à 7,1), et l'ordre qui les sépare est alphabétique. Publier `position`
    // renverrait cet ordre fabriqué en données structurées, où personne ne le
    // relit — d'où `ItemListUnordered` et l'absence de `position`, comme
    // l'exige la convention de lib/owner-rankings.ts.
    itemListOrder: "https://schema.org/ItemListUnordered",
    itemListElement: top.map((r) => ({
      "@type": "ListItem",
      name: r.name,
      url: `https://www.mavilleideale.fr/villes/${r.slug}/parent-solo`,
      description: `Score fit ${r.fit.toFixed(1)}/10 (${r.label.toLowerCase()}) · coût ${r.breakdown.cost.toFixed(1)}, transports ${r.breakdown.transport.toFixed(1)}, écoles ${r.breakdown.schools.toFixed(1)}, sécurité ${r.breakdown.safety.toFixed(1)}`,
    })),
  };

  const faq = faqJsonLd([
    {
      q: "Quelles villes françaises sont les plus adaptées à une vie de parent solo ?",
      a: `Selon notre composite parent solo (coût 30 % + transports 20 % + écoles 25 % + sécurité 25 %, mêmes poids que le profil City Match), les 5 villes ≥ ${MIN_POP.toLocaleString("fr-FR")} habitants au meilleur score sont : ${faqTop
        .map((c) => `${c.name} (${c.fit.toFixed(1)}/10)`)
        .join(", ")}. Ces villes cumulent un coût de la vie tenable sur un seul revenu, un réseau de transport qui absorbe l'imprévu quand personne d'autre ne peut prendre le relais, un maillage scolaire et périscolaire dense, et un niveau de sécurité qui rend la sortie d'école ou le retour de nuit sereins.`,
    },
    {
      q: "Comment le score parent solo est-il calculé ?",
      a: "Pondération éditoriale explicite : coût de la vie 0,30 · transports 0,20 · écoles 0,25 · sécurité 0,25 (total 1,00). Les 4 axes sont des notes estimées à l'échelle de la commune, issues du seed (data/cities-seed.ts) et calibrées à partir de cadres de référence publics (Insee, SSMSI, observatoires des loyers) ; ce ne sont pas des taux publiés. Aucune donnée de revenu n'entre dans le classement. Le résultat reste sur une échelle 0-10 avec la même convention que les axes individuels (10 = excellent). Formule identique à celle du profil « single-parent » dans lib/city-match.ts.",
    },
    {
      q: "Pourquoi ce classement diffère-t-il du palmarès général ?",
      a: "Le palmarès général (/palmares) fait la moyenne des 8 composites du site — utile pour un profil non spécifié. Le score parent solo re-priorise 4 axes cruciaux quand on est seul·e à conduire, seul·e à gagner et seul·e à porter la charge : la nature, la culture, le télétravail passent au second plan. Une ville excellente en global peut sortir moyenne ici si son coût explose ou si son réseau transport ne rattrape pas les imprévus.",
    },
    {
      q: "Quel budget minimum pour un T3 en parent solo ?",
      a: `Sur la règle du tiers du revenu net (33 %, relâchée à 35 % sur les marchés très tendus où le score coût passe sous 5), les seuils varient fortement selon la ville. Sur les villes de tête : ${faqTop
        .filter((r) => r.minIncome)
        .map((r) => `${r.name} ${r.minIncome} €/mois net (T3 ${r.rentT3} €)`)
        .join(", ")}. Sous ce seuil, il faut activer un levier logement (social, intermédiaire, colocation avec un autre parent solo) ou basculer sur un T2 avec chambre partagée.`,
    },
    {
      q: "Y a-t-il des aides CAF spécifiques aux parents solos ?",
      a: "Oui, plusieurs. L'Allocation de soutien familial (ASF) est versée aux parents isolés élevant seul·e un enfant. La majoration RSA pour parent isolé, le Complément mode de garde (CMG) fortement allégé pour les parents seuls, les APL/ALF sur le logement. La cantine scolaire, le périscolaire et les centres de loisirs sont facturés en tranches par quotient familial par la mairie — à demander en indiquant le statut monoparental (« priorité famille monoparentale » à mentionner sur dossier, pas automatique). Le CCAS (Centre communal d'action sociale) local est le bon point d'entrée pour les aides mairie/département.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <AmbientBackground />
      <Navbar />

      <section className="relative overflow-hidden py-12 sm:py-16 border-b border-[var(--border)]">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">Parent solo</span>
          </nav>

          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            🧑‍🍼 Parent solo
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
            Les villes françaises qui tiennent en configuration parent solo
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)]">
            Un seul revenu, un seul conducteur, un seul parent le matin comme le soir.
            Ce que ça change concrètement, ville par ville — sans misérabilisme, sans
            « courage » condescendant. Composite 4 axes pondérés (coût 30 % · transports
            20 % · écoles 25 % · sécurité 25 %), même formule que le profil City Match.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-xs">
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-secondary)]">
              {rows.length} villes classées
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-secondary)]">
              Population ≥ {MIN_POP.toLocaleString("fr-FR")} hab.
            </span>
            <span className="rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-[var(--text-secondary)]">
              4 axes pondérés
            </span>
          </div>
        </div>
      </section>

      {/* CTAs vers City Match et la sous-page individuelle */}
      <section className="py-8 border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/city-match"
            className="group flex items-center justify-between rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-5 py-4 hover:border-[var(--accent)] hover:shadow-md transition-all"
          >
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                ✨ Personnaliser via City Match
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Le profil « parent solo » y est déjà pondéré ; le quiz ajoute vos autres critères.
              </div>
            </div>
            <span className="shrink-0 text-[var(--accent)] text-sm font-semibold">→</span>
          </Link>
          <Link
            href="/pour-qui/familles-monoparentales"
            className="group flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
          >
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                👥 Voir la fiche profil « familles monoparentales »
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Angle éditorial du profil (différent du score composite ci-dessous).
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors shrink-0" />
          </Link>
        </div>
      </section>

      {/* Top 30 */}
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-5 w-5 text-[var(--accent)] shrink-0" />
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Les {top.length} villes où le profil parent solo tient sans arbitrage douloureux
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
            Villes ≥ {MIN_POP.toLocaleString("fr-FR")} hab. au meilleur score composite parent solo.
            La colonne « revenu minimum » applique la règle du tiers du revenu net au loyer T3 réel.
            Sous ce seuil, il faut activer un levier logement.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mb-6 max-w-3xl">
            <strong className="text-[var(--text-secondary)]">Pourquoi {top.length} et pas {TOP_N}.</strong>{" "}
            La liste s&apos;arrête avant le palier qui déborderait : le score est à une décimale, donc
            des communes sont à égalité stricte, et couper une égalité en son milieu fabriquerait la
            fin de la liste.{" "}
            {topCut.followerFit !== null && (
              <>
                {topCut.followers} commune{topCut.followers > 1 ? "s" : ""} suiv
                {topCut.followers > 1 ? "ent" : "t"}, la première à{" "}
                {topCut.followerFit.toFixed(1)}/10.{" "}
              </>
            )}
            Les communes d&apos;un même palier partagent leur rang ; l&apos;ordre alphabétique qui les
            sépare ici est un ordre stable, pas un départage.
          </p>

          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left hidden lg:table-cell">Département</th>
                  <th className="px-3 py-2 text-right">Fit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Coût</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Transports</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Écoles</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Sécurité</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">T3</th>
                  <th className="px-3 py-2 text-right">Revenu min.</th>
                </tr>
              </thead>
              <tbody>
                {top.map((r) => {
                  const t = tierOf(rows, r.fit, higher);
                  return (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">
                      {t.rank}
                      {t.size > 1 && (
                        <span
                          className="ml-1 text-[10px] text-[var(--text-tertiary)]"
                          title={`${t.size} communes à ${r.fit.toFixed(1)}/10 — rang partagé, l'ordre entre elles est alphabétique`}
                        >
                          ex æquo
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${r.slug}/parent-solo`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {r.name}
                      </Link>
                      <div className="text-[11px] text-[var(--text-tertiary)] lg:hidden">{r.department}</div>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)] hidden lg:table-cell">
                      {r.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${scoreColor(r.fit)}`}>
                        {r.fit.toFixed(1)}
                      </span>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
                        {r.label}
                      </div>
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.cost)}`}>
                      {r.breakdown.cost.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.transport)}`}>
                      {r.breakdown.transport.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.schools)}`}>
                      {r.breakdown.schools.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.safety)}`}>
                      {r.breakdown.safety.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">
                      {r.rentT3 ? `${r.rentT3} €` : "—"}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-primary)] font-semibold">
                      {r.minIncome ? `${r.minIncome} €` : "—"}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-2">
            Lecture : score composite = coût × 0,30 + transports × 0,20 + écoles × 0,25 + sécurité × 0,25.
            Revenu minimum = loyer T3 ÷ 33 % (35 % si coût &lt; 5). Loyer T3 tiré de{" "}
            <code className="text-[11px]">data/housing.ts</code>. Les villes sans loyer individualisé
            affichent « — » et renvoient vers les observatoires régionaux.
          </p>
        </div>
      </section>

      {/* Bottom 10 */}
      <section className="py-10 sm:py-14 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Les {bottom.length} villes qui pénalisent le plus le profil parent solo
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
            Villes ≥ {MIN_POP.toLocaleString("fr-FR")} hab. au composite le plus bas — cumulent
            généralement coût élevé + transport faible, ou sécurité en dessous de la moyenne
            malgré un coût correct. Ce n&apos;est pas une condamnation : c&apos;est un signal que la
            configuration parent solo y demande plus d&apos;organisation, plus d&apos;aides à activer
            (CAF, CCAS, logement social) et une vérification quartier par quartier avant de signer.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mb-6 max-w-3xl">
            <strong className="text-[var(--text-secondary)]">Pourquoi {bottom.length} et pas {BOTTOM_N}.</strong>{" "}
            Même règle qu&apos;en haut de page, et elle compte double ici : nommer une commune parmi
            les plus pénalisantes est une affirmation négative sur un lieu réel, et il serait
            indéfendable de la retenir plutôt qu&apos;une autre au même score parce que son nom vient
            avant dans l&apos;alphabet.{" "}
            {bottomCut.followerFit !== null && (
              <>
                {bottomCut.followers} commune{bottomCut.followers > 1 ? "s" : ""} suiv
                {bottomCut.followers > 1 ? "ent" : "t"}, la première à{" "}
                {bottomCut.followerFit.toFixed(1)}/10.
              </>
            )}
          </p>

          <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left hidden lg:table-cell">Département</th>
                  <th className="px-3 py-2 text-right">Fit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Coût</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Transports</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Écoles</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Sécurité</th>
                </tr>
              </thead>
              <tbody>
                {bottom.map((r) => {
                  const t = tierOf(rows, r.fit, lower);
                  return (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums whitespace-nowrap">
                      {t.rank}
                      {t.size > 1 && (
                        <span
                          className="ml-1 text-[10px] text-[var(--text-tertiary)]"
                          title={`${t.size} communes à ${r.fit.toFixed(1)}/10 — rang partagé, l'ordre entre elles est alphabétique`}
                        >
                          ex æquo
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${r.slug}/parent-solo`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {r.name}
                      </Link>
                      <div className="text-[11px] text-[var(--text-tertiary)] lg:hidden">{r.department}</div>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)] hidden lg:table-cell">
                      {r.department}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${scoreColor(r.fit)}`}>
                        {r.fit.toFixed(1)}
                      </span>
                      <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
                        {r.label}
                      </div>
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.cost)}`}>
                      {r.breakdown.cost.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.transport)}`}>
                      {r.breakdown.transport.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.schools)}`}>
                      {r.breakdown.schools.toFixed(1)}
                    </td>
                    <td className={`px-3 py-2 text-right tabular-nums hidden md:table-cell ${scoreColor(r.breakdown.safety)}`}>
                      {r.breakdown.safety.toFixed(1)}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guides parent-solo */}
      {relatedGuides.length > 0 && (
        <section className="py-10 sm:py-14 border-t border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Guides longs : la vie de parent solo, ville par ville
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
              {relatedGuides.length} guides éditoriaux dédiés — budget T3 sur un seul revenu,
              périmètre écoles, quartiers à filtrer, verdict honnête pour chaque configuration.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all px-4 py-3"
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                    {g.emoji} {g.title}
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    {g.readMinutes} min · {g.metaDesc}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Méthodologie */}
      <section className="py-10 sm:py-14 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Méthodologie</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-5 max-w-3xl space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              <strong className="text-[var(--text-primary)]">Formule.</strong>{" "}
              fit = coût × 0,30 + transports × 0,20 + écoles × 0,25 + sécurité × 0,25.
              Total des poids = 1,00 → le résultat reste sur 0-10 comme les axes. Identique
              à la formule du profil <code className="text-xs px-1 rounded bg-[var(--bg-elevated)]">single-parent</code>{" "}
              de <code className="text-xs px-1 rounded bg-[var(--bg-elevated)]">lib/city-match.ts</code>.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Pourquoi ces 4 axes.</strong>{" "}
              Coût (30 %) parce qu&apos;un seul revenu porte tout le budget. Transports (20 %) parce que
              c&apos;est la seule personne qui conduit — le réseau doit absorber l&apos;imprévu
              (rendez-vous médical, école qui ferme, activité qui déborde). Écoles et périscolaire
              (25 %) parce qu&apos;on ne peut pas jongler sans une garderie du soir qui tient. Sécurité (25 %)
              parce qu&apos;une sortie d&apos;école tardive ou un retour de nuit après une activité
              n&apos;est pas la même chose selon le quartier. Nature, culture, télétravail sont
              secondaires en configuration parent solo — ils sortent du composite.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Filtre 20 000 habitants.</strong>{" "}
              Sous ce seuil, les axes transport et écoles deviennent bruités et le composite spike
              artificiellement sur des communes rurales qui n&apos;ont ni un réseau ni un maillage
              scolaire comparables. Toutes les fiches individuelles restent accessibles via{" "}
              <code className="text-xs px-1 rounded bg-[var(--bg-elevated)]">/villes/&lt;slug&gt;/parent-solo</code>{" "}
              quelle que soit la population.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Revenu minimum T3.</strong>{" "}
              Loyer T3 réel (data/housing.ts) ÷ 33 % du revenu net, relâché à 35 % quand la ville
              a un score coût &lt; 5 (marchés très chers où les bailleurs acceptent souvent 40 %
              avec caution Visale ou garant familial). Arrondi à 50 € près.
            </p>
            <p>
              <strong className="text-[var(--text-primary)]">Ce que ce score est, et ce qu&apos;il n&apos;est pas.</strong>{" "}
              Le composite est une moyenne pondérée des quatre axes éditoriaux du seed
              (<code className="text-xs px-1 rounded bg-[var(--bg-elevated)]">data/cities-seed.ts</code>),
              calibrés à partir de cadres de référence publics (Insee pour la démographie, SSMSI
              pour la délinquance enregistrée, observatoires des loyers) et documentés dans{" "}
              <code className="text-xs px-1 rounded bg-[var(--bg-elevated)]">lib/score-calibration.ts</code>.
              Ce n&apos;est donc <strong className="text-[var(--text-primary)]">ni un taux de
              délinquance publié, ni un indice de loyer mesuré, ni un salaire local</strong> : aucune
              donnée de revenu n&apos;entre dans ce classement, et le seuil de la colonne « revenu
              minimum » est un besoin calculé depuis le loyer, pas un revenu observé. Les quatre
              notes sont <strong className="text-[var(--text-primary)]">estimées</strong> à l&apos;échelle
              de la commune : la note de sécurité est une moyenne communale et ne dit rien d&apos;une
              rue, d&apos;un quartier ni des personnes qui y vivent. Le calcul, lui, est déterministe
              et reproductible, et aucun chiffre n&apos;est inventé.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Pour un revenu réellement mesuré à la commune (niveau de vie médian et taux de
              pauvreté, Insee Filosofi), voir la sous-page{" "}
              <code className="text-xs">/villes/&lt;slug&gt;/statistiques</code> — cette mesure existe
              sur le site, elle n&apos;entre simplement pas dans ce composite.
            </p>
          </div>
        </div>
      </section>

      {/* Cross-links */}
      <section className="py-10 border-t border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
            Aller plus loin
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/city-match"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                💘 City Match
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                8 questions, 90 sec, top 3 villes qui collent
              </div>
            </Link>
            <Link
              href="/pour-qui/familles-monoparentales"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                👥 Fiche familles monoparentales
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Angle éditorial dans « Pour qui »
              </div>
            </Link>
            <Link
              href="/guides/categorie/famille"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                👨‍👩‍👧 Guides famille
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Écoles, santé, budget logement : déménager avec des enfants
              </div>
            </Link>
            <Link
              href="/classements/famille-proprietaire"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                👨‍👩‍👧 Familles, prix compris
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Écoles, sécurité et nature, moins une pénalité sur les villes les plus chères
              </div>
            </Link>
            <Link
              href="/vacances/profil/monoparental"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                🌴 Vacances parent solo
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Destinations tenables avec un seul adulte
              </div>
            </Link>
            <Link
              href="/parcs"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                🌳 Parcs &amp; espaces verts
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Aire de jeux, accès poussette, point d&apos;eau : changer de parc le week-end
              </div>
            </Link>
            <Link
              href="/palmares"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                🏆 Palmarès général
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Moyenne des 8 axes — profil non spécifié
              </div>
            </Link>
            <Link
              href="/carte"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                🗺️ Carte interactive
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Visualiser les {CITIES_COUNT} villes du site
              </div>
            </Link>
            <Link
              href="/comparer"
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 transition-all px-4 py-3"
            >
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                ⚖️ Comparer 2 villes
              </div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                Face-à-face 8 axes + verdict lifestyle
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
