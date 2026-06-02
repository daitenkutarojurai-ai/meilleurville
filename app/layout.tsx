import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { ScrollProgress } from "@/components/ScrollProgress";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";
import { CITIES_COUNT } from "@/lib/site-stats";

const GTM_ID = "GTM-MXMF7XFJ";
const GA4_ID = "G-4X0HKD8LC7";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Locale wiring. Each Vercel project sets NEXT_PUBLIC_DEFAULT_LOCALE
// (fr → mavilleideale.fr, en → bestcitiesinfrance.com). Both base URLs are
// exposed so hreflang cross-links work from either build.
const DEFAULT_LOCALE = (process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? "fr") as "fr" | "en";
const FR_URL = process.env.NEXT_PUBLIC_BASE_URL_FR ?? "https://www.mavilleideale.fr";
const EN_URL = process.env.NEXT_PUBLIC_BASE_URL_EN ?? "https://bestcitiesinfrance.com";
const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? (DEFAULT_LOCALE === "en" ? EN_URL : FR_URL);
const HTML_LANG = DEFAULT_LOCALE === "en" ? "en" : "fr";

const IS_EN = DEFAULT_LOCALE === "en";
const SITE_NAME = IS_EN ? "BestCitiesInFrance" : "MaVilleIdeal";
const SITE_TITLE = IS_EN
  ? "BestCitiesInFrance — Find the French city that fits you"
  : "MaVilleIdeal — Trouvez la ville qui vous ressemble";
const SITE_DESCRIPTION = IS_EN
  ? `AI + lived experience + ${CITIES_COUNT} cities of official data. Rankings, resident reviews, lifestyle-matching quiz — independent and unbiased.`
  : "IA + vraies expériences + données locales. Classements, avis d'habitants, quiz de matching. La référence pour choisir où vivre en France.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    // Cross-domain hreflang advertised at the layout level. Per-route metadata
    // (e.g. city pages) overrides this with route-specific cross-links.
    languages: {
      fr: FR_URL,
      "fr-FR": FR_URL,
      en: EN_URL,
      "en-US": EN_URL,
      "x-default": FR_URL,
    },
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: IS_EN
    ? [
        "best cities in France",
        "where to live in France",
        "French quality of life",
        "French city reviews",
        "France relocation quiz",
      ]
    : [
        "meilleure ville France",
        "où vivre en France",
        "qualité de vie ville",
        "avis habitants ville",
        "quiz ville idéale",
      ],
  openGraph: {
    type: "website",
    locale: IS_EN ? "en_US" : "fr_FR",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    site: IS_EN ? "@bestcitiesinfr" : "@meilleurville",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  other: {
    "theme-color": "#0D9488",
    "mobile-web-app-capable": "yes",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: [],
      description: IS_EN
        ? "BestCitiesInFrance — independent reference for choosing where to live in France. City rankings, resident reviews and a matching quiz built on official data (Insee, Ministry of Interior, observatoires des loyers)."
        : "MaVilleIdeal — la référence indépendante pour choisir où vivre en France. Classements de villes, avis d'habitants, quiz de matching basés sur des données publiques (Insee, SSMSI, observatoires des loyers).",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: IS_EN ? "en-US" : "fr-FR",
      publisher: { "@id": `${SITE_URL}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/${IS_EN ? "search" : "recherche"}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={HTML_LANG} className={`${inter.variable} ${instrumentSerif.variable} h-full`}>
      <head>
        <meta name="279e205393cab8e" content="5195ad0cc468d3135378b3a98089404f" />
        {/* Impact.com site verification — Impact's tag uses `value`, which is
            not part of React's <meta> typings, so the attributes are cast through. */}
        <meta
          {...({
            name: "impact-site-verification",
            value: "f7bf2ba0-104b-4a75-a147-95a72a993c0f",
          } as unknown as React.MetaHTMLAttributes<HTMLMetaElement>)}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        {/* Consent Mode v2 default — denied until the user accepts. Plain inline
            script (not next/script) so it ships in the static HTML and runs
            synchronously, in document order, before GTM and the Google tag
            queue any commands. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  wait_for_update: 500
});`,
          }}
        />
        {/* Google tag (gtag.js) — GA4. In the static HTML head so it is
            detectable by crawlers; honours the consent default queued above. */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`} />
        <script
          dangerouslySetInnerHTML={{
            __html: `gtag('js', new Date());
gtag('config', '${GA4_ID}');`,
          }}
        />
        {/* Google Tag Manager — shares the same dataLayer/gtag and consent state. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased pb-[calc(3.75rem+env(safe-area-inset-bottom))] lg:pb-0">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:ring-2 focus:ring-[var(--bg-canvas)]"
        >
          {IS_EN ? "Skip to content" : "Aller au contenu"}
        </a>
        <ScrollProgress />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
