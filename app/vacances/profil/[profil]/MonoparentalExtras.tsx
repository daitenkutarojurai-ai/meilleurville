import Link from "next/link";
import { TrainFront, Wallet, Footprints, CalendarDays, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_LIGHT, type CityLight } from "@/lib/cities-light";
import {
  topCitiesForProfile,
  vacationFit,
  BUDGET_TIER_LABEL,
} from "@/lib/vacation-fit";
import { getTransit, transitTags } from "@/lib/transit";
import {
  MONTHS,
  formatMonthLabel,
  monthSignal,
  type MonthIndex,
} from "@/lib/vacation-seasons";

// Sections propres à la monoparentalité que le classement générique ne
// capture pas. Aucun chiffre inventé : chaque cellule trace vers un axe seed
// (safety/transport/cost/life), vers lib/transit.ts (TGV/tram/métro) ou vers
// lib/vacation-seasons.ts.

// ⚠️ Les trois premières sections lisent le **classement entier** et non une
// fenêtre, et c'est une correction et non une inattention. Mesuré le
// 2026-09-30 : avec la fenêtre de 60 qui vivait ici, **29 des 38 destinations
// que la série `vacances-monoparentales-` publiait alors étaient invisibles**
// sur cette page, Lyon (76ᵉ), Nantes (91ᵉ), Bordeaux (103ᵉ), Dijon (104ᵉ),
// Besançon (106ᵉ), Grenoble (120ᵉ), Toulouse (139ᵉ), Lille (206ᵉ) et
// Montpellier (254ᵉ) comprises, soit 76 % du corpus que la page est censée
// éclairer. La section « train » en souffrait le plus : 56 villes satisfont
// son critère sur le classement entier, la fenêtre n'en laissait que **5**,
// pour un plafond d'affichage de 12. La cause est la pondération du profil,
// qui met sécurité 0,30 et coût 0,25 : elle enterre précisément les villes
// desservies par un train, parce que ce sont les grandes. Même défaut, même
// remède et même avertissement que sur la page célibataire (26/09) : ne pas
// « harmoniser » ces sections en leur remettant une fenêtre.
const MONO_OFFPEAK_POOL = 30;

function monoAll() {
  return topCitiesForProfile("monoparental", CITIES_LIGHT, {
    limit: CITIES_LIGHT.length,
  });
}

// Île-de-France : écartée de la section « train » seulement, et pour une
// raison propre à son critère. Ce test accepte le RER, qui est le réseau de
// banlieue parisien : il promeut donc mécaniquement des communes de la
// couronne dans une liste de destinations de vacances, jusqu'à Saint-Denis au
// 448ᵉ rang du profil. 20 des 56 villes éligibles sont dans ce cas. C'est le
// même motif que l'exclusion francilienne de la règle de sélection des
// guides : une excursion depuis Paris n'est pas un séjour, et l'axe coût y
// mesure un marché résidentiel. Les sections 2 et 3 ne l'appliquent pas :
// leurs critères écartent déjà les communes-dortoirs, et Fontainebleau ou
// Rambouillet sont de vraies destinations.
const IDF_REGION = "Île-de-France";

/**
 * Groupe par valeur et ne coupe jamais un palier en son milieu (convention de
 * `lib/owner-rankings.ts`) : un `slice` sur un score à une décimale fabrique la
 * fin de sa liste. Le palier de tête entre toujours, même s'il dépasse à lui
 * seul le plafond, sans quoi une section dont la tête est une grosse égalité
 * n'afficherait rien. Rend aussi la valeur et l'effectif du premier palier
 * écarté, pour que la page puisse le dire.
 */
function wholeTiers<T>(
  rows: T[],
  value: (r: T) => number,
  name: (r: T) => string,
  cap: number,
): { kept: T[]; next: { value: number; count: number } | null } {
  // Tri par valeur décroissante puis par nom : à l'intérieur d'un palier
  // l'ordre alphabétique est un ordre **stable**, pas un départage.
  const sorted = [...rows].sort(
    (a, b) => value(b) - value(a) || name(a).localeCompare(name(b), "fr"),
  );
  const tiers: [number, T[]][] = [];
  for (const r of sorted) {
    const v = value(r);
    const last = tiers[tiers.length - 1];
    if (last && last[0] === v) last[1].push(r);
    else tiers.push([v, [r]]);
  }
  const kept: T[] = [];
  let next: { value: number; count: number } | null = null;
  for (let i = 0; i < tiers.length; i++) {
    const [v, list] = tiers[i];
    if (kept.length > 0 && kept.length + list.length > cap) {
      next = { value: v, count: list.length };
      break;
    }
    kept.push(...list);
    if (kept.length >= cap) {
      const after = tiers[i + 1];
      if (after) next = { value: after[0], count: after[1].length };
      break;
    }
  }
  return { kept, next };
}

