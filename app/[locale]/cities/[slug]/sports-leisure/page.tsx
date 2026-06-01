import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeSportLeisure,
  type SportDimension,
  type SportLevel,
} from "@/lib/sport-leisure";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

const LEVEL_EN: Record<SportLevel, string> = {
  excellent: "Excellent",
  bon: "Good",
  moyen: "Average",
  "limité": "Limited",
};

const LEVEL_BG: Record<SportLevel, string> = {
  excellent: "bg-emerald-50 border-emerald-200",
  bon: "bg-green-50 border-green-200",
  moyen: "bg-amber-50 border-amber-200",
  "limité": "bg-red-50 border-red-200",
};

const HERO_VERDICT: Record<SportLevel, string> = {
  excellent:
    "Outstanding ground for sport — strong municipal facilities, a real outdoor playground, an active club scene and a climate that lets you play almost year-round.",
  bon: "Good ground for sport — the basics are covered, the surrounding area gives you somewhere to train outside and most disciplines find a club.",
  moyen:
    "Average ground for sport — workable for the committed, but expect gaps (older pools, a thin club tissue, or weather that complicates outdoor seasons).",
  "limité":
    "Limited ground for sport — facilities are scarce, the outdoor playground is thin or the climate eats into the season. Sport is doable but takes effort.",
};

function signatureEn(s: ReturnType<typeof computeSportLeisure>, name: string): string {
  const dims: { k: string; d: SportDimension }[] = [
    { k: "facilities", d: s.facilities },
    { k: "outdoor playground", d: s.outdoor },
    { k: "club scene", d: s.clubs },
    { k: "climate", d: s.climate },
  ];
  const goods = dims.filter((x) => x.d.level === "excellent" || x.d.level === "bon");
  const bads = dims.filter((x) => x.d.level === "limité");
  if (s.level === "excellent") {
    const top = dims.sort((a, b) => b.d.score - a.d.score)[0];
    return `${name} is a top-tier city for everyday sport — best dimension: ${top.k} (${top.d.score}/10).`;
  }
  if (s.level === "bon") {
    return `${name} is comfortable for sport — ${goods.length} of 4 dimensions clearly favourable.`;
  }
  if (s.level === "limité") {
    return `${name} stays demanding for regular practice — weakest point: ${bads[0].k} (${bads[0].d.score}/10).`;
  }
  return `${name} offers correct sport conditions without standing out on any of the four dimensions.`;
}

function SportBlock({ dim, label, hint }: { dim: SportDimension; label: string; hint: string }) {
  const score = Math.round(dim.score * 10) / 10;
  return (
    <div className={`rounded-2xl border p-4 ${LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${scoreColor(score)}`}>
          {LEVEL_EN[dim.level]}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className={`text-2xl font-bold tabular-nums ${scoreColor(score)}`}>
          {score.toFixed(1)}
          <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{hint}</p>
    </div>
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) return {};
  const s = computeSportLeisure(c);
  return {
    title: `Sport & leisure in ${c.name} — facilities, outdoor, clubs (2026)`,
    description: `How sport-friendly is ${c.name}? Municipal facilities, outdoor playground, club scene and year-round climate. Composite ${s.composite}/10 (${LEVEL_EN[s.level].toLowerCase()}).`,
    alternates: { canonical: `${EN_BASE}/cities/${slug}/sports-leisure` },
    openGraph: {
      title: `Sport & leisure in ${c.name}`,
      description: `Facilities, outdoor, clubs and climate — a pedagogical synthesis.`,
    },
  };
}

