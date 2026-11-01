import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { GUIDES } from "@/data/guides";
import { GUIDE_CATEGORIES } from "@/lib/guide-categories";
import { hubTitle } from "@/lib/brand";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ categorie: string }> };

// Ce que chaque thématique répond, en une phrase. Écrit à la main plutôt que
// dérivé du label : une page qui répète « guides Budget & Coût » n'a rien dit.
const INTRO: Record<string, string> = {
  teletravail:
    "Choisir une ville quand le bureau ne décide plus. Débit réel, coworkings, coût au mètre carré, et ce que « télétravaillable » veut dire une fois qu'on y habite.",
  famille:
    "Écoles, santé, sécurité, budget logement à surface égale : ce qui compte quand on déménage à plusieurs et qu'on ne redéménagera pas avant longtemps.",
  budget:
    "Ce que vivre quelque part coûte vraiment — loyer, achat au mètre carré, charges, transport — plutôt que le prix affiché sur une annonce.",
  lifestyle:
    "Le quotidien plutôt que les chiffres : vivre sans voiture, être étudiant ici, prendre sa retraite là, ce qu'on gagne et ce qu'on perd.",
  region:
    "Vivre en région, région par région : ce que chacune offre, ce qu'elle coûte, et pour qui elle est un mauvais plan.",
  comparaison:
    "Deux villes face à face, sur les mêmes critères. Pour quand le choix est déjà réduit à deux et qu'il faut trancher.",
  tourisme:
    "Ce qu'il y a à faire et à voir, ville par ville. Utile en visite — et utile avant de s'installer, parce qu'on finit par y passer ses week-ends.",
};

function categoryFor(id: string) {
  return GUIDE_CATEGORIES.find((c) => c.id === id);
}

export function generateStaticParams() {
  return GUIDE_CATEGORIES.map((c) => ({ categorie: c.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categorie } = await params;
  const cat = categoryFor(categorie);
  if (!cat) return {};
  const count = GUIDES.filter((g) => g.category === cat.id).length;
  return {
    title: hubTitle(`Guides ${cat.label} · ${count} guides villes`),
    description: INTRO[cat.id],
    alternates: { canonical: `/guides/categorie/${cat.id}` },
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Guides ${cat.label} | MaVilleIdéale`,
      description: INTRO[cat.id],
    },
  };
}

export default async function GuideCategoryPage({ params }: Props) {
  const { categorie } = await params;
  const cat = categoryFor(categorie);
  if (!cat) notFound();

  const guides = GUIDES.filter((g) => g.category === cat.id).sort((a, b) =>
    (b.updatedAt ?? b.publishedAt).localeCompare(a.updatedAt ?? a.publishedAt),
  );

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Guides", path: "/guides" },
    { name: cat.label, path: `/guides/categorie/${cat.id}` },
  ]);

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Guides ${cat.label}`,
    description: INTRO[cat.id],
    numberOfItems: guides.length,
    itemListElement: guides.slice(0, 100).map((g, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${baseUrl}/guides/${g.slug}`,
      name: g.title,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemList)} />
      <Navbar />

      {/* Hero — « Couleurs » : aurore colorée, titre en dégradé. */}
      <section className="relative bg-aurora pt-20 pb-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:text-[var(--accent)] hover:underline">Accueil</Link> ·{" "}
            <Link href="/guides" className="hover:text-[var(--accent)] hover:underline">Guides</Link>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <EmojiBadge emoji={cat.emoji} tone={toneFor(cat.id)} size="md" />
            <span className="rounded-full grad-head-0 px-3 py-1 text-xs font-semibold shadow-[0_8px_18px_-10px_rgba(79,70,229,0.8)]">
              {guides.length} guide{guides.length > 1 ? "s" : ""}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.08]">
            Guides <span className="gradient-text">{cat.label}</span>
          </h1>
          <p className="text-[var(--text-secondary)] max-w-2xl sm:text-lg">{INTRO[cat.id]}</p>
        </div>
      </section>

      {/* Liste plate : un lien par guide, pas une grille de cartes. Une
          catégorie monte à plusieurs centaines de guides et le hub /guides a
          déjà payé ce prix-là (2,5 Mo de HTML avant plafonnement). La liste
          tient dans une seule carte blanche sur bande indigo. */}
      <section className="band band-indigo py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <ul className="divide-y divide-[#E0E7FF] rounded-2xl border border-white bg-white p-2 shadow-[0_14px_36px_-22px_rgba(79,70,229,0.55)]">
            {guides.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guides/${g.slug}`}
                  className="group flex items-baseline gap-3 rounded-xl px-3 py-2.5 hover:bg-[#EEF2FF] transition-colors"
                >
                  <span className="shrink-0">{g.emoji}</span>
                  <span className="min-w-0 flex-1 text-sm text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{g.title}</span>
                  <span className="shrink-0 rounded-full bg-[#EEF2FF] px-2 py-0.5 text-xs font-medium text-[#4338CA] tabular-nums">
                    {g.readMinutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Autres thématiques — tuiles blanches à pastille dégradée, comme sur le
          hub. Les teintes de catégorie (vert, ambre, orange, violet) sont
          réservées aux paliers de score. */}
      <section className="band band-pink py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-5">
            <span className="gradient-text">Les autres thématiques</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GUIDE_CATEGORIES.filter((c) => c.id !== cat.id).map((c) => {
              const count = GUIDES.filter((g) => g.category === c.id).length;
              return (
                <Link
                  key={c.id}
                  href={`/guides/categorie/${c.id}`}
                  className="group flex items-center gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-[0_10px_28px_-18px_rgba(219,39,119,0.55)] hover:-translate-y-0.5 hover:border-[#FBCFE8] transition-all"
                >
                  <EmojiBadge emoji={c.emoji} tone={toneFor(c.id)} size="sm" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-pink)] transition-colors">{c.label}</div>
                    <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {count} guide{count > 1 ? "s" : ""}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
