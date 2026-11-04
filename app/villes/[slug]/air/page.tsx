import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { AirMeasuredCard } from "@/components/AirMeasuredCard";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityAirEvaluated } from "@/lib/city-air";
import {
  computeAirQuality,
  AIR_LEVEL_LABEL,
  AIR_LEVEL_COLOR,
  AIR_LEVEL_BG,
  AIR_MEASURED_MAX_KM,
  type AirDimension,
  type AirQuality,
} from "@/lib/air-quality";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { cityAlternates } from "@/lib/i18n";

// Les libellés de la lib sont au masculin (« Modéré ») ; ici ils qualifient
// « exposition », qui est féminin. Map locale plutôt que modification de la lib,
// dont les libellés servent aussi à d'autres surfaces.
const AIR_LEVEL_LABEL_F: Record<keyof typeof AIR_LEVEL_LABEL, string> = {
  faible: "faible",
  modere: "modérée",
  eleve: "élevée",
  fort: "forte",
};

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
  const a = computeAirQuality(city);
  // Le titre portait le même sous-titre générique sur les 540 villes
  // (« · NO2, particules, ozone, pollens ») : rien ne distinguait deux résultats
  // dans la SERP, et la queue passait 60 caractères dès que le nom était long.
  // Le score est ce qui différencie et ce qu'un chercheur scanne (GSC : 7 705
  // impressions sur /air, 1,4 % de clics en position ~9,5).
  const score = (10 - a.composite).toFixed(1).replace(".", ",");
  const titleBase = `Qualité de l'air à ${city.name} : ${score}/10`;
  const titleFull = `${titleBase} · NO2, particules, ozone`;
  return {
    title: titleFull.length <= 60 ? titleFull : titleBase,
    description: `${city.name} (${city.department}) : ${score}/10 pour la qualité de l'air, 10 = air le plus pur. Exposition ${AIR_LEVEL_LABEL_F[a.level]} — NO2, particules fines, ozone, pollens.`,
    alternates: cityAlternates("air", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Qualité de l'air à ${city.name} : ${score}/10`,
      description: `NO2 trafic, particules fines, ozone estival, pollens — synthèse pédagogique.`,
    },
  };
}

// Ce que la page peut dire de la provenance, ville par ville : les trois
// polluants mesurés, aucun, ou un mélange (pollens toujours estimés).
function provenance(a: AirQuality): { badge: string; caption: string } {
  if (a.measuredCount === 3) {
    return {
      badge: "NO2, PM2.5, ozone mesurés",
      caption: "10 = air le plus pur · NO2, particules fines et ozone mesurés en station de fond, pollens estimés",
    };
  }
  if (a.measuredCount > 0) {
    return {
      badge: "Mesure + estimation",
      caption: "10 = air le plus pur · en partie mesuré en station de fond, le reste estimé (modèle communal) — détail par polluant ci-dessous",
    };
  }
  return {
    badge: "Estimation structurelle",
    caption: "10 = air le plus pur · modèle communal, calé sur les repères ATMO / CITEPA / RNSA — pas une mesure en station",
  };
}

