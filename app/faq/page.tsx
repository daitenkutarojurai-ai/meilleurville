import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { EmojiBadge, toneFor } from "@/components/EmojiBadge";
import { StaticPageCrossLink } from "@/components/StaticPageCrossLink";
import { CITIES_COUNT, REGIONS_COUNT, DEPARTMENTS_COUNT } from "@/lib/site-stats";
import { pathAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "FAQ · Questions fréquentes",
  description: "Réponses aux questions fréquentes sur MaVilleIdéale : comment sont calculés les scores, comment contribuer, comment marche le quiz et le comparateur.",
  alternates: pathAlternates("/faq", "/faq"),
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
        a: "Les scores sont calibrés sur les données ouvertes les plus récentes (Insee, Ministère de l'Intérieur SSMSI, observatoires des loyers Clameur). La calibration est revue à chaque édition annuelle des sources publiques.",
      },
      {
        q: "Pourquoi ma ville est-elle si mal notée ?",
        a: "Les scores reflètent des données objectives et des avis d'habitants. Si vous pensez qu'un score est incorrect, vous pouvez nous signaler une erreur via le formulaire de contact. Nous vérifierons les données sources et mettrons à jour si nécessaire. MaVilleIdéale n'accepte aucune modification de score en échange d'un paiement.",
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
        a: "Oui. Connectez-vous à votre compte, accédez à votre tableau de bord, et vous pouvez modifier ou supprimer vos avis. Les avis supprimés sont retirés sous 24h. Si vous n'avez plus accès à votre compte, contactez hello@mavilleideale.fr.",
      },
      {
        q: "Qu'est-ce que le Red Flag Radar ?",
        a: "Le Red Flag Radar est notre système de signalement de problèmes locaux : bruit, inondation, pollution, travaux, insécurité. Les signalements confirmés par plusieurs utilisateurs sont publiés sur la page dédiée et sur le profil de la ville concernée. L'objectif est de donner une information honnête que les annonces immobilières ne communiquent jamais.",
      },
    ],
  },
  {
    title: "Données et confidentialité",
    questions: [
      {
        q: "MaVilleIdéale vend-il des données à des tiers ?",
        a: "Non. Nous ne vendons, ne louons, ni ne partageons vos données personnelles avec des tiers à des fins commerciales. Nos partenaires techniques (Cloudflare pour l'hébergement) ont accès aux données strictement nécessaires à leur service. Voir notre politique de confidentialité complète.",
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
        a: "Le comparateur affiche deux villes côte à côte. Pour comparer plusieurs villes simultanément, utilisez le quiz qui vous propose un top 5 avec tableau comparatif sur l'ensemble des résultats.",
      },
    ],
  },
  {
    title: "Naviguer sur MaVilleIdéale",
    questions: [
      {
        q: "Comment trouver les villes par région ou département ?",
        a: `Accédez à /regions pour parcourir les ${REGIONS_COUNT} régions françaises (métropole + DROM) ou à /departements pour les ${DEPARTMENTS_COUNT} départements représentés. Chaque page liste les villes avec leurs scores et des indicateurs moyens par territoire.`,
      },
      {
        q: "Qu'est-ce que la page 'Quartiers' d'une ville ?",
        a: "Chaque ville analysée dispose d'une page /villes/[ville]/quartiers qui détaille 3 quartiers représentatifs avec leurs propres scores (sécurité, transport, nature, coût, vie nocturne), le loyer moyen d'un T2, et un résumé de l'ambiance. Idéal pour choisir précisément où habiter dans une ville.",
      },
      {
        q: "Comment fonctionne la carte interactive ?",
        a: `La carte interactive (/carte) affiche les ${CITIES_COUNT} villes analysées avec un code couleur selon leur score (vert = excellent, ambre = bon, rouge = à améliorer). Vous pouvez filtrer l'affichage par critère (nature, transport, coût...) et cliquer sur chaque ville pour accéder à son profil. La taille du cercle est proportionnelle au score.`,
      },
    ],
  },
  {
    title: "Guides & Conseils",
    questions: [
      {
        q: "Qu'est-ce que les guides MaVilleIdéale ?",
        a: "Les guides sont des articles longs et approfondis (7 à 12 minutes de lecture) qui couvrent des sujets de mobilité résidentielle : quitter Paris, s'installer en télétravail, choisir une ville pour sa famille, investissement immobilier, vivre en bord de mer à budget accessible, etc. Chaque guide est rédigé avec des données concrètes, des comparatifs de villes, et des conseils pratiques tirés de retours d'habitants.",
      },
      {
        q: "Comment sont organisés les guides ?",
        a: "Les guides sont classés par catégorie : Télétravail, Famille, Budget & Coût, Style de vie, Par région, et Comparaisons. Chaque guide est lié aux profils des villes qu'il mentionne, aux classements thématiques correspondants, et à d'autres guides connexes. Accédez à l'ensemble des 140 guides sur /guides.",
      },
      {
        q: "Puis-je suggérer un sujet de guide ?",
        a: "Oui. Utilisez le formulaire de contact (catégorie 'Suggestion de guide') pour nous proposer un sujet. Les demandes les plus fréquentes sont priorisées. Nos sujets les plus demandés pour 2026 : 'meilleures villes pour créer une entreprise', 'villes pour seniors en bonne santé', et 'meilleures villes pour les profils RSE/développement durable'.",
      },
      {
        q: "Les informations des guides sont-elles vérifiées ?",
        a: "Oui. Toutes les données chiffrées (loyers, prix au m2, temps de trajet, ensoleillement) sont sourcées depuis des données publiques (INSEE, notaires.fr, Météo-France) ou nos propres agrégations d'avis vérifiés. Les guides sont mis à jour annuellement. Si vous relevez une donnée incorrecte, signalez-la via le bouton 'Signaler une erreur' en bas de chaque guide.",
      },
    ],
  },
];

