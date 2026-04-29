import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — MeilleurVille",
  description: "CGU de MeilleurVille : règles d'utilisation du service, avis, abonnements, propriété intellectuelle.",
};

const SECTIONS = [
  {
    title: "1. Objet",
    content: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site MeilleurVille (meilleurville.fr), plateforme de comparaison des villes françaises par qualité de vie.",
  },
  {
    title: "2. Accès au service",
    content: `MeilleurVille est accessible gratuitement à tout utilisateur disposant d'un accès internet.

L'accès aux fonctionnalités Pro (rapport PDF, alertes, export CSV) nécessite un abonnement payant de 9,90€/mois soumis à des conditions spécifiques présentées lors de la souscription.

MeilleurVille se réserve le droit de suspendre ou supprimer l'accès de tout utilisateur en cas d'abus.`,
  },
  {
    title: "3. Avis et contributions",
    content: `En soumettant un avis sur MeilleurVille, vous certifiez :

• Avoir personnellement résidé ou travaillé dans la ville concernée
• Que votre avis reflète votre expérience réelle et honnête
• Ne pas représenter un intérêt commercial (office de tourisme, promoteur, concurrent)
• Ne pas inclure de propos diffamatoires, discriminatoires ou illégaux

MeilleurVille se réserve le droit de modérer ou supprimer tout avis ne respectant pas ces conditions, sans préavis ni indemnisation.`,
  },
  {
    title: "4. Propriété intellectuelle",
    content: `Le contenu éditorial de MeilleurVille (guides, analyses, scores, algorithmes, design) est protégé par le droit d'auteur.

Les données sources utilisées (INSEE, data.gouv.fr, OSM) sont soumises à leurs licences respectives (Licence Ouverte / CC BY).

La reproduction partielle du contenu éditorial est autorisée avec citation explicite de MeilleurVille et lien vers la source.`,
  },
  {
    title: "5. Limitation de responsabilité",
    content: `Les scores et classements publiés sur MeilleurVille sont fournis à titre indicatif. Ils ne constituent pas un conseil professionnel immobilier, financier ou juridique.

MeilleurVille ne peut être tenu responsable des décisions prises sur la base de ces informations. Nous recommandons de visiter les villes avant toute décision de déménagement.

Les données sont mises à jour régulièrement mais peuvent présenter des inexactitudes. Signalez-les via notre formulaire de contact.`,
  },
  {
    title: "6. Abonnement Pro",
    content: `L'abonnement Pro est facturé mensuellement via Stripe. Il peut être annulé à tout moment depuis votre tableau de bord.

Un essai de 7 jours est offert aux nouveaux abonnés. Aucune facturation pendant la période d'essai ; la carte bancaire est requise pour l'activer.

Conformément au droit de rétractation européen, vous disposez de 14 jours pour annuler sans frais après la fin de la période d'essai.`,
  },
  {
    title: "7. Droit applicable",
    content: "Les présentes CGU sont soumises au droit français. En cas de litige, les parties s'engagent à rechercher une solution amiable avant toute action judiciaire. À défaut, le tribunal compétent sera celui du lieu du siège social de MeilleurVille.",
  },
];

export default function CguPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Dernière mise à jour : 1er avril 2025
          </p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">{s.title}</h2>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {s.content}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
          <Link href="/confidentialite" className="text-sm text-[var(--accent)] hover:underline">Confidentialité →</Link>
          <Link href="/mentions-legales" className="text-sm text-[var(--accent)] hover:underline">Mentions légales →</Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
