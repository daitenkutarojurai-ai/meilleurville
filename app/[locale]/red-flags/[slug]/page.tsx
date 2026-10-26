import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import React from "react";
import {
  ArrowLeft, ArrowRight, ShieldAlert, Flame, Droplets, Wind, Mountain, Home, Users, Bus, GraduationCap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { clampMeta } from "@/lib/brand";
import { ReportCTA } from "@/components/ReportCTA";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };
type City = (typeof CITIES_SEED)[number];

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

type Level = "critique" | "eleve" | "modere" | "mesure" | "faible";

// Hues encode a RISK LEVEL (5-step scale), never decoration — kept on the
// « Couleurs » sheet. `chip` is 700 on 100 to hold AA at 10-11 px.
// Same palette as the FR twin app/red-flags/[slug]/page.tsx.
const LEVEL_META: Record<Level, { label: string; tone: string; chip: string; swatch: string; weight: number }> = {
  critique: { label: "Critical",     tone: "text-red-700",     chip: "text-red-700 bg-red-100 border-red-300",            swatch: "bg-red-500 border-red-700",         weight: 4 },
  eleve:    { label: "High",         tone: "text-orange-700",  chip: "text-orange-700 bg-orange-100 border-orange-300",   swatch: "bg-orange-500 border-orange-700",   weight: 3 },
  modere:   { label: "Moderate",     tone: "text-amber-700",   chip: "text-amber-700 bg-amber-100 border-amber-300",      swatch: "bg-amber-400 border-amber-600",     weight: 2 },
  mesure:   { label: "Low-moderate", tone: "text-yellow-700",  chip: "text-yellow-800 bg-yellow-100 border-yellow-300",   swatch: "bg-yellow-300 border-yellow-600",   weight: 1 },
  faible:   { label: "Low",          tone: "text-emerald-700", chip: "text-emerald-700 bg-emerald-50 border-emerald-300", swatch: "bg-emerald-400 border-emerald-600", weight: 0 },
};

// Brick hatched legend symbol — same pattern as the R1-R6 categories of the
// /red-flags hub and ContributionStats.

interface Flag {
  id: string;
  label: string;
  icon: React.ElementType;
  level: Level;
  summary: string;
  source: { name: string; url: string };
}

function safetyFlag(c: City): Flag {
  const s = c.scores.safety;
  let level: Level = "faible";
  let summary = `Crime and property indicators within the national norm (safety score ${s.toFixed(1)}/10).`;
  if (s < 4.0) { level = "critique"; summary = `Crimes against persons and property significantly above the national average — safety score ${s.toFixed(1)}/10.`; }
  else if (s < 5.0) { level = "eleve"; summary = `Property crime and burglary above the urban average — score ${s.toFixed(1)}/10.`; }
  else if (s < 6.0) { level = "modere"; summary = `Localised tensions in a few neighbourhoods; rest of the area within the norm — score ${s.toFixed(1)}/10.`; }
  else if (s < 7.0) { level = "mesure"; summary = `Burglaries and antisocial behaviour near the average; overall sense of safety is adequate — score ${s.toFixed(1)}/10.`; }
  return {
    id: "safety",
    label: "Safety",
    icon: ShieldAlert,
    level,
    summary,
    source: { name: "SSMSI — French Interior Ministry", url: "https://www.interieur.gouv.fr/Interstats" },
  };
}

