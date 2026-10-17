import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Vote, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { allPoliticalLeans, getPoliticalLean } from "@/lib/political-lean";
import { BLOC_COLORS, BLOC_LABEL, BLOC_ORDER, CANDIDATE_BY_KEY, type Bloc, type CandidateKey } from "@/lib/political-lean-meta";
import { project2027 } from "@/lib/presidential-2027";
import { NATIONAL_2022_BLOCS, POLLS_2027 } from "@/data/presidential-2027-polls";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternatesEn } from "@/lib/i18n";

// EN twin of /villes/[slug]/presidentielle-2027. Same data, same projection,
// no French news feed (the sources are French-language press).

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.filter((c) => getPoliticalLean(c.slug)).map((c) => ({ locale: "en", slug: c.slug }));
}

const THE: Record<Bloc, string> = {
  gauche: "the left",
  centre: "the centre",
  droite: "the right",
  extreme_droite: "the far right",
};

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 1 });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  const lean = getPoliticalLean(slug);
  if (!city || !lean) return {};
  const p = project2027(lean.blocs);
  return {
    title: `2027 French election in ${city.name}: projection & 2022 vote`,
    description: `Who would lead in ${city.name} in the 2027 first round? Projection: ${THE[p.lead]} ${fmt(p.blocs[p.lead])}%. 2022 result, turnout and how the city compares nationally.`.slice(0, 160),
    alternates: cityAlternatesEn("2027-election", slug),
  };
}

