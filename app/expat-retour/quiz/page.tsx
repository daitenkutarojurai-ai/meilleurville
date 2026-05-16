import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ExpatQuiz } from "@/components/ExpatQuiz";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Quiz expat retour France — Quelle ville pour vous ? 2026",
  description:
    "Quiz adapté aux Français rentrant de Suisse, Luxembourg, Belgique, UK ou Canada. 5 questions sur votre profil expat → 5 villes françaises calibrées (frontalière ou métropole).",
  alternates: { canonical: "/expat-retour/quiz" },
};

const breadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Expat retour", path: "/expat-retour" },
  { name: "Quiz expat", path: "/expat-retour/quiz" },
]);

export default function ExpatQuizPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <AmbientBackground />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">
            ✨ Quiz expat
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Rentrer en France : quelle ville pour vous ?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            5 questions sur votre situation actuelle d&apos;expat → 5 villes françaises adaptées,
            avec score % et raisons chiffrées.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <ExpatQuiz />
      </div>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 pb-16">
        <Card>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong>Note :</strong> ce quiz est une version adaptée du{" "}
            <Link href="/quiz-compatibilite" className="underline">quiz de compatibilité général</Link>{" "}
            avec un préfiltre par pays d&apos;origine. Le pays d&apos;origine influence le bonus
            attribué aux villes frontalières (Annecy / Annemasse / Thonon pour la Suisse,
            Metz / Thionville pour le Luxembourg, Lille pour la Belgique et le UK, etc.).
          </p>
        </Card>
      </div>

      <Footer />
    </main>
  );
}
