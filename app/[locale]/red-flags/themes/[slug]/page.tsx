import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RED_FLAG_THEMES } from "@/lib/red-flag-themes";
import { scoreColor } from "@/lib/utils";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

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

const EN_THEMES: EnTheme[] = [
  {
    enSlug: "buyers-remorse",
    frSlug: "villes-regrets-achat",
    emoji: "💸",
    title: "Cities you'll regret buying in",
    metaTitle: "Cities you'll regret buying in 2026 — Where property isn't worth the price",
    metaDescription:
      "Top cities where the purchase price (DVF data) significantly exceeds actual quality of life. Global score, median €/m², climate. 540-city calibrated dataset.",
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
    metaTitle: "Car-dependent cities 2026 — Where the 'bike-friendly' pitch doesn't hold up",
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
    metaTitle: "Unbearable summers 2026 — Beautiful on Instagram, suffocating in July",
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
    metaTitle: "Chronic air pollution 2026 — French cities with highest winter PM2.5",
    metaDescription:
      "2026 ranking of French cities chronically exceeding WHO air quality thresholds: Alpine valleys (thermal inversion), Paris basin NO₂, Rhône corridor, industrial ports. Source: ATMO France PM2.5.",
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
    metaTitle: "Natural hazards 2026 — Most exposed French cities (flood, clay, wildfire, seismic)",
    metaDescription:
      "2026 ranking of French cities with the highest composite across 4 hazards: flooding, clay shrink-swell (BRGM), wildfire (ONF/ECASC), seismics (2011 zoning). Open data: Géorisques.",
    intro:
      "The listing touts the river view, the hillside proximity, the gentle slope. Nobody mentions the flooded cellar three times in fifteen years, the wall cracks from expanding clay, or the wildfire risk zone two streets away. Natural risks don't show up in property photos — they appear in the mandatory ERP risk statement.",
    reality:
      "We rank cities whose composite (flooding 35% + clay 25% + wildfire 20% + seismics 20%) exceeds 5.5/10, with a penalty when at least two of the four hazards exceed 6/10 — a genuine compound risk, not a single isolated hazard.",
    methodology:
      "Severity = composite (0-10) + 1.2 if two or more dimensions ≥ 6/10. Sources: BRGM (clay), BCSF/MTE decree 2010-1255 (seismics), ONF + ECASC (wildfire), Géorisques (municipal synthesis).",
  },
  {
    enSlug: "noise-nightmare",
    frSlug: "villes-bruit-cauchemar",
    emoji: "🔊",
    title: "Cities where noise is a daily nightmare",
    metaTitle: "Noise nightmare 2026 — Most noise-exposed French cities (road, air, night)",
    metaDescription:
      "2026 ranking of French cities where noise compounds saturated road traffic, airport overflights (PEB zones), high-speed rail and nightlife. Aggregate composite from CBS / DGAC / Bruitparif.",
    intro:
      "The agency promises a quiet neighbourhood. On the ground: the ring road 200m away, background motorway noise, A380s every 90 seconds overhead, or a student city centre where terraces close at 2am.",
    reality:
      "We rank cities over 30,000 whose noise composite (road 35% + air 25% + night 25% + rail 15%) exceeds 5.5/10, with a penalty when at least two sources exceed 6/10 — a genuine compound exposure. The WHO recommends Lden < 53 dB(A) day and Lnight < 45 dB(A) night.",
    methodology:
      "Severity = composite + 1.2 if two or more sources ≥ 6/10. Sources: Strategic Noise Maps (EU directive 2002/49/EC), DGAC PEB noise exposure plans, Bruitparif (Île-de-France). Population filter ≥ 30,000.",
  },
  {
    enSlug: "water-stress",
    frSlug: "villes-sans-eau-ete",
    emoji: "💧",
    title: "Cities facing water shortages every summer",
    metaTitle: "Water stress 2026 — French cities with the highest summer drought risk",
    metaDescription:
      "2026 ranking of French cities with recurring drought: near-annual Propluvia crisis orders, low BRGM groundwater levels, drinking water supply under pressure. Aggregate composite.",
    intro:
      "The listing boasts sunny climate, swimming pool, Mediterranean garden. Nobody mentions that watering is banned five months a year, the pool drains in mid-July, the local water table has been low for three years, and the municipality is considering water rationing.",
    reality:
      "We rank cities whose composite (restrictions 35% + groundwater 25% + climate 20% + supply 20%) exceeds 6/10, with a severity bonus when restrictions reach 'near-annual crisis' level (Propluvia) OR low water table and stressed drinking supply combine.",
    methodology:
      "Severity = composite + 1.0 if restrictions ≥ 8.5/10 + 0.8 if low groundwater AND stressed supply. Sources: Propluvia (drought orders), BRGM (groundwater levels), Météo-France (summer climate).",
  },
  {
    enSlug: "medical-desert",
    frSlug: "villes-desert-medical",
    emoji: "🩺",
    title: "Cities with critical healthcare access problems",
    metaTitle: "Medical deserts 2026 — French cities where finding a GP has become impossible",
    metaDescription:
      "2026 ranking of French cities over 10,000 where healthcare access is critical: GPs not replaced on retirement, saturated specialists, distant A&E. Composite from DREES / CNOM / ARS data.",
    intro:
      "The agent touts affordability and village charm. Nobody mentions the last GP retiring in June with no replacement, the nearest dermatologist 90 minutes away with an 8-month wait, or A&E 45 minutes away. Medical deserts don't appear in property photos — you discover them at 10pm with a sick child.",
    reality:
      "We rank cities over 10,000 whose composite exceeds 6.5/10, with a penalty when GP desert (DREES < 80/100k + >50% GPs over 60) AND distant A&E compound — a genuine critical situation, not a single weak indicator.",
    methodology:
      "Severity = composite + 1.2 if GP desert AND A&E ≥ 6.5/10 + 0.5 if specialists ≥ 7/10. Sources: DREES (medical density by dept), CNOM demographic atlas, ARS ZIP/ZAC zoning, University Medical Centres.",
  },
  {
    enSlug: "chronic-unemployment",
    frSlug: "villes-chomage-eleve",
    emoji: "📉",
    title: "Cities with chronically weak job markets",
    metaTitle: "Chronic unemployment 2026 — French cities with the most distressed labour markets",
    metaDescription:
      "2026 ranking of French cities over 15,000 combining high INSEE unemployment, low SIRENE business dynamism and below-median wages. Composite from INSEE / DARES / DADS / SIRENE.",
    intro:
      "The agent touts the affordable townhouse and the charming town centre. Nobody mentions the local labour market has been distressed since the last factory closed, unemployment is over 11%, and net business creation has been negative for three years.",
    reality:
      "We rank cities over 15,000 whose composite (unemployment 35% + wages 25% + dynamism 20% + mix 20%) exceeds 6.5/10, with a penalty when unemployment desert AND weak dynamism compound — a genuine structural decline.",
    methodology:
      "Severity = composite + 1.2 if unemployment ≥ 7.5/10 AND dynamism ≥ 6.5/10 + 0.5 if wages ≥ 7/10. Sources: INSEE (quarterly unemployment by dept), DADS (median net wages), SIRENE (net business creation), DARES (restructuring employment zones).",
  },
  {
    enSlug: "quality-of-life-stretched",
    frSlug: "villes-cadre-de-vie-tendu",
    emoji: "😓",
    title: "Cities where quality of life is stretched across every dimension",
    metaTitle: "Quality of life stretched 2026 — French cities with the lowest composite QoL index",
    metaDescription:
      "2026 ranking of French cities over 15,000 with the lowest quality-of-life mega-index: degraded environment + difficult healthcare access + distressed labour market. Aggregate composite.",
    intro:
      "On paper: affordable housing, reasonable taxes, neighbourhood life. On the ground: poor air, medical desert, distressed job market. When three pillars collapse together, every life project becomes a series of losing trade-offs.",
    reality:
      "We rank cities over 15,000 whose mega-index (environment 35% + health 30% + employment 35%) is ≤ 4.5/10, with a penalty when at least 2 of the 3 pillars fall below 4/10 — a genuine compounding effect.",
    methodology:
      "Severity = (5 − index) × 2 + 1.2 if ≥ 2 pillars ≤ 4/10 + 0.6 if ≤ 3.5/10. Sources: ATMO/CITEPA/RNSA (env), DREES/CNOM/ARS (health), INSEE/DADS/SIRENE (employment).",
  },
  {
    enSlug: "cost-explosion",
    frSlug: "villes-couts-explosifs",
    emoji: "💥",
    title: "Cities where living costs exceed the local salary",
    metaTitle: "Cost explosion 2026 — Cities where family costs exceed the local median salary",
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
    metaTitle: "Public services desert 2026 — French cities with the most broken provision",
    metaDescription:
      "2026 ranking of cities over 10,000 with a public services composite ≥ 6.5/10: schools, post offices & France Services centres, town halls, libraries. Sources: DEPP / CAF / La Poste / ANCT.",
    intro:
      "The social security card changes address, the post office closed, the local secondary school is 15km away, the town hall opens two half-days a week. None of these signals appear in a property brochure, but together they define what living in a 'service desert' means day-to-day.",
    reality:
      "We rank cities over 10,000 whose composite exceeds 6.5/10 (10 = worst). Bonus +1.2 when both schools AND postal network are in desert territory — a genuine compound gap, not a single weak axis.",
    methodology:
      "Severity = composite + 1.2 if schools AND post ≥ 6.5 + 0.4 if town hall ≥ 6.5. Weighting: schools 35% · town hall 25% · post 25% · library 15%. Sources: DEPP (school census), CAF (childcare), La Poste (offices + APC + RPC), ANCT (France Services centres), BNF (public reading).",
  },
  {
    enSlug: "anti-cycling",
    frSlug: "villes-anti-velo",
    emoji: "🚲",
    title: "Cities where daily cycling is out of reach",
    metaTitle: "Anti-cycling cities 2026 — Where daily cycling is still not viable",
    metaDescription:
      "2026 ranking of cities over 15,000 with a cyclability composite ≤ 4.5/10: sparse network, terrain, danger, hostile climate. Sources: FUB Barometer + EuroVelo + Vélo & Territoires.",
    intro:
      "Every town hall promises its cycling plan. In practice, some cities remain structurally hostile: no continuous cycle lanes, hilly terrain discouraging daily commutes, saturated road users, windy or rainy climate 200 days a year.",
    reality:
      "We rank cities over 15,000 whose composite (network + topography + safety + climate) falls ≤ 4.5/10. Convention is reversed vs other themes: 10 = excellent. Bonus +1.2 when network AND topography are both ≤ 4 — no lanes plus steep hills.",
    methodology:
      "Severity = (5 − composite) × 2 + combo bonus. Weighting: network 35% · topography 25% · safety 25% · climate 15%. Sources: FUB Barometer (French Cyclists' Federation), Vélo & Territoires (structuring network), EuroVelo, elevation & climate seed data.",
  },
  {
    enSlug: "sports-poor-cities",
    frSlug: "villes-pauvres-en-sport",
    emoji: "🏟️",
    title: "Cities where regular sport is a logistical struggle",
    metaTitle: "Sports-poor cities 2026 — Where regular practice is a struggle",
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
      "Severity = composite + 1.2 if ageing AND trajectory ≥ 7 + 0.4 if young adults ≥ 7. Weighting: ageing 30% · trajectory 30% · young adults 25% · renewal 15%. Sources: INSEE Population Census, annual demographic report, OMPHALE 2070 projection by employment zone.",
  },
  {
    enSlug: "tense-nights",
    frSlug: "villes-nuit-tendue",
    emoji: "🌙",
    title: "Cities with tense night safety in party districts",
    metaTitle: "Tense night safety 2026 — French cities with the most nocturnal crime pressure",
    metaDescription:
      "2026 ranking of cities over 15,000 with a night safety sub-score exceeding 6.5/10: fights, nocturnal assaults concentrated on festive/student/tourist centres. Source: SSMSI.",
    intro:
      "The overall safety score says 'average', but the nocturnal experience in some hyper-festive, student or tourist city centres is very different: fights outside clubs, assaults on the way home from an evening out, incidents concentrated on 4 streets in the centre.",
    reality:
      "We isolate the 'night safety' sub-score (fights / nocturnal assaults SSMSI) and rank cities over 15,000 exceeding 6.5/10 on this sub-score. Bonus +0.8 when persons offences corroborate (persons ≥ 6), +0.6 when explicitly tagged festive / student / tourist.",
    methodology:
      "Severity = nocturnal sub-score + combo bonuses. Weighting: property 35% · persons 30% · night 20% · VFFS 15%. Source: SSMSI (Interior Ministry statistics service), nocturnal assaults / fights; interstats.fr. Note: a high rate may reflect both a genuinely tenser environment AND better reporting.",
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
      "2026 ranking of French cities losing their 25-35s: INSEE demographic deficit, negative balance, tight jobs market, weak business dynamism. 540-city dataset.",
    intro:
      "The scenario doesn't show up in the town's attractiveness brochure. The 18-22s leave to study in Lyon, Bordeaux or Toulouse, some vaguely think they'll come back 'later, when it's time to start a family' — and never do. By 30, the whole cohort has moved to the metropolitan hubs, and the city is left with a lid-shaped demography: seniors who stayed, teens who'll leave, and a gaping hole at the top of the working-age pyramid. It's the exact opposite of the town-centre revitalisation pitch.",
    reality:
      "We cross the `youngActives` score from `lib/demography` (INSEE census proxy for the 25-35 share) with `trajectory` (natural + migratory balance, INSEE Demographic Report) and the unemployment score from `lib/employment-market` (INSEE Q4 2024). Cities that surface here are rarely spectacular — no scandal, no pollution — but they compound three signals: structural young-worker deficit, negative demographic balance, and a labour market tense on the applicant side. A bonus applies for subprefectures under 25,000 where the missing critical mass makes retention even harder. The filter deliberately excludes cities already dominated by ageing (demographic composite ≥ 8.5) — those belong in the critical-ageing theme.",
    methodology:
      "Severity = (0.55 × youngActives + 0.18 × max(0, trajectory − 5) + 0.16 × max(0, unemployment − 5) + 0.10 × max(0, dynamism − 5) + size penalty +0.4 if <25,000 or +0.2 if <40,000) × 1.7, capped at 10/10. Filter: population ≥ 10,000, demographic composite < 8.5 (to avoid overlap with critical-ageing), severity ≥ 6/10. Sources: INSEE Population Census (25-35 age structure), INSEE Demographic Report 2024 (natural + migratory balance), INSEE unemployment rate Q4 2024, SIRENE (business creation flows).",
  },
  {
    enSlug: "theft-burglary",
    frSlug: "villes-vols-cambriolages",
    emoji: "🔓",
    title: "Cities weighed down by burglary and vehicle theft",
    metaTitle: "Theft & burglary 2026 — France's most affected cities",
    metaDescription:
      "2026 ranking of French cities over 30,000 where the property-crime sub-score exceeds 6.5/10: burglary, vehicle theft, wilful damage. Source: SSMSI.",
    intro:
      "The headline safety score reads 'average' and the listing brochure sells you the quiet residential street, the gated parking, the alarm system included. On the ground: car found broken into on Tuesday morning, the block's cellar picked over, the neighbour's scooter stolen twice in six months, and the same tired conversation at the auto-glass shop the third time you replace the rear windscreen. Property offences — burglary, vehicle theft, wilful damage — don't kill anyone, but they wear down daily life and the wallet with a regularity that never appears in a brochure.",
    reality:
      "We isolate the `property` sub-score from `lib/safety-deep` — the dimension that carries 35% of the safety composite and aggregates residential burglary, vehicle theft and attempted theft, thefts from parked vehicles, and wilful damage (SSMSI). We keep cities over 30,000 whose sub-score exceeds 6.5/10. Severity bonus when the persons-crime sub-score corroborates (an isolated signal can be a one-off; a compound of property + persons ≥ 6 reveals a genuine basin-wide reality). Another bonus when the city is a large metropolis with a global score ≥ 6.5/10 — the polished, desirable façade that hides a chronic burglary undercurrent. A final bonus when the city is explicitly tourism-tagged and over 30,000: seasonal saturation of break-ins on second homes and rental vehicles, particularly documented along the Mediterranean coast and the Atlantic seaboard.",
    methodology:
      "Severity = property sub-score + 0.8 if persons ≥ 6/10 + 0.5 if metropolis with global score ≥ 6.5 + 0.4 if tourism-tagged and over 30,000. Safety-deep composite weighting: property 35% · persons 30% · night 20% · gender-based violence 15%. Sources: SSMSI (Interior Ministry statistics service, interstats.fr — municipal property-crime series), INSEE population, proprietary character-tags (metropolis / tourism vocation). Caveat: a high rate may reflect both genuine pressure AND a better reporting rate; theft of dockless shared bikes falls outside the standard SSMSI perimeter.",
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
    description: theme.metaDescription,
    alternates: { canonical: `${EN_BASE}/red-flags/themes/${slug}` },
    openGraph: {
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

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="mb-3 text-sm">
            <Link href="/red-flags" className="text-[var(--text-secondary)] hover:text-[var(--accent)]">
              ← Red Flags
            </Link>
          </div>
          <div className="text-5xl mb-3" aria-hidden>
            {theme.emoji}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.1]">
            {theme.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            {theme.intro}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <h2 className="text-base font-semibold text-[var(--text-primary)] mb-2">
            What the data shows
          </h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            {theme.reality}
          </p>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
            The {rows.length} most affected cities
          </h2>
          {rows.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
              <p className="text-sm text-[var(--text-secondary)]">
                No city exceeds the thresholds for this theme in the current dataset. If you think a city should appear here, let us know via the contact page.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {rows.map((row, i) => (
                <li key={row.city.slug}>
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 text-center">
                        <span className="font-mono-data text-2xl font-bold text-[var(--text-tertiary)]">
                          #{i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
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
                            className={`ml-auto inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${severityColor(row.severity)}`}
                          >
                            {row.severity.toFixed(1)}/10
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Link
                            href={`/cities/${row.city.slug}`}
                            className="text-xs underline text-[var(--accent)] hover:opacity-80"
                          >
                            {row.city.name} profile →
                          </Link>
                          <Link
                            href={`/red-flags/${row.city.slug}`}
                            className="text-xs underline text-[var(--text-secondary)] hover:opacity-80"
                          >
                            Red flag report →
                          </Link>
                          <span className="text-xs text-[var(--text-tertiary)]">
                            Overall: <span className={scoreColor(row.city.scores.global)}>{row.city.scores.global.toFixed(1)}/10</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Methodology</h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            {theme.methodology}
          </p>
          <p className="text-xs text-[var(--text-tertiary)] mt-3">
            Rankings update as proprietary scores improve (currently v0, derived from the official seed — see{" "}
            <Link href="/methodology" className="underline">methodology page</Link>).
          </p>
        </div>

        <section>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">
            Other red flag themes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherThemes.slice(0, 8).map((t) => (
              <Link
                key={t.enSlug}
                href={`/red-flags/themes/${t.enSlug}`}
                className="flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 transition-colors"
              >
                <span className="text-2xl flex-shrink-0" aria-hidden>{t.emoji}</span>
                <div>
                  <p className="font-semibold text-[var(--text-primary)] text-sm">{t.title}</p>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">{t.intro}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-3">
            <Link href="/red-flags" className="text-sm text-[var(--accent)] hover:underline">
              <AlertTriangle className="inline h-4 w-4 mr-1" />
              All red-flag reports →
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
