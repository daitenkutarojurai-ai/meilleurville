import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/AppLink";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CITIES_SEED } from "@/data/cities-seed";
import { RED_FLAG_THEMES, CORPUS_RECUL, CORPUS_SE_VIDENT, CORPUS_SANS_ENFANTS, CORPUS_ARRIVEES, POP_COVERED } from "@/lib/red-flag-themes";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";
import { clampMeta } from "@/lib/brand";
import { redFlagThemeAlternatesEn } from "@/lib/red-flag-theme-twins";

export const revalidate = false;
export const dynamicParams = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

type Props = { params: Promise<{ locale: string; slug: string }> };

interface EnTheme {
  enSlug: string;
  frSlug: string;
  emoji: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  reality: string;
  methodology: string;
}

// Corpus counts are read from the same objects as the FR twin's prose, so the
// two locales cannot drift apart when the census files are refreshed (règle 2,
// CLAUDE.md § Score convention). City names and their figures stay hand-written,
// as on the FR side.
const en1 = (v: number) => v.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const en2 = (v: number) => v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const enInt = (v: number) => Math.round(v).toLocaleString("en-GB");

const EN_THEMES: EnTheme[] = [
  {
    enSlug: "buyers-remorse",
    frSlug: "villes-regrets-achat",
    emoji: "💸",
    title: "Cities you'll regret buying in",
    metaTitle: "Cities you'll regret buying in · France 2026",
    metaDescription:
      "Top cities where the purchase price (DVF data) significantly exceeds actual quality of life. Global score, median €/m², climate. Every city in our calibrated dataset.",
    intro:
      "The estate agent's brochure promises a safe investment. The reality: price per m² that would give a Parisian pause, and quality of life that turns out to be average — dragged down by heatwaves, air quality, or noise.",
    reality:
      "We cross the median purchase price per m² (DVF / Meilleurs Agents 2024) with the site's global quality-of-life score, penalising cities weak on heat risk or air quality. All cities shown are in the top price quartile (p75 nationally) AND have a global score below 6.5/10.",
    methodology:
      "Severity = 40% price relative to P75 + 40% gap to global score 6.5 + 20% heat/air bonus. Price source: DVF (land value transactions) + 2024 rent observatories.",
  },
  {
    enSlug: "car-dependent",
    frSlug: "villes-sans-voiture-difficile",
    emoji: "🚗",
    title: "Cities where living car-free is genuinely hard",
    metaTitle: "Car-dependent French cities 2026 · Hard without a car",
    metaDescription:
      "French cities over 30,000 where living without a car is still complicated: no tram, limited rail service. Car-free score calibrated on transport network + density.",
    intro:
      "Every town hall promises its tram, its pedestrian zone, its cycling plan. In practice, many mid-sized French cities remain structurally car-dependent: no tram, underperforming bus network, last train at 9pm.",
    reality:
      "We rank cities over 30,000 where the car-free score is below 6/10. Cities over 100k with a score below 5 get an extra penalty — at that size, the network should exist.",
    methodology:
      "Car-free score = site transport score (GTFS multimodal + OSM walkability), adjusted to penalise mid-sized cities without a structured network. Source: GTFS SNCF + RATP + OSM 2024.",
  },
  {
    enSlug: "beautiful-brutal-summers",
    frSlug: "villes-belles-invivables-ete",
    emoji: "🥵",
    title: "Beautiful cities… that are unbearable in summer",
    metaTitle: "Unbearable summers 2026 · Beautiful but suffocating cities",
    metaDescription:
      "French cities that look great in photos but swelter in summer: heatwaves, mass tourism, average July temperatures ≥ 27 °C. Based on Météo-France 1991-2020 climatology.",
    intro:
      "Instagram photos in May: flowering alleys, old stone, shaded terraces. July reality: 38 °C in the street, no air conditioning in rentals, tourists doubling the population. Beautiful on paper, suffocating in practice.",
    reality:
      "We filter cities with a quality-of-life score ≥ 6.5/10 (genuinely appealing year-round), then keep those whose heat resilience score is ≤ 5/10 — corresponding to average July temperatures ≥ 27 °C per Météo-France 1991-2020 climatology. Tourism tag adds an extra penalty.",
    methodology:
      "Severity = 1.8 × gap to heat score 5 + 1.5 if tagged tourist. Temperature source: Météo-France 1991-2020 averages.",
  },
  {
    enSlug: "chronic-air-pollution",
    frSlug: "villes-pollution-air-chronique",
    emoji: "🌫️",
    title: "Cities with chronically bad air in winter",
    metaTitle: "Air pollution 2026 · French cities with the highest PM2.5",
    metaDescription:
      "2026 ranking of French cities chronically above WHO air quality limits: Alpine valleys, Paris basin, Rhône corridor, industrial ports. Source: ATMO France.",
    intro:
      "The estate agent highlights the Alpine views or the Haussmann boulevards. Nobody mentions the thick January–February fog when thermal inversion traps fine particles in the valley, or the chronic NO₂ alerts along the Paris ring road.",
    reality:
      "We filter cities whose air quality score is ≤ 5/10 (PM2.5 ≥ 11-13 µg/m³, over twice the WHO 2021 threshold of 5 µg/m³). Documented zones (Alpine basins, Paris basin, Rhône corridor, industrial ports) receive additional severity bonuses.",
    methodology:
      "Severity = 1.9 × gap to air score 5 + zone bonus (Alpine basin +2.0 / dense IDF +1.4 / Rhône corridor +1.2 / industrial port +1.0). PM2.5 source: ATMO France 2023 annual dept averages vs WHO 2021 threshold.",
  },
  {
    enSlug: "natural-hazards",
    frSlug: "villes-risques-naturels",
    emoji: "⚠️",
    title: "Cities most exposed to natural hazards",
    metaTitle: "Natural hazards 2026 · Most exposed French cities",
    metaDescription:
      "2026 ranking of French cities with the highest composite across 4 hazards: flooding, clay shrink-swell (BRGM), wildfire (ONF/ECASC), seismics (2011 zoning). Open data: Géorisques.",
    intro:
      "The listing touts the river view, the hillside proximity, the gentle slope. Nobody mentions the flooded cellar three times in fifteen years, the wall cracks from expanding clay, or the wildfire risk zone two streets away. Natural risks don't show up in property photos — they appear in the mandatory ERP risk statement.",
    reality:
      "We rank cities whose composite (flooding 35% + clay 25% + wildfire 20% + seismics 20%) exceeds 5.5/10, with a penalty when at least two of the four hazards exceed 6/10 — a genuine compound risk, not a single isolated hazard.",
    methodology:
      "Severity = composite (0-10) + 1.2 if two or more dimensions ≥ 6/10. A commune-level estimate, not a survey: clay and seismic hazard are taken at département level (reference frameworks BRGM, BCSF/MTE decree 2010-1255) where the zoning is set commune by commune, wildfire follows the ONF + ECASC classification, and flooding is a proxy from river, elevation and coast.",
  },
  {
    enSlug: "noise-nightmare",
    frSlug: "villes-bruit-cauchemar",
    emoji: "🔊",
    title: "Cities where noise is a daily nightmare",
    metaTitle: "Noisiest cities in France · 2026 ranking",
    metaDescription:
      "2026 ranking of French cities where noise compounds saturated road traffic, airport overflights (PEB zones), high-speed rail and nightlife. Aggregate composite from CBS / DGAC / Bruitparif.",
    intro:
      "The agency promises a quiet neighbourhood. On the ground: the ring road 200m away, background motorway noise, A380s every 90 seconds overhead, or a student city centre where terraces close at 2am.",
    reality:
      "We rank cities over 30,000 whose noise composite (road 35% + air 25% + night 25% + rail 15%) exceeds 5.5/10, with a penalty when at least two sources exceed 6/10 — a genuine compound exposure. The WHO recommends Lden < 53 dB(A) day and Lnight < 45 dB(A) night.",
    methodology:
      "Severity = composite + 1.2 if two or more sources ≥ 6/10. A commune-level estimate, not a sound measurement: the model is keyed to the public reference frameworks (Strategic Noise Maps, EU directive 2002/49/EC; DGAC PEB noise exposure plans; Bruitparif in Île-de-France) without reusing their readings. Population filter ≥ 30,000.",
  },
  {
    enSlug: "water-stress",
    frSlug: "villes-sans-eau-ete",
    emoji: "💧",
    title: "Cities facing water shortages every summer",
    metaTitle: "Water stress 2026 · French cities most at risk of drought",
    metaDescription:
      "2026 ranking of French cities with recurring drought: near-annual Propluvia crisis orders, low BRGM groundwater levels, drinking water supply under pressure. Aggregate composite.",
    intro:
      "The listing boasts sunny climate, swimming pool, Mediterranean garden. Nobody mentions that watering is banned five months a year, the pool drains in mid-July, the local water table has been low for three years, and the municipality is considering water rationing.",
    reality:
      "We rank cities whose composite (restrictions 35% + groundwater 25% + climate 20% + supply 20%) exceeds 6/10, with a severity bonus when restrictions reach 'near-annual crisis' level (Propluvia) OR low water table and stressed drinking supply combine.",
    methodology:
      "Severity = composite + 1.0 if restrictions ≥ 8.5/10 + 0.8 if low groundwater AND stressed supply. A commune-level estimate, not the restriction order in force: the model is keyed to the public reference frameworks (Propluvia for drought orders, BRGM for groundwater levels, Météo-France for summer climate) without reusing their readings.",
  },
  {
    enSlug: "medical-desert",
    frSlug: "villes-desert-medical",
    emoji: "🩺",
    title: "Cities with critical healthcare access problems",
    metaTitle: "Medical deserts 2026 · French cities short of GPs",
    metaDescription:
      "French cities over 10,000 below the official GP shortage threshold (DREES APL 2024 under 2.5 visits a year per resident) — most of them in the Paris suburbs.",
    intro:
      "Your GP retires and no practice nearby is taking new patients. People picture medical deserts at the end of a country road. They are also on the edge of Paris, in RER-served towns of 20,000 to 30,000 people where the GP care within reach per resident is lower than in most rural market towns. The listing won't show it; you find out the evening you need a doctor.",
    reality:
      "We rank cities over 10,000 whose localised potential accessibility (APL) to GPs, published by DREES for 2024, is under 2.5 consultations a year per resident — the threshold that defines an under-served area in France. APL counts the doctors in the town and in neighbouring towns, weighted by distance and by their actual activity, against an age-standardised population. It is a measurement, not an estimate. 78 of our cities fall below the threshold, 65 of them in Île-de-France. The data contradicts the rural picture: market towns in supposedly under-served departments — Aurillac (4.96), Vesoul (5.62), Épinal (4.96) — concentrate the doctors of their catchment and sit above the national average (3.72). Outer Paris suburbs such as Houilles, Brétigny-sur-Orge, Goussainville and Pontoise have the fewest GPs within reach. Outside Île-de-France, Saint-Amand-Montrond, Saint-Laurent-du-Maroni and Méru lead the list. Only the twelve most exposed cities are shown.",
    methodology:
      "Indicator: DREES APL to GPs, 2024, in consultations or home visits within reach per age-standardised resident per year; entry below 2.5, the under-served threshold. Severity = GP score (continuous scale, 10 = desert: APL 1.5 → 7.5/10, APL 2.5 → 5.5/10) + 0.8 if no emergency department is recorded in the town (INSEE BPE 2025) and no university-hospital site is within reach + 0.4 if the town has fewer than 1.75 pharmacies per 10,000 residents, capped at 10. Paris, Lyon and Marseille: arrondissements averaged, weighted by standardised population, as DREES prescribes. Not covered: Mamoudzou (Mayotte, outside the APL) and Pierrefitte-sur-Seine (merged into Saint-Denis). APL measures care within reach, not how many doctors accept new patients, and says nothing about specialists. The ARS zoning used for installation grants works by health area, not by town: check yours before deciding.",
  },
  {
    enSlug: "chronic-unemployment",
    frSlug: "villes-chomage-eleve",
    emoji: "📉",
    title: "Cities with chronically weak job markets",
    metaTitle: "Unemployment 2026 · French cities with weak job markets",
    metaDescription:
      "French cities over 15,000 combining high unemployment, shrinking local jobs and low pay, measured town by town by INSEE: Sedan, Bruay-la-Buissière…",
    intro:
      "The agent touts the affordable townhouse and the charming town centre. Nobody mentions the local labour market has been distressed since the last factory closed, nearly one in five people in the labour force reports being unemployed, and the town has fewer jobs than six years ago.",
    reality:
      "We rank cities over 15,000 whose composite (unemployment 35% + wages 25% + dynamism 20% + mix 20%) exceeds 6.5/10, with a penalty when depressed unemployment and shrinking local jobs compound — a genuine structural decline. Three of the four dimensions are measured by INSEE for each town: census unemployment among residents aged 15–64 (2023), the change in jobs located in the town since 2017, and the average pay of private-sector jobs there. Sector mix is estimated. Sedan and Bruay-la-Buissière lead, ahead of Villiers-le-Bel, Bondy, Forbach and Douai: former industrial basins in the north and east, and two Paris suburbs where local jobs pay little.",
    methodology:
      "Severity = composite + 1.2 if unemployment ≥ 7.5/10 AND dynamism ≥ 6.5/10 + 0.5 if wages ≥ 7/10. Unemployment: unemployed share of residents aged 15–64 in the labour force, INSEE census 2023 (self-declared, higher than the ILO rate; France 11.4% on this measure), depressed from 18%. Dynamism: change in jobs located in the town 2017–2023 (France +6.6%), depressed below −3%. Wages: average net monthly full-time-equivalent pay of private-sector jobs located in the town, INSEE 2024. Sector mix: estimated from the department and the town's profile. The figures describe the town, not the commuting area.",
  },
  {
    enSlug: "quality-of-life-stretched",
    frSlug: "villes-cadre-de-vie-tendu",
    emoji: "😓",
    title: "Cities where quality of life is stretched across every dimension",
    metaTitle: "Lowest quality of life in France · 2026 city ranking",
    metaDescription:
      "2026 ranking of French cities over 15,000 with the lowest quality-of-life index: degraded environment, difficult healthcare access, weak labour market.",
    intro:
      "On paper: affordable housing, reasonable taxes, neighbourhood life. On the ground: poor air, medical desert, distressed job market. When three pillars collapse together, every life project becomes a series of losing trade-offs.",
    reality:
      "We rank cities over 15,000 whose mega-index (environment 35% + health 30% + employment 35%) is ≤ 4.8/10, with a penalty when at least 2 of the 3 pillars fall below 4/10 — a genuine compounding effect.",
    methodology:
      "Severity = (5 − index) × 2 + 1.2 if ≥ 2 pillars ≤ 4/10 + 0.6 if ≤ 3.5/10. The environment pillar is a commune-level estimate keyed to the ATMO/CITEPA/RNSA frameworks, not a station reading; the health pillar measures GP access (DREES APL), emergency departments and pharmacies (INSEE) and estimates specialists; the employment pillar measures unemployment, job growth and pay (INSEE) and estimates sector mix.",
  },
  {
    enSlug: "cost-explosion",
    frSlug: "villes-couts-explosifs",
    emoji: "💥",
    title: "Cities where living costs exceed the local salary",
    metaTitle: "Cost of living 2026 · French cities too dear for families",
    metaDescription:
      "2026 ranking of French cities over 20,000 where monthly family household cost exceeds 60% of the departmental median net salary. Rent, heating, mobility, property tax.",
    intro:
      "Nobody does the maths: T3 family rent + heating + car + property tax + school meals = €X/month; departmental median net salary = €Y/month. When the ratio exceeds 60%, nothing is left for emergencies, holidays or savings.",
    reality:
      "We compute the monthly family household cost (T3 rent + zone heating + car mobility + taxes + school meals) for each city over 20,000 and divide by the departmental median net salary (INSEE DADS proxy). All cities shown exceed 60% of salary; above 80%, the median household is technically squeezed.",
    methodology:
      "Severity = family cost / dept median salary ratio, rescaled from [0.6; 1.0] → [5; 10]. Sources: DVF + rent observatories, ADEME (heating), France Assureurs (car), DGFiP (property tax), INSEE DADS (median salaries). Population filter ≥ 20,000.",
  },
  {
    enSlug: "public-services-desert",
    frSlug: "villes-desert-services-publics",
    emoji: "🏛️",
    title: "Cities in a public services desert",
    metaTitle: "Public services 2026 · The worst-served French cities",
    metaDescription:
      "2026 ranking of cities over 10,000 with a public services composite ≥ 6.5/10: schools, post offices & France Services centres, town halls, libraries. A commune-level estimate, not a directory of facilities.",
    intro:
      "The social security card changes address, the post office closed, the local secondary school is 15km away, the town hall opens two half-days a week. None of these signals appear in a property brochure, but together they define what living in a 'service desert' means day-to-day.",
    reality:
      "We rank cities over 10,000 whose composite exceeds 6.5/10 (10 = worst). Bonus +1.2 when both schools AND postal network are in desert territory — a genuine compound gap, not a single weak axis.",
    methodology:
      "Severity = composite + 1.2 if schools AND post ≥ 6.5 + 0.4 if town hall ≥ 6.5. Weighting: schools 35% · town hall 25% · post 25% · library 15%. Estimated by population band × department: the categories follow the DEPP school directory, CAF childcare pressure, the La Poste outlets, the ANCT France Services centres and the BNF public-reading observatory — reference frameworks, not sources. No directory of facilities is ingested, so a recent closure or opening will not show up.",
  },
  {
    enSlug: "anti-cycling",
    frSlug: "villes-anti-velo",
    emoji: "🚲",
    title: "Cities where daily cycling is out of reach",
    metaTitle: "Anti-cycling cities 2026 · Where daily cycling fails",
    metaDescription:
      "2026 ranking of cities over 15,000 with a cyclability composite ≤ 4.5/10: sparse network, terrain, danger, hostile climate. A commune-level estimate, not the FUB barometer score.",
    intro:
      "Every town hall promises its cycling plan. In practice, some cities remain structurally hostile: no continuous cycle lanes, hilly terrain discouraging daily commutes, saturated road users, windy or rainy climate 200 days a year.",
    reality:
      "We rank cities over 15,000 whose composite (network + topography + safety + climate) falls ≤ 4.5/10. Convention is reversed vs other themes: 10 = excellent. Bonus +1.2 when network AND topography are both ≤ 4 — no lanes plus steep hills.",
    methodology:
      "Severity = (5 − composite) × 2 + combo bonus. Weighting: network 35% · topography 25% · safety 25% · climate 15%. Commune-level estimate from town size, terrain, climate and tags: the reference points come from the FUB Barometer (French Cyclists' Federation), the Vélo & Territoires rankings and the EuroVelo routes — reference frameworks, not sources. No survey score, no measured kilometre of lane and no accident data is ingested.",
  },
  {
    enSlug: "sports-poor-cities",
    frSlug: "villes-pauvres-en-sport",
    emoji: "🏟️",
    title: "Cities where regular sport is a logistical struggle",
    metaTitle: "Sports-poor French cities 2026 · Where practice is hard",
    metaDescription:
      "2026 ranking of cities over 15,000 with a sport & leisure composite ≤ 4.5/10: thin municipal facilities, fragile club network, limited outdoor playground. Sources: INJEP RES + DRAJES + Météo-France.",
    intro:
      "Town halls advertise the renovated pool, the brand-new sports hall, the photo of a packed stadium. Daily life looks different: one school gym opened to the public, the next indoor pool 18 km away in the next district, a tennis club that stopped taking new members, and the Tuesday-evening cardio slot booked six months out. Sport stops being a habit and becomes a permanent logistics problem — most visibly for families wanting two children in two disciplines, car-free young workers, and retirees needing medically supervised classes.",
    reality:
      "We rank cities over 15,000 whose sport composite (facilities + outdoor playground + club scene + climate) falls ≤ 4.5/10. Convention is reversed vs most red flags here: 10 = excellent for practice, so low = worst. Bonus +1.2 when facilities AND clubs are both ≤ 4 — neither municipal supply nor the club network holds up. Bonus +0.4 when the outdoor playground is also limited (≤ 4), i.e. when nature doesn't even rescue a casual jogging route. The list is dominated by small subprefectures in rural decline (Creuse, Cantal, Lozère, Indre), industrial basins in conversion that never re-invested in sport, and peri-urban satellites without a forest, mountain or coastline within reach.",
    methodology:
      "Severity = (5 − composite) × 2 + 1.2 if facilities AND clubs ≤ 4 + 0.4 if outdoor ≤ 4, capped at 10/10. Composite weighting: facilities 35% · outdoor playground 30% · club scene 20% · climate 15%. Population filter ≥ 15,000. Sources: INJEP RES (Sports Facilities Census, sports.gouv.fr) for pools / stadiums / sports halls, DRAJES / DDETSPP for club density and licensed members, IGN + Météo-France for relief and 1991-2020 climatology, FFRandonnée for marked-trail density. Caveat: a new intercommunal facility opened after 2024 may shift one city's score without changing the seed's departmental average.",
  },
  {
    enSlug: "critical-ageing",
    frSlug: "villes-vieillissement-critique",
    emoji: "🕰️",
    title: "Cities in critical demographic decline",
    metaTitle: "Critical ageing 2026 — French cities in demographic decline",
    metaDescription:
      "2026 ranking of cities over 10,000 with a demographic composite ≥ 7/10: 60+ share, working-age deficit, negative natural + migratory balance. Source: INSEE RP + demographic reports.",
    intro:
      "The €80k house is tempting. Nobody mentions the municipality has been losing 1% of its population per year for 30 years, the median age is over 50, a school class closes every 3 years, and the pharmacy is looking for a buyer who never comes. Negative demographics = retracting services = depreciating property.",
    reality:
      "We rank cities over 10,000 whose composite exceeds 7/10. Bonus +1.2 when ageing AND trajectory are both ≥ 7 — high senior share (>35%) AND structurally negative demographic balance combined.",
    methodology:
      "Severity = composite + 1.2 if ageing AND trajectory ≥ 7 + 0.4 if young adults ≥ 7. Weighting: ageing 30% · trajectory 30% · young adults 25% · renewal 15%. Ageing and trajectory are measured commune by commune in the Insee census; young adults and renewal are estimated from the department and the town's profile. No projection is ingested — INSEE OMPHALE models 2050-2070 by employment zone and is not reused here.",
  },
  {
    enSlug: "tense-nights",
    frSlug: "villes-nuit-tendue",
    emoji: "🌙",
    title: "Cities with tense night safety in party districts",
    metaTitle: "Night safety 2026 · French cities under the most pressure",
    metaDescription:
      "2026 ranking of cities over 15,000 with a night safety sub-score exceeding 6.5/10: fights, nocturnal assaults concentrated on festive/student/tourist centres. A commune-level estimate, not recorded crime.",
    intro:
      "The overall safety score says 'average', but the nocturnal experience in some hyper-festive, student or tourist city centres is very different: fights outside clubs, assaults on the way home from an evening out, incidents concentrated on 4 streets in the centre.",
    reality:
      "We isolate the 'night safety' sub-score — an estimate following the SSMSI categories of fights and nocturnal assaults, not a count of them — and rank cities over 15,000 exceeding 6.5/10 on it. Bonus +0.8 when persons offences corroborate (persons ≥ 6), +0.6 when explicitly tagged festive / student / tourist.",
    methodology:
      "Severity = nocturnal sub-score + combo bonuses. Weighting: property 35% · persons 30% · night 20% · VFFS 15%. Commune-level estimate following the categories of the SSMSI (Interior Ministry statistics service, interstats.fr) — a reference framework, not a source: no per-1,000 rate is ingested, these are not recorded offences. Note: a high rate may reflect both a genuinely tenser environment AND better reporting.",
  },
  {
    enSlug: "harsh-winters",
    frSlug: "villes-hiver-rude",
    emoji: "❄️",
    title: "Cities with the harshest winters",
    metaTitle: "Harsh winters 2026 — French cities most brutal in January",
    metaDescription:
      "2026 ranking of French cities with the worst winters: freezing January temperatures and persistent grey skies combined. Météo-France 1991-2020 temperature and sunshine data.",
    intro:
      "Property photos are always taken in May: sunny terraces, green gardens, flowering streets. Nobody shows January — frost on every windscreen, low sky that doesn't lift before noon, whole weeks without an hour of sunshine.",
    reality:
      "We cross two compoundable dimensions: cold (average January temperature, Météo-France 1991-2020 climatology) and grey skies (annual sunshine hours — an honest proxy for seasonal light deprivation). The worst cases cumulate both; that compound gets the severity penalty.",
    methodology:
      "Severity = 50% cold factor (5 °C in January → 0, -1 °C → 10) + 50% grey factor (1,950 hours sunshine/year → 0, 1,480 hours → 10) + 1.2 penalty when both factors exceed 5/10. Sources: Météo-France 1991-2020 climatology (January temperatures, annual sunshine duration).",
  },
  {
    enSlug: "young-workers-leaving",
    frSlug: "villes-fuite-jeunes-actifs",
    emoji: "🎒",
    title: "Cities that 25-35s are quietly leaving",
    metaTitle: "Young workers leaving 2026 — Cities losing their 25-35s",
    metaDescription:
      "2026 ranking of French cities losing their 25-35s: demographic deficit, negative balance, unemployment and local jobs measured by INSEE. Every city in our dataset.",
    intro:
      "The scenario doesn't show up in the town's attractiveness brochure. The 18-22s leave to study in Lyon, Bordeaux or Toulouse, some vaguely think they'll come back 'later, when it's time to start a family' — and never do. By 30, the whole cohort has moved to the metropolitan hubs, and the city is left with a lid-shaped demography: seniors who stayed, teens who'll leave, and a gaping hole at the top of the working-age pyramid. It's the exact opposite of the town-centre revitalisation pitch.",
    reality:
      "We cross the `youngActives` score from `lib/demography` (INSEE census proxy for the 25-35 share) with `trajectory` (natural + migratory balance, INSEE Demographic Report) and the unemployment score from `lib/employment-market` (INSEE census 2023, town level). Cities that surface here are rarely spectacular — no scandal, no pollution — but they compound three signals: structural young-worker deficit, negative demographic balance, and a labour market tense on the applicant side. A bonus applies for subprefectures under 25,000 where the missing critical mass makes retention even harder. The filter deliberately excludes cities already dominated by ageing (demographic composite ≥ 8.5) — those belong in the critical-ageing theme.",
    methodology:
      "Severity = (0.55 × youngActives + 0.18 × max(0, trajectory − 5) + 0.16 × max(0, unemployment − 5) + 0.10 × max(0, dynamism − 5) + size penalty +0.4 if <25,000 or +0.2 if <40,000) × 1.7, capped at 10/10. Filter: population ≥ 10,000, demographic composite < 8.5 (to avoid overlap with critical-ageing), severity ≥ 6/10. Trajectory, unemployment (census 2023) and dynamism (change in jobs located in the town, 2017–2023) are measured by INSEE town by town; the 25-35 share is estimated from the department and the town's profile.",
  },
  {
    enSlug: "theft-burglary",
    frSlug: "villes-vols-cambriolages",
    emoji: "🔓",
    title: "Cities weighed down by burglary and vehicle theft",
    metaTitle: "Theft & burglary 2026 — France's most affected cities",
    metaDescription:
      "2026 ranking of French cities over 30,000 where the property-crime sub-score exceeds 6.5/10: burglary, vehicle theft, wilful damage. A commune-level estimate, not recorded crime.",
    intro:
      "The headline safety score reads 'average' and the listing brochure sells you the quiet residential street, the gated parking, the alarm system included. On the ground: car found broken into on Tuesday morning, the block's cellar picked over, the neighbour's scooter stolen twice in six months, and the same tired conversation at the auto-glass shop the third time you replace the rear windscreen. Property offences — burglary, vehicle theft, wilful damage — don't kill anyone, but they wear down daily life and the wallet with a regularity that never appears in a brochure.",
    reality:
      "We isolate the `property` sub-score from `lib/safety-deep` — the dimension that carries 35% of the safety composite and aggregates residential burglary, vehicle theft and attempted theft, thefts from parked vehicles, and wilful damage, in the SSMSI categories. We keep cities over 30,000 whose sub-score exceeds 6.5/10. Severity bonus when the persons-crime sub-score corroborates (an isolated signal can be a one-off; a compound of property + persons ≥ 6 reveals a genuine basin-wide reality). Another bonus when the city is a large metropolis with a global score ≥ 6.5/10 — the polished, desirable façade that hides a chronic burglary undercurrent. A final bonus when the city is explicitly tourism-tagged and over 30,000: seasonal saturation of break-ins on second homes and rental vehicles, particularly documented along the Mediterranean coast and the Atlantic seaboard.",
    methodology:
      "Severity = property sub-score + 0.8 if persons ≥ 6/10 + 0.5 if metropolis with global score ≥ 6.5 + 0.4 if tourism-tagged and over 30,000. Safety-deep composite weighting: property 35% · persons 30% · night 20% · gender-based violence 15%. The property sub-score is a commune-level estimate following the categories of the SSMSI (Interior Ministry statistics service, interstats.fr) — a reference framework, not a source: no municipal series is ingested. INSEE population and the proprietary character-tags (metropolis / tourism vocation) also feed in. Caveat: a high rate may reflect both genuine pressure AND a better reporting rate; theft of dockless shared bikes falls outside the standard SSMSI perimeter.",
  },
  {
    enSlug: "cultural-desert",
    frSlug: "villes-desert-culturel",
    emoji: "🎭",
    title: "Cities where the cultural offer stays thin",
    metaTitle: "Cultural desert 2026 — Cities with a thin cultural offer",
    metaDescription:
      "2026 ranking of French cities over 15,000 with a culture score at or below 4.5/10: few label venues, sparse arthouse cinemas, stretched municipal libraries. Source: DEPS-MC, BNF.",
    intro:
      "The brochure talks up a 'lively town centre' and drops in a photo of the one summer festival. Day-to-day reality: one multiplex screening the same national line-up, no state-labelled venue, a public library open four days a week, and the summer programme boils down to two free concerts on the market square. For the urban profile who wants to see an exhibition on a rainy Sunday, culture becomes a mandatory 80-kilometre round trip.",
    reality:
      "We rank cities over 15,000 whose culture score in the proprietary seed falls at or below 4.5/10 (positive convention: 10 = excellent cultural offer, so lower = worse). Severity is amplified when the municipal library — computed by `lib/public-services` (inverted convention: 10 = worst) — is itself under-resourced: the compound where neither the cultural scene nor the public reading investment holds. Bonus when no cultural character-tag surfaces in the seed (culturel, patrimoine, étudiant, festival, bohème, historique) — the town does not even claim culture as a vocation. A further bonus applies when the transport score is also 4/10 or below (leaving town for a concert eats time and money — cultural isolation compounds with modal isolation). The cities that surface are overwhelmingly industrial subprefectures in reconversion, peri-urban satellites with no cultural policy of their own, and coastal communes that live the tourist season but not the rest of the year.",
    methodology:
      "Severity = (5 − culture seed) × 2 + 1.4 if library score ≥ 7/10 (or +0.8 if library ≥ 5/10) + 0.5 if no cultural tag (culturel / patrimoine / étudiant / festival / bohème / historique) + 0.6 if transport seed ≤ 4 + 0.5 if population 30,000–80,000 (the tier where a labelled venue and an independent cinema become expected). Capped at 10/10, filtered to severity ≥ 6. Sources: DEPS-MC (French Ministry of Culture — statistics department) for the national-scene / SMAC / drama-centre labels, BNF 2024 library observatory, CNC arthouse cinema coverage, proprietary character-tags (declared vocations). Caveat: grassroots culture (community centres, film clubs, citizen festivals) does not systematically show up in the national nomenclatures — a listed city can still have a real alternative scene the labels miss.",
  },
  {
    enSlug: "daily-traffic-jams",
    frSlug: "villes-embouteillages-quotidiens",
    emoji: "🚥",
    title: "Cities gridlocked every rush hour",
    metaTitle: "Daily traffic jams 2026 — French cities stuck at peak hours",
    metaDescription:
      "2026 ranking of French cities over 40,000 caught in structural congestion: A86, A7, A8, Grenoble basin. Weak transit + documented saturated corridors.",
    intro:
      "The estate agent times '15 minutes from the station' at 11am on a Sunday in September. Reality from November to March, Monday to Friday, 7.30–9.15am and 5–7.30pm: the pipe saturates. The Bordeaux ring road stretches from 20 to 55 minutes, the A7 south of Lyon becomes a 12-km car park, the Fourvière tunnel absorbs its daily jam, the A86 west of Paris seizes up at Rueil by 7.40am. Commuters lose an extra hour to ninety minutes per day — around 300 hours a year, the equivalent of six working weeks spent behind a wheel, engine idling, waiting for the convoy to move. The cognitive tax (fatigue, short sleep, irritability) and the financial one (fuel, wear, tolls, faster depreciation) never appear on the listing.",
    reality:
      "We keep cities over 40,000 with a transit score in the tension band (3.5–6.5/10) — enough network to pull commuters in, not enough to absorb the peak. Then we only retain those inside a road corridor documented by Bison Futé archives 2022–2024 and SIREDO motorway counts: the Paris ring on A6/A10/A86/A15/A4, Marseille on A7/A55/A50 and the Prado tunnel, Lyon on A6/A7/A46 and Fourvière, the Riviera on A8/A57, the Geneva-border pendulum on A40/A41, the Bordeaux ring A630, the Nantes N844, the Toulouse ring A620/A621, the Grenoble basin on A48/A480, and the Lille metropolis on A1/A22. Cities where a genuinely fluid tram drains the road (Strasbourg, central Nantes, central Bordeaux) fall out via the transit-score ceiling — the ranking only catches the nodes where the commuter stays trapped in a car.",
    methodology:
      "Severity = 0.35 × transit factor (6.5 → 0, 3.5 → 10) + 0.25 × population factor (40,000 → 0, 400,000 → 10) + zonal bonus (Paris ring +2.2 / Marseille +2.0 / Lyon +1.9 / Grenoble basin +1.8 / Riviera +1.7 / Geneva border +1.7 / Bordeaux +1.5 / Nantes +1.5 / Toulouse +1.5 / Lille +1.2) + 0.5 if cost score ≤ 5/10 (long-commute proxy: expensive housing pushes households to the ring, which lengthens trips and saturates the corridor ends). Capped at 10/10, filtered to severity ≥ 5, transit ∈ [3.5; 6.5], population ≥ 40,000, central Paris excluded (the car is already marginal). Sources: Bison Futé (weekend red/black-section archives 2022–2024), Sytadin (Île-de-France Roads Directorate real-time A1–A15–A86–A104), SIREDO maps (Ministry of Ecological Transition permanent motorway counts), site seed (transit, cost, population, department). Caveat: the transit score aggregates PT supply + OSM walkability rather than measuring road congestion directly; we use its inverse as a proxy (weak PT + high population + documented saturated corridor = congestion pressure). Intra-city variance can be strong (Vitrolles centre vs Fos, Vénissieux Minguettes vs Perrache) — the score covers the whole commune. Check Bison Futé saturation maps and real Waze/Google travel times on a Tuesday morning in November before signing anything in a peri-urban ring.",
  },
  {
    enSlug: "mono-tourism-dependence",
    frSlug: "villes-mono-touristiques",
    emoji: "🏖️",
    title: "Cities that depend on a single tourism season",
    metaTitle: "Mono-tourism 2026 — French cities that empty out off-season",
    metaDescription:
      "2026 ranking of French cities whose economy hinges on one tourist season: shops shuttered six months a year, thin private employment outside hospitality. INSEE sector mix.",
    intro:
      "The brochure shows August: postcard streets, packed terraces, beach 800 metres away. Nobody shows the same street in February — shutters down, restaurants closed six months out of twelve, half-empty schools, and the last GP left for the next town 60 km away. When a season accounts for 80% of local revenue, life isn't organised around a lifestyle — it's organised around a shared partial-unemployment calendar that runs the whole basin.",
    reality:
      "We rank cities up to 80,000 whose `sectorMix` score (lib/employment-market) flags a weak private diversification — typically the Var, Alpes-Maritimes, Hautes-Alpes, Pyrénées-Orientales, both Corsican departments, and isolated coastal / ski / spa resorts sitting inside otherwise rural territories. The base 7/10 model score is amplified by a small-size penalty (under 30,000: no non-tourism private fabric to cushion the shoulder seasons) and by a bonus when the city posts a high overall quality-of-life score — the polished façade that hides a seasonally-dependent economy.",
    methodology:
      "Severity = sectorMix score + 1.5 if an explicit seaside / ski / thermal-spa tag applies (otherwise +1.0 for a coastal / ski tag) + 1.0 if population < 30,000 + 0.5 if overall score ≥ 6.5. Filter: population > 0 and ≤ 80,000, severity ≥ 6/10. Sources: MONO_TOURISM_DEPTS (INSEE 2024 sector-of-employment breakdown) + proprietary character tags (declared vocations).",
  },
  {
    enSlug: "heavy-property-tax",
    frSlug: "villes-fiscalite-lourde",
    emoji: "🧾",
    title: "Cities with the heaviest property tax burden",
    metaTitle: "Heavy property tax 2026 — France's costliest cities to own",
    metaDescription:
      "2026 ranking of French cities where property tax and cadastral base compound: high DGFiP rates, tight-zone THRS surcharge, high €/m². Source DGFiP/OFL.",
    intro:
      "The brochure highlights the up-and-coming neighbourhood, the rare listing, the €/m² 'still reasonable'. Nobody produces the seller's latest property tax notice, mentions the town sits in a tight-supply zone (THRS surcharge up to +60% since 2023), or that transfer duties will add nearly 6% to the purchase price on signing day. Property taxation doesn't show up in a brochure — you discover it when the first tax bill arrives, six months after moving in.",
    reality:
      "We rank cities whose department falls into the `high` or `very high` bracket per `lib/tax` (DGFiP / Local Finance Observatory 2024), with Paris kept as a special case. Severity is then amplified by the median purchase price per m² (DVF / 2024 rent observatories) — a high rate on a low cadastral base is bearable; it's the 'high rate + high base' combination that really squeezes the first-time buyer. Bonuses apply when the town is in a tight-supply zone (THRS surcharge available) and when urban density pulls cadastral bases upward. All cities shown exceed 6.5/10 composite severity.",
    methodology:
      "Severity = base tier (`high` 6 / `very high` 8 / Paris 7.5) + price bonus (€3,000/m² → 0, €6,000/m² → +2) + 0.8 if tight-supply zone + max(0, log₁₀(pop/50,000) × 1.05) capped at +1.5. Clamped at 10/10, filtered to severity ≥ 6.5. Sources: DGFiP OFL yearbooks 2024 (average property-tax rates by dept), tight-zone decrees 2023 (THRS surcharge), DVF + rent observatories 2024 (€/m²), INSEE (population). Caveat: municipal property tax varies by ±30% around the dept average — always check the seller's actual notice before signing.",
  },
  {
    enSlug: "unfindable-rentals",
    frSlug: "villes-logement-introuvable",
    emoji: "🔑",
    title: "Cities where finding a rental has become a battle",
    metaTitle: "Unfindable rentals 2026 — France's tightest rental markets",
    metaDescription:
      "2026 ranking of French cities where signing a lease is a contest: strained rental market, T2 rent well above the national median. DGALN-aligned proxy.",
    intro:
      "The attractive listing stays online eight minutes. Viewings are collective — twelve applicants queuing at the door, dossier already printed in triplicate. The agency doesn't call back, or asks for two guarantors and three payslips for a €950 one-bedroom. On paper the market is 'dynamic'; for the tenant, that same reality is simply called unfindable. This pressure shows up on no price map and in no city brochure — you discover it when you have two weeks to sign a lease and haven't seen a decent flat.",
    reality:
      "We rank cities whose rental tension proxy exceeds 7.5/10 — the 'strained' and 'very strained' bands of the DGALN grid. In concrete terms: a one-bedroom rent above the national median, purchase prices that follow, a population that keeps demand steady, and quality-of-life plus safety scores that make the city desirable. When those signals compound, the market shifts from 'competitive' to 'blocking for applicants without a guarantor or a permanent contract'. Every listed city clears the 7.5/10 threshold and most also carry a T2 rent at least 20% above the national median.",
    methodology:
      "Severity = tension (0-10, 10 = worst) + 1.0 if T2 rent ≥ 1.5× national median, + 0.4 if ≥ 1.2×. Tension weighting: T2 rent vs median 55% · purchase €/m² 25% · population (bonus over 200k, penalty under 30k) · life + safety desirability. Proxy aligned on the DGALN 'zones tendues' list (~1,100 communes) that the seed doesn't expose directly. Underlying sources: DVF (transaction prices), 2024 rent observatories, INSEE (population), site's proprietary scores.",
  },
  {
    enSlug: "childcare-shortage",
    frSlug: "villes-manque-de-creches",
    emoji: "🍼",
    title: "Cities where a daycare place is a full-blown ordeal",
    metaTitle: "Childcare shortage 2026 · Cities with no nursery places",
    metaDescription:
      "2026 ranking of French cities over 25,000 in the Paris region, coastal PACA and overseas departments where nursery places saturate. Sources: Onape, CAF, CNAF.",
    intro:
      "The listing sells you 'schools nearby' and 'family-friendly neighbourhood' — photos of children on scooters, a shared garden, a crèche pinned on the same street on Google Maps. Nobody mentions that the same crèche closed its 2026 waiting list back in January, that the municipal collective isn't taking new files for another twelve to eighteen months, and that unsubsidised private nurseries start at €1,200 net a month at full rate in the inner Paris ring, €1,500 to €1,700 inside Paris proper. The CAF's 'free choice of childcare' subsidy assumes a place is secured in time — which is anything but guaranteed across the dense half of Île-de-France, on the Riviera and Marseille bay, or anywhere in the overseas departments. The practical fallout: the second parent slides into a six-to-twelve-month parental leave, which crimps both the career and the family budget just as the rent on a two-bedroom has gone up again.",
    reality:
      "We rank cities over 25,000 located in the departments where the Onape 2024 coverage rate (crèche places per 100 children under three) sits below the national median of roughly 60. Paris posts ≈ 55 on paper but hits 100% saturation by mid-January; the inner ring (Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne) hovers around 42; the outer ring (Val-d'Oise, Essonne, Yvelines, Seine-et-Marne) around 45; Bouches-du-Rhône, Var and Alpes-Maritimes around 35-40 along the dense coast; Guadeloupe, Martinique, Guyane, La Réunion and Mayotte between 25 and 40 depending on territory, with a young structural demography inflating the denominator. Severity is amplified when the municipality concentrates a dual-earner CSP+ profile (price per m² above €5,000, or character tags like 'young / trendy / tech / start-up / student') — that's where childcare demand is most inelastic and the queue longest. The central metros (Paris, Marseille, Nice, Cannes, Aix-en-Provence, Boulogne-Billancourt, Saint-Denis 93) concentrate the heaviest cases: waiting lists closed before the campaign even opens, strict prioritisation of vulnerable households (single parent, RSA recipient, AAH beneficiary), structural fallback onto independent childminders or unsubsidised private nurseries.",
    methodology:
      "Severity = zonal base (Paris intra-muros +2.5 · inner ring +2.2 · outer ring +1.5 · Bouches-du-Rhône / Var / Alpes-Maritimes +1.3 · overseas +1.8) + property factor (€/m² ≥ €6,500 +1.2 · ≥ €5,000 +0.8 · ≥ €3,500 +0.4 — high property prices signal a dual-earner CSP+ basin with inelastic childcare demand) + density factor (≥ 200,000 pop +0.6 · ≥ 100,000 pop +0.4 · ≥ 50,000 pop +0.2) + 0.5 if character tag 'young / trendy / tech / start-up / student / bobo / dynamic / nomad'. Neutral base 4.5 before bonuses. Capped at 10/10, filtered to severity ≥ 6, population ≥ 25,000, department on the tight Onape-CAF 2024 list, rural tags excluded. Sources: Onape (National Observatory of Early Childhood) — 2024 annual 'Accueil du jeune enfant' report (nursery coverage by dept, approved PMI capacity); CNAF — Cnaf-DSER 2023 statistics on childcare arrangements; DREES 2023 'Accueil du jeune enfant'; Insee 2023 on career interruptions linked to unavailable childcare; Ministry of Solidarity — '200,000 places' plan 2023-2027 (prioritising dense Île-de-France, coastal PACA, overseas). Caveat: the Onape rate is a department average — intra-department variance can be sharp (a Hauts-de-Seine commune like Neuilly-sur-Seine has a far denser private offer than Gennevilliers or Nanterre at equivalent public coverage). Independent childminders remain available everywhere but cost 2-3× more net than a subsidised nursery after CAF aids — meaningful on a one- or two-median-salary household budget. Check before buying: Onape coverage for the department, municipal enrolment calendar (deadlines are strict in Île-de-France), subsidised vs unsubsidised private offer in the basin, distance to an available approved childminder (departmental directory on monenfant.fr).",
  },
  {
    enSlug: "coastal-erosion",
    frSlug: "villes-erosion-cotiere",
    emoji: "🌊",
    title: "Coastal cities in the front line of erosion",
    metaTitle: "Coastal erosion 2026 — Most exposed French cities",
    metaDescription:
      "2026 ranking of French coastal cities most exposed to shoreline retreat: erosion, cliff collapse, marine flooding. Sources: BRGM TRAIT + IPCC AR6.",
    intro:
      "The brochure sells the sea view, the beach 200 metres away, the dune that shelters the plot from the wind. Nobody digs out the 1950 aerial photograph — the row of villas standing where the water now reaches, 80 metres inland from the current shoreline. Second-World-War blockhouses swallowed by every high tide. The Étretat cliffs losing 20 cm a year. Shoreline retreat doesn't show up in a summer photo taken at low tide; you find it in the Notice of Risks attached to the deed — or worse, one winter morning, the first time the sea reaches the garden.",
    reality:
      "We keep communes in metropolitan coastal departments (Atlantic, Mediterranean, Channel, North Sea) and the overseas departments, sitting under 25 m of elevation and carrying an explicit coastal character-tag (beach, seaside resort, dune, port, littoral, Atlantic, Mediterranean, Channel, gulf, étang, lagoon). The tag filter deliberately drops the inland parts of otherwise-maritime departments — Bayonne town centre, Aubagne, old Toulon — because erosion happens right at the water's edge, not on a departmental average. The sandy Atlantic front from Aquitaine to the Vendée concentrates the fastest documented retreats in BRGM TRAIT: 1 to 5 m per year locally at Soulac, Lacanau, La Faute-sur-Mer. The Camargue and the Languedoc lagoons cumulate an elevation under 5 m with recurring marine flooding. Along the Alabaster Coast, chalk cliffs erode by roughly 20 cm a year. Nothing here is symmetric between coastlines: it depends on the substrate (sand, chalk, granite), on how the dune ridge has been urbanised, and on the frequency of winter storms (Xynthia 2010, Klaus 2009).",
    methodology:
      "Severity = 0.5 × elevation factor (25 m → 0, 0 m → 10) + 0.25 × flood score from `lib/natural-risks` (corroboration) + coastline bonus (sandy Aquitaine / Vendée / Charente-Maritime +1.7 · low Hérault / Aude / Gard Mediterranean +1.5 · overseas +1.4 · rest of Atlantic front +1.2 · Mediterranean coast +1.0 · North / Opal coast +1.0) + tag bonus (seaside resort +0.4 · dune +0.5) + exposure bonus (≥ 50,000 pop +0.5 · ≥ 20,000 pop +0.3). Capped at 10/10, filtered to severity ≥ 5. Sources: BRGM TRAIT observatory 2023 (French national coastal erosion indicator, prim.net), regulatory list of communes exposed to shoreline retreat (article L. 321-15 of the Environmental Code, decree 2022-750 as amended 2024 — around 320 listed communes), ONERC (2024 annual report), IPCC AR6 WGII (sea-level rise of +0.3 to +1.0 m by 2100 depending on the SSP1-2.6 to SSP5-8.5 scenario). Caveat: shoreline retreat evolves quarter by quarter — a beach nourishment in 2024 (Lacanau, Soulac) can temporarily mask a longer-term dynamic. Always check the local coastal-risk plan (PPRL) and the mandatory Notice of Risks (ERP) before buying anything on the shore.",
  },
  {
    enSlug: "parking-nightmare",
    frSlug: "villes-parking-cauchemar",
    emoji: "🅿️",
    title: "Cities where parking is a daily nightmare",
    metaTitle: "Parking nightmare 2026 — French cities hardest to park in",
    metaDescription:
      "2026 ranking of French cities over 40,000 with saturated historic centres, no hyper-centre kerbside supply, 15-25 minutes of circling to find a spot. Cerema, INDIGO, FNMS.",
    intro:
      "The listing sells you the \"charm of the old town\", the \"cobbled lanes\", the \"restaurant 300 metres away\". Nobody mentions that the nearest public car park reads FULL from 10am to 8pm, that the €250/year resident permit guarantees nothing when the streets are jammed with long-term parkers, and that unloading the Sunday-evening groceries from the park-and-ride becomes a weekly workout. Kerbside saturation in the hyper-centre doesn't show up in a property brochure shot at midday on a Tuesday in March — you discover it on the first Friday evening in July, circling for 25 minutes to get back into your own neighbourhood.",
    reality:
      "We rank cities over 40,000 whose transport score falls between 5 and 7.5/10 (enough urban fabric to saturate, not enough tram/metro supply to make the car optional) and that carry at least one character-tag pointing to a dense historic centre, a tourist coastline, or a premium/festival vocation. The ranking deliberately excludes metros with a structuring network (Paris, Lyon, Nantes, Strasbourg, Rennes, Bordeaux) — not because parking there is easy, but because their congestion pattern belongs to the road-jams theme (dedicated theme 31) and a major share of trips is absorbed by tram, metro or bike. Severity is amplified when the city compounds a documented historic centre, a seasonal coastline, and heavy housing pressure (price/m² ≥ €5,500). The Mediterranean south-east and the Riviera concentrate the heaviest cases structurally: narrow ancient streets, car culture, summer tourism, second-home owners — occupancy exceeds 95% nine months out of twelve according to FNMS 2023 surveys.",
    methodology:
      "Severity = 1.4 × transport factor (7.5 → 0 · 5.0 → +3.6) + 1.4 if historic tag (historique / patrimoine / médiéval / remparts / vieille ville / corsaire / provençal / basque / alsacien / béarnais / Corse / Petite Venise / UNESCO / château / cathédrale / abbatiale / forteresse / romain / hospices / papes) + 0.9 if coastal tag (balnéaire / plage / littoral / Riviera / Croisette / Méditerranée / Atlantique / Manche / surf / nautisme / voile / vieux port / mer) + 0.7 if tourism tag (tourisme / premium / lifestyle / glamour / festival) + 0.9 if price/m² ≥ €5,500 (0.4 if ≥ €4,000) + zonal bonus (Riviera + Var +1.2 · Corsica +1.1 · Basque/Landes +0.9 · Western Mediterranean +0.8 · Alpine tourism +0.8 · Sandy Atlantic +0.7 · Coastal Brittany +0.6) + density bonus (≥ 200,000 pop +0.5 · ≥ 100,000 pop +0.3). Capped at 10/10, filtered to severity ≥ 6. Metros over 300,000 explicitly tagged \"métropole\" are excluded (different congestion model — see daily traffic jams). Sources: Cerema (formerly Certu, parking surveys of medium-sized tourist cities 2019-2023), INDIGO 2024 barometer (average spot-search time), FNMS 2023 (public-park occupancy rate), UFC-Que Choisir 2022 (hourly city-centre tariffs), municipal parking plans 2020-2026 (Aix-en-Provence, Nice, La Rochelle, Bayonne). Caveat: occupancy can move quickly when a new multi-storey park or a tram-linked P+R opens (Nice T2 line, Aix Krypton park); the tourist season doubles to quadruples tension between January and August; residents almost always hold an annual permit (€150-350/year depending on city) that doesn't guarantee a space but divides the cost by 4 vs hourly rates. Check before buying: current municipal parking plan, resident-permit tariff, distance to nearest public park, age of the last P+R delivered.",
  },
  {
    enSlug: "patchy-internet",
    frSlug: "villes-internet-precaire",
    emoji: "📡",
    title: "Cities where fast broadband is still a compromise",
    metaTitle: "Patchy internet 2026 · French cities still without fibre",
    metaDescription:
      "2026 ranking of French cities where fibre still hasn't arrived: capped ADSL, saturated fixed 4G, thinly covered départements (Creuse, Cantal, Lozère).",
    intro:
      "The listing sells the quiet, the view, the affordable price per m². Nobody mentions that fibre stops at the next hamlet, that ADSL tops out near 12 Mbps down and 1 Mbps up, and that fixed 4G buckles two evenings a week once the neighbours start streaming. On paper France is \"almost fully fibred\". If you work remotely and owe your employer a daily video call, the same reality has a plainer name: a permanent compromise. It bites hardest if you are arriving from somewhere a symmetric gigabit line is the baseline — the gap doesn't show in the national headline figure, it shows in which side of a département boundary you buy on.",
    reality:
      "We rank cities whose computed internet score falls to 5/10 or below. That score blends the seed remote-work sub-score (60%), a regional bonus aligned on ARCEP Q4 2024 FTTH coverage rates, an urban bonus for the 30 largest cities (where dense FTTH rollout is systematic), and a penalty when the département sits in ARCEP's historically underserved \"sparse, commercially unviable\" zones — Creuse, Corrèze, Ariège, Haute-Loire, Cantal, Gers, Hautes-Alpes, Alpes-de-Haute-Provence, Haute-Marne, Meuse, Vosges, Lozère, Aveyron. A city can land here on low density alone (scattered overseas communes, rural Corsica), on a sparse département alone, or — the worst case — on both at once.",
    methodology:
      "Severity = (10 − internet score) × 1.6 + 0.6 if population is under 10,000 + 0.4 if the seed remote-work score is 4/10 or below, capped at 10/10. Filter: internet score ≤ 5/10 and severity ≥ 6/10; the 12 worst are listed. Underlying sources: ARCEP \"Observatoire du marché des communications électroniques\" Q4 2024 (share of premises connectable to FTTH, by region), ARCEP sparse non-viable zones, proprietary seed scores. No live ARCEP feed is read at build time — the regional bonus is a static table calibrated on those published coverage rates. Caveat: coverage moves every quarter, and a new connection 200 m down the road can change how a place feels without shifting the regional average this score is built on. Check the exact address on ARCEP's \"Ma connexion internet\" before signing anything.",
  },
  {
    enSlug: "shrinking-job-markets",
    frSlug: "villes-emplois-en-recul",
    emoji: "📉",
    title: "Cities losing jobs while unemployment is already high",
    metaTitle: "Shrinking job markets: 24 French cities (2017-2023)",
    metaDescription:
      "24 French cities over 20,000 where local jobs fell between 2017 and 2023 and unemployment tops 11.4%: Bagnolet, Trappes, Béthune, Douai, Belfort.",
    intro:
      "A town can lose residents without its job market collapsing, and add jobs that its own residents never get. The clearest case is rarer and simpler: the number of jobs located in the town falls while unemployment was already above average. France as a whole added 6.6% more jobs between 2017 and 2023. These towns went the other way. It is not a verdict on their quality of life. It is a fact to know before moving somewhere to find work locally: the job market there did not widen, it narrowed.",
    reality:
      "This ranking uses no score. It crosses two INSEE census measures (INSEE is the national statistics office). The first is the change in the number of jobs located in the town between 2017 and 2023. The second is the census unemployment rate of residents aged 15–64, where the national average is 11.4%. Of the " + CORPUS_RECUL.n + " cities of 20,000 or more with both figures published, the median change in jobs is +" + en1(CORPUS_RECUL.medianGrowth) + "%. " + CORPUS_RECUL.fell + " cities have fewer jobs in 2023 than in 2017, and " + CORPUS_RECUL.both + " of them also have unemployment at or above the average: those are the ones ranked. The other " + CORPUS_RECUL.fellLowUnemployment + " lose jobs on their territory, but their residents are no more unemployed than average, which suggests commuter towns whose workers are employed elsewhere, though this data does not prove it. At the top: Bagnolet (−9.2% jobs, 16.8% unemployment), Trappes (−7.3%, 15.3%) and Béthune (−5.8%, 17.9%). Douai loses 3.7% of its jobs with unemployment at 21.6%, Belfort 3.3% with 19.1%, Montbéliard 1.5% with 20.8%. Forbach (23.4%) and Creil (23.5%) have the highest unemployment on the list, with smaller job losses. Two geographies emerge: inner-ring Paris suburbs and towns in the Val-d'Oise and Yvelines, where jobs move around within the metropolitan area, and towns in the north, east and centre, former industrial cities, where the decline goes with persistently high unemployment. Three caveats. Jobs are counted at the workplace, so a drop can simply be an employer moving to the next town. Census unemployment is self-declared and higher than the quarterly rate you see in the news. And two dates do not make a trend: 2017 and 2023 bracket the Covid period. No causation is claimed.",
    methodology:
      "Indicator: percentage change in the number of jobs located in the town between 2017 and 2023 (strictly negative), crossed with a census unemployment rate for residents aged 15–64 at or above the national census average (11.4%). Severity = 6 + 0.25 × (points of jobs lost) + 0.1 × (points of unemployment above 11.4), capped at 10/10: the entry threshold is the severity floor, and the sort uses the unrounded value. Cities compared: INSEE 2022 population of 20,000 or more with both job change and unemployment published, i.e. " + CORPUS_RECUL.n + " cities; Guadeloupe, French Guiana and Mayotte are outside the file used, as is Pierrefitte-sur-Seine (merged into Saint-Denis in 2025). Source: INSEE, 2023 population census, jobs at place of work and unemployment of residents aged 15–64. Census unemployment is self-declared: it runs higher than the ILO rate and the two are not comparable. Distinct from chronic-unemployment (our composite score, with no job-change measure), young-workers-leaving and cities-emptying-out (residents, not jobs): here only two published measures, one on the town's territory and one on its residents.",
  },
  {
    enSlug: "cities-emptying-out",
    frSlug: "villes-qui-se-vident",
    emoji: "🏚️",
    title: "Cities that are emptying out: population falling since 2011",
    metaTitle: "Shrinking French cities 2026 · INSEE population loss",
    metaDescription:
      "2026 ranking of French cities losing residents: decline confirmed by the 2011, 2016 and 2022 INSEE censuses, in a slack housing market.",
    intro:
      "The listing boasts an unbeatable price per m², a townhouse with a garden for the price of a studio elsewhere, a human-sized town where \"you have everything on the spot\". What it leaves out is that the town had 38,000 residents in 2011 and has 33,000 today. You will not see it on a Saturday-morning visit: the streets are the same, the market is on, the school is open. The decline shows up elsewhere, and later. In the classes closed at the next school year, the bus line cut from six runs to three, the shopfront re-let then given back, the maternity ward merged into one forty minutes away. And on the day you put the property up for sale, in how many months it takes to find a buyer at the price you paid.",
    reality:
      "This is the only Red Flag Radar ranking with no score: it counts residents. The 2011, 2016 and 2022 municipal populations come from the same INSEE (national statistics office) census file, so on the same town boundaries, which removes the effect of commune mergers. Of the " + CORPUS_SE_VIDENT.covered + " cities of ours covered by that file, " + CORPUS_SE_VIDENT.recent + " have fewer residents in 2022 than in 2016, and " + CORPUS_SE_VIDENT.both + " lose on both windows. Restricting to the " + enInt(CORPUS_SE_VIDENT.n10) + " cities of at least 10,000 residents, " + CORPUS_SE_VIDENT.both10 + " still do. The ranking keeps those whose decline exceeds 3% over eleven years, continues over the latest interval, and happens in a housing market that did not keep up. That last filter is decisive: Paris has lost 6.1% of its residents since 2011 and Le Kremlin-Bicêtre 9.4%, but their rents are " + en1(CORPUS_SE_VIDENT.parisRentRatio) + " and " + en1(CORPUS_SE_VIDENT.kbRentRatio) + " times the national median. There it is not applicants that are missing, it is households shrinking and housing stock changing use. Same logic for the Riviera arc (Le Cannet, Mandelieu-la-Napoule, Valbonne) or Beaune, excluded for the same reason. Two very different geographies remain. Mid-sized towns of the interior and the north-east, where decline accompanies the end of an industrial cycle: Montluçon goes from 38,166 to 33,317 residents, Belfort from 50,128 to 45,646, Calais from 72,915 to 67,585, and Issoudun loses 15.3% of its population. And the French Caribbean, where several communes post the steepest falls in the set: Fort-de-France drops from 86,753 to 75,165 residents, Le François loses 15.8%, Les Abymes 12.7%. That is not ageing, it is departure, and it concerns working-age people as much as their children. Losing residents is not in itself a flaw of a town, and several on this list are pleasant, well equipped and very affordable. It is a fact that changes two calculations: the services the town can still afford in ten years, and resale.",
    methodology:
      "Severity = 0.72 × decline in % over 2011–2022 (capped at 9) + 1.2 if the annual rate of loss worsened between 2011–2016 and 2016–2022 + 0.6 if the loss exceeds 5,000 residents (0.3 above 2,000). Clamped to 10, filtered to a decline of at least 3% over eleven years, a negative balance over 2016–2022, a 2022 population of at least 10,000 and a one-bedroom rent no more than 1.10 times the national median. Source: INSEE, population census, \"Evolution and structure of the population in 2022\" (2011, 2016 and 2022 vintages in one file, 2025 commune geography); " + CORPUS_SE_VIDENT.covered + " of our " + CITIES_SEED.length + " cities are covered, with Mamoudzou missing (outside the France-excluding-Mayotte file) and Pierrefitte-sur-Seine merged into Saint-Denis in 2025. Rents: our rent estimate. Three limits before drawing a conclusion. The census counts resident population: in coastal and mountain communes part of the fall is main homes turning into second homes, not a permanent departure, and Berck or Briançon are partly that case. The figure is for the commune, while the phenomenon is often sub-communal: the old centre empties while the commuter belt outside the commune gains residents, so the wider urban area can grow while the central town shrinks. Finally the census describes the past and extrapolates nothing: a town may have stopped its decline since 2022, which only the next vintage will show. For a city's age structure and detailed trajectory, see its demographics page.",
  },
  {
    enSlug: "few-children-cities",
    frSlug: "villes-sans-enfants",
    emoji: "🧸",
    title: "Cities where children have become rare",
    metaTitle: "Cities with few children · France 2026 (INSEE)",
    metaDescription:
      "2026 ranking of French cities with the most over-60s per child under 15 (INSEE 2022 census): up to 9.1 residents aged 60+ for every child.",
    intro:
      "You first go in August, and in August the case looks airtight: the beach is full of children, the carousel is turning, there is a queue at the ice-cream stand and the sailing club is fully booked. You come home thinking it is a good place to raise your own. What August does not show is who lives there the rest of the year. The children on the beach belong to holidaymakers, and they leave on the 31st. In November the same town can have nine residents aged sixty and over for every child under fifteen. A visit will not show that either: the streets are handsome, the shops are open, the town is quiet and well kept, often better kept than the one you are leaving. You find out later, when you need a friend for a birthday party, a place in a football club that no longer has enough players to field a team in your child's age group, or a replacement for the paediatrician who is retiring.",
    reality:
      "This ranking uses no score: it counts residents by age band. The indicator is the number of residents aged 60 and over divided by the number of residents under 15, as INSEE (the national statistics office) publishes them for each commune in the census. Across the " + CORPUS_SANS_ENFANTS.n + " cities on the site with more than 10,000 residents, the median ratio is " + en2(CORPUS_SANS_ENFANTS.medianRatio) + " and children under 15 make up " + en1(CORPUS_SANS_ENFANTS.medianKidShare) + "% of the population. Twenty-eight communes exceed three seniors per child, and those are the ones ranked. Arcachon opens at 9.14, a figure nothing else approaches: 720 children under 15 for 6,586 residents aged 60 and over, in a population where 60.4% is past sixty and 6.6% is under fifteen. Royan follows at 7.03, then Dinard at 5.83, La Baule-Escoublac at 5.15 and Granville at 4.96. Resist the reflex reading that files these towns under decline: it is wrong, measurably. The median living standard of these 28 communes is €23,490, above the €" + enInt(CORPUS_SANS_ENFANTS.medianIncome) + " of the full set, and their median three-room rent is €1,050 against €" + enInt(CORPUS_SANS_ENFANTS.medianT3) + ". On average they are richer and more expensive than the rest. Three geographies overlap. The first, by far the largest, is seaside resorts: 21 of the 28 communes are within fifteen kilometres of the open sea, from Arcachon to Saint-Malo by way of Biarritz, Les Sables-d'Olonne, Saint-Raphaël, Sète, Agde and Concarneau. Poverty rates there are low, 9% in Les Sables-d'Olonne, 12% in Arcachon and Dinard, 13% in Biarritz: retirement arrived with means. The second is spa and pilgrimage towns, Vichy at 3.89, Lourdes at 3.66, Dax at 3.05, where the economy is built around people taking the waters and pilgrims, and where poverty is instead high, 23% in Vichy and Lourdes, 20% in Dax. The same ratio therefore hides a different mechanism, and our data records the gap without establishing its cause. The third is a handful of inland mid-sized towns in the west, Fontenay-le-Comte, Saintes, Dinan, Bergerac. The mirror image of this ranking is instructive, and uncomfortable. The youngest communes in the set are Saint-Laurent-du-Maroni, with 0.13 seniors per child and 41.7% of residents under 15, then Cayenne, Stains, Creil, Cergy and Trappes. Several also appear elsewhere in this Red Flag Radar, for poverty or unemployment. The children of France and the quiet, expensive, well-rated towns of France live very largely in different communes. That accuses nobody: it describes a geography. Having few children is not a defect, and several towns on this list are among the most pleasant on the site. It is a fact that changes three calculations for a household arriving with children: the age group yours will find on the spot, the trade-offs the commune will make between a classroom and a service for older residents, and resale, since a family house there will mostly sell to retirees or second-home buyers, which is a different market from the one you bought into.",
    methodology:
      "Indicator = (60–74 + 75–89 + 90 and over) ÷ (0–14). Severity = 8 + 0.4 × (ratio − 3), capped at 10/10: the publication threshold is the severity floor, and eight seniors per child scores 10. Only one city reaches the cap, Arcachon. Source: INSEE, population census, \"Evolution and structure of the population in 2022\", age bands published by commune. " + POP_COVERED + " of the " + CITIES_SEED.length + " cities on the site are covered; Mamoudzou is missing (outside the France-excluding-Mayotte file) and Pierrefitte-sur-Seine was merged into Saint-Denis in 2025. Incomes: INSEE, Filosofi 2021. Rents: our rent estimate. Distances to the coast measure the open sea, not a lake or lagoon. Filters: municipal population of at least 10,000 in 2022, which brings the set from " + POP_COVERED + " to " + CORPUS_SANS_ENFANTS.n + " cities, then a ratio of at least 3.00. The cut does not fall in the middle of a tie: below Dax, the last one published at 3.055, comes Tulle at 2.955. The sort uses the unrounded value, and no exact tie exists in the eligible set, but Fontenay-le-Comte and Anglet both display 3.20 without being tied, at 3.2013 against 3.1968. Four limits to know before drawing a conclusion. The first matters most: age bands exist only for the 2022 vintage in our file, whereas total populations carry three. This ranking therefore publishes a state, not a trend. It cannot say whether the cohort of children is shrinking, stabilising or recovering; only another vintage would. Second, the census counts resident population: in holiday towns a large share of the housing stock is second homes, and younger households often live in a cheaper neighbouring commune. The published structure is the commune's, but the surrounding area may be much younger, and a school catchment does not stop at the municipal boundary. Third, the ratio says nothing about the quality or capacity of the schools, which sit on each city's schools page, or about childcare supply, which the childcare-shortage ranking covers. Finally, two very different mechanisms produce the same number here, a holiday economy attracting affluent retirees and a care economy attracting a poorer older population; poverty rates tell them apart, 12% in Arcachon against 23% in Vichy, but our data records the gap without establishing its cause. For a city's full trajectory, its seven age bands and its change since 2011, see its demographics page.",
  },
  {
    enSlug: "arrivals-high-rents",
    frSlug: "villes-arrivees-loyers-hauts",
    emoji: "🧳",
    title: "Cities where people are arriving in numbers and rents are already high",
    metaTitle: "Fast-growing French cities with high rents · 2026",
    metaDescription:
      "2026 ranking of the French cities gaining the most residents (INSEE 2011-2022) with a 3-room rent at least 15% above the median of the cities compared.",
    intro:
      "The listing sells a town on the move: the metro line under construction, the new housing programmes, the new shops, the district \"you have watched change in ten years\". All of it is true, and you can see it on a visit. What you cannot see from the pavement is that those ten years brought thousands of households looking for the same thing as you, and that the rent quoted to you is the one that flow of applicants has set. A fast-growing town is not a flaw. A fast-growing town in an already expensive market is paid for when you sign the lease, then again every year when it is renewed.",
    reality:
      "This ranking uses no score: it sets two published measures against each other. The first is the change in municipal population from INSEE (the national statistics office), with the 2011, 2016 and 2022 censuses read from a single file, so on the same commune boundaries. The second is the reference rent for a three-room flat (T3, roughly a two-bedroom) in our rent estimate, divided by the median of the " + CORPUS_ARRIVEES.n + " cities compared, those with 20,000 or more measured residents and a known rent: €" + enInt(CORPUS_ARRIVEES.medianT3) + " a month. Of those " + CORPUS_ARRIVEES.n + " cities, " + CORPUS_ARRIVEES.growers + " gain at least 10% in population between 2011 and 2022 and keep gaining at least 4% between 2016 and 2022. Among them, " + CORPUS_ARRIVEES.dear + " have a T3 at least 15% above the median, and " + CORPUS_ARRIVEES.dearIdf + " are in the Paris region (Île-de-France). The ranking publishes the first fifteen. Bagnolet opens the list: 34,513 residents in 2011, 41,776 in 2022, a T3 at €1,420. Joinville-le-Pont carries the highest rent on the list, €1,740 for a T3, 61% above the median; Gennevilliers gains 8,944 residents, Saint-Cyr-l'École 13.1% since 2016 alone. Outside the Paris region, Annemasse (+15.1%, T3 at €1,350) is published, and La Ciotat (+11.4%, €1,250) passes the threshold without making the first fifteen. The result is not a rule. The " + CORPUS_ARRIVEES.growers + " fast-growing cities also include " + CORPUS_ARRIVEES.notAboveMedian + " whose T3 does not exceed the median: Villenave-d'Ornon, the fastest growth among the cities compared (+45.5%), is at €1,010, Cugnaux at €970, Agde at €930, Saint-Laurent-du-Maroni at €830. Growth and high rents go together without being the same thing. Gaining or losing residents does not tell you whether a town is pleasant either: several towns on the list are well served and in high demand, which is one reason for their rents. What the ranking says is that a newcomer pays for a market that has already filled up.",
    methodology:
      "Indicator: change in municipal population 2011 → 2022 (at least 10%), extended to 2016 → 2022 (at least 4%), crossed with the ratio of the reference T3 rent to the median of the cities compared (at least 1.15). Severity = 6 + 0.12 × (growth 2011–2022 in % − 10) + 2 × (ratio − 1.15), capped at 10/10: the entry threshold is the severity floor, and the sort uses the unrounded value. Cities compared: INSEE 2022 population of at least 20,000 and a known rent, i.e. " + CORPUS_ARRIVEES.n + " cities. Source: INSEE, population census, \"Evolution and structure of the population in 2022\"; rents come from our rent estimate, an editorial benchmark and not an average of listings. Four limits to know. We have neither the housing stock nor new-build figures: the ranking does not say the town lacks housing, it says two facts coincide, and no causation is drawn. The census counts residents, and part of the growth comes from newly delivered programmes, which is precisely what can ease a market in the following years. The reference rent is for a T3 and describes neither social housing nor existing tenancies on old leases. Finally the rent vintages are more recent than the last census (2022), so the pairing is a snapshot, not a trajectory. For a city's age structure and demographic detail, see its demographics page; for rent relative to local income, see the October ranking.",
  },
];