function floodFlag(c: City): Flag {
  const el = c.elevation ?? null;
  const lng = c.longitude ?? null;
  const lat = c.latitude ?? null;
  let level: Level = "faible";
  let summary = "No structural flood envelope recorded for the town centre; verify the flood risk plan (PPRI) on Géorisques for the exact plot.";

  const dromCoast = ["Martinique", "Guadeloupe", "La Réunion", "Mayotte", "Guyane"].includes(c.region ?? "");
  const atlantic = lng != null && lng < -1 && lat != null && lat < 49;
  const channel = lat != null && lat > 49 && lng != null && lng < 3;
  const mediterranean = lat != null && lat < 44 && lng != null && lng > 2;
  const coastalLow = el != null && el < 20 && (atlantic || channel || mediterranean || dromCoast);
  const riverLow = el != null && el < 35;

  if (mediterranean && el != null && el < 50) {
    level = "eleve";
    summary = "Mediterranean coastline exposed to intense cévenol rainfall: documented urban run-off and coastal river flooding. Check flood maps (TRI/PPRI) on Géorisques.";
  } else if (dromCoast) {
    level = "eleve";
    summary = "Cyclonic risk and recurring storm surge during wet season (June–November Caribbean, January–March Indian Ocean). Risk maps on Géorisques (DEAL).";
  } else if (coastalLow) {
    level = "modere";
    summary = "Low-lying coastal commune: exposure to storm surge and submersion (Xynthia 2010 as a reference). Check coastal flood risk plans (PPRL) on Géorisques.";
  } else if (riverLow) {
    level = "mesure";
    summary = "Low elevation suggests a floodplain or valley — verify the river flood risk plan (PPRI) on Géorisques before buying a ground-floor property.";
  }

  return {
    id: "flood",
    label: "Flood & submersion",
    icon: Droplets,
    level,
    summary,
    source: { name: "Géorisques — BRGM / Ministry of Ecological Transition", url: "https://www.georisques.gouv.fr" },
  };
}

function heatFlag(c: City): Flag {
  const t = c.avgTempJuly;
  let level: Level = "faible";
  let summary = "Temperate summers; no structural heatwave pattern observed over the 1991–2020 reference period.";
  if (t == null) summary = "Summer temperature data not available for this municipality.";
  else if (t >= 28) { level = "critique"; summary = `Hot summers (${t.toFixed(1)} °C July average) — prolonged heatwaves documented by Météo-France with recorded health impacts tracked by Public Health France.`; }
  else if (t >= 26) { level = "eleve";    summary = `Warm summers (${t.toFixed(1)} °C July average) — regular heat alerts in July–August; pronounced urban heat island effect.`; }
  else if (t >= 24) { level = "modere";   summary = `Moderately warm summers (${t.toFixed(1)} °C July average) — occasional heat spikes; frequency increasing per Météo-France records.`; }
  else if (t >= 22) { level = "mesure";   summary = `Mild summers (${t.toFixed(1)} °C July average) — occasional peaks possible, nothing structural.`; }
  return {
    id: "heat",
    label: "Heatwave & heat stress",
    icon: Flame,
    level,
    summary,
    source: { name: "Météo-France — Climate bulletins", url: "https://meteofrance.com/climat" },
  };
}

function pollutionFlag(c: City): Flag {
  const region = c.region ?? "";
  const dept = c.department ?? "";
  let level: Level = "faible";
  let summary = "ATMO air quality index mostly good to moderate; no classified Seveso high-threshold industrial site in the immediate vicinity.";

  if (region === "Île-de-France") {
    level = "eleve";
    summary = "Paris basin: recurring NO₂ exceedances near major roads and motorways, summer ozone alerts. Low-emission zone (ZFE-m) active inside the A86 ring road.";
  } else if (["Haute-Savoie", "Savoie", "Isère"].includes(dept) && (c.elevation ?? 0) < 700) {
    level = "eleve";
    summary = "Alpine valley subject to winter thermal inversions: PM10 peaks December–February driven by wood-burning and road traffic (Arve Valley, Grenoble basin).";
  } else if (region === "Auvergne-Rhône-Alpes" && (c.population ?? 0) > 150000) {
    level = "modere";
    summary = "Rhône corridor exposed to summer ozone peaks and NO₂ traffic along the A7/A47. Atmo Auvergne-Rhône-Alpes publishes daily indices.";
  } else if (["Bouches-du-Rhône", "Var"].includes(dept) && (c.population ?? 0) > 80000) {
    level = "modere";
    summary = "Industrial and port coastline: summer ozone, traffic NO₂, and port freight pollution documented by AtmoSud.";
  } else if ((c.population ?? 0) > 200000) {
    level = "mesure";
    summary = "Large city with dense road traffic — NO₂ spikes near arterial roads; low-emission zones progressively rolling out. Monitor the regional ATMO index.";
  }

  return {
    id: "pollution",
    label: "Air pollution",
    icon: Wind,
    level,
    summary,
    source: { name: "ATMO France — Accredited AASQA networks", url: "https://www.atmo-france.org" },
  };
}

