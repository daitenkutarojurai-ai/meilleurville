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
      { imageUrl: comparerOg("lyon", "bordeaux"), altText: "Lyon vs Bordeaux — comparatif qualité de vie" },
      { imageUrl: cityOg("lyon"), altText: "Lyon — score 8.0/10" },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — score 8.1/10" },
      { imageUrl: comparerOg("lyon", "bordeaux"), altText: "Verdict : Lyon ou Bordeaux ?" },
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
      { imageUrl: comparerOg("nantes", "rennes"), altText: "Nantes vs Rennes — comparatif" },
      { imageUrl: cityOg("nantes"), altText: "Nantes — score 8.3/10" },
      { imageUrl: cityOg("rennes"), altText: "Rennes — score 8.2/10" },
      { imageUrl: comparerOg("nantes", "rennes"), altText: "Verdict : Nantes ou Rennes ?" },
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
      { imageUrl: comparerOg("marseille", "nice"), altText: "Marseille vs Nice — comparatif" },
      { imageUrl: cityOg("marseille"), altText: "Marseille — score 7.0/10" },
      { imageUrl: cityOg("nice"), altText: "Nice — score 7.8/10" },
      { imageUrl: comparerOg("marseille", "nice"), altText: "Verdict : Marseille ou Nice ?" },
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
      { imageUrl: comparerOg("toulouse", "montpellier"), altText: "Toulouse vs Montpellier — comparatif" },
      { imageUrl: cityOg("toulouse"), altText: "Toulouse — score 7.8/10" },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — score 7.9/10" },
      { imageUrl: comparerOg("toulouse", "montpellier"), altText: "Verdict : Toulouse ou Montpellier ?" },
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
      { imageUrl: comparerOg("annecy", "grenoble"), altText: "Annecy vs Grenoble — comparatif" },
      { imageUrl: cityOg("annecy"), altText: "Annecy — score 8.6/10" },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — score 7.7/10" },
      { imageUrl: comparerOg("annecy", "grenoble"), altText: "Verdict : Annecy ou Grenoble ?" },
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
      { imageUrl: comparerOg("strasbourg", "nancy"), altText: "Strasbourg vs Nancy — comparatif" },
      { imageUrl: cityOg("strasbourg"), altText: "Strasbourg — score 8.0/10" },
      { imageUrl: cityOg("nancy"), altText: "Nancy — score 7.5/10" },
      { imageUrl: comparerOg("strasbourg", "nancy"), altText: "Verdict : Strasbourg ou Nancy ?" },
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
      { imageUrl: comparerOg("la-rochelle", "nantes"), altText: "La Rochelle vs Nantes — comparatif" },
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — score 7.8/10" },
      { imageUrl: cityOg("nantes"), altText: "Nantes — score 8.3/10" },
      { imageUrl: comparerOg("la-rochelle", "nantes"), altText: "Verdict : La Rochelle ou Nantes ?" },
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
      { imageUrl: comparerOg("paris", "lyon"), altText: "Paris vs Lyon — comparatif" },
      { imageUrl: cityOg("paris"), altText: "Paris — score 6.8/10" },
      { imageUrl: cityOg("lyon"), altText: "Lyon — score 8.0/10" },
      { imageUrl: comparerOg("paris", "lyon"), altText: "Verdict : Paris ou Lyon ?" },
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
      { imageUrl: cityOg("marseille"), altText: "Red flags de Marseille" },
      { imageUrl: cityOg("marseille"), altText: "Marseille — sécurité" },
      { imageUrl: cityOg("marseille"), altText: "Marseille — transports" },
      { imageUrl: cityOg("marseille"), altText: "Marseille — inégalités" },
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
      { imageUrl: cityOg("bordeaux"), altText: "Red flags de Bordeaux" },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — prix immobilier" },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — embouteillages" },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — canicules" },
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
      { imageUrl: cityOg("montpellier"), altText: "Red flags de Montpellier" },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — sécurité" },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — marché locatif" },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — infrastructure" },
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
      { imageUrl: cityOg("nice"), altText: "Red flags de Nice" },
      { imageUrl: cityOg("nice"), altText: "Nice — coût de vie" },
      { imageUrl: cityOg("nice"), altText: "Nice — trafic" },
      { imageUrl: cityOg("nice"), altText: "Nice — logement" },
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
      { imageUrl: cityOg("grenoble"), altText: "Red flags de Grenoble" },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — pollution" },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — sécurité" },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — météo" },
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
      { imageUrl: classementOg("teletravail"), altText: "Top 5 villes pour le télétravail" },
      { imageUrl: cityOg("annecy"), altText: "Annecy — #1 télétravail" },
      { imageUrl: cityOg("rennes"), altText: "Rennes — #2 télétravail" },
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — #3 télétravail" },
      { imageUrl: cityOg("nantes"), altText: "Nantes — #4 télétravail" },
      { imageUrl: cityOg("bordeaux"), altText: "Bordeaux — #5 télétravail" },
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
      { imageUrl: classementOg("nature"), altText: "Top 5 villes pour la nature" },
      { imageUrl: cityOg("annecy"), altText: "Annecy — nature 9.8/10" },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — nature et Alpes" },
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — océan + île" },
      { imageUrl: cityOg("rennes"), altText: "Rennes — Bretagne verdoyante" },
      { imageUrl: cityOg("nantes"), altText: "Nantes — Loire et bocage" },
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
      { imageUrl: classementOg("securite"), altText: "Top 5 villes les plus sûres" },
      { imageUrl: cityOg("annecy"), altText: "Annecy — sécurité #1" },
      { imageUrl: cityOg("rennes"), altText: "Rennes — sécurité #2" },
      { imageUrl: cityOg("strasbourg"), altText: "Strasbourg — sécurité #3" },
      { imageUrl: cityOg("nantes"), altText: "Nantes — sécurité #4" },
      { imageUrl: cityOg("dijon"), altText: "Dijon — sécurité #5" },
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
      { imageUrl: classementOg("etudiants"), altText: "Top 5 villes étudiantes" },
      { imageUrl: cityOg("rennes"), altText: "Rennes — #1 étudiants" },
      { imageUrl: cityOg("montpellier"), altText: "Montpellier — #2 étudiants" },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — #3 étudiants" },
      { imageUrl: cityOg("nancy"), altText: "Nancy — #4 étudiants" },
      { imageUrl: cityOg("toulouse"), altText: "Toulouse — #5 étudiants" },
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
      { imageUrl: classementOg("cout-vie"), altText: "Top 5 villes les moins chères" },
      { imageUrl: cityOg("nancy"), altText: "Nancy — coût bas #1" },
      { imageUrl: cityOg("clermont"), altText: "Clermont-Ferrand — coût bas #2" },
      { imageUrl: cityOg("dijon"), altText: "Dijon — coût bas #3" },
      { imageUrl: cityOg("strasbourg"), altText: "Strasbourg — coût raisonnable #4" },
      { imageUrl: cityOg("grenoble"), altText: "Grenoble — coût raisonnable #5" },
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
      { imageUrl: cityOg("annecy"), altText: "Annecy — 8.6/10, meilleure ville de France" },
      { imageUrl: `${BASE_URL}/villes/annecy/climat/opengraph-image`, altText: "Annecy — nature et lac" },
      { imageUrl: `${BASE_URL}/villes/annecy/transports/opengraph-image`, altText: "Annecy — transports" },
      { imageUrl: cityOg("annecy"), altText: "Annecy — pour qui ?" },
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
      { imageUrl: cityOg("rennes"), altText: "Rennes — 8.2/10" },
      { imageUrl: `${BASE_URL}/villes/rennes/transports/opengraph-image`, altText: "Rennes — vélo et TGV" },
      { imageUrl: `${BASE_URL}/villes/rennes/ecoles/opengraph-image`, altText: "Rennes — universités et écoles" },
      { imageUrl: cityOg("rennes"), altText: "Rennes — pour qui ?" },
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
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — 7.8/10" },
      { imageUrl: `${BASE_URL}/villes/la-rochelle/climat/opengraph-image`, altText: "La Rochelle — climat atlantique" },
      { imageUrl: `${BASE_URL}/villes/la-rochelle/transports/opengraph-image`, altText: "La Rochelle — vélo pionnier" },
      { imageUrl: cityOg("la-rochelle"), altText: "La Rochelle — pour qui ?" },
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
      { imageUrl: cityOg("nantes"), altText: "Nantes — 8.3/10" },
      { imageUrl: `${BASE_URL}/villes/nantes/transports/opengraph-image`, altText: "Nantes — transports exemplaires" },
      { imageUrl: `${BASE_URL}/villes/nantes/ecoles/opengraph-image`, altText: "Nantes — universités et culture" },
      { imageUrl: cityOg("nantes"), altText: "Nantes — pour qui ?" },
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

