import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Vote, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { PoliticalNewsFeed } from "@/components/PoliticalNewsFeed";
import { ElectionCountdown } from "@/components/ElectionCountdown";
import { ShareLinks } from "@/components/ShareLinks";
import { CITIES_SEED } from "@/data/cities-seed";
import { allPoliticalLeans, getPoliticalLean } from "@/lib/political-lean";
import { BLOC_COLORS, BLOC_LABEL, BLOC_ORDER, CANDIDATE_BY_KEY, type Bloc, type CandidateKey } from "@/lib/political-lean-meta";
import { project2027, BLOC_FIGURES } from "@/lib/presidential-2027";
import { NATIONAL_2022_BLOCS, POLLS_2027 } from "@/data/presidential-2027-polls";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { clampMeta } from "@/lib/brand";
import { cityAlternates } from "@/lib/i18n";

// Page FR seule (pas de jumelle EN : `presidentielle-2027` n'est pas dans
// FR_TO_EN_CITY_SUB, donc aucun hreflang n'est émis — voulu). Une page par
// ville ayant un résultat 2022 au ministère de l'Intérieur.

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.filter((c) => getPoliticalLean(c.slug)).map((c) => ({ slug: c.slug }));
}

const THE: Record<Bloc, string> = {
  gauche: "la gauche",
  centre: "le centre",
  droite: "la droite",
  extreme_droite: "l'extrême droite",
};

const fmt = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 1 });

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  const lean = getPoliticalLean(slug);
  if (!city || !lean) return {};
  const p = project2027(lean.blocs);
  return {
    title: `Présidentielle 2027 à ${city.name} : projection et vote 2022`,
    description: clampMeta(
      `Qui arriverait en tête à ${city.name} au 1er tour 2027 ? Projection : ${THE[p.lead]} ${fmt(p.blocs[p.lead])} %. En 2022, ${lean.topCand ? CANDIDATE_BY_KEY[lean.topCand].name : BLOC_LABEL.fr[lean.lean]} en tête (${fmt(lean.topCandPct)} %), abstention ${fmt(lean.turnout.abstentionPct)} %.`,
    ),
    alternates: cityAlternates("presidentielle-2027", slug),
    openGraph: {
      images: ["/opengraph-image"],
      title: `Présidentielle 2027 à ${city.name}`,
      description: `Projection du 1er tour 2027 et résultats 2022 à ${city.name}.`,
    },
  };
}

function Bar({ blocs, tall }: { blocs: Record<Bloc, number>; tall?: boolean }) {
  return (
    <div className={`flex w-full gap-[2px] overflow-hidden rounded-full ${tall ? "h-5" : "h-3"}`} aria-hidden>
      {BLOC_ORDER.filter((b) => blocs[b] > 0).map((b) => (
        <span key={b} style={{ width: `${blocs[b]}%`, backgroundColor: BLOC_COLORS[b] }} />
      ))}
    </div>
  );
}

