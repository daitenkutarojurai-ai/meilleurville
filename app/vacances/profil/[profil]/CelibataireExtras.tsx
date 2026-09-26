import Link from "next/link";
import { CalendarClock, TrainFront, BedDouble, Info, Wine } from "lucide-react";
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
import { NEIGHBORHOODS } from "@/data/neighborhoods";

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

// ⚠️ Note pour les batches de guides, posée le 2026-09-19 : les deux seuils
// ci-dessous sont ceux que *cette page* publie et justifie. La sélection des
// villes du batch 6 de la série `vacances-celibataire-` s'appuyait sur la même
// mesure mais avec un plancher de population de 60 000, une valeur qui n'est
// écrite nulle part et que rien ne justifie, et elle en a conclu que la série
// avait consommé ses villes étudiantes. Recalculé à 40 000, le plancher ci-
// dessous, le vivier rendait encore onze communes au-dessus de YOUTH_SHARE_FLOOR,
// dont sept entre 24,53 % et 21,38 %, c'est-à-dire toutes au-dessus de la
// meilleure du batch 6. Un batch qui reprend cette règle la recalcule avec ces
// deux constantes, il ne recopie pas les seuils d'un journal.
const YOUTH_SHARE_FLOOR = 20;
const RESIDENT_POP_FLOOR = 40_000;

// ⚠️ Mesure du 2026-09-26, à lire avant de reprendre cette règle pour choisir
// des villes : **elle est épuisée, et elle l'est arithmétiquement.** Le terme
// contraignant n'est pas la part des 15-29 ans, c'est `life >= 7.0`, que 62
// communes seulement franchissent sur les 495 que ce profil classe ; croisé
// avec `culture >= 6.5` il en reste 51, et avec YOUTH_SHARE_FLOOR il en reste
// **treize**. Neuf ont leur guide (Rennes, Angers, Bordeaux, Nantes,
// Strasbourg, Aix-en-Provence, La Rochelle, Albi, Bayonne) ; des quatre
// autres, deux sont des communes résidentielles de la petite couronne que la
// série écarte depuis son premier lot (Levallois-Perret, Versailles) et deux
// sont sous le plancher de population (Le Puy-en-Velay 18 989 habitants,
// Valbonne 12 389). Supprimer le plancher de population n'y change donc rien,
// et le remplacer par un effectif absolu de 15-29 ans non plus : la plus
// basse des cinquante destinations déjà publiées en compte 9 749 (Compiègne),
// quand Le Puy-en-Velay en compte 4 019 et Valbonne 2 851.
// ⚠️ Corollaire sur le batch 7 du 2026-09-19, qui annonçait onze candidates
// au-dessus de YOUTH_SHARE_FLOOR : ce décompte a été obtenu **sans les deux
// seuils de score ci-dessus**, alors que le titre de la section les publie.
// Six de ses sept villes ne franchissent pas `life >= 7.0` (Angoulême 5,5,
// Arras 5,9, Beauvais 5,9, Lorient 6,2, Compiègne 6,8, Vannes 7,8 étant la
// seule à passer, Albi 7,4 la seconde). Le batch 7 avait corrigé le plancher
// de population que le batch 6 avait durci en silence et laissé tomber, en
// silence aussi, les deux termes qui mesurent ce que la section annonce. La
// règle a **quatre** termes : les recopier tous les quatre ou n'en reprendre
// aucun.

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
//
// ⚠️ Portée réelle de ce filtre, mesurée le 2026-09-19 : `lib/transit.ts` est
// une table saisie à la main qui ne documente que 93 des 495 villes classées
// par ce profil, et 33 seulement du vivier de 100 lu ici ; `getTransit` rend
// `{}` pour les autres, ce que la table documente comme « inconnu » et non
// comme « pas de desserte ». Le test `arrivable` ci-dessous traite pourtant les
// deux de la même façon, si bien que cette section ne sélectionne pas les
// villes accessibles en train mais les villes *documentées* comme telles.
// Second biais, du même ordre : il exige un TGV ou un RER, donc un TER n'y est
// pas un train, alors qu'Albi est à ~53 min de Toulouse-Matabiau, Compiègne à
// 39 min de Paris-Nord en direct et Beauvais à 1 h 05. Les deux biais se
// cumulent pour écarter le haut du classement : sur les douze villes les mieux
// notées du profil, neuf sont absentes de la table, dont Obernai 8,3,
// Amboise 8,0 et Beaune 7,9. Le titre et le chapeau de la section disent donc
// ce qu'elle montre vraiment ; corriger le fond suppose d'étendre la table,
// ville par ville et vérification par vérification, pas d'élargir le test.
// C'est le même défaut que la série monoparentale a documenté le 2026-09-16
// sur sa propre page, et il n'avait jamais été reporté ici.

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

