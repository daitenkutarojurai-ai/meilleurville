import Link from "next/link";
import { CalendarClock, TrainFront, BedDouble, Info } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_LIGHT, type CityLight } from "@/lib/cities-light";
import {
  topCitiesForProfile,
  BUDGET_TIER_LABEL,
} from "@/lib/vacation-fit";
import { getTransit, transitTags } from "@/lib/transit";
import {
  cityPopulation,
  seniorShare,
  INSEE_POP_CREDIT,
  INSEE_POP_YEAR,
} from "@/lib/city-population";

// Sections propres au voyage en célibataire — la distinction avec « solo »
// (voyager seul·e, où sécurité et calme priment) tient ici :
//   1. La ville doit rester vivante hors saison, sinon un séjour d'octobre
//      dans une station à moitié vide est le pire des plans.
//   2. On arrive et on se déplace en train, parce que sortir le soir sans
//      voiture ni casque implique métro / tram jusqu'à minuit.
//   3. On limite les destinations où le prix se calcule à la chambre double :
//      les grosses villes urbaines pratiquent le studio et l'hôtel d'affaires
//      — le supplément single y pèse beaucoup moins que dans une pension de
//      bord de mer.
// Aucun chiffre inventé : chaque signal trace vers les scores seed
// (life/culture/cost/transport), lib/transit.ts ou lib/vacation-seasons.ts.

// Pool = 100 : le profil célibataire pondère culture+life+transport et
// délaisse le coût, donc le haut de tableau est dominé par les villes
// premium. On étend la fenêtre pour laisser passer les métropoles
// affordables sur la section « supplément single léger », qui filtre elle-
// même sur cost + population.
const CELIB_POOL_SIZE = 100;

function celibPool() {
  return topCitiesForProfile("celibataire", CITIES_LIGHT, {
    limit: CELIB_POOL_SIZE,
  });
}

// ─── Section 1 : vivant hors saison ──────────────────────────────────────
//
// Le vrai piège du séjour célibataire est la station qui vit deux mois par an.
//
// ⚠️ Cette section a longtemps classé sur l'écart d'affluence août − novembre
// de `monthSignal`. **Cet écart ne discrimine rien** : la modulation mensuelle
// de `crowdednessForMonth` est la même pour toutes les villes (+2 en août,
// −0,5 en novembre), seul le niveau de base dépend de la destination. L'écart
// vaut donc 2 partout, de Saint-Tropez à Paris, et le tri sur cette valeur
// était un no-op. Pire, la condition « novembre ≥ 2/5 » ne retenait que les
// villes dont la base est élevée — c'est-à-dire, entre autres, les communes
// balnéaires : la section admettait exactement ce qu'elle promettait d'écarter
// (Les Sables-d'Olonne y sortait 3ᵉ, avec 48,7 % de résidents de 60 ans et
// plus). Ne pas réintroduire `crowded` ici.
//
// Ce qui est mesuré à la place : la **part réelle des 15-29 ans** dans la
// population résidente, recensement Insee 2022 via `lib/city-population.ts`.
// C'est le meilleur signal disponible de vie permanente — étudiants et jeunes
// actifs sont la population qui fait tourner les bars et les salles un mardi
// soir de novembre, et elle habite la ville toute l'année par définition. La
// séparation est nette : Rennes 34,1 %, Angers 31,4 %, Bordeaux 29,8 % face à
// Royan 9,5 %, La Baule 10,2 %, Dinard 11,9 %. Médiane nationale 18,4 %.
//
// Filtres retenus, tous adossés à une mesure ou à un score rendu :
//   - `life` du seed (bars, restos, animation permanente) ≥ 7.0
//   - `culture` ≥ 6.5 (scène culturelle qui tourne toute l'année)
//   - part des 15-29 ans ≥ 20 % (au-dessus du 3ᵉ quartile national, 20,8 %)
//   - population Insee ≥ 40 000 : en-dessous, même une ville sympa perd sa
//     scène de sortie un mardi soir d'octobre.
// La part des 60 ans et plus est affichée en regard, sans jugement : une ville
// de retraités n'est pas une mauvaise ville, elle est mal appariée à ce
// séjour-là.

