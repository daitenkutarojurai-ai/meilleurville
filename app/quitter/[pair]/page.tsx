import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  QUITTER_PAIRS,
  buildQuitterPairData,
  pairToSlug,
  slugToPair,
} from "@/lib/quitter-pairs";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { scoreColor } from "@/lib/utils";
import { CITIES_COUNT } from "@/lib/site-stats";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;

type Props = { params: Promise<{ pair: string }> };

export function generateStaticParams() {
  return QUITTER_PAIRS.map((p) => ({ pair: pairToSlug(p) }));
}

// On-demand for non-curated pairs (e.g. lyon-pour-bordeaux not in seed list).
// Cheap to render and avoids 404 on plausible URLs.
export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = slugToPair(pair);
  if (!parsed) return {};
  const data = buildQuitterPairData(parsed[0], parsed[1]);
  if (!data) return {};
  const { origin, destination, monthlySavings } = data;
  const savingsLabel =
    monthlySavings != null
      ? monthlySavings > 0
        ? ` Économie ${Math.round(monthlySavings)} €/mois sur les charges fixes.`
        : ` Surcoût ${Math.round(-monthlySavings)} €/mois sur les charges fixes.`
      : "";
  return {
    title: `Quitter ${origin.name} pour ${destination.name} · Comparatif honnête 2026`,
    description: `Quitter ${origin.name} pour ${destination.name} : loyer, charges, owner scores, climat, verdict pour qui le move a du sens.${savingsLabel}`,
    alternates: { canonical: `/quitter/${pair}` },
    openGraph: {
      title: `Quitter ${origin.name} pour ${destination.name} ?`,
      description: `Comparatif coût mensuel, owner scores et profil. Décision argumentée, zéro promesse vide.`,
    },
  };
}

function CostRow({ label, origin, destination }: { label: string; origin: number | null; destination: number | null }) {
  const delta = origin != null && destination != null ? destination - origin : null;
  return (
    <tr className="border-b border-[var(--border)]">
      <td className="px-3 py-2 text-sm text-[var(--text-secondary)]">{label}</td>
      <td className="px-3 py-2 text-right text-sm tabular-nums">
        {origin != null ? `${origin} €` : "—"}
      </td>
      <td className="px-3 py-2 text-right text-sm tabular-nums">
        {destination != null ? `${destination} €` : "—"}
      </td>
      <td className="px-3 py-2 text-right text-sm tabular-nums">
        {delta != null ? (
          <span className={delta < 0 ? "text-emerald-700" : delta > 0 ? "text-red-700" : "text-[var(--text-tertiary)]"}>
            {delta > 0 ? "+" : ""}
            {delta} €
          </span>
        ) : (
          "—"
        )}
      </td>
    </tr>
  );
}

