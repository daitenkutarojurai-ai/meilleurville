import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DiscussionCTA } from "@/components/DiscussionCTA";
import { CITIES_SEED } from "@/data/cities-seed";
import { cityAgenda } from "@/lib/city-agenda";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";
import { CalendarDays, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
    alternates: { canonical: `/villes/${slug}/agenda` },
    openGraph: {
      title: `Agenda ${city.name} · que faire mois par mois`,
      description: `Calendrier 2026 indicatif de ${city.name} — événements, marchés, saisons.`,
    },
  };
}

const CATEGORY_COLOR: Record<string, string> = {
  national: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  regional: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  saisonnier: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  local: "bg-violet-500/10 text-violet-700 border-violet-500/20",
};

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
  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Agenda", path: `/villes/${city.slug}/agenda` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <main id="main-content" className="min-h-screen bg-[var(--bg-canvas)]">
        <Navbar />
        <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-12">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <Breadcrumbs
              items={[
                { label: "Villes", href: "/villes" },
                { label: city.name, href: `/villes/${city.slug}` },
                { label: "Agenda" },
              ]}
            />
            <div className="mt-6 flex items-center gap-3">
              <div className="rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] p-2.5">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                  Agenda culturel & saisonnier — {city.name}
                </h1>
                <p className="text-sm text-[var(--text-tertiary)] mt-1">
                  Calendrier 2026 indicatif. Toujours vérifier les dates exactes sur le site de la mairie ou de l'office de tourisme.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <ol className="space-y-4">
              {agenda.map((item, i) => (
                <li
                  key={i}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-tertiary)] w-20 shrink-0">
                      {item.monthLabel}
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${CATEGORY_COLOR[item.category]}`}
                    >
                      {CATEGORY_LABEL[item.category]}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-[var(--text-secondary)] leading-relaxed">
                    {item.body}
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                    Source : {item.source}
                  </p>
                </li>
              ))}
            </ol>

            <p className="mt-8 text-xs text-[var(--text-tertiary)] leading-relaxed">
              Cet agenda combine événements nationaux confirmés (loi française pour le 14 juillet, Journées du patrimoine), événements régionaux structurels (Cannes, Avignon, Lorient, marchés de Noël alsaciens) et indicateurs saisonniers dérivés du climat moyen de la ville. Aucune date précise n'est garantie sans vérification auprès des organisateurs.
            </p>

            <div className="mt-8">
              <Link
                href={`/villes/${city.slug}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
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
