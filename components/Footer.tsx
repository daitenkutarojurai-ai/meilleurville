import Link from "next/link";
import { MapPin } from "lucide-react";

const LINKS = {
  Explorer: [
    { label: "Toutes les villes", href: "/villes" },
    { label: "Par région", href: "/regions" },
    { label: "Par département", href: "/departements" },
    { label: "Carte interactive", href: "/carte" },
    { label: "Classements", href: "/classements" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Comparer", href: "/comparer" },
    { label: "Red Flag Radar", href: "/red-flags" },
  ],
  "Guides & IA": [
    { label: "Trouver ma ville", href: "/quiz" },
    { label: "Guides pratiques", href: "/guides" },
    { label: "Méthodologie", href: "/methode" },
    { label: "Données & Sources", href: "/donnees" },
    { label: "Premium", href: "/premium" },
  ],
  "À propos": [
    { label: "Notre mission", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "Confidentialité", href: "/confidentialite" },
    { label: "CGU", href: "/cgu" },
    { label: "FAQ", href: "/faq" },
    { label: "Mentions légales", href: "/mentions-legales" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent)]">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-[var(--text-primary)]">
                Meilleur<span className="text-[var(--accent)]">Ville</span>
              </span>
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              On vous aide à trouver votre coin idéal en France 🌿 Données vraies,
              avis d&apos;habitants, zéro bullshit.
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                {group}
              </h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-secondary)]">
            © 2026 MeilleurVille · Fait avec amour en France 🌻
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Open Data · Avis d&apos;habitants · Un peu d&apos;IA pour t&apos;aider à choisir
          </p>
        </div>
      </div>
    </footer>
  );
}
