import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { QuizFlow } from "./QuizFlow";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Quiz vacances en France 2026 · où partir selon votre profil",
  description: "5 questions, 3 destinations françaises adaptées : mois, activité, profil voyageur, budget, durée. Sélection data-driven, sans listicle d'agence.",
  alternates: { canonical: "/vacances/quiz" },
  openGraph: {
    title: "Quiz vacances",
    description: "Le bon mois, le bon endroit, le bon budget. 5 questions pour décider.",
  },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Vacances", path: "/vacances" },
  { name: "Quiz", path: "/vacances/quiz" },
]);

export default function VacancesQuizPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="relative overflow-hidden pt-12 pb-6">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-aurora opacity-30" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-3" aria-label="Fil d'Ariane">
            <Link href="/" className="hover:underline">Accueil</Link>
            <span className="mx-1">·</span>
            <Link href="/vacances" className="hover:underline">Vacances</Link>
            <span className="mx-1">·</span>
            <span className="text-[var(--text-secondary)]">Quiz</span>
          </nav>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-3">
            Trouvez votre <span className="font-display italic gradient-text-anim">destination</span>
          </h1>
          <p className="text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Cinq questions, trois destinations françaises taillées pour vous.
            Pas de top-10 magique, pas de quiz à 25 questions : on va à l&apos;essentiel.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Badge>5 questions</Badge>
            <Badge>Sélection data-driven</Badge>
            <Badge>Booking CTA après</Badge>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
        <QuizFlow />
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-14">
        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed text-center">
          Vos réponses ne sont pas stockées · pas de compte requis ·
          le scoring utilise le même engine que les pages mois et activité.{" "}
          <Link href="/vacances" className="underline">Retour au hub Vacances</Link>.
        </p>
      </section>

      <Footer />
    </main>
  );
}
