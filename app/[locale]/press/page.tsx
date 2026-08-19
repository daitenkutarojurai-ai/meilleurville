import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Download, Newspaper, MapPin, BarChart3, Mail, Shield } from "lucide-react";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_SEED } from "@/data/cities-seed";
import { EN_GUIDES } from "@/data/guides-en";
import { CITIES_COUNT, RANKINGS_COUNT, DEPARTMENTS_COUNT } from "@/lib/site-stats";
import { ORIGIN_BY_LOCALE, pathAlternatesEn } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export function generateStaticParams() {
  return [{ locale: "en" }];
}

export const metadata: Metadata = {
  title: "Press room · French city data, free to reuse",
  description:
    "Journalists and institutions: the full ranking of French cities, per-city data and the method behind it. Free to reuse with attribution, CSV included.",
  alternates: {
    ...pathAlternatesEn("/presse", "/press"),
    languages: {
      fr: "https://www.mavilleideale.fr/presse",
      en: `${EN_BASE}/press`,
    },
  },
  openGraph: {
    // Sans `images`, un openGraph de page remplace celui hérité de la racine
    // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
    images: ["/opengraph-image"],
    title: "Press room · BestCitiesInFrance",
    description: `The full ranking of ${CITIES_COUNT} French cities, free to reuse with attribution.`,
  },
};

const pressBreadcrumb = breadcrumbJsonLd([
  { name: "Home", path: "/" },
  { name: "Press", path: "/press" },
]);

const TOP_CITIES = [...CITIES_SEED]
  .sort((a, b) => b.scores.global - a.scores.global)
  .slice(0, 10);

// Angles written for the English-language desk, not translated from the FR
// page. A French local paper wants "where does my town rank in its
// département"; an English-language outlet covering France is writing for
// people deciding whether to move there at all, so the angles are national,
// comparative, and anchored on what a foreign reader cannot look up alone.
const ANGLES = [
  {
    icon: MapPin,
    title: "The relocation angle: where Britons, Americans and Canadians actually land",
    desc: "Every city has a full profile — overall score, 8 criteria, neighbourhoods, climate, safety, rental pressure — plus cost-of-living and where-to-buy guides written for people arriving from abroad. Useful when the story is about a place your readers have heard of but cannot evaluate.",
  },
  {
    icon: BarChart3,
    title: "The data angle: rankings you can recut",
    desc: `${RANKINGS_COUNT} national rankings (families, remote work, safety, cost of living, 2040 climate projections) that can be recut by region or city size. The full CSV is below, ready for your graphics desk — one row per city, one column per criterion.`,
  },
  {
    icon: Newspaper,
    title: "The counter-cliché angle: the numbers behind Provence and the Dordogne",
    desc: "The English-language picture of France is a short list of postcard regions. The scores put figures on what those places cost, how they score on transport and healthcare access, and which cities nobody writes about outperform them. That is a story, and it is checkable.",
  },
];

export default function PressPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(pressBreadcrumb) }}
      />
      <AmbientBackground />
      <Navbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">
          Press &amp; institutions
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Our French city data, free to reuse
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
          BestCitiesInFrance scores {CITIES_COUNT} French cities on 8 criteria
          (safety, cost of living, transport, schools and four more), built from
          public data: Insee (the national statistics office), SSMSI (Interior
          Ministry crime statistics), Arcep (the telecoms regulator) and the
          regional rent observatories. {EN_GUIDES.length} English-language guides
          sit on top of the city profiles. No city pays for its rank —{" "}
          <Link href="/methodology" className="text-[var(--accent)] underline underline-offset-2">
            the method is published in full
          </Link>
          . Journalists and public bodies may reuse the figures, rankings and
          screenshots with attribution (&laquo; Source: bestcitiesinfrance.com &raquo;).
        </p>

        <div className="grid sm:grid-cols-4 gap-3 mb-12">
          {[
            [CITIES_COUNT, "cities scored"],
            [RANKINGS_COUNT, "rankings"],
            [DEPARTMENTS_COUNT, "départements"],
            [EN_GUIDES.length, "English guides"],
          ].map(([n, label]) => (
            <Card key={label as string} className="p-4 text-center">
              <div className="text-2xl font-extrabold text-[var(--accent)]">{n}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Three angles that work
        </h2>
        <div className="space-y-4 mb-12">
          {ANGLES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-5 flex gap-4">
              <Icon className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          The national top 10, 2026
        </h2>
        <Card className="p-5 mb-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">City</th>
                <th className="pb-2 pr-3">Département</th>
                <th className="pb-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CITIES.map((c, i) => (
                <tr key={c.slug} className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3 font-bold text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="py-2 pr-3 font-semibold">
                    <Link href={`/cities/${c.slug}`} className="text-[var(--accent)] hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-[var(--text-secondary)]">{c.department}</td>
                  <td className="py-2 text-right font-bold">{c.scores.global.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mb-6">
          A &laquo; département &raquo; is the administrative tier between the
          commune and the region — there are {DEPARTMENTS_COUNT} of them in our
          data, and French readers identify a town by its number.
        </p>

        <a
          href="/press/ranking-bestcitiesinfrance-2026.csv"
          download
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-3 text-sm hover:opacity-90 transition-opacity mb-12"
        >
          <Download className="h-4 w-4" />
          Download the full ranking ({CITIES_COUNT} cities, CSV)
        </a>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Reuse conditions
        </h2>
        <Card className="p-5 mb-12 flex gap-4">
          <Shield className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
            <p>
              Figures, rankings and screenshots are free to reuse for journalism
              or institutional work, crediting &laquo; Source:
              bestcitiesinfrance.com &raquo; (a link is appreciated online).
            </p>
            <p>
              The scores aggregate public data with a documented editorial
              calibration: they reflect a method, not an absolute truth —{" "}
              <Link href="/methodology" className="text-[var(--accent)] underline underline-offset-2">
                its limits are described here
              </Link>
              . The French edition of this ranking is published at{" "}
              <a
                href="https://www.mavilleideale.fr/presse"
                className="text-[var(--accent)] underline underline-offset-2"
              >
                mavilleideale.fr/presse
              </a>{" "}
              from the same data, so the two never disagree.
            </p>
          </div>
        </Card>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Contact</h2>
        <Card className="p-5 flex gap-4">
          <Mail className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              Press enquiries (custom data, interview, method questions): reply
              within 24 h through{" "}
              <Link href="/contact" className="text-[var(--accent)] underline underline-offset-2">
                the contact form
              </Link>
              . We can pull a custom ranking — one département, one region, one
              criterion — for your newsroom.
            </p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
