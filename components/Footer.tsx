import Link from "@/components/AppLink";
import { Heart } from "lucide-react";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { BrandMark } from "@/components/BrandMark";

const LINKS_FR = {
  Explorer: [
    { label: "Toutes les villes", href: "/villes" },
    { label: "Avis & notes des villes", href: "/avis" },
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
    { label: "Synthèse 8 axes", href: "/synthese" },
    { label: "Classement sport", href: "/sport" },
    { label: "Tension locative", href: "/tension-locative" },
    { label: "Couverture internet", href: "/internet" },
    { label: "Couverture commerciale", href: "/commerces" },
    { label: "Risques naturels", href: "/risques" },
    { label: "Villes cyclables", href: "/velo" },
    { label: "Vibe des villes", href: "/vibe" },
    { label: "Climat 2040", href: "/climat-2040-timelapse" },
    { label: "Retour d'expatriation", href: "/expat-retour" },
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
    { label: "City ratings & reviews", href: "/reviews" },
    { label: "By region", href: "/regions" },
    { label: "By department", href: "/departments" },
    { label: "Interactive map", href: "/map" },
    { label: "Rankings", href: "/rankings" },
    { label: "Leaderboard", href: "/leaderboard" },
    { label: "Compare", href: "/compare" },
    { label: "Red Flag Radar", href: "/red-flags" },
    { label: "Vacations in France", href: "/vacations" },
    { label: "Quality of life", href: "/quality-of-life" },
  ],
  "Tools & Guides": [
    { label: "City Match", href: "/city-match" },
    { label: "8-axis synthesis", href: "/synthesis" },
    { label: "Sport ranking", href: "/sport" },
    { label: "Rental pressure", href: "/rental-tension" },
    { label: "Internet coverage", href: "/internet-quality" },
    { label: "Retail coverage", href: "/retail-coverage" },
    { label: "Natural risks", href: "/natural-risks" },
    { label: "Political leaning", href: "/political-leaning" },
    { label: "Weekend getaways", href: "/weekend-getaways" },
    { label: "Guides", href: "/guides" },
    { label: "Tags", href: "/tags" },
    { label: "All tools", href: "/tools" },
    { label: "Global search", href: "/search" },
    { label: "RSS feed", href: "/feed.xml" },
  ],
  "About & Legal": [
    { label: "Our mission", href: "/about" },
    { label: "Who it's for", href: "/for-who" },
    { label: "Methodology", href: "/methodology" },
    { label: "Data & sources", href: "/data-sources" },
    { label: "FAQ", href: "/faq" },
    { label: "Glossary", href: "/glossary" },
    { label: "Contact", href: "/contact" },
    { label: "Site index", href: "/site-index" },
    { label: "Press room", href: "/press" },
    { label: "Legal notice", href: "/legal-notice" },
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms of use", href: "/terms" },
    { label: "Affiliate disclosure", href: "/legal-notice#affiliate-disclosure" },
  ],
};

const LINKS = DEFAULT_LOCALE === "en" ? LINKS_EN : LINKS_FR;
const TAGLINE =
  DEFAULT_LOCALE === "en"
    ? "Helping you find the right French city. Real data, resident reviews, no fluff."
    : "On vous aide à trouver votre coin idéal en France. Données vraies, avis d'habitants, zéro bullshit.";
const PUBLISHER_LINE =
  DEFAULT_LOCALE === "en"
    ? "Edited by Thomas Fendrich · hello@bestcitiesinfrance.com"
    : "Édité par Thomas Fendrich · hello@mavilleideale.fr";
const COPY_LINE =
  DEFAULT_LOCALE === "en"
    ? "© 2026 BestCitiesInFrance · Made with"
    : "© 2026 MaVilleIdéale · Fait avec";
const COPY_SUFFIX =
  DEFAULT_LOCALE === "en" ? "in France" : "en France";
const SIGNAL_LINE =
  DEFAULT_LOCALE === "en"
    ? "Open Data · Resident reviews · Independent"
    : "Open Data · Avis d'habitants · Indépendant";
const BRAND_DISPLAY =
  DEFAULT_LOCALE === "en" ? "BestCitiesInFrance" : "MaVilleIdéale";
const SCALE_LABEL = DEFAULT_LOCALE === "en" ? "Map scale" : "Échelle";

// Footer as the bottom margin of a survey map: ink field with faint contour
// lines, the enamel plaque band along the top edge, the wordmark on a plaque,
// link columns carrying a grid reference (A, B, C) like the mega-menu, and a
// scale bar in the legend line. No aurora, no grain, no score colours.
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#18212F] text-[#D7DCE4]">
      {/* Enamel plaque band: navy field over the green rim */}
      <div
        className="h-2 w-full"
        style={{
          background:
            "linear-gradient(180deg, var(--accent) 0 66%, var(--plaque-frame) 66% 100%)",
        }}
        aria-hidden="true"
      />
      {/* Contour lines (navy strokes read as faint relief on the ink field) */}
      <div
        className="topo-bg pointer-events-none absolute inset-0 top-2 opacity-40"
        style={{ mixBlendMode: "screen" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 pt-14 pb-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Brand */}
          <div>
            <Link
              href="/"
              className="plaque mb-5 !gap-2 !py-1.5 !pl-1.5 !pr-3 text-base focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
            >
              <BrandMark className="h-7 w-7 rounded-[22%]" />
              <span>{BRAND_DISPLAY}</span>
            </Link>
            <p className="text-sm text-[#C3CAD5] leading-relaxed">
              {TAGLINE}
            </p>
            <p className="mt-4 text-xs text-[#A9B2C0] leading-relaxed">
              {PUBLISHER_LINE}
            </p>
          </div>

          {/* Link groups */}
          {Object.entries(LINKS).map(([group, links], gi) => (
            <div key={group}>
              {/* h2, not h4: the footer follows the page's last h2, and a jump
                  to h4 breaks the heading outline screen readers navigate by. */}
              <h2 className="mb-4 flex items-center gap-2 border-b border-white/15 pb-2 text-xs font-semibold uppercase tracking-wider text-white">
                <span aria-hidden className="plaque plaque-small font-mono !text-[10px] leading-none">
                  {String.fromCharCode(65 + gi)}
                </span>
                {group}
              </h2>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5 sm:block sm:space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="min-h-6 text-sm text-[#C3CAD5] underline-offset-4 decoration-white/40 transition-colors hover:text-white hover:underline inline-flex items-center rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#A9B2C0]">
            {COPY_LINE}{" "}
            <Heart aria-hidden className="inline h-3 w-3 fill-[var(--accent-pink)] text-[var(--accent-pink)]" />{" "}
            {COPY_SUFFIX}
          </p>
          <div className="flex items-center gap-3 text-xs text-[#A9B2C0]">
            <span>{SIGNAL_LINE}</span>
            {/* Survey-map scale bar, purely decorative */}
            <span className="flex items-center gap-1.5" aria-hidden="true">
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#8F99A8]">
                {SCALE_LABEL}
              </span>
              <span className="flex h-1.5 w-20 overflow-hidden rounded-[1px] ring-1 ring-white/60">
                <span className="flex-1 bg-white/80" />
                <span className="flex-1" />
                <span className="flex-1 bg-white/80" />
                <span className="flex-1" />
              </span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
