import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { buildRentVsBuy, VERDICT_META, type RentVsBuyVerdict } from "@/lib/rent-vs-buy";

interface Props {
  citySlug: string;
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

export function RentVsBuyCard({ citySlug }: Props) {
  const data = buildRentVsBuy(citySlug);
  if (!data) return null;
  const verdict = VERDICT_META[data.verdict];
  const buyMonthly = data.monthlyMortgage + data.monthlyOwnerCharges;
  const rentMonthly = Math.round(data.rentT3Annual / 12);

  return (
    <Card>
      <Link
        href={`/villes/${citySlug}/louer-ou-acheter`}
        className="group block -m-5 p-5 hover:bg-[var(--bg-elevated)]/40 transition-colors"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
            <Home className="h-4 w-4 text-[var(--text-secondary)]" />
            Louer ou acheter ?
          </h3>
          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
        </div>

        {/* Plain verdict first, then the reasoning. */}
        <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${verdict.tone}`}>
          {HEADLINE[data.verdict]}
        </span>

        {/* Concrete monthly comparison — the part everyone understands. */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">Acheter (T3)</div>
            <div className="text-base font-bold tabular-nums text-[var(--text-primary)]">
              {buyMonthly.toLocaleString("fr-FR")} €<span className="text-[11px] font-normal text-[var(--text-tertiary)]">/mois</span>
            </div>
          </div>
          <div className="rounded-xl bg-[var(--bg-surface)] p-2.5">
            <div className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">Louer (T3)</div>
            <div className="text-base font-bold tabular-nums text-[var(--text-primary)]">
              {rentMonthly.toLocaleString("fr-FR")} €<span className="text-[11px] font-normal text-[var(--text-tertiary)]">/mois</span>
            </div>
          </div>
        </div>

        {/* The ratio, now explained instead of bare. */}
        <p className="mt-3 text-[11px] leading-snug text-[var(--text-secondary)]">
          Acheter revient à <strong className="text-[var(--text-primary)] tabular-nums">{data.rentToPriceRatio} ans</strong> de loyer.
          {" "}{data.rentToPriceRatio < 20
            ? "En dessous de ~20 ans, l'achat s'amortit vite."
            : "Au-delà de ~20 ans, louer garde l'avantage pour un séjour court."}
        </p>
      </Link>
    </Card>
  );
}
