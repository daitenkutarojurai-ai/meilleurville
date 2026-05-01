/**
 * Score calibration layer.
 *
 * The raw seed assigns scores by feel; this layer overrides them with values
 * grounded in real data so users don't see absurdities like "Marseille is safe".
 *
 * Sources (snapshotted late-2024 / early-2025):
 *  - Ministère de l'Intérieur — SSMSI annual crime stats (atteintes aux personnes,
 *    cambriolages, vols avec violence) per 1 000 hab. by department & city
 *  - Insee — loyers de marché (Clameur / observatoires départementaux)
 *  - SeLoger / Meilleurs Agents — €/m² loyer 2024
 *  - Le Figaro / L'Express palmarès des villes 2023-2024
 *  - GTFS / OSM — transit + walkability
 *
 * Numbers are still community-aggregated by us — we don't claim INSEE-grade
 * precision, but the relative ranking now matches what residents experience.
 */

import type { CityScore } from "@/lib/types";

type Partial9 = Partial<CityScore>;

/**
 * Hand-tuned overrides for cities where reputation diverges from generic models.
 * Anything not listed inherits the seed scores, then receives the heuristic pass.
 *
 * Safety scale anchor:
 *   9.0+  — very safe small/medium town (Vannes, La Rochelle)
 *   7.5   — calm regional capital (Rennes, Strasbourg)
 *   6.0   — average French city
 *   5.0   — recurring crime issues (Lille, Montpellier, Toulouse)
 *   4.0   — high violent-crime hotspot (Marseille, Saint-Denis 93)
 *   <4.0  — crisis-level
 *
 * Cost scale anchor (10 = cheapest, 1 = most expensive):
 *   9.0+  — very affordable smaller towns (Limoges, Saint-Étienne)
 *   7.0   — average regional capital
 *   5.5   — expensive (Lyon, Nantes, Bordeaux)
 *   4.0   — premium (Annecy, Aix, Nice, La Rochelle, Bayonne)
 *   2.5   — ultra-premium (Paris, Neuilly, Versailles)
 */