// ─── Section 4 : la scène du soir documentée ─────────────────────────────
//
// Les trois sections ci-dessus mesurent la ville : sa démographie, sa
// desserte, son coût. Aucune ne mesure **ce qu'on vient y faire**. Cette
// quatrième-là part de l'autre bout, du quartier plutôt que de la commune, et
// de la seule note que nous publions sur la vie du soir : le score de vie
// nocturne des quartiers documentés dans `data/neighborhoods.ts`.
//
// ⚠️ **Ce n'est pas un recensement de bars, et il ne faut pas l'écrire comme
// tel.** `data/neighborhoods.ts` est un jeu **éditorial calibré**, deux à
// trois quartiers par commune, et ce sont les quartiers les mieux connus —
// c'est la raison pour laquelle la série de guides « quartiers à éviter » a
// été écartée en 2026-07-28. Ce que la colonne mesure est donc une
// **estimation de notre part sur les quartiers que nous documentons**, pas un
// décompte de terrain, et une commune peut avoir une scène que nos trois
// fiches ne voient pas. En positif, l'usage tient : dire d'un quartier
// documenté qu'il sort le soir engage notre note, pas la réputation de
// personne.
//
// Barème, calibré sur le corpus et non choisi à vue :
//   - `NIGHTLIFE_FLOOR = 8.0` sur le **meilleur** quartier documenté de la
//     commune. Sur les 495 villes que ce profil classe, la médiane de cette
//     valeur est 6,5 et le 9ᵉ décile 7,5 : le plancher est donc au-dessus du
//     neuvième décile. 41 communes sur 540 l'atteignent.
//   - `SENIOR_SHARE_CEILING = 32` % de résidents de 60 ans et plus. C'est le
//     garde anti-station-fantôme de cette section, et il remplace la part des
//     15-29 ans parce qu'il attrape ce que l'autre rate : une station peut
//     avoir une vraie scène de bord de mer et la refermer en octobre. Le 3ᵉ
//     quartile national est à 31,0 %, donc le plafond est juste au-dessus ;
//     47 des 50 destinations déjà publiées passent dessous.
//   - `RESIDENT_POP_FLOOR`, le plancher de population déjà publié plus haut.
//
// La règle est plus fidèle à la série que celle de la section 1 : 24 des 50
// destinations déjà publiées la satisfont, contre 9 pour l'autre.
const NIGHTLIFE_FLOOR = 8.0;
const SENIOR_SHARE_CEILING = 32;

const NIGHTLIFE_BY_CITY = new Map(
  NEIGHBORHOODS.map((c) => [
    c.citySlug,
    {
      best: Math.max(...c.neighborhoods.map((n) => n.scores.nightlife)),
      bestName:
        [...c.neighborhoods].sort(
          (a, b) => b.scores.nightlife - a.scores.nightlife,
        )[0]?.name ?? "",
      documented: c.neighborhoods.length,
    },
  ]),
);

interface NightScenePick {
  city: CityLight;
  score: number;
  best: number;
  bestName: string;
  documented: number;
  seniors: number;
}

