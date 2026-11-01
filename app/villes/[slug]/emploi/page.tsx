import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  computeEmploymentMarket,
  JOB_LEVEL_LABEL,
  JOB_LEVEL_COLOR,
  JOB_LEVEL_BG,
  type JobDimension,
} from "@/lib/employment-market";
import { borderCommute } from "@/lib/profile-pages";
import {
  BTS_SOURCE_URL,
  JOB_GROWTH_NATIONAL,
  JOBS_FROM,
  RP_SOURCE_URL,
  RP_YEAR,
  SALARY_NATIONAL,
  SALARY_YEAR,
  UNEMPLOYMENT_NATIONAL,
} from "@/lib/city-employment";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/jsonld";
import { clampMeta, fitTitle } from "@/lib/brand";
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
  const e = computeEmploymentMarket(city);
  return {
    title: fitTitle(`Emploi & chômage à ${city.name} · marché du travail 2026`),
    description: clampMeta(`Synthèse du marché du travail à ${city.name} (${city.department}) : chômage ${JOB_LEVEL_LABEL[e.unemployment.level].toLowerCase()}, dynamisme ${JOB_LEVEL_LABEL[e.dynamism.level].toLowerCase()}, mix sectoriel ${JOB_LEVEL_LABEL[e.sectorMix.level].toLowerCase()}, salaires ${JOB_LEVEL_LABEL[e.salary.level].toLowerCase()}. Score ${(10 - e.composite).toFixed(1)}/10 (10 = marché dynamique).`),
    alternates: cityAlternates("emploi", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Emploi à ${city.name}`,
      description: e.measured
        ? `Chômage (recensement), évolution de l'emploi et salaires relevés par l'Insee ; mix sectoriel estimé.`
        : `Chômage, dynamisme entrepreneurial, mix sectoriel, salaire médian — estimation communale, pas le taux publié pour la commune.`,
    },
  };
}

function JobBlock({ dim, label }: { dim: JobDimension; label: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${JOB_LEVEL_BG[dim.level]}`}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{label}</div>
        <div className={`text-xs font-bold uppercase tracking-wide ${JOB_LEVEL_COLOR[dim.level]}`}>
          {JOB_LEVEL_LABEL[dim.level]}
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

export default async function EmploiPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const e = computeEmploymentMarket(city);
  const m = e.measured;
  const fr1 = (n: number) => n.toFixed(1).replace(".", ",");
  // Le pôle d'emploi étranger le plus proche, quand il y en a un dans le champ du
  // barème (89 villes sur 540). Sert uniquement à décider si le renvoi frontalier
  // en bas de page a un sens ici : aucun kilométrage n'est publié, il vit sur
  // /pour-qui/travailleurs-frontaliers.
  const border = borderCommute(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Emploi", path: `/villes/${city.slug}/emploi` },
  ]);

  const faq = faqJsonLd([
    {
      q: `Quel est le taux de chômage à ${city.name} ?`,
      a: e.measured?.unemployment !== undefined
        ? e.unemployment.reason
        : e.unemployment.reason + ` Ce niveau est estimé : il range le département dans un palier calé sur l'ordre de grandeur du taux trimestriel INSEE, il ne reprend pas le taux publié. Les séries réelles sont sur insee.fr/fr/statistiques.`,
    },
    {
      q: `Est-il facile de trouver un emploi à ${city.name} ?`,
      a: `${city.name} (${city.department}) présente un composite marché du travail ${JOB_LEVEL_LABEL[e.level].toLowerCase()} (${(10 - e.composite).toFixed(1)}/10, 10 = dynamique). Détail : chômage ${(10 - e.unemployment.score).toFixed(1)}/10, dynamisme ${(10 - e.dynamism.score).toFixed(1)}/10, mix sectoriel ${(10 - e.sectorMix.score).toFixed(1)}/10, salaires ${(10 - e.salary.score).toFixed(1)}/10.`,
    },
    {
      q: `Quels secteurs recrutent à ${city.name} ?`,
      a: e.sectorMix.reason + ` Pour les offres en temps réel, France Travail (francetravail.fr) et les annonces Apec / Hellowork couvrent l'essentiel des recrutements actifs.`,
    },
    {
      q: `Le salaire médian est-il suffisant pour vivre à ${city.name} ?`,
      a: e.salary.reason + ` À croiser avec notre simulateur de coût réel et le ratio loyer/salaire local.`,
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
          <span aria-hidden className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl grad-head-0 text-xl shadow-[0_10px_24px_-12px_rgba(79,70,229,0.7)]">💼</span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            Emploi & marché du travail à {city.name}
          </h1>
        </div>
        {m ? (
          <p className="mt-3 text-base text-[var(--text-secondary)]">
            Quatre dimensions du marché du travail local : chômage, dynamisme, mix sectoriel
            (résilience) et salaires. Trois sont <strong>mesurées</strong> pour {city.name}{" "}
            par l&apos;Insee : le chômage des habitants au recensement, l&apos;évolution des
            emplois situés dans la commune et le salaire moyen de ces emplois dans le
            secteur privé. Le mix sectoriel reste <strong>estimé</strong> d&apos;après le
            département et le profil de la ville.
          </p>
        ) : (
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Synthèse pédagogique des quatre dimensions clés du marché du travail local :
          chômage, dynamisme entrepreneurial, mix sectoriel (résilience), salaire net
          médian. Les quatre niveaux sont <strong>estimés</strong> à partir du département,
          de la taille de la commune et de ses tags d&apos;activité — ils rangent le
          département dans des paliers calés sur les ordres de grandeur du chômage
          trimestriel INSEE, des flux SIRENE, des séries DARES et des salaires DADS,{" "}
          <strong>sans reprendre aucune de ces séries</strong>. Ce n&apos;est donc ni le taux
          de chômage publié pour {city.name}, ni un salaire médian relevé sur place.
        </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {m ? (
            <>
              <Badge>Mesuré : Insee, recensement {RP_YEAR} · salaires {SALARY_YEAR}</Badge>
              <Badge>Mix sectoriel : estimation</Badge>
            </>
          ) : (
            <>
              <Badge>Estimation structurelle</Badge>
              <Badge>Cadres de référence : INSEE · DARES · SIRENE</Badge>
            </>
          )}
        </div>
        </div>
      </section>

      {/* Score composite + quatre dimensions — bande indigo */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-white p-5 sm:p-6 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">Score composite</h2>
            <span className={`text-xs font-bold uppercase ${JOB_LEVEL_COLOR[e.level]}`}>
              Marché {JOB_LEVEL_LABEL[e.level].toLowerCase()}
            </span>
          </div>
          <div className="text-4xl font-bold tabular-nums text-[var(--text-primary)] mb-3">
            {(10 - e.composite).toFixed(1)}
            <span className="text-lg font-normal text-[var(--text-tertiary)] ml-1">/10</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">10 = marché du travail dynamique · 0 = marché très tendu.</p>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{e.signature}</p>
        </div>

        {m && (
          <>
            <h2 className="mt-10 text-xl font-bold text-[var(--text-primary)]">Les relevés</h2>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {m.unemployment !== undefined && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{fr1(m.unemployment)} %</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">
                    de chômeurs parmi les actifs de 15 à 64 ans (France : {fr1(UNEMPLOYMENT_NATIONAL)} %, même mesure)
                  </div>
                </div>
              )}
              {m.jobs !== undefined && m.jobGrowth !== undefined && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
                    {m.jobGrowth > 0 ? "+" : m.jobGrowth < 0 ? "−" : ""}
                    {fr1(Math.abs(m.jobGrowth))} %
                  </div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">
                    d&apos;emplois dans la commune depuis {JOBS_FROM}, {m.jobs.toLocaleString("fr-FR")} en {RP_YEAR} (France : +{fr1(JOB_GROWTH_NATIONAL)} %)
                  </div>
                </div>
              )}
              {m.salary !== undefined && (
                <div className="rounded-2xl bg-white p-4 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]">
                  <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">{m.salary.toLocaleString("fr-FR")} €</div>
                  <div className="mt-1 text-xs text-[var(--text-secondary)]">
                    net par mois en moyenne, emplois privés situés dans la commune, en équivalent temps plein (France : {SALARY_NATIONAL.toLocaleString("fr-FR")} €)
                  </div>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Sources :{" "}
              <a href={RP_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">
                Insee, recensement de la population {RP_YEAR}
              </a>{" "}
              ·{" "}
              <a href={BTS_SOURCE_URL} target="_blank" rel="noreferrer" className="underline">
                Insee, base tous salariés {SALARY_YEAR}
              </a>
              . Le chômage du recensement est déclaratif et tourne plus haut que le taux trimestriel du BIT.
            </p>
          </>
        )}

        {/* 4 dimensions */}
        <h2 className="mt-10 text-xl font-bold text-[var(--text-primary)]">Les quatre dimensions</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <JobBlock dim={e.unemployment} label={m?.unemployment !== undefined ? "Chômage — relevé" : "Chômage — palier estimé"} />
          <JobBlock dim={e.dynamism} label={m?.jobGrowth !== undefined ? "Dynamisme — évolution de l'emploi" : "Dynamisme — palier estimé"} />
          <JobBlock dim={e.sectorMix} label="Mix sectoriel / résilience — estimé" />
          <JobBlock dim={e.salary} label={m?.salary !== undefined ? "Salaires — relevé" : "Salaire — palier estimé"} />
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
              <strong className="text-[var(--text-primary)]">Chômage (35 %) :</strong>{" "}
              {m?.unemployment !== undefined
                ? `mesuré : part des chômeurs parmi les actifs de 15 à 64 ans qui habitent la commune, au recensement ${RP_YEAR}. C'est le chômage déclaré, plus haut que le taux du BIT publié chaque trimestre par zone d'emploi : la référence est donc la France sur la même mesure (${fr1(UNEMPLOYMENT_NATIONAL)} %). Barème continu : sous ~9,7 %, niveau « facile » ; à partir de 18 %, « sinistré ».`
                : "le département est rangé dans un palier calé sur l'ordre de grandeur du taux trimestriel INSEE (moyenne France métropolitaine ~7,3 %, DROM en tension chronique au-delà de 15 %). Le taux publié n'est pas repris."}
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Dynamisme (20 %) :</strong>{" "}
              {m?.jobGrowth !== undefined
                ? `mesuré : évolution du nombre d'emplois situés dans la commune entre ${JOBS_FROM} et ${RP_YEAR} (recensement), contre +${fr1(JOB_GROWTH_NATIONAL)} % pour la France. Le taux de création d'entreprises a été écarté : il est gonflé par l'auto-entreprenariat contraint (livraison, VTC) et classerait « dynamiques » des communes où l'emploi salarié manque.`
                : "création nette d'établissements estimée au département dans l'esprit des flux SIRENE, pondérée par la taille de la commune. Grandes métropoles et littoraux attractifs au-dessus, communes rurales en déclin en dessous."}
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Mix sectoriel (20 %) :</strong>{" "}
              <strong className="text-[var(--text-primary)]">estimé</strong> : diversification du tissu économique. Pénalise mono-tourisme (saisonnalité),
              ancien bassin mono-industriel en reconversion, valorise les grandes métropoles
              et les économies équilibrées.
            </li>
            <li>
              <strong className="text-[var(--text-primary)]">Salaire (25 %) :</strong>{" "}
              {m?.salary !== undefined
                ? `mesuré : salaire net mensuel moyen, en équivalent temps plein, des emplois du secteur privé situés dans la commune (base tous salariés ${SALARY_YEAR}). C'est le salaire du lieu de travail, pas celui des habitants, et une moyenne : la France est à ${SALARY_NATIONAL.toLocaleString("fr-FR")} €, tirée par l'Île-de-France, la ville médiane du site autour de 2 400 €.`
                : `salaire rangé en paliers départementaux calés sur les ordres de grandeur INSEE DADS (moyenne France ~2 100 €/mois, Paris et petite couronne au-delà de 2 400 €, DROM et départements ruraux sous 1 850 €). Ce n'est pas un salaire relevé à ${city.name}.`}
            </li>
          </ul>
          <p className="text-xs text-[var(--text-tertiary)] mt-4">
            {m
              ? "Le mix sectoriel reste une estimation. Les relevés décrivent la commune, pas tout le bassin d'emploi : une ville-dortoir peut afficher peu d'emplois et un salaire moyen bas alors que ses habitants travaillent à côté. Pour les offres en temps réel, consultez France Travail, Apec et Hellowork."
              : "Ces quatre scores sont des estimations construites au département, pas des relevés : aucun taux de chômage, aucun flux SIRENE et aucun salaire médian ne sont ingérés pour cette commune. Pour les offres en temps réel, consultez France Travail, Apec et Hellowork."}
          </p>
        </div>
        </div>
      </section>

      {/* Renvois + discussion — bande blanche */}
      <section className="band band-white py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/sante`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🩺</span><span>Accès aux soins</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">MG, spécialistes, urgences</div>
            </div>
          </Link>
          <Link href={`/calculateur-cout-reel/${city.slug}`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🧮</span><span>Coût réel mensuel</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Loyer, mobilité, taxes, reste-à-vivre</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/teletravail`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>💻</span><span>Télétravail</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Score remote, FTTH, coworking</div>
            </div>
          </Link>
          <Link href={`/villes/${city.slug}/louer-ou-acheter`} className="block">
            <div className="h-full rounded-2xl bg-[var(--band-indigo)] px-5 py-4 transition-colors hover:bg-[#DCD7FF]">
              <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-2"><span aria-hidden>🔑</span><span>Louer ou acheter ?</span></div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Ratio prix/loyer, payback</div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-sm space-y-2">
          <p>
            <Link href="/emploi" className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#3730A3] shadow-sm ring-1 ring-[var(--band-indigo)] transition-colors hover:bg-[var(--band-indigo)]">
              → Classement national des marchés du travail
            </Link>
          </p>
          <p className="text-[var(--text-secondary)]">
            Les scores ci-dessus décrivent un bassin d&apos;emploi, pas ce qu&apos;on peut y
            construire en début de carrière :{" "}
            <Link href="/classements/jeune-actif" className="text-[var(--accent)] hover:underline">
              le classement jeune actif
            </Link>{" "}
            croise pour cela scène culturelle, aptitude au télétravail et coût de la vie, à
            poids égal.
          </p>
          {border && (
            <p className="text-[var(--text-secondary)]">
              Ce bassin s&apos;arrête à la frontière, et {city.name} en est proche : de tous
              les pôles d&apos;emploi transfrontaliers suivis par le site, le plus proche
              d&apos;ici est {border.hub} ({border.country}). Quand on est payé de
              l&apos;autre côté, ni le salaire ni la caisse maladie ne dépendent plus du
              marché décrit sur cette page —{" "}
              <Link
                href="/pour-qui/travailleurs-frontaliers"
                className="text-[var(--accent)] hover:underline"
              >
                où habiter quand on travaille de l&apos;autre côté de la frontière
              </Link>{" "}
              classe les communes concernées sur la distance au pôle, le loyer et les
              transports.
            </p>
          )}
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