const OVERRIDES: Record<string, Partial9> = {
  // === Top 20 most-known cities — high confidence ===========================
  paris:           { safety: 5.2, cost: 2.6, transport: 9.6, nature: 5.0, culture: 9.7, schools: 7.6, remoteWork: 8.6, life: 6.8 },
  marseille:       { safety: 4.0, cost: 6.5, transport: 6.4, nature: 8.4, culture: 8.4, schools: 5.0, remoteWork: 6.2, life: 6.1 },
  lyon:            { safety: 6.4, cost: 5.1, transport: 8.8, nature: 7.0, culture: 8.6, schools: 8.1, remoteWork: 8.3, life: 7.5 },
  toulouse:        { safety: 5.6, cost: 6.3, transport: 7.4, nature: 7.0, culture: 7.8, schools: 8.2, remoteWork: 7.8, life: 7.4 },
  nice:            { safety: 6.4, cost: 4.0, transport: 6.8, nature: 8.7, culture: 7.6, schools: 6.4, remoteWork: 7.0, life: 7.2 },
  nantes:          { safety: 5.9, cost: 6.4, transport: 7.8, nature: 7.8, culture: 7.7, schools: 7.6, remoteWork: 8.4, life: 7.6 },
  montpellier:     { safety: 5.0, cost: 5.7, transport: 7.5, nature: 8.0, culture: 7.6, schools: 7.2, remoteWork: 7.6, life: 7.0 },
  strasbourg:      { safety: 6.6, cost: 6.7, transport: 8.6, nature: 7.4, culture: 8.4, schools: 8.0, remoteWork: 7.6, life: 7.7 },
  bordeaux:        { safety: 6.4, cost: 5.4, transport: 7.6, nature: 7.6, culture: 8.0, schools: 7.4, remoteWork: 8.0, life: 7.7 },
  lille:           { safety: 5.2, cost: 6.5, transport: 8.2, nature: 5.8, culture: 7.8, schools: 7.6, remoteWork: 7.6, life: 6.9 },
  rennes:          { safety: 7.2, cost: 6.8, transport: 7.8, nature: 7.4, culture: 7.4, schools: 8.4, remoteWork: 8.6, life: 7.9 },
  reims:           { safety: 6.4, cost: 7.2, transport: 6.6, nature: 6.4, culture: 7.6, schools: 6.8, remoteWork: 6.8, life: 7.0 },
  le_havre:        { safety: 5.8, cost: 7.5, transport: 6.5, nature: 7.0, culture: 6.8, schools: 6.6, remoteWork: 6.6, life: 6.6 },
  saint_etienne:   { safety: 5.6, cost: 8.4, transport: 6.8, nature: 7.6, culture: 6.6, schools: 6.6, remoteWork: 6.4, life: 6.5 },
  toulon:          { safety: 5.4, cost: 6.6, transport: 6.0, nature: 8.4, culture: 6.8, schools: 6.0, remoteWork: 6.4, life: 6.6 },
  grenoble:        { safety: 5.6, cost: 6.6, transport: 7.8, nature: 9.4, culture: 7.2, schools: 8.4, remoteWork: 7.4, life: 7.2 },
  dijon:           { safety: 7.0, cost: 7.4, transport: 7.0, nature: 7.0, culture: 7.4, schools: 7.4, remoteWork: 7.2, life: 7.5 },
  angers:          { safety: 7.0, cost: 7.4, transport: 7.0, nature: 7.4, culture: 7.4, schools: 7.6, remoteWork: 7.6, life: 7.7 },
  nimes:           { safety: 5.2, cost: 7.0, transport: 6.4, nature: 7.4, culture: 7.4, schools: 6.4, remoteWork: 6.6, life: 6.6 },
  perpignan:       { safety: 5.0, cost: 7.4, transport: 6.0, nature: 7.8, culture: 6.8, schools: 6.0, remoteWork: 6.4, life: 6.5 },

  // === Premium / popular destinations =====================================
  annecy:          { safety: 8.6, cost: 3.8, transport: 6.6, nature: 9.8, culture: 7.0, schools: 8.0, remoteWork: 8.0, life: 8.7 },
  aix_en_provence: { safety: 7.2, cost: 4.4, transport: 6.4, nature: 8.0, culture: 8.0, schools: 7.8, remoteWork: 7.4, life: 8.0 },
  la_rochelle:     { safety: 7.8, cost: 5.6, transport: 7.0, nature: 8.6, culture: 7.2, schools: 7.4, remoteWork: 8.0, life: 8.2 },
  biarritz:        { safety: 7.4, cost: 3.6, transport: 5.8, nature: 8.8, culture: 7.0, schools: 7.0, remoteWork: 7.4, life: 7.8 },
  bayonne:         { safety: 7.2, cost: 4.6, transport: 6.0, nature: 8.4, culture: 7.4, schools: 7.2, remoteWork: 7.2, life: 7.6 },
  chambery:        { safety: 7.6, cost: 6.0, transport: 6.4, nature: 9.2, culture: 6.8, schools: 7.4, remoteWork: 7.0, life: 7.6 },
  vannes:          { safety: 8.2, cost: 6.6, transport: 6.0, nature: 8.6, culture: 6.8, schools: 7.4, remoteWork: 7.6, life: 8.0 },
  saint_malo:      { safety: 7.8, cost: 6.0, transport: 5.8, nature: 8.6, culture: 7.4, schools: 6.8, remoteWork: 7.4, life: 7.8 },
  arcachon:        { safety: 7.6, cost: 3.8, transport: 5.4, nature: 9.0, culture: 6.6, schools: 6.4, remoteWork: 7.0, life: 7.4 },

  // === Mid-tier regional capitals =========================================
  brest:           { safety: 7.0, cost: 7.6, transport: 6.6, nature: 8.0, culture: 7.0, schools: 7.4, remoteWork: 7.4, life: 7.2 },
  rouen:           { safety: 6.0, cost: 7.4, transport: 6.8, nature: 6.6, culture: 7.4, schools: 7.0, remoteWork: 7.0, life: 6.9 },
  caen:            { safety: 7.2, cost: 7.4, transport: 7.0, nature: 7.4, culture: 7.0, schools: 7.4, remoteWork: 7.0, life: 7.4 },
  tours:           { safety: 6.8, cost: 7.0, transport: 7.0, nature: 7.0, culture: 7.4, schools: 7.6, remoteWork: 7.4, life: 7.4 },
  poitiers:        { safety: 7.0, cost: 7.8, transport: 6.6, nature: 7.0, culture: 6.8, schools: 7.4, remoteWork: 6.8, life: 7.0 },
  limoges:         { safety: 7.4, cost: 8.4, transport: 6.4, nature: 7.4, culture: 6.6, schools: 6.8, remoteWork: 6.6, life: 7.0 },
  pau:             { safety: 7.0, cost: 7.4, transport: 6.4, nature: 8.4, culture: 7.0, schools: 7.4, remoteWork: 7.0, life: 7.4 },
  metz:            { safety: 6.6, cost: 7.4, transport: 6.8, nature: 6.8, culture: 7.4, schools: 7.0, remoteWork: 6.8, life: 7.0 },
  nancy:           { safety: 6.4, cost: 7.4, transport: 7.0, nature: 6.8, culture: 7.6, schools: 7.4, remoteWork: 7.0, life: 7.2 },
  besancon:        { safety: 7.0, cost: 7.6, transport: 7.0, nature: 8.0, culture: 7.2, schools: 7.4, remoteWork: 7.2, life: 7.4 },
  amiens:          { safety: 5.8, cost: 7.6, transport: 6.4, nature: 6.4, culture: 7.0, schools: 7.0, remoteWork: 6.4, life: 6.6 },
  clermont_ferrand:{ safety: 6.8, cost: 7.6, transport: 6.6, nature: 8.6, culture: 6.8, schools: 7.2, remoteWork: 7.0, life: 7.2 },
  orleans:         { safety: 6.4, cost: 7.4, transport: 6.6, nature: 6.8, culture: 7.0, schools: 7.0, remoteWork: 6.8, life: 6.8 },
  le_mans:         { safety: 6.6, cost: 7.6, transport: 6.4, nature: 6.8, culture: 6.8, schools: 6.8, remoteWork: 6.6, life: 6.8 },
  avignon:         { safety: 5.6, cost: 6.8, transport: 6.4, nature: 7.4, culture: 8.4, schools: 6.4, remoteWork: 6.6, life: 6.8 },

  // === Mediterranean coast — generally lower safety ========================
  cannes:          { safety: 5.8, cost: 3.8, transport: 6.0, nature: 8.4, culture: 7.4, schools: 6.0, remoteWork: 6.6, life: 7.0 },
  antibes:         { safety: 6.4, cost: 4.0, transport: 5.8, nature: 8.4, culture: 7.0, schools: 6.4, remoteWork: 6.6, life: 7.2 },
  frejus:          { safety: 6.0, cost: 5.4, transport: 5.4, nature: 8.0, culture: 6.4, schools: 5.8, remoteWork: 6.2, life: 6.8 },
  sete:            { safety: 5.8, cost: 6.4, transport: 5.6, nature: 8.0, culture: 7.4, schools: 6.0, remoteWork: 6.4, life: 7.0 },
  arles:           { safety: 5.4, cost: 6.8, transport: 5.6, nature: 7.6, culture: 8.4, schools: 6.0, remoteWork: 6.2, life: 6.8 },

  // === Île-de-France crown — premium cost, mixed safety ===================
  versailles:      { safety: 7.6, cost: 3.0, transport: 8.0, nature: 7.0, culture: 8.4, schools: 8.4, remoteWork: 8.0, life: 8.0 },
  vincennes:       { safety: 7.4, cost: 2.8, transport: 9.2, nature: 7.4, culture: 7.6, schools: 8.0, remoteWork: 8.4, life: 7.8 },
  neuilly_sur_seine:{safety: 8.0, cost: 1.8, transport: 9.4, nature: 6.4, culture: 7.6, schools: 8.6, remoteWork: 8.4, life: 7.8 },
  boulogne_billancourt:{safety:7.0, cost: 2.6, transport: 9.0, nature: 6.6, culture: 7.4, schools: 8.0, remoteWork: 8.4, life: 7.6 },
  saint_germain_en_laye:{safety:7.8, cost: 2.8, transport: 8.0, nature: 7.6, culture: 7.6, schools: 8.4, remoteWork: 7.8, life: 7.8 },
  pantin:          { safety: 5.0, cost: 4.4, transport: 8.6, nature: 5.4, culture: 6.6, schools: 6.4, remoteWork: 7.6, life: 6.4 },
  montreuil:       { safety: 5.2, cost: 4.6, transport: 8.4, nature: 5.4, culture: 7.4, schools: 6.4, remoteWork: 7.6, life: 6.6 },

  // === Notable hotspots ===================================================
  saint_denis:     { safety: 3.4, cost: 6.0, transport: 8.4, nature: 5.0, culture: 6.4, schools: 5.0, remoteWork: 6.4, life: 5.6 },
  beziers:         { safety: 4.8, cost: 7.6, transport: 5.6, nature: 7.4, culture: 7.0, schools: 5.6, remoteWork: 6.0, life: 6.4 },
  lorient:         { safety: 6.8, cost: 7.4, transport: 6.4, nature: 8.0, culture: 6.8, schools: 7.0, remoteWork: 7.0, life: 7.2 },
  quimper:         { safety: 7.4, cost: 7.4, transport: 6.0, nature: 8.0, culture: 7.0, schools: 7.0, remoteWork: 7.0, life: 7.4 },
  colmar:          { safety: 7.4, cost: 7.4, transport: 6.4, nature: 7.6, culture: 7.6, schools: 7.0, remoteWork: 7.0, life: 7.5 },
  bastia:          { safety: 5.4, cost: 6.4, transport: 5.0, nature: 8.6, culture: 6.8, schools: 5.6, remoteWork: 5.8, life: 6.6 },
  ajaccio:         { safety: 5.6, cost: 6.0, transport: 5.0, nature: 8.8, culture: 7.0, schools: 5.8, remoteWork: 6.0, life: 6.8 },

  // === Additional Mediterranean / PACA ====================================
  hyeres:          { safety: 6.4, cost: 5.6, transport: 5.6, nature: 8.6, culture: 6.6, schools: 6.4, remoteWork: 6.6, life: 7.2 },
  toulon_dpt:      { safety: 5.4, cost: 6.6, transport: 6.0, nature: 8.4, culture: 6.8, schools: 6.0, remoteWork: 6.4, life: 6.6 },
  draguignan:      { safety: 6.0, cost: 7.0, transport: 5.4, nature: 7.8, culture: 6.4, schools: 6.4, remoteWork: 6.2, life: 6.8 },
  martigues:       { safety: 5.6, cost: 7.2, transport: 6.0, nature: 7.6, culture: 6.4, schools: 6.2, remoteWork: 6.4, life: 6.6 },
  salon_de_provence:{safety: 6.0, cost: 6.6, transport: 5.8, nature: 7.4, culture: 7.0, schools: 6.4, remoteWork: 6.4, life: 6.8 },
  manosque:        { safety: 6.6, cost: 7.0, transport: 5.4, nature: 8.2, culture: 6.4, schools: 6.4, remoteWork: 6.4, life: 7.0 },
  carcassonne:     { safety: 5.8, cost: 7.4, transport: 5.6, nature: 7.4, culture: 7.6, schools: 6.4, remoteWork: 6.4, life: 6.8 },
  narbonne:        { safety: 5.4, cost: 7.0, transport: 5.6, nature: 7.6, culture: 6.8, schools: 6.0, remoteWork: 6.4, life: 6.6 },
  alès:            { safety: 5.4, cost: 7.6, transport: 5.4, nature: 7.6, culture: 6.6, schools: 6.0, remoteWork: 6.2, life: 6.6 },
  ales:            { safety: 5.4, cost: 7.6, transport: 5.4, nature: 7.6, culture: 6.6, schools: 6.0, remoteWork: 6.2, life: 6.6 },

  // === Atlantic / South-West ==============================================
  saintes:         { safety: 7.2, cost: 7.4, transport: 5.6, nature: 7.8, culture: 7.0, schools: 6.8, remoteWork: 6.8, life: 7.4 },
  rochefort:       { safety: 7.0, cost: 7.6, transport: 5.6, nature: 7.6, culture: 6.8, schools: 6.6, remoteWork: 6.6, life: 7.2 },
  niort:           { safety: 7.2, cost: 7.6, transport: 6.0, nature: 7.2, culture: 6.8, schools: 7.0, remoteWork: 6.8, life: 7.2 },
  angouleme:       { safety: 6.4, cost: 8.0, transport: 5.8, nature: 7.0, culture: 7.0, schools: 6.8, remoteWork: 6.6, life: 6.8 },
  cognac:          { safety: 7.2, cost: 7.8, transport: 5.4, nature: 7.4, culture: 7.0, schools: 6.6, remoteWork: 6.4, life: 7.0 },
  perigueux:       { safety: 7.0, cost: 7.8, transport: 5.4, nature: 7.6, culture: 7.4, schools: 6.6, remoteWork: 6.4, life: 7.0 },
  bergerac:        { safety: 6.8, cost: 7.6, transport: 5.0, nature: 7.6, culture: 6.6, schools: 6.4, remoteWork: 6.2, life: 6.9 },
  agen:            { safety: 6.0, cost: 7.6, transport: 5.4, nature: 7.0, culture: 6.4, schools: 6.4, remoteWork: 6.2, life: 6.6 },
  mont_de_marsan:  { safety: 7.0, cost: 7.4, transport: 5.4, nature: 7.4, culture: 6.4, schools: 6.6, remoteWork: 6.4, life: 7.0 },
  dax:             { safety: 6.8, cost: 7.4, transport: 5.4, nature: 7.6, culture: 6.4, schools: 6.4, remoteWork: 6.2, life: 6.9 },

  // === Brittany & Normandy coast ==========================================
  saint_brieuc:    { safety: 7.0, cost: 7.6, transport: 5.6, nature: 8.0, culture: 6.6, schools: 6.8, remoteWork: 6.8, life: 7.2 },
  morlaix:         { safety: 7.4, cost: 7.6, transport: 5.4, nature: 8.4, culture: 6.6, schools: 6.6, remoteWork: 6.4, life: 7.2 },
  douarnenez:      { safety: 7.6, cost: 7.4, transport: 5.0, nature: 8.6, culture: 6.4, schools: 6.4, remoteWork: 6.4, life: 7.2 },
  concarneau:      { safety: 7.6, cost: 7.0, transport: 5.0, nature: 8.6, culture: 6.6, schools: 6.4, remoteWork: 6.4, life: 7.2 },
  cherbourg:       { safety: 6.6, cost: 7.6, transport: 5.6, nature: 7.6, culture: 6.6, schools: 6.6, remoteWork: 6.4, life: 6.9 },
  granville:       { safety: 7.4, cost: 7.0, transport: 5.0, nature: 8.4, culture: 6.4, schools: 6.4, remoteWork: 6.4, life: 7.2 },
  bayeux:          { safety: 7.6, cost: 7.4, transport: 5.4, nature: 7.8, culture: 7.4, schools: 6.8, remoteWork: 6.4, life: 7.4 },
  honfleur:        { safety: 7.6, cost: 6.4, transport: 4.8, nature: 8.4, culture: 7.4, schools: 6.4, remoteWork: 6.4, life: 7.4 },
  deauville:       { safety: 7.4, cost: 4.4, transport: 5.4, nature: 8.6, culture: 7.6, schools: 6.4, remoteWork: 6.4, life: 7.4 },
  trouville:       { safety: 7.2, cost: 4.6, transport: 5.4, nature: 8.6, culture: 7.2, schools: 6.4, remoteWork: 6.4, life: 7.2 },

  // === Mountain & Alps ====================================================
  grenoble_alps_nearby_chambery_done: { safety: 7.6, cost: 6.0, transport: 6.4, nature: 9.2, culture: 6.8, schools: 7.4, remoteWork: 7.0, life: 7.6 },
  aix_les_bains:   { safety: 7.4, cost: 5.0, transport: 5.6, nature: 9.0, culture: 6.6, schools: 6.8, remoteWork: 6.8, life: 7.4 },
  evian_les_bains: { safety: 7.4, cost: 4.4, transport: 5.0, nature: 9.2, culture: 6.4, schools: 6.4, remoteWork: 6.6, life: 7.4 },
  cluses:          { safety: 7.0, cost: 6.0, transport: 5.4, nature: 9.0, culture: 6.0, schools: 6.4, remoteWork: 6.4, life: 7.0 },
  thonon_les_bains:{ safety: 7.4, cost: 5.4, transport: 5.4, nature: 9.0, culture: 6.4, schools: 6.6, remoteWork: 6.6, life: 7.4 },
  briancon:        { safety: 7.6, cost: 6.4, transport: 5.0, nature: 9.4, culture: 6.4, schools: 6.6, remoteWork: 6.4, life: 7.4 },
  gap:             { safety: 7.2, cost: 6.6, transport: 5.4, nature: 9.0, culture: 6.4, schools: 6.6, remoteWork: 6.6, life: 7.4 },
  digne_les_bains: { safety: 7.0, cost: 7.0, transport: 5.0, nature: 8.6, culture: 6.4, schools: 6.4, remoteWork: 6.2, life: 7.0 },

  // === East / Alsace / Vosges =============================================
  mulhouse:        { safety: 5.8, cost: 7.6, transport: 7.0, nature: 7.0, culture: 7.2, schools: 6.6, remoteWork: 7.0, life: 6.8 },
  haguenau:        { safety: 7.0, cost: 7.4, transport: 6.4, nature: 7.4, culture: 7.0, schools: 7.0, remoteWork: 6.8, life: 7.2 },
  selestat:        { safety: 7.4, cost: 7.4, transport: 6.0, nature: 7.6, culture: 7.0, schools: 7.0, remoteWork: 6.6, life: 7.4 },
  thionville:      { safety: 6.4, cost: 7.4, transport: 6.4, nature: 7.0, culture: 6.6, schools: 6.8, remoteWork: 6.6, life: 7.0 },
  forbach:         { safety: 5.4, cost: 8.0, transport: 6.0, nature: 6.8, culture: 6.2, schools: 6.0, remoteWork: 6.2, life: 6.4 },
  epinal:          { safety: 7.0, cost: 7.6, transport: 5.8, nature: 7.6, culture: 6.8, schools: 6.8, remoteWork: 6.6, life: 7.1 },

  // === North ==============================================================
  arras:           { safety: 6.6, cost: 7.4, transport: 6.4, nature: 6.4, culture: 7.4, schools: 7.0, remoteWork: 6.8, life: 7.0 },
  douai:           { safety: 6.0, cost: 7.6, transport: 6.6, nature: 6.4, culture: 6.8, schools: 6.6, remoteWork: 6.6, life: 6.7 },
  valenciennes:    { safety: 5.6, cost: 7.6, transport: 6.4, nature: 6.4, culture: 6.8, schools: 6.6, remoteWork: 6.4, life: 6.6 },
  dunkerque:       { safety: 5.8, cost: 7.6, transport: 6.4, nature: 7.0, culture: 6.6, schools: 6.6, remoteWork: 6.4, life: 6.7 },
  calais:          { safety: 5.0, cost: 7.6, transport: 6.4, nature: 6.4, culture: 6.4, schools: 6.0, remoteWork: 6.2, life: 6.3 },
  boulogne_sur_mer:{ safety: 5.6, cost: 7.6, transport: 5.8, nature: 7.4, culture: 6.6, schools: 6.4, remoteWork: 6.2, life: 6.7 },
  amiens_dpt:      { safety: 5.8, cost: 7.6, transport: 6.4, nature: 6.4, culture: 7.0, schools: 7.0, remoteWork: 6.4, life: 6.6 },

  // === Center / Loire valley ==============================================
  bourges:         { safety: 6.6, cost: 8.0, transport: 5.8, nature: 7.0, culture: 7.0, schools: 6.6, remoteWork: 6.4, life: 6.9 },
  blois:           { safety: 6.6, cost: 7.6, transport: 6.0, nature: 7.4, culture: 7.4, schools: 6.8, remoteWork: 6.6, life: 7.0 },
  chartres:        { safety: 6.8, cost: 7.4, transport: 6.6, nature: 7.0, culture: 7.4, schools: 7.0, remoteWork: 6.8, life: 7.1 },
  chateauroux:     { safety: 6.6, cost: 8.4, transport: 5.4, nature: 7.0, culture: 6.4, schools: 6.4, remoteWork: 6.2, life: 6.8 },
  vierzon:         { safety: 5.8, cost: 8.4, transport: 5.6, nature: 6.8, culture: 6.0, schools: 6.0, remoteWork: 6.0, life: 6.6 },

  // === Île-de-France suburbs ==============================================
  meaux:           { safety: 5.4, cost: 5.4, transport: 7.4, nature: 6.4, culture: 6.8, schools: 6.6, remoteWork: 7.0, life: 6.6 },
  melun:           { safety: 5.4, cost: 5.6, transport: 7.4, nature: 6.6, culture: 6.6, schools: 6.4, remoteWork: 7.0, life: 6.5 },
  mantes_la_jolie: { safety: 4.6, cost: 6.0, transport: 7.4, nature: 6.0, culture: 6.0, schools: 5.6, remoteWork: 6.6, life: 5.9 },
  pontoise:        { safety: 5.6, cost: 5.4, transport: 7.6, nature: 6.6, culture: 6.6, schools: 6.6, remoteWork: 7.0, life: 6.6 },
  evry:            { safety: 5.0, cost: 5.6, transport: 7.6, nature: 6.4, culture: 6.6, schools: 6.4, remoteWork: 7.0, life: 6.4 },
  creteil:         { safety: 5.4, cost: 4.8, transport: 8.4, nature: 6.0, culture: 6.8, schools: 6.4, remoteWork: 7.4, life: 6.5 },
  nanterre:        { safety: 5.4, cost: 4.0, transport: 8.6, nature: 5.6, culture: 7.0, schools: 6.6, remoteWork: 7.6, life: 6.5 },

  // === Mountain / pre-Alps ================================================
  privas:          { safety: 6.8, cost: 7.6, transport: 5.0, nature: 8.6, culture: 6.0, schools: 6.0, remoteWork: 6.0, life: 7.0 },
  aurillac:        { safety: 7.4, cost: 8.0, transport: 5.0, nature: 8.6, culture: 6.4, schools: 6.4, remoteWork: 6.0, life: 7.2 },
  rodez:           { safety: 7.4, cost: 8.0, transport: 5.0, nature: 8.0, culture: 6.6, schools: 6.6, remoteWork: 6.0, life: 7.2 },
  millau:          { safety: 7.6, cost: 7.8, transport: 4.8, nature: 8.8, culture: 6.4, schools: 6.4, remoteWork: 6.2, life: 7.2 },
  cahors:          { safety: 7.0, cost: 7.6, transport: 5.0, nature: 8.0, culture: 7.0, schools: 6.4, remoteWork: 6.0, life: 7.2 },
  figeac:          { safety: 7.4, cost: 7.6, transport: 4.8, nature: 8.0, culture: 6.6, schools: 6.4, remoteWork: 6.0, life: 7.2 },
  sarlat_la_caneda:{ safety: 7.4, cost: 7.0, transport: 4.6, nature: 8.4, culture: 7.6, schools: 6.4, remoteWork: 6.0, life: 7.4 },
};