// ⚠️ Cette section lit le **classement entier** et non `celibPool()`, et c'est
// une correction et non une inattention. Mesuré le 2026-09-26 : sur les 33
// communes qui satisfont le barème ci-dessous, **17 sont au-delà du rang 100**,
// dont Paris (118ᵉ), Lille (106ᵉ), Bayonne (129ᵉ), Montpellier (145ᵉ), Nice
// (146ᵉ) et Marseille (322ᵉ). La fenêtre de 100 rendait donc les trois listes
// précédentes incapables de contenir Paris — sur une page qui parle de sortir
// le soir. La cause est l'axe `life`, qui pèse 0,30 dans ce profil et qui
// mesure la qualité du quotidien d'un **résident** : il vaut 5,5 à Paris, 5,7 à
// Lille, 5,9 à Montpellier et 4,1 à Marseille, c'est-à-dire qu'il pénalise
// précisément les villes dont la soirée est l'argument. Ne pas « harmoniser »
// cette section sur les trois autres en lui remettant le pool.
function nightSceneDestinations(): NightScenePick[] {
  // ⚠️ `limit` est explicite : sans option, `topCitiesForProfile` s'arrête à 30.
  const eligible = topCitiesForProfile("celibataire", CITIES_LIGHT, {
    limit: CITIES_LIGHT.length,
  })
    .map(({ city, fit }) => {
      const n = NIGHTLIFE_BY_CITY.get(city.slug);
      const rec = cityPopulation(city.slug);
      const seniors = seniorShare(city.slug);
      if (!n || !rec || seniors === null) return null;
      return {
        city,
        score: fit.score,
        best: n.best,
        bestName: n.bestName,
        documented: n.documented,
        seniors,
        residents: rec.pop2022,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
    .filter(
      (p) =>
        p.best >= NIGHTLIFE_FLOOR &&
        p.seniors < SENIOR_SHARE_CEILING &&
        p.residents >= RESIDENT_POP_FLOOR,
    )
    .sort((a, b) => b.best - a.best || b.score - a.score);

  // Une égalité ne se coupe jamais en son milieu (convention de
  // `lib/owner-rankings.ts`) : la note de vie du soir est publiée au dixième et
  // les paliers y sont larges — le palier 8,0 compte à lui seul une douzaine de
  // communes. On s'arrête donc **avant** le palier qui déborde de la cible,
  // plutôt que d'en publier une moitié dans l'ordre d'insertion du seed.
  const TARGET = 12;
  const out: NightScenePick[] = [];
  for (let i = 0; i < eligible.length; ) {
    const band = eligible.filter((p) => p.best === eligible[i].best);
    if (out.length > 0 && out.length + band.length > TARGET) break;
    out.push(...band);
    i += band.length;
  }
  return out;
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
  const nightScene = nightSceneDestinations();

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
        title="Desserte documentée : TGV ou RER, puis sortie du soir sans voiture"
        intro="On arrive en TGV ou en RER, on rentre du bar à minuit à pied ou en tram. Sans voiture, un dernier verre en périphérie devient une expédition, et la desserte urbaine tardive fait toute la différence sur un séjour en célibataire. Une réserve à lire avant la liste : notre table de desserte est saisie à la main et ne couvre que 93 des 495 villes classées par ce profil. Cette liste montre donc les destinations dont la desserte est documentée, pas toutes celles qui sont accessibles en train, et elle ne compte pas le TER comme un train : Albi, Compiègne ou Beauvais en sont absentes alors qu'un direct y mène en une heure environ."
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

      {/* Section 4 — La scène du soir documentée */}
      <Section
        emoji={<Wine className="h-6 w-6" />}
        title="La scène du soir, quartier par quartier"
        intro="Les trois listes précédentes mesurent la ville : qui y habite, comment on y arrive, ce qu'elle coûte. Celle-ci mesure ce qu'on vient y faire, et elle part du quartier. Pour chaque commune, on retient la note de vie nocturne de son quartier documenté le mieux noté, à condition que moins d'un résident sur trois ait 60 ans ou plus — une station peut très bien avoir une scène de bord de mer et la refermer en octobre."
      >
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--text-tertiary)] text-xs uppercase tracking-wide">
                <th className="py-2 pr-3">Ville</th>
                <th className="py-2 pr-3">Quartier le mieux noté</th>
                <th className="py-2 pr-3 text-right">Vie du soir</th>
                <th className="py-2 pr-3 text-right">60 ans +</th>
                <th className="py-2 text-right">Fit</th>
              </tr>
            </thead>
            <tbody>
              {nightScene.map(
                ({ city, best, bestName, documented, seniors, score }) => (
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
                    <td className="py-2 pr-3 text-[var(--text-secondary)]">
                      <Link
                        href={`/villes/${city.slug}/quartiers`}
                        className="hover:text-[var(--accent)]"
                      >
                        {bestName}
                      </Link>
                      <span className="ml-1.5 text-[11px] text-[var(--text-tertiary)]">
                        sur {documented} documentés
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right font-mono-data text-[var(--text-secondary)]">
                      {best.toFixed(1)}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono-data text-[var(--text-tertiary)]">
                      {seniors.toFixed(1)} %
                    </td>
                    <td className="py-2 text-right font-mono-data font-bold text-[var(--accent)]">
                      {score.toFixed(1)}
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          Seuils : vie du soir du meilleur quartier documenté ≥{" "}
          {NIGHTLIFE_FLOOR.toLocaleString("fr-FR", {
            minimumFractionDigits: 1,
          })}{" "}
          (médiane du corpus 6,5, neuvième décile 7,5 ; 41 communes sur 540
          l'atteignent) · part des 60 ans et plus &lt;{" "}
          {SENIOR_SHARE_CEILING} % (3ᵉ quartile national 31,0 %) · population ≥{" "}
          {RESIDENT_POP_FLOOR.toLocaleString("fr-FR")} habitants.{" "}
          <strong>
            Cette note de vie du soir est une estimation de notre part
          </strong>{" "}
          sur les deux à trois quartiers que nous documentons par commune, pas
          un recensement de bars ni un relevé de terrain : une ville peut avoir
          une scène que nos fiches ne voient pas, et la colonne « sur N
          documentés » dit sur combien de quartiers la note est prise. Part des
          60 ans et plus : {INSEE_POP_CREDIT}, millésime {INSEE_POP_YEAR}.
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
