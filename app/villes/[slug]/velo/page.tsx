import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeCyclingMobility,
  CYCLING_LEVEL_LABEL,
  CYCLING_LEVEL_COLOR,
  CYCLING_LEVEL_BG,
  type CyclingDimension,
} from "@/lib/cycling-mobility";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";

export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const c = computeCyclingMobility(city);
  return {
    title: `Vivre à vélo à ${city.name} · réseau, relief, sécurité`,
    description: `Synthèse de la cyclabilité à ${city.name} (${city.department}) : réseau ${CYCLING_LEVEL_LABEL[c.network.level].toLowerCase()}, relief ${CYCLING_LEVEL_LABEL[c.topography.level].toLowerCase()}, sécurité ${CYCLING_LEVEL_LABEL[c.safety.level].toLowerCase()}, climat ${CYCLING_LEVEL_LABEL[c.climate.level].toLowerCase()}. Score ${c.composite}/10.`,
    alternates: { canonical: `/villes/${slug}/velo` },
    openGraph: {
      title: `Vivre à vélo à ${city.name}`,
      description: `Réseau cyclable, relief, sécurité et climat — synthèse pédagogique.`,
    },
  };
}

function CyclingBlock({ dim, label }: { dim: CyclingDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${CYCLING_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${CYCLING_LEVEL_COLOR[dim.level]}`}>
          {CYCLING_LEVEL_LABEL[dim.level]}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {dim.score.toFixed(1)}
          <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{dim.reason}</p>
    </div>
  );
}

export default async function VeloPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const c = computeCyclingMobility(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Mobilité vélo", path: `/villes/${city.slug}/velo` },
  ]);

  const faq = faqJsonLd([
    {
      q: `${city.name} est-elle une ville cyclable ?`,
      a: `${city.name} obtient un score composite ${c.composite}/10 (${CYCLING_LEVEL_LABEL[c.level].toLowerCase()}). Détail : réseau ${c.network.score}/10, relief ${c.topography.score}/10, sécurité ${c.safety.score}/10, climat ${c.climate.score}/10. ${c.signature}`,
    },
    {
      q: `Où consulter le Baromètre FUB pour ${city.name} ?`,
      a: `Le Baromètre des Villes Cyclables FUB (parlons-velo.fr) publie tous les 2 ans un classement basé sur l'enquête citoyenne (> 270 000 réponses en 2025). Vélo & Territoires (velo-territoires.org) suit aussi l'avancement des Schémas Directeurs Vélo par EPCI.`,
    },
    {
      q: `Le relief est-il un problème pour rouler à ${city.name} ?`,
      a: c.topography.reason,
    },
    {
      q: `Quels itinéraires longue distance partent de ${city.name} ?`,
      a: `Les itinéraires EuroVelo et véloroutes France Vélo Tourisme (francevelotourisme.com) cartographient l'ensemble des voies vertes en France : EV1 Vélodyssée (Atlantique), EV3 Scandibérique (Nord-Sud), EV6 Loire à Vélo, EV8 Méditerranée, EV17 ViaRhôna. Géovélo (geovelo.fr) propose des itinéraires sécurisés en application.`,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Vivre à vélo à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre dimensions qui déterminent la praticabilité du
          vélo au quotidien : réseau cyclable, topographie, sécurité et climat. Sources :{" "}
          <a
            href="https://parlons-velo.fr"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Baromètre FUB
          </a>{" "}
          ·{" "}
          <a
            href="https://www.velo-territoires.org"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Vélo & Territoires
          </a>{" "}
          · Géovélo · INSEE.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Synthèse pédagogique</Badge>
          <Badge>FUB · Vélo & Territoires · Géovélo</Badge>
        </div>

        {/* Composite hero */}
        <Card className={`mt-6 border-l-4 ${CYCLING_LEVEL_BG[c.level].replace('bg-', 'border-l-').replace('-50', '-500').split(' ')[0]}`}>
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${CYCLING_LEVEL_COLOR[c.level]}`}>
              Cyclabilité {CYCLING_LEVEL_LABEL[c.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {c.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{c.signature}</p>
        </Card>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <CyclingBlock dim={c.network} label="Réseau cyclable" />
          <CyclingBlock dim={c.topography} label="Topographie" />
          <CyclingBlock dim={c.safety} label="Sécurité" />
          <CyclingBlock dim={c.climate} label="Climat cyclable" />
        </div>

        {/* Methodology */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Méthodologie</h2>
        <Card className="mt-3">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Réseau (35 %) :</strong> proxy
              dérivé des Baromètres FUB / Vélo & Territoires (ville régulièrement primée),
              du statut métropolitain et de la présence sur un itinéraire EuroVelo
              structurant (EV1, EV3, EV6, EV8, EV17).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Topographie (25 %) :</strong>{" "}
              malus département vallonné (Massif Central, Alpes, Pyrénées, Vosges, Jura) et
              altitude &gt; 500 m. Bonus plaine (Beauce, Aquitaine, Loire, Nord-Picardie).
              Au-delà de 4 % de pente moyenne, le vélo musculaire devient dissuasif.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Sécurité (25 %) :</strong>{" "}
              combine densité urbaine (trafic) et niveau d&apos;aménagement. Les villes
              cyclables connues compensent la densité par des pistes séparées ; les
              grandes métropoles non-cyclables cumulent trafic dense + discontinuités.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Climat (15 %) :</strong>{" "}
              ensoleillement, température hivernale, et vent dominant. Bonus Sud
              ensoleillé hors couloir rhodanien venteux. Malus côte atlantique (vent
              dominant fort) et hivers froids (verglas plusieurs semaines).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Score à l&apos;échelle communale. À l&apos;adresse, l&apos;expérience varie
            fortement selon le quartier (centre vs. périphérie péri-urbaine non aménagée).
            Pour un itinéraire réel, Géovélo et OpenStreetMap offrent les meilleures
            cartes vélo à jour.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/transports`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🚊</span><span>Transports en commun</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Métro, tram, bus, intermodalité</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/air`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🌬️</span><span>Qualité de l&apos;air</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">NO2 trafic, PM2.5, ozone</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/teletravail`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>💻</span><span>Télétravailler à {city.name}</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Vélo + remote, combo gagnant</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/climat-2040`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🌡️</span><span>Climat 2040</span></div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">Canicule, nuits tropicales</div>
            </Card>
          </Link>
        </div>

        <div className="mt-8 text-sm">
          <Link href="/cadre-de-vie" className="text-[var(--accent)] hover:underline">
            → Index Cadre de Vie national (env + santé + emploi)
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-8">
        <DiscussionCTA citySlug={city.slug} cityName={city.name} />
      </section>

      <Footer />
    </main>
  );
}
