import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { MesVillesClient } from "./MesVillesClient";
import { CITIES_LIGHT } from "@/lib/cities-light";

export const metadata: Metadata = {
  title: "Mon espace",
  description: "Vos villes favorites, vos avis, vos alertes et vos projections — au même endroit.",
  alternates: { canonical: "/mes-villes" },
  robots: { index: false, follow: true },
};

export default function MesVillesPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <MesVillesClient cities={CITIES_LIGHT} />
      <Footer />
    </main>
  );
}
