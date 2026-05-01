import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";

export const metadata: Metadata = {
  title: "À propos — MeilleurVille",
  description:
    "Découvrez la mission de MeilleurVille : aider chaque Français à trouver la ville faite pour lui, avec des données réelles et des avis honnêtes.",
};

const TEAM = [
  {
    name: "Équipe Data",
    role: "Collecte & modélisation des scores",
    description: "Nous agrégerons les données ouvertes (INSEE, data.gouv.fr, OpenStreetMap) avec les avis de notre communauté pour calculer des scores objectifs et transparents.",
    emoji: "📊",
  },
  {
    name: "Équipe Produit",
    role: "Expérience utilisateur",
    description: "Chaque fonctionnalité est conçue pour répondre à une vraie question de quelqu'un qui doit décider où vivre. Rien de superflu, tout de fonctionnel.",
    emoji: "🎯",
  },
  {
    name: "Équipe Communauté",
    role: "Avis & contributions",
    description: "La qualité de MeilleurVille dépend de la communauté. Nous avons construit des systèmes anti-manipulation et de vérification pour que chaque avis compte.",
    emoji: "🤝",
  },
];

const VALUES = [
  {
    emoji: "🔍",
    title: "Honnêteté radicale",
    body: "Nous montrons les Red Flags. Nous ne masquons pas les mauvais scores. Nous ne vendons pas de mises en avant payantes. Une ville qui paye ne monte pas dans nos classements.",
  },
  {
    emoji: "📐",
    title: "Transparence méthodologique",
    body: "Chaque score est explicable. Les formules sont publiques. Vous pouvez reproduire nos calculs avec les données sources que nous citons. Rien de magique, tout de documenté.",
  },
  {
    emoji: "🌍",
    title: "Données réelles, pas de marketing",
    body: "Nous n'acceptons pas de contenu sponsorisé déguisé. Les scores viennent de données publiques et d'avis vérifiés, pas de dossiers de presse des offices de tourisme.",
  },
  {
    emoji: "👥",
    title: "Community-first",
    body: "Les habitants connaissent leur ville mieux que n'importe quelle base de données. Leur expérience vécue est au cœur du produit — nous la structurons, nous ne la remplaçons pas.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-4">Notre mission</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Vous aider à trouver<br />la ville faite pour vous
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Changer de ville est une des décisions les plus importantes de votre vie. Elle mérite
            mieux qu'un guide touristique ou un classement basé sur des critères abstraits.
            MeilleurVille est le Glassdoor des villes : des données réelles, des avis honnêtes,
            aucune langue de bois.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 space-y-20">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { value: `${CITIES_SEED.length}`, label: "Villes profilées" },
            { value: "8", label: "Axes de notation" },
            { value: "12", label: "Classements thématiques" },
            { value: "100%", label: "Données ouvertes" },
          ].map(({ value, label }) => (
            <div key={label} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-center">
              <div className="text-2xl font-black text-[var(--accent)] font-mono-data">{value}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Origin story */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Pourquoi MeilleurVille existe</h2>
          <div className="space-y-4 text-[var(--text-secondary)] leading-relaxed">
            <p>
              Tout a commencé avec une question simple : <em className="text-[var(--text-primary)]">"Où vivre en France pour être heureux ?"</em>
              Les réponses disponibles étaient soit des classements trop génériques (coût moyen de l'immobilier, soleil),
              soit des forums où des inconnus vous donnent leur opinion sans aucune donnée.
            </p>
            <p>
              Ce qu'il manquait : une plateforme qui agrège des données objectives ET du vécu humain,
              avec une transparence totale sur la méthode. Quelque chose entre Glassdoor (avis structurés et vérifiés)
              et Tripadvisor (dense, orienté usages), appliqué aux villes où vous envisagez de vivre.
            </p>
            <p>
              MeilleurVille ne vend pas de publicité pour les villes. Ne reçoit pas d'argent des offices de tourisme.
              Ne classe pas les villes selon leur budget marketing. La seule chose qui monte un score, c'est la réalité.
            </p>
          </div>
        </div>

        {/* Values */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Nos valeurs</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="text-2xl mb-3">{v.emoji}</div>
                <div className="font-semibold text-[var(--text-primary)] mb-2">{v.title}</div>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed">{v.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Comment on travaille</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            {TEAM.map((t) => (
              <div key={t.name} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                <div className="text-3xl mb-3">{t.emoji}</div>
                <div className="font-semibold text-[var(--text-primary)] mb-0.5">{t.name}</div>
                <div className="text-xs text-[var(--accent)] mb-2">{t.role}</div>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed">{t.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Methodology link */}
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">
            Comment on calcule les scores ?
          </h2>
          <p className="text-[var(--text-secondary)] mb-5 leading-relaxed">
            Notre méthodologie est entièrement publique. Formules, sources, pondérations, limites connues :
            tout est documenté et auditable par n'importe qui.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/methode"
              className="rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
            >
              Lire la méthodologie →
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-[var(--border)] text-[var(--text-secondary)] font-medium px-5 py-2.5 text-sm hover:text-[var(--text-primary)] transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
