import Link from "next/link";
import { MapPin } from "lucide-react";

const LINKS = {
  Explorer: [
    { label: "Toutes les villes", href: "/villes" },
    { label: "Classements", href: "/classements" },
    { label: "Comparer", href: "/comparer" },
    { label: "Red Flag Radar", href: "/red-flags" },
  ],
  "Quiz & IA": [
    { label: "Trouver ma ville", href: "/quiz" },
    { label: "Comment ça marche", href: "/methode" },
    { label: "Données & Sources", href: "/donnees" },
  ],
  Légal: [
    { label: "Confidentialité", href: "/confidentialite" },
    { label: "CGU", href: "/cgu" },
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
              La référence française pour choisir où vivre. IA + avis authentiques
              + données locales.
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
            © 2025 MeilleurVille · Fait avec passion en France 🇫🇷
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            Données Open Data · Avis communautaires · Powered by Claude IA
          </p>
        </div>
      </div>
    </footer>
  );
}
