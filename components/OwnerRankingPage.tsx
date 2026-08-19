import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  OWNER_RANKINGS,
  ownerRankingHead,
  rankByOwnerScore,
  type OwnerRankingDef,
} from "@/lib/owner-rankings";
import { ownerScoreColor } from "@/lib/owner-scores";
import { CITIES_COUNT } from "@/lib/site-stats";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export function OwnerRankingPage({ ranking }: { ranking: OwnerRankingDef }) {
  const result = rankByOwnerScore(ranking.scoreKey, 50);
  const head = ownerRankingHead(result, 10);
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Classements", path: "/classements" },
    { name: ranking.label, path: `/classements/${ranking.slug}` },
  ]);
  const otherRankings = OWNER_RANKINGS.filter((r) => r.slug !== ranking.slug);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: ranking.metaTitle,
            description: ranking.metaDescription,
            // Un balisage ordonné là où le score ne départage pas serait un
            // classement fabriqué en données structurées.
            itemListOrder: head.ordered
              ? "https://schema.org/ItemListOrderDescending"
              : "https://schema.org/ItemListUnordered",
            numberOfItems: result.published,
            itemListElement: head.cities.map((city, i) => ({
              "@type": "ListItem",
              ...(head.ordered ? { position: i + 1 } : {}),
              name: city.name,
              url: `${BASE_URL}/villes/${city.slug}`,
            })),
          }),
        }}
      />
      <Navbar />

      {/* Header */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">
            <Link href="/classements" className="hover:underline">
              ← Classements
            </Link>
          </Badge>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl" aria-hidden>
              {ranking.emoji}
            </span>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
              {ranking.label}
            </h1>
          </div>
          <p className="text-[var(--text-secondary)] leading-relaxed">{ranking.intro}</p>
          <p className="text-[11px] text-[var(--text-tertiary)] mt-2">
            <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-700 px-1.5 py-0.5 text-[10px] uppercase tracking-wider mr-2">
              Estimation
            </span>
            Score dérivé des données du site,{" "}
            {result.pool === CITIES_COUNT
              ? `calculé sur les ${CITIES_COUNT} villes`
              : `classé sur ${result.pool} villes des ${CITIES_COUNT}`}{" "}
            — voir la{" "}
            <Link href="/methode" className="underline">
              méthodologie détaillée
            </Link>
            .
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Classement, par paliers d'ex æquo */}
        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
            {result.firstTierOverflows
              ? `Meilleure note — ${ranking.label}`
              : `Les ${result.published} premières villes — ${ranking.label}`}
          </h2>

          {result.firstTierOverflows ? (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              <strong>Ce score ne départage pas.</strong> {result.tiers[0]?.cities.length} villes
              partagent la meilleure note ({result.tiers[0]?.score.toFixed(1)}/10) : elles sont
              listées par ordre alphabétique, sans rang. Leur donner un numéro d&apos;ordre
              reviendrait à publier l&apos;ordre de notre fichier de données comme s&apos;il
              mesurait quelque chose.
            </p>
          ) : (
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
              Les villes à égalité partagent le même rang — c&apos;est le cas de la plupart
              d&apos;entre elles, le score n&apos;ayant qu&apos;une décimale.
            </p>
          )}

          {result.excluded > 0 && (
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mb-4">
              {result.excluded} des {CITIES_COUNT} villes du site ne sont pas classées : faute de
              valeur propre à leur département, elles portent un repli national identique pour
              toutes. Les trier reviendrait à trier une constante. Leur score reste affiché sur
              leur fiche, avec sa provenance.
            </p>
          )}

          <ol className="space-y-1.5">
            {result.tiers.map((tier) =>
              tier.cities.length === 1 ? (
                <li key={tier.score}>
                  <Link
                    href={`/villes/${tier.cities[0].slug}`}
                    className="flex items-baseline justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 hover:border-[var(--accent)]/40 hover:shadow-sm transition-all"
                  >
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                        #{tier.rank}
                      </span>
                      <span className="font-semibold text-[var(--text-primary)] truncate">
                        {tier.cities[0].name}
                      </span>
                      <span className="text-xs text-[var(--text-tertiary)] truncate">
                        {tier.cities[0].region}
                      </span>
                    </span>
                    <span
                      className={`font-mono-data font-bold ${ownerScoreColor(tier.score)} flex-shrink-0`}
                    >
                      {tier.score.toFixed(1)}
                      <span className="text-xs text-[var(--text-tertiary)]"> /10</span>
                    </span>
                  </Link>
                </li>
              ) : (
                <li
                  key={tier.score}
                  className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3"
                >
                  <p className="flex items-baseline justify-between gap-3 mb-2">
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span className="font-mono-data text-sm text-[var(--text-tertiary)] w-8 flex-shrink-0">
                        #{tier.rank}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        {tier.cities.length} villes ex æquo
                      </span>
                    </span>
                    <span
                      className={`font-mono-data font-bold ${ownerScoreColor(tier.score)} flex-shrink-0`}
                    >
                      {tier.score.toFixed(1)}
                      <span className="text-xs text-[var(--text-tertiary)]"> /10</span>
                    </span>
                  </p>
                  <p className="pl-11 text-sm leading-relaxed">
                    {tier.cities.map((city, i) => (
                      <span key={city.slug}>
                        {i > 0 && <span className="text-[var(--text-tertiary)]"> · </span>}
                        <Link
                          href={`/villes/${city.slug}`}
                          className="text-[var(--text-primary)] hover:text-[var(--accent)] hover:underline"
                        >
                          {city.name}
                        </Link>
                      </span>
                    ))}
                  </p>
                </li>
              )
            )}
          </ol>

          {result.nextTier && (
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed mt-4">
              Le classement s&apos;arrête ici : les {result.nextTier.count} villes suivantes sont
              toutes à {result.nextTier.score.toFixed(1)}/10, et rien dans nos données ne permet de
              les départager. En publier une partie serait choisir au hasard.
            </p>
          )}
        </section>

        {/* Methodology */}
        <Card>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
            Méthodologie
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {ranking.methodology}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Quand la source réelle (feeds officiels) remplacera le proxy v0, ce classement
            se recalcule automatiquement — seul `lib/owner-scores.ts` change.
          </p>
        </Card>

        {/* Other owner rankings */}
        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Autres classements propriétaires
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {otherRankings.map((r) => (
              <Link
                key={r.slug}
                href={`/classements/${r.slug}`}
                className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm hover:border-[var(--accent)]/40 transition-colors"
              >
                <span className="text-xl" aria-hidden>
                  {r.emoji}
                </span>
                <span className="text-[var(--text-primary)]">{r.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Voir aussi les{" "}
          <Link href="/classements" className="underline">
            classements officiels du site
          </Link>{" "}
          (basés sur les 8 axes du seed) ou le{" "}
          <Link href="/quiz-compatibilite" className="underline">
            quiz de compatibilité
          </Link>{" "}
          qui combine tous les scores.
        </p>
      </div>

      <Footer />
    </main>
  );
}