function getEnTheme(slug: string): EnTheme | undefined {
  return EN_THEMES.find((t) => t.enSlug === slug);
}

function getFrTheme(frSlug: string) {
  return RED_FLAG_THEMES.find((t) => t.slug === frSlug);
}

export function generateStaticParams() {
  return EN_THEMES.map((t) => ({ locale: "en", slug: t.enSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const theme = getEnTheme(slug);
  if (!theme) return {};
  return {
    title: theme.metaTitle,
    description: clampMeta(theme.metaDescription),
    alternates:
      redFlagThemeAlternatesEn(theme.frSlug, slug) ?? { canonical: `${EN_BASE}/red-flags/themes/${slug}` },
    openGraph: {
      // Sans `images`, un openGraph de page remplace celui hérité de la racine
      // — la carte sociale disparaissait entièrement au lieu de retomber dessus.
      images: ["/opengraph-image"],
      title: theme.metaTitle,
      description: theme.metaDescription,
    },
  };
}

function severityColor(severity: number): string {
  if (severity >= 8) return "text-red-700 bg-red-100 border-red-300";
  if (severity >= 6) return "text-orange-700 bg-orange-100 border-orange-300";
  if (severity >= 4) return "text-amber-700 bg-amber-100 border-amber-300";
  return "text-yellow-700 bg-yellow-100 border-yellow-300";
}

// « Couleurs » (2026-10-26): white card with an indigo shadow, as on the hub.
const CARD =
  "rounded-2xl bg-[var(--bg-surface)] shadow-[0_10px_30px_-18px_rgba(79,70,229,0.45)] ring-1 ring-[var(--accent)]/10";

export default async function EnRedFlagThemePage({ params }: Props) {
  const { slug } = await params;
  const theme = getEnTheme(slug);
  if (!theme) notFound();

  const frTheme = getFrTheme(theme.frSlug);
  if (!frTheme) notFound();

  const rows = frTheme.rank();
  const otherThemes = EN_THEMES.filter((t) => t.enSlug !== slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: theme.title,
    description: theme.metaDescription,
    itemListElement: rows.slice(0, 10).map((row, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: row.city.name,
      url: `${EN_BASE}/cities/${row.city.slug}`,
    })),
  };

  // Same "No. NN" numbering as the theme tiles below (EN selection order).
  const sheetIndex = EN_THEMES.findIndex((t) => t.enSlug === slug) + 1;
  const sheetLabel = (n: number) => `No. ${String(n).padStart(2, "0")} / ${EN_THEMES.length}`;

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Header — colour aurora, same grammar as the FR twin and the hub (« Couleurs »). */}
      <section className="bg-aurora">
        <div className="pt-20 pb-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-5 flex flex-wrap items-center gap-2 font-mono-data text-xs font-semibold uppercase tracking-widest">
              <Link
                href="/red-flags"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1 text-[#BE185D] shadow-sm ring-1 ring-[var(--accent-pink)]/20 transition-colors hover:bg-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Red Flags
              </Link>
              {sheetIndex > 0 && (
                <span className="rounded-full bg-white/70 px-3 py-1 text-[#4338CA] ring-1 ring-[var(--accent)]/15">{sheetLabel(sheetIndex)}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.08]">
              {theme.title}
            </h1>
            <p className="text-[var(--text-secondary)] text-base sm:text-lg max-w-2xl">
              {theme.intro}
            </p>
          </div>
        </div>
      </section>

      {/* Reality + ranking — indigo band, white cards. */}
      <section className="band band-indigo py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-10">
        <div className={`${CARD} overflow-hidden`}>
          <h2 className="grad-head-5 px-5 py-2 font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em]">
            What the data shows
          </h2>
          <p className="p-5 text-sm text-[var(--text-secondary)] leading-relaxed">
            {theme.reality}
          </p>
        </div>

        <div>
          <h2 className="mb-1 flex items-center gap-3 text-2xl font-bold text-[var(--text-primary)]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent-pink)]" aria-hidden="true" />
            {rows.length === 0
              ? "The most affected cities"
              : `The ${rows.length} most affected cities`}
          </h2>
          {/* Same legend as the FR twin: the severity badge runs 10 = worst,
              the opposite of the site-wide score convention. Say so, or the
              number is unreadable. Cf. CLAUDE.md § Score convention, rule 3. */}
          {rows.length > 0 && (
            <p className="text-xs text-[var(--text-secondary)] mb-4">
              Severity on this theme: <strong>10 = worst</strong>, 0 = not
              affected. Note this is the reverse of the site-wide score
              convention, where 10 is the best a city can score.
            </p>
          )}
          {rows.length === 0 ? (
            <div className={`${CARD} p-5`}>
              <p className="text-sm text-[var(--text-secondary)]">
                No city exceeds the thresholds for this theme in the current dataset. If you think a city should appear here, let us know via the contact page.
              </p>
            </div>
          ) : (
            /* One card per city, rank in an indigo pill. */
            <ol className="space-y-3">
              {rows.map((row, i) => (
                <li key={row.city.slug} className={`${CARD} flex items-start gap-3 sm:gap-4 p-4 transition-shadow hover:shadow-[0_14px_34px_-16px_rgba(219,39,119,0.45)]`}>
                  <span
                    className={`flex-shrink-0 mt-0.5 inline-flex min-w-[2.75rem] justify-center rounded-full px-2 py-1 font-mono-data text-xs font-bold tracking-wider ${i < 3 ? "bg-[var(--accent)] text-white" : "bg-[var(--band-indigo)] text-[#4338CA]"}`}
                    aria-label={`Rank ${i + 1}`}
                  >
                    No.&nbsp;{String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 mb-1">
                      <Link
                        href={`/cities/${row.city.slug}`}
                        className="text-lg font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                      >
                        {row.city.name}
                      </Link>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        {row.city.region}
                      </span>
                      <span
                        className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 font-mono-data text-[11px] font-bold ${severityColor(row.severity)}`}
                        aria-label={`Severity ${row.severity} out of 10, 10 being the worst`}
                      >
                        {row.severity.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <Link
                        href={`/cities/${row.city.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent)] underline decoration-[var(--accent-pink)]/50 underline-offset-2 hover:decoration-[var(--accent-pink)]"
                      >
                        {row.city.name} profile <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                      <Link
                        href={`/red-flags/${row.city.slug}`}
                        className="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] underline decoration-[var(--accent-pink)]/40 underline-offset-2 hover:text-[var(--accent-pink)]"
                      >
                        Red flag report <ArrowRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                      <span className="text-xs text-[var(--text-tertiary)]">
                        Overall: <span className={scoreColor(row.city.scores.global)}>{row.city.scores.global.toFixed(1)}/10</span>
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
        </div>
      </section>

      {/* Methodology — sky band, white card with gradient head. */}
      <section className="band band-sky py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className={`${CARD} overflow-hidden`}>
          <h2 className="grad-head-0 px-5 py-2 font-mono-data text-[11px] font-semibold uppercase tracking-[0.18em]">
            Methodology
          </h2>
          <div className="p-5">
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {theme.methodology}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Rankings update as proprietary scores improve (currently v0, derived from the official seed — see{" "}
            <Link href="/methodology" className="underline">methodology page</Link>).
          </p>
          </div>
        </div>
        </div>
      </section>

      {/* Other themes — lilac band, tiles as on the hub. */}
      <section className="band band-lilac py-10 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-[var(--text-primary)]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--accent)]" aria-hidden="true" />
            Other red flag themes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:auto-rows-fr">
            {otherThemes.slice(0, 8).map((t) => (
              <Link
                key={t.enSlug}
                href={`/red-flags/themes/${t.enSlug}`}
                className={`${CARD} group h-full hover:-translate-y-0.5 hover:ring-[var(--accent-pink)]/40 transition-all p-4 flex flex-col gap-2`}
              >
                <span className="self-start rounded-full bg-[var(--band-pink)] px-2 py-0.5 font-mono-data text-[10px] font-semibold uppercase tracking-[0.18em] text-[#BE185D]">
                  {sheetLabel(EN_THEMES.indexOf(t) + 1)}
                </span>
                <span className="font-semibold text-sm text-[var(--text-primary)] group-hover:text-[var(--accent-pink)] transition-colors">
                  {t.title}
                </span>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">{t.intro}</p>
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/red-flags"
              className="btn-couleurs inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold"
            >
              All red-flag reports <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
