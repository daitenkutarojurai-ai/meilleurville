#!/usr/bin/env node
/**
 * Instagram Carousel poster for mavilleideale.fr
 *
 * Usage:
 *   node scripts/instagram-carousel.mjs --list           # list all topics with index
 *   node scripts/instagram-carousel.mjs --preview 0      # preview slides for topic 0
 *   node scripts/instagram-carousel.mjs --post 0         # post carousel for topic 0
 *   node scripts/instagram-carousel.mjs --next           # post next topic in queue
 *   node scripts/instagram-carousel.mjs --dry-run 0      # show API calls without posting
 *
 * Env vars required in .env.local:
 *   IG_USER_ID        Instagram Business Account ID (link FB page → IG account in Meta Business)
 *   IG_ACCESS_TOKEN   Long-lived token — scopes: instagram_basic, instagram_content_publish
 *                     Get via: GET https://graph.facebook.com/v21.0/me/accounts?access_token=FB_TOKEN
 *                     then GET /{page-id}?fields=instagram_business_account&access_token=PAGE_TOKEN
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const QUEUE_FILE = join(root, "scripts", "instagram-queue.json");
const BASE_URL = "https://mavilleideale.fr";
const IG_API = "https://graph.facebook.com/v21.0";

// ─── Load .env.local ──────────────────────────────────────────────────────────
const envRaw = readFileSync(join(root, ".env.local"), "utf-8");
const env = Object.fromEntries(
  envRaw
    .split("\n")
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);

const { IG_USER_ID, IG_ACCESS_TOKEN, FB_PAGE_TOKEN, FB_PAGE_ID } = env;
// When Instagram is linked to a Facebook Page, the Page token covers IG publishing
const IG_TOKEN = IG_ACCESS_TOKEN || FB_PAGE_TOKEN;

// ─── City stats (global score, key axes) for featured cities ─────────────────
const CITIES = {
  annecy:       { name: "Annecy",       global: 8.6, pop: 131000,  strengths: ["Nature", "Sécurité", "Écoles"],    weaknesses: ["Coût de vie", "Transports", "Emploi"] },
  nantes:       { name: "Nantes",       global: 8.3, pop: 314000,  strengths: ["Transports", "Culture", "Télétravail"], weaknesses: ["Météo", "Trafic", "Logement tendu"] },
  rennes:       { name: "Rennes",       global: 8.2, pop: 221000,  strengths: ["Qualité de vie", "Vélo", "Universités"], weaknesses: ["Pluie", "Emploi hors tech", "Logement tendu"] },
  bordeaux:     { name: "Bordeaux",     global: 8.1, pop: 254000,  strengths: ["Gastronomie", "Vélo", "Douceur"],   weaknesses: ["Prix immobilier", "Embouteillages", "Chaleur estivale"] },
  strasbourg:   { name: "Strasbourg",   global: 8.0, pop: 284000,  strengths: ["Culture", "Europe", "Gastronomie"], weaknesses: ["Hiver", "Coût logement", "Embouteillages"] },
  lyon:         { name: "Lyon",         global: 8.0, pop: 522000,  strengths: ["Gastronomie", "Culture", "Transports"], weaknesses: ["Canicules", "Prix logement", "Pollution"] },
  montpellier:  { name: "Montpellier",  global: 7.9, pop: 285000,  strengths: ["Soleil", "Étudiants", "Méditerranée"], weaknesses: ["Sécurité", "Emploi", "Trafic"] },
  nice:         { name: "Nice",         global: 7.8, pop: 342000,  strengths: ["Météo", "Mer", "Culture"],          weaknesses: ["Coût de vie", "Embouteillages", "Logement"] },
  toulouse:     { name: "Toulouse",     global: 7.8, pop: 479000,  strengths: ["Aérospatiale", "Étudiants", "Soleil"], weaknesses: ["Transports", "Inondations", "Trafic"] },
  "la-rochelle":{ name: "La Rochelle",  global: 7.8, pop: 76000,   strengths: ["Mer", "Vélo", "Qualité de vie"],   weaknesses: ["Emploi", "Logement tendu", "Taille"] },
  grenoble:     { name: "Grenoble",     global: 7.7, pop: 158000,  strengths: ["Nature", "Recherche", "Vélo"],     weaknesses: ["Sécurité", "Pollution hiver", "Météo"] },
  marseille:    { name: "Marseille",    global: 7.0, pop: 870000,  strengths: ["Mer", "Soleil", "Culture"],        weaknesses: ["Sécurité", "Transports", "Inégalités"] },
  paris:        { name: "Paris",        global: 6.8, pop: 2161000, strengths: ["Culture", "Transports", "Emploi"], weaknesses: ["Coût extrême", "Densité", "Bruit"] },
  nancy:        { name: "Nancy",        global: 7.5, pop: 104000,  strengths: ["Coût bas", "Culture", "Universités"], weaknesses: ["Emploi", "Météo", "Dynamisme"] },
  clermont:     { name: "Clermont-Ferrand", global: 7.3, pop: 142000, strengths: ["Nature", "Coût bas", "Universités"], weaknesses: ["Emploi", "Météo", "Isolement"] },
  dijon:        { name: "Dijon",        global: 7.6, pop: 156000,  strengths: ["Gastronomie", "Culture", "Coût"], weaknesses: ["Emploi", "Métropole limitée", "Attractivité"] },
};

// ─── OG image URLs ─────────────────────────────────────────────────────────────
function cityOg(slug) { return `${BASE_URL}/villes/${slug}/opengraph-image`; }
function comparerOg(a, b) { return `${BASE_URL}/comparer/${a}-vs-${b}/opengraph-image`; }
function classementOg(slug) { return `${BASE_URL}/classements/${slug}/opengraph-image`; }
const HOME_OG = `${BASE_URL}/opengraph-image`;
const LEADERBOARD_OG = `${BASE_URL}/leaderboard/opengraph-image`;

// ─── Topic list ───────────────────────────────────────────────────────────────
// Each topic: { series, title, caption, slides[] }
// slides: { imageUrl, altText }
// Instagram: 2–10 slides, all same aspect ratio (1200×630 landscape for OG images)

const TOPICS = [
  // ── BATTLE: City vs City ──────────────────────────────────────────────────
  {
    series: "battle",
    title: "Lyon vs Bordeaux",
    caption: `🆚 Lyon vs Bordeaux — laquelle vous correspond ?

📊 Lyon (8.0/10) : métropole, gastronomie, 4 lignes de métro
🍷 Bordeaux (8.1/10) : vélo roi, douceur de vivre, prix en hausse

→ Glissez pour voir le match score par score.

Comparez toutes les villes sur mavilleideale.fr

#Lyon #Bordeaux #VieEnFrance #QualitéDeVie #Relocation #OùVivre #ImmobilierFrance`,
    slides: [
      { imageUrl: comparerOg("lyon", "bordeaux"), altText: "Lyon vs Bordeaux — comparatif qualité de vie",
        text: { heading: "LYON VS BORDEAUX", subheading: "Laquelle vous correspond ?" } },
      { imageUrl: cityOg("lyon"), altText: "Lyon — score 8.0/10",
        text: { heading: "LYON — 8.0/10", subheading: "Gastronomie · Culture · Transports", body: ["Points forts : culture, métro, emploi", "Point faible : canicules & logement"] } },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — score 8.1/10",
        text: { heading: "BORDEAUX — 8.1/10", subheading: "Vélo · Douceur · Gastronomie", body: ["Points forts : qualité de vie, vélo", "Point faible : prix immobilier +60%"] } },
      { imageUrl: comparerOg("lyon", "bordeaux"), altText: "Verdict : Lyon ou Bordeaux ?",
        text: { heading: "VOTRE VERDICT ?", subheading: "Comparez sur mavilleideale.fr", accent: "BATTLE" } },
    ],
  },
  {
    series: "battle",
    title: "Nantes vs Rennes",
    caption: `🆚 Nantes vs Rennes — la bataille de l'Ouest !

🦁 Nantes (8.3/10) : culture, tram, taille de métropole
⚽ Rennes (8.2/10) : vélo, universités, qualité de vie discrète

Les deux dament le pion à Paris sur le rapport qualité/prix. Mais laquelle vous ressemble ?

→ Analyse complète sur mavilleideale.fr

#Nantes #Rennes #PaysDeLaLoire #Bretagne #QualitéDeVie #Relocation`,
    slides: [
      { imageUrl: comparerOg("nantes", "rennes"), altText: "Nantes vs Rennes — comparatif",
        text: { heading: "NANTES VS RENNES", subheading: "La bataille de l'Ouest !" } },
      { imageUrl: cityOg("nantes"), altText: "Nantes — score 8.3/10",
        text: { heading: "NANTES — 8.3/10", subheading: "Culture · Tram · Métropole", body: ["Points forts : transports, emploi", "Point faible : météo & logement tendu"] } },
      { imageUrl: cityOg("rennes"), altText: "Rennes — score 8.2/10",
        text: { heading: "RENNES — 8.2/10", subheading: "Vélo · Universités · Qualité de vie", body: ["Points forts : vélo, coût maîtrisé", "Point faible : pluie & emploi hors tech"] } },
      { imageUrl: comparerOg("nantes", "rennes"), altText: "Verdict : Nantes ou Rennes ?",
        text: { heading: "VOTRE VERDICT ?", subheading: "Comparez sur mavilleideale.fr", accent: "BATTLE" } },
    ],
  },
  {
    series: "battle",
    title: "Marseille vs Nice",
    caption: `🆚 Marseille vs Nice — la Méditerranée en duel

☀️ Nice (7.8/10) : 300 jours de soleil, Côte d'Azur, mais prix salés
🌊 Marseille (7.0/10) : authenticité, mer, mais prudence sur la sécurité

Deux villes du Sud, deux ambiances radicalement différentes.

→ Comparez sur mavilleideale.fr

#Marseille #Nice #PACA #CôteDAzur #SudDeLaFrance #QualitéDeVie`,
    slides: [
      { imageUrl: comparerOg("marseille", "nice"), altText: "Marseille vs Nice — comparatif",
        text: { heading: "MARSEILLE VS NICE", subheading: "La Méditerranée en duel" } },
      { imageUrl: cityOg("marseille"), altText: "Marseille — score 7.0/10",
        text: { heading: "MARSEILLE — 7.0/10", subheading: "Mer · Soleil · Culture", body: ["Points forts : authenticité, mer", "Point faible : sécurité & inégalités"] } },
      { imageUrl: cityOg("nice"), altText: "Nice — score 7.8/10",
        text: { heading: "NICE — 7.8/10", subheading: "300 jours de soleil · Côte d'Azur", body: ["Points forts : météo, culture", "Point faible : coût de vie élevé"] } },
      { imageUrl: comparerOg("marseille", "nice"), altText: "Verdict : Marseille ou Nice ?",
        text: { heading: "VOTRE VERDICT ?", subheading: "Comparez sur mavilleideale.fr", accent: "BATTLE" } },
    ],
  },
  {
    series: "battle",
    title: "Toulouse vs Montpellier",
    caption: `🆚 Toulouse vs Montpellier — duel des villes roses du Sud

✈️ Toulouse (7.8/10) : aérospatiale, étudiants, soleil garanti
🎓 Montpellier (7.9/10) : Méditerranée, jeunesse, coût encore raisonnable

Les deux grandissent vite. Laquelle a encore de la place pour vous ?

→ Analyse sur mavilleideale.fr

#Toulouse #Montpellier #OccitanieFrance #QualitéDeVie #Etudiants #Relocation`,
    slides: [
      { imageUrl: comparerOg("toulouse", "montpellier"), altText: "Toulouse vs Montpellier — comparatif",
        text: { heading: "TOULOUSE VS MONTPELLIER", subheading: "Duel des villes du Sud" } },
      { imageUrl: cityOg("toulouse"), altText: "Toulouse — score 7.8/10",
        text: { heading: "TOULOUSE — 7.8/10", subheading: "Aerospatiale · Etudiants · Soleil", body: ["Points forts : emploi, soleil", "Point faible : transports & trafic"] } },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — score 7.9/10",
        text: { heading: "MONTPELLIER — 7.9/10", subheading: "Mer · Jeunesse · Dynamisme", body: ["Points forts : soleil, etudiants", "Point faible : securite & loyers"] } },
      { imageUrl: comparerOg("toulouse", "montpellier"), altText: "Verdict : Toulouse ou Montpellier ?",
        text: { heading: "VOTRE VERDICT ?", subheading: "Comparez sur mavilleideale.fr", accent: "BATTLE" } },
    ],
  },
  {
    series: "battle",
    title: "Annecy vs Grenoble",
    caption: `🆚 Annecy vs Grenoble — l'Isère vs la Haute-Savoie

🏔️ Annecy (8.6/10) : lac, nature, sécurité — mais prix parisiens
🔬 Grenoble (7.7/10) : recherche, vélo, nature — mais hiver brumeux

Pour les amoureux des Alpes, le choix n'est pas évident.

→ Comparez sur mavilleideale.fr

#Annecy #Grenoble #AuvergneRhôneAlpes #Alpes #QualitéDeVie`,
    slides: [
      { imageUrl: comparerOg("annecy", "grenoble"), altText: "Annecy vs Grenoble — comparatif",
        text: { heading: "ANNECY VS GRENOBLE", subheading: "Haute-Savoie vs Isere — les Alpes en duel" } },
      { imageUrl: cityOg("annecy"), altText: "Annecy — score 8.6/10",
        text: { heading: "ANNECY — 8.6/10", subheading: "Lac · Alpes · Securite", body: ["Points forts : nature 9.8, securite 8.7", "Point faible : prix immobilier parisiens"] } },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — score 7.7/10",
        text: { heading: "GRENOBLE — 7.7/10", subheading: "Recherche · Velo · Montagne", body: ["Points forts : nature, universites", "Point faible : pollution hiver & securite"] } },
      { imageUrl: comparerOg("annecy", "grenoble"), altText: "Verdict : Annecy ou Grenoble ?",
        text: { heading: "VOTRE VERDICT ?", subheading: "Comparez sur mavilleideale.fr", accent: "BATTLE" } },
    ],
  },
  {
    series: "battle",
    title: "Strasbourg vs Nancy",
    caption: `🆚 Strasbourg vs Nancy — l'Alsace vs la Lorraine

🇪🇺 Strasbourg (8.0/10) : capital européenne, gastronomie, mais coût élevé
🏛️ Nancy (7.5/10) : Place Stanislas, coût bas, universités

Nancy offre un rapport qualité/prix imbattable en Grand Est.

→ Analyse sur mavilleideale.fr

#Strasbourg #Nancy #GrandEst #Alsace #Lorraine #QualitéDeVie`,
    slides: [
      { imageUrl: comparerOg("strasbourg", "nancy"), altText: "Strasbourg vs Nancy — comparatif",
        text: { heading: "STRASBOURG VS NANCY", subheading: "Grand Est — culture vs budget" } },
      { imageUrl: cityOg("strasbourg"), altText: "Strasbourg — score 8.0/10",
        text: { heading: "STRASBOURG — 8.0/10", subheading: "Europe · Gastronomie · Culture", body: ["Points forts : culture, transports", "Point faible : hiver & logement cher"] } },
      { imageUrl: cityOg("nancy"), altText: "Nancy — score 7.5/10",
        text: { heading: "NANCY — 7.5/10", subheading: "Place Stanislas · Budget · Universites", body: ["Points forts : cout bas, culture", "Point faible : emploi & attractivite"] } },
      { imageUrl: comparerOg("strasbourg", "nancy"), altText: "Verdict : Strasbourg ou Nancy ?",
        text: { heading: "VOTRE VERDICT ?", subheading: "Comparez sur mavilleideale.fr", accent: "BATTLE" } },
    ],
  },
  {
    series: "battle",
    title: "La Rochelle vs Nantes",
    caption: `🆚 La Rochelle vs Nantes — la côte Atlantique en duel

⛵ La Rochelle (7.8/10) : mer, vélo, qualité de vie — taille humaine
🌆 Nantes (8.3/10) : métropole, emploi, culture — plus grande, plus chère

Petite ville zen ou grande ville dynamique ?

→ Votre réponse sur mavilleideale.fr

#LaRochelle #Nantes #CharenteMaritime #Atlantic #QualitéDeVie`,
    slides: [
      { imageUrl: comparerOg("la-rochelle", "nantes"), altText: "La Rochelle vs Nantes — comparatif",
        text: { heading: "LA ROCHELLE VS NANTES", subheading: "Petite ville zen ou grande metropole ?" } },
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — score 7.8/10",
        text: { heading: "LA ROCHELLE — 7.8/10", subheading: "Mer · Velo · Taille humaine", body: ["Points forts : ocean, qualite de vie", "Point faible : emploi & logement tendu"] } },
      { imageUrl: cityOg("nantes"), altText: "Nantes — score 8.3/10",
        text: { heading: "NANTES — 8.3/10", subheading: "Metropole · Emploi · Culture", body: ["Points forts : transports, diversite", "Point faible : meteo & marche tendu"] } },
      { imageUrl: comparerOg("la-rochelle", "nantes"), altText: "Verdict : La Rochelle ou Nantes ?",
        text: { heading: "VOTRE VERDICT ?", subheading: "Comparez sur mavilleideale.fr", accent: "BATTLE" } },
    ],
  },
  {
    series: "battle",
    title: "Paris vs Lyon",
    caption: `🆚 Paris vs Lyon — quitter la capitale, ça vaut quoi ?

🗼 Paris (6.8/10) : emploi, culture, transport — mais coût extrême et densité épuisante
🦁 Lyon (8.0/10) : gastronomie, métro, Alpes à 1h — pour 40% moins cher

Lyon gagne sur presque tout, sauf le réseau pro.

→ Comparez sur mavilleideale.fr

#Paris #Lyon #QuitParis #Relocation #VieEnProvince #QualitéDeVie`,
    slides: [
      { imageUrl: comparerOg("paris", "lyon"), altText: "Paris vs Lyon — comparatif",
        text: { heading: "PARIS VS LYON", subheading: "Quitter la capitale — ca vaut quoi ?" } },
      { imageUrl: cityOg("paris"), altText: "Paris — score 6.8/10",
        text: { heading: "PARIS — 6.8/10", subheading: "Emploi · Culture · Transports", body: ["Points forts : reseau pro, culture", "Point faible : cout extreme & densite"] } },
      { imageUrl: cityOg("lyon"), altText: "Lyon — score 8.0/10",
        text: { heading: "LYON — 8.0/10", subheading: "Gastronomie · Metro · Alpes a 1h", body: ["Points forts : qualite vie, emploi", "Point faible : canicules & logement"] } },
      { imageUrl: comparerOg("paris", "lyon"), altText: "Verdict : Paris ou Lyon ?",
        text: { heading: "VOTRE VERDICT ?", subheading: "Comparez sur mavilleideale.fr", accent: "BATTLE" } },
    ],
  },

  // ── RED FLAGS ─────────────────────────────────────────────────────────────
  {
    series: "red-flags",
    title: "Red flags de Marseille",
    caption: `🚩 Red flags de Marseille — ce qu'on ne vous dit pas

Marseille attire. Mais avant de signer, voilà les vrais points noirs :

🚩 Sécurité : score parmi les plus bas de France — zones très contrastées
🚩 Transports : réseau incomplet, grèves fréquentes, voiture quasi obligatoire
🚩 Inégalités territoriales : entre les quartiers Nord et le Vieux-Port, deux mondes

Ça n'empêche pas d'y vivre bien — avec les bons yeux ouverts.

→ Analyse complète sur mavilleideale.fr/villes/marseille

#Marseille #RedFlags #VéritéSurMarseille #BienVivre #Relocation`,
    slides: [
      { imageUrl: cityOg("marseille"), altText: "Red flags de Marseille",
        text: { heading: "RED FLAGS", subheading: "Marseille — ce qu'on ne vous dit pas", accent: "ATTENTION" } },
      { imageUrl: cityOg("marseille"), altText: "Marseille — sécurité",
        text: { heading: "SECURITE", subheading: "Score parmi les plus bas de France", body: ["Zones tres contrastees : nord vs sud", "Prudence dans certains quartiers"] } },
      { imageUrl: cityOg("marseille"), altText: "Marseille — transports",
        text: { heading: "TRANSPORTS", subheading: "Reseau incomplet, greves frequentes", body: ["Voiture quasi obligatoire hors centre", "Metro limite a 2 lignes"] } },
      { imageUrl: cityOg("marseille"), altText: "Marseille — inégalités",
        text: { heading: "MAIS...", subheading: "Mer, soleil, authenticite unique", body: ["Score global 7.0/10 malgre les defis", "mavilleideale.fr/villes/marseille"] } },
    ],
  },
  {
    series: "red-flags",
    title: "Red flags de Bordeaux",
    caption: `🚩 Red flags de Bordeaux — 3 vérités qui font mal

Bordeaux fait rêver. Mais voilà ce que les agences ne mettent pas en avant :

🚩 Prix immobilier : +60% en 10 ans — les primo-accédants sont expulsés vers la périphérie
🚩 Embouteillages : la rocade est un enfer quotidien sans vélo ni tram
🚩 Chaleur estivale : été 2022, +42°C. Les canicules durent plus longtemps chaque année

Belle ville. Oui. Mais il faut savoir dans quoi on s'engage.

→ mavilleideale.fr/villes/bordeaux

#Bordeaux #RedFlags #ImmobilierFrance #QualitéDeVie #VérifiéSurLeDonnées`,
    slides: [
      { imageUrl: cityOg("bordeaux"), altText: "Red flags de Bordeaux",
        text: { heading: "RED FLAGS", subheading: "Bordeaux — 3 verites qui font mal", accent: "ATTENTION" } },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — prix immobilier",
        text: { heading: "PRIX IMMOBILIER", subheading: "+60% en 10 ans", body: ["Les primo-accedants fuis vers la peripherie", "T2 en centre : 900-1200 EUR/mois"] } },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — embouteillages",
        text: { heading: "ROCADE", subheading: "Un enfer quotidien", body: ["Sans velo ou tram : voiture incontournable", "Heure de pointe : +45 min de trajet"] } },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — canicules",
        text: { heading: "MAIS...", subheading: "8.1/10 — qualite de vie reelle", body: ["Velo, gastronomie, douceur de vivre", "mavilleideale.fr/villes/bordeaux"] } },
    ],
  },
  {
    series: "red-flags",
    title: "Red flags de Montpellier",
    caption: `🚩 Red flags de Montpellier — soleil oui, mais…

Montpellier est la ville qui grossit le plus vite de France. Ça crée des tensions :

🚩 Sécurité : certains quartiers figurent parmi les plus difficiles du pays
🚩 Marché locatif : pénurie étudiante + afflux de retraités → loyers en flèche
🚩 Infrastructure qui court après la croissance : bouchons, transports saturés

La ville est jeune, dynamique, ensoleillée — mais pas encore au niveau de ses ambitions.

→ mavilleideale.fr/villes/montpellier

#Montpellier #RedFlags #OccitanieFrance #Relocation #VilleDeFrance`,
    slides: [
      { imageUrl: cityOg("montpellier"), altText: "Red flags de Montpellier",
        text: { heading: "RED FLAGS", subheading: "Montpellier — soleil oui, mais...", accent: "ATTENTION" } },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — sécurité",
        text: { heading: "SECURITE", subheading: "Certains quartiers tres difficiles", body: ["Score securite en dessous de la moyenne", "Ville qui grossit vite — tensions sociales"] } },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — marché locatif",
        text: { heading: "LOYERS", subheading: "Penurie etudiante + afflux retraites", body: ["Marche locatif sature en septembre", "Loyers en hausse : +20% en 5 ans"] } },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — infrastructure",
        text: { heading: "MAIS...", subheading: "7.9/10 — soleil et dynamisme reels", body: ["35% d'etudiants, Mediterranee a 15 min", "mavilleideale.fr/villes/montpellier"] } },
    ],
  },
  {
    series: "red-flags",
    title: "Red flags de Nice",
    caption: `🚩 Red flags de Nice — la Côte d'Azur sans le filtre

Nice attire massivement. Mais le soleil cache des ombres :

🚩 Coût de vie : parmi les 5 villes les plus chères de France, loyers proches de Paris
🚩 Embouteillages chroniques : le littoral est saturé 6 mois sur 12
🚩 Accès logement : résidence secondaire & tourisme gonflent les prix — les locaux fuient

Le rêve méditerranéen a un prix. Avez-vous fait les calculs ?

→ mavilleideale.fr/villes/nice

#Nice #RedFlags #CôteDAzur #ImmobilierFrance #VieEnFrance`,
    slides: [
      { imageUrl: cityOg("nice"), altText: "Red flags de Nice",
        text: { heading: "RED FLAGS", subheading: "Nice — la Cote d'Azur sans le filtre", accent: "ATTENTION" } },
      { imageUrl: cityOg("nice"), altText: "Nice — coût de vie",
        text: { heading: "COUT DE VIE", subheading: "Top 5 des villes les plus cheres", body: ["Loyers proches de Paris", "Residence secondaire gonfle les prix"] } },
      { imageUrl: cityOg("nice"), altText: "Nice — trafic",
        text: { heading: "TRAFIC", subheading: "Le littoral sature 6 mois/12", body: ["Embouteillages chroniques en saison", "Voiture presque obligatoire hors centre"] } },
      { imageUrl: cityOg("nice"), altText: "Nice — logement",
        text: { heading: "MAIS...", subheading: "7.8/10 — 300 jours de soleil", body: ["Mer, culture, art de vivre unique", "mavilleideale.fr/villes/nice"] } },
    ],
  },
  {
    series: "red-flags",
    title: "Red flags de Grenoble",
    caption: `🚩 Red flags de Grenoble — la ville des Alpes sans les paillettes

Grenoble = nature, vélo, recherche. Mais aussi :

🚩 Pollution hivernale : la cuvette alpine piège les particules fines — alertes régulières
🚩 Sécurité en centre-ville : score en baisse ces 5 dernières années
🚩 Grisaille : 120+ jours de brouillard par an, le soleil se mérite

Pour les amoureux des Alpes qui acceptent de ne pas tout avoir.

→ mavilleideale.fr/villes/grenoble

#Grenoble #RedFlags #Alpes #VieEnFrance #QualitéDeVie`,
    slides: [
      { imageUrl: cityOg("grenoble"), altText: "Red flags de Grenoble",
        text: { heading: "RED FLAGS", subheading: "Grenoble — les Alpes sans les paillettes", accent: "ATTENTION" } },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — pollution",
        text: { heading: "POLLUTION", subheading: "Cuvette alpine — particules fines pieges", body: ["Alertes qualite air regulieres en hiver", "Voiture a eviter les jours rouges"] } },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — sécurité",
        text: { heading: "SECURITE", subheading: "Score en baisse depuis 5 ans", body: ["Certains quartiers centre-ville difficiles", "Vigilance recommandee en soiree"] } },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — météo",
        text: { heading: "MAIS...", subheading: "7.7/10 — nature et recherche au top", body: ["Massifs a portee de velo, 3 universites", "mavilleideale.fr/villes/grenoble"] } },
    ],
  },

  // ── TOP 5 CLASSEMENTS ─────────────────────────────────────────────────────
  {
    series: "top5",
    title: "Top 5 villes pour le télétravail",
    caption: `💻 Top 5 villes françaises pour le télétravail en 2026

Le télétravail change tout. Voici où s'installer si vous ne dépendez plus d'un bureau :

🥇 Annecy — nature + sécurité + connexion fibre = paradis
🥈 Rennes — université, vélo, coût maîtrisé
🥉 La Rochelle — mer, qualité de vie, taille humaine
4️⃣ Nantes — métropole avec fibre partout
5️⃣ Bordeaux — lifestyle, mais attention aux prix

→ Classement complet sur mavilleideale.fr/classements/teletravail

#Télétravail #RemoteWork #France #QualitéDeVie #OùVivre #NomadeFrançais`,
    slides: [
      { imageUrl: classementOg("teletravail"), altText: "Top 5 villes pour le télétravail",
        text: { heading: "TOP 5 TELETRAVAIL", subheading: "Les meilleures villes si vous etes libres", accent: "CLASSEMENT" } },
      { imageUrl: cityOg("annecy"), altText: "Annecy — #1 télétravail",
        text: { heading: "#1 ANNECY — 8.6/10", subheading: "Nature + securite + fibre = paradis", body: ["Lac, montagne, air pur", "Prix eleves — budget a prevoir"] } },
      { imageUrl: cityOg("rennes"), altText: "Rennes — #2 télétravail",
        text: { heading: "#2 RENNES — 8.2/10", subheading: "Velo, universites, cout maitrise", body: ["TGV Paris en 1h25", "Communaute tech dynamique"] } },
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — #3 télétravail",
        text: { heading: "#3 LA ROCHELLE — 7.8/10", subheading: "Mer, velo pionnier, taille humaine", body: ["76 000 hab. — tout a pied ou velo", "Iles accessibles le week-end"] } },
      { imageUrl: cityOg("nantes"), altText: "Nantes — #4 télétravail",
        text: { heading: "#4 NANTES — 8.3/10", subheading: "Metropole avec fibre partout", body: ["Transports exemplaires, culture riche", "Atlantique a 1h"] } },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — #5 télétravail",
        text: { heading: "#5 BORDEAUX — 8.1/10", subheading: "Lifestyle — mais attention aux prix", body: ["Velo roi, gastronomie, douceur", "mavilleideale.fr/classements/teletravail"] } },
    ],
  },
  {
    series: "top5",
    title: "Top 5 villes pour la nature",
    caption: `🌿 Top 5 villes françaises où la nature est partout

Forêts, lacs, océan, montagne — ces villes ont tout ça à moins de 30 minutes :

🥇 Annecy — lac + Alpes, score nature 9.8/10
🥈 Grenoble — massifs à portée de vélo
🥉 La Rochelle — île de Ré, marais, océan
4️⃣ Rennes — forêt de Brocéliande, côte à 45 min
5️⃣ Nantes — vignes, bocage, Loire

→ mavilleideale.fr/classements/nature

#Nature #France #GrandAir #QualitéDeVie #Randonnée #VieAuGrand Air`,
    slides: [
      { imageUrl: classementOg("nature"), altText: "Top 5 villes pour la nature",
        text: { heading: "TOP 5 NATURE", subheading: "Forets, lacs, ocean — a moins de 30 min", accent: "CLASSEMENT" } },
      { imageUrl: cityOg("annecy"), altText: "Annecy — nature 9.8/10",
        text: { heading: "#1 ANNECY", subheading: "Nature 9.8/10 — meilleur score France", body: ["Lac d'Annecy + Alpes a velo", "Reserve naturelle a 10 min du centre"] } },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — nature et Alpes",
        text: { heading: "#2 GRENOBLE", subheading: "3 massifs alpins, velo roi", body: ["Belledonne, Vercors, Chartreuse", "Ski a 45 min, randonnee a 15 min"] } },
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — océan + île",
        text: { heading: "#3 LA ROCHELLE", subheading: "Ocean, ile de Re, marais atlantique", body: ["Kayak, velo, plage — tout accessible", "Faune et flore protegees"] } },
      { imageUrl: cityOg("rennes"), altText: "Rennes — Bretagne verdoyante",
        text: { heading: "#4 RENNES", subheading: "Foret de Broceliande, cote a 45 min", body: ["Bocage breton, riviere a velo", "Mont-Saint-Michel a 1h"] } },
      { imageUrl: cityOg("nantes"), altText: "Nantes — Loire et bocage",
        text: { heading: "#5 NANTES", subheading: "Loire, vignes, bocage vendeen", body: ["Parc de Procé + Loire en kayak", "mavilleideale.fr/classements/nature"] } },
    ],
  },
  {
    series: "top5",
    title: "Top 5 villes les plus sûres",
    caption: `🛡️ Top 5 villes françaises où on dort tranquille

Ces classements sont basés sur les données SSMSI (Ministère de l'Intérieur) — pas des ressentis.

🥇 Annecy — sécurité 8.7/10, l'une des meilleures de France
🥈 Rennes — faible criminalité pour une métropole
🥉 Strasbourg — centre sûr, chiffres solides
4️⃣ Nantes — dans la moyenne haute
5️⃣ Dijon — souvent sous-estimée, chiffres corrects

→ Données vérifiées sur mavilleideale.fr/classements/securite

#Sécurité #France #VieEnFrance #Relocation #MeilleureVille #SSMSI`,
    slides: [
      { imageUrl: classementOg("securite"), altText: "Top 5 villes les plus sûres",
        text: { heading: "TOP 5 SECURITE", subheading: "Donnees SSMSI — pas des ressentis", accent: "CLASSEMENT" } },
      { imageUrl: cityOg("annecy"), altText: "Annecy — sécurité #1",
        text: { heading: "#1 ANNECY", subheading: "Securite 8.7/10 — record national", body: ["Criminalite parmi les plus basses", "Ville la plus sure de cette taille"] } },
      { imageUrl: cityOg("rennes"), altText: "Rennes — sécurité #2",
        text: { heading: "#2 RENNES", subheading: "Faible criminalite pour une metropole", body: ["Chiffres stables et solides", "Centre-ville sur a toute heure"] } },
      { imageUrl: cityOg("strasbourg"), altText: "Strasbourg — sécurité #3",
        text: { heading: "#3 STRASBOURG", subheading: "Centre sur, chiffres corrects", body: ["Faible violence en centre-ville", "Quelques zones sensibles en peripherie"] } },
      { imageUrl: cityOg("nantes"), altText: "Nantes — sécurité #4",
        text: { heading: "#4 NANTES", subheading: "Dans la moyenne haute nationale", body: ["Metropole avec securite maitrisee", "Centre-ville et ile de Nantes surs"] } },
      { imageUrl: cityOg("dijon"), altText: "Dijon — sécurité #5",
        text: { heading: "#5 DIJON", subheading: "Souvent sous-estimee — bons chiffres", body: ["Gastronomie + securite + culture", "mavilleideale.fr/classements/securite"] } },
    ],
  },
  {
    series: "top5",
    title: "Top 5 villes pour les étudiants",
    caption: `🎓 Top 5 villes étudiantes en France — au-delà de Paris

Paris coûte une fortune. Ces villes offrent l'ambiance sans le budget :

🥇 Rennes — ville universitaire par excellence, loyers encore raisonnables
🥈 Montpellier — 35% d'étudiants dans la ville, Méditerranée en prime
🥉 Grenoble — universités de recherche, ambiance internationale
4️⃣ Nancy — coût de vie parmi les plus bas, Place Stanislas en terrasse
5️⃣ Toulouse — aérospatiale + ingénierie + festif

→ mavilleideale.fr/classements/etudiants

#Étudiants #VieÉtudiante #France #Universités #Campus #OùÉtudier`,
    slides: [
      { imageUrl: classementOg("etudiants"), altText: "Top 5 villes étudiantes",
        text: { heading: "TOP 5 ETUDIANTS", subheading: "Hors Paris — ambiance sans le budget", accent: "CLASSEMENT" } },
      { imageUrl: cityOg("rennes"), altText: "Rennes — #1 étudiants",
        text: { heading: "#1 RENNES", subheading: "Ville universitaire par excellence", body: ["Loyers encore raisonnables", "Vie associative et culturelle dense"] } },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — #2 étudiants",
        text: { heading: "#2 MONTPELLIER", subheading: "35% d'etudiants + Mediterranee", body: ["Campus en bord de ville, plage a 15 min", "Vie nocturne et culturelle intense"] } },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — #3 étudiants",
        text: { heading: "#3 GRENOBLE", subheading: "Universites de recherche internationales", body: ["Polytech, UGA, Grenoble INP", "Ski + labo = combo unique"] } },
      { imageUrl: cityOg("nancy"), altText: "Nancy — #4 étudiants",
        text: { heading: "#4 NANCY", subheading: "T2 a 550 EUR — Place Stanislas gratuite", body: ["Cout de vie parmi les plus bas", "Mines Nancy, Sciences Po, medecine"] } },
      { imageUrl: cityOg("toulouse"), altText: "Toulouse — #5 étudiants",
        text: { heading: "#5 TOULOUSE", subheading: "Aerospatiale + ingenierie + festif", body: ["ISAE, IMT Mines, Paul Sabatier", "mavilleideale.fr/classements/etudiants"] } },
    ],
  },
  {
    series: "top5",
    title: "Top 5 villes les moins chères",
    caption: `💶 Top 5 villes françaises où votre budget va enfin souffler

Loyer < 700€ pour un T2, c'est encore possible. Voilà où :

🥇 Nancy — loyer moyen T2 ~580€, culture et architecture gratuites
🥈 Clermont-Ferrand — Massif Central, volcans, bas coûts
🥉 Dijon — gastronomie + art de vivre à prix correct
4️⃣ Strasbourg — cher pour la région mais loin de Paris
5️⃣ Grenoble — montagne accessible, coût maîtrisé

→ mavilleideale.fr/classements/cout-vie

#BudgetFrance #CoûtDeVie #Loyer #Immobilier #France #OùBienVivre`,
    slides: [
      { imageUrl: classementOg("cout-vie"), altText: "Top 5 villes les moins chères",
        text: { heading: "TOP 5 BUDGET", subheading: "Loyer T2 < 700 EUR — c'est encore possible", accent: "CLASSEMENT" } },
      { imageUrl: cityOg("nancy"), altText: "Nancy — coût bas #1",
        text: { heading: "#1 NANCY", subheading: "T2 ~580 EUR — culture et archi gratuites", body: ["Place Stanislas classee UNESCO", "Mines, Sciences Po, medecine"] } },
      { imageUrl: cityOg("clermont"), altText: "Clermont-Ferrand — coût bas #2",
        text: { heading: "#2 CLERMONT-FERRAND", subheading: "Volcans, nature, budget zero", body: ["Puy-de-Dome a 15 min", "Michelin, loyers parmi les plus bas"] } },
      { imageUrl: cityOg("dijon"), altText: "Dijon — coût bas #3",
        text: { heading: "#3 DIJON", subheading: "Gastronomie + art de vivre a prix correct", body: ["TGV Paris en 1h30", "T2 ~650 EUR en centre"] } },
      { imageUrl: cityOg("strasbourg"), altText: "Strasbourg — coût raisonnable #4",
        text: { heading: "#4 STRASBOURG", subheading: "Cher pour la region — loin de Paris", body: ["T2 ~750 EUR — reste accessible", "Frontaliers Allemagne = salaires +"] } },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — coût raisonnable #5",
        text: { heading: "#5 GRENOBLE", subheading: "Montagne accessible, cout maitrise", body: ["T2 ~680 EUR, montagne gratuite", "mavilleideale.fr/classements/cout-vie"] } },
    ],
  },

  // ── SPOTLIGHT ─────────────────────────────────────────────────────────────
  {
    series: "spotlight",
    title: "Spotlight: Annecy",
    caption: `🔦 Annecy — la meilleure ville de France selon nos données

Score global : 8.6/10 — un record.

✅ Nature 9.8/10 : lac, montagne, vélo partout
✅ Sécurité 8.7/10 : l'une des plus sûres de France
✅ Écoles 8.1/10 : idéal pour les familles

⚠️ Mais attention : coût de vie élevé, prix immobilier qui s'emballent

Annecy n'est pas pour tout le monde. Mais si votre budget le permet — difficile de faire mieux.

→ mavilleideale.fr/villes/annecy

#Annecy #HauteSavoie #MeilleureVille #QualitéDeVie #France`,
    slides: [
      { imageUrl: cityOg("annecy"), altText: "Annecy — 8.6/10, meilleure ville de France",
        text: { heading: "ANNECY", subheading: "La meilleure ville de France — 8.6/10", accent: "SPOTLIGHT" } },
      { imageUrl: `${BASE_URL}/villes/annecy/climat/opengraph-image`, altText: "Annecy — nature et lac",
        text: { heading: "NATURE 9.8/10", subheading: "Lac + Alpes + reserve naturelle", body: ["L'un des plus beaux cadres de France", "Velo, kayak, ski — tout a portee"] } },
      { imageUrl: `${BASE_URL}/villes/annecy/transports/opengraph-image`, altText: "Annecy — transports",
        text: { heading: "SECURITE 8.7/10", subheading: "Parmi les plus sures de France", body: ["Ecoles 8.1/10 — ideal familles", "Seul frein : prix immobilier eleve"] } },
      { imageUrl: cityOg("annecy"), altText: "Annecy — pour qui ?",
        text: { heading: "POUR QUI ?", subheading: "Teletravailleur, famille, nature-addict", body: ["Budget logement solide requis", "mavilleideale.fr/villes/annecy"] } },
    ],
  },
  {
    series: "spotlight",
    title: "Spotlight: Rennes",
    caption: `🔦 Rennes — la ville qui fait tout bien sans en faire trop

Score global : 8.2/10

✅ Qualité de vie élevée sans arrogance
✅ Réseau vélo exemplaire : 600 km de pistes
✅ Universités dynamiques, population jeune
✅ TGV Paris-Rennes : 1h25

⚠️ Il pleut. Souvent. Et la pénurie de logements se creuse.

Mais sur le rapport global — Rennes reste l'une des meilleures affaires de France.

→ mavilleideale.fr/villes/rennes

#Rennes #Bretagne #QualitéDeVie #VieEnProvince #VilleFrançaise`,
    slides: [
      { imageUrl: cityOg("rennes"), altText: "Rennes — 8.2/10",
        text: { heading: "RENNES", subheading: "La ville qui fait tout bien — 8.2/10", accent: "SPOTLIGHT" } },
      { imageUrl: `${BASE_URL}/villes/rennes/transports/opengraph-image`, altText: "Rennes — vélo et TGV",
        text: { heading: "VELO & TGV", subheading: "600 km de pistes · Paris en 1h25", body: ["Reseau velo exemplaire en France", "Tram, bus, velo en libre-service"] } },
      { imageUrl: `${BASE_URL}/villes/rennes/ecoles/opengraph-image`, altText: "Rennes — universités et écoles",
        text: { heading: "ETUDIANTS & FAMILLES", subheading: "60 000 etudiants · Ecoles 8.1/10", body: ["Sciences Po, INSA, Universite Rennes 1", "Secteurs scolaires solides"] } },
      { imageUrl: cityOg("rennes"), altText: "Rennes — pour qui ?",
        text: { heading: "POUR QUI ?", subheading: "Jeunes actifs, familles, teletravail", body: ["Il pleut — oui. Mais la qualite de vie compense.", "mavilleideale.fr/villes/rennes"] } },
    ],
  },
  {
    series: "spotlight",
    title: "Spotlight: La Rochelle",
    caption: `🔦 La Rochelle — la petite ville qui score comme une grande

Score global : 7.8/10 — pour 76 000 habitants seulement.

✅ Mer et île de Ré à portée de vélo
✅ Réseau vélo pionnier depuis 30 ans
✅ Douceur atlantique : hivers cléments

⚠️ Marché locatif très tendu
⚠️ Emploi limité hors tourisme/nautisme

Idéale pour les télétravailleurs et les retraités actifs. Moins pour les salariés classiques.

→ mavilleideale.fr/villes/la-rochelle

#LaRochelle #CharenteMaritime #OcéanAtlantique #QualitéDeVie`,
    slides: [
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — 7.8/10",
        text: { heading: "LA ROCHELLE", subheading: "La petite ville qui score comme une grande", accent: "SPOTLIGHT" } },
      { imageUrl: `${BASE_URL}/villes/la-rochelle/climat/opengraph-image`, altText: "La Rochelle — climat atlantique",
        text: { heading: "OCEAN & CLIMAT", subheading: "Hivers clemens · Ete doux · Ile de Re", body: ["Atlantique a 5 min du centre", "270 jours de soleil par an"] } },
      { imageUrl: `${BASE_URL}/villes/la-rochelle/transports/opengraph-image`, altText: "La Rochelle — vélo pionnier",
        text: { heading: "VELO PIONNIER", subheading: "30 ans d'avance sur le reste de la France", body: ["Libre-service velo des 1976", "Centre 100% pedestre et cyclable"] } },
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — pour qui ?",
        text: { heading: "POUR QUI ?", subheading: "Teletravailleur, retraite actif, famille", body: ["Emploi limite hors nautisme/tourisme", "mavilleideale.fr/villes/la-rochelle"] } },
    ],
  },
  {
    series: "spotlight",
    title: "Spotlight: Nantes",
    caption: `🔦 Nantes — la métropole qui a tout compris

Score global : 8.3/10 — 2ᵉ ville de France hors Paris-Lyon.

✅ Transports publics : tram + bus + vélo, l'une des meilleures offres de France
✅ Culture : Machines de l'Île, scène musicale, 60 000 étudiants
✅ Emploi diversifié : tech, santé, industrie
✅ Atlantique à 1h, Loire à l'intérieur

⚠️ Marché locatif tendu, pluie régulière (mais moins qu'on ne croit)

Nantes, c'est la vie métropolitaine sans l'écrasement de Paris.

→ mavilleideale.fr/villes/nantes

#Nantes #LoireAtlantique #QualitéDeVie #Métropole #VieEnFrance`,
    slides: [
      { imageUrl: cityOg("nantes"), altText: "Nantes — 8.3/10",
        text: { heading: "NANTES", subheading: "La metropole qui a tout compris — 8.3/10", accent: "SPOTLIGHT" } },
      { imageUrl: `${BASE_URL}/villes/nantes/transports/opengraph-image`, altText: "Nantes — transports exemplaires",
        text: { heading: "TRANSPORTS", subheading: "Tram + bus + velo — top France", body: ["3 lignes de tram, reseau dense", "Chronovelo : 100 km de pistes protegees"] } },
      { imageUrl: `${BASE_URL}/villes/nantes/ecoles/opengraph-image`, altText: "Nantes — universités et culture",
        text: { heading: "CULTURE & EMPLOI", subheading: "60 000 etudiants · Tech · Sante · Industrie", body: ["Machines de l'Ile, scene musicale", "Emploi diversifie, dynamisme reel"] } },
      { imageUrl: cityOg("nantes"), altText: "Nantes — pour qui ?",
        text: { heading: "POUR QUI ?", subheading: "Cadre, famille, etudiant, createur", body: ["Il pleut — moins qu'on ne croit", "mavilleideale.fr/villes/nantes"] } },
    ],
  },
];

// ─── Upload local file to Facebook CDN ───────────────────────────────────────
// Instagram requires public image URLs. When the site's OG images aren't reachable,
// upload local JPEGs/PNGs to the FB Page Photos (unpublished) to get a stable CDN URL.
async function uploadFileToCDN(filePath) {
  const ext = extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  const buf = readFileSync(filePath);

  const form = new FormData();
  form.append("source", new Blob([buf], { type: mime }), `slide${ext}`);
  form.append("published", "false");
  form.append("access_token", FB_PAGE_TOKEN);

  const upload = await fetch(`https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos`, {
    method: "POST",
    body: form,
  });
  const uploadData = await upload.json();
  if (!upload.ok) throw new Error(`Photo upload failed: ${JSON.stringify(uploadData)}`);

  // Retrieve CDN URL from uploaded photo metadata
  const meta = await fetch(
    `https://graph.facebook.com/v21.0/${uploadData.id}?fields=images&access_token=${FB_PAGE_TOKEN}`
  );
  const metaData = await meta.json();
  const url = metaData.images?.[0]?.source;
  if (!url) throw new Error(`Could not get CDN URL for photo ${uploadData.id}`);
  return url;
}

async function uploadBufferToCDN(buffer) {
  const form = new FormData();
  form.append("source", new Blob([buffer], { type: "image/png" }), "slide.png");
  form.append("published", "false");
  form.append("access_token", FB_PAGE_TOKEN);

  const upload = await fetch(`https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos`, {
    method: "POST",
    body: form,
  });
  const uploadData = await upload.json();
  if (!upload.ok) throw new Error(`Buffer upload failed: ${JSON.stringify(uploadData)}`);

  const meta = await fetch(
    `https://graph.facebook.com/v21.0/${uploadData.id}?fields=images&access_token=${FB_PAGE_TOKEN}`
  );
  const metaData = await meta.json();
  const url = metaData.images?.[0]?.source;
  if (!url) throw new Error(`Could not get CDN URL for photo ${uploadData.id}`);
  return url;
}

// ─── Text overlay on slide image ──────────────────────────────────────────────
// Magazine-style: 1080×1080 square crop, vignette gradient, big outlined heading,
// golden subheading, brand bar at bottom.
// text: { heading, subheading?, body?: string[], accent?: string }

const IG_W = 1080;  // Instagram square — fixes "image doesn't fit" across all slides
const IG_H = 1080;

// Fonts available on this server (librsvg renders them)
const FONT_HEAD = "'Nimbus Sans Narrow', 'Liberation Sans Narrow', 'DejaVu Sans', sans-serif";
const FONT_BODY = "'Nimbus Sans', 'Liberation Sans', 'DejaVu Sans', sans-serif";

function xmlEsc(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function wrapText(str, maxChars) {
  const words = str.split(" ");
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

async function applyTextOverlay(inputPath, text) {
  const { heading, subheading, body = [], accent } = text;

  // Resize to Instagram square (1080×1080), center-crop so nothing is letterboxed
  const imgBuf = await sharp(inputPath)
    .resize(IG_W, IG_H, { fit: "cover", position: "centre" })
    .png()
    .toBuffer();

  const W = IG_W, H = IG_H;
  const PAD = 64;
  const BRAND_BAR = 72;  // solid dark bar at bottom

  // Text sizing — condensed heading at 152px is the hero element
  const HEAD_SIZE = 152;
  const HEAD_LINE = 168;
  const SUB_SIZE  = 76;
  const SUB_LINE  = 90;
  const BODY_SIZE = 56;
  const BODY_LINE = 70;
  const GAP       = 28;
  const ACCENT_H  = accent ? 60 : 0;

  // Narrower wrap since Nimbus Narrow is condensed; adjust for long subheadings
  const headingLines = wrapText(heading,    14);
  const subLines     = subheading ? wrapText(subheading, 22) : [];

  const totalTextH =
    ACCENT_H +
    (accent ? GAP : 0) +
    headingLines.length * HEAD_LINE +
    (subLines.length ? GAP + subLines.length * SUB_LINE : 0) +
    (body.length     ? GAP + 6 + body.length * BODY_LINE : 0);

  // Centre block vertically in the area above the brand bar
  const usableH = H - BRAND_BAR;
  let y = Math.max(PAD + ACCENT_H + 10, Math.round((usableH - totalTextH) / 2));

  const els = [];

  // Accent pill (series tag)
  if (accent) {
    const pillW = accent.length * 22 + 44;
    els.push(`
      <rect x="${PAD}" y="${y}" width="${pillW}" height="52" rx="10" fill="#F97316"/>
      <text x="${PAD + 22}" y="${y + 37}" font-family="${FONT_BODY}" font-size="28"
            font-weight="700" fill="white" letter-spacing="2">${xmlEsc(accent)}</text>`);
    y += 52 + GAP;
  }

  // Heading — white text with heavy black stroke for readability on any photo
  for (const line of headingLines) {
    els.push(`
      <text x="${PAD}" y="${y + HEAD_SIZE}" font-family="${FONT_HEAD}" font-size="${HEAD_SIZE}"
            font-weight="700" fill="white"
            stroke="black" stroke-width="10" paint-order="stroke fill"
            letter-spacing="1">${xmlEsc(line)}</text>`);
    y += HEAD_LINE;
  }

  // Golden subheading
  if (subLines.length) {
    y += GAP;
    for (const line of subLines) {
      els.push(`
        <text x="${PAD}" y="${y + SUB_SIZE}" font-family="${FONT_HEAD}" font-size="${SUB_SIZE}"
              font-weight="700" fill="#FBBF24"
              stroke="black" stroke-width="6" paint-order="stroke fill">${xmlEsc(line)}</text>`);
      y += SUB_LINE;
    }
  }

  // Gold divider + body lines
  if (body.length) {
    y += GAP;
    els.push(`<line x1="${PAD}" y1="${y}" x2="${W - PAD}" y2="${y}"
                    stroke="#FBBF24" stroke-width="3"/>`);
    y += GAP + 6;
    for (const line of body) {
      els.push(`
        <text x="${PAD}" y="${y + BODY_SIZE}" font-family="${FONT_BODY}" font-size="${BODY_SIZE}"
              font-weight="700" fill="white"
              stroke="black" stroke-width="5" paint-order="stroke fill">${xmlEsc(line)}</text>`);
      y += BODY_LINE;
    }
  }

  // Brand bar at bottom
  els.push(`
    <rect x="0" y="${H - BRAND_BAR}" width="${W}" height="${BRAND_BAR}" fill="black" opacity="0.82"/>
    <text x="${W / 2}" y="${H - 20}" font-family="${FONT_BODY}" font-size="32"
          font-weight="700" fill="white" opacity="0.85"
          text-anchor="middle" letter-spacing="3">MAVILLEIDEALE.FR</text>`);

  // Vignette gradient — darker at edges, lets photo show in centre
  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="black" stop-opacity="0.80"/>
        <stop offset="30%"  stop-color="black" stop-opacity="0.42"/>
        <stop offset="70%"  stop-color="black" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="black" stop-opacity="0.80"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#vg)"/>
    ${els.join("\n")}
  </svg>`;

  return sharp(imgBuf)
    .composite([{ input: Buffer.from(svg), blend: "over" }])
    .png()
    .toBuffer();
}

// ─── Queue management ─────────────────────────────────────────────────────────
function readQueue() {
  if (!existsSync(QUEUE_FILE)) return { nextIndex: 0 };
  return JSON.parse(readFileSync(QUEUE_FILE, "utf-8"));
}

function writeQueue(q) {
  writeFileSync(QUEUE_FILE, JSON.stringify(q, null, 2));
}

// ─── Instagram Graph API ──────────────────────────────────────────────────────
async function igPost(path, body) {
  const res = await fetch(`${IG_API}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = text; }
  return { ok: res.ok, status: res.status, data };
}

async function uploadCarouselItem(imageUrl, altText) {
  return igPost(`/${IG_USER_ID}/media`, {
    image_url: imageUrl,
    is_carousel_item: true,
    alt_text: altText,
    access_token: IG_TOKEN,
  });
}

async function createCarouselContainer(childIds, caption) {
  return igPost(`/${IG_USER_ID}/media`, {
    media_type: "CAROUSEL",
    children: childIds.join(","),
    caption,
    access_token: IG_TOKEN,
  });
}

async function publishCarouselWithRetry(containerId, maxAttempts = 12, intervalMs = 5000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const r = await igPost(`/${IG_USER_ID}/media_publish`, {
      creation_id: containerId,
      access_token: IG_TOKEN,
    });
    if (r.ok) return r;
    // 9007 = not ready yet — wait and retry
    const code = r.data?.error?.error_subcode;
    if (code === 2207027 && attempt < maxAttempts) {
      process.stdout.write(`(not ready, retry ${attempt}/${maxAttempts})... `);
      await new Promise((res) => setTimeout(res, intervalMs));
      continue;
    }
    return r; // other error — bubble up
  }
}

// ─── Post a topic ─────────────────────────────────────────────────────────────
// overrideUrls: if provided, replace topic slide image URLs (used with --slides)
async function postTopic(topic, dryRun = false, overrideUrls = null) {
  const slides = topic.slides.map((s, i) => ({
    imageUrl: overrideUrls?.[i] ?? s.imageUrl,
    altText: s.altText,
  }));

  console.log(`\n📸 Carousel: "${topic.title}" [${topic.series}]`);
  console.log(`📝 ${slides.length} slides\n`);

  if (dryRun) {
    console.log("── Slides ──");
    slides.forEach((s, i) => {
      console.log(`  [${i + 1}] ${s.imageUrl}`);
      console.log(`      alt: ${s.altText}`);
    });
    console.log("\n── Caption ──");
    console.log(topic.caption);
    console.log("\n[DRY RUN — nothing posted]");
    return;
  }

  if (!IG_USER_ID || !IG_TOKEN) {
    console.error("❌ IG_USER_ID or FB_PAGE_TOKEN (or IG_ACCESS_TOKEN) not set in .env.local");
    process.exit(1);
  }

  // Upload each slide as a carousel item
  const childIds = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    process.stdout.write(`  Uploading slide ${i + 1}/${slides.length}... `);
    const r = await uploadCarouselItem(slide.imageUrl, slide.altText);
    if (!r.ok) {
      console.error(`\n❌ Slide ${i + 1} upload failed: ${JSON.stringify(r.data)}`);
      process.exit(1);
    }
    console.log(`✅ ${r.data.id}`);
    childIds.push(r.data.id);
    // Instagram rate limit: small pause between uploads
    if (i < slides.length - 1) await new Promise((r) => setTimeout(r, 500));
  }

  // Create carousel container
  process.stdout.write("  Creating carousel container... ");
  const container = await createCarouselContainer(childIds, topic.caption);
  if (!container.ok) {
    console.error(`\n❌ Carousel container failed: ${JSON.stringify(container.data)}`);
    process.exit(1);
  }
  console.log(`✅ ${container.data.id}`);

  // Publish (retries automatically if Instagram is still processing)
  process.stdout.write("  Publishing... ");
  const pub = await publishCarouselWithRetry(container.data.id);
  if (!pub.ok) {
    console.error(`\n❌ Publish failed: ${JSON.stringify(pub.data)}`);
    process.exit(1);
  }
  console.log(`✅ Post ID: ${pub.data.id}`);
  console.log(`\n🎉 "${topic.title}" posted to Instagram!`);
}

// ─── CLI ──────────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);

if (args.includes("--list")) {
  console.log(`\n📋 ${TOPICS.length} topics available:\n`);
  const seriesOrder = ["battle", "red-flags", "top5", "spotlight"];
  for (const series of seriesOrder) {
    const group = TOPICS.filter((t) => t.series === series);
    console.log(`  ── ${series.toUpperCase()} ─────────────────`);
    group.forEach((t) => {
      const idx = TOPICS.indexOf(t);
      console.log(`  [${String(idx).padStart(2, " ")}] ${t.title}`);
    });
    console.log();
  }
  const q = readQueue();
  console.log(`  Next in queue: [${q.nextIndex}] ${TOPICS[q.nextIndex % TOPICS.length].title}\n`);
  process.exit(0);
}

if (args.includes("--preview")) {
  const idx = parseInt(args[args.indexOf("--preview") + 1] ?? "0", 10);
  const topic = TOPICS[idx % TOPICS.length];
  await postTopic(topic, true);
  process.exit(0);
}

if (args.includes("--dry-run")) {
  const idx = parseInt(args[args.indexOf("--dry-run") + 1] ?? "0", 10);
  const topic = TOPICS[idx % TOPICS.length];
  await postTopic(topic, true);
  process.exit(0);
}

if (args.includes("--post")) {
  const idx = parseInt(args[args.indexOf("--post") + 1] ?? "0", 10);
  const topic = TOPICS[idx % TOPICS.length];
  await postTopic(topic, false);
  process.exit(0);
}

if (args.includes("--next")) {
  const q = readQueue();
  const idx = q.nextIndex % TOPICS.length;
  const topic = TOPICS[idx];
  await postTopic(topic, false);
  writeQueue({ nextIndex: idx + 1, lastPosted: topic.title, postedAt: new Date().toISOString() });
  process.exit(0);
}

// --slides <dir> --topic <n>
// Upload local JPEGs from <dir> to FB CDN, then post as Instagram carousel for topic <n>.
// File order: alphabetical (slide-01.jpg, slide-02.jpg, ...).
// Image count overrides topic's default slide count.
if (args.includes("--slides")) {
  const slideDir = args[args.indexOf("--slides") + 1];
  const topicIdx = args.includes("--topic")
    ? parseInt(args[args.indexOf("--topic") + 1], 10)
    : 0;
  const topic = TOPICS[topicIdx % TOPICS.length];
  const dryRun = args.includes("--dry-run");

  if (!slideDir) {
    console.error("❌ --slides requires a directory path");
    process.exit(1);
  }

  const files = readdirSync(slideDir)
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .sort()
    .map((f) => join(slideDir, f));

  if (files.length < 2) {
    console.error(`❌ Need at least 2 image files in ${slideDir}, found ${files.length}`);
    process.exit(1);
  }

  console.log(`\n📂 ${files.length} slides from ${slideDir}`);
  files.forEach((f, i) => console.log(`   [${i + 1}] ${f}`));

  // Pad or trim topic slides to match file count
  const paddedTopic = {
    ...topic,
    slides: files.map((_, i) => topic.slides[i] ?? topic.slides[topic.slides.length - 1]),
  };

  // Apply text overlays to each slide
  const noText = args.includes("--no-text");
  const composited = [];
  if (!noText) {
    console.log("\n  Compositing text overlays...");
    for (let i = 0; i < files.length; i++) {
      const slideText = paddedTopic.slides[i]?.text;
      if (slideText) {
        process.stdout.write(`  Slide ${i + 1}/${files.length}: "${slideText.heading}"... `);
        const buf = await applyTextOverlay(files[i], slideText);
        composited.push(buf);
        console.log("✅");
      } else {
        // No text but still resize to 1080×1080 for consistent carousel sizing
        const buf = await sharp(files[i])
          .resize(IG_W, IG_H, { fit: "cover", position: "centre" })
          .png()
          .toBuffer();
        composited.push(buf);
      }
    }
  }

  let cdnUrls;
  if (dryRun) {
    cdnUrls = files.map((f) => `[local: ${f}]`);
  } else {
    if (!FB_PAGE_ID || !FB_PAGE_TOKEN) {
      console.error("❌ FB_PAGE_ID or FB_PAGE_TOKEN not set — needed to upload images to CDN");
      process.exit(1);
    }
    console.log("\n  Uploading to Facebook CDN...");
    cdnUrls = [];
    for (let i = 0; i < files.length; i++) {
      process.stdout.write(`  File ${i + 1}/${files.length}... `);
      const url = await uploadBufferToCDN(composited[i]);
      console.log("✅");
      cdnUrls.push(url);
    }
  }

  await postTopic(paddedTopic, dryRun, cdnUrls);
  if (!dryRun) {
    const q = readQueue();
    writeQueue({ ...q, lastPosted: topic.title, postedAt: new Date().toISOString() });
  }
  process.exit(0);
}

// Default: show help
console.log(`
Instagram Carousel poster — mavilleideale.fr

Usage:
  node scripts/instagram-carousel.mjs --list                   List all ${TOPICS.length} topics
  node scripts/instagram-carousel.mjs --preview 0              Preview topic 0
  node scripts/instagram-carousel.mjs --post 0                 Post topic 0 (needs live image URLs)
  node scripts/instagram-carousel.mjs --next                   Post next queued topic
  node scripts/instagram-carousel.mjs --slides ./slides/ --topic 0              Upload + text overlay + post
  node scripts/instagram-carousel.mjs --slides ./slides/ --topic 0 --no-text   Upload raw images (no overlay)
  node scripts/instagram-carousel.mjs --slides ./slides/ --topic 0 --dry-run   Preview without posting

Image workflow:
  1. Design slides in Canva / Figma (1080×1080 or 1080×1350), export as JPEG
  2. Name files so they sort correctly: slide-01.jpg, slide-02.jpg, ...
  3. Run: node scripts/instagram-carousel.mjs --slides ./my-slides/ --topic 0

Env vars in .env.local:
  IG_USER_ID        Instagram Business Account ID  (already set)
  FB_PAGE_TOKEN     Facebook Page token            (already set — covers IG when accounts linked)
`);
