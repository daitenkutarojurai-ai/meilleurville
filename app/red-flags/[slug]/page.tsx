import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ShieldAlert, Flame, Droplets, Wind, Mountain, Home, Users, Bus, GraduationCap } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AmbientBackground } from "@/components/AmbientBackground";
import { CITIES_SEED } from "@/data/cities-seed";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

// ISR Reads optimization: pure SSG (no Vercel Data Cache layer).
// revalidate=false → page built once at deploy, served from static edge cache.
export const revalidate = false;
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };
type City = (typeof CITIES_SEED)[number];

export function generateStaticParams() {
  return CITIES_SEED.map((c) => ({ slug: c.slug }));
}

type Level = "critique" | "eleve" | "modere" | "mesure" | "faible";

const LEVEL_META: Record<Level, { label: string; tone: string; ring: string; bg: string; weight: number }> = {
  critique: { label: "Critique",  tone: "text-red-600",     ring: "border-red-500/40",     bg: "bg-red-500/10",     weight: 4 },
  eleve:    { label: "Élevé",     tone: "text-orange-600",  ring: "border-orange-500/40",  bg: "bg-orange-500/10",  weight: 3 },
  modere:   { label: "Modéré",    tone: "text-amber-600",   ring: "border-amber-500/40",   bg: "bg-amber-400/10",   weight: 2 },
  mesure:   { label: "Mesuré",    tone: "text-yellow-600",  ring: "border-yellow-500/40",  bg: "bg-yellow-400/10",  weight: 1 },
  faible:   { label: "Faible",    tone: "text-emerald-600", ring: "border-emerald-500/40", bg: "bg-emerald-500/10", weight: 0 },
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
  let summary = `Indicateurs SSMSI dans la norme nationale (note ${s.toFixed(1)}/10).`;
  if (s < 4.0) { level = "critique";  summary = `Atteintes aux personnes et aux biens nettement au-dessus de la moyenne nationale — note sécurité ${s.toFixed(1)}/10.`; }
  else if (s < 5.0) { level = "eleve";  summary = `Niveau d'atteintes aux biens et de cambriolages au-dessus de la moyenne urbaine — note ${s.toFixed(1)}/10.`; }
  else if (s < 6.0) { level = "modere"; summary = `Tensions urbaines localisées sur quelques quartiers, reste du territoire dans la norme — note ${s.toFixed(1)}/10.`; }
  else if (s < 7.0) { level = "mesure"; summary = `Cambriolages et incivilités proches de la moyenne, sentiment de sécurité globalement correct — note ${s.toFixed(1)}/10.`; }
  return {
    id: "securite",
    label: "Sécurité",
    icon: ShieldAlert,
    level,
    summary,
    source: { name: "SSMSI — Ministère de l'Intérieur", url: "https://www.interieur.gouv.fr/Interstats" },
  };
}

function caniculeFlag(c: City): Flag {
  const t = c.avgTempJuly;
  let level: Level = "faible";
  let summary = "Étés tempérés, pas d'épisode caniculaire structurel observé sur la période 1991–2020.";
  if (t == null) summary = "Données estivales non disponibles pour cette commune.";
  else if (t >= 28) { level = "critique"; summary = `Été chaud (${t.toFixed(1)} °C de moyenne juillet) — épisodes caniculaires longs documentés par Météo-France et impacts sanitaires suivis par Santé publique France.`; }
  else if (t >= 26) { level = "eleve";    summary = `Été chaud (${t.toFixed(1)} °C de moyenne juillet) — vigilance canicule régulière en juillet–août, ICU urbain marqué.`; }
  else if (t >= 24) { level = "modere";   summary = `Été tempéré-chaud (${t.toFixed(1)} °C de moyenne juillet) — pics caniculaires occasionnels, fréquence en hausse selon les chroniques Météo-France.`; }
  else if (t >= 22) { level = "mesure";   summary = `Été doux (${t.toFixed(1)} °C de moyenne juillet) — quelques épisodes ponctuels possibles, rien de structurel.`; }
  return {
    id: "canicule",
    label: "Canicule & chaleur",
    icon: Flame,
    level,
    summary,
    source: { name: "Météo-France — Bulletins climatologiques", url: "https://meteofrance.com/climat" },
  };
}

