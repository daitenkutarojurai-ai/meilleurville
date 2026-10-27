import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityAgenda } from "@/lib/city-agenda";
import { upcomingCityEvents, cityEventsJsonLd } from "@/lib/city-events";
import { CityEvents } from "@/components/CityEvents";
import { ReportCTA } from "@/components/ReportCTA";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CalendarDays, ArrowLeft } from "lucide-react";
import Link from "@/components/AppLink";
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
  return {
    title: `Agenda culturel & saisonnier de ${city.name} 2026`,
    description: `Que faire à ${city.name} mois par mois : festivals, marchés, événements nationaux et régionaux, meilleures saisons pour visiter. Calendrier 2026 indicatif.`,
    alternates: cityAlternates("agenda", slug),
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Agenda ${city.name} · que faire mois par mois`,
      description: `Calendrier 2026 indicatif de ${city.name} — événements, marchés, saisons.`,
    },
  };
}

// Familles indigo / rose / cyan / ciel uniquement : vert, ambre et violet sont
// réservés aux paliers de score (identité « Couleurs »).
const CATEGORY_COLOR: Record<string, string> = {
  national: "bg-[var(--band-indigo)] text-[#4338CA]",
  regional: "bg-[var(--band-pink)] text-[#BE185D]",
  saisonnier: "bg-[var(--band-aqua)] text-[#0E7490]",
  local: "bg-[var(--band-sky)] text-[#0369A1]",
};

// Tuiles de mois en rotation (extrémités ≥ 4,5:1 sur texte blanc).
const MONTH_TILES = ["grad-head-0", "grad-head-5", "grad-head-4"] as const;

const CATEGORY_LABEL: Record<string, string> = {
  national: "National",
  regional: "Régional",
  saisonnier: "Saisonnier",
  local: "Local",
};

export default async function AgendaPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const agenda = cityAgenda(city);
  const events = upcomingCityEvents(city.slug);
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Agenda", path: `/villes/${city.slug}/agenda` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      {events.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(cityEventsJsonLd(events, city.name, "fr"))}
        />
      )}
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="relative overflow-hidden bg-aurora py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Breadcrumbs
              items={[
                { label: "Villes", href: "/villes" },
                { label: city.name, href: `/villes/${city.slug}` },
                { label: "Agenda" },
              ]}
            />
            <div className="mt-6 flex items-center gap-3">
              <div className="grad-head-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-[0_10px_24px_-10px_rgba(79,70,229,0.7)]">
                <CalendarDays className="h-7 w-7" aria-hidden />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight gradient-text">
                  Agenda culturel & saisonnier — {city.name}
                </h1>
                <p className="text-sm text-[var(--text-secondary)] mt-1">
                  Calendrier 2026 indicatif. Toujours vérifier les dates exactes sur le site de la mairie ou de l'office de tourisme.
                </p>
              </div>
            </div>
            <ReportCTA variant="inline" className="mt-5" kinds={["evenement"]} cityName={city.name} />
          </div>
        </section>

        {/* « À venir » (datés, sourcés) en bande ciel */}
        <section className="band band-sky py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <CityEvents events={events} cityName={city.name} locale="fr" />
          </div>
        </section>

        {/* Mois par mois (indicatif) en bande indigo */}
        <section className="band band-indigo py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <h2 className="mb-4 text-2xl font-bold tracking-tight gradient-text">
              Au fil de l&apos;année
            </h2>
            <ol className="space-y-4">
              {agenda.map((item, i) => (
                <li
                  key={i}
                  className="rounded-2xl bg-white p-5 shadow-[0_10px_28px_-18px_rgba(79,70,229,0.55)]"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className={`${MONTH_TILES[i % MONTH_TILES.length]} shrink-0 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide`}>
                      {item.monthLabel}
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${CATEGORY_COLOR[item.category]}`}
                    >
                      {CATEGORY_LABEL[item.category]}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
                    {item.body}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                    Source : {item.source}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Méthode, renvois et discussion en bande blanche */}
        <section className="band band-white py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">
              Cet agenda combine événements nationaux confirmés (loi française pour le 14 juillet, Journées du patrimoine), événements régionaux structurels (Cannes, Avignon, Lorient, marchés de Noël alsaciens) et indicateurs saisonniers dérivés du climat moyen de la ville. Aucune date précise n'est garantie sans vérification auprès des organisateurs.
            </p>

            {/* Cet agenda dit ce qui se passe *ici* mois par mois. Il ne dit
                pas où la programmation est assez dense pour qu'on choisisse sa
                ville dessus — c'est l'objet du profil culture, qui n'était lié
                depuis aucune page du site avant le 2026-09-20. */}
            <p className="mt-4 text-xs text-[var(--text-tertiary)] leading-relaxed">
              Un agenda répond à « quand venir à {city.name} ». Si la question est
              plutôt « où s&apos;installer pour avoir quelque chose à voir toute
              l&apos;année », le profil{" "}
              <Link
                href="/pour-qui/amateurs-de-culture"
                className="underline hover:text-[var(--accent)]"
              >
                villes où il y a quelque chose à voir toute l&apos;année
              </Link>{" "}
              classe les villes françaises sur la densité d&apos;équipements et de
              patrimoine plutôt que sur un calendrier, avec la même réserve
              qu&apos;ici : une saison se vérifie chez l&apos;organisateur.
            </p>

            <div className="mt-8">
              <Link
                href={`/villes/${city.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--band-indigo)] px-4 py-2 text-sm font-semibold text-[#4338CA] transition-colors hover:bg-[#DCD7FF]"
              >
                <ArrowLeft className="h-4 w-4" /> Retour à la fiche {city.name}
              </Link>
            </div>

            <DiscussionCTA citySlug={city.slug} cityName={city.name} />
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
