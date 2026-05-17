import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topSafest,
  topMostStressed,
  SAFETY_LEVEL_LABEL,
  SAFETY_LEVEL_COLOR,
} from "@/lib/safety-deep";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Sécurité en France — palmarès 2026 SSMSI villes calmes vs. tendues",
  description:
    "Classement national SSMSI des villes françaises selon la sécurité : atteintes biens, personnes, nuit, violences faites aux femmes. Top 30 villes calmes vs. top 20 les plus tendues. Sources SSMSI / Insee CVS.",
  alternates: { canonical: "/securite" },
  openGraph: {
    title: "Sécurité en France — palmarès 2026",
    description:
      "Top 30 villes les plus calmes vs. top 20 les plus tendues, décomposition SSMSI sur 4 sous-axes.",
  },
};

const MIN_POP = 15_000;

export default function SafetyHubPage() {
  const calmest = topSafest(30, MIN_POP);
  const stressed = topMostStressed(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Sécurité SSMSI", path: "/securite" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles sont les villes les plus calmes en France ?",
      a: `Selon notre composite F58 (atteintes biens 35 % + personnes 30 % + nuit 20 % + VFFS 15 %), les villes ≥ 15 000 hab. les plus calmes sont : ${calmest
        .slice(0, 5)
        .map((c) => `${c.name} (${c.safety.composite}/10)`)
        .join(", ")}. Score faible = composite SSMSI sous la moyenne nationale.`,
    },
    {
      q: "Quelles villes sont les plus tendues sur la sécurité ?",
      a: `Les villes ≥ 15 000 hab. au composite le plus élevé sont : ${stressed
        .slice(0, 5)
        .map((c) => `${c.name} (${c.safety.composite}/10)`)
        .join(", ")}. Elles cumulent généralement atteintes aux biens (vols, cambriolages) et atteintes aux personnes au-dessus de la moyenne SSMSI.`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Composite agrégeant 4 dimensions SSMSI : atteintes aux biens (35 %, cambriolages + vols véhicules + vols sans violence, moyenne nationale ~16,5 ‰), atteintes aux personnes (30 %, coups & blessures volontaires hors VFFS, moyenne ~4,3 ‰), sécurité nocturne (20 %, rixes & dégradations), violences faites aux femmes (15 %, signalements SSMSI). Score 0-10, 10 = pire.",
    },
    {
      q: "Où voir les chiffres SSMSI officiels ?",
      a: "Le SSMSI (interstats.fr) publie chaque mois les indicateurs nationaux. Les données ouvertes data.gouv.fr proposent le détail communal pour les villes ≥ 10 000 hab. L'enquête Cadre de Vie et Sécurité (Insee, 14 000 ménages/an) ajoute la victimation ressentie. Pour l'analyse fine, l'état 4001 des préfectures fournit le détail par circonscription.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Sécurité en France — détail SSMSI
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre dimensions SSMSI : atteintes aux biens,
          atteintes aux personnes, sécurité nocturne, violences faites aux femmes.
          Score 0-10, 10 = pire. Filtre 15 000 habitants minimum pour pertinence des
          indicateurs.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions · 540 villes</Badge>
          <Badge>Pondération biens 35 % · personnes 30 % · nuit 20 % · VFFS 15 %</Badge>
        </div>

        {/* Top safest */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes les plus calmes
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. au composite SSMSI le plus bas. Souvent : sous-préfectures
          tranquilles, villes moyennes hors zone urbaine dense, communes rurales structurées.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Biens</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Personnes</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Nuit</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">VFFS</th>
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
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
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
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.safety.vffs.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture des sous-scores : 10 = insécurité maximale.
        </p>

        {/* Stressed */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes les plus tendues
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. cumulant atteintes biens + personnes au-dessus de la
          moyenne SSMSI. Majorité de métropoles tendues et anciens bassins industriels
          en reconversion.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
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
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
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

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Atteintes aux biens (35 %)</strong> —
              cambriolages, vols véhicules, vols sans violence. Concentrés sur métropoles
              tendues (Paris, PACA, IDF dense) et destinations touristiques.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Atteintes aux personnes (30 %)</strong> —
              coups & blessures volontaires hors VFFS. Surcote dans les anciens bassins
              industriels en reconversion et les départements à fort gradient social.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sécurité nocturne (20 %)</strong> —
              rixes, agressions, dégradations nocturnes. Concentré sur centres festifs,
              villes étudiantes, métropoles avec vie nocturne dense.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">VFFS (15 %)</strong> —
              signalements de violences faites aux femmes (SSMSI). À interpréter avec
              prudence : un taux plus élevé peut refléter un meilleur dispositif de
              signalement plutôt qu&apos;une occurrence pure.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Synthèse à l&apos;échelle communale. Au sein d&apos;une même ville, le
            ressenti varie fortement entre un quartier de gare et un quartier résidentiel
            apaisé. Pour l&apos;analyse fine, l&apos;état 4001 des préfectures détaille
            par circonscription de police ou gendarmerie.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Le profil sécurité varie fortement entre les côtes touristiques (cambriolages
          saisonniers) et l&apos;arc alpin résidentiel (composite très bas). Vue restreinte
          à chaque grande zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/securite/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top calmes + tendues</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Voir aussi
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/cadre-de-vie" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Cadre de vie</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Méga-index env + santé + emploi</div>
            </Card>
          </Link>
          <Link href="/classements/securite-nocturne" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌙</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Sécurité nocturne</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Classement dédié owner-score</div>
            </Card>
          </Link>
          <Link href="/red-flags" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🚩</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Red Flags</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">11 thèmes « ne pas y aller »</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
