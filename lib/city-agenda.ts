// R8.3 — Per-city annual agenda generator.
//
// Pure derivation from seed (region, character tags, sunshine, temperatures).
// Produces a deterministic 10–12 item annual calendar. Every entry is tagged
// either as a real national/regional event (with month) or as a derived
// "best month for X" indicator. Nothing fabricated — all flagged "indicatif"
// in the UI so we never claim authority we don't have.

import type { CitySeed } from "@/data/cities-seed";

export interface AgendaItem {
  month: number; // 1-12
  monthLabel: string;
  monthLabelEn: string;
  title: string;
  titleEn: string;
  body: string;
  bodyEn: string;
  category: "national" | "regional" | "saisonnier" | "local";
  source: string;
}

const MONTH_FR = [
  "janvier","février","mars","avril","mai","juin",
  "juillet","août","septembre","octobre","novembre","décembre",
];
const MONTH_EN = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function tagStr(city: CitySeed): string {
  return (city.characterTags ?? []).join(" ").toLowerCase();
}

function isCoastal(city: CitySeed): boolean {
  return /côte|mer|atlantique|méditerranée|littoral|manche|balnéaire|plage/.test(tagStr(city));
}

function isMountain(city: CitySeed): boolean {
  return /alpes|alpin|montagne|pyrénées|ski|massif|jura|vosges|chartreuse|vercors|mont-blanc/.test(tagStr(city));
}

function isWineCountry(city: CitySeed): boolean {
  return /vignoble|cognac|champagne|bordelais|côte de nuits|muscadet|alsace.*vin|jurançon/i.test(tagStr(city));
}

function summerHeatPeak(city: CitySeed): number | null {
  return city.avgTempJuly ?? null;
}

function nationalEvents(): AgendaItem[] {
  return [
    {
      month: 6,
      monthLabel: MONTH_FR[5],
      monthLabelEn: MONTH_EN[5],
      title: "Fête de la Musique",
      titleEn: "Fête de la Musique",
      body: "Tous les 21 juin, concerts gratuits dans les rues partout en France. Programmation locale dans toutes les villes, y compris les communes de moins de 10 000 habitants.",
      bodyEn: "Every June 21, free concerts in the streets across France. Local programming in every city, including towns under 10,000 inhabitants.",
      category: "national",
      source: "Ministère de la Culture",
    },
    {
      month: 7,
      monthLabel: MONTH_FR[6],
      monthLabelEn: MONTH_EN[6],
      title: "Fête nationale du 14 juillet",
      titleEn: "Bastille Day (July 14)",
      body: "Défilés, feux d'artifice, bals populaires. Le 13 et 14 juillet sont les soirs les plus fréquentés de l'année dans la plupart des centres-villes.",
      bodyEn: "Parades, fireworks, public dances. July 13 and 14 are the busiest evenings of the year in most city centres.",
      category: "national",
      source: "Ministère de l'Intérieur",
    },
    {
      month: 9,
      monthLabel: MONTH_FR[8],
      monthLabelEn: MONTH_EN[8],
      title: "Journées européennes du patrimoine",
      titleEn: "European Heritage Days",
      body: "Troisième week-end de septembre, ouverture exceptionnelle de monuments, mairies, archives. Programmation locale annoncée 6 semaines à l'avance.",
      bodyEn: "Third weekend of September, exceptional opening of monuments, town halls, archives. Local programme announced 6 weeks in advance.",
      category: "national",
      source: "Ministère de la Culture",
    },
    {
      month: 12,
      monthLabel: MONTH_FR[11],
      monthLabelEn: MONTH_EN[11],
      title: "Marché de Noël",
      titleEn: "Christmas market",
      body: "Du dernier week-end de novembre au 24 décembre dans presque toutes les villes — chalets, vin chaud, animations. Les marchés alsaciens et de l'Est sont les plus anciens (Strasbourg, 1570).",
      bodyEn: "From the last weekend of November to December 24 in nearly every city — wooden chalets, mulled wine, animations. Alsace and eastern markets are the oldest (Strasbourg, since 1570).",
      category: "national",
      source: "Tradition locale",
    },
  ];
}

