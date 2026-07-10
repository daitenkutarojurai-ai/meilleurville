import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { BadgeEmbed } from "@/components/BadgeEmbed";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  BADGE_VARIANTS,
  VARIANT_LABEL,
  VARIANT_DESC,
  buildBadgeSpec,
  citiesCount,
  nationalRank,
  ordinal,
  renderBadgeSvg,
  renderEmbedHtml,
} from "@/lib/city-badge";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const rank = nationalRank(slug);
  const rankTxt = rank ? `${ordinal(rank)} sur ${citiesCount()}` : `sur ${citiesCount()}`;
  return {
    title: `Badge ${city.name} : ${rankTxt} — à embarquer`.slice(0, 60),
    description: `Badge « ${city.name} — ${rankTxt} villes de France » libre et gratuit, à intégrer sur votre site. Format compact, large ou carré. Score global ${city.scores.global.toFixed(1)}/10.`.slice(0, 160),
    alternates: { canonical: `/badge/${slug}` },
    openGraph: {
      title: `Badge ${city.name} — ${rankTxt}`,
      description: `Copier-coller HTML pour afficher le rang de ${city.name} sur votre site.`,
    },
  };
}

export default async function BadgePerCityPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const rank = nationalRank(slug);
  if (rank === null) notFound();

  const total = citiesCount();

  const variants = BADGE_VARIANTS.flatMap((v) => {
    const spec = buildBadgeSpec(slug, v);
    return spec ? [{ v, spec, svg: renderBadgeSvg(spec), html: renderEmbedHtml(spec) }] : [];
  });

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Badge à embarquer", path: "/badge" },
    { name: city.name, path: `/badge/${slug}` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <AmbientBackground />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/badge" className="hover:underline">Badge</Link> ·{" "}
          <span>{city.name}</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Badge {city.name} — {ordinal(rank)} ville de France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Selon le classement MaVilleIdeal 2026, <strong>{city.name}</strong>{" "}
          ({city.department}) occupe la <strong>{ordinal(rank)} place</strong>{" "}
          sur {total} villes analysées, avec un score global de{" "}
          <strong className="tabular-nums">{city.scores.global.toFixed(1)}/10</strong>.
          Le badge ci-dessous reprend ces données ; copiez-collez-le sur votre
          site (mairie, office de tourisme, agence, blog local) — l&apos;image
          est un SVG autonome, sans requête externe.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Libre à l&apos;embarquement</Badge>
          <Badge>SVG · pas de tracker</Badge>
          <Badge>Lien retour requis</Badge>
        </div>

        <div className="mt-8 space-y-10">
          {variants.map(({ v, svg, html }) => (
            <section key={v} className="space-y-3">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {VARIANT_LABEL[v]}
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  {VARIANT_DESC[v]}
                </p>
              </div>
              <BadgeEmbed html={html} preview={svg} label={VARIANT_LABEL[v]} />
            </section>
          ))}
        </div>

        <Card className="mt-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Ce que le badge indique
          </h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>
              <strong className="text-[var(--text-primary)]">Rang national</strong> —{" "}
              {ordinal(rank)} sur {total} villes du seed (métropole + DROM), triées par
              score global.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Score global</strong> —{" "}
              {city.scores.global.toFixed(1)}/10, moyenne pondérée sur 8 axes
              (qualité de vie, transport, nature, coût, sécurité, culture,
              télétravail, écoles) avec pénalité sur le pire axe.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sources</strong> — INSEE,
              SSMSI (sécurité), observatoires loyers, ADEME (climat).
              Méthodologie détaillée sur{" "}
              <Link href="/methode" className="text-[var(--accent)] hover:underline">
                /methode
              </Link>.
            </li>
          </ul>
        </Card>

        <Card className="mt-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Précisions d&apos;usage
          </h2>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>
              Le rang est mis à jour au fur et à mesure des recalibrations
              éditoriales du seed. Un changement de ±1 à 3 places d&apos;une
              année sur l&apos;autre est normal ; le badge reflète toujours
              l&apos;état courant du classement (les valeurs sont recalculées
              au build du site).
            </li>
            <li>
              Le classement porte sur les 540 villes couvertes par
              MaVilleIdeal — pas toutes les communes de France. Une ville
              15ᵉ ici n&apos;est pas 15ᵉ sur les 34 000 communes du pays ;
              c&apos;est 15ᵉ sur un échantillon représentatif des villes de
              plus de 10 000 habitants + un noyau de préfectures.
            </li>
            <li>
              Merci de conserver le lien retour vers la fiche ville — c&apos;est
              ce qui nous permet de financer l&apos;outil et de le laisser
              gratuit.
            </li>
          </ul>
        </Card>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={`/villes/${city.slug}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity px-4 py-2 text-sm font-semibold"
          >
            Voir la fiche complète de {city.name}
          </Link>
          <Link
            href="/badge"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)]/40 transition-colors px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
          >
            Autres badges disponibles
          </Link>
        </div>

        <div className="mt-10">
          <DiscussionCTA citySlug={city.slug} cityName={city.name} locale="fr" />
        </div>
      </section>

      <Footer />
    </main>
  );
}
