import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { Card } from "@/components/ui/Card";
import { Download, Newspaper, MapPin, BarChart3, Mail, Shield } from "lucide-react";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_SEED } from "@/data/cities-seed";
import { CITIES_COUNT, GUIDES_COUNT, RANKINGS_COUNT, DEPARTMENTS_COUNT } from "@/lib/site-stats";

export const metadata: Metadata = {
  title: "Espace presse · Données et classements des villes françaises",
  description:
    "Journalistes, collectivités : accédez au classement complet des villes françaises, aux données par ville et à la méthodologie. Données libres de reprise avec attribution.",
  alternates: { canonical: "/presse" },
};

const presseBreadcrumb = breadcrumbJsonLd([
  { name: "Accueil", path: "/" },
  { name: "Presse", path: "/presse" },
]);

const TOP_CITIES = [...CITIES_SEED]
  .sort((a, b) => b.scores.global - a.scores.global)
  .slice(0, 10);

const ANGLES = [
  {
    icon: MapPin,
    title: "L'angle local : votre ville, votre département",
    desc: "Chaque ville a une fiche complète : score global, 8 critères, quartiers, climat, sécurité, tension locative. Le rang d'une ville dans son département ou sa région fait un marronnier local documenté — et vérifiable, chaque chiffre est sourcé.",
  },
  {
    icon: BarChart3,
    title: "L'angle data : des palmarès thématiques",
    desc: `${RANKINGS_COUNT} classements nationaux (familles, télétravail, sécurité, coût de la vie, climat 2040…) recombinables par région ou taille de ville. Le CSV complet est téléchargeable ci-dessous, prêt pour vos infographies.`,
  },
  {
    icon: Newspaper,
    title: "L'angle société : exode urbain, où vont les Français ?",
    desc: "Nos outils (City Match, projections climat 2040, flux de départ ville par ville) racontent les arbitrages résidentiels des Français : qui quitte Paris, pour aller où, et pourquoi. Un terrain d'enquête chiffré, pas un sondage.",
  },
];

export default function PressePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(presseBreadcrumb) }}
      />
      <AmbientBackground />
      <Navbar />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-16">
        <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-3">
          Espace presse & collectivités
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mb-4">
          Les données de MaVilleIdéale, libres de reprise
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed mb-10">
          MaVilleIdéale compare {CITIES_COUNT} villes françaises sur 8 critères
          (sécurité, coût de la vie, transports, écoles…), à partir de données
          publiques : Insee, SSMSI, Arcep, observatoires des loyers. {GUIDES_COUNT}{" "}
          guides éditoriaux complètent les fiches. Aucune ville ne paie pour son
          classement — <Link href="/methode" className="text-[var(--accent)] underline underline-offset-2">la méthodologie est publique</Link>.
          Journalistes et collectivités peuvent reprendre chiffres, classements et
          captures avec attribution (« Source : mavilleideale.fr »).
        </p>

        <div className="grid sm:grid-cols-4 gap-3 mb-12">
          {[
            [CITIES_COUNT, "villes notées"],
            [RANKINGS_COUNT, "classements"],
            [DEPARTMENTS_COUNT, "départements"],
            [GUIDES_COUNT, "guides"],
          ].map(([n, label]) => (
            <Card key={label as string} className="p-4 text-center">
              <div className="text-2xl font-extrabold text-[var(--accent)]">{n}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">{label}</div>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Trois angles qui fonctionnent
        </h2>
        <div className="space-y-4 mb-12">
          {ANGLES.map(({ icon: Icon, title, desc }) => (
            <Card key={title} className="p-5 flex gap-4">
              <Icon className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            </Card>
          ))}
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Le top 10 national 2026
        </h2>
        <Card className="p-5 mb-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="pb-2 pr-3">#</th>
                <th className="pb-2 pr-3">Ville</th>
                <th className="pb-2 pr-3">Département</th>
                <th className="pb-2 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {TOP_CITIES.map((c, i) => (
                <tr key={c.slug} className="border-t border-[var(--border)]">
                  <td className="py-2 pr-3 font-bold text-[var(--text-tertiary)]">{i + 1}</td>
                  <td className="py-2 pr-3 font-semibold">
                    <Link href={`/villes/${c.slug}`} className="text-[var(--accent)] hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="py-2 pr-3 text-[var(--text-secondary)]">{c.department}</td>
                  <td className="py-2 text-right font-bold">{c.scores.global.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <a
          href="/presse/classement-mavilleideale-2026.csv"
          download
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-3 text-sm hover:opacity-90 transition-opacity mb-12"
        >
          <Download className="h-4 w-4" />
          Télécharger le classement complet ({CITIES_COUNT} villes, CSV)
        </a>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
          Conditions de reprise
        </h2>
        <Card className="p-5 mb-12 flex gap-4">
          <Shield className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-2">
            <p>
              Chiffres, classements et captures d&apos;écran sont librement réutilisables
              dans un cadre journalistique ou institutionnel, avec la mention
              « Source : mavilleideale.fr » (lien apprécié en ligne).
            </p>
            <p>
              Les scores agrègent des données publiques et une calibration
              éditoriale documentée : ils reflètent une méthodologie, pas une
              vérité absolue — <Link href="/methode" className="text-[var(--accent)] underline underline-offset-2">ses limites sont décrites ici</Link>.
            </p>
          </div>
        </Card>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Contact</h2>
        <Card className="p-5 flex gap-4">
          <Mail className="h-5 w-5 text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
            <p>
              Demandes presse (données sur mesure, interview, précisions
              méthodologiques) : réponse sous 24 h via{" "}
              <Link href="/contact" className="text-[var(--accent)] underline underline-offset-2">
                le formulaire de contact
              </Link>
              . Nous pouvons extraire un classement personnalisé (votre
              département, votre région, un critère précis) pour votre rédaction.
            </p>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