const YOUTH_SHARE_FLOOR = 20;
const RESIDENT_POP_FLOOR = 40_000;

/** Part des 15-29 ans dans la population résidente (%), Insee 2022. */
function youngAdultShare(slug: string): number | null {
  const rec = cityPopulation(slug);
  if (!rec) return null;
  return Number(((rec.ages.a1529 / rec.pop2022) * 100).toFixed(1));
}

interface OffSeasonPick {
  city: CityLight;
  score: number;
  lifeScore: number;
  youngShare: number;
  seniors: number | null;
  residents: number;
}

function offSeasonAlivePicks(): OffSeasonPick[] {
  return celibPool()
    .map(({ city, fit }) => {
      const rec = cityPopulation(city.slug);
      const young = youngAdultShare(city.slug);
      if (!rec || young === null) return null;
      return {
        city,
        score: fit.score,
        lifeScore: city.scores.life,
        culture: city.scores.culture,
        youngShare: young,
        seniors: seniorShare(city.slug),
        residents: rec.pop2022,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .filter(
      (p) =>
        p.residents >= RESIDENT_POP_FLOOR &&
        p.lifeScore >= 7.0 &&
        p.culture >= 6.5 &&
        p.youngShare >= YOUTH_SHARE_FLOOR,
    )
    .sort(
      (a, b) =>
        b.youngShare - a.youngShare ||
        b.lifeScore - a.lifeScore ||
        b.score - a.score,
    )
    .slice(0, 12);
}

// ─── Section 2 : accessibles en train sans voiture ───────────────────────

interface TrainDest {
  city: CityLight;
  score: number;
  transit: string[];
}

function trainAccessibleDestinations(): TrainDest[] {
  return celibPool()
    .map(({ city, fit }) => {
      const t = getTransit(city.slug);
      const arrivable = !!(t.tgv || t.rer);
      // Sortir seul·e en soirée sans voiture demande une desserte urbaine
      // qui roule tard (métro / tram / BHNS) ou un score transport élevé
      // — un bus dernier passage 20 h ne compte pas.
      const local = !!(t.metro || t.tram || t.bhns) || city.scores.transport >= 7.0;
      if (!arrivable || !local) return null;
      return {
        city,
        score: fit.score,
        transit: transitTags(t),
      };
    })
    .filter((d): d is TrainDest => d !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);
}

// ─── Section 3 : supplément single léger ────────────────────────────────
//
// Le supplément chambre individuelle plombe surtout les séjours packagés
// et les pensions de bord de mer où la tarification par chambre double est
// la norme. Il se dilue dans un tissu urbain où studios, hôtels d'affaires
// et auberges de jeunesse coexistent — indices proxy dans le seed :
//   - `cost` ≥ 5.0 (ville pas dans le top premium)
//   - `remoteWork` ≥ 6.5 (marché du studio et du meublé développé, hérité
//     de la demande télétravail / étudiante)
//   - Population ≥ 60 000 hab. — en-dessous, le parc d'hôtels devient trop
//     étroit pour éviter les chambres doubles à défaut.
//   - On écarte explicitement les villes taggées « premium ».

interface SoloBudgetPick {
  city: CityLight;
  score: number;
  cost: number;
  remoteWork: number;
  budgetTier: 1 | 2 | 3 | 4;
}

function soloBudgetDestinations(): SoloBudgetPick[] {
  return celibPool()
    .map(({ city, fit }) => ({
      city,
      score: fit.score,
      cost: city.scores.cost,
      remoteWork: city.scores.remoteWork,
      budgetTier: fit.budgetTier,
      tags: city.characterTags ?? [],
    }))
    .filter(
      (d) =>
        d.cost >= 5.0 &&
        d.remoteWork >= 6.5 &&
        (d.city.population ?? 0) >= 60_000 &&
        !d.tags.includes("premium"),
    )
    .sort((a, b) => b.cost - a.cost || b.score - a.score)
    .slice(0, 10);
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

export function CelibataireExtras() {
  const offSeason = offSeasonAlivePicks();
  const trainDest = trainAccessibleDestinations();
  const soloBudget = soloBudgetDestinations();

  return (
    <>
      {/* Note méthodo courte — pose la distinction avec le profil solo */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-6">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)]/40 p-4 text-xs text-[var(--text-secondary)] flex gap-3">
          <Info className="h-4 w-4 shrink-0 text-[var(--accent)] mt-0.5" aria-hidden />
          <p className="leading-relaxed">
            Ce classement suppose qu'on cherche <strong>du monde</strong> et
            non pas la tranquillité — c'est ce qui distingue{" "}
            <Link href="/vacances/profil/celibataire" className="text-[var(--accent)] hover:underline">
              célibataire
            </Link>{" "}
            de{" "}
            <Link href="/vacances/profil/solo" className="text-[var(--accent)] hover:underline">
              solo
            </Link>
            . Les trois filtres ci-dessous répondent aux trois pièges typiques
            du voyage seul·e sans être en couple : la station vide hors saison,
            l'obligation de louer une voiture pour ressortir le soir, et la
            chambre facturée pour deux quand on est un·e.
          </p>
        </div>
      </section>

      {/* Section 1 — Vivant hors saison */}
      <Section
        emoji={<CalendarClock className="h-6 w-6" />}
        title="Villes vivantes hors saison — l'anti-station-fantôme"
        intro="Score de vie ≥ 7 et au moins un résident sur cinq âgé de 15 à 29 ans : la ville n'a pas besoin des vacanciers pour faire tourner ses bars, ses restos et sa scène culturelle, parce que la population qui les fait tourner y habite à l'année. Un séjour de novembre y ressemble à un séjour de juin, pas à un dimanche soir dans une station fermée."
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-tertiary)] text-xs uppercase tracking-wide">
                <th className="py-2 pr-3">Ville</th>
                <th className="py-2 pr-3 text-right">Vie</th>
                <th className="py-2 pr-3 text-right">15-29 ans</th>
                <th className="py-2 pr-3 text-right">60 ans +</th>
                <th className="py-2 text-right">Fit</th>
              </tr>
            </thead>
            <tbody>
              {offSeason.map(({ city, lifeScore, youngShare, seniors, score }) => (
                <tr
                  key={city.slug}
                  className="border-b border-[var(--border)]/50 last:border-0"
                >
                  <td className="py-2 pr-3">
                    <Link
                      href={`/villes/${city.slug}`}
                      className="text-[var(--text-primary)] hover:text-[var(--accent)] font-medium"
                    >
                      {city.name}
                    </Link>
                    <span className="ml-2 text-[11px] text-[var(--text-tertiary)]">
                      {city.department}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-right font-mono-data text-[var(--text-secondary)]">
                    {lifeScore.toFixed(1)}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono-data text-[var(--text-secondary)]">
                    {youngShare.toFixed(1)} %
                  </td>
                  <td className="py-2 pr-3 text-right font-mono-data text-[var(--text-tertiary)]">
                    {seniors === null ? "n/a" : `${seniors.toFixed(1)} %`}
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
          Part des 15-29 ans et des 60 ans et plus dans la population
          résidente ({INSEE_POP_CREDIT}, millésime {INSEE_POP_YEAR}). Seuils :
          part des 15-29 ans ≥ {YOUTH_SHARE_FLOOR} % (médiane nationale 18,4 %,
          3ᵉ quartile 20,8 %) · population ≥{" "}
          {RESIDENT_POP_FLOOR.toLocaleString("fr-FR")} habitants · score de vie
          ≥ 7 · score culture ≥ 6,5. Les communes balnéaires et thermales
          sortent sur la première colonne, pas sur un a priori : Royan compte
          9,5 % de 15-29 ans et 56 % de 60 ans et plus, Dinard 11,9 % et
          51,2 %. Ce n'est pas un défaut de ces villes, c'est une inadéquation
          avec un séjour dont l'unité est la sortie du soir.
        </p>
      </Section>

      {/* Section 2 — Train + local sans voiture */}
      <Section
        emoji={<TrainFront className="h-6 w-6" />}
        title="Accessibles en train, sortie du soir sans voiture"
        intro="On arrive en TGV ou en RER, on rentre du bar à minuit à pied ou en tram. Sans voiture, un dernier verre en périphérie devient une expédition — la desserte urbaine tardive fait toute la différence sur un séjour en célibataire."
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

      {/* Section 3 — Supplément single léger */}
      <Section
        emoji={<BedDouble className="h-6 w-6" />}
        title="Où le supplément single ne plombe pas le budget"
        intro="Le supplément chambre individuelle vient des séjours packagés et des pensions de bord de mer, tarifés à la chambre double. Il se dilue dans un tissu urbain qui mélange studios, hôtels d'affaires et auberges — plus la ville est grande et remote-friendly, plus le parc de petites chambres est fourni."
      >
        <div className="space-y-2">
          {soloBudget.map(({ city, cost, remoteWork, budgetTier, score }, i) => (
            <div
              key={city.slug}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="font-mono-data text-xs text-[var(--text-tertiary)] w-6 shrink-0">
                  #{i + 1}
                </span>
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
                  coût {cost.toFixed(1)} · télétravail {remoteWork.toFixed(1)}
                </span>
                <Badge>{BUDGET_TIER_LABEL[budgetTier]}</Badge>
                <span className="font-mono-data font-bold text-[var(--accent)] text-sm">
                  {score.toFixed(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          Proxy : score coût (loyer, courses, sortie) ≥ 5,0 · score
          télétravail ≥ 6,5 (indice indirect du parc de studios et de
          coliving) · population ≥ 60 000 hab. Villes taggées{" "}
          <em>premium</em> exclues. Les valeurs ne sont pas des prix de nuit,
          c'est un filtre.
        </p>
      </Section>

      {/* Bloc éditorial — comment décoder les prix hôtel en solo, sans montants inventés */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Card className="!p-5">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Trois réflexes pour éviter la double facturation
          </h2>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li>
              <strong className="text-[var(--text-primary)]">
                Chercher par « chambre single », pas par « chambre double 1 pers. »
              </strong>{" "}
              — la deuxième catégorie applique souvent le prix double moins
              une petite ristourne, la première est tarifée à part et calquée
              sur la surface réelle.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Privilégier les hôtels d'affaires en semaine
              </strong>{" "}
              — leur clientèle du lundi au jeudi est majoritairement solo, la
              tarification est déjà indexée dessus. Le week-end venu, l'écart
              avec un hôtel touristique s'inverse souvent.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">
                Comparer studio et hôtel dès qu'on reste plus de 2 nuits
              </strong>{" "}
              — un studio en location courte durée facture la surface, pas
              l'occupation ; en solo, on paie donc au même tarif qu'un couple.
              L'inverse d'un hôtel classique.
            </li>
          </ul>
          <p className="mt-4 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
            Aucune fourchette de prix n'est affichée ici : les tarifs
            hôteliers bougent d'une saison à l'autre et d'une plateforme à
            l'autre. Le classement ci-dessus filtre les villes où ces trois
            réflexes fonctionnent — pas où ils sont déjà appliqués pour
            vous.
          </p>
        </Card>
      </section>
    </>
  );
}