function AirBlock({ dim, label }: { dim: AirDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${AIR_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">
          {label}
          <span className="ml-2 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-tertiary)]">
            {dim.measured ? "mesuré" : "estimé"}
          </span>
        </div>
        <div className={`text-xs font-bold uppercase tracking-wide ${AIR_LEVEL_COLOR[dim.level]}`}>
          {AIR_LEVEL_LABEL[dim.level]}
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
          {(10 - dim.score).toFixed(1)}
          <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">/10</span>
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{dim.reason}</p>
    </div>
  );
}

export default async function AirPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const a = computeAirQuality(city);
  const prov = provenance(a);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Qualité de l'air", path: `/villes/${city.slug}/air` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quelle est la qualité de l'air à ${city.name} ?`,
      a: `${city.name} (${city.department}) obtient ${(10 - a.composite).toFixed(1)}/10 en qualité de l'air (10 = air le plus pur), soit une exposition ${AIR_LEVEL_LABEL_F[a.level]}. Détail : NO2 ${(10 - a.no2.score).toFixed(1)}/10, PM2.5 ${(10 - a.pm25.score).toFixed(1)}/10, ozone ${(10 - a.ozone.score).toFixed(1)}/10, pollens ${(10 - a.pollen.score).toFixed(1)}/10.`,
    },
    {
      q: `Où voir l'indice ATMO en temps réel à ${city.name} ?`,
      a: `Le site ATMO France (atmo-france.org) publie l'indice de qualité de l'air en temps réel (échelle 1-6, bon → extrêmement mauvais) avec carte interactive. L'association ATMO régionale couvre la commune et publie des bulletins prévisionnels à 3 jours.`,
    },
    {
      q: `Faut-il craindre les particules fines à ${city.name} ?`,
      a: a.pm25.reason,
    },
    {
      q: `Y a-t-il un risque allergo-pollinique à ${city.name} ?`,
      a: a.pollen.reason + ` Le RNSA (pollens.fr) publie chaque vendredi le bulletin allergo-pollinique national avec carte par bassin.`,
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
          <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-head-0 text-xl shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)]">🌬️</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Qualité de l&apos;air à {city.name}
          </h1>
        </div>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Exposition moyenne de {city.name} à quatre familles de pollution : dioxyde d&apos;azote,
          particules fines, ozone et pollens.{" "}
          {a.measuredCount > 0 ? (
            <>
              {a.measuredCount === 3 ? "Les trois polluants sont" : a.measuredCount === 2 ? "Deux des trois polluants sont" : "Un des trois polluants est"}{" "}
              <strong>{a.measuredCount === 1 ? "mesuré" : "mesurés"}</strong> :{" "}
              {a.measuredCount === 1 ? "sa note dérive" : "leur note dérive"} de la moyenne annuelle d&apos;une station de fond
              urbaine ou périurbaine à moins de {AIR_MEASURED_MAX_KM} km, lue contre le seuil OMS et la
              limite européenne 2030.{" "}
            </>
          ) : (
            <>
              Aucune station de fond urbaine ou périurbaine n&apos;est à moins de {AIR_MEASURED_MAX_KM} km :
              les notes sont <strong>estimées</strong> par un modèle communal (taille, département, climat),
              pas mesurées.{" "}
            </>
          )}
          Les pollens restent <strong>estimés</strong> par bassin, d&apos;après les repères du RNSA,
          sans reprendre ses relevés. Les moyennes mesurées des stations proches (jusqu&apos;à 25 km)
          sont détaillées juste en dessous. Pour la mesure horaire, consultez{" "}
          <a
            href="https://www.atmo-france.org/article/lindice-atmo"
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            ATMO France
          </a>.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>{prov.badge}</Badge>
          <Badge>Cadres de référence : ATMO · CITEPA · RNSA</Badge>
        </div>
        </div>
      </section>

      {/* Mesures en station — bande aqua (seulement si la ville a été évaluée) */}
      {cityAirEvaluated(city.slug) && (
        <section className="band band-aqua py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <AirMeasuredCard slug={city.slug} cityName={city.name} />
          </div>
        </section>
      )}

      {/* Score composite + quatre polluants — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${AIR_LEVEL_COLOR[a.level]}`}>
              Exposition {AIR_LEVEL_LABEL_F[a.level]}
            </span>
          </div>
          {/* La page est nommée « Qualité de l'air » : le score doit donc suivre
              ce nom (10 = air le plus pur). Le moteur mesure l'exposition
              (10 = pire), on l'inverse à l'affichage — comme la version EN. */}
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {(10 - a.composite).toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          {/* La légende disait « · ATMO · CITEPA · RNSA », ce qui se lit comme
              « chiffre publié par ces organismes ». Il ne l'est pas : la
              méthodologie plus bas dit bien « proxy à partir de la population ».
              La légende dit maintenant la même chose que la méthodologie. */}
          <p className="text-[11px] text-[var(--text-tertiary)] mb-2">{prov.caption}</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{a.signature}</p>
        </div>

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-bold text-[var(--text-primary)]">Les quatre polluants suivis</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AirBlock dim={a.no2} label="NO2 — trafic" />
          <AirBlock dim={a.pm25} label="PM2.5 — particules fines" />
          <AirBlock dim={a.ozone} label="Ozone — pic estival" />
          <AirBlock dim={a.pollen} label="Pollens" />
        </div>
        </div>
      </section>

      {/* Méthodologie — bande ciel */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold"><span className="gradient-text">Méthodologie</span></h2>
        <div className="mt-3 rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(8,145,178,0.5)]">
          <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
            <li>
              <strong className="text-[var(--text-primary)]">NO2 (trafic) :</strong> moyenne
              annuelle mesurée à la station de fond quand elle est à moins de {AIR_MEASURED_MAX_KM} km
              (seuil OMS de 10 µg/m³ → 6,5/10, limite européenne 2030 de 20 µg/m³ → 2,5/10). Sans
              station, estimation à partir de la population, du statut métropolitain et d&apos;un
              couloir autoroutier majeur dans le département.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">PM2.5 (particules fines) :</strong>{" "}
              moyenne annuelle mesurée de la même façon (seuil OMS de 5 µg/m³ → 8,5/10, limite
              européenne 2030 de 10 µg/m³ → 4,5/10). Sans station, estimation qui cumule industrie
              lourde, chauffage bois domestique (1ʳᵉ source nationale selon le CITEPA) et inversion
              thermique dans les vallées encaissées.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Ozone (O3) :</strong> nombre de
              jours de l&apos;année où la moyenne sur 8 heures a dépassé 120 µg/m³ (valeur cible
              européenne : 25 jours au plus → 2,5/10). Une seule année : l&apos;ozone dépend de
              l&apos;été. Sans station, estimation par la chaleur, l&apos;ensoleillement et la
              géographie (arc méditerranéen, couloir rhodanien).
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Pollens (toujours estimés) :</strong> bassins
              allergisants identifiés par le RNSA — cyprès (Méditerranée), ambroisie
              (vallée du Rhône, en expansion), graminées (plaines agricoles ouvertes),
              bouleau (moitié nord).
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            Une station de fond mesure l&apos;air qu&apos;on respire chez soi, loin du trafic
            direct : le long d&apos;un boulevard, le NO2 est nettement plus fort. Une station
            rurale n&apos;est pas retenue pour noter une ville, elle mesure la campagne. Pour la
            mesure à l&apos;adresse, consultez l&apos;association agréée de surveillance de la
            qualité de l&apos;air de votre région.
          </p>
        </div>
        </div>
      </section>

      {/* Renvois + discussion — bande blanche */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
          <Link href={`/villes/${city.slug}/climat-2040`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🌡️</span><span>Climat 2040</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Canicule, nuits tropicales</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/transports`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🚊</span><span>Transports</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Trafic, vélo, transports en commun</div>
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
