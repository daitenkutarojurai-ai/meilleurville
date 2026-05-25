import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Politique de confidentialité · MaVilleIdeal",
  description:
    "Données collectées, cookies, liens d'affiliation, droits RGPD : politique de confidentialité de MaVilleIdeal.",
  alternates: { canonical: "/confidentialite" },
};

const SECTIONS = [
  {
    title: "1. Qui est responsable de vos données ?",
    content: `Le responsable du traitement est Thomas Fendrich, entrepreneur individuel (SIREN 797 983 665), éditeur de MaVilleIdeal (mavilleideale.fr) et de BestCitiesInFrance (bestcitiesinfrance.com).

Contact RGPD : privacy@mavilleideale.fr
Contact général : hello@mavilleideale.fr

Le site n'emploie ni délégué à la protection des données (DPO), ni co-responsable de traitement — l'éditeur est seul décisionnaire.`,
  },
  {
    title: "2. Données collectées",
    content: `Sur MaVilleIdeal, nous collectons strictement le minimum nécessaire :

• Adresse e-mail — uniquement si vous vous inscrivez à la newsletter ou laissez un avis.
• Contenu des avis et commentaires que vous publiez volontairement (texte, scores, tags).
• Données techniques de connexion gérées par notre hébergeur Vercel : adresse IP (anonymisée dans les 30 jours), user-agent, URL visitée. Ces logs servent à détecter les abus et à dimensionner l'infrastructure.
• Préférences du quiz et favoris — stockés uniquement dans votre navigateur via localStorage. Ces données ne sont pas envoyées au serveur.

Nous ne collectons jamais : géolocalisation précise, données bancaires, données de santé, opinions politiques, religieuses ou syndicales, ni aucune donnée sensible au sens de l'article 9 du RGPD.`,
  },
  {
    title: "3. Finalités et base légale",
    content: `Vos données ne sont utilisées que pour :

• Faire fonctionner le service (avis, quiz, recommandations) — base légale : exécution du service que vous avez demandé (art. 6.1.b RGPD).
• Vous envoyer la newsletter à laquelle vous avez explicitement souscrit — base légale : consentement (art. 6.1.a RGPD), révocable à tout moment via le lien de désinscription en bas de chaque e-mail.
• Améliorer la qualité éditoriale et détecter les abus — base légale : intérêt légitime (art. 6.1.f RGPD), mis en balance avec votre droit à la vie privée.

Aucune donnée n'est utilisée pour de la publicité ciblée ou du profilage comportemental.`,
  },
  {
    title: "4. Cookies et traceurs",
    content: `MaVilleIdeal utilise un minimum strict de cookies :

• Cookies techniques nécessaires : session de navigation, préférences d'interface (thème, langue). Ces cookies sont exemptés de consentement (art. 82 loi Informatique & Libertés, recommandation CNIL).
• Aucun cookie publicitaire tiers — pas de Facebook Pixel, pas de Google Ads, pas de retargeting, pas de Hotjar.
• Aucun cookie d'analyse statistique à ce jour. Si nous activons un outil d'analyse à l'avenir, ce sera un outil RGPD-compatible (cookieless ou exempté de consentement) et cette page sera mise à jour avant son activation.

Le site est référencé dans Google Search Console pour suivre son indexation : il s'agit d'un outil pour webmasters qui ne dépose aucun cookie sur votre navigateur et ne collecte aucune donnée d'usage individuelle.

Booking.com peut déposer ses propres cookies si vous cliquez sur un lien partenaire et arrivez sur leur site — ces cookies relèvent alors de la politique de confidentialité de Booking.com, et non de la nôtre.`,
  },
  {
    title: "5. Liens d'affiliation Booking.com",
    content: `MaVilleIdeal participe au programme Booking.com Partners. Certains liens sortants vers Booking.com (boutons « Trouver un hôtel », barre flottante, fiches vacances) sont des liens partenaires.

Concrètement : si vous cliquez sur un de ces liens et réservez un hébergement sur Booking, nous touchons une petite commission de Booking. Cela ne change rien au prix que vous payez. Cela ne nous donne pas accès à vos données de réservation : Booking ne nous communique que des statistiques agrégées et anonymes (nombre de clics, nombre de réservations, montant total commissionné).

Tous les liens d'affiliation sont identifiés visuellement par la mention « lien partenaire » et portent l'attribut HTML rel="sponsored". Notre traitement éditorial (scores, classements, avis) est totalement indépendant de cette relation commerciale.`,
  },
  {
    title: "6. Conservation des données",
    content: `• Adresse e-mail newsletter : jusqu'à votre désinscription.
• Avis et commentaires publics : conservés tant que le site existe, sauf demande de suppression de votre part.
• Logs techniques d'accès (Vercel) : 30 jours, puis anonymisation automatique.
• Préférences locales (favoris, quiz) : tant que vous ne les effacez pas dans votre navigateur — nous n'en avons jamais copie.

Vous pouvez demander la suppression de vos données à tout moment.`,
  },
  {
    title: "7. Vos droits (RGPD)",
    content: `Conformément au Règlement Général sur la Protection des Données (UE 2016/679) et à la loi Informatique & Libertés modifiée, vous disposez des droits suivants :

• Droit d'accès — obtenir une copie de vos données personnelles.
• Droit de rectification — corriger des données inexactes.
• Droit à l'effacement (« droit à l'oubli ») — demander la suppression.
• Droit à la limitation du traitement.
• Droit à la portabilité — recevoir vos données dans un format structuré et réutilisable.
• Droit d'opposition — vous opposer au traitement pour motifs légitimes.
• Droit de définir des directives post mortem concernant vos données.

Pour exercer ces droits, écrivez à privacy@mavilleideale.fr. Nous répondrons sous 30 jours maximum (délai légal RGPD). Aucune pièce d'identité n'est exigée par défaut — nous procéderons à une vérification minimale pour éviter les usurpations.

Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr), autorité de contrôle française.`,
  },
  {
    title: "8. Sous-traitants et destinataires",
    content: `Vos données peuvent être traitées par les prestataires techniques suivants, exclusivement pour les finalités décrites ci-dessus :

• Vercel Inc. (États-Unis) — hébergement, CDN, journaux techniques. Vercel adhère au Data Privacy Framework UE-USA, qui encadre les transferts de données vers les États-Unis (décision d'adéquation de la Commission européenne du 10 juillet 2023).
• Booking.com B.V. (Pays-Bas) — uniquement si vous cliquez sur un lien partenaire ; aucune donnée n'est partagée en amont.

Nous ne vendons jamais vos données. Nous ne les partageons jamais avec des courtiers de données, des régies publicitaires ou des plateformes de profilage.`,
  },
  {
    title: "9. Mineurs",
    content: `MaVilleIdeal n'est pas destiné aux mineurs de moins de 15 ans. Nous ne collectons pas sciemment de données concernant des mineurs. Si vous êtes un parent ou tuteur et que vous constatez que votre enfant nous a transmis des données, écrivez à privacy@mavilleideale.fr — nous les supprimerons sans délai.`,
  },
  {
    title: "10. Mise à jour de la politique",
    content: `Nous pouvons mettre à jour cette politique pour refléter des évolutions techniques, légales ou éditoriales. Toute modification substantielle (nouvelle catégorie de donnée, nouveau sous-traitant, nouvelle finalité) sera signalée en haut de cette page pendant au moins 30 jours.

Dernière mise à jour : 25 mai 2026.`,
  },
];

export default function ConfidentialitePage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Politique de confidentialité
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Comment nous traitons vos données — version honnête, sans jargon.
          </p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                {s.title}
              </h2>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {s.content}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
          <Link
            href="/cgu"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            CGU →
          </Link>
          <Link
            href="/mentions-legales"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Mentions légales →
          </Link>
          <Link
            href="/contact"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Nous contacter →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