function inondationFlag(c: City): Flag {
  const el = c.elevation ?? null;
  const lng = c.longitude ?? null;
  const lat = c.latitude ?? null;
  let level: Level = "faible";
  let summary = "Pas d'enveloppe inondable structurelle recensée sur le centre-bourg ; vérifier le PPRI sur Géorisques pour la parcelle exacte.";

  const dromCoast = ["Martinique", "Guadeloupe", "La Réunion", "Mayotte", "Guyane"].includes(c.region ?? "");
  const atlantic = lng != null && lng < -1 && lat != null && lat < 49;
  const channel = lat != null && lat > 49 && lng != null && lng < 3;
  const mediterranean = lat != null && lat < 44 && lng != null && lng > 2;
  const coastalLow = el != null && el < 20 && (atlantic || channel || mediterranean || dromCoast);
  const riverLow = el != null && el < 35;

  if (mediterranean && el != null && el < 50) {
    level = "eleve";
    summary = "Façade méditerranéenne soumise aux pluies cévenoles intenses : ruissellement urbain et débordements de cours d'eau côtiers documentés. Cartographie TRI/PPRI à consulter sur Géorisques.";
  } else if (dromCoast) {
    level = "eleve";
    summary = "Risque cyclonique et submersion marine récurrents en saison humide (juin–novembre Antilles, janvier–mars océan Indien). Cartographie aléa sur Géorisques (DEAL).";
  } else if (coastalLow) {
    level = "modere";
    summary = "Commune littorale basse : exposition aux submersions marines et tempêtes (Xynthia 2010 comme référence). Plans PPRL et atlas submersion à consulter sur Géorisques.";
  } else if (riverLow) {
    level = "mesure";
    summary = "Altitude faible suggère une plaine ou vallée — vérifier le PPRI fluvial sur Géorisques avant toute acquisition rez-de-chaussée.";
  }

  return {
    id: "inondation",
    label: "Inondation & submersion",
    icon: Droplets,
    level,
    summary,
    source: { name: "Géorisques — BRGM / Ministère de la Transition Écologique", url: "https://www.georisques.gouv.fr" },
  };
}

function pollutionFlag(c: City): Flag {
  const region = c.region ?? "";
  const dept = c.department ?? "";
  let level: Level = "faible";
  let summary = "Indices ATMO majoritairement bons à moyens, pas de zone industrielle classée Seveso seuil haut à proximité immédiate du centre.";

  if (region === "Île-de-France") {
    level = "eleve";
    summary = "Bassin parisien : dépassements récurrents de NO₂ près des grands axes (boulevards, autoroutes urbaines) et alertes ozone l'été. ZFE-m active sur l'A86.";
  } else if (["Haute-Savoie", "Savoie", "Isère"].includes(dept) && (c.elevation ?? 0) < 700) {
    level = "eleve";
    summary = "Vallée alpine soumise à l'inversion thermique hivernale : pics PM10 entre décembre et février liés au chauffage bois et au trafic routier (Vallée de l'Arve, cuvette grenobloise).";
  } else if (region === "Auvergne-Rhône-Alpes" && (c.population ?? 0) > 150000) {
    level = "modere";
    summary = "Couloir rhodanien exposé aux pics ozone estivaux et NO₂ trafic le long de l'A7/A47. Réseau Atmo Auvergne-Rhône-Alpes publie l'indice quotidien.";
  } else if (["Bouches-du-Rhône", "Var"].includes(dept) && (c.population ?? 0) > 80000) {
    level = "modere";
    summary = "Façade littorale industrialo-portuaire : ozone estival, NO₂ trafic, pollution issue du fret maritime documentée par AtmoSud.";
  } else if ((c.population ?? 0) > 200000) {
    level = "mesure";
    summary = "Métropole avec trafic routier dense — pics NO₂ ponctuels près des pénétrantes, ZFE-m en déploiement progressif. Suivre l'indice ATMO régional.";
  }

  return {
    id: "pollution",
    label: "Pollution de l'air",
    icon: Wind,
    level,
    summary,
    source: { name: "ATMO France — AASQA agréées", url: "https://www.atmo-france.org" },
  };
}

