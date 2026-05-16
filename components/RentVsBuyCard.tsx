import Link from "next/link";
import { Home, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { buildRentVsBuy, VERDICT_META } from "@/lib/rent-vs-buy";

interface Props {
  citySlug: string;
}

export function RentVsBuyCard({ citySlug }: Props) {
  const data = buildRentVsBuy(citySlug);
  if (!data) return null;
  const verdict = VERDICT_META[data.verdict];

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

        <div className="flex items-baseline gap-3 mb-2">
          <span className="text-3xl font-bold font-mono-data tabular-nums text-[var(--text-primary)]">
            {data.rentToPriceRatio}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">années de loyer<br />pour acheter</span>
        </div>

        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${verdict.tone}`}>
          {verdict.label}
        </span>

        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <span className="text-[var(--text-tertiary)]">Acheteur :</span>{" "}
            <strong className="text-[var(--text-primary)] tabular-nums">
              {(data.monthlyMortgage + data.monthlyOwnerCharges).toLocaleString("fr-FR")} €
            </strong>
          </div>
          <div>
            <span className="text-[var(--text-tertiary)]">Locataire :</span>{" "}
            <strong className="text-[var(--text-primary)] tabular-nums">
              {Math.round(data.rentT3Annual / 12).toLocaleString("fr-FR")} €
            </strong>
          </div>
        </div>
      </Link>
    </Card>
  );
}
