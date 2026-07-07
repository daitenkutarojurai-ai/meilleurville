import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeCommerce,
  COMMERCE_LEVEL_LABEL,
  COMMERCE_LEVEL_COLOR,
  COMMERCE_LEVEL_BG,
  type CommerceDimension,
} from "@/lib/commerce";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

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
  const c = computeCommerce(city);
  return {
    title: `Commerces à ${city.name} · couverture, marchés, centre-ville`,
    description: `Couverture commerciale de ${city.name} (${city.department}) : offre ${COMMERCE_LEVEL_LABEL[c.coverage.level].toLowerCase()}, marchés & proximité, grandes surfaces, vitalité du centre-ville. Score ${c.composite.toFixed(1)}/10 (10 = excellent).`,
    alternates: { canonical: `/villes/${slug}/commerces` },
    openGraph: {
      title: `Commerces à ${city.name}`,
      description: `Couverture commerciale, marchés, grandes surfaces, centre-ville — synthèse dérivée du profil de la ville.`,
    },
  };
}

function CommerceBlock({ dim, label }: { dim: CommerceDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${COMMERCE_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${COMMERCE_LEVEL_COLOR[dim.level]}`}>
          {COMMERCE_LEVEL_LABEL[dim.level]}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {dim.score.toFixed(1)}
          <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{dim.reason}</p>
    </div>
  );
}

export default async function CommercesPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const c = computeCommerce(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Commerces", path: `/villes/${city.slug}/commerces` },
  ]);

  const faq = faqJsonLd([
    {
      q: `La couverture commerciale de ${city.name} est-elle bonne ?`,
      a: `${city.name} (${city.department}) affiche un score de couverture commerciale de ${c.composite.toFixed(1)}/10 (10 = excellent). Détail : couverture globale ${c.coverage.score.toFixed(1)}/10, proximité & marchés ${c.proximity.score.toFixed(1)}/10, grandes surfaces ${c.bigBox.score.toFixed(1)}/10, vitalité du centre-ville ${c.centreVille.score.toFixed(1)}/10. ${c.signature}`,
    },
    {
      q: `Y a-t-il des marchés à ${city.name} ?`,
      a: c.proximity.reason + ` Le nombre exact de commerces alimentaires par commune est publié chaque année par l'INSEE dans la Base permanente des équipements (BPE).`,
    },
    {
      q: `Le centre-ville de ${city.name} est-il vivant ?`,
      a: c.centreVille.reason + ` Le taux de vacance commerciale des centres-villes est suivi par Procos et par le programme Action Cœur de Ville (ANCT).`,
    },
    {
      q: `Où trouver les chiffres officiels des commerces de ${city.name} ?`,
      a: `L'INSEE publie la Base permanente des équipements (BPE) avec le décompte des commerces par commune (alimentaire, non-alimentaire, services). Les CCI et Procos publient les taux de vacance commerciale.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Commerces à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse de la couverture commerciale locale : densité et diversité de
          l&apos;offre, marchés et commerce de proximité, grandes surfaces
          périphériques, et vitalité du centre-ville. Sources de référence :{" "}
          <a
            href="https://www.insee.fr/fr/metadonnees/source/serie/s1161"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            INSEE BPE
          </a>{" "}
          · Procos · Action Cœur de Ville.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>INSEE BPE · Procos</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${COMMERCE_LEVEL_BG[c.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score de couverture commerciale</h2>
            <span className={`text-xs font-bold uppercase ${COMMERCE_LEVEL_COLOR[c.level]}`}>
              Offre {COMMERCE_LEVEL_LABEL[c.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {c.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">10 = couverture dense et diversifiée · 0 = désert commercial.</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{c.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CommerceBlock dim={c.coverage} label="Couverture & diversité" />
          <CommerceBlock dim={c.proximity} label="Marchés & proximité" />
          <CommerceBlock dim={c.bigBox} label="Grandes surfaces" />
          <CommerceBlock dim={c.centreVille} label="Vitalité du centre-ville" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Couverture &amp; diversité (35 %) :</strong>{" "}
              densité de l&apos;offre commerciale, corrélée avant tout à la taille de
              l&apos;aire de chalandise (population), ajustée par le caractère de la ville
              (métropole, préfecture, dynamisme).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Marchés &amp; proximité (25 %) :</strong>{" "}
              tissu d&apos;indépendants et de commerces de bouche, marchés réguliers,
              gastronomie. Un centre patrimonial et touristique soutient fortement ce volet.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Grandes surfaces (15 %) :</strong>{" "}
              présence de pôles de grande distribution et de zones commerciales
              périphériques (hyper, retail parks, bricolage, ameublement).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Vitalité du centre-ville (25 %) :</strong>{" "}
              proxy de la vacance commerciale. Les villes moyennes (20-60 k hab.) sans
              atout patrimonial ou touristique sont les plus exposées à la dévitalisation
              (cible du programme Action Cœur de Ville).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score dérivé du profil de la ville (population, caractère, qualité de vie et
            offre culturelle), pas d&apos;un décompte terrain. Pour le nombre exact de
            commerces par commune, consulter la Base permanente des équipements (BPE) de
            l&apos;INSEE ; pour la vacance des centres-villes, les publications Procos.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/a-faire`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🎯</span><span>À faire &amp; voir</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Activités, sorties, culture</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/transports`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🚉</span><span>Transports</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Trajets, gares, autoroutes</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/emploi`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>💼</span><span>Marché du travail</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Chômage, salaires, dynamisme</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/demographie`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>👥</span><span>Démographie</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Vieillissement, trajectoire</div>
            </Card>
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/commerces"
            className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
          >
            📊 Palmarès national couverture commerciale
          </Link>
          <Link
            href={`/villes/${city.slug}`}
            className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
          >
            ← Profil de {city.name}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
