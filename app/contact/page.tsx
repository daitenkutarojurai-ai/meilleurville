import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "Contact — MeilleurVille",
  description: "Contactez l'équipe MeilleurVille : signaler une erreur, proposer une ville, partenariat presse ou data.",
};

const TOPICS = [
  {
    emoji: "🐛",
    title: "Signaler une erreur",
    body: "Score qui semble faux, informations incorrectes sur une ville, bug dans l'interface.",
    cta: "Signaler",
    href: "mailto:erreurs@meilleurville.fr",
  },
  {
    emoji: "🏙️",
    title: "Proposer une ville",
    body: "Votre ville n'est pas encore sur MeilleurVille ? Soumettez-la et nous l'ajouterons lors de la prochaine mise à jour.",
    cta: "Proposer",
    href: "mailto:villes@meilleurville.fr",
  },
  {
    emoji: "📰",
    title: "Presse & partenariats",
    body: "Journalistes, chercheurs, collectivités : nous disposons de données structurées et sommes ouverts aux collaborations éditoriales.",
    cta: "Écrire",
    href: "mailto:presse@meilleurville.fr",
  },
  {
    emoji: "💡",
    title: "Suggestions produit",
    body: "Une fonctionnalité qui vous manque, une amélioration que vous aimeriez voir : on lit tout.",
    cta: "Suggérer",
    href: "mailto:hello@meilleurville.fr",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">Contact</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Parlons-nous</h1>
          <p className="text-[var(--text-secondary)]">
            L'équipe MeilleurVille lit tous les messages. Choisissez le sujet qui vous correspond.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-10">
        {/* Topic cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {TOPICS.map((t) => (
            <div key={t.title} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
              <div className="text-2xl mb-3">{t.emoji}</div>
              <div className="font-semibold text-[var(--text-primary)] mb-1">{t.title}</div>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">{t.body}</div>
              <a
                href={t.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] hover:underline"
              >
                {t.cta} →
              </a>
            </div>
          ))}
        </div>

        {/* General contact */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-8 text-center">
          <p className="text-[var(--text-secondary)] mb-2">Adresse générale</p>
          <a
            href="mailto:hello@meilleurville.fr"
            className="text-xl font-bold text-[var(--accent)] hover:underline"
          >
            hello@meilleurville.fr
          </a>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Réponse sous 48h ouvrables. Pas de réponse automatique.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/methode"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Méthodologie →
          </Link>
          <Link
            href="/about"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            À propos →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