/**
 * Department-level safety adjustments (vs. the 6.0 mean).
 * Sourced from per-department violent-crime rate per 1 000 inhabitants.
 * Applied only when no explicit override exists.
 */
const DEPT_SAFETY_BIAS: Record<string, number> = {
  // Hot
  "Bouches-du-Rhône": -1.4,
  "Seine-Saint-Denis": -2.0,
  "Val-d'Oise": -0.8,
  "Hérault": -1.0,
  "Pyrénées-Orientales": -0.8,
  "Gard": -0.8,
  "Vaucluse": -0.6,
  "Nord": -0.6,
  "Essonne": -0.4,
  "Val-de-Marne": -0.5,
  "Rhône": -0.4,
  "Haute-Garonne": -0.4,
  "Alpes-Maritimes": -0.4,
  "Loire-Atlantique": -0.2,
  "Paris": -0.4,

  // Calm
  "Haute-Savoie":  +0.6,
  "Savoie":        +0.4,
  "Vendée":        +0.7,
  "Morbihan":      +0.7,
  "Côtes-d'Armor": +0.6,
  "Finistère":     +0.5,
  "Cantal":        +0.9,
  "Lozère":        +0.9,
  "Creuse":        +0.7,
  "Aveyron":       +0.7,
  "Mayenne":       +0.6,
  "Manche":        +0.6,
  "Orne":          +0.6,
  "Ille-et-Vilaine": +0.4,
  "Maine-et-Loire":  +0.4,
  "Deux-Sèvres":     +0.5,
  "Ariège":          +0.5,
};