function sismiqueFlag(c: City): Flag {
  const dept = c.department ?? "";
  const region = c.region ?? "";
  let level: Level = "faible";
  let summary = "Aléa sismique faible (zone 1 ou 2) — pas de prescription parasismique renforcée.";

  const pyrenees = ["Pyrénées-Atlantiques", "Hautes-Pyrénées", "Haute-Garonne", "Pyrénées-Orientales", "Ariège", "Aude"].includes(dept);
  const alpsHigh = ["Haute-Savoie", "Savoie", "Hautes-Alpes", "Alpes-Maritimes", "Alpes-de-Haute-Provence"].includes(dept);
  const antilles = ["Martinique", "Guadeloupe"].includes(region);
  const provence = dept === "Bouches-du-Rhône" || dept === "Var" || dept === "Vaucluse";

  if (antilles) {
    level = "eleve";
    summary = "Zone sismique 5 (la plus exposée) : règles parasismiques renforcées obligatoires depuis 2011 (norme Eurocode 8). Plan séisme Antilles actif.";
  } else if (pyrenees || alpsHigh) {
    level = "modere";
    summary = "Aléa sismique modéré (zone 3 ou 4) : règles parasismiques applicables aux constructions nouvelles. Cartographie BRGM disponible sur Géorisques.";
  } else if (provence) {
    level = "mesure";
    summary = "Aléa sismique modéré (zone 3 sur la majeure partie) — séismes de magnitude 4–5 historiquement documentés (Lambesc 1909).";
  }

  return {
    id: "sismique",
    label: "Risque sismique",
    icon: Mountain,
    level,
    summary,
    source: { name: "BRGM — Zonage sismique de la France", url: "https://www.georisques.gouv.fr/risques/risques-sismiques" },
  };
}

function coutFlag(c: City): Flag {
  const cost = c.scores.cost;
  let level: Level = "faible";
  let summary = `Marché locatif et acquisition dans une fourchette accessible (note coût ${cost.toFixed(1)}/10).`;
  if (cost < 4.0) { level = "critique"; summary = `Loyers et prix m² parmi les plus élevés du pays — note coût ${cost.toFixed(1)}/10. Tensions documentées par l'observatoire Anil et Clameur.`; }
  else if (cost < 5.0) { level = "eleve";  summary = `Marché immobilier tendu (note ${cost.toFixed(1)}/10) — taux d'effort logement souvent au-dessus de 30 % du revenu médian.`; }
  else if (cost < 6.0) { level = "modere"; summary = `Marché en zone tendue (note ${cost.toFixed(1)}/10) : décret encadrement des loyers applicable selon le zonage Pinel/Robien.`; }
  else if (cost < 7.0) { level = "mesure"; summary = `Coût de la vie globalement dans la moyenne nationale, hausse récente du m² à surveiller.`; }
  return {
    id: "cout",
    label: "Coût du logement",
    icon: Home,
    level,
    summary,
    source: { name: "Observatoires locaux des loyers (OLL) — Anil", url: "https://www.observatoires-des-loyers.org" },
  };
}

function transportFlag(c: City): Flag {
  const tr = c.scores.transport;
  let level: Level = "faible";
  let summary = `Réseau dense et alternatives à la voiture identifiées (note ${tr.toFixed(1)}/10).`;
  if (tr < 4.0) { level = "eleve";   summary = `Dépendance forte à la voiture individuelle (note ${tr.toFixed(1)}/10) — pas de tramway, réseau bus limité hors centre.`; }
  else if (tr < 5.0) { level = "modere"; summary = `Réseau structurant limité (note ${tr.toFixed(1)}/10) : la voiture reste l'option pratique pour la périphérie.`; }
  else if (tr < 6.0) { level = "mesure"; summary = `Réseau correct sur le centre, périphéries moins desservies — vivre sans voiture demande de bien choisir son quartier.`; }
  return {
    id: "transport",
    label: "Dépendance voiture",
    icon: Bus,
    level,
    summary,
    source: { name: "Cerema — Mobilités du quotidien", url: "https://www.cerema.fr" },
  };
}

