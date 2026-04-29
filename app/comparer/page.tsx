import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CompareTool } from "./CompareTool";

export const metadata: Metadata = {
  title: "Comparer des villes — MeilleurVille",
  description:
    "Comparez deux ou trois villes françaises côte à côte : qualité de vie, coût, transport, nature, sécurité, écoles. Outil de comparaison gratuit.",
};

export default function ComparerPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <CompareTool />
      <Footer />
    </main>
  );
}
