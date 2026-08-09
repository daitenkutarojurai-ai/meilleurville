import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { MapPin, Search } from "lucide-react";

// This file produces the single `404.html` of the export, and the Worker serves
// it on **both** domains (`serve404()` in worker/index.ts). It was French-only,
// so every dead URL on bestcitiesinfrance.com answered in French — including
// the ones the Worker returns itself when an EN path has no asset, which is the
// most likely 404 on that domain. `DEFAULT_LOCALE` is inlined at build time and
// each domain gets its own export, so the FR output is unchanged.
const IS_EN = DEFAULT_LOCALE === "en";

const COPY = IS_EN
  ? {
      heading: "This page does not exist",
      body: "The city or page you are looking for cannot be found. Try the search, or head back to the homepage.",
      home: "Back to the homepage",
      cities: "Browse the cities",
      citiesHref: "/cities",
    }
  : {
      heading: "Cette page n'existe pas",
      body: "La ville ou la page que vous cherchez est introuvable. Essayez la recherche ou revenez à l'accueil.",
      home: "Retour à l'accueil",
      cities: "Explorer les villes",
      citiesHref: "/villes",
    };

export default function NotFound() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 text-8xl font-bold font-mono-data gradient-text">404</div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">
          {COPY.heading}
        </h1>
        <p className="mb-8 max-w-md text-[var(--text-secondary)]">
          {COPY.body}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <MapPin className="h-4 w-4" />
              {COPY.home}
            </Button>
          </Link>
          <Link href={COPY.citiesHref}>
            <Button size="lg" variant="secondary" className="gap-2">
              <Search className="h-4 w-4" />
              {COPY.cities}
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