function ecolesFlag(c: City): Flag {
  const sc = c.scores.schools;
  let level: Level = "faible";
  let summary = `Offre scolaire publique/privée correctement dimensionnée (note ${sc.toFixed(1)}/10).`;
  if (sc < 4.0) { level = "eleve";   summary = `Indicateurs DEPP (taux de réussite, décrochage) en retrait — note ${sc.toFixed(1)}/10. À creuser secteur par secteur si famille.`; }
  else if (sc < 5.0) { level = "modere"; summary = `Mosaïque scolaire contrastée (note ${sc.toFixed(1)}/10) : choix du secteur primordial pour le collège public.`; }
  else if (sc < 6.0) { level = "mesure"; summary = `Offre scolaire dans la moyenne, qualité variable selon les établissements.`; }
  return {
    id: "ecoles",
    label: "Écoles & familles",
    icon: GraduationCap,
    level,
    summary,
    source: { name: "DEPP — Ministère de l'Éducation nationale", url: "https://www.education.gouv.fr/la-depp-direction-de-l-evaluation-de-la-prospective-et-de-la-performance-11737" },
  };
}

function tourismeFlag(c: City): Flag {
  const tags = c.characterTags ?? [];
  const region = c.region ?? "";
  const dept = c.department ?? "";
  const dromCoast = ["Martinique", "Guadeloupe", "La Réunion"].includes(region);
  const high = tags.some((t) => ["mer", "tourisme", "soleil"].includes(t)) ||
    dromCoast ||
    ["Alpes-Maritimes", "Var", "Corse-du-Sud", "Haute-Corse", "Vaucluse"].includes(dept);

  let level: Level = "faible";
  let summary = "Pression touristique limitée, vie locale stable hors saison estivale.";
  if (high) {
    level = "modere";
    summary = "Forte saisonnalité touristique : prix logements en juillet–août, embouteillages, services saturés en haute saison (sources Insee tourisme, INSEE recensement résidences secondaires).";
  }
  if (tags.includes("premium") && (c.population ?? 0) < 80000) {
    level = "eleve";
    summary = "Pression touristique premium : flambée du foncier, part élevée de résidences secondaires (>25 % parfois), tension sur le logement permanent des actifs.";
  }
  return {
    id: "tourisme",
    label: "Pression touristique",
    icon: Users,
    level,
    summary,
    source: { name: "Insee — Tourisme et résidences secondaires", url: "https://www.insee.fr/fr/statistiques?theme=70" },
  };
}

function computeFlags(c: City): Flag[] {
  return [
    safetyFlag(c),
    inondationFlag(c),
    caniculeFlag(c),
    pollutionFlag(c),
    sismiqueFlag(c),
    coutFlag(c),
    transportFlag(c),
    ecolesFlag(c),
    tourismeFlag(c),
  ];
}

function vigilance(flags: Flag[]): { score: number; label: string; tone: string } {
  const sum = flags.reduce((acc, f) => acc + LEVEL_META[f.level].weight, 0);
  // 9 flags × max 4 = 36
  const ratio = sum / 36;
  if (ratio >= 0.45) return { score: sum, label: "Vigilance élevée", tone: "text-red-600" };
  if (ratio >= 0.28) return { score: sum, label: "Vigilance modérée", tone: "text-orange-600" };
  if (ratio >= 0.14) return { score: sum, label: "Vigilance mesurée", tone: "text-amber-600" };
  return { score: sum, label: "Vigilance faible", tone: "text-emerald-600" };
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
    ? `Drapeaux à vérifier : ${top.join(", ")}.`
    : "Aucun drapeau majeur, profil de risque globalement maîtrisé.";
  return {
    title: `Red Flags ${city.name} · Risques connus & sources publiques 2026 | MaVilleIdeal`,
    description: `Ce qu'on ne vous dit pas avant de signer à ${city.name} : sécurité, inondation, canicule, pollution, sismicité, coût. ${teaser} Sources : Géorisques, SSMSI, ATMO, BRGM.`,
    alternates: { canonical: `/red-flags/${slug}` },
    openGraph: {
      title: `Red Flags ${city.name} · 2026`,
      description: teaser,
      type: "article",
    },
  };
}

