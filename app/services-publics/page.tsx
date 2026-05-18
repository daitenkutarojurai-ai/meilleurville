import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  topBestServices,
  topServicesDesert,
  SERVICES_LEVEL_LABEL,
  SERVICES_LEVEL_COLOR,
} from "@/lib/public-services";
import { MACRO_REGIONS } from "@/lib/macro-regions";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CITIES_COUNT } from "@/lib/site-stats";

export const revalidate = false;

export const metadata: Metadata = {
  title: "Services publics en France · accès écoles, Poste, mairie, médiathèque 2026",
  description:
    "Classement national de l'accès aux services publics par ville française : écoles, La Poste & France Services, mairie, médiathèque. Top 30 mieux desservies vs. top 20 désertiques.",
  alternates: { canonical: "/services-publics" },
  openGraph: {
    title: "Services publics en France · palmarès 2026",
    description:
      "Top 30 villes au meilleur accès aux services publics vs. top 20 zones désertiques.",
  },
};

const MIN_POP = 15_000;

export default function PublicServicesHubPage() {
  const best = topBestServices(30, MIN_POP);
  const desert = topServicesDesert(20, MIN_POP);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Services publics", path: "/services-publics" },
  ]);

  const faq = faqJsonLd([
    {
      q: "Quelles villes françaises offrent le meilleur accès aux services publics ?",
      a: `Selon notre composite F60 (écoles 35 % + mairie 25 % + La Poste 25 % + médiathèque 15 %), les villes ≥ 15 000 hab. au meilleur maillage sont : ${best
        .slice(0, 5)
        .map((c) => `${c.name} (${c.services.composite}/10)`)
        .join(", ")}. Score faible = bon accès.`,
    },
    {
      q: "Quelles villes sont en désert de services publics ?",
      a: `Les villes ≥ 15 000 hab. au composite le plus élevé sont : ${desert
        .slice(0, 5)
        .map((c) => `${c.name} (${c.services.composite}/10)`)
        .join(", ")}. Ce score traduit un cumul de tensions sur écoles, La Poste, mairie ou médiathèque — souvent lié à la ruralité de l'arrière-pays départemental ou aux DROM les plus tendus.`,
    },
    {
      q: "Comment ce classement est-il calculé ?",
      a: "Composite agrégeant 4 dimensions : écoles & petite enfance (35 %, annuaire DEPP + tension crèche CAF), mairie & démarches (25 %, amplitude + France Services), La Poste & France Services (25 %, bureaux + APC + RPC + ~2 800 MFS), médiathèque (15 %, BNF observatoire lecture publique). Score 0-10, 10 = déficit max.",
    },
    {
      q: "Où trouver les coordonnées officielles des services publics près de chez moi ?",
      a: "L'annuaire de l'administration sur lannuaire.service-public.fr liste toutes les mairies, antennes CAF/CPAM, Pôle Emploi, impôts. La carte des Maisons France Services est sur france-services.gouv.fr. Pour les bureaux de Poste, La Poste publie la carte officielle sur laposte.fr.",
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Services publics en France
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)] max-w-3xl">
          Index composite agrégeant quatre piliers du quotidien : écoles &amp;
          petite enfance, mairie &amp; démarches, La Poste &amp; France Services,
          médiathèque. Score 0-10, 10 = déficit maximum. Filtre 15 000 habitants
          minimum.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>4 dimensions · {CITIES_COUNT} villes</Badge>
          <Badge>Pondération écoles 35 % · mairie 25 % · Poste 25 % · médiath. 15 %</Badge>
        </div>

        {/* Top best */}
        <h2 className="mt-10 text-2xl font-semibold text-[var(--text-primary)]">
          Top 30 — villes au meilleur accès aux services publics
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Grandes métropoles, IDF dense, villes moyennes &gt; 30 000 hab. Toutes
          dimensions opérationnelles, France Services présente.
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Écoles</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Médiath.</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Poste</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Mairie</th>
                </tr>
              </thead>
              <tbody>
                {best.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/services-publics`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className={`font-bold tabular-nums ${SERVICES_LEVEL_COLOR[c.services.level]}`}>
                        {c.services.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">
                        {SERVICES_LEVEL_LABEL[c.services.level]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.services.schools.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.services.library.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.services.postOffice.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.services.cityHall.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <p className="text-xs text-[var(--text-tertiary)] mt-2">
          Lecture : 10 = déficit maximum. Score &lt; 3 = maillage complet.
        </p>

        {/* Desert */}
        <h2 className="mt-12 text-2xl font-semibold text-[var(--text-primary)]">
          Top 20 — villes en désert de services publics
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Communes ≥ 15 000 hab. cumulant tensions sur plusieurs dimensions.
          Souvent ruralité de l&apos;arrière-pays départemental, parfois DROM
          (Guyane / Mayotte particulièrement).
        </p>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-elevated)] text-xs uppercase tracking-wide text-[var(--text-tertiary)]">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Ville</th>
                  <th className="px-3 py-2 text-left">Région</th>
                  <th className="px-3 py-2 text-right">Composite</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Écoles</th>
                  <th className="px-3 py-2 text-right hidden sm:table-cell">Poste</th>
                  <th className="px-3 py-2 text-right hidden md:table-cell">Mairie</th>
                </tr>
              </thead>
              <tbody>
                {desert.map((c, i) => (
                  <tr key={c.slug} className="border-t border-[var(--border)]">
                    <td className="px-3 py-2 text-[var(--text-tertiary)] tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/villes/${c.slug}/services-publics`}
                        className="font-semibold text-[var(--text-primary)] hover:text-[var(--accent)]"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-[var(--text-tertiary)]">{c.region}</td>
                    <td className="px-3 py-2 text-right">
                      <span className="font-bold tabular-nums text-red-600">
                        {c.services.composite.toFixed(1)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)] ml-1">/10</span>
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.services.schools.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden sm:table-cell">{c.services.postOffice.score.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right tabular-nums text-[var(--text-secondary)] hidden md:table-cell">{c.services.cityHall.score.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Methodology */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Écoles &amp; enfance (35 %)</strong> —
              annuaire DEPP (écoles, collèges, lycées) + tension crèche CAF par
              dept. Communes &gt; 30 000 hab. : maillage complet. Bourgs &lt; 5 000
              hab. : RPI + bus scolaire.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Mairie &amp; démarches (25 %)</strong> —
              amplitude d&apos;ouverture + démarches CNI / passeport en présence
              + Maison France Services (~2 800 implantations 2024).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">La Poste &amp; France Services (25 %)</strong> —
              bureaux de Poste, APC, RPC. Malus pour départements en recul du
              maillage La Poste (Creuse, Cantal, Lozère, Allier…) et DROM
              très tendus.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Médiathèque (15 %)</strong> —
              BNF Observatoire lecture publique. Présence quasi-systématique
              &gt; 10 000 hab.
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Maillage proxyé par strate population × département. Pour le détail
            point par point, l&apos;annuaire de l&apos;administration sur
            service-public.fr reste la référence officielle à jour.
          </p>
        </Card>

        {/* Macro-region breakdown */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Par macro-région
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          L&apos;accès aux services publics oppose nettement l&apos;Île-de-France
          et l&apos;arc-méditerranéen denses à la côte atlantique villes moyennes
          et au Sud-Ouest rural. Vue restreinte à chaque zone.
        </p>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {MACRO_REGIONS.map((m) => (
            <Link key={m.slug} href={`/services-publics/${m.slug}`} className="block">
              <Card className="hover:shadow-md transition-shadow h-full">
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{m.label}</div>
                <div className="text-xs text-[var(--text-tertiary)] mt-1">Top mieux desservies + désertiques</div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Cross-links */}
        <h2 className="mt-12 text-xl font-semibold text-[var(--text-primary)]">
          Voir aussi
        </h2>
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Link href="/cadre-de-vie" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🌿</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Cadre de vie</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Méga-index env + santé + emploi</div>
            </Card>
          </Link>
          <Link href="/sante" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">🩺</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Accès aux soins</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Médecins, urgences, déserts</div>
            </Card>
          </Link>
          <Link href="/demographie" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-2xl mb-1">👥</div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">Démographie</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Vieillis. → tension services</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