function Bar({ blocs }: { blocs: Record<Bloc, number> }) {
  return (
    <div className="flex h-5 w-full gap-[2px] overflow-hidden rounded-full" aria-hidden>
      {BLOC_ORDER.filter((b) => blocs[b] > 0).map((b) => (
        <span key={b} style={{ width: `${blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }} />
      ))}
    </div>
  );
}

export default async function EnCity2027ElectionPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  const lean = getPoliticalLean(slug);
  if (!city || !lean) notFound();

  const p = project2027(lean.blocs);
  const cands = (Object.entries(lean.cands) as Array<[CandidateKey, number]>)
    .map(([key, pct]) => ({ key, pct }))
    .sort((a, b) => b.pct - a.pct);
  const nameBySlug = new Map(CITIES_SEED.map((c) => [c.slug, c]));
  const similar = allPoliticalLeans()
    .filter((o) => o.slug !== slug && nameBySlug.has(o.slug))
    .map((o) => ({
      slug: o.slug,
      d: Math.sqrt(BLOC_ORDER.reduce((s, b) => s + ((o.blocs[b] ?? 0) - (lean.blocs[b] ?? 0)) ** 2, 0)),
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 6);
  const topCandName = lean.topCand ? CANDIDATE_BY_KEY[lean.topCand].name : BLOC_LABEL.en[lean.lean];

  const faq = [
    {
      q: `Who would come first in ${city.name} in the 2027 presidential election?`,
      a: `In our mechanical projection, ${THE[p.lead]} would lead the first round in ${city.name} with ${fmt(p.blocs[p.lead])}%, ${fmt(p.margin)} points ahead of ${THE[p.second]}. It is the city's 2022 vote shifted like the latest ${POLLS_2027.length} national polls, not a local poll.`,
    },
    {
      q: `Who won ${city.name} in 2022?`,
      a: `In the 2022 first round, ${topCandName} came first in ${city.name} with ${fmt(lean.topCandPct)}% of valid votes (French Ministry of the Interior). Abstention was ${fmt(lean.turnout.abstentionPct)}%.`,
    },
    {
      q: "When is the 2027 French presidential election?",
      a: "The first round is on Sunday 18 April 2027 and the run-off on Sunday 2 May 2027 (one day earlier in the French Caribbean, French Guiana and some overseas territories).",
    },
  ];
  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: city.name, path: `/cities/${city.slug}` },
    { name: "2027 election", path: `/cities/${city.slug}/2027-election` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(faq))} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <nav className="text-xs text-[var(--text-tertiary)]" aria-label="Breadcrumb">
              <Link href="/cities" className="hover:underline">Cities</Link> /{" "}
              <Link href={`/cities/${city.slug}`} className="hover:underline">{city.name}</Link> / 2027 election
            </nav>
            <div className="mt-6 flex items-start gap-3">
              <span className="plaque shrink-0 !p-2.5" aria-hidden>
                <Vote className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">2027 presidential election in {city.name}</h1>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">First-round projection and the real 2022 result · {city.department}</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">
          <section aria-labelledby="projection" className="rounded-3xl border border-[var(--accent)]/25 bg-[var(--bg-surface)] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">2027 projection</p>
            <h2 id="projection" className="mt-1 text-xl font-bold text-[var(--text-primary)]">
              <span style={{ color: BLOC_COLORS[p.lead] }}>{BLOC_LABEL.en[p.lead]}</span> ahead, {fmt(p.blocs[p.lead])}%
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {p.close ? "Close race: " : ""}
              {fmt(p.margin)} points ahead of {THE[p.second]}.
            </p>
            <div className="mt-4">
              <Bar blocs={p.blocs} />
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {[...BLOC_ORDER].sort((a, b) => p.blocs[b] - p.blocs[a]).map((b) => (
                <li key={b} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
                    {BLOC_LABEL.en[b]}
                  </span>
                  <span className="font-semibold tabular-nums text-[var(--text-primary)]">{fmt(p.blocs[b])}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-tertiary)]">
              Mechanical projection, not a local poll: each bloc&apos;s 2022 share in {city.name} is multiplied by its national
              change (average of {POLLS_2027.length} polls against the 2022 national result), then rescaled to 100. It assumes the
              city moves like the country.
            </p>
          </section>

          <section aria-labelledby="vote-2022">
            <h2 id="vote-2022" className="mb-1 text-xl font-bold text-[var(--text-primary)]">The real 2022 vote</h2>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              First round, 10 April 2022: {topCandName} first with {fmt(lean.topCandPct)}%.{" "}
              {lean.turnout.inscrits.toLocaleString("en-GB")} registered voters, {fmt(lean.turnout.abstentionPct)}% abstention.
            </p>
            <ol className="space-y-1.5">
              {cands.map(({ key, pct }, i) => {
                const c = CANDIDATE_BY_KEY[key];
                return (
                  <li key={key} className="grid grid-cols-[1.25rem_1fr_3.5rem] items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2">
                    <span className="text-right text-xs font-bold tabular-nums text-[var(--text-tertiary)]">{i + 1}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-[var(--text-primary)]">
                        {c.name} <span className="text-[11px] font-normal text-[var(--text-tertiary)]">{c.partyShort}</span>
                      </span>
                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[var(--bg-elevated)]">
                        <span className="block h-full rounded-full" style={{ width: `${Math.min(100, pct * 2.2)}%`, backgroundColor: c.color }} />
                      </span>
                    </span>
                    <span className="text-right text-sm font-bold tabular-nums text-[var(--text-primary)]">{fmt(pct)}%</span>
                  </li>
                );
              })}
            </ol>
            <ul className="mt-4 space-y-1.5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 text-sm">
              {BLOC_ORDER.map((b) => {
                const diff = (lean.blocs[b] ?? 0) - NATIONAL_2022_BLOCS[b];
                return (
                  <li key={b} className="flex items-center justify-between gap-2">
                    <span className="text-[var(--text-secondary)]">{BLOC_LABEL.en[b]}</span>
                    <span className="tabular-nums text-[var(--text-primary)]">
                      {fmt(lean.blocs[b] ?? 0)}% <span className="text-[var(--text-tertiary)]">vs {fmt(NATIONAL_2022_BLOCS[b])}% nationally</span>{" "}
                      <strong className="font-semibold">({diff >= 0 ? "+" : ""}{fmt(diff)})</strong>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
              Source: French Ministry of the Interior (results by commune) and Constitutional Council (national result).
              Residents&apos; vote, not the town hall&apos;s politics.
            </p>
          </section>

          <section aria-labelledby="similar">
            <h2 id="similar" className="mb-3 text-xl font-bold text-[var(--text-primary)]">Cities that voted most alike in 2022</h2>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {similar.map((s) => (
                <li key={s.slug}>
                  <Link href={`/cities/${s.slug}/2027-election`} className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/50">
                    <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">{nameBySlug.get(s.slug)!.name}</span>
                    <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm">
              <Link href="/political-leaning" className="font-medium text-[var(--accent)] hover:underline">
                Political leaning and 2027 projection for every city →
              </Link>
            </p>
          </section>

          <section aria-labelledby="faq">
            <h2 id="faq" className="mb-3 text-xl font-bold text-[var(--text-primary)]">FAQ</h2>
            <div className="space-y-2">
              {faq.map((f) => (
                <details key={f.q} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">{f.q}</summary>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <DiscussionCTA citySlug={city.slug} cityName={city.name} locale="en" />
        </div>
        <Footer />
      </main>
    </>
  );
}