// Identité « Couleurs » : une bande par rubrique, jamais deux voisines identiques
// (6 rubriques → la 6e reprend l'indigo, séparée de la 1re par quatre bandes).
const SECTION_BANDS = ["band-indigo", "band-sky", "band-pink", "band-aqua", "band-lilac", "band-indigo"];
const SECTION_EMOJIS = ["📊", "💬", "🔒", "⚖️", "🧭", "📚"];
const CHIP_TONES = [
  "bg-[#EEF2FF] text-[#3730A3] ring-[#C7D2FE]",
  "bg-[#FDF2F8] text-[#9D174D] ring-[#FBCFE8]",
  "bg-[#ECFEFF] text-[#155E75] ring-[#A5F3FC]",
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
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="relative overflow-hidden bg-aurora pt-20 pb-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="flex justify-center mb-4">
            <EmojiBadge emoji="❓" tone="pink" size="lg" className="shadow-[0_12px_28px_-12px_rgba(219,39,119,0.5)]" />
          </div>
          <Badge variant="accent" className="mb-3">FAQ</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
            Questions <span className="font-display gradient-text italic pr-1">fréquentes</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
            Tout ce que vous voulez savoir sur MaVilleIdéale — les scores, les avis et la méthode.
          </p>
          <nav aria-label="Rubriques de la FAQ" className="mt-7 flex flex-wrap justify-center gap-2 text-xs font-semibold">
            {FAQ_SECTIONS.map((section, i) => {
              const tone = CHIP_TONES[i % CHIP_TONES.length];
              return (
                <a
                  key={section.title}
                  href={`#faq-${i + 1}`}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 ring-1 transition-transform hover:-translate-y-0.5 ${tone}`}
                >
                  <span aria-hidden="true">{SECTION_EMOJIS[i % SECTION_EMOJIS.length]}</span>
                  {section.title}
                </a>
              );
            })}
          </nav>
        </div>
      </section>

      {FAQ_SECTIONS.map((section, i) => {
        const band = SECTION_BANDS[i % SECTION_BANDS.length];
        return (
          <section key={section.title} id={`faq-${i + 1}`} className={`band ${band} scroll-mt-20 py-12`}>
            <div className="mx-auto max-w-3xl px-4 sm:px-6">
              <div className="flex items-center gap-3 mb-6">
                <EmojiBadge emoji={SECTION_EMOJIS[i % SECTION_EMOJIS.length]} tone={toneFor(i)} />
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-semibold text-[#4338CA]">
                    Rubrique {i + 1} / {FAQ_SECTIONS.length}
                  </p>
                  <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">{section.title}</h2>
                </div>
              </div>
              <div className="space-y-4">
                {section.questions.map((item, j) => (
                  <div
                    key={item.q}
                    className="flex gap-4 rounded-2xl bg-white p-5 shadow-[0_12px_30px_-22px_rgba(67,56,202,0.55)] ring-1 ring-[#E0E7FF]"
                  >
                    <span
                      aria-hidden="true"
                      className={`grad-head-${(i + j) % 6} flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold`}
                    >
                      Q
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)] mb-2">{item.q}</h3>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}

      <section className="band band-bold py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <span aria-hidden="true" className="text-3xl">💬</span>
          <p className="mt-2 text-xl font-semibold text-[var(--text-primary)] mb-2">Vous n&apos;avez pas trouvé votre réponse ?</p>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Notre équipe répond sous 48h ouvrables.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-white text-[#4338CA] font-semibold px-5 py-2.5 text-sm shadow-[0_10px_24px_-12px_rgba(0,0,0,0.35)] hover:-translate-y-0.5 transition-transform"
          >
            Contacter l&apos;équipe →
          </Link>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Link href="/methode" className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/35 hover:bg-white/25 transition-colors">
              Méthodologie →
            </Link>
            <Link href="/donnees" className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/35 hover:bg-white/25 transition-colors">
              Données & Sources →
            </Link>
            <Link href="/city-match" className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/35 hover:bg-white/25 transition-colors">
              Faire le quiz →
            </Link>
          </div>
        </div>
      </section>

      <StaticPageCrossLink exclude="/faq" />
      <Footer />
    </main>
  );
}
