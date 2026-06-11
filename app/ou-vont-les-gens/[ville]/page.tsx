import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_LIGHT } from "@/lib/cities-light";
import { migrationFor, commonOriginSlugs } from "@/lib/people-like-you";
import { getProfile } from "@/lib/profile-pages";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { scoreColor } from "@/lib/utils";
import { MapPin, ArrowRight, Info, Sparkles, TrendingUp } from "lucide-react";

export const revalidate = false;
export const dynamicParams = false;

// Featured relocation profiles surfaced on the static per-origin page. The full
// 17-profile matrix stays on the interactive /people-like-you tool.
const FEATURED_PROFILE_SLUGS = [
  "familles-avec-enfants",
  "jeunes-actifs",
  "teletravailleurs",
  "retraites",
  "etudiants",
  "primo-accedants",
  "couple-sans-enfant",
  "freelances",
];

// Static origins = the biggest departure cities (most-searched "quitter X").
const ORIGIN_SLUGS = commonOriginSlugs(CITIES_LIGHT, 24);

type Props = { params: Promise<{ ville: string }> };

export function generateStaticParams() {
  return ORIGIN_SLUGS.map((ville) => ({ ville }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params;
  const city = CITIES_SEED.find((c) => c.slug === ville);
  if (!city) return {};
  return {
    title: `Quitter ${city.name} : où vont les gens comme vous ? · 2026`,
    description: `Vous envisagez de quitter ${city.name} ? Selon votre profil — famille, télétravailleur, jeune actif, retraité, étudiant, primo-accédant — voici les villes qui font mieux. Modèle estimatif transparent (scores officiels), pas du suivi.`,
    alternates: { canonical: `/ou-vont-les-gens/${city.slug}` },
    openGraph: {
      title: `Quitter ${city.name} : où va-t-on selon son profil ?`,
      description: `Les destinations qui font mieux que ${city.name}, profil par profil.`,
    },
  };
}

export default async function OuVontLesGensPage({ params }: Props) {
  const { ville } = await params;
  const origin = CITIES_SEED.find((c) => c.slug === ville);
  if (!origin) notFound();

  const sections = FEATURED_PROFILE_SLUGS.map((slug) => {
    const profile = getProfile(slug);
    const result = profile ? migrationFor(origin.slug, slug, CITIES_LIGHT, 4) : null;
    return profile && result ? { profile, result } : null;
  }).filter((x): x is NonNullable<typeof x> => x !== null);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "People like you", path: "/people-like-you" },
    { name: `Quitter ${origin.name}`, path: `/ou-vont-les-gens/${origin.slug}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden pt-12 pb-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:underline">Accueil</Link>
            <span className="mx-1">·</span>
            <Link href="/people-like-you" className="hover:underline">People like you</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">Quitter {origin.name}</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Quitter <span className="font-display italic gradient-text-anim">{origin.name}</span>,
            où va-t-on ?
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Selon votre profil de vie, voici les villes qui font nettement mieux que {origin.name}.
            Pour chaque profil, on calcule un score sur les axes qui comptent vraiment et on garde
            les destinations qui creusent l&apos;écart.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="warning">
              <Info className="inline h-3 w-3 mr-1" />
              Modèle estimatif — pas de suivi
            </Badge>
            <Link
              href="/people-like-you"
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent)] text-white font-semibold px-3 py-1 hover:bg-[var(--accent-hover)] transition-colors"
            >
              <Sparkles className="h-3 w-3" />
              Outil interactif (17 profils)
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-8 pb-10">
        {sections.map(({ profile, result }) => {
          const list = result.upgrades.length > 0 ? result.upgrades : result.laterals;
          const noUpgrade = result.upgrades.length === 0;
          return (
            <section key={profile.slug}>
              <div className="flex items-baseline gap-2 mb-1">
                <span aria-hidden className="text-xl">{profile.emoji}</span>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{profile.label}</h2>
                <span className="text-[11px] text-[var(--text-tertiary)] ml-auto">
                  {origin.name} : {result.origin.score.toFixed(1)}/100
                </span>
              </div>
              {noUpgrade ? (
                <p className="text-sm text-[var(--text-secondary)] mb-3 max-w-2xl leading-snug">
                  Sur ce profil, {origin.name} est déjà difficile à battre. Voici des villes
                  équivalentes pour changer de cadre sans rien perdre.
                </p>
              ) : null}
              <ol className="grid gap-2.5 sm:grid-cols-2">
                {list.map((m, i) => (
                  <li key={m.city.slug}>
                    <Link
                      href={`/villes/${m.city.slug}`}
                      className="group flex h-full items-center gap-3 rounded-xl border border-[var(--border)] bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg-elevated)]/40 ring-1 ring-black/[0.03] hover:border-[var(--accent)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all px-4 py-3"
                    >
                      <span className="text-xs font-bold font-mono-data text-[var(--text-tertiary)] w-4 shrink-0 text-right">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                            {m.city.name}
                          </span>
                          {!noUpgrade && (
                            <span className="text-[11px] font-bold font-mono-data text-emerald-600 shrink-0 inline-flex items-center gap-0.5">
                              <TrendingUp className="h-3 w-3" />+{m.delta.toFixed(1)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-snug truncate">
                          {m.reason}
                        </p>
                        <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {m.city.region}
                        </p>
                      </div>
                      <span className={`text-sm font-bold font-mono-data shrink-0 ${scoreColor(m.score / 10)}`}>
                        {m.score.toFixed(0)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      {/* Other origins */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 pb-8">
        <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Au départ d&apos;une autre ville</h2>
        <div className="flex flex-wrap gap-2">
          {ORIGIN_SLUGS.filter((s) => s !== origin.slug).map((slug) => {
            const c = CITIES_SEED.find((x) => x.slug === slug);
            if (!c) return null;
            return (
              <Link
                key={slug}
                href={`/ou-vont-les-gens/${slug}`}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)] transition-all"
              >
                {c.name}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Methodology / honesty */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card className="bg-[var(--bg-elevated)]/50">
          <h2 className="text-sm font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-[var(--accent)]" />
            Comment lire ces chiffres
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Ce ne sont <strong>pas</strong> des trajectoires de personnes réelles : nous n&apos;avons
            pas encore le volume de comptes nécessaire. C&apos;est un <strong>modèle estimatif</strong>{" "}
            — pour chaque profil, on note les villes sur les axes qui comptent vraiment (scores
            officiels Insee, SSMSI, DEPP…), et on garde celles qui dépassent {origin.name} d&apos;au
            moins un demi-point. Le « +X » est ce gain de score profil. Pour explorer librement les
            17 profils et toutes les villes de départ, utilisez l&apos;
            <Link href="/people-like-you" className="underline">outil interactif</Link>. Voir aussi
            les <Link href="/portraits-types" className="underline">portraits-types par ville</Link>.
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