async function publishCarousel(containerId) {
  return igPost(`/${IG_USER_ID}/media_publish`, {
    creation_id: containerId,
    access_token: IG_TOKEN,
  });
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

  // Publish
  process.stdout.write("  Publishing... ");
  const pub = await publishCarousel(container.data.id);
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
      process.stdout.write(`  File ${i + 1}/${files.length}: ${files[i]}... `);
      const url = await uploadFileToCDN(files[i]);
      console.log(`✅`);
      cdnUrls.push(url);
    }
  }

  // Pad or trim topic slides to match file count
  const paddedTopic = {
    ...topic,
    slides: files.map((_, i) => topic.slides[i] ?? topic.slides[topic.slides.length - 1]),
  };

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
  node scripts/instagram-carousel.mjs --slides ./slides/ --topic 0   Upload local JPEGs + post
  node scripts/instagram-carousel.mjs --slides ./slides/ --topic 0 --dry-run   Preview only

Image workflow:
  1. Design slides in Canva / Figma (1080×1080 or 1080×1350), export as JPEG
  2. Name files so they sort correctly: slide-01.jpg, slide-02.jpg, ...
  3. Run: node scripts/instagram-carousel.mjs --slides ./my-slides/ --topic 0

Env vars in .env.local:
  IG_USER_ID        Instagram Business Account ID  (already set)
  FB_PAGE_TOKEN     Facebook Page token            (already set — covers IG when accounts linked)
`);