function seismicFlag(c: City): Flag {
  const dept = c.department ?? "";
  const region = c.region ?? "";
  let level: Level = "faible";
  let summary = "Low seismic hazard (zone 1 or 2) — no enhanced earthquake-resistant construction requirements.";

  const pyrenees = ["Pyrénées-Atlantiques", "Hautes-Pyrénées", "Haute-Garonne", "Pyrénées-Orientales", "Ariège", "Aude"].includes(dept);
  const alpsHigh = ["Haute-Savoie", "Savoie", "Hautes-Alpes", "Alpes-Maritimes", "Alpes-de-Haute-Provence"].includes(dept);
  const antilles = ["Martinique", "Guadeloupe"].includes(region);
  const provence = dept === "Bouches-du-Rhône" || dept === "Var" || dept === "Vaucluse";

  if (antilles) {
    level = "eleve";
    summary = "Seismic zone 5 (highest exposure): enhanced earthquake-resistant construction rules mandatory since 2011 (Eurocode 8). Active Plan séisme Antilles.";
  } else if (pyrenees || alpsHigh) {
    level = "modere";
    summary = "Moderate seismic hazard (zone 3 or 4): earthquake-resistant rules apply to new construction. BRGM mapping available on Géorisques.";
  } else if (provence) {
    level = "mesure";
    summary = "Moderate seismic hazard (zone 3 across most of the area) — magnitude 4–5 earthquakes historically documented (Lambesc 1909).";
  }

  return {
    id: "seismic",
    label: "Seismic risk",
    icon: Mountain,
    level,
    summary,
    source: { name: "BRGM — French seismic zoning", url: "https://www.georisques.gouv.fr/risques/risques-sismiques" },
  };
}

function costFlag(c: City): Flag {
  const cost = c.scores.cost;
  let level: Level = "faible";
  let summary = `Rental and purchase market within an accessible range (cost score ${cost.toFixed(1)}/10).`;
  if (cost < 4.0) { level = "critique"; summary = `Rents and prices per m² among the highest in the country — cost score ${cost.toFixed(1)}/10. Market pressure documented by national housing observatories.`; }
  else if (cost < 5.0) { level = "eleve"; summary = `Tight housing market (score ${cost.toFixed(1)}/10) — housing cost burden often above 30% of median income.`; }
  else if (cost < 6.0) { level = "modere"; summary = `Constrained rental area (score ${cost.toFixed(1)}/10): rent control decree applies depending on zoning.`; }
  else if (cost < 7.0) { level = "mesure"; summary = `Cost of living broadly in line with the national average; recent uptick in price per m² worth monitoring.`; }
  return {
    id: "cost",
    label: "Housing cost",
    icon: Home,
    level,
    summary,
    source: { name: "Observatoires locaux des loyers (OLL) — Anil", url: "https://www.observatoires-des-loyers.org" },
  };
}

function transportFlag(c: City): Flag {
  const tr = c.scores.transport;
  let level: Level = "faible";
  let summary = `Dense network with real car-free alternatives (transport score ${tr.toFixed(1)}/10).`;
  if (tr < 4.0) { level = "eleve"; summary = `Heavy car dependency (score ${tr.toFixed(1)}/10) — no tram, limited bus network outside the centre.`; }
  else if (tr < 5.0) { level = "modere"; summary = `Limited public transport backbone (score ${tr.toFixed(1)}/10): the car remains the practical option for peripheral areas.`; }
  else if (tr < 6.0) { level = "mesure"; summary = `Adequate network in the centre; outer areas less served — living car-free requires careful choice of neighbourhood.`; }
  return {
    id: "transport",
    label: "Car dependency",
    icon: Bus,
    level,
    summary,
    source: { name: "Cerema — Daily mobility surveys", url: "https://www.cerema.fr" },
  };
}

