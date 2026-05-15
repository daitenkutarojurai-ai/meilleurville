import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { ContributionStats } from "@/components/ContributionStats";
import { CommentSection } from "@/components/CommentSection";
import { AlertTriangle, Volume2, Droplets, Wind, Shield, Flame, Zap, ArrowRight } from "lucide-react";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_SEED } from "@/data/cities-seed";

export const metadata: Metadata = {
  title: "Red Flag Radar — Signalements communautaires | MeilleurVille",
  description:
    "Découvrez les alertes et signalements communautaires : bruit, inondation, pollution, insécurité. Ce que l'annonce immobilière ne vous dit jamais.",
  alternates: { canonical: "/red-flags" },
};

const redFlagsBreadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Red Flags", path: "/red-flags" },
]);

const FLAG_CATEGORIES = [
  {
    id: "bruit",
    label: "Bruit",
    icon: Volume2,
    color: "text-orange-600",
    bg: "bg-orange-400/10 border-orange-400/20",
    examples: ["Couloir aérien", "Autoroute proche", "Voie ferrée", "Bar / discothèque"],
  },
  {
    id: "inondation",
    label: "Inondation & Eau",
    icon: Droplets,
    color: "text-blue-600",
    bg: "bg-blue-400/10 border-blue-400/20",
    examples: ["Zone inondable PPRi", "Sous-sol humide récurrent", "Cave inondée", "Ruissellement urbain"],
  },
  {
    id: "pollution",
    label: "Pollution",
    icon: Wind,
    color: "text-purple-600",
    bg: "bg-purple-400/10 border-purple-400/20",
    examples: ["PM2.5 élevé", "Zone industrielle proche", "Site pollué BASIAS", "Pesticides agricoles"],
  },
  {
    id: "securite",
    label: "Sécurité",
    icon: Shield,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-400/20",
    examples: ["Cambriolages fréquents", "Dégradations récurrentes", "Squat identifié", "Éclairage insuffisant"],
  },
  {
    id: "construction",
    label: "Construction & Chantier",
    icon: Flame,
    color: "text-amber-500",
    bg: "bg-amber-400/10 border-yellow-400/20",
    examples: ["Chantier ≥ 2 ans prévu", "Démolition programmée", "PLU modification", "Promoteur actif"],
  },
  {
    id: "infrastructure",
    label: "Infrastructures",
    icon: Zap,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10 border-emerald-400/20",
    examples: ["Fibre non disponible", "Coupures électricité", "Réseau eau dégradé", "Route défoncée"],
  },
];


// Surface a short list of major cities to bootstrap discovery of per-city fiches.
const FEATURED_CITY_SLUGS = [
  "marseille", "paris", "nice", "toulon", "perpignan", "lyon",
  "bordeaux", "nantes", "rennes", "strasbourg", "grenoble", "lille",
];

function featuredFiches() {
  return FEATURED_CITY_SLUGS
    .map((slug) => CITIES_SEED.find((c) => c.slug === slug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      department: c.department,
      safety: c.scores.safety,
      cost: c.scores.cost,
    }));
}

export default function RedFlagsPage() {
  const fiches = featuredFiches();
  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(redFlagsBreadcrumb)} />
      <Navbar />

      {/* Header */}
      <section className="bg-gradient-to-b from-red-950/20 to-[var(--bg-canvas)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Red Flag Radar
          </div>
          <h1 className="mb-3 text-3xl sm:text-4xl font-bold text-[var(--text-primary)]">
            Ce que l&apos;annonce immobilière ne vous dira jamais.
          </h1>
          <p className="max-w-2xl text-[var(--text-secondary)] text-lg">
            On agrège les données ouvertes (Géorisques, ATMO, SSMSI) et on ouvre la discussion
            aux habitants : ce que les annonces immobilières taisent — bruit, inondations,
            pollution, insécurité — vous le voyez avant la signature.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 space-y-14">
        {/* Honest stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Catégories surveillées", value: "6", color: "text-red-500" },
            { label: "Sources publiques", value: "4", color: "text-[var(--text-primary)]" },
            { label: "Villes couvertes", value: "340", color: "text-emerald-600" },
            { label: "Données ouvertes", value: "100%", color: "text-[var(--accent)]" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl glass border border-white/50 p-5 text-center shadow-sm">
              <div className={`text-2xl font-bold font-mono-data mb-1 ${color}`}>{value}</div>
              <div className="text-xs text-[var(--text-secondary)]">{label}</div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            Catégories de signalements
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FLAG_CATEGORIES.map(({ id, label, icon: Icon, color, bg, examples }) => (
              <Card key={id} className={`border ${bg.split(" ")[1]}`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                </div>
                <h3 className={`font-semibold ${color} mb-2`}>{label}</h3>
                <ul className="space-y-1">
                  {examples.map((ex) => (
                    <li key={ex} className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-[var(--border)] flex-shrink-0" />
                      {ex}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>

        {/* Per-city fiches */}
        <div>
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                Fiches red-flag par ville
              </h2>
              <p className="text-sm text-[var(--text-secondary)]">
                Neuf catégories de risques croisées avec Géorisques, SSMSI, ATMO et BRGM. Une fiche disponible pour chaque ville du site.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fiches.map((f) => (
              <Link
                key={f.slug}
                href={`/red-flags/${f.slug}`}
                className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-red-500/40 hover:bg-[var(--bg-elevated)] transition-all p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold text-[var(--text-primary)] group-hover:text-red-500 transition-colors truncate">
                    {f.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                    {f.department} · sécurité {f.safety.toFixed(1)} · coût {f.cost.toFixed(1)}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-[var(--text-tertiary)] group-hover:text-red-500 flex-shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Toutes les villes ont leur fiche : /red-flags/&lt;slug-de-la-ville&gt;.
          </p>
        </div>

        {/* Community stats */}
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">
            La communauté en action
          </h2>
          <ContributionStats />
        </div>

        {/* Contribute CTA */}
        <div className="rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-950/20 via-[var(--bg-surface)] to-[var(--bg-elevated)] p-8 sm:p-10 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Vous connaissez un problème non signalé ?
          </h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md mx-auto">
            Aidez des milliers de personnes à éviter une mauvaise surprise.
            Les signalements vérifiés par 3+ utilisateurs sont publiés.
          </p>
          <button className="inline-flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 px-6 py-3 font-semibold hover:bg-red-500/20 transition-colors">
            <AlertTriangle className="h-4 w-4" />
            Signaler un problème
          </button>
        </div>

        <div className="mt-16">
          <CommentSection
            topic="red-flags:public"
            title="Témoignages et signalements"
            emptyHint="Vous avez vécu un truc qui ne va pas dans une ville ? Partagez-le ici (sans nommer de personnes ni d'adresses)."
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