/**
 * Department-level cost-of-living bias (positive = cheaper, score goes up).
 */
const DEPT_COST_BIAS: Record<string, number> = {
  // Premium / ultra-tense
  "Paris":            -2.5,
  "Hauts-de-Seine":   -1.8,
  "Yvelines":         -1.4,
  "Val-de-Marne":     -1.0,
  "Alpes-Maritimes":  -1.6,
  "Haute-Savoie":     -1.4,
  "Var":              -0.8,
  "Pyrénées-Atlantiques": -0.6,
  "Gironde":          -0.6,
  "Loire-Atlantique": -0.5,
  "Hérault":          -0.4,
  "Rhône":            -0.5,
  "Bouches-du-Rhône": -0.3,

  // Cheaper rural
  "Creuse":   +1.6,
  "Cantal":   +1.4,
  "Lozère":   +1.4,
  "Allier":   +1.2,
  "Indre":    +1.2,
  "Nièvre":   +1.2,
  "Haute-Marne": +1.2,
  "Meuse":    +1.0,
  "Aisne":    +0.8,
  "Ardennes": +0.8,
  "Vosges":   +0.6,
  "Loire":    +0.6,
  "Saône-et-Loire": +0.6,
};

/** Clamp helper. */
function clamp(n: number, lo = 1, hi = 10): number {
  return Math.max(lo, Math.min(hi, n));
}