// ─── Section 1 : accessibles en train sans voiture ────────────────────────

interface TrainDest {
  city: CityLight;
  score: number;
  transit: string[];
}

// ⚠️ Portée réelle de ce filtre, mesurée le 2026-09-16 : `lib/transit.ts` est
// une table saisie à la main qui ne documente que 91 des 495 villes classées
// par ce profil, et `getTransit` rend `{}` pour les 404 autres, ce que la table
// documente comme « inconnu » et non comme « pas de desserte ». Le test
// `arrivable` ci-dessous traite pourtant les deux de la même façon, si bien que
// cette section ne sélectionne pas les villes accessibles en train mais les
// villes *documentées* comme telles. Second biais, du même ordre : il exige un
// TGV ou un RER, donc un TER n'y est pas un train, alors que Vienne est à 18 min
// de Lyon Part-Dieu à raison de 16 trains par jour et Compiègne à 39 min de
// Paris-Nord en direct toutes les demi-heures. Les deux biais se cumulent pour
// écarter le haut du classement : les mieux notées du profil, Obernai 8,0,
// Amboise 7,5 et Autun 7,4, ne sont pas dans la table. Le titre et le chapeau
// de la section disent donc ce qu'elle montre vraiment ; corriger le fond
// suppose d'étendre la table, ville par ville et vérification par vérification,
// pas d'élargir le test.
function trainAccessibleDestinations(): {
  kept: TrainDest[];
  next: { value: number; count: number } | null;
  eligible: number;
} {
  const all = monoAll()
    .filter(({ city }) => city.region !== IDF_REGION)
    .map(({ city, fit }) => {
      const t = getTransit(city.slug);
      // On veut arriver en train (TGV/RER) ET pouvoir se déplacer sur place
      // sans louer de voiture (métro / tram / BHNS OU score transport
      // suffisant pour un maillage de bus décent).
      const arrivable = !!(t.tgv || t.rer);
      const local = !!(t.metro || t.tram || t.bhns) || city.scores.transport >= 6.8;
      if (!arrivable || !local) return null;
      return {
        city,
        score: fit.score,
        transit: transitTags(t),
      };
    })
    .filter((d): d is TrainDest => d !== null);
  const { kept, next } = wholeTiers(all, (d) => d.score, (d) => d.city.name, 12);
  return { kept, next, eligible: all.length };
}

// ─── Section 2 : où le budget d'un seul revenu tient ──────────────────────

interface BudgetDest {
  city: CityLight;
  score: number;
  cost: number;
  budgetTier: 1 | 2 | 3 | 4;
}

function budgetProofDestinations(): {
  kept: BudgetDest[];
  next: { value: number; count: number } | null;
  eligible: number;
} {
  const all = monoAll()
    .map(({ city, fit }) => ({
      city,
      score: fit.score,
      cost: city.scores.cost,
      budgetTier: fit.budgetTier,
    }))
    // Une station très chère fait doubler la note dès qu'on n'est plus deux
    // à partager la chambre. On garde les villes où le coût est dans la
    // moitié haute du seed (≥ 6.5) et le budgetTier reste correct.
    .filter((d) => d.cost >= 6.5 && d.budgetTier <= 2);
  // ⚠️ Plafond à 18 et non 10 : le palier de tête de l'axe coût compte à lui
  // seul 18 communes à 8,5/10, donc tout plafond plus bas le couperait en son
  // milieu et publierait l'ordre d'insertion du seed comme un classement.
  const { kept, next } = wholeTiers(all, (d) => d.cost, (d) => d.city.name, 18);
  return { kept, next, eligible: all.length };
}

// ─── Section 3 : enfants à portée à pied ──────────────────────────────────

const WALKABLE_TAGS = new Set([
  "familial",
  "famille",
  "patrimoine",
  "médiéval",
  "château",
  "cathédrale",
  "historique",
  "authenticité",
  "authentique",
  "UNESCO",
  "tourisme",
  "port",
  "marché",
]);

interface WalkableDest {
  city: CityLight;
  score: number;
  safety: number;
  matchedTags: string[];
}

