import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";

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

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
    languages: {
      fr: SITE_URL,
      "fr-FR": SITE_URL,
      "x-default": SITE_URL,
    },
  },
  title: {
    default: "MeilleurVille — Trouvez la ville qui vous ressemble",
    template: "%s | MeilleurVille",
  },
  description:
    "IA + vraies expériences + données locales. Classements, avis d'habitants, quiz de matching. La référence pour choisir où vivre en France.",
  keywords: [
    "meilleure ville France",
    "où vivre en France",
    "qualité de vie ville",
    "avis habitants ville",
    "quiz ville idéale",
  ],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "MeilleurVille",
    url: "https://meilleurville.fr",
    title: "MeilleurVille — Trouvez la ville qui vous ressemble",
    description:
      "IA + vraies expériences + données locales. La référence pour choisir où vivre en France.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@meilleurville",
    title: "MeilleurVille — Trouvez la ville qui vous ressemble",
    description:
      "IA + vraies expériences + données locales. La référence pour choisir où vivre en France.",
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
    title: "MeilleurVille",
  },
  other: {
    "theme-color": "#16A34A",
    "mobile-web-app-capable": "yes",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: "MeilleurVille",
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      sameAs: [],
      description:
        "MeilleurVille — la référence indépendante pour choisir où vivre en France. Classements de villes, avis d'habitants, quiz de matching basés sur des données publiques (Insee, SSMSI, observatoires des loyers).",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "MeilleurVille",
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE_URL}#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/villes?q={search_term_string}` },
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
    <html lang="fr" className={`${inter.variable} ${instrumentSerif.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:ring-2 focus:ring-white"
        >
          Aller au contenu
        </a>
        {children}
      </body>
    </html>
  );
}
