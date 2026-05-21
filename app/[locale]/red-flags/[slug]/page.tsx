import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import React from "react";
import {
  AlertTriangle, ShieldAlert, Flame, Droplets, Wind, Mountain, Home, Users, Bus, GraduationCap,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };
type City = (typeof CITIES_SEED)[number];

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ locale: "en", slug: c.slug }));
}

type Level = "critique" | "eleve" | "modere" | "mesure" | "faible";

const LEVEL_META: Record<Level, { label: string; tone: string; ring: string; bg: string; weight: number }> = {
  critique: { label: "Critical", tone: "text-red-600",     ring: "border-red-500/40",     bg: "bg-red-500/10",     weight: 4 },
  eleve:    { label: "High",     tone: "text-orange-600",  ring: "border-orange-500/40",  bg: "bg-orange-500/10",  weight: 3 },
  modere:   { label: "Moderate", tone: "text-amber-600",   ring: "border-amber-500/40",   bg: "bg-amber-400/10",   weight: 2 },
  mesure:   { label: "Low-moderate", tone: "text-yellow-600", ring: "border-yellow-500/40", bg: "bg-yellow-400/10", weight: 1 },
  faible:   { label: "Low",      tone: "text-emerald-600", ring: "border-emerald-500/40", bg: "bg-emerald-500/10", weight: 0 },
};

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
  if (ratio >= 0.45) return { score: sum, label: "High vigilance", tone: "text-red-600" };
  if (ratio >= 0.28) return { score: sum, label: "Moderate vigilance", tone: "text-orange-600" };
  if (ratio >= 0.14) return { score: sum, label: "Low-moderate vigilance", tone: "text-amber-600" };
  return { score: sum, label: "Low vigilance", tone: "text-emerald-600" };
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
    description: `What the property listing never tells you about ${city.name}: safety, flooding, heat, pollution, seismics, cost. ${teaser} Sources: Géorisques, SSMSI, ATMO, BRGM.`,
    alternates: { canonical: `${EN_BASE}/red-flags/${slug}` },
    openGraph: {
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
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-20 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/red-flags" className="hover:text-[var(--text-secondary)]">Red Flags</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{city.name}</span>
          </nav>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Red Flag Report — 2026 Data
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Red flags for{" "}
            <span className="text-[var(--accent)]">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            What the property listing never tells you: nine risk categories cross-referenced
            with public databases (Géorisques, SSMSI, ATMO, BRGM, Insee, Météo-France).
            {city.department && <> Department: {city.department}.</>}
          </p>
        </div>
      </section>

      <section className="pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">
                Composite vigilance index
              </div>
              <div className={`text-3xl font-black font-mono-data ${v.tone}`}>{v.label}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {significant.length} significant flag{significant.length !== 1 ? "s" : ""} across 9 categories.
              </div>
            </div>
            <div className="flex items-center gap-2">
              {ordered.map((f) => (
                <span
                  key={f.id}
                  className={`h-3 w-3 rounded-sm border ${LEVEL_META[f.level].ring} ${LEVEL_META[f.level].bg}`}
                  title={`${f.label} — ${LEVEL_META[f.level].label}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">
            Flags by category
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ordered.map((f) => {
              const meta = LEVEL_META[f.level];
              const Icon = f.icon;
              return (
                <article
                  key={f.id}
                  className={`rounded-2xl border ${meta.ring} ${meta.bg} p-5`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${meta.ring} bg-[var(--bg-canvas)]/60`}>
                      <Icon className={`h-5 w-5 ${meta.tone}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-[var(--text-primary)]">{f.label}</h3>
                        <span className={`text-[11px] uppercase tracking-widest font-semibold ${meta.tone}`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-3">
                    {f.summary}
                  </p>
                  <a
                    href={f.source.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1.5 text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                  >
                    Source: {f.source.name}
                    <span aria-hidden>↗</span>
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">How to read this report</h2>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              <li>
                <strong className="text-[var(--text-primary)]">Public sources only</strong> — each flag cites a reference database (Géorisques for natural hazards, SSMSI for crime, ATMO France for air, BRGM for seismics, Insee for tourism pressure, DEPP for schools, Cerema for mobility).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Flag ≠ verdict</strong> — a &ldquo;High&rdquo; risk means the category warrants plot-level verification (flood risk plan, daily ATMO index, zoning). Not every neighbourhood is equally exposed.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Géorisques before signing</strong> — for any purchase, the legally mandatory Environmental Risk Statement (ERP) appended to the deed summarises known hazards for the exact address.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Last updated</strong> — 2026 synthesis based on the most recent published data. For regulatory zoning (PPRI, PPRL, seismic plan), Géorisques is the authoritative source.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {similar.length > 0 && (
        <section className="pb-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Similar risk profiles in {city.region ?? "France"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {similar.map((c) => (
                <Link
                  key={c.slug}
                  href={`/red-flags/${c.slug}`}
                  className="group rounded-xl border border-[var(--border)] bg-[var(--bg-canvas)] hover:border-red-500/40 hover:bg-[var(--bg-elevated)] transition-all px-4 py-3"
                >
                  <div className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-red-500 transition-colors truncate">
                    {c.name}
                  </div>
                  <div className="text-[11px] text-[var(--text-tertiary)] mt-0.5 truncate">
                    {c.department ?? c.region}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-3 flex-wrap">
          <Link
            href={`/cities/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Full profile of {city.name}
          </Link>
          <Link
            href={`/cities/${slug}/climate`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Climate & seasons
          </Link>
          <Link
            href="/red-flags"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            All red-flag reports
          </Link>
          <Link
            href="/rankings/securite"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Safety ranking
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