function schoolsFlag(c: City): Flag {
  const sc = c.scores.schools;
  let level: Level = "faible";
  let summary = `Public and private school offering adequately sized for the population (schools score ${sc.toFixed(1)}/10).`;
  if (sc < 4.0) { level = "eleve"; summary = `DEPP indicators (pass rates, dropout) below average — score ${sc.toFixed(1)}/10. Worth researching school by school if you have children.`; }
  else if (sc < 5.0) { level = "modere"; summary = `Uneven school landscape (score ${sc.toFixed(1)}/10): choice of catchment area is critical for state secondary.`; }
  else if (sc < 6.0) { level = "mesure"; summary = `School offering around the average; quality varies between institutions.`; }
  return {
    id: "schools",
    label: "Schools & families",
    icon: GraduationCap,
    level,
    summary,
    source: { name: "DEPP — French Ministry of Education", url: "https://www.education.gouv.fr/la-depp-direction-de-l-evaluation-de-la-prospective-et-de-la-performance-11737" },
  };
}

function tourismFlag(c: City): Flag {
  const tags = c.characterTags ?? [];
  const region = c.region ?? "";
  const dept = c.department ?? "";
  const dromCoast = ["Martinique", "Guadeloupe", "La Réunion"].includes(region);
  const high = tags.some((t) => ["mer", "tourisme", "soleil"].includes(t)) ||
    dromCoast ||
    ["Alpes-Maritimes", "Var", "Corse-du-Sud", "Haute-Corse", "Vaucluse"].includes(dept);

  let level: Level = "faible";
  let summary = "Limited tourism pressure; stable local life outside the summer peak.";
  if (high) {
    level = "modere";
    summary = "Strong seasonal tourism: higher housing prices in July–August, traffic jams, saturated services at peak (sources: Insee tourism, secondary residence census).";
  }
  if (tags.includes("premium") && (c.population ?? 0) < 80000) {
    level = "eleve";
    summary = "Premium tourism pressure: surging property prices, high share of holiday homes (sometimes >25%), tension on permanent housing for working residents.";
  }
  return {
    id: "tourism",
    label: "Tourism pressure",
    icon: Users,
    level,
    summary,
    source: { name: "Insee — Tourism and secondary residences", url: "https://www.insee.fr/fr/statistiques?theme=70" },
  };
}

function computeFlags(c: City): Flag[] {
  return [
    safetyFlag(c),
    floodFlag(c),
    heatFlag(c),
    pollutionFlag(c),
    seismicFlag(c),
    costFlag(c),
    transportFlag(c),
    schoolsFlag(c),
    tourismFlag(c),
  ];
}

function vigilance(flags: Flag[]): { score: number; label: string; tone: string } {
  const sum = flags.reduce((acc, f) => acc + LEVEL_META[f.level].weight, 0);
  const ratio = sum / 36;
  if (ratio >= 0.45) return { score: sum, label: "High vigilance", tone: "text-red-700" };
  if (ratio >= 0.28) return { score: sum, label: "Moderate vigilance", tone: "text-orange-700" };
  if (ratio >= 0.14) return { score: sum, label: "Low-moderate vigilance", tone: "text-amber-700" };
  return { score: sum, label: "Low vigilance", tone: "text-emerald-700" };
}

