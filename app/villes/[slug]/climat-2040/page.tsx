import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CITIES_SEED } from "@/data/cities-seed";
import { projectClimate2040 } from "@/lib/climate-2040";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
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
  const p = projectClimate2040(city);
  return {
    title: `Climat 2040 à ${city.name} — Projection canicule et nuits tropicales`,
    description: `Projection climatique 2040 pour ${city.name}${
      p.projectedJulyC ? ` : juillet ${p.projectedJulyC} °C (+${p.macroRegion.deltaJulyC} °C vs aujourd'hui), ${p.projectedDays30C} jours > 30 °C attendus.` : "."
    } Basé sur Météo-France ARPEGE.`,
    alternates: { canonical: `/villes/${slug}/climat-2040` },
    openGraph: {
      title: `Climat 2040 à ${city.name}`,
      description: `Hausse moyenne juillet, jours > 30 °C, nuits tropicales en 2040. Projection ARPEGE par macro-région.`,
    },
  };
}

function DeltaBlock({
  label,
  current,
  projected,
  unit,
  hint,
}: {
  label: string;
  current: number | null;
  projected: number | null;
  unit: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
      <div className="text-xs uppercase tracking-wider text-[var(--text-tertiary)] mb-2">{label}</div>
      <div className="flex items-baseline gap-3">
        <div>
          <div className="text-[10px] text-[var(--text-tertiary)]">Aujourd&apos;hui</div>
          <div className="text-xl font-bold tabular-nums text-[var(--text-secondary)]">
            {current != null ? `${current}` : "—"}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">{unit}</span>
          </div>
        </div>
        <span className="text-[var(--text-tertiary)] text-xl">→</span>
        <div>
          <div className="text-[10px] text-emerald-700 font-semibold">En 2040</div>
          <div className="text-2xl font-bold tabular-nums text-red-700">
            {projected != null ? `${projected}` : "—"}
            <span className="text-sm font-normal text-[var(--text-tertiary)] ml-0.5">{unit}</span>
          </div>
        </div>
      </div>
      {hint && <p className="text-[11px] text-[var(--text-tertiary)] mt-2">{hint}</p>}
    </div>
  );
}

export default async function Climat2040Page({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();
  const p = projectClimate2040(city);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Villes", path: "/villes" },
    { name: city.name, path: `/villes/${city.slug}` },
    { name: "Climat 2040", path: `/villes/${city.slug}/climat-2040` },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <nav className="text-xs text-[var(--text-tertiary)] mb-3">
          <Link href="/" className="hover:underline">Accueil</Link> ·{" "}
          <Link href="/villes" className="hover:underline">Villes</Link> ·{" "}
          <Link href={`/villes/${city.slug}`} className="hover:underline">{city.name}</Link>
        </nav>

        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Climat 2040 à {city.name}
        </h1>
        <p className="mt-3 text-base text-[var(--text-secondary)]">
          Projection à horizon 2040 vs période de référence 1991-2020, basée sur les deltas
          Météo-France ARPEGE de la macro-région{" "}
          <strong className="text-[var(--text-primary)]">{p.macroRegion.label}</strong>.
        </p>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <Badge>Projection ARPEGE</Badge>
          <Badge>Macro-région : {p.macroRegion.label}</Badge>
        </div>

        {/* Hero verdict */}
        <Card className="mt-6 border-l-4 border-l-amber-500">
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">{p.verdict}</p>
        </Card>

        {/* 3 delta blocks */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Les chiffres clés</h2>
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <DeltaBlock
            label="Juillet moyenne"
            current={p.currentJulyC}
            projected={p.projectedJulyC}
            unit="°C"
            hint={`+${p.macroRegion.deltaJulyC} °C par rapport à 1991-2020`}
          />
          <DeltaBlock
            label="Jours > 30 °C / an"
            current={p.currentDays30C}
            projected={p.projectedDays30C}
            unit="j"
            hint={`+${p.macroRegion.extraDays30C} jours supplémentaires`}
          />
          <DeltaBlock
            label="Nuits tropicales / an"
            current={p.currentTropicalNights}
            projected={p.projectedTropicalNights}
            unit="nuits"
            hint={`+${p.macroRegion.extraTropicalNights} nuits > 20 °C`}
          />
        </div>

        {/* Macro-region context */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">
          Contexte macro-régional — {p.macroRegion.label}
        </h2>
        <Card className="mt-3">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {p.macroRegion.signature}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Source : Météo-France ARPEGE, scénarios RCP4.5 et RCP8.5 médians. Incertitude
            régionale ±0,5 °C. Cette page applique le delta moyen de la macro-région au climat
            actuel de {city.name} — la projection est donc <strong>indicative</strong> et non
            une prévision locale fine.
          </p>
        </Card>

        {/* Cross-links */}
        <h2 className="mt-10 text-xl font-semibold text-[var(--text-primary)]">Aller plus loin</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Link href={`/villes/${city.slug}/climat`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Climat actuel</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{city.name} aujourd&apos;hui</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/saisons`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Saisons</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Détail par saison</div>
            </Card>
          </Link>
          <Link href="/classements/canicule-resistance" className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Classement</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Villes les plus résistantes à la canicule</div>
            </Card>
          </Link>
          <Link href={`/villes/${city.slug}/avis-honnete`} className="block">
            <Card className="hover:shadow-md transition-shadow h-full">
              <div className="text-xs uppercase text-[var(--text-tertiary)]">Synthèse</div>
              <div className="mt-1 text-sm font-semibold text-[var(--text-primary)]">Avis honnête sur {city.name}</div>
            </Card>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
