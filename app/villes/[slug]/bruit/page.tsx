import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeNoiseExposure,
  NOISE_LEVEL_LABEL,
  NOISE_LEVEL_COLOR,
  NOISE_LEVEL_BG,
  type NoiseDimension,
} from "@/lib/noise-exposure";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternates } from "@/lib/i18n";

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
  const n = computeNoiseExposure(city);
  return {
    title: `Bruit à ${city.name} · routier, aérien, ferroviaire, nocturne`,
    description: `Synthèse du bruit à ${city.name} (${city.department}) : routier ${NOISE_LEVEL_LABEL[n.road.level].toLowerCase()}, aérien ${NOISE_LEVEL_LABEL[n.aircraft.level].toLowerCase()}, ferroviaire ${NOISE_LEVEL_LABEL[n.rail.level].toLowerCase()}, nocturne ${NOISE_LEVEL_LABEL[n.urbanNight.level].toLowerCase()}. Score composite ${n.composite}/10.`,
    alternates: cityAlternates("bruit", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Bruit à ${city.name}`,
      description: `Routier, aérien, ferroviaire, nocturne — estimation communale, repères CBS / OMS.`,
    },
  };
}

function NoiseBlock({ dim, label }: { dim: NoiseDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${NOISE_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${NOISE_LEVEL_COLOR[dim.level]}`}>
          {NOISE_LEVEL_LABEL[dim.level]}
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

export default async function BruitPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const n = computeNoiseExposure(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Bruit", path: `/villes/${city.slug}/bruit` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Le bruit est-il un problème à ${city.name} ?`,
      a: `${city.name} (${city.department}) présente une exposition composite ${NOISE_LEVEL_LABEL[n.level].toLowerCase()} (${n.composite}/10). Détail : routier ${n.road.score}/10, aérien ${n.aircraft.score}/10, ferroviaire ${n.rail.score}/10, vie nocturne ${n.urbanNight.score}/10.`,
    },
    {
      q: `Où trouver la carte de bruit officielle de ${city.name} ?`,
      a: `Les communes de plus de 100 000 habitants publient une Carte de Bruit Stratégique (CBS) tous les 5 ans (directive 2002/49/CE). Elle est généralement accessible sur le site de la métropole ou de la préfecture. Pour l'Île-de-France, Bruitparif (bruitparif.fr) propose des cartes interactives Lden et Lnight à l'adresse.`,
    },
    {
      q: `Y a-t-il un aéroport gênant à ${city.name} ?`,
      a: n.aircraft.reason,
    },
    {
      q: `Le centre-ville de ${city.name} est-il bruyant la nuit ?`,
      a: n.urbanNight.reason,
    },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(faq)} />
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-aurora pt-12 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <div className="flex items-center gap-3">
          <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-head-0 text-xl shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)]">🔊</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Bruit à {city.name}
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Profil <strong>structurel</strong> des quatre sources de bruit majeures suivies par
          les Cartes de Bruit Stratégiques (directive européenne 2002/49/CE) : ce que la taille,
          la géographie et les infrastructures de {city.name} impliquent en exposition moyenne.
          Les niveaux ci-dessous sont <strong>estimés</strong>, pas relevés — ils suivent le
          découpage des CBS, des plans d&apos;exposition au bruit (PEB) de la DGAC et de
          l&apos;observatoire Bruitparif, sans reprendre leurs mesures. Pour la
          carte précise à l&apos;adresse, consultez la CBS de votre métropole ou{" "}
          <a
            href="https://www.bruitparif.fr/"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Bruitparif
          </a>{" "}
          en Île-de-France.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Estimation structurelle</Badge>
          <Badge>Cadres de référence : CBS · PEB · Bruitparif</Badge>
        </div>
        </div>
      </section>

      {/* Score composite + quatre sources — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${NOISE_LEVEL_COLOR[n.level]}`}>
              Exposition {NOISE_LEVEL_LABEL[n.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {n.composite.toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          {/* La page est nommée pour la nuisance : le score brut du moteur est
              correct (10 = pire), mais il faut le dire — sans légende, 8,2/10
              se lit comme une bonne note. La jumelle EN affiche « 10 = loudest ». */}
          {/* Même correctif que la page air : la légende ne doit pas laisser
              croire que le nombre sort d'une CBS. Il est calculé depuis le
              seed — la méthodologie plus bas le dit, la légende aussi. */}
          <p className="text-xs text-[var(--text-tertiary)] mb-3">10 = exposition au bruit maximale · 0 = commune silencieuse · modèle communal calé sur les repères CBS / PEB / Bruitparif — pas un relevé acoustique.</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{n.signature}</p>
        </div>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-bold text-[var(--text-primary)]">Les quatre sources suivies</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NoiseBlock dim={n.road} label="Routier — autoroute, périphérique, axes" />
          <NoiseBlock dim={n.aircraft} label="Aérien — couloir d'aéroport (PEB)" />
          <NoiseBlock dim={n.rail} label="Ferroviaire — LGV, ligne classique" />
          <NoiseBlock dim={n.urbanNight} label="Nocturne — vie de centre-ville" />
        </div>

        {/* Le revers du couloir aérien, dit seulement là où il existe : la
            condition est le niveau de la dimension aérienne elle-même, pas un
            seuil inventé — 49 villes sur 593 sortent du niveau « faible » (mesure du 2026-10-21). Le
            profil renvoyé porte l'avertissement symétrique : son barème ne
            pondère pas le bruit des avions et il renvoie au PEB, qui est le
            document opposable. */}
        {n.aircraft.level !== "faible" && (
          <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
            Vivre sous une trajectoire a un revers, et il vaut d&apos;être posé en face :
            une plateforme proche est aussi ce qui rend un aller-retour possible dans la
            journée.{" "}
            <Link href="/pour-qui/famille-a-l-etranger" className="underline">
              Les villes classées pour une famille restée à l&apos;étranger
            </Link>{" "}
            mesurent cet accès-là — le plafond de la plateforme autant que la distance qui
            l&apos;en sépare — et disent, elles aussi, que leur barème ne pondère pas le
            bruit des avions. Aucune des deux pages ne remplace le plan
            d&apos;exposition au bruit de l&apos;aéroport, seul document opposable,
            consultable parcelle par parcelle en mairie et sur le Géoportail de
            l&apos;urbanisme.
          </p>
        )}

        </div>
      </section>

      {/* Méthodologie — bande ciel */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold"><span className="gradient-text">Méthodologie</span></h2>
        <div className="mt-3 rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">Routier :</strong> identification
              des communes traversées par un périphérique ou rocade saturée (&gt; 100 000
              véh/jour) + couloirs autoroutiers majeurs au département. Seuil OMS jour :
              Lden 53 dB(A).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Aérien :</strong> classement
              par zone PEB (A à D) autour des 10 plus grands aéroports français. Les zones
              A et B sont incompatibles avec l&apos;habitat neuf.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Ferroviaire :</strong> présence
              d&apos;une LGV ou ligne classique &gt; 100 trains/jour dans le département.
              Bandeau Lden &gt; 65 dB(A) sur 100-200 m de part et d&apos;autre des voies.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Nocturne :</strong> cumul des
              tags étudiant / festif / touristique / métropole. Approche du Lnight en
              centre-ville. Seuil OMS nuit : 45 dB(A).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Le bruit s&apos;atténue très vite avec la distance (-3 dB(A) pour un doublement).
            Un même score peut recouvrir des situations très différentes selon l&apos;adresse
            (étage élevé sur cour vs RDC sur boulevard). La CBS communale reste la référence.
          </p>
        </div>
        </div>
      </section>

      {/* Renvois + discussion — bande blanche */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/air`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🌬️</span><span>Qualité de l&apos;air</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">NO2, particules, ozone, pollens</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/risques`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>⚠️</span><span>Risques naturels</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Inondation, argile, feux, sismicité</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/eau`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>💧</span><span>Stress hydrique</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Sécheresse, nappes, restrictions</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/transports`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🚊</span><span>Transports</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Trafic, vélo, transports en commun</div>
            </div>
          </Link>
          <Link href="/pour-qui/sensibles-au-bruit" className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🤫</span><span>Top villes pour sensibles au bruit</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Classement calibré exposition sonore + nature + air</div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-sm">
          <Link href="/environnement" className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#3730A3] shadow-sm ring-1 ring-[var(--band-indigo)] transition-colors hover:bg-[var(--band-indigo)]">
            → Classement national des villes les plus saines
          </Link>
        </div>

        <div className="mt-10">
          <DiscussionCTA citySlug={city.slug} cityName={city.name} />
        </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
