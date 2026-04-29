import { Metadata } from "next";
import { QuizFlow } from "./QuizFlow";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Quiz — Trouvez votre ville idéale",
  description:
    "7 questions pour trouver la ville française qui correspond parfaitement à votre style de vie, grâce à notre IA.",
};

export default function QuizPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <QuizFlow />
    </main>
  );
}
