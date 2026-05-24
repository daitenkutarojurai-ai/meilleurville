import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QUITTER_PAIRS, buildQuitterPairData } from "@/lib/quitter-pairs";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { scoreColor } from "@/lib/utils";
import { CITIES_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; pair: string }> };

function enSlugToPair(slug: string): [string, string] | null {
  const parts = slug.split("-to-");
  if (parts.length !== 2) return null;
  return [parts[0], parts[1]];
}

export function generateStaticParams() {
  return QUITTER_PAIRS.map(([a, b]) => ({ locale: "en", pair: `${a}-to-${b}` }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pair } = await params;
  const parsed = enSlugToPair(pair);
  if (!parsed) return {};
  const data = buildQuitterPairData(parsed[0], parsed[1]);
  if (!data) return {};
  const { origin, destination, monthlySavings } = data;
  const savingsLabel =
    monthlySavings != null
      ? monthlySavings > 0
        ? ` Saves ${Math.round(monthlySavings)} €/month on fixed costs.`
        : ` Costs ${Math.round(-monthlySavings)} €/month more in fixed costs.`
      : "";
  return {
    title: `Moving from ${origin.name} to ${destination.name} · Honest comparison 2026`,
    description: `Moving from ${origin.name} to ${destination.name}: rent, fixed costs, quality-of-life scores, climate, and a verdict on who the move makes sense for.${savingsLabel}`,
    alternates: { canonical: `${EN_BASE}/moving-from/${pair}` },
    openGraph: {
      title: `Moving from ${origin.name} to ${destination.name}?`,
      description: `Monthly cost comparison, quality-of-life scores and profile verdict. Argued decision, no empty promises.`,
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

export default async function MovingFromPairPage({ params }: Props) {
  const { pair } = await params;
  const parsed = enSlugToPair(pair);
  if (!parsed) notFound();
  const data = buildQuitterPairData(parsed[0], parsed[1]);
  if (!data) notFound();

  const { origin, destination, originBreakdown, destinationBreakdown, monthlySavings, costRatio, ownerWins, ownerLosses, globalDelta } = data;
  const savingsAnnual = monthlySavings != null ? Math.round(monthlySavings * 12) : null;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Moving from a French city", path: "/moving-from" },
    { name: `${origin.name} → ${destination.name}`, path: `/moving-from/${pair}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Home</Link> ·{" "}
          <Link href="/moving-from" className="hover:underline">Moving from a French city</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Moving from <span className="underline decoration-amber-300">{origin.name}</span> to <span className="underline decoration-emerald-300">{destination.name}</span>?
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Factual comparison: what you gain (or lose) each month, on quality of life,
          and who this move genuinely makes sense for. No invented figures — everything
          is derived from our city dataset.
        </p>

        {/* Summary banner */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Fixed cost gap</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {monthlySavings != null ? (
                <span className={monthlySavings > 0 ? "text-emerald-700" : "text-red-700"}>
                  {monthlySavings > 0 ? "−" : "+"}{Math.abs(Math.round(monthlySavings))} €/mo
                </span>
              ) : (
                <span className="text-[var(--text-tertiary)]">—</span>
              )}
            </div>
            {savingsAnnual != null && (
              <div className="mt-1 text-xs text-[var(--text-tertiary)]">
                That&apos;s {savingsAnnual > 0 ? "−" : "+"}{Math.abs(savingsAnnual).toLocaleString("en-GB")} €/year
              </div>
            )}
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Relative cost</div>
            <div className="mt-1 text-2xl font-bold tabular-nums">
              {costRatio != null ? `${Math.round(costRatio * 100)} %` : "—"}
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              of {origin.name}&apos;s cost
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-xs uppercase tracking-wide text-[var(--text-tertiary)]">Quality-of-life delta</div>
            <div className={`mt-1 text-2xl font-bold tabular-nums ${globalDelta > 0 ? "text-emerald-700" : globalDelta < 0 ? "text-red-700" : "text-[var(--text-secondary)]"}`}>
              {globalDelta > 0 ? "+" : ""}{globalDelta} pts
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">
              {destination.name} {destination.scores.global}/10 vs {origin.name} {origin.scores.global}/10
            </div>
          </Card>
        </div>

        {/* Monthly cost table */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Monthly fixed costs</h2>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          Median 2-bedroom flat, heating by ADEME climate zone, car or transit, property tax
          (monthly equivalent), waste collection levy. Honest medians — your situation will vary.
          Sources: rent observatories, ADEME, France Assureurs, DGFiP.
        </p>
        <Card className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[440px]">
              <thead className="bg-[var(--bg-surface)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-right">{origin.name}</th>
                  <th className="px-3 py-2 text-right">{destination.name}</th>
                  <th className="px-3 py-2 text-right">Gap</th>
                </tr>
              </thead>
              <tbody>
                <CostRow label="2-bed rent" origin={originBreakdown?.rentT2 ?? null} destination={destinationBreakdown?.rentT2 ?? null} />
                <CostRow label="Heating" origin={originBreakdown?.heating ?? null} destination={destinationBreakdown?.heating ?? null} />
                <CostRow label="Mobility (car or transit)" origin={originBreakdown?.mobilityCost ?? null} destination={destinationBreakdown?.mobilityCost ?? null} />
                <CostRow label="Property tax" origin={originBreakdown?.taxeFonciere ?? null} destination={destinationBreakdown?.taxeFonciere ?? null} />
                <CostRow label="Waste levy" origin={originBreakdown?.teom ?? null} destination={destinationBreakdown?.teom ?? null} />
                <tr className="bg-[var(--bg-surface)] font-semibold">
                  <td className="px-3 py-2 text-sm">Total fixed costs</td>
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
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">What you gain · what you give up</h2>
        <p className="mt-1 text-xs text-[var(--text-tertiary)]">
          Gaps of 0.4 pts or more across 10 quality scores (heat resilience, quiet, social connection,
          safety, remote work, etc.). Full methodology at <Link href="/methodology" className="underline">/methodology</Link>.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4">
            <div className="text-sm font-semibold text-emerald-800">
              {ownerWins.length > 0 ? `You gain on ${ownerWins.length} criterion${ownerWins.length > 1 ? "a" : ""}` : "No net gain of 0.4 pts or more"}
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
              {ownerLosses.length > 0 ? `You lose on ${ownerLosses.length} criterion${ownerLosses.length > 1 ? "a" : ""}` : "No net loss of 0.4 pts or more"}
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
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Verdict — who this move makes sense for</h2>
        <Card className="mt-3 p-5">
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            {monthlySavings != null && monthlySavings > 150 && (
              <li>
                ✅ <strong>You want more disposable income.</strong> You recover{" "}
                {Math.round(monthlySavings)} €/month on fixed costs — equivalent to a net
                raise of around {Math.round(monthlySavings * 1.2)} € in {origin.name} (after
                social charges and income tax).
              </li>
            )}
            {monthlySavings != null && monthlySavings < -150 && (
              <li>
                ⚠️ <strong>You will pay more to live in {destination.name}.</strong> +{Math.round(-monthlySavings)} €/month.
                The move only makes sense for quality-of-life reasons or a career change.
              </li>
            )}
            {globalDelta >= 0.5 && (
              <li>
                ✅ <strong>Quality of life goes up</strong> ({destination.scores.global}/10 vs {origin.scores.global}/10).
                The scores confirm it: {ownerWins.slice(0, 2).map((s) => s.label.toLowerCase()).join(", ") || "modest gains across the board"}.
              </li>
            )}
            {globalDelta <= -0.5 && (
              <li>
                ⚠️ <strong>Quality of life goes down</strong> ({destination.scores.global}/10 vs {origin.scores.global}/10).
                Watch out for: {ownerLosses.slice(0, 2).map((s) => s.label.toLowerCase()).join(", ") || "modest drops across the board"}.
              </li>
            )}
            {ownerWins.find((s) => s.key === "score_teletravail") && (
              <li>✅ <strong>Remote workers:</strong> {destination.name} scores better on fibre coverage and work environment.</li>
            )}
            {ownerWins.find((s) => s.key === "score_famille") && (
              <li>✅ <strong>Families:</strong> schools, safety and green space all score higher.</li>
            )}
            {ownerLosses.find((s) => s.key === "score_sans_voiture") && (
              <li>⚠️ <strong>Car-free living:</strong> {destination.name} will likely require a car — budget for it.</li>
            )}
          </ul>

          <div className="mt-4 text-xs text-[var(--text-tertiary)]">
            Every household weighs these factors differently.{" "}
            <Link href="/quiz" className="underline">Take the lifestyle quiz</Link> to refine the picture.
          </div>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Keep exploring</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link href={`/cities/${destination.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">City profile</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{destination.name}</div>
            </Card>
          </Link>
          <Link href={`/compare/${origin.slug}-vs-${destination.slug}`} className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Side-by-side</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{origin.name} vs {destination.name}</div>
            </Card>
          </Link>
          <Link href="/city-match" className="block">
            <Card className="p-4 hover:shadow-md transition">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">City Match</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Find your ideal city</div>
            </Card>
          </Link>
        </div>

        <div className="mt-10 text-xs text-[var(--text-tertiary)]">
          <Badge>Estimate</Badge> Proprietary scores computed from {CITIES_COUNT} cities.
          Full methodology at <Link href="/methodology" className="underline">/methodology</Link>.
        </div>
      </section>

      <Footer />
    </main>
  );
}
