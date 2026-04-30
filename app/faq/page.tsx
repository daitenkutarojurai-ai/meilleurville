import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes | MeilleurVille",
  description: "Réponses aux questions fréquentes sur MeilleurVille : comment sont calculés les scores, comment contribuer, comment fonctionne l'abonnement Pro.",
};

const FAQ_SECTIONS = [
  {
    title: "Les scores et classements",
    questions: [
      {
        q: "Comment sont calculés les scores de qualité de vie ?",
        a: "Nos scores sont des moyennes pondérées de données objectives (INSEE, Open Data, OpenStreetMap) et d'avis vérifiés d'habitants. Chaque critère (nature, transport, coût, sécurité, culture, télétravail, écoles) est noté sur 10. Le score global est un composite pondéré. Toute notre méthodologie est publique sur la page /methode.",
      },
      {
        q: "À quelle fréquence les scores sont-ils mis à jour ?",
        a: "Les scores sont recalculés chaque semaine pour intégrer les nouveaux avis. Les données sources (INSEE, data.gouv.fr) sont intégrées lors de leurs mises à jour annuelles ou semestrielles. La date de dernière mise à jour est visible sur chaque profil de ville.",
      },
      {
        q: "Pourquoi ma ville est-elle si mal notée ?",
        a: "Les scores reflètent des données objectives et des avis d'habitants. Si vous pensez qu'un score est incorrect, vous pouvez nous signaler une erreur via le formulaire de contact. Nous vérifierons les données sources et mettrons à jour si nécessaire. MeilleurVille n'accepte aucune modification de score en échange d'un paiement.",
      },
      {
        q: "Pourquoi Annecy est-elle numéro 1 alors que c'est très cher ?",
        a: "Annecy score très haut sur la nature, la sécurité, et la qualité de vie vécue — qui font partie de nos critères pondérés. Le coût est un critère parmi d'autres, pas le seul. Si votre priorité principale est le pouvoir d'achat, utilisez notre classement 'Moins chères' ou le quiz IA qui pondère selon vos priorités personnelles.",
      },
    ],
  },
  {
    title: "Les avis et contributions",
    questions: [
      {
        q: "Comment contribuer un avis sur une ville ?",
        a: "Rendez-vous sur la page de la ville concernée et cliquez sur 'Écrire un avis'. Vous devrez certifier avoir habité ou travaillé dans la ville. Les avis sont modérés par notre équipe + algorithme anti-spam avant publication. Un avis publié vous rapporte des points de réputation (badge Explorateur → Légende).",
      },
      {
        q: "Comment sont vérifiés les avis ?",
        a: "Nous utilisons un système combiné : vérification email, détection de patterns de spam (même IP, même texte), et validation humaine pour les avis signalés. Les avis confirmés par d'autres utilisateurs comme utiles gagnent en visibilité. Nous n'utilisons pas de comptes anonymes non vérifiés.",
      },
      {
        q: "Puis-je modifier ou supprimer mon avis ?",
        a: "Oui. Connectez-vous à votre compte, accédez à votre tableau de bord, et vous pouvez modifier ou supprimer vos avis. Les avis supprimés sont retirés sous 24h. Si vous n'avez plus accès à votre compte, contactez hello@meilleurville.fr.",
      },
      {
        q: "Qu'est-ce que le Red Flag Radar ?",
        a: "Le Red Flag Radar est notre système de signalement de problèmes locaux : bruit, inondation, pollution, travaux, insécurité. Les signalements confirmés par plusieurs utilisateurs sont publiés sur la page dédiée et sur le profil de la ville concernée. L'objectif est de donner une information honnête que les annonces immobilières ne communiquent jamais.",
      },
    ],
  },
  {
    title: "L'abonnement Pro",
    questions: [
      {
        q: "Qu'est-ce qui est inclus dans l'abonnement Pro ?",
        a: "L'abonnement Pro à 9,90€/mois inclut : profils de quartiers complets, Red Flag Radar illimité, rapport IA personnalisé PDF, alertes nouvelles avis sur vos villes sauvegardées, historique comparaisons illimité, export données CSV, et support prioritaire.",
      },
      {
        q: "Comment fonctionne l'essai gratuit de 7 jours ?",
        a: "Lors de votre inscription Pro, vous bénéficiez de 7 jours gratuits sans restriction. Votre carte bancaire est requise pour activer l'essai, mais aucun prélèvement n'est effectué pendant la période d'essai. Vous pouvez annuler à tout moment depuis votre tableau de bord avant la fin des 7 jours.",
      },
      {
        q: "Comment annuler mon abonnement Pro ?",
        a: "Rendez-vous dans votre tableau de bord → Paramètres → Abonnement → Annuler. L'annulation prend effet à la fin de la période de facturation en cours. Vous conservez l'accès aux fonctionnalités Pro jusqu'à cette date. Aucun remboursement prorata n'est effectué sauf demande dans les 14 jours suivant le premier prélèvement.",
      },
      {
        q: "Les données du rapport IA PDF sont-elles fiables ?",
        a: "Le rapport PDF est généré par Claude (Anthropic) sur la base de nos données vérifiées. Il est à jour au moment de la génération. Comme tout outil IA, il peut contenir des imprécisions — nous le présentons comme une aide à la décision, pas comme un conseil professionnel immobilier. Nous recommandons toujours de visiter la ville avant de décider.",
      },
    ],
  },
  {
    title: "Données et confidentialité",
    questions: [
      {
        q: "MeilleurVille vend-il des données à des tiers ?",
        a: "Non. Nous ne vendons, ne louons, ni ne partageons vos données personnelles avec des tiers à des fins commerciales. Nos partenaires techniques (Vercel pour l'hébergement, Stripe pour les paiements) ont accès aux données strictement nécessaires à leur service. Voir notre politique de confidentialité complète.",
      },
      {
        q: "Puis-je télécharger mes données personnelles ?",
        a: "Oui, conformément au RGPD. Connectez-vous à votre compte → Paramètres → Télécharger mes données. Vous recevrez un email avec un fichier ZIP contenant vos avis, préférences, et données de compte. Délai : 48h.",
      },
      {
        q: "Comment signaler un problème de données ou une erreur ?",
        a: "Utilisez notre formulaire de contact avec la catégorie 'Signaler une erreur'. Indiquez la ville concernée, le score ou la donnée erronée, et si possible la source correcte. Notre équipe traite les signalements sous 72h ouvrables.",
      },
    ],
  },
  {
    title: "Comparaisons et quiz",
    questions: [
      {
        q: "Comment fonctionne le comparateur de villes ?",
        a: "Le comparateur met côte à côte deux villes françaises sur tous les critères de qualité de vie : scores détaillés, données météo, loyers, population. Accédez-y via /comparer ou depuis le profil de n'importe quelle ville. Plus de 200 paires de villes sont précalculées pour un accès instantané.",
      },
      {
        q: "Comment fonctionne le quiz IA ?",
        a: "Notre quiz vous pose 6 questions sur votre situation (cadre de vie souhaité, budget, mode de travail, préférences climatiques). En moins de 2 minutes, l'algorithme pondère les critères selon vos réponses et vous propose les 5 villes les plus compatibles avec un score de correspondance personnalisé.",
      },
      {
        q: "Quelle est la différence entre le leaderboard et les classements thématiques ?",
        a: "Le leaderboard (/leaderboard) est un classement global sur le score composite de toutes les villes. Les classements thématiques (/classements) sont des classements spécialisés par profil : télétravail, famille, budget, nature, retraite, culture, sécurité, mobilité, soleil, étudiant. Chaque classement utilise une pondération différente adaptée au profil.",
      },
      {
        q: "Peut-on comparer plus de deux villes à la fois ?",
        a: "Le comparateur affiche deux villes côte à côte. Pour comparer plusieurs villes simultanément, utilisez le quiz IA qui vous propose un top 5 avec tableau comparatif pour les 3 premiers résultats. La version Pro permettra à terme un comparateur multi-villes jusqu'à 5 simultanément.",
      },
    ],
  },
  {
    title: "Naviguer sur MeilleurVille",
    questions: [
      {
        q: "Comment trouver les villes par région ou département ?",
        a: "Accédez à /regions pour parcourir les 13 régions françaises (+ la Corse) ou à /departements pour les 46 départements représentés. Chaque page liste les villes avec leurs scores et des indicateurs moyens par territoire.",
      },
      {
        q: "Qu'est-ce que la page 'Quartiers' d'une ville ?",
        a: "Chaque ville analysée dispose d'une page /villes/[ville]/quartiers qui détaille 3 quartiers représentatifs avec leurs propres scores (sécurité, transport, nature, coût, vie nocturne), le loyer moyen d'un T2, et un résumé de l'ambiance. Idéal pour choisir précisément où habiter dans une ville.",
      },
      {
        q: "Comment fonctionne la carte interactive ?",
        a: "La carte interactive (/carte) affiche les 334 villes analysées avec un code couleur selon leur score (vert = excellent, ambre = bon, rouge = à améliorer). Vous pouvez filtrer l'affichage par critère (nature, transport, coût...) et cliquer sur chaque ville pour accéder à son profil. La taille du cercle est proportionnelle au score.",
      },
    ],
  },
  {
    title: "Guides & Conseils",
    questions: [
      {
        q: "Qu'est-ce que les guides MeilleurVille ?",
        a: "Les guides sont des articles longs et approfondis (7 à 12 minutes de lecture) qui couvrent des sujets de mobilité résidentielle : quitter Paris, s'installer en télétravail, choisir une ville pour sa famille, investissement immobilier, vivre en bord de mer à budget accessible, etc. Chaque guide est rédigé avec des données concrètes, des comparatifs de villes, et des conseils pratiques tirés de retours d'habitants.",
      },
      {
        q: "Comment sont organisés les guides ?",
        a: "Les guides sont classés par catégorie : Télétravail, Famille, Budget & Coût, Style de vie, Par région, et Comparaisons. Chaque guide est lié aux profils des villes qu'il mentionne, aux classements thématiques correspondants, et à d'autres guides connexes. Accédez à l'ensemble des 140 guides sur /guides.",
      },
      {
        q: "Puis-je suggérer un sujet de guide ?",
        a: "Oui. Utilisez le formulaire de contact (catégorie 'Suggestion de guide') pour nous proposer un sujet. Les demandes les plus fréquentes sont priorisées. Nos sujets les plus demandés pour 2025 : 'meilleures villes pour créer une entreprise', 'villes pour seniors en bonne santé', et 'meilleures villes pour les profils RSE/développement durable'.",
      },
      {
        q: "Les informations des guides sont-elles vérifiées ?",
        a: "Oui. Toutes les données chiffrées (loyers, prix au m2, temps de trajet, ensoleillement) sont sourcées depuis des données publiques (INSEE, notaires.fr, Météo-France) ou nos propres agrégations d'avis vérifiés. Les guides sont mis à jour annuellement. Si vous relevez une donnée incorrecte, signalez-la via le bouton 'Signaler une erreur' en bas de chaque guide.",
      },
    ],
  },
];

