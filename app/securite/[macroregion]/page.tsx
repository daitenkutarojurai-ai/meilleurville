import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MACRO_REGIONS, MACRO_REGION_SLUGS, getMacroRegion } from "@/lib/macro-regions";
import { citiesInMacroRegion } from "@/lib/macro-regions-rankings";
import {
  computeSafetyDeep,
  SAFETY_LEVEL_LABEL,
  SAFETY_LEVEL_COLOR,
} from "@/lib/safety-deep";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ macroregion: string }> };

export function generateStaticParams() {
  return MACRO_REGION_SLUGS.map((slug) => ({ macroregion: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) return {};
  return {
    title: `Sécurité SSMSI · ${macro.label} 2026`,
    description: `Classement composite sécurité SSMSI (biens, personnes, nuit, VFFS) restreint aux villes de la macro-région ${macro.label}. Plus calmes vs. plus tendues.`,
    alternates: { canonical: `/securite/${macro.slug}` },
    openGraph: {
      title: `Sécurité SSMSI · ${macro.label}`,
      description: `Index composite par ville de la macro-région ${macro.label}.`,
    },
  };
}

const MIN_POP = 10_000;

export default async function MacroRegionSafetyPage({ params }: Props) {
  const { macroregion } = await params;
  const macro = getMacroRegion(macroregion);
  if (!macro) notFound();

  const cities = citiesInMacroRegion(macro)
    .filter((c) => (c.population ?? 0) >= MIN_POP)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      region: c.region,
      department: c.department,
      safety: computeSafetyDeep(c),
    }));

  // 10 = pire → tri ascendant pour les plus calmes.
  const calmest = [...cities].sort((a, b) => a.safety.composite - b.safety.composite).slice(0, 15);
  const stressed = [...cities].sort((a, b) => b.safety.composite - a.safety.composite).slice(0, 10);

  const n = cities.length || 1;
  const avgComposite = Math.round((cities.reduce((s, c) => s + c.safety.composite, 0) / n) * 10) / 10;
  const avgProperty = Math.round((cities.reduce((s, c) => s + c.safety.property.score, 0) / n) * 10) / 10;
  const avgPersons = Math.round((cities.reduce((s, c) => s + c.safety.persons.score, 0) / n) * 10) / 10;
  const avgNoct = Math.round((cities.reduce((s, c) => s + c.safety.nocturnal.score, 0) / n) * 10) / 10;
  const avgVffs = Math.round((cities.reduce((s, c) => s + c.safety.vffs.score, 0) / n) * 10) / 10;

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Sécurité SSMSI", path: "/securite" },
    { name: macro.label, path: `/securite/${macro.slug}` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelles sont les villes les plus calmes de ${macro.label} ?`,
      a:
        calmest.length > 0
          ? `Top 3 selon le composite (10 = pire) : ${calmest
              .slice(0, 3)
              .map((c) => `${c.name} (${c.safety.composite}/10)`)
              .join(", ")}.`
          : `Aucune ville de plus de 10 000 habitants n'est référencée pour cette macro-région.`,
    },
    {
      q: `Quel est le profil sécurité moyen sur ${macro.label} ?`,
      a: `Composite moyen ${avgComposite}/10 (10 = pire). Détail moyenne par dimension : atteintes biens ${avgProperty}/10, personnes ${avgPersons}/10, nuit ${avgNoct}/10, VFFS ${avgVffs}/10.`,
    },
    {
      q: `Comment ce classement est-il calculé ?`,
      a: `Composite pondéré sur 4 dimensions SSMSI : atteintes biens (35 %), personnes (30 %), nuit (20 %), VFFS (15 %). Sources : SSMSI (interstats.fr), Insee CVS, data.gouv.fr (taux pour 1 000 hab. par commune).`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/securite" className="hover:underline">Sécurité</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {macro.emoji} Sécurité SSMSI — {macro.label}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite restreint aux {cities.length} villes de la macro-région
          {" "}{macro.label} référencées de plus de 10 000 habitants. Quatre dimensions :
          atteintes biens, personnes, nuit, VFFS.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{cities.length} villes analysées</Badge>
          <Badge>Composite moyen : {avgComposite}/10</Badge>
        </div>

        {/* Macro-region aggregate */}
        <Card className="mt-6">
          <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold mb-3">
            Profil sécurité moyen de la macro-région
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { k: "Biens", v: avgProperty, hint: "Cambriolages + vols" },
              { k: "Personnes", v: avgPersons, hint: "Coups & blessures" },
              { k: "Nuit", v: avgNoct, hint: "Rixes & dégradations" },
              { k: "VFFS", v: avgVffs, hint: "Signalements SSMSI" },
            ].map((d) => (
              <div key={d.k} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-3">
                <div className="text-xs text-[var(--text-tertiary)]">{d.k}</div>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] mt-1">
                  {d.v.toFixed(1)}
                  <span className="text-xs font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
                </div>
                <div className="text-[11px] text-[var(--text-tertiary)] mt-1 leading-tight">{d.hint}</div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-3">
            Sous-scores : 10 = insécurité maximale (convention SSMSI / env, opposée du
            score safety historique du seed).
          </p>
        </Card>

        {/* Top calmest */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 15 — villes les plus calmes en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Biens</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Personnes</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Nuit</th>
                </tr>
              </thead>
              <tbody>
                {calmest.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/securite`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SAFETY_LEVEL_COLOR[c.safety.level]}`}>
                        {c.safety.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SAFETY_LEVEL_LABEL[c.safety.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.property.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.persons.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.safety.nocturnal.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Stressed */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 10 — villes les plus tendues en {macro.label}
        </h2>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Département</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Biens</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Personnes</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Nuit</th>
                </tr>
              </thead>
              <tbody>
                {stressed.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/securite`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.department}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.safety.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.property.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.safety.persons.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.safety.nocturnal.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Other macro-regions */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Autres macro-régions
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.filter((m) => m.slug !== macro.slug).map((m) => (
            <Link key={m.slug} href={`/securite/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Sécurité SSMSI</div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-sm">
          <Link href="/securite" className="text-[var(--accent)] hover:underline">
            → Voir le classement national sécurité complet
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
