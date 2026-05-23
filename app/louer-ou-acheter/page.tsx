import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buildAllRentVsBuy, VERDICT_META } from "@/lib/rent-vs-buy";

export const metadata: Metadata = {
  title: "Louer ou acheter en France 2026 · Ratio prix/loyer par ville",
  description: "Ratio prix/loyer par ville : où acheter s'amortit vite vs où louer reste rationnel. PER immobilier + médians 2026.",
  alternates: { canonical: "/louer-ou-acheter" },
  openGraph: {
    title: "Louer ou acheter ? Classement France 2026",
    description: "Ratio prix/loyer par ville : où acheter s'amortit, où louer reste plus malin.",
  },
};

export default function LouerOuAcheterIndexPage() {
  const all = buildAllRentVsBuy().sort((a, b) => a.rentToPriceRatio - b.rentToPriceRatio);
  const topAcheteur = all.slice(0, 15);
  const topLocataire = all.slice(-15).reverse();

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Louer ou acheter en France ?
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          {all.length} villes classées par ratio prix/loyer (PER immobilier). Plus le ratio est bas,
          plus l&apos;achat s&apos;amortit vite vs location. Le verdict combine le ratio + une simulation
          de prêt 25 ans à 3,4 % TAEG (médian jan 2026). T3 ≈ 65 m² médian Insee.
        </p>

        <div className="mt-6 flex flex-wrap gap-2 text-xs">
          <Badge>{all.length} villes</Badge>
          <Badge>Médians DVF + observatoires loyers</Badge>
          <Badge>Barème 2026</Badge>
        </div>

        {/* Top 15 fortement acheteurs */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Top 15 — Acheter s&apos;amortit le plus vite
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">Tri par ratio prix/loyer croissant.</p>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              <tr>
                <th className="px-3 py-2 text-left w-12">#</th>
                <th className="px-3 py-2 text-left">Ville</th>
                <th className="px-3 py-2 text-right">Ratio</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">Prix T3</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">Loyer T3</th>
                <th className="px-3 py-2 text-right hidden md:table-cell">Payback apport</th>
              </tr>
            </thead>
            <tbody>
              {topAcheteur.map((r, i) => (
                <tr key={r.citySlug} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                  <td className="px-3 py-2 text-sm tabular-nums text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link href={`/villes/${r.citySlug}/louer-ou-acheter`} className="text-[var(--text-primary)] font-medium hover:underline">
                      {r.cityName}
                    </Link>
                    <span className={`ml-2 inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] uppercase tracking-wider ${VERDICT_META[r.verdict].tone}`}>
                      {VERDICT_META[r.verdict].label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums font-semibold text-[var(--text-primary)]">{r.rentToPriceRatio}</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{r.priceT3.toLocaleString("fr-FR")} €</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{Math.round(r.rentT3Annual / 12).toLocaleString("fr-FR")} €</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden md:table-cell">
                    {r.paybackYears != null ? `${r.paybackYears} ans` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-2 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Lecture du ratio</strong> = années de loyer
          pour égaler le prix d&apos;achat. &lt; 13 : achat fortement gagnant · 13-18 : achat favorable ·
          18-24 : équilibre · 24-30 : louer plus malin · &gt; 30 : marché tendu.
        </p>

        {/* Top 15 fortement locataires */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Top 15 — Louer reste plus rationnel
        </h2>
        <p className="text-xs text-[var(--text-tertiary)] mb-3">
          Tri par ratio prix/loyer décroissant. Acheter coûte trop cher relativement aux loyers — flexibilité locative préférable.
        </p>
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              <tr>
                <th className="px-3 py-2 text-left w-12">#</th>
                <th className="px-3 py-2 text-left">Ville</th>
                <th className="px-3 py-2 text-right">Ratio</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">Prix T3</th>
                <th className="px-3 py-2 text-right hidden sm:table-cell">Loyer T3</th>
                <th className="px-3 py-2 text-right hidden md:table-cell">Écart mensuel</th>
              </tr>
            </thead>
            <tbody>
              {topLocataire.map((r, i) => (
                <tr key={r.citySlug} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface)]">
                  <td className="px-3 py-2 text-sm tabular-nums text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link href={`/villes/${r.citySlug}/louer-ou-acheter`} className="text-[var(--text-primary)] font-medium hover:underline">
                      {r.cityName}
                    </Link>
                    <span className={`ml-2 inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] uppercase tracking-wider ${VERDICT_META[r.verdict].tone}`}>
                      {VERDICT_META[r.verdict].label}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums font-semibold text-[var(--text-primary)]">{r.rentToPriceRatio}</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{r.priceT3.toLocaleString("fr-FR")} €</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{Math.round(r.rentT3Annual / 12).toLocaleString("fr-FR")} €</td>
                  <td className="px-3 py-2 text-right text-sm tabular-nums hidden md:table-cell">
                    <span className={r.monthlySavingsVsRent > 0 ? "text-emerald-700" : "text-red-700"}>
                      {r.monthlySavingsVsRent > 0 ? "−" : "+"}{Math.abs(Math.round(r.monthlySavingsVsRent))} €
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="mt-2 text-[11px] text-[var(--text-tertiary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Lecture du ratio</strong> = années de loyer
          pour égaler le prix d&apos;achat. &lt; 13 : achat fortement gagnant · 13-18 : achat favorable ·
          18-24 : équilibre · 24-30 : louer plus malin · &gt; 30 : marché tendu.
        </p>

        <div className="mt-10 text-xs text-[var(--text-tertiary)]">
          L&apos;URL <code className="px-1 py-0.5 bg-[var(--bg-elevated)] rounded-full">/villes/&lt;slug-ville&gt;/louer-ou-acheter</code>
          {" "}fonctionne pour toutes les villes couvertes par HOUSING (loyer T3 + prix m² disponibles).
        </div>
      </section>
      <Footer />
    </main>
  );
}