export default async function CityPresidentielle2027Page({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  const lean = getPoliticalLean(slug);
  if (!city || !lean) notFound();

  const p = project2027(lean.blocs);
  const cands = (Object.entries(lean.cands) as Array<[CandidateKey, number]>)
    .map(([key, pct]) => ({ key, pct }))
    .sort((a, b) => b.pct - a.pct);
  const nameBySlug = new Map(CITIES_SEED.map((c) => [c.slug, c]));

  // Villes au vote 2022 le plus proche (distance sur les quatre familles) :
  // un maillage qui a un sens, pas une liste alphabétique.
  const all = allPoliticalLeans();
  const similar = all
    .filter((o) => o.slug !== slug && nameBySlug.has(o.slug))
    .map((o) => ({
      slug: o.slug,
      d: Math.sqrt(BLOC_ORDER.reduce((s, b) => s + ((o.blocs[b] ?? 0) - (lean.blocs[b] ?? 0)) ** 2, 0)),
    }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 6);
  const sameDept = CITIES_SEED.filter((c) => c.department === city.department && c.slug !== slug && getPoliticalLean(c.slug))
    .sort((a, b) => b.population - a.population)
    .slice(0, 6);

  const ranked2027 = [...BLOC_ORDER].sort((a, b) => p.blocs[b] - p.blocs[a]);
  const topCandName = lean.topCand ? CANDIDATE_BY_KEY[lean.topCand].name : BLOC_LABEL.fr[lean.lean];

  const faq = [
    {
      q: `Qui arriverait en tête à ${city.name} à la présidentielle 2027 ?`,
      a: `Dans notre projection mécanique, ${THE[p.lead]} arriverait en tête du 1er tour à ${city.name} avec ${fmt(p.blocs[p.lead])} %, ${fmt(p.margin)} points devant ${THE[p.second]}. C'est le vote 2022 de la ville déplacé comme les ${POLLS_2027.length} derniers sondages nationaux, pas un sondage local.`,
    },
    {
      q: `Qui est arrivé en tête à ${city.name} en 2022 ?`,
      a: `Au 1er tour de la présidentielle 2022, ${topCandName} est arrivé en tête à ${city.name} avec ${fmt(lean.topCandPct)} % des suffrages exprimés (ministère de l'Intérieur). Par famille, ${THE[lean.lean]} totalisait ${fmt(lean.topPct)} %.`,
    },
    {
      q: `Quel était le taux d'abstention à ${city.name} ?`,
      a: `${fmt(lean.turnout.abstentionPct)} % des inscrits se sont abstenus au 1er tour 2022, sur ${lean.turnout.inscrits.toLocaleString("fr-FR")} inscrits. Les votes blancs et nuls représentaient ${fmt(lean.turnout.blancsNulsPct)} %.`,
    },
  ];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Présidentielle 2027", path: `/villes/${city.slug}/presidentielle-2027` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faqJsonLd(faq))} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Breadcrumbs
              items={[
                { label: "Villes", href: "/villes" },
                { label: city.name, href: `/villes/${city.slug}` },
                { label: "Présidentielle 2027" },
              ]}
            />
            <div className="mt-6 flex items-start gap-3">
              <span className="plaque shrink-0 !p-2.5" aria-hidden>
                <Vote className="h-6 w-6" />
              </span>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">Présidentielle 2027 à {city.name}</h1>
                <p className="mt-1 text-sm text-[var(--text-tertiary)]">
                  Projection du 1ᵉʳ tour et résultats réels de 2022 · {city.department}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">
          <section aria-labelledby="projection" className="rounded-3xl border border-[var(--accent)]/25 bg-[var(--bg-surface)] p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">Projection 2027</p>
            <h2 id="projection" className="mt-1 text-xl font-bold text-[var(--text-primary)]">
              <span style={{ color: BLOC_COLORS[p.lead] }}>{BLOC_LABEL.fr[p.lead]}</span> en tête, {fmt(p.blocs[p.lead])} %
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {p.close ? "Match serré : " : ""}
              {fmt(p.margin)} points devant {THE[p.second]}. Candidats testés pour la famille en tête : {BLOC_FIGURES[p.lead]}
            </p>
            <div className="mt-4">
              <Bar blocs={p.blocs} tall />
            </div>
            <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {ranked2027.map((b) => (
                <li key={b} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
                    {BLOC_LABEL.fr[b]}
                  </span>
                  <span className="font-semibold tabular-nums text-[var(--text-primary)]">
                    {fmt(p.blocs[b])} %
                    <span className="ml-1 text-[11px] font-normal text-[var(--text-tertiary)]">
                      ({p.blocs[b] - lean.blocs[b] >= 0 ? "+" : ""}
                      {fmt(p.blocs[b] - lean.blocs[b])})
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] leading-relaxed text-[var(--text-tertiary)]">
              Entre parenthèses : l&apos;écart avec 2022. Projection mécanique, pas un sondage local : le résultat communal
              2022 de chaque famille est multiplié par son évolution nationale (moyenne de {POLLS_2027.length} sondages
              rapportée au score national de 2022), puis ramené à 100. Elle suppose que {city.name} bouge comme le pays.{" "}
              <Link href="/presidentielle-2027#sondages" className="text-[var(--accent)] hover:underline">Voir les sondages</Link>
            </p>
            <div className="mt-4 border-t border-[var(--border)] pt-3">
              <ShareLinks
                path={`/villes/${city.slug}/presidentielle-2027`}
                text={`Présidentielle 2027 à ${city.name} : ${THE[p.lead]} en tête de la projection (${fmt(p.blocs[p.lead])} %).`}
                label="Partager la projection"
              />
            </div>
          </section>

          <section aria-labelledby="vote-2022">
            <h2 id="vote-2022" className="mb-1 text-xl font-bold text-[var(--text-primary)]">Le vote réel de 2022</h2>
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              1ᵉʳ tour du 10 avril 2022 : {topCandName} en tête avec {fmt(lean.topCandPct)} %.{" "}
              {lean.turnout.inscrits.toLocaleString("fr-FR")} inscrits, {fmt(lean.turnout.abstentionPct)} % d&apos;abstention,{" "}
              {fmt(lean.turnout.blancsNulsPct)} % de blancs et nuls.
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
                    <span className="text-right text-sm font-bold tabular-nums text-[var(--text-primary)]">{fmt(pct)} %</span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                {city.name} face au résultat national 2022
              </p>
              <ul className="space-y-1.5 text-sm">
                {BLOC_ORDER.map((b) => {
                  const diff = (lean.blocs[b] ?? 0) - NATIONAL_2022_BLOCS[b];
                  return (
                    <li key={b} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: BLOC_COLORS[b] }} />
                        {BLOC_LABEL.fr[b]}
                      </span>
                      <span className="tabular-nums text-[var(--text-primary)]">
                        {fmt(lean.blocs[b] ?? 0)} % <span className="text-[var(--text-tertiary)]">vs {fmt(NATIONAL_2022_BLOCS[b])} %</span>{" "}
                        <strong className="font-semibold">({diff >= 0 ? "+" : ""}{fmt(diff)})</strong>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-2 text-[11px] text-[var(--text-tertiary)]">
                Source : ministère de l&apos;Intérieur (résultats par commune, data.gouv.fr) et Conseil constitutionnel (résultat national).
                Vote des habitants, pas la couleur de la mairie.
              </p>
            </div>
          </section>

          <section aria-labelledby="calendrier">
            <h2 id="calendrier" className="mb-3 text-xl font-bold text-[var(--text-primary)]">Les dates à retenir</h2>
            <ElectionCountdown builtAt={Date.now()} />
            <p className="mt-2 text-xs text-[var(--text-secondary)]">
              Vous venez d&apos;emménager à {city.name} ? L&apos;inscription se fait dans votre nouvelle commune, en mairie ou sur service-public.fr.
            </p>
          </section>

          <PoliticalNewsFeed limit={4} citySlug={city.slug} cityName={city.name} title="Actualité politique" />

          <section aria-labelledby="comparer">
            <h2 id="comparer" className="mb-3 text-xl font-bold text-[var(--text-primary)]">Comparer avec d&apos;autres villes</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Le vote 2022 le plus proche</p>
                <ul className="space-y-1.5">
                  {similar.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/villes/${s.slug}/presidentielle-2027`} className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/50">
                        <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">{nameBySlug.get(s.slug)!.name}</span>
                        <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              {sameDept.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">Même département</p>
                  <ul className="space-y-1.5">
                    {sameDept.map((c) => (
                      <li key={c.slug}>
                        <Link href={`/villes/${c.slug}/presidentielle-2027`} className="group flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/50">
                          <span className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)]">{c.name}</span>
                          <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)]" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <p className="mt-3 text-sm">
              <Link href="/presidentielle-2027" className="font-medium text-[var(--accent)] hover:underline">
                Sondages, candidats et carte en relief de toute la France →
              </Link>
            </p>
          </section>

          <section aria-labelledby="faq">
            <h2 id="faq" className="mb-3 text-xl font-bold text-[var(--text-primary)]">Questions fréquentes</h2>
            <div className="space-y-2">
              {faq.map((f) => (
                <details key={f.q} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]">{f.q}</summary>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <DiscussionCTA citySlug={city.slug} cityName={city.name} />
        </div>
        <Footer />
      </main>
    </>
  );
}
