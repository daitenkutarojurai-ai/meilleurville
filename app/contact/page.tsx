import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CommentSection } from "@/components/CommentSection";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe MaVilleIdeal : signaler une erreur, proposer une ville, partenariat presse ou data.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />

      <section className="relative pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-2">
            ✉️ On vous écoute
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
            Parlons-nous,{" "}
            <span className="font-display gradient-text-anim italic">vraiment.</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            On lit chaque message. Choisissez le sujet, écrivez ce que vous avez sur le cœur — réponse sous 48 h.
          </p>
        </div>
      </section>

      <section className="relative pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Suspense fallback={<div className="h-96 rounded-3xl glass-strong border border-white/60 animate-pulse" />}>
            <ContactForm />
          </Suspense>
        </div>
      </section>

      <section className="relative py-16 border-t border-[var(--border)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <CommentSection
            topic="contact:public"
            title="Mur des suggestions"
            emptyHint="Une idée pour MaVilleIdeal ? Partagez-la ici, c'est public — la communauté peut la voir."
          />
        </div>
      </section>

      <div className="relative mx-auto max-w-3xl px-4 sm:px-6 pb-16 flex flex-wrap gap-3">
        <Link
          href="/methode"
          className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
        >
          Méthodologie →
        </Link>
        <Link
          href="/about"
          className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
        >
          À propos →
        </Link>
        <Link
          href="/faq"
          className="rounded-xl border border-[var(--border)] bg-white/60 backdrop-blur px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white transition-colors"
        >
          FAQ →
        </Link>
      </div>

      <Footer />
    </main>
  );
}
