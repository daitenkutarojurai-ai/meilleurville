import type { Metadata } from "next";
import Link from "next/link";
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

export const revalidate = false;

// Ranking with a population floor: the parent-solo score composite spikes on
// tiny communes where cost/safety are structurally favourable but scholar and
// transport signals go noisy. The 20 000 floor is the same threshold used by
// F52 quality-of-life rankings.
const MIN_POP = 20_000;
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

export const metadata: Metadata = {
  title: "Parent solo : les villes qui tiennent en 2026",
  description:
    "Top 30 villes françaises où la vie de parent solo tient : coût, transports, écoles, sécurité. Composite 4 axes pondérés, mêmes poids que City Match, budget T3 estimé.",
  alternates: { canonical: "/parent-solo" },
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Parent solo · Les villes françaises qui tiennent en 2026",
    description:
      "Un seul revenu, un seul conducteur. Classement 4 axes (coût, transports, écoles, sécurité) sur 540 villes.",
  },
};

export default function ParentSoloHubPage() {
  const rows = buildRows();
  const top = [...rows].sort((a, b) => b.fit - a.fit || a.name.localeCompare(b.name, "fr")).slice(0, TOP_N);
  const bottom = [...rows]
    .sort((a, b) => a.fit - b.fit || a.name.localeCompare(b.name, "fr"))
    .slice(0, BOTTOM_N);

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
    itemListElement: top.map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: r.name,
      url: `https://www.mavilleideale.fr/villes/${r.slug}/parent-solo`,
      description: `Score fit ${r.fit.toFixed(1)}/10 (${r.label.toLowerCase()}) · coût ${r.breakdown.cost.toFixed(1)}, transports ${r.breakdown.transport.toFixed(1)}, écoles ${r.breakdown.schools.toFixed(1)}, sécurité ${r.breakdown.safety.toFixed(1)}`,
    })),
  };

  const faq = faqJsonLd([
    {
      q: "Quelles villes françaises sont les plus adaptées à une vie de parent solo ?",
      a: `Selon notre composite parent solo (coût 30 % + transports 20 % + écoles 25 % + sécurité 25 %, mêmes poids que le profil City Match), les 5 villes ≥ ${MIN_POP.toLocaleString("fr-FR")} habitants au meilleur score sont : ${top
        .slice(0, 5)
        .map((c) => `${c.name} (${c.fit.toFixed(1)}/10)`)
        .join(", ")}. Ces villes cumulent un coût de la vie tenable sur un seul revenu, un réseau de transport qui absorbe l'imprévu quand personne d'autre ne peut prendre le relais, un maillage scolaire et périscolaire dense, et un niveau de sécurité qui rend la sortie d'école ou le retour de nuit sereins.`,
    },
    {
      q: "Comment le score parent solo est-il calculé ?",
      a: "Pondération éditoriale explicite : coût de la vie 0,30 · transports 0,20 · écoles 0,25 · sécurité 0,25 (total 1,00). Les 4 axes viennent du seed (data/cities-seed.ts), calibrés à partir de sources publiques (Insee, SSMSI, observatoires loyers). Le résultat reste sur une échelle 0-10 avec la même convention que les axes individuels (10 = excellent). Formule identique à celle du profil « single-parent » dans lib/city-match.ts.",
    },
    {
      q: "Pourquoi ce classement diffère-t-il du palmarès général ?",
      a: "Le palmarès général (/palmares) fait la moyenne des 8 composites du site — utile pour un profil non spécifié. Le score parent solo re-priorise 4 axes cruciaux quand on est seul·e à conduire, seul·e à gagner et seul·e à porter la charge : la nature, la culture, le télétravail passent au second plan. Une ville excellente en global peut sortir moyenne ici si son coût explose ou si son réseau transport ne rattrape pas les imprévus.",
    },
    {
      q: "Quel budget minimum pour un T3 en parent solo ?",
      a: `Sur la règle du tiers du revenu net (33 %, relâchée à 35 % sur les marchés très tendus où le score coût passe sous 5), les seuils varient fortement selon la ville. Sur les 5 villes du top : ${top
        .slice(0, 5)
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
              Top {TOP_N} — le profil parent solo tient sans arbitrage douloureux
            </h2>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
            Villes ≥ {MIN_POP.toLocaleString("fr-FR")} hab. au meilleur score composite parent solo.
            La colonne « revenu minimum » applique la règle du tiers du revenu net au loyer T3 réel.
            Sous ce seuil, il faut activer un levier logement.
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
                {top.map((r, i) => (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
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
                ))}
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
            Les {BOTTOM_N} villes qui pénalisent le profil parent solo
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-3xl">
            Villes ≥ {MIN_POP.toLocaleString("fr-FR")} hab. au composite le plus bas — cumulent
            généralement coût élevé + transport faible, ou sécurité en dessous de la moyenne
            malgré un coût correct. Ce n&apos;est pas une condamnation : c&apos;est un signal que la
            configuration parent solo y demande plus d&apos;organisation, plus d&apos;aides à activer
            (CAF, CCAS, logement social) et une vérification quartier par quartier avant de signer.
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
                {bottom.map((r, i) => (
                  <tr key={r.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
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
                ))}
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
            <p className="text-xs text-[var(--text-tertiary)]">
              Sources : Insee (population, salaires), SSMSI (sécurité), observatoires régionaux
              (loyers), et calibration éditoriale documentée dans{" "}
              <code className="text-xs">lib/score-calibration.ts</code>. Calcul déterministe et
              reproductible. Aucun chiffre inventé.
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