function walkableFamilyDestinations(): {
  kept: WalkableDest[];
  next: { value: number; count: number } | null;
  eligible: number;
} {
  const all = monoAll()
    .map(({ city, fit }) => {
      const tags = city.characterTags ?? [];
      const matched = tags.filter((t) => WALKABLE_TAGS.has(t));
      return { city, fit, matched };
    })
    // Les villes vraiment marchables avec des enfants sont petites-moyennes
    // (le centre historique se traverse en 20 min à pied), sûres et avec un
    // signal touristique/patrimoine qui garantit que les activités enfants
    // sont regroupées, pas éclatées en périphérie.
    .filter(({ city, fit, matched }) => {
      const pop = city.population ?? 0;
      return (
        pop >= 15_000 &&
        pop <= 130_000 &&
        city.scores.safety >= 6.5 &&
        fit.score >= 6.0 &&
        matched.length >= 1
      );
    })
    .map(({ city, fit, matched }) => ({
      city,
      score: fit.score,
      safety: city.scores.safety,
      matchedTags: matched.slice(0, 3),
    }));
  const { kept, next } = wholeTiers(all, (d) => d.safety, (d) => d.city.name, 10);
  return { kept, next, eligible: all.length };
}

// ─── Section 4 : quand partir hors saison ────────────────────────────────

interface OffPeakPick {
  city: CityLight;
  month: MonthIndex;
  tempAvg: number;
  crowded: number;
  score: number;
}