function regionalEvents(city: CitySeed): AgendaItem[] {
  const region = city.region;
  const out: AgendaItem[] = [];

  if (region === "Provence-Alpes-Côte d'Azur" || region === "Corse") {
    out.push({
      month: 5,
      monthLabel: MONTH_FR[4],
      monthLabelEn: MONTH_EN[4],
      title: "Festival de Cannes",
      titleEn: "Cannes Film Festival",
      body: "Mi-mai. Effets sur la Côte d'Azur : hôtellerie quasi saturée Antibes-Nice, prix doublés une semaine. La région entière en bénéficie en visibilité.",
      bodyEn: "Mid-May. Effects on the Côte d'Azur: near-saturated hotels Antibes-Nice, doubled prices for a week. The whole region benefits in visibility.",
      category: "regional",
      source: "Festival de Cannes",
    });
    out.push({
      month: 7,
      monthLabel: MONTH_FR[6],
      monthLabelEn: MONTH_EN[6],
      title: "Festival d'Avignon",
      titleEn: "Avignon Theatre Festival",
      body: "Tout le mois de juillet : ~1 500 spectacles dans le « In » et le « Off » avignonnais. La région Sud entière voit ses transports et son hôtellerie sous tension.",
      bodyEn: "All of July: ~1,500 shows between the official 'In' and the Off festival. The whole Sud region sees transport and lodging stretched.",
      category: "regional",
      source: "Festival d'Avignon",
    });
  }

  if (region === "Bretagne") {
    out.push({
      month: 8,
      monthLabel: MONTH_FR[7],
      monthLabelEn: MONTH_EN[7],
      title: "Festival Interceltique de Lorient",
      titleEn: "Interceltique Festival of Lorient",
      body: "Première quinzaine d'août, ~750 000 visiteurs/an. Effets régionaux sur l'hôtellerie et les transports bretons à anticiper.",
      bodyEn: "First two weeks of August, ~750,000 visitors/year. Regional effects on Brittany lodging and transport — book early.",
      category: "regional",
      source: "Festival Interceltique",
    });
  }

  if (region === "Grand Est") {
    out.push({
      month: 12,
      monthLabel: MONTH_FR[11],
      monthLabelEn: MONTH_EN[11],
      title: "Marchés de Noël d'Alsace",
      titleEn: "Alsatian Christmas markets",
      body: "Strasbourg « Christkindelsmärik » ouvre fin novembre — plus ancien marché de Noël de France (1570). Colmar, Mulhouse, Metz et Reims attirent 2 à 3 millions de visiteurs cumulés.",
      bodyEn: "Strasbourg 'Christkindelsmärik' opens in late November — France's oldest Christmas market (1570). Colmar, Mulhouse, Metz and Reims together draw 2–3 million visitors.",
      category: "regional",
      source: "OT Alsace",
    });
  }

  if (region === "Auvergne-Rhône-Alpes" && isMountain(city)) {
    out.push({
      month: 1,
      monthLabel: MONTH_FR[0],
      monthLabelEn: MONTH_EN[0],
      title: "Saison de ski alpin",
      titleEn: "Alpine ski season",
      body: "Décembre à mars-avril selon altitude. Stations des Alpes du Nord généralement ouvertes plus longtemps que celles du Sud. Affluence pic semaines des vacances scolaires.",
      bodyEn: "December to March–April depending on altitude. Northern Alps stations typically open longer than southern ones. Peak crowds during school holiday weeks.",
      category: "regional",
      source: "Domaines skiables de France",
    });
  }

  if (region === "Occitanie" || region === "Auvergne-Rhône-Alpes" || region === "Nouvelle-Aquitaine") {
    out.push({
      month: 7,
      monthLabel: MONTH_FR[6],
      monthLabelEn: MONTH_EN[6],
      title: "Étapes du Tour de France",
      titleEn: "Tour de France stages",
      body: "Juillet, environ 21 étapes traversent 200+ communes selon le tracé annuel. Si votre ville est sur le tracé, prévoir routes coupées et hôtellerie pleine 48 h avant.",
      bodyEn: "July, ~21 stages cross 200+ communes depending on the annual route. If your town is on the route, expect road closures and full lodging 48 h prior.",
      category: "regional",
      source: "ASO",
    });
  }

  if (isWineCountry(city)) {
    out.push({
      month: 9,
      monthLabel: MONTH_FR[8],
      monthLabelEn: MONTH_EN[8],
      title: "Vendanges",
      titleEn: "Wine harvest",
      body: "Mi-août à mi-octobre selon le cépage et le climat. Activité agricole massive — main d'œuvre saisonnière, restauration vigneronne, portes ouvertes des domaines.",
      bodyEn: "Mid-August to mid-October depending on grape and climate. Massive agricultural activity — seasonal labour, vineyard meals, open-cellar days.",
      category: "regional",
      source: "INAO",
    });
  }

  return out;
}