export default async function QuitterPairPage({ params }: Props) {
  const { pair } = await params;
  const parsed = slugToPair(pair);
  if (!parsed) notFound();
  const data = buildQuitterPairData(parsed[0], parsed[1]);
  if (!data) notFound();

  const { origin, destination, originBreakdown, destinationBreakdown, monthlySavings, costRatio, ownerWins, ownerLosses, globalDelta } = data;
  const savingsAnnual = monthlySavings != null ? Math.round(monthlySavings * 12) : null;
  // Salaire équivalent : si tu touches X net à Paris, le seuil reste-à-vivre identique à destination
  // requiert (X − savings) — c'est-à-dire que tu peux baisser ton salaire net de `monthlySavings` €
  // sans perdre en pouvoir d'achat sur les charges fixes.

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Quitter une ville", path: "/quitter" },
    { name: `${origin.name} → ${destination.name}`, path: `/quitter/${pair}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/quitter" className="hover:underline">Quitter une ville</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Quitter <span className="underline decoration-amber-300">{origin.name}</span> pour <span className="underline decoration-emerald-300">{destination.name}</span> ?
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Comparatif factuel : ce que vous gagnez (ou perdez) chaque mois, sur la qualité de vie,
          et pour qui ce move a réellement du sens. Aucun chiffre inventé, tout est dérivé des
          données du site.
        </p>

        {/* Bandeau résumé */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Écart charges fixes</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {monthlySavings != null ? (
                <span className={monthlySavings > 0 ? "text-emerald-700" : "text-red-700"}>
                  {monthlySavings > 0 ? "−" : "+"}{Math.abs(Math.round(monthlySavings))} €/mois
                </span>
              ) : (
                <span className="text-[var(--text-tertiary)]">—</span>
              )}
            </div>
            {savingsAnnual != null && (
              <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                Soit {savingsAnnual > 0 ? "−" : "+"}{Math.abs(savingsAnnual).toLocaleString("fr-FR")} €/an
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Coût relatif</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {costRatio != null ? `${Math.round(costRatio * 100)} %` : "—"}
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              du coût {origin.name}
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Δ qualité de vie</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${globalDelta > 0 ? "text-emerald-700" : globalDelta < 0 ? "text-red-700" : "text-[var(--text-secondary)]"}`}>
              {globalDelta > 0 ? "+" : ""}{globalDelta} pts
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              {destination.name} {destination.scores.global}/10 vs {origin.name} {origin.scores.global}/10
            </div>
          </Card>
        </div>

        {/* Tableau coût mensuel */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Charges fixes mensuelles</h2>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          T2 médian, chauffage selon zone ADEME, voiture ou transit, taxe foncière mensualisée, TEOM.
          Médians honnêtes — votre situation peut varier. Source : observatoires loyers, ADEME, France Assureurs, DGFiP.
        </p>
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[440px]">
            <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
              <tr>
                <th className="px-3 py-2 text-left">Poste</th>
                <th className="px-3 py-2 text-right">{origin.name}</th>
                <th className="px-3 py-2 text-right">{destination.name}</th>
                <th className="px-3 py-2 text-right">Écart</th>
              </tr>
            </thead>
            <tbody>
              <CostRow label="Loyer T2" origin={originBreakdown?.rentT2 ?? null} destination={destinationBreakdown?.rentT2 ?? null} />
              <CostRow label="Chauffage" origin={originBreakdown?.heating ?? null} destination={destinationBreakdown?.heating ?? null} />
              <CostRow label="Mobilité (voiture ou transit)" origin={originBreakdown?.mobilityCost ?? null} destination={destinationBreakdown?.mobilityCost ?? null} />
              <CostRow label="Taxe foncière" origin={originBreakdown?.taxeFonciere ?? null} destination={destinationBreakdown?.taxeFonciere ?? null} />
              <CostRow label="TEOM (ordures)" origin={originBreakdown?.teom ?? null} destination={destinationBreakdown?.teom ?? null} />
              <tr className="bg-[var(--bg-surface)] font-semibold">
                <td className="px-3 py-2 text-sm">Total charges fixes</td>
                <td className="px-3 py-2 text-right tabular-nums">{originBreakdown ? `${originBreakdown.totalFixed} €` : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">{destinationBreakdown ? `${destinationBreakdown.totalFixed} €` : "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {monthlySavings != null ? (
                    <span className={monthlySavings > 0 ? "text-emerald-700" : "text-red-700"}>
                      {monthlySavings > 0 ? "−" : "+"}{Math.abs(Math.round(monthlySavings))} €
                    </span>
                  ) : "—"}
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </Card>

        {/* Wins / Losses */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Ce que vous gagnez · ce que vous perdez</h2>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          Écarts ≥ 0,4 pt sur les 10 owner scores (canicule, calme, lien social, sécurité,
          télétravail, etc.). Méthodologie détaillée sur <Link href="/methode" className="underline">/methode</Link>.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm font-semibold text-emerald-800">
              {ownerWins.length > 0 ? `Vous gagnez sur ${ownerWins.length} critère${ownerWins.length > 1 ? "s" : ""}` : "Pas de gain net ≥ 0,4 pt"}
            </div>
            <ul className="mt-3 space-y-2">
              {ownerWins.map((s) => (
                <li key={s.key} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-primary)]">{s.label}</span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${scoreColor(s.value).split(" ").slice(0, 2).join(" ")}`}>
                    {s.value.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-semibold text-red-800">
              {ownerLosses.length > 0 ? `Vous perdez sur ${ownerLosses.length} critère${ownerLosses.length > 1 ? "s" : ""}` : "Pas de perte nette ≥ 0,4 pt"}
            </div>
            <ul className="mt-3 space-y-2">
              {ownerLosses.map((s) => (
                <li key={s.key} className="flex items-center justify-between text-sm">
                  <span className="text-[var(--text-primary)]">{s.label}</span>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${scoreColor(s.value).split(" ").slice(0, 2).join(" ")}`}>
                    {s.value.toFixed(1)}/10
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Verdict */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Verdict — pour qui le move a du sens</h2>
        <Card className="mt-3 p-5">
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            {monthlySavings != null && monthlySavings > 150 && (
              <li>
                ✅ <strong>Vous cherchez du reste-à-vivre.</strong> Vous récupérez{" "}
                {Math.round(monthlySavings)} €/mois sur les charges fixes — équivalent à une augmentation
                nette d&apos;environ {Math.round(monthlySavings * 1.2)} € à {origin.name} (cotisations + IR).
              </li>
            )}
            {monthlySavings != null && monthlySavings < -150 && (
              <li>
                ⚠️ <strong>Vous payez plus cher pour vivre à {destination.name}.</strong> +{Math.round(-monthlySavings)} €/mois.
                Le move ne se justifie que par la qualité de vie ou un changement de carrière.
              </li>
            )}
            {globalDelta >= 0.5 && (
              <li>
                ✅ <strong>Qualité de vie en hausse</strong> ({destination.scores.global}/10 vs {origin.scores.global}/10).
                Les owner scores confirment : {ownerWins.slice(0, 2).map((s) => s.label.toLowerCase()).join(", ") || "écarts modérés"}.
              </li>
            )}
            {globalDelta <= -0.5 && (
              <li>
                ⚠️ <strong>Qualité de vie en baisse</strong> ({destination.scores.global}/10 vs {origin.scores.global}/10).
                Vigilance : {ownerLosses.slice(0, 2).map((s) => s.label.toLowerCase()).join(", ") || "écarts modérés"}.
              </li>
            )}
            {ownerWins.find((s) => s.key === "score_teletravail") && (
              <li>✅ <strong>Profil télétravailleur :</strong> {destination.name} progresse sur fibre + cadre.</li>
            )}
            {ownerWins.find((s) => s.key === "score_famille") && (
              <li>✅ <strong>Profil familial :</strong> écoles + sécurité + nature mieux notées.</li>
            )}
            {ownerLosses.find((s) => s.key === "score_sans_voiture") && (
              <li>⚠️ <strong>Sans voiture :</strong> {destination.name} demande probablement une voiture, prévoir le budget mobilité.</li>
            )}
          </ul>

          <div className="mt-4 text-xs text-[var(--text-tertiary)]">
            Décision personnelle — chaque famille pondère ces critères différemment. Affinez avec{" "}
            <Link href="/quiz-compatibilite" className="underline">/quiz-compatibilite</Link> et{" "}
            <Link href={`/salaire-equivalent`} className="underline">/salaire-equivalent</Link>.
          </div>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Continuer l&apos;analyse</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href={`/villes/${destination.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Fiche ville</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{destination.name}</div>
            </Card>
          </Link>
          <Link href={`/calculateur-cout-reel/${destination.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Coût réel</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Calculateur {destination.name}</div>
            </Card>
          </Link>
          <Link href={`/comparer/${origin.slug}-vs-${destination.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Comparatif</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{origin.name} vs {destination.name}</div>
            </Card>
          </Link>
          <Link href="/salaire-equivalent" className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Salaire équivalent</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Reste-à-vivre inter-villes</div>
            </Card>
          </Link>
        </div>

        <div className="mt-10 text-xs text-[var(--text-tertiary)]">
          <Badge>Estimation</Badge> Scores propriétaires calculés à partir des {CITIES_COUNT} villes du site.
          Méthodologie détaillée sur <Link href="/methode" className="underline">/methode</Link>.
        </div>
      </section>

      <Footer />
    </main>
  );
}
