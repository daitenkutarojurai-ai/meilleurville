import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales — MeilleurVille",
  description: "Mentions légales de MeilleurVille : éditeur, hébergeur, contact.",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Mentions légales</h1>
          <p className="text-sm text-[var(--text-tertiary)]">Conformément à la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique.</p>
        </div>

        <div className="space-y-8 text-sm text-[var(--text-secondary)] leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">Éditeur du site</h2>
            <p>
              MeilleurVille SAS<br />
              En cours d'immatriculation<br />
              France<br />
              Email : hello@meilleurville.fr
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">Directeur de publication</h2>
            <p>Le directeur de publication est le représentant légal de MeilleurVille SAS.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">Hébergement</h2>
            <p>
              Vercel Inc.<br />
              340 Pine Street, Suite 801<br />
              San Francisco, CA 94104<br />
              États-Unis<br />
              vercel.com
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu du site MeilleurVille (textes, analyses, design, algorithmes, code) est
              protégé par le droit d'auteur français. Toute reproduction sans autorisation expresse est interdite.
            </p>
            <p className="mt-2">
              Les données sources utilisées (INSEE, data.gouv.fr, OpenStreetMap) sont soumises à leurs licences
              respectives (Licence Ouverte v2.0, ODbL).
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">Crédits technologiques</h2>
            <p>
              Ce site utilise notamment : Next.js (Vercel), Tailwind CSS,
              Anthropic Claude (résumés IA), Open-Meteo (données météo).
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">Litiges</h2>
            <p>
              Pour tout litige relatif à l'utilisation du site, les parties s'engagent à tenter une résolution
              amiable avant toute action judiciaire. Les présentes mentions légales sont soumises au droit français.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
          <Link href="/confidentialite" className="text-sm text-[var(--accent)] hover:underline">Confidentialité →</Link>
          <Link href="/cgu" className="text-sm text-[var(--accent)] hover:underline">CGU →</Link>
          <Link href="/contact" className="text-sm text-[var(--accent)] hover:underline">Contact →</Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
