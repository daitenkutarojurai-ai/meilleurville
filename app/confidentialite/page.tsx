import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité — MeilleurVille",
  description: "Politique de confidentialité de MeilleurVille : données collectées, cookies, droits des utilisateurs.",
};

const SECTIONS = [
  {
    title: "1. Données collectées",
    content: `Lors de votre utilisation de MeilleurVille, nous pouvons collecter :

• Adresse e-mail (lors de l'inscription ou de la newsletter)
• Contenu des avis soumis (texte, scores, tags)
• Données techniques de navigation (adresse IP anonymisée, user-agent, pages visitées)
• Préférences du quiz (stockées localement dans votre navigateur)

Nous ne collectons pas de données de localisation précise, de données financières, ni de données sensibles au sens du RGPD.`,
  },
  {
    title: "2. Utilisation des données",
    content: `Les données collectées sont utilisées exclusivement pour :

• Faire fonctionner le service (avis, quiz, recommandations)
• Vous envoyer la newsletter si vous y avez souscrit
• Améliorer la qualité des scores et de l'expérience utilisateur
• Détecter et prévenir les abus (spam, faux avis)

Nous ne vendons jamais vos données à des tiers. Nous ne les utilisons pas pour de la publicité comportementale.`,
  },
  {
    title: "3. Cookies",
    content: `MeilleurVille utilise un minimum de cookies :

• Cookies techniques (session, préférences d'interface) : nécessaires au fonctionnement
• Aucun cookie de tracking publicitaire tiers
• Aucun traceur Facebook, Google Analytics (version complète), ou autre outil de profilage

Les données d'usage sont analysées de manière agrégée et anonymisée via des outils RGPD-compatibles (ex. Plausible).`,
  },
  {
    title: "4. Conservation des données",
    content: `• Données de compte : conservées jusqu'à la suppression du compte + 30 jours
• Avis publics : conservés tant que le compte est actif ; supprimés sur demande
• Logs techniques anonymisés : 90 jours maximum
• Données newsletter : jusqu'à désinscription

Vous pouvez demander la suppression de vos données à tout moment.`,
  },
  {
    title: "5. Vos droits (RGPD)",
    content: `Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez des droits suivants :

• Droit d'accès : obtenir une copie de vos données personnelles
• Droit de rectification : corriger des données inexactes
• Droit à l'effacement ("droit à l'oubli") : demander la suppression
• Droit à la portabilité : recevoir vos données dans un format structuré
• Droit d'opposition : vous opposer au traitement pour certaines finalités

Pour exercer ces droits, contactez : privacy@meilleurville.fr`,
  },
  {
    title: "6. Partage avec des tiers",
    content: `MeilleurVille utilise les services suivants qui peuvent traiter des données techniques :

• Vercel (hébergement) — données techniques de connexion, CDN

• Anthropic (IA) — les résumés IA sont générés via Claude ; aucune donnée personnelle n'est envoyée

Aucune donnée n'est transmise à des courtiers de données ou à des fins publicitaires.`,
  },
  {
    title: "7. Contact",
    content: `Pour toute question relative à vos données personnelles :

Email : privacy@meilleurville.fr
Délai de réponse : 30 jours maximum (conformément au RGPD)

Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr).`,
  },
];

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Politique de confidentialité
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
          <Link href="/cgu" className="text-sm text-[var(--accent)] hover:underline">CGU →</Link>
          <Link href="/mentions-legales" className="text-sm text-[var(--accent)] hover:underline">Mentions légales →</Link>
          <Link href="/contact" className="text-sm text-[var(--accent)] hover:underline">Nous contacter →</Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