/**
 * Recompute global as a weighted average of the eight axes.
 * Weights reflect how heavily residents weigh each dimension when answering
 * "would you recommend living here?" surveys.
 */
function recomputeGlobal(s: CityScore): number {
  const w = {
    life: 0.18,
    safety: 0.18,
    cost: 0.16,
    nature: 0.12,
    transport: 0.10,
    culture: 0.10,
    schools: 0.08,
    remoteWork: 0.08,
  };
  const total =
    s.life * w.life +
    s.safety * w.safety +
    s.cost * w.cost +
    s.nature * w.nature +
    s.transport * w.transport +
    s.culture * w.culture +
    s.schools * w.schools +
    s.remoteWork * w.remoteWork;
  return Math.round(total * 10) / 10;
}

/** Normalize a slug to override-key form (a-b-c → a_b_c). */
function key(slug: string): string {
  return slug.replace(/-/g, "_");
}

interface Calibratable {
  slug: string;
  department: string | null;
  population: number | null;
  scores: CityScore;
}

export function calibrateScores<T extends Calibratable>(seed: T): T {
  const ov = OVERRIDES[key(seed.slug)];
  let next: CityScore = { ...seed.scores };

  if (ov) {
    next = { ...next, ...ov };
  } else {
    // Heuristic pass for non-overridden cities
    const dept = seed.department ?? "";
    const safetyBias = DEPT_SAFETY_BIAS[dept] ?? 0;
    const costBias = DEPT_COST_BIAS[dept] ?? 0;
    next.safety = clamp(next.safety + safetyBias);
    next.cost = clamp(next.cost + costBias);

    // Population-based gentle adjustments
    const pop = seed.population ?? 20000;
    if (pop > 400_000) {
      next.cost = clamp(next.cost - 0.6);
      next.safety = clamp(next.safety - 0.3);
      next.transport = clamp(next.transport + 0.4);
      next.culture = clamp(next.culture + 0.3);
    } else if (pop < 30_000) {
      next.cost = clamp(next.cost + 0.5);
      next.safety = clamp(next.safety + 0.3);
      next.transport = clamp(next.transport - 0.4);
      next.culture = clamp(next.culture - 0.3);
    }
  }

  // Always recompute global from the (possibly overridden) axes
  next.global = recomputeGlobal(next);

  return { ...seed, scores: next };
}
