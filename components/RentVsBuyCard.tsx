import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { VERDICT_META, type RentVsBuyVerdict, type RentVsBuyData } from "@/lib/rent-vs-buy";

// data precomputed server-side (lib/city-profile-data) — buildRentVsBuy reads
// HOUSING + the full seed.
interface Props {
  citySlug: string;
  data: RentVsBuyData | null;
  locale?: "fr" | "en";
}

// Plain-language headline per verdict — "Acheteur"/"Locataire" alone reads as
// jargon; say what to actually do.
const HEADLINE: Record<RentVsBuyVerdict, string> = {
  "fortement-acheteur": "Acheter est nettement plus avantageux",
  acheteur: "Acheter est plutôt avantageux",
  equilibre: "Acheter ou louer se valent",
  locataire: "Louer est plutôt avantageux",
  "fortement-locataire": "Louer est nettement plus avantageux",
};

const HEADLINE_EN: Record<RentVsBuyVerdict, string> = {
  "fortement-acheteur": "Buying wins clearly",
  acheteur: "Buying has the edge",
  equilibre: "Buying and renting break even",
  locataire: "Renting has the edge",
  "fortement-locataire": "Renting wins clearly",
};

export function RentVsBuyCard({ citySlug, data, locale = "fr" }: Props) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  if (!data) return null;
  const verdict = VERDICT_META[data.verdict];
  const buyMonthly = data.monthlyMortgage + data.monthlyOwnerCharges;
  const rentMonthly = Math.round(data.rentT3Annual / 12);

  return (
    <Card>
      <Link
        href={locale === "en" ? `/cities/${citySlug}/own-vs-rent` : `/villes/${citySlug}/louer-ou-acheter`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Home className="h-4 w-4 text-[var(--text-secondary)]" />
            {L("Louer ou acheter ?", "Rent or buy?")}
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        {/* Plain verdict first, then the reasoning. */}
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${verdict.tone}`}>
          {(locale === "en" ? HEADLINE_EN : HEADLINE)[data.verdict]}
        </span>

        {/* Concrete monthly comparison — the part everyone understands. */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">{L("Acheter (T3)", "Buy (2-bed)")}</div>
            <div className="text-base font-bold tabular-nums text-[var(--text-primary)]">
              {buyMonthly.toLocaleString(locale === "en" ? "en-GB" : "fr-FR")} €<span className="text-[11px] font-normal text-[var(--text-tertiary)]">{L("/mois", "/mo")}</span>
            </div>
          </div>
          <div className="rounded-xl bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">{L("Louer (T3)", "Rent (2-bed)")}</div>
            <div className="text-base font-bold tabular-nums text-[var(--text-primary)]">
              {rentMonthly.toLocaleString(locale === "en" ? "en-GB" : "fr-FR")} €<span className="text-[11px] font-normal text-[var(--text-tertiary)]">{L("/mois", "/mo")}</span>
            </div>
          </div>
        </div>

        {/* The ratio, now explained instead of bare. */}
        <p className="mt-3 text-[11px] leading-snug text-[var(--text-secondary)]">
          {L("Acheter revient à ", "Buying costs ")}<strong className="text-[var(--text-primary)] tabular-nums">{data.rentToPriceRatio} {L("ans", "yrs")}</strong>{L(" de loyer.", " of rent.")}
          {" "}{data.rentToPriceRatio < 20
            ? L("En dessous de ~20 ans, l'achat s'amortit vite.", "Under ~20 yrs, buying pays off fast.")
            : L("Au-delà de ~20 ans, louer garde l'avantage pour un séjour court.", "Over ~20 yrs, renting wins for a short stay.")}
        </p>
      </Link>
    </Card>
  );
}