function similarRiskCities(city: City, flags: Flag[], all: readonly City[], n = 4): City[] {
  const target = flags.reduce((a, f) => a + LEVEL_META[f.level].weight, 0);
  return [...all]
    .filter((c) => c.slug !== city.slug && c.region === city.region)
    .map((c) => {
      const fs = computeFlags(c);
      const s = fs.reduce((a, f) => a + LEVEL_META[f.level].weight, 0);
      return { city: c, d: Math.abs(s - target) };
    })
    .sort((a, b) => a.d - b.d)
    .slice(0, n)
    .map((x) => x.city);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return {};
  const flags = computeFlags(city);
  const top = flags
    .filter((f) => LEVEL_META[f.level].weight >= 2)
    .map((f) => f.label.toLowerCase())
    .slice(0, 3);
  const teaser = top.length
    ? `Flags to check: ${top.join(", ")}.`
    : "No major flags; risk profile broadly manageable.";
  return {
    title: `Red Flags ${city.name} · Known risks & public sources 2026`,
    description: clampMeta(`What the property listing never tells you about ${city.name}: safety, flooding, heat, pollution, seismics, cost. ${teaser} Sources: Géorisques, SSMSI, ATMO, BRGM.`),
    alternates: { canonical: `${EN_BASE}/red-flags/${slug}` },
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: `Red Flags ${city.name} · 2026`,
      description: teaser,
      type: "article",
    },
  };
}

