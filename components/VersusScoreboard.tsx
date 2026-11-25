// Tableau de verdict en tête des guides « A vs B » : notes rendues (calibrées +
// normalisées, jamais le littéral du seed) des deux villes, axe par axe, avec
// le gagnant de chaque ligne. Composant serveur, zéro JS, lisible sur téléphone.
import Link from "@/components/AppLink";
import type { CityScore } from "@/lib/types";

type VsCity = { slug: string; name: string; scores: CityScore };
import { comparePairSlug } from "@/lib/comparer-pairs";
import { scoreHex } from "@/lib/utils";

type Locale = "fr" | "en";

const AXES: { key: keyof CityScore; fr: string; en: string }[] = [
  { key: "life", fr: "Qualité de vie", en: "Quality of life" },
  { key: "cost", fr: "Coût de la vie", en: "Cost of living" },
  { key: "safety", fr: "Sécurité", en: "Safety" },
  { key: "transport", fr: "Transports", en: "Transport" },
  { key: "nature", fr: "Nature", en: "Nature" },
  { key: "culture", fr: "Culture", en: "Culture" },
  { key: "schools", fr: "Écoles", en: "Schools" },
  { key: "remoteWork", fr: "Télétravail", en: "Remote work" },
];

const fmt = (n: number, l: Locale) => n.toFixed(1).replace(".", l === "fr" ? "," : ".");

/** Renvoie les deux villes d'un guide « a-vs-b », ou null si le guide n'en est pas un. */
export function versusCities(slug: string, cities: VsCity[]): [VsCity, VsCity] | null {
  if (!/-vs-/.test(slug) || cities.length < 2) return null;
  const [a, b] = cities;
  const [left, right] = slug.split("-vs-");
  if (!left.startsWith(a.slug) || !right.startsWith(b.slug)) return null;
  return [a, b];
}

export function VersusScoreboard({ a, b, locale = "fr" }: { a: VsCity; b: VsCity; locale?: Locale }) {
  const fr = locale === "fr";
  const pair = comparePairSlug(a.slug, b.slug);
  const cityBase = fr ? "/villes" : "/cities";
  const winner = a.scores.global === b.scores.global ? null : a.scores.global > b.scores.global ? a : b;
  const verdict = winner
    ? fr
      ? `${winner.name} passe devant au score global`
      : `${winner.name} leads on overall score`
    : fr
      ? "Égalité au score global"
      : "Tied on overall score";

  return (
    <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_-18px_rgba(79,70,229,0.55)]">
      <p className="grad-head-1 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest">
        {fr ? "Le duel en chiffres" : "The duel in numbers"}
      </p>
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
          {[a, b].map((c, i) => (
            <div key={c.slug} className={i === 1 ? "order-3" : "order-1"}>
              <Link href={`${cityBase}/${c.slug}`} className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)]">
                {c.name}
              </Link>
              <div className="font-mono-data text-3xl font-extrabold" style={{ color: scoreHex(c.scores.global) }}>
                {fmt(c.scores.global, locale)}
                <span className="text-sm font-semibold text-[var(--text-secondary)]">/10</span>
              </div>
            </div>
          ))}
          <span className="order-2 rounded-full bg-[var(--accent-pink)] px-2.5 py-1 text-xs font-bold text-white">vs</span>
        </div>
        <p className="mt-2 text-center text-sm font-semibold text-[var(--text-primary)]">{verdict}</p>

        <table className="mt-4 w-full text-sm">
          <caption className="sr-only">{fr ? "Notes sur 10 par critère" : "Scores out of 10 by criterion"}</caption>
          <thead>
            <tr className="text-xs text-[var(--text-secondary)]">
              <th scope="col" className="w-1/3 py-1 text-left font-medium">{a.name}</th>
              <th scope="col" className="py-1 text-center font-medium">{fr ? "Critère" : "Criterion"}</th>
              <th scope="col" className="w-1/3 py-1 text-right font-medium">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {AXES.map((ax) => {
              const va = a.scores[ax.key];
              const vb = b.scores[ax.key];
              const win = (x: number, y: number) =>
                x > y ? "rounded-md bg-[var(--band-indigo)] font-bold text-[var(--accent)]" : "text-[var(--text-secondary)]";
              return (
                <tr key={ax.key} className="border-t border-[var(--band-indigo)]">
                  <td className="py-1.5"><span className={`inline-block px-2 py-0.5 font-mono-data ${win(va, vb)}`}>{fmt(va, locale)}</span></td>
                  <td className="py-1.5 text-center text-xs text-[var(--text-secondary)]">{fr ? ax.fr : ax.en}</td>
                  <td className="py-1.5 text-right"><span className={`inline-block px-2 py-0.5 font-mono-data ${win(vb, va)}`}>{fmt(vb, locale)}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-[var(--text-secondary)]">
          {fr
            ? "Notes sur 10, 10 = meilleur ; coût de la vie : 10 = plus abordable. Source : nos fiches villes."
            : "Scores out of 10, 10 = best; cost of living: 10 = most affordable. Source: our city profiles."}
        </p>
        {pair && (
          <Link
            href={`${fr ? "/comparer" : "/compare"}/${pair}`}
            className="mt-3 inline-flex rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            {fr ? `Comparer ${a.name} et ${b.name} en détail →` : `Compare ${a.name} and ${b.name} in detail →`}
          </Link>
        )}
      </div>
    </div>
  );
}