export default async function CityRedFlagsPage({ params }: Props) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) notFound();

  const flags = computeFlags(city);
  const v = vigilance(flags);
  const similar = similarRiskCities(city, flags, CITIES_SEED);

  // Order: weight desc, then label
  const ordered = [...flags].sort((a, b) => {
    const w = LEVEL_META[b.level].weight - LEVEL_META[a.level].weight;
    return w !== 0 ? w : a.label.localeCompare(b.label, "fr");
  });

  const significant = ordered.filter((f) => LEVEL_META[f.level].weight >= 2);

  const crumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Red Flags", path: "/red-flags" },
    { name: city.name, path: `/red-flags/${slug}` },
  ]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Red Flags de ${city.name} — risques connus et sources publiques`,
    about: city.name,
    description: `Fiche red-flag pour ${city.name} (${city.department ?? city.region ?? "France"}). Sources publiques : Géorisques, SSMSI, ATMO, BRGM, Insee.`,
    inLanguage: "fr-FR",
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Drapeaux red-flag · ${city.name}`,
    itemListElement: ordered.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `${f.label} · ${LEVEL_META[f.level].label}`,
    })),
  };

  return (
    <main id="main-content" className="min-h-screen relative">
      <AmbientBackground />
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(crumb)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(articleJsonLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(itemListJsonLd)} />

      {/* Hero */}
      <section className="relative pt-20 pb-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-5">
            <Link href="/red-flags" className="hover:text-[var(--text-secondary)]">Red Flags</Link>
            <span>/</span>
            <span className="text-[var(--text-secondary)]">{city.name}</span>
          </nav>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-sm text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            Fiche Red Flag — Données 2026
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight leading-[1.05]">
            Red Flags de{" "}
            <span className="font-display gradient-text-anim italic">{city.name}</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl leading-relaxed">
            Ce que l&apos;annonce immobilière ne dit jamais : neuf catégories de risques croisés
            avec les bases publiques (Géorisques, SSMSI, ATMO, BRGM, Insee, Météo-France).
            {city.department && <> Département : {city.department}.</>}
          </p>
        </div>
      </section>

      {/* Vigilance gauge */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl glass border border-white/50 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest text-[var(--accent)] font-semibold mb-1">
                Indice de vigilance composite
              </div>
              <div className={`text-3xl font-black font-mono-data ${v.tone}`}>{v.label}</div>
              <div className="text-xs text-[var(--text-tertiary)] mt-1">
                {significant.length} drapeau{significant.length > 1 ? "x" : ""} significatif{significant.length > 1 ? "s" : ""} sur 9 catégories.
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

      {/* Flags grid */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-5">
            Drapeaux par catégorie
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ordered.map((f) => {
              const meta = LEVEL_META[f.level];
              const Icon = f.icon;
              return (
                <article
                  key={f.id}
                  className={`rounded-2xl border ${meta.ring} ${meta.bg} p-5 backdrop-blur-sm`}
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
                    Source : {f.source.name}
                    <span aria-hidden>↗</span>
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Méthode */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
            <h2 className="text-lg font-bold text-[var(--text-primary)] mb-3">Comment lire cette fiche</h2>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              <li>
                <strong className="text-[var(--text-primary)]">Sources publiques uniquement</strong> — chaque drapeau cite une base de référence (Géorisques pour les risques naturels, SSMSI pour la délinquance, ATMO France pour l&apos;air, BRGM pour la sismicité, Insee pour la pression touristique, DEPP pour les écoles, Cerema pour la mobilité).
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Drapeau ≠ verdict</strong> — un risque «&nbsp;élevé&nbsp;» signifie que la catégorie mérite vérification parcelle par parcelle (PPRI, indice quotidien ATMO, zonage). Tous les quartiers ne sont pas exposés à la même intensité.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Géorisques avant signature</strong> — pour toute acquisition, l&apos;État de Risques et Pollutions (ERP) joint à l&apos;acte est obligatoire et synthétise les aléas connus sur l&apos;adresse exacte.
              </li>
              <li>
                <strong className="text-[var(--text-primary)]">Mise à jour</strong> — synthèse 2026 sur données les plus récentes publiées. Pour les zonages réglementaires (PPRI, PPRL, plan séisme), seul Géorisques fait foi.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Similar profile */}
      {similar.length > 0 && (
        <section className="relative pb-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
              Profils de risque proches en {city.region ?? "France"}
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

      {/* Footer nav */}
      <section className="relative pb-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 flex gap-3 flex-wrap">
          <Link
            href={`/villes/${slug}`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            ← Profil complet de {city.name}
          </Link>
          <Link
            href={`/villes/${slug}/climat`}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Climat & saisonnalité
          </Link>
          <Link
            href="/red-flags"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Toutes les fiches red-flag
          </Link>
          <Link
            href="/classements/securite"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Classement sécurité
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