export default async function EnCityRedFlagsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const flags = computeFlags(city);
  const v = vigilance(flags);
  const similar = similarRiskCities(city, flags, CITIES_SEED);

  const ordered = [...flags].sort((a, b) => {
    const w = LEVEL_META[b.level].weight - LEVEL_META[a.level].weight;
    return w !== 0 ? w : a.label.localeCompare(b.label, "en");
  });

  const significant = ordered.filter((f) => LEVEL_META[f.level].weight >= 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Red flags · ${city.name}`,
    itemListElement: ordered.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${f.label} · ${LEVEL_META[f.level].label}`,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Header — aurore colorée. */}
      <section className="bg-aurora">
        <div className="pt-20 pb-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-5 flex flex-wrap items-center gap-2 font-mono-data text-xs font-semibold uppercase tracking-widest">
              <Link
                href="/red-flags"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[#BE185D] shadow-sm ring-1 ring-[var(--accent-pink)]/20 transition-colors hover:bg-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Red Flags
              </Link>
              <span className="rounded-full bg-white/70 px-3 py-1 text-[#4338CA] ring-1 ring-[var(--accent)]/15">City report · 2026 data</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.08]">
              Red flags for <span className="gradient-text">{city.name}</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl leading-relaxed">
              What the property listing never tells you: nine risk categories cross-referenced
              with public databases (Géorisques, SSMSI, ATMO, BRGM, Insee, Météo-France).
              {city.department && <> Department: {city.department}.</>}
            </p>
            <ReportCTA variant="inline" locale="en" className="mt-5" kinds={["red-flag", "erreur"]} cityName={city.name} />
          </div>
        </div>
      </section>

      {/* Vigilance — carte blanche sur bande ciel, bande de niveaux en légende. */}
      <section className="band band-sky py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ring-[var(--accent)]/10 overflow-hidden">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-2 inline-block rounded-full grad-head-5 px-3 py-1 font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em]">
                  Composite vigilance index
                </div>
                <div className={`text-3xl font-black font-mono-data ${v.tone}`}>{v.label}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">
                  {significant.length} significant flag{significant.length !== 1 ? "s" : ""} across 9 categories.
                </div>
              </div>
              <ol className="flex items-end gap-1.5" aria-label="Level of each category, most to least exposed">
                {ordered.map((f, i) => (
                  <li key={f.id} className="flex flex-col items-center gap-1" title={`${f.label} — ${LEVEL_META[f.level].label}`}>
                    <span className={`block h-4 w-4 rounded-full border ${LEVEL_META[f.level].swatch}`} aria-hidden="true" />
                    <span className="font-mono-data text-[9px] text-[var(--text-tertiary)]" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="sr-only">{f.label}: {LEVEL_META[f.level].label}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Flags — cartes blanches sur bande indigo, tuiles d'icône dégradées. */}
      <section className="band band-indigo py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
            Flags by category
          </h2>
          <p className="text-xs text-[var(--text-tertiary)] mb-4">
            Sorted from most to least exposed. The badge gives the level; the numbers match
            the strip above.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {ordered.map((f, i) => {
              const meta = LEVEL_META[f.level];
              const Icon = f.icon;
              return (
                <article
                  key={f.id}
                  className={`rounded-2xl bg-[var(--bg-surface)] shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ring-[var(--accent)]/10 flex items-start gap-3 p-5 ${i === ordered.length - 1 && ordered.length % 2 === 1 ? "sm:col-span-2" : ""}`}
                >
                  <span
                    className={`grad-head-${i % 6} flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm`}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="rounded-full bg-[var(--band-indigo)] px-2 py-0.5 font-mono-data text-[10px] font-bold tracking-wider text-[#4338CA]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-base font-bold text-[var(--text-primary)]">{f.label}</h3>
                      <span
                        className={`ml-auto inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono-data text-[10px] font-bold uppercase tracking-widest ${meta.chip}`}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                      {f.summary}
                    </p>
                    <a
                      href={f.source.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="block border-t border-[var(--accent)]/10 pt-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                    >
                      Source: {f.source.name}{" "}
                      <span aria-hidden>↗</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Method — carte blanche à en-tête dégradé sur bande aqua. */}
      <section className="band band-aqua py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl bg-[var(--bg-surface)] shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ring-[var(--accent)]/10 overflow-hidden">
            <h2 className="grad-head-3 px-5 py-2 font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em]">
              How to read this report
            </h2>
            <ul className="space-y-2 p-6 text-sm text-[var(--text-secondary)] leading-relaxed">
              <li>
                <strong className="text-[var(--text-primary)]">Public sources only</strong>{" "}— each flag cites a reference database (Géorisques for natural hazards, SSMSI for crime, ATMO France for air, BRGM for seismics, Insee for tourism pressure, DEPP for schools, Cerema for mobility).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Flag ≠ verdict</strong>{" "}— a &ldquo;High&rdquo; risk means the category warrants plot-level verification (flood risk plan, daily ATMO index, zoning). Not every neighbourhood is equally exposed.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Géorisques before signing</strong>{" "}— for any purchase, the legally mandatory Environmental Risk Statement (ERP) appended to the deed summarises known hazards for the exact address.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Last updated</strong>{" "}— 2026 synthesis based on the most recent published data. For regulatory zoning (PPRI, PPRL, seismic plan), Géorisques is the authoritative source.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Similar profiles — vignettes blanches sur bande lilas. */}
      {similar.length > 0 && (
        <section className="band band-lilac py-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Similar risk profiles in {city.region ?? "France"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {similar.map((c) => (
                <Link
                  key={c.slug}
                  href={`/red-flags/${c.slug}`}
                  className="group flex flex-col gap-1.5 rounded-2xl bg-[var(--bg-surface)] shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ring-[var(--accent)]/10 px-4 py-3 transition-shadow hover:shadow-[0_14px_34px_-16px_rgba(219,39,119,0.45)]"
                >
                  <span className="truncate self-start max-w-full rounded-full bg-[var(--band-pink)] px-2 py-0.5 font-mono-data text-[10px] font-semibold uppercase tracking-[0.14em] text-[#BE185D]">
                    {c.department ?? c.region}
                  </span>
                  <span className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[#BE185D] transition-colors truncate">
                    {c.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Onward links — liens pilules sur bande blanche. */}
      <section className="band band-white py-10">
        <nav aria-label="Further reading" className="mx-auto max-w-5xl px-4 sm:px-6">
          <ul className="flex flex-wrap gap-3 text-sm">
            {[
              { href: `/cities/${slug}`, label: `Full profile of ${city.name}` },
              { href: `/cities/${slug}/climate`, label: "Climate & seasons" },
              { href: "/red-flags", label: "All red-flag reports" },
              { href: "/rankings/securite", label: "Safety ranking" },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[var(--band-indigo)] px-4 py-2 font-semibold text-[#4338CA] ring-1 ring-[var(--accent)]/15 transition-colors hover:bg-[var(--accent)] hover:text-white"
                >
                  {l.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </section>

      <Footer />
    </main>
  );
}
