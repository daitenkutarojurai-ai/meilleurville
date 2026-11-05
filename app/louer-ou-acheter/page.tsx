import type { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge } from "@/components/EmojiBadge";
import { VERDICT_META } from "@/lib/rent-vs-buy";
import { buildAllRentVsBuy } from "@/lib/rent-vs-buy-rankings";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Louer ou acheter en France 2026 · Ratio prix/loyer par ville",
  description: "Ratio prix/loyer par ville : où acheter s'amortit vite vs où louer reste rationnel. PER immobilier + médians 2026.",
  alternates: pathAlternates("/louer-ou-acheter", "/own-vs-rent"),
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <div className="flex items-center gap-3">
          <EmojiBadge emoji="🏠" tone="indigo" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            <span className="gradient-text">Louer ou acheter</span> en France ?
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          {all.length} villes classées par ratio prix/loyer (PER immobilier). Plus le ratio est bas,
          plus l&apos;achat s&apos;amortit vite vs location. Le verdict combine le ratio + une simulation
          de prêt 25 ans à 3,4 % TAEG (médian jan 2026). T3 ≈ 65 m² médian Insee.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="grad-head-0 rounded-full px-3 py-1 font-semibold">{all.length} villes</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">Médians DVF + observatoires loyers</span>
          <span className="rounded-full bg-white/85 px-3 py-1 font-medium text-[#4338CA] ring-1 ring-[#C7D2FE]">Barème 2026</span>
        </div>
        </div>
      </section>

      {/* Top 15 fortement acheteurs */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 15 — Acheter s&apos;amortit le plus vite</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Tri par ratio prix/loyer croissant.</p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--band-indigo)] text-xs uppercase tracking-wide text-[#4338CA]">
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
                <tr key={r.citySlug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
                  <td className="px-3 py-2 text-sm tabular-nums text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link href={`/villes/${r.citySlug}/louer-ou-acheter`} className="text-[var(--text-primary)] font-semibold hover:text-[var(--accent)]">
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
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Lecture du ratio</strong> = années de loyer
          pour égaler le prix d&apos;achat. &lt; 13 : achat fortement gagnant · 13-18 : achat favorable ·
          18-24 : équilibre · 24-30 : louer plus malin · &gt; 30 : marché tendu.
        </p>
        </div>
      </section>

      {/* Top 15 fortement locataires */}
      <section className="band band-pink py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-2xl font-bold">
          <span className="gradient-text">Top 15 — Louer reste plus rationnel</span>
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Tri par ratio prix/loyer décroissant. Acheter coûte trop cher relativement aux loyers — flexibilité locative préférable.
        </p>
        <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-[0_10px_28px_-18px_rgba(219,39,119,0.45)]">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--band-pink)] text-xs uppercase tracking-wide text-[#9D174D]">
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
                <tr key={r.citySlug} className="border-t border-[var(--border)] transition-colors hover:bg-[#F5F3FF]">
                  <td className="px-3 py-2 text-sm tabular-nums text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="px-3 py-2 text-sm">
                    <Link href={`/villes/${r.citySlug}/louer-ou-acheter`} className="text-[var(--text-primary)] font-semibold hover:text-[var(--accent)]">
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
          </div>
        </div>
        <p className="mt-3 text-xs text-[var(--text-secondary)] leading-relaxed">
          <strong className="text-[var(--text-secondary)]">Lecture du ratio</strong> = années de loyer
          pour égaler le prix d&apos;achat. &lt; 13 : achat fortement gagnant · 13-18 : achat favorable ·
          18-24 : équilibre · 24-30 : louer plus malin · &gt; 30 : marché tendu.
        </p>
        </div>
      </section>

      <section className="band band-sky py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
          Attention : sur ces marchés au ratio le plus élevé, «&nbsp;louer plus malin&nbsp;» ne veut
          pas dire «&nbsp;louer facilement&nbsp;». Beaucoup figurent aussi dans notre classement des{" "}
          <Link href="/red-flags/villes-logement-introuvable" className="text-[var(--accent)] underline hover:no-underline">
            villes où le logement locatif est introuvable
          </Link>
          {" "}— dossier blindé, garant obligatoire, visites collectives. La flexibilité de la
          location est théorique quand décrocher un bail prend plusieurs mois.
        </p>

        <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          À l&apos;inverse, les ratios les plus bas — souvent la Creuse, le Cantal, les Vosges,
          la Lozère, la Haute-Marne — proposent l&apos;achat à un prix qui semble imbattable.
          Le vrai coût mensuel n&apos;apparaît qu&apos;après la première facture : le classement
          des{" "}
          <Link href="/red-flags/villes-chauffage-hivernal-couteux" className="text-[var(--accent)] underline hover:no-underline">
            villes où le chauffage hivernal pèse le plus sur le salaire local
          </Link>
          {" "}rappelle qu&apos;en zone climatique H1 et en altitude, la facture ADEME d&apos;un T2
          peut atteindre 7-8 % du net médian — de quoi déplacer une partie du gain
          d&apos;achat sur la ligne énergie.
        </p>

        <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          L&apos;autre angle mort de l&apos;achat sur ces marchés très abordables est la sortie :
          un ratio favorable suppose qu&apos;on retrouve un acheteur au terme prévu. Le classement
          des{" "}
          <Link href="/red-flags/villes-qui-se-vident" className="text-[var(--accent)] underline hover:no-underline">
            communes qui perdent des habitants d&apos;un recensement à l&apos;autre
          </Link>
          {" "}sert précisément à repérer celles où le prix bas tient moins à la géographie
          qu&apos;au nombre de candidats — et où la revente se compte en trimestres.
        </p>

        <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          À l&apos;autre extrémité du tableau, le marché où l&apos;achat s&apos;est le plus éloigné du loyer
          est détaillé dans le classement des{" "}
          <Link href="/red-flags/villes-acheter-plus-cher-que-louer" className="text-[var(--accent)] underline hover:no-underline">
            villes où il faut des décennies de loyer pour payer le bien
          </Link>
          , bâti sur les prix de vente réellement enregistrés plutôt que sur notre repère éditorial.
        </p>

        <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
          Le ratio arbitre entre deux façons de se loger, pas entre deux villes : il ignore les
          courses, les transports et les charges, qui pèsent souvent plus lourd que l&apos;écart
          loyer-mensualité. Nos{" "}
          <Link href="/guides/categorie/budget" className="text-[var(--accent)] underline hover:no-underline">
            guides budget, poste par poste et ville par ville
          </Link>
          {" "}reprennent le calcul là où ce tableau s&apos;arrête.
        </p>

        <div className="mt-6 text-xs text-[var(--text-tertiary)]">
          L&apos;URL <code className="px-1 py-0.5 bg-[var(--band-sky)] rounded-full">/villes/&lt;slug-ville&gt;/louer-ou-acheter</code>
          {" "}fonctionne pour toutes les villes couvertes par HOUSING (loyer T3 + prix m² disponibles).
        </div>
        </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