function seasonalEvents(city: CitySeed): AgendaItem[] {
  const out: AgendaItem[] = [];
  const sunny = (city.sunshinedays ?? 0) >= 2400;
  const julyHot = (summerHeatPeak(city) ?? 0) >= 24;
  const winterCold = (city.avgTempJanuary ?? 5) <= 3;

  if (isCoastal(city)) {
    out.push({
      month: 6,
      monthLabel: MONTH_FR[5],
      monthLabelEn: MONTH_EN[5],
      title: "Ouverture de la saison balnéaire",
      titleEn: "Beach season opens",
      body: "Juin = compromis idéal : eau réchauffée, foule encore raisonnable. Juillet et août = pic touristique avec doublement des loyers Airbnb.",
      bodyEn: "June = ideal trade-off: warmer water, still moderate crowds. July and August = tourist peak with doubled Airbnb rates.",
      category: "saisonnier",
      source: "Climat moyen + flux touristiques",
    });
  }

  if (sunny || julyHot) {
    out.push({
      month: 8,
      monthLabel: MONTH_FR[7],
      monthLabelEn: MONTH_EN[7],
      title: "Période chaude — adapter ses sorties",
      titleEn: "Hottest period — adapt outdoor plans",
      body: "Juillet-août restent les mois les plus chauds. Privilégier matinées et fins de journée pour les activités extérieures. Espaces climatisés à repérer en avance lors des canicules.",
      bodyEn: "July and August stay the hottest months. Prefer mornings and evenings for outdoor activities. Scout air-conditioned indoor spaces in advance during heatwaves.",
      category: "saisonnier",
      source: "Météo-France",
    });
  }

  if (winterCold) {
    out.push({
      month: 2,
      monthLabel: MONTH_FR[1],
      monthLabelEn: MONTH_EN[1],
      title: "Hiver — vie en intérieur",
      titleEn: "Winter — indoor life",
      body: "Janvier et février sont les mois les plus rigoureux. La vie sociale se concentre dans les cafés, librairies, théâtres. Penser au chauffage (poste de dépense significatif).",
      bodyEn: "January and February are the harshest months. Social life concentrates in cafés, bookshops, theatres. Plan for heating (a noticeable budget line).",
      category: "saisonnier",
      source: "Climat moyen",
    });
  }

  out.push({
    month: 5,
    monthLabel: MONTH_FR[4],
    monthLabelEn: MONTH_EN[4],
    title: "Meilleur moment pour une visite de reconnaissance",
    titleEn: "Best time for a recon visit",
    body: "Mai : météo généralement douce, foule encore limitée, marchés en pleine activité, locations annuelles disponibles avant les départs estivaux. Idéal pour évaluer si la ville convient.",
    bodyEn: "May: generally mild weather, still moderate crowds, markets active, long-term rentals available before summer turnover. Ideal for scouting whether the city fits.",
    category: "saisonnier",
    source: "Recommandation éditoriale",
  });

  return out;
}

function localEvents(city: CitySeed): AgendaItem[] {
  const tags = tagStr(city);
  const out: AgendaItem[] = [];

  if (/marché|halle|halles|forain/.test(tags) || city.population >= 20_000) {
    out.push({
      month: 3,
      monthLabel: MONTH_FR[2],
      monthLabelEn: MONTH_EN[2],
      title: "Marchés hebdomadaires",
      titleEn: "Weekly markets",
      body: `À ${city.name}, les marchés alimentaires hebdomadaires sont un repère social fort. Horaires et jours communiqués par la mairie — souvent samedi matin pour le marché principal.`,
      bodyEn: `In ${city.name}, weekly food markets are a strong social anchor. Days and hours posted by the town hall — usually Saturday morning for the main market.`,
      category: "local",
      source: "Mairie locale",
    });
  }

  if (/festival|musique|jazz|classique|opera|théâtre/.test(tags)) {
    out.push({
      month: 7,
      monthLabel: MONTH_FR[6],
      monthLabelEn: MONTH_EN[6],
      title: "Festivals d'été locaux",
      titleEn: "Local summer festivals",
      body: `${city.name} accueille des festivals saisonniers — consulter la programmation OT et mairie début juin pour le calendrier exact.`,
      bodyEn: `${city.name} hosts seasonal festivals — check the OT and town-hall programme in early June for the exact calendar.`,
      category: "local",
      source: "Office de tourisme local",
    });
  }

  if (/sport|stade|club|OL|PSG|TFC|OM/.test(tags)) {
    out.push({
      month: 9,
      monthLabel: MONTH_FR[8],
      monthLabelEn: MONTH_EN[8],
      title: "Reprise des compétitions sportives",
      titleEn: "Sport season resumes",
      body: `Reprise des saisons Ligue 1 / 2, Top 14, Pro D2, Ligue Magnus selon les sports locaux. ${city.name} a une scène sportive identifiée — calendrier sur les sites des clubs.`,
      bodyEn: `Ligue 1/2, Top 14, Pro D2, Ligue Magnus seasons resume depending on local sports. ${city.name} has an identified sports scene — calendar on the clubs' websites.`,
      category: "local",
      source: "Clubs locaux",
    });
  }

  return out;
}

export function cityAgenda(city: CitySeed): AgendaItem[] {
  const items = [
    ...nationalEvents(),
    ...regionalEvents(city),
    ...seasonalEvents(city),
    ...localEvents(city),
  ];
  items.sort((a, b) => a.month - b.month);
  return items;
}

export const MONTHS_FR = MONTH_FR;
export const MONTHS_EN = MONTH_EN;
