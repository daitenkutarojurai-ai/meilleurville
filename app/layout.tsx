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

export const metadata: Metadata = {
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
    "theme-color": "#5B7FFF",
    "mobile-web-app-capable": "yes",
  },
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
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
