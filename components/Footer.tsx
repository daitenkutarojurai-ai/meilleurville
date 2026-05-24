import Link from "next/link";
import { Heart } from "lucide-react";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { BrandMark } from "@/components/BrandMark";

const LINKS_FR = {
  Explorer: [
    { label: "Toutes les villes", href: "/villes" },
    { label: "Par région", href: "/regions" },
    { label: "Par département", href: "/departements" },
    { label: "Carte interactive", href: "/carte" },
    { label: "Classements", href: "/classements" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Comparer", href: "/comparer" },
    { label: "Red Flag Radar", href: "/red-flags" },
    { label: "Vacances en France", href: "/vacances" },
    { label: "Cadre de vie", href: "/cadre-de-vie" },
  ],
  "Outils & Guides": [
    { label: "City Match", href: "/city-match" },
    { label: "Trouver ma ville", href: "/quiz" },
    { label: "Synthèse 8 axes", href: "/synthese" },
    { label: "Guides pratiques", href: "/guides" },
    { label: "Tous les outils", href: "/outils" },
    { label: "Recherche globale", href: "/recherche" },
    { label: "Calendrier immobilier", href: "/calendrier-immobilier" },
    { label: "Méthodologie", href: "/methode" },
    { label: "Données & Sources", href: "/donnees" },
    { label: "Flux RSS", href: "/feed.xml" },
  ],
  "À propos & Légal": [
    { label: "Notre mission", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Glossaire", href: "/glossaire" },
    { label: "Contact", href: "/contact" },
    { label: "Sommaire", href: "/sommaire" },
    { label: "Mentions légales", href: "/mentions-legales" },
    { label: "Confidentialité", href: "/confidentialite" },
    { label: "CGU", href: "/cgu" },
    { label: "Liens partenaires", href: "/mentions-legales#affiliation" },
  ],
};

const LINKS_EN = {
  Explore: [
    { label: "All cities", href: "/cities" },
    { label: "Rankings", href: "/rankings" },
    { label: "Quiz", href: "/quiz" },
  ],
  About: [
    { label: "Home", href: "/" },
    { label: "Contact", href: "mailto:hello@mavilleideale.fr" },
  ],
  Legal: [
    { label: "Legal notice", href: "/legal-notice" },
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Affiliate disclosure", href: "/legal-notice#affiliate-disclosure" },
  ],
};

const LINKS = DEFAULT_LOCALE === "en" ? LINKS_EN : LINKS_FR;
const TAGLINE =
  DEFAULT_LOCALE === "en"
    ? "Helping you find the right French city. Real data, resident reviews, no fluff."
    : "On vous aide à trouver votre coin idéal en France 🌿 Données vraies, avis d'habitants, zéro bullshit.";
const PUBLISHER_LINE =
  DEFAULT_LOCALE === "en"
    ? "Edited by Thomas Fendrich · hello@mavilleideale.fr"
    : "Édité par Thomas Fendrich · hello@mavilleideale.fr";
const COPY_LINE =
  DEFAULT_LOCALE === "en"
    ? "© 2026 BestCitiesInFrance · Made with"
    : "© 2026 MaVilleIdeal · Fait avec";
const COPY_SUFFIX =
  DEFAULT_LOCALE === "en" ? "in France" : "en France";
const SIGNAL_LINE =
  DEFAULT_LOCALE === "en"
    ? "Open Data · Resident reviews · Independent"
    : "Open Data · Avis d'habitants · Indépendant";
const BRAND_DISPLAY =
  DEFAULT_LOCALE === "en" ? (
    <>
      Best<span className="text-[var(--accent)]">CitiesInFrance</span>
    </>
  ) : (
    <>
      MaVille<span className="text-[var(--accent)]">Ideal</span>
    </>
  );

export function Footer() {
  return (
    <footer
      className="relative overflow-hidden border-t border-[#0F2419]/30 text-[#E5EDD5]"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 0%, #1F3A2A 0%, #0F2419 60%, #07140C 100%)",
      }}
    >
      {/* Aurora glow */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-[#22C55E]/15 blur-[120px]" />
        <div className="absolute top-0 right-0 h-72 w-72 rounded-full bg-[#F59E0B]/10 blur-[100px]" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#84CC16]/10 blur-[100px]" />
      </div>
      {/* Hairline gradient on top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22C55E]/60 to-transparent" />
      {/* Grain */}
      <div className="grain" style={{ opacity: 0.12, mixBlendMode: "overlay" }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-20 pb-10">
        {/* Big wordmark */}
        <div className="mb-12 text-center">
          <div className="text-[20vw] sm:text-[14rem] font-display italic leading-none gradient-text-anim opacity-25 select-none pointer-events-none">
            {DEFAULT_LOCALE === "en" ? "bestcitiesinfrance" : "meilleurville"}
          </div>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12 -mt-24 sm:-mt-32 relative">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BrandMark className="h-9 w-9 rounded-[22%] shadow-lg shadow-[var(--accent)]/40" />
              <span className="font-bold text-white text-lg">
                {BRAND_DISPLAY}
              </span>
            </Link>
            <p className="text-sm text-[#A8C4A8] leading-relaxed">
              {TAGLINE}
            </p>
            <p className="mt-4 text-xs text-[#A8C4A8]/80 leading-relaxed">
              {PUBLISHER_LINE}
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#84CC16]">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-[#C4D5C0] transition-colors hover:text-white inline-flex items-center gap-1 group"
                    >
                      <span>{label}</span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#84CC16]">→</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A8C4A8]">
            {COPY_LINE}{" "}
            <Heart className="inline h-3 w-3 fill-[#EC4899] text-[#EC4899]" />{" "}
            {COPY_SUFFIX}
          </p>
          <p className="text-xs text-[#A8C4A8] flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
            {SIGNAL_LINE}
          </p>
        </div>
      </div>
    </footer>
  );
}
