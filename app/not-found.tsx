import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { MapPin, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <div className="mb-6 text-8xl font-bold font-mono-data gradient-text">404</div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--text-primary)]">
          Cette page n'existe pas
        </h1>
        <p className="mb-8 max-w-md text-[var(--text-secondary)]">
          La ville ou la page que vous cherchez est introuvable. Essayez la
          recherche ou revenez à l'accueil.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/">
            <Button size="lg" className="gap-2">
              <MapPin className="h-4 w-4" />
              Retour à l'accueil
            </Button>
          </Link>
          <Link href="/villes">
            <Button size="lg" variant="secondary" className="gap-2">
              <Search className="h-4 w-4" />
              Explorer les villes
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