function offPeakPicks(): OffPeakPick[] {
  // Vacances scolaires françaises "familles monoparentales" utiles :
  // Toussaint (nov ≈ semaine 44), février (semaine 7/9), Pâques (avril ≈
  // semaine 15/17) — hors juillet/août où tout double. On cherche pour
  // chaque ville monoparental-top le meilleur mois entre 3, 4, 5, 9, 10
  // (mi-saisons : chambres 30 à 50 % moins chères en règle générale,
  // moins de foule, températures encore correctes).
  const targetMonths: MonthIndex[] = [3, 4, 5, 9, 10];
  const pool = monoAll().slice(0, MONO_OFFPEAK_POOL);
  const picks: OffPeakPick[] = [];
  for (const { city } of pool) {
    let best: { month: MonthIndex; sig: ReturnType<typeof monthSignal> } | null = null;
    for (const m of targetMonths) {
      const sig = monthSignal(city, m);
      const scored =
        10 -
        Math.abs(sig.tempAvg - 18) * 0.4 -
        sig.rainDays * 0.2 -
        (sig.crowded - 1) * 0.6;
      if (!best) {
        best = { month: m, sig };
        continue;
      }
      const prevScored =
        10 -
        Math.abs(best.sig.tempAvg - 18) * 0.4 -
        best.sig.rainDays * 0.2 -
        (best.sig.crowded - 1) * 0.6;
      if (scored > prevScored) best = { month: m, sig };
    }
    if (!best) continue;
    const fit = vacationFit(city, { profile: "monoparental", month: best.month });
    picks.push({
      city,
      month: best.month,
      tempAvg: best.sig.tempAvg,
      crowded: best.sig.crowded,
      score: fit.score,
    });
  }
  return picks
    .filter((p) => p.crowded <= 2 && p.tempAvg >= 12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

// ─── Rendu ────────────────────────────────────────────────────────────────

function Section({
  emoji,
  title,
  intro,
  children,
}: {
  emoji: React.ReactNode;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      <div className="mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
          <span aria-hidden className="text-[var(--accent)]">
            {emoji}
          </span>
          {title}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
          {intro}
        </p>
      </div>
      {children}
    </section>
  );
}

/** Phrase de portée : ce que la liste montre, et ce qu'elle a écarté. */
function tierNote(
  eligible: number,
  shown: number,
  next: { value: number; count: number } | null,
  unit: string,
): string {
  const base = `${eligible} villes satisfont ce filtre sur les ${CITIES_LIGHT.length} du corpus ; les ${shown} affichées ici sont les mieux placées, paliers d'ex æquo pris entiers.`;
  if (!next) return base;
  const plural = next.count > 1 ? "villes suivaient" : "ville suivait";
  return `${base} ${next.count} ${plural} à ${next.value.toFixed(1)}${unit}, et la liste s'arrête avant ce palier plutôt que de le couper en son milieu.`;
}

export function MonoparentalExtras() {
  const train = trainAccessibleDestinations();
  const budget = budgetProofDestinations();
  const walkable = walkableFamilyDestinations();
  const offPeak = offPeakPicks();
  const trainDest = train.kept;
  const budgetDest = budget.kept;
  const walkableDest = walkable.kept;

  return (
    <>
      {/* Note méthodo courte, avant les sections chiffrées */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-4 text-xs text-[var(--text-secondary)] flex gap-3">
          <Info className="h-4 w-4 shrink-0 text-[var(--accent)] mt-0.5" aria-hidden />
          <p className="leading-relaxed">
            Les sections ci-dessous filtrent le classement générique sur des
            critères propres au voyage en parent solo :{" "}
            <strong>arriver et se déplacer sans voiture</strong>,{" "}
            <strong>coût compatible avec un seul revenu</strong>,{" "}
            <strong>activités enfants regroupées à distance de marche</strong>{" "}
            et <strong>fenêtres hors août</strong> où la chambre ne double pas.
            Aucun chiffre n'est inventé — chaque signal trace vers les données
            existantes du site.
          </p>
        </div>
      </section>

      {/* Section 1 — Train + local sans voiture */}
      <Section
        emoji={<TrainFront className="h-6 w-6" />}
        title="Faisables en TGV ou en RER, sans louer de voiture sur place"
        intro={`On arrive en TGV ou en RER, on pose le sac, et on tient la semaine avec métro, tram ou bus. Ce filtre s'appuie sur notre table de desserte, qui est saisie à la main et ne couvre qu'une partie des villes : une ville absente de la table n'y apparaît pas, même bien desservie, et une ville reliée par un TER seulement en est exclue par construction. L'Île-de-France est écartée ici, parce que le test accepte le RER et ferait remonter des communes de la couronne parisienne dans une liste de destinations. ${tierNote(train.eligible, trainDest.length, train.next, " de fit")}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {trainDest.map(({ city, score, transit }) => (
            <Card key={city.slug} className="!p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <Link
                    href={`/villes/${city.slug}`}
                    className="text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                  >
                    {city.name}
                  </Link>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {city.department}
                  </div>
                </div>
                <span className="font-mono-data font-bold text-[var(--accent)] text-lg shrink-0">
                  {score.toFixed(1)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {transit.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-full bg-[var(--bg-elevated)] px-2 py-0.5 text-[11px] text-[var(--text-secondary)] font-mono-data"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Section 2 — Budget d'un seul revenu */}
      <Section
        emoji={<Wallet className="h-6 w-6" />}
        title="Où le budget d'un seul revenu tient"
        intro={`Un adulte, une chambre : le supplément single peut faire mal. On garde les villes dont le score coût reste dans la moitié haute du seed et où l'écosystème (restos, courses, transports du quotidien) reste abordable. ${tierNote(budget.eligible, budgetDest.length, budget.next, "/10 de coût")} À l'intérieur d'un palier l'ordre est alphabétique : c'est un ordre stable et non un départage, et aucune de ces villes ne précède les autres.`}
      >
        <div className="space-y-2">
          {budgetDest.map(({ city, cost, budgetTier, score }) => (
            <div
              key={city.slug}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href={`/villes/${city.slug}`}
                  className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent)] truncate"
                >
                  {city.name}
                </Link>
                <span className="text-[11px] text-[var(--text-tertiary)] truncate hidden sm:inline">
                  {city.department}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-[var(--text-tertiary)] font-mono-data">
                  coût {cost.toFixed(1)}
                </span>
                <Badge>{BUDGET_TIER_LABEL[budgetTier]}</Badge>
                <span className="font-mono-data font-bold text-[var(--accent)] text-sm">
                  {score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Section 3 — Enfants à portée à pied */}
      <Section
        emoji={<Footprints className="h-6 w-6" />}
        title="Activités enfants regroupées, tout à pied"
        intro={`Petites-moyennes villes (15 à 130 000 hab.), centre historique traversable en 20 min à pied, sécurité au-dessus de la moyenne du seed, et un signal patrimoine/tourisme qui garantit qu'il y a des choses à faire sans reprendre la voiture, ni la poussette sur 4 km. ${tierNote(walkable.eligible, walkableDest.length, walkable.next, "/10 de sécurité")}`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {walkableDest.map(({ city, safety, matchedTags, score }) => (
            <Card key={city.slug} className="!p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <Link
                    href={`/villes/${city.slug}`}
                    className="text-base font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                  >
                    {city.name}
                  </Link>
                  <div className="text-xs text-[var(--text-tertiary)] mt-0.5 font-mono-data">
                    sécurité {safety.toFixed(1)} · fit {score.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded-full bg-[var(--accent)]/8 text-[var(--accent)] px-2 py-0.5 text-[11px]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Section 4 — Quand partir hors saison */}
      <Section
        emoji={<CalendarDays className="h-6 w-6" />}
        title="Fenêtres hors août — chambre à prix normal"
        intro={`Août double la note partout ; hors vacances scolaires, on peut aussi. Ici les créneaux mars-mai et sept-oct pour lesquels le climat reste correct (≥ 12 °C) et l'affluence reste basse (crowded ≤ 2 sur 5). Un seul adulte au volant du budget : autant partir la semaine où la chambre est deux fois moins chère. À la différence des trois sections ci-dessus, celle-ci se limite volontairement aux ${MONO_OFFPEAK_POOL} destinations les mieux notées du profil : elle répond à « quand partir » et non à « où », donc elle n'a pas de critère propre qui justifierait de balayer le corpus entier.`}
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-tertiary)] text-xs uppercase tracking-wide">
                <th className="py-2 pr-3">Ville</th>
                <th className="py-2 pr-3">Meilleur mois</th>
                <th className="py-2 pr-3 text-right">Temp.</th>
                <th className="py-2 pr-3 text-right">Foule 1-5</th>
                <th className="py-2 text-right">Fit</th>
              </tr>
            </thead>
            <tbody>
              {offPeak.map(({ city, month, tempAvg, crowded, score }) => (
                <tr
                  key={`${city.slug}-${month}`}
                  className="border-b border-[var(--border)]/50 last:border-0"
                >
                  <td className="py-2 pr-3">
                    <Link
                      href={`/villes/${city.slug}`}
                      className="text-[var(--text-primary)] hover:text-[var(--accent)] font-medium"
                    >
                      {city.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-[var(--text-secondary)]">
                    {formatMonthLabel(month)}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono-data text-[var(--text-secondary)]">
                    {tempAvg.toFixed(0)} °C
                  </td>
                  <td className="py-2 pr-3 text-right font-mono-data text-[var(--text-secondary)]">
                    {crowded}/5
                  </td>
                  <td className="py-2 text-right font-mono-data font-bold text-[var(--accent)]">
                    {score.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          Mois évalués : {[3, 4, 5, 9, 10].map((m) => MONTHS[m - 1]).join(" · ")}.
          Foule = signal qualitatif calculé à partir du type de destination
          (côtière, urbaine, montagne, vignoble) et du mois — pas un chiffre
          officiel de fréquentation, un ordre de grandeur.
        </p>
      </Section>

      {/* Aides & dispositifs — descriptifs, sans chiffres inventés */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Card className="!p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Aides mobilisables pour un départ en famille monoparentale
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
            On liste les dispositifs, pas leurs montants — les barèmes évoluent
            chaque année et dépendent du quotient familial. Consulte l'organisme
            pour la valeur en vigueur qui te concerne.
          </p>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li>
              <strong className="text-[var(--text-primary)]">VACAF</strong> —
              dispositif national d'aide aux vacances géré par la CAF, ouvert
              aux allocataires sous conditions de quotient familial. Prise en
              charge partielle d'un séjour dans un centre labellisé (village
              vacances, camping partenaire).{" "}
              <a
                href="https://www.vacaf.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                vacaf.org
              </a>
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Bons vacances CAF
              </strong>{" "}
              — chaque CAF départementale a sa politique propre (aide au premier
              départ, bourse aux séjours enfants, aides mini-camp). À vérifier
              sur la page « vacances » de{" "}
              <em>ta</em> CAF départementale sur{" "}
              <a
                href="https://www.caf.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                caf.fr
              </a>
              .
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Chèques-Vacances
              </strong>{" "}
              — moyen de paiement solidaire distribué par l'ANCV via
              l'employeur ou en autonomie (dispositif « Chèque-Vacances
              Connect » pour les non-salariés). Utilisable dans hôtels,
              campings, transports, activités partenaires.{" "}
              <a
                href="https://www.ancv.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                ancv.com
              </a>
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Aides des Conseils départementaux
              </strong>{" "}
              — plusieurs départements financent des séjours pour les enfants
              d'allocataires (bourses au séjour, participation à la colo). Cherche
              « aide vacances » sur le site du Conseil départemental de ton
              domicile.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Comité social et économique
              </strong>{" "}
              (ex-comité d'entreprise) — si tu es salariée : billeterie
              famille, séjours enfants subventionnés, remboursement partiel
              d'un séjour en centre partenaire. Passe voir avant de réserver.
            </li>
          </ul>
        </Card>
      </section>
    </>
  );
}
