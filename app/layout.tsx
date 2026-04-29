import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    title: "MeilleurVille — Trouvez la ville qui vous ressemble",
    description:
      "IA + vraies expériences + données locales. La référence pour choisir où vivre en France.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