export default function FaqPage() {
  const allQuestions = FAQ_SECTIONS.flatMap((s) => s.questions);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": allQuestions.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a,
      },
    })),
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <Badge variant="accent" className="mb-3">FAQ</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">Questions fréquentes</h1>
          <p className="text-[var(--text-secondary)]">
            Tout ce que vous voulez savoir sur MeilleurVille, les scores, les avis, et l'abonnement Pro.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 space-y-12">
        {FAQ_SECTIONS.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-5 pb-3 border-b border-[var(--border)]">
              {section.title}
            </h2>
            <div className="space-y-5">
              {section.questions.map((item) => (
                <div key={item.q} className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
                  <h3 className="font-semibold text-[var(--text-primary)] mb-2">{item.q}</h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-8 text-center">
          <p className="font-semibold text-[var(--text-primary)] mb-2">Vous n'avez pas trouvé votre réponse ?</p>
          <p className="text-sm text-[var(--text-secondary)] mb-5">
            Notre équipe répond sous 48h ouvrables.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] text-white font-semibold px-5 py-2.5 text-sm hover:opacity-90 transition-opacity"
          >
            Contacter l'équipe →
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/methode" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Méthodologie →
          </Link>
          <Link href="/donnees" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Données & Sources →
          </Link>
          <Link href="/premium" className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Voir l'abonnement Pro →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
