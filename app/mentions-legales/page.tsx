import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Mentions légales · MeilleurVille",
  description:
    "Mentions légales de MeilleurVille : éditeur, hébergeur, contact, propriété intellectuelle et liens partenaires.",
  alternates: { canonical: "/mentions-legales" },
};

export default function MentionsLegalesPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Mentions légales
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            Conformément à la loi n°2004-575 du 21 juin 2004 pour la Confiance
            dans l&apos;Économie Numérique (LCEN), articles 6-III-1 et 6-III-2.
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1">
            Dernière mise à jour : 19 mai 2026.
          </p>
        </div>

        <div className="space-y-8 text-sm text-[var(--text-secondary)] leading-relaxed">
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Éditeur du site
            </h2>
            <p>
              <strong className="text-[var(--text-primary)]">
                Thomas Fendrich
              </strong>{" "}
              — Entrepreneur individuel
              <br />
              Val-d&apos;Oise (95), France
              <br />
              SIREN : 797 983 665 · SIRET (siège) : 797 983 665 00028
              <br />
              N° TVA intracommunautaire : FR28797983665
              <br />
              Inscrit au RNE depuis le 31/10/2013 (non inscrit au RCS).
              <br />
              Contact : hello@mavilleideale.fr · RGPD :
              privacy@mavilleideale.fr
            </p>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              L&apos;adresse du siège est consultable publiquement sur
              data.inpi.fr et annuaire-entreprises.data.gouv.fr à partir du
              SIREN ci-dessus, conformément à la publicité légale des
              entreprises individuelles.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Directeur de la publication
            </h2>
            <p>Thomas Fendrich.</p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Hébergement
            </h2>
            <p>
              Vercel Inc.
              <br />
              340 S Lemon Ave #4133
              <br />
              Walnut, CA 91789, États-Unis
              <br />
              Téléphone : +1 (559) 288-7060
              <br />
              Site : vercel.com
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Nom du domaine
            </h2>
            <p>
              mavilleideale.fr (version française) et bestcitiesinfrance.com
              (version anglaise). Les deux domaines sont édités par la même
              personne et hébergés par la même infrastructure.
            </p>
          </div>

          <div id="affiliation">
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Liens d&apos;affiliation
            </h2>
            <p>
              MeilleurVille participe au programme Booking.com Partners.
              Certains liens sortants vers Booking.com sont des liens
              partenaires. Si vous réservez un hébergement après avoir cliqué
              sur l&apos;un de ces liens, l&apos;éditeur peut percevoir une
              commission de la part de Booking — sans aucun surcoût pour vous,
              et sans aucun effet sur les prix affichés.
            </p>
            <p className="mt-2">
              Tous les liens concernés sont identifiés par la mention « lien
              partenaire » et portent l&apos;attribut HTML{" "}
              <code className="font-mono text-xs">rel=&quot;sponsored&quot;</code>
              , conformément aux recommandations de la DGCCRF et aux pratiques
              de l&apos;Autorité de Régulation Professionnelle de la
              Publicité.
            </p>
            <p className="mt-2">
              Le classement, les scores et les avis publiés sur le site sont
              indépendants des relations d&apos;affiliation. Aucune ville,
              aucun hébergement et aucune marque ne paie pour apparaître ou
              être mieux notée.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble du contenu du site MeilleurVille (textes,
              analyses, design, algorithmes, code) est protégé par le droit
              d&apos;auteur français. Toute reproduction sans autorisation
              expresse est interdite.
            </p>
            <p className="mt-2">
              Les données sources utilisées (Insee, data.gouv.fr,
              OpenStreetMap, Météo-France, Ministère de l&apos;Intérieur) sont
              soumises à leurs licences respectives — principalement Licence
              Ouverte 2.0 (Etalab) et ODbL pour OpenStreetMap.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Crédits technologiques
            </h2>
            <p>
              Ce site est construit avec Next.js (Vercel), Tailwind CSS, et
              utilise les API publiques Open-Meteo (météo) et les jeux de
              données ouverts de l&apos;Insee et data.gouv.fr.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Signalement de contenu illicite
            </h2>
            <p>
              Conformément à l&apos;article 6-I-5 de la LCEN, tout contenu
              jugé illicite peut être signalé à l&apos;adresse
              hello@mavilleideale.fr. Le signalement doit comporter la date,
              l&apos;identité du notifiant, la description précise du contenu
              et les motifs légaux pour lesquels il doit être retiré.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
              Droit applicable et litiges
            </h2>
            <p>
              Les présentes mentions légales sont régies par le droit
              français. En cas de litige, les parties s&apos;engagent à
              tenter une résolution amiable avant toute action judiciaire. À
              défaut, les tribunaux français seront seuls compétents.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
          <Link
            href="/confidentialite"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Politique de confidentialité →
          </Link>
          <Link
            href="/cgu"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            CGU →
          </Link>
          <Link
            href="/contact"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Contact →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
