import { Metadata } from "next";
import { QuizFlow } from "./QuizFlow";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Quiz — Trouvez votre ville idéale en France | MeilleurVille",
  description:
    "Quiz de matching en 3 minutes : 6 questions pour trouver la ville française parfaite pour vous. Télétravail, famille, budget, soleil — notre IA analyse 238 villes.",
  openGraph: {
    title: "Quiz de matching — Trouvez votre ville idéale",
    description: "3 minutes · 6 questions · 238 villes analysées. Quel est votre profil géographique ?",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function QuizPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <QuizFlow />
    </main>
  );
}