export default async function EnCitySports({ params }: Props) {
  const { slug } = await params;
  const c = CITIES_SEED.find((x) => x.slug === slug);
  if (!c) notFound();

  const s = computeSportLeisure(c);
  const composite = Math.round(s.composite * 10) / 10;
  const signature = signatureEn(s, c.name);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Cities", path: "/cities" },
    { name: c.name, path: `/cities/${c.slug}` },
    { name: "Sport & leisure", path: `/cities/${c.slug}/sports-leisure` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Is ${c.name} a good place to do sport?`,
      a: `${c.name} scores ${composite}/10 (${LEVEL_EN[s.level].toLowerCase()}). Breakdown: facilities ${s.facilities.score}/10, outdoor playground ${s.outdoor.score}/10, club scene ${s.clubs.score}/10, climate ${s.climate.score}/10. ${signature}`,
    },
    {
      q: `Where can I find the municipal sports facilities in ${c.name}?`,
      a: `The French Sport Equipment Register (RES, data.gouv.fr / sports.gouv.fr) lists every public pool, stadium, indoor hall and multi-purpose court by commune. For elite training centres, see the CREPS network and INSEP in Vincennes.`,
    },
    {
      q: `Does ${c.name} have a strong outdoor playground?`,
      a: s.outdoor.reason,
    },
    {
      q: `How do I find a sports club in ${c.name}?`,
      a: `The communal Maisons des Associations and the directories of the national federations (FFRandonnée for hiking, FFCT for cycling, FFEscalade for climbing, FFR for rugby, FFF for football, FFN for swimming…) list local clubs. The DRAJES (regional youth & sports authority) tracks officially registered structures.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-16 pb-6">
        <nav className="mb-6 text-sm text-[var(--text-secondary)]">
          <Link href="/" className="hover:text-[var(--accent)]">Home</Link>
          {" · "}
          <Link href="/cities" className="hover:text-[var(--accent)]">Cities</Link>
          {" · "}
          <Link href={`/cities/${slug}`} className="hover:text-[var(--accent)]">{c.name}</Link>
          {" · "}
          <span>Sport &amp; leisure</span>
        </nav>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-5xl" aria-hidden>🏋️</span>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Sport &amp; leisure in {c.name}
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
          Composite score:{" "}
          <span className={`font-mono-data font-bold ${scoreColor(composite)}`}>
            {composite.toFixed(1)}/10
          </span>{" "}
          ({LEVEL_EN[s.level]}). {HERO_VERDICT[s.level]}
        </p>
        <p className="text-sm text-[var(--text-tertiary)] mt-3">
          Sources:{" "}
          <a
            href="https://www.data.gouv.fr/fr/datasets/recensement-des-equipements-sportifs-espaces-et-sites-de-pratiques/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            RES INJEP
          </a>{" "}
          · sports.gouv.fr · CREPS · DRAJES · FFRandonnée.
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-2">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">The four dimensions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SportBlock
            dim={s.facilities}
            label="Facilities"
            hint="Public pools, stadiums, halls and elite centres"
          />
          <SportBlock
            dim={s.outdoor}
            label="Outdoor playground"
            hint="Mountains, coast, forest, lakes and rivers within reach"
          />
          <SportBlock
            dim={s.clubs}
            label="Club scene"
            hint="Density of the local club tissue and sporting identity"
          />
          <SportBlock
            dim={s.climate}
            label="Climate"
            hint="Weather you can actually train in across the year"
          />
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">How the score is built</h2>
        <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
          <li>
            <strong className="text-[var(--text-primary)]">Facilities (35%):</strong> proxy
            derived from the INJEP Sport Equipment Register (pools, stadiums, indoor halls,
            multi-purpose courts) correlated with population and metropolitan status. Bonus
            for elite centres (CREPS network, INSEP, national nautical bases, top alpine
            resorts).
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Outdoor playground (30%):</strong>{" "}
            sum of the natural training grounds within easy reach — mountains (Alps, Pyrenees,
            Massif Central, Vosges, Jura, Corsica), coastline (Channel, Atlantic,
            Mediterranean, overseas), major forests (Landes, Vosges, Sologne, Fontainebleau,
            Morvan), navigable lake or river.
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Club scene (20%):</strong> density
            of the local club tissue. Bonus for departments with a strong sporting identity
            (Basque Country, Auvergne-Rhône-Alpes, Brittany, PACA, rugby south-west) and
            student hubs. Malus for ultra-isolated rural Centre/East in demographic decline
            and the most stretched DROM (Mayotte, French Guiana).
          </li>
          <li>
            <strong className="text-[var(--text-primary)]">Climate (15%):</strong> annual
            sunshine, winter and summer temperature. Bonus for the Mediterranean arc and the
            southern Atlantic coast (near year-round outdoor season). Malus for heatwave
            summers (July mean &gt; 27 °C) and very cold winters (ice, snow).
          </li>
        </ul>
        <p className="text-xs text-[var(--text-tertiary)] mt-4">
          Score at the municipal scale. Your day-to-day experience depends on the neighbourhood
          (whether you live next to a sports complex or not) and the discipline. For the full
          equipment-by-equipment view, check{" "}
          <a
            href="https://equipements.sports.gouv.fr"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            equipements.sports.gouv.fr
          </a>{" "}
          (official map of sports facilities).
        </p>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Go deeper</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link
            href={`/cities/${c.slug}/cycling`}
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span aria-hidden>🚲</span><span>Cycling</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Network, terrain, safety, climate</div>
          </Link>
          <Link
            href={`/cities/${c.slug}/climate`}
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span aria-hidden>🌤️</span><span>Climate</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Monthly normals and seasonal feel</div>
          </Link>
          <Link
            href={`/cities/${c.slug}/synthesis`}
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span aria-hidden>🧬</span><span>8-axis synthesis</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Consolidated read of the city profile</div>
          </Link>
          <Link
            href={`/cities/${c.slug}`}
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 hover:shadow-md transition-all"
          >
            <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2">
              <span aria-hidden>↩️</span><span>Back to {c.name}</span>
            </div>
            <div className="text-xs text-[var(--text-tertiary)] mt-1">Full city profile</div>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
