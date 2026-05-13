import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { GlobalSearch } from "@/components/GlobalSearch";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CITIES_SEED } from "@/data/cities-seed";
import { GUIDES } from "@/data/guides";
import { getAllTagsWithCounts } from "@/lib/guide-tags";

export const metadata: Metadata = {
  title: "Recherche globale — Villes, guides, tags, glossaire | MeilleurVille",
  description:
    "Cherchez dans toute la base MeilleurVille : 352 villes, 285 guides, 184 tags, 31 termes glossaire. Tout au même endroit.",
  alternates: { canonical: "/recherche" },
};

// Hand-picked glossary entries with anchors. Keeps the index lean rather than
// shipping the full glossaire content; clicking the result lands on the page
// where the visitor can read the full definition.
const GLOSSARY_INDEX = [
  { term: "DPE (Diagnostic de Performance Énergétique)", def: "Classe la consommation énergétique d'un logement de A à G. Logements G interdits à la location dès 2025.", href: "/glossaire#section-0" },
  { term: "LMNP (Loueur Meublé Non Professionnel)", def: "Statut fiscal pour bailleur en meublé. Régime micro-BIC (abattement 50%) ou réel (amortissement).", href: "/glossaire#section-1" },
  { term: "Taxe foncière", def: "Impôt local annuel payé par le propriétaire. Calculée sur la valeur locative cadastrale.", href: "/glossaire#section-0" },
  { term: "Frais de notaire", def: "Droits + émoluments + débours, ~7-8% du prix d'achat dans l'ancien, ~2-3% dans le neuf.", href: "/glossaire#section-0" },
  { term: "Encadrement des loyers", def: "Plafond légal modulé par typologie. En vigueur à Paris, Lyon, Lille, Bordeaux, Montpellier...", href: "/glossaire#section-0" },
  { term: "ZFE (Zone à Faibles Émissions)", def: "Périmètre urbain interdisant progressivement les véhicules les plus polluants selon Crit'Air.", href: "/glossaire#section-2" },
  { term: "PTZ (Prêt à Taux Zéro)", def: "Prêt sans intérêts pour primo-accédants, sous conditions de revenus.", href: "/glossaire#section-2" },
  { term: "Pinel / Pinel+", def: "Réduction d'impôt pour acquisition logement neuf locatif. En extinction depuis 2024.", href: "/glossaire#section-1" },
  { term: "Denormandie", def: "Réduction d'impôt acquisition + rénovation ancien centre-ville communes éligibles.", href: "/glossaire#section-1" },
  { term: "Fibre FTTH", def: "Connexion fibre optique jusqu'à l'intérieur du logement. Débit 1-8 Gbps.", href: "/glossaire#section-3" },
  { term: "Rendement brut / net", def: "Brut = loyer / prix. Net = (loyer - charges) / (prix + frais notaire). Écart typique 1-1,5 point.", href: "/glossaire#section-1" },
  { term: "PLU (Plan Local d'Urbanisme)", def: "Document communal fixant les règles d'occupation des sols. À consulter avant achat avec travaux.", href: "/glossaire#section-2" },
  { term: "Loi Carrez", def: "Surface privative officielle en copropriété. Erreur >5% donne droit à diminution du prix.", href: "/glossaire#section-0" },
  { term: "TMI (Tranche Marginale d'Imposition)", def: "Taux IR appliqué à la dernière tranche. Tranches 2025: 0%, 11%, 30%, 41%, 45%.", href: "/glossaire#section-4" },
  { term: "Plus-value immobilière", def: "Différence vente/achat. Exonérée résidence principale. Locatif: 19% IR + 17,2% PS.", href: "/glossaire#section-4" },
];

export default function RecherchePage() {
  // Trim each guide to the fields actually consulted client-side, to keep the
  // serialized payload reasonable. (Intro stays — needed for the snippet.)
  const guides = GUIDES.map((g) => ({
    slug: g.slug,
    title: g.title,
    intro: g.intro,
    category: g.category,
    tags: g.tags ?? [],
  }));

  const cities = CITIES_SEED.map((c) => ({
    slug: c.slug,
    name: c.name,
    region: c.region,
    score: c.scores.global,
  }));

  const tags = getAllTagsWithCounts();

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Breadcrumbs
            items={[
              { label: "Accueil", href: "/" },
              { label: "Recherche" },
            ]}
          />
          <Badge variant="accent" className="mb-3">Recherche</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            Recherche globale
          </h1>
          <p className="text-[var(--text-secondary)]">
            Une seule barre pour interroger {cities.length} villes, {guides.length} guides,{" "}
            {tags.length} tags et {GLOSSARY_INDEX.length} termes glossaire.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <GlobalSearch
          cities={cities}
          guides={guides}
          tags={tags}
          glossary={GLOSSARY_INDEX}
        />
      </div>

      <Footer />
    </main>
  );
}
