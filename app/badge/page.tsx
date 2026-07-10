import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  buildBadgeSpec,
  renderBadgeSvg,
  nationalRank,
  citiesCount,
  ordinal,
} from "@/lib/city-badge";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { ChevronRight } from "lucide-react";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Badge « Nᵉ ville de France » à embarquer sur votre site",
  description:
    "Badge libre et gratuit à intégrer sur votre site : classement de votre ville selon les 8 axes de qualité de vie de MaVilleIdeal. Copier-coller HTML, sans compte, sans tracker.",
  alternates: { canonical: "/badge" },
  openGraph: {
    title: "Badge Nᵉ ville de France — à embarquer",
    description:
      "Badge SVG libre pour mairies, offices de tourisme et agences immobilières. Classement 2026 · 540 villes.",
  },
};

const FEATURED_SLUGS = [
  "annecy",
  "bordeaux",
  "nantes",
  "rennes",
  "lyon",
  "toulouse",
  "montpellier",
  "strasbourg",
  "aix-en-provence",
  "grenoble",
  "la-rochelle",
  "dijon",
];

export default function BadgePage() {
  const total = citiesCount();
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Badge à embarquer", path: "/badge" },
  ]);

  const featured = FEATURED_SLUGS.flatMap((slug) => {
    const spec = buildBadgeSpec(slug, "compact");
    return spec ? [{ slug, spec, svg: renderBadgeSvg(spec) }] : [];
  });

  const showcase = buildBadgeSpec("annecy", "wide");
  const showcaseSvg = showcase ? renderBadgeSvg(showcase) : "";

  const topCities = [...CITIES_SEED]
    .sort((a, b) => b.scores.global - a.scores.global)
    .slice(0, 30);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />
      <AmbientBackground />

      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <span>Badge à embarquer</span>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Badge « Nᵉ ville de France » — libre à l&apos;embarquement
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Chaque ville du classement MaVilleIdeal dispose d&apos;un badge SVG
          gratuit, sans compte, sans tracker, prêt à coller. Il affiche le rang
          national de la ville sur {total} et son score global sur 10. Un lien
          retour vers la fiche complète est inclus — c&apos;est ce qui nous
          permet de garder l&apos;outil ouvert.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>SVG · sans dépendance</Badge>
          <Badge>Libre à l&apos;embarquement</Badge>
          <Badge>Classement 2026</Badge>
        </div>

        {showcaseSvg && (
          <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] p-8 flex justify-center">
            <div dangerouslySetInnerHTML={{ __html: showcaseSvg }} />
          </div>
        )}

        <Card className="mt-8">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Pour qui ?
          </h2>
          <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
            <li className="flex gap-3">
              <span className="text-[var(--accent)]">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Mairies et offices de tourisme</strong> —
                afficher le rang de la commune en pied de site ou sur la page
                « Vivre à… ». Aucune démarche préalable — le rang est calculé sur
                données publiques (INSEE, SSMSI, observatoires loyers).
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)]">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Agences immobilières</strong> —
                étayer un argumentaire de localisation avec un indice externe.
                Le score est calibré, pas déclaratif.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-[var(--accent)]">•</span>
              <span>
                <strong className="text-[var(--text-primary)]">Presse locale et blogs</strong> —
                habiller un article « Où vivre en France » avec une donnée
                citable et un rang comparatif.
              </span>
            </li>
          </ul>
        </Card>

        <Card className="mt-6">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Comment ça marche
          </h2>
          <ol className="space-y-3 text-sm text-[var(--text-secondary)] list-decimal list-inside">
            <li>
              Trouvez votre ville dans la liste ci-dessous (ou tapez son slug
              dans l&apos;URL : <code className="text-xs bg-[var(--bg-elevated)] px-1.5 py-0.5 rounded">/badge/lyon</code>).
            </li>
            <li>
              Choisissez le format (compact, large ou carré) et copiez le code
              HTML.
            </li>
            <li>
              Collez le code sur votre site — le badge s&apos;affiche
              instantanément. L&apos;image est inline (aucune requête externe),
              seul le lien vers la fiche ville est actif.
            </li>
          </ol>
          <p className="mt-4 text-xs text-[var(--text-tertiary)]">
            Le rang est recalculé à chaque mise à jour du seed (score global sur
            8 axes). Sauf changement éditorial majeur, il évolue de 1 à 3 places
            d&apos;une année sur l&apos;autre — cohérent pour un affichage
            durable.
          </p>
        </Card>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Aperçus — quelques villes populaires
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {featured.map(({ slug, spec, svg }) => (
              <Link
                key={slug}
                href={`/badge/${slug}`}
                className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40 hover:shadow-md transition-all p-3 group"
              >
                <div className="shrink-0 scale-90 origin-left" dangerouslySetInnerHTML={{ __html: svg }} />
                <ChevronRight className="h-4 w-4 ml-auto text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
                <span className="sr-only">Voir le badge de {spec.city.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Top 30 villes — leur badge
          </h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] divide-y divide-[var(--border)]">
            {topCities.map((city) => {
              const rank = nationalRank(city.slug);
              return (
                <Link
                  key={city.slug}
                  href={`/badge/${city.slug}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-canvas)] transition-colors group"
                >
                  <div className="flex items-baseline gap-3 min-w-0">
                    <span className="text-xs font-semibold text-[var(--text-tertiary)] w-10">
                      {rank ? ordinal(rank) : "—"}
                    </span>
                    <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      {city.name}
                    </span>
                    <span className="text-xs text-[var(--text-tertiary)] truncate">
                      {city.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                      {city.scores.global.toFixed(1)}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-[var(--accent)] transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">
            Toutes les villes du seed (540) ont leur badge. Cherchez la vôtre
            depuis <Link href="/villes" className="text-[var(--accent)] hover:underline">/villes</Link>
            {" "}puis remplacez <code className="text-[10px] bg-[var(--bg-elevated)] px-1 py-0.5 rounded">/villes</code>{" "}
            par <code className="text-[10px] bg-[var(--bg-elevated)] px-1 py-0.5 rounded">/badge</code> dans l&apos;URL.
          </p>
        </div>

        <Card className="mt-10">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">
            Licence et conditions
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Usage libre à condition de conserver le lien retour vers la fiche
            ville — c&apos;est notre seule contrepartie. Ne pas rogner le badge
            ni modifier le score affiché. Pas d&apos;affiliation, pas de
            tracker, pas de compte requis. Pour un usage presse ou commercial
            spécifique, contactez-nous via{" "}
            <Link href="/contact" className="text-[var(--accent)] hover:underline">
              /contact
            </Link>
            .
          </p>
        </Card>
      </section>

      <Footer />
    </main>
  );
}
