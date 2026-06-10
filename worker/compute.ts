/**
 * Compute-heavy API handlers ported from the former Next.js route handlers:
 * quiz match, the Copilot agentic loop, the AI city summary, and the embeddable
 * widget. Anthropic clients are constructed per-request from env (never at
 * module load) so the API key is read after the Worker exposes env vars.
 */
import Anthropic from "@anthropic-ai/sdk";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { getNeighborhoods } from "@/data/neighborhoods";
import { scoreHex } from "@/lib/utils";
import { reserveAiBudget } from "@/lib/ai-budget";
import { isCoastal } from "@/lib/city-match";
import type { QuizAnswers, MatchResult, City } from "@/lib/types";

type Env = { ANTHROPIC_API_KEY?: string; [k: string]: unknown };

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init?.headers ?? {}) },
  });

function seedToCity(s: (typeof CITIES_SEED)[number]): City {
  return {
    id: s.slug, slug: s.slug, name: s.name, region: s.region, department: s.department,
    population: s.population, latitude: s.latitude, longitude: s.longitude,
    scores: s.scores, characterTags: s.characterTags,
    reviewCount: 180 + Math.floor(s.scores.global * 30),
    sunshinedays: s.sunshinedays, avgTempJuly: s.avgTempJuly, avgTempJanuary: s.avgTempJanuary,
  };
}

// ---- quiz -----------------------------------------------------------------

function matchScore(answers: QuizAnswers, city: (typeof CITIES_SEED)[number]): { score: number; topReason: string } {
  const weights: Record<string, number> = {};
  let total = 0;
  let weighted = 0;

  if (answers.environment === "montagne" || answers.environment === "campagne") weights.nature = 2.5;
  else if (answers.environment === "mer") {
    // A "Mer" answer must actually favour the coast — a nature weight alone
    // ranked inland Annecy first. Mirrors city-match's isCoastal heuristic.
    weights.nature = 2.0;
    weighted += (isCoastal(city) ? 9.5 : 3) * 2.0;
    total += 10 * 2.0;
  }
  else if (answers.environment === "ville") { weights.culture = 2.0; weights.transport = 1.5; }
  else { weights.nature = 1.5; weights.cost = 1.5; }

  if (answers.workStyle === "remote" || answers.workStyle === "independant") { weights.remoteWork = 2.5; weights.cost = (weights.cost ?? 1) + 0.5; }
  else if (answers.workStyle === "presentiel") weights.transport = (weights.transport ?? 1) + 1.5;

  if (answers.situation === "famille") { weights.schools = 2.5; weights.safety = 2.0; weights.nature = (weights.nature ?? 1) + 0.5; }
  else if (answers.situation === "retraite") { weights.safety = 2.0; weights.nature = (weights.nature ?? 1) + 1.0; weights.cost = (weights.cost ?? 1) + 1.0; }
  else if (answers.situation === "seul") { weights.culture = (weights.culture ?? 1) + 1.0; weights.transport = (weights.transport ?? 1) + 0.5; }

  const priorityMap: Record<string, keyof typeof city.scores> = {
    transport: "transport", nature: "nature", culture: "culture", ecoles: "schools", prix: "cost", emploi: "remoteWork",
  };
  for (const p of answers.priorities ?? []) {
    const k = priorityMap[p];
    if (k) weights[k] = (weights[k] ?? 1) + 1.5;
  }

  if (answers.climate === "soleil") {
    const sunScore = city.sunshinedays ? Math.min(10, city.sunshinedays / 270) : 7;
    weighted += sunScore * 2.0; total += 10 * 2.0;
  } else if (answers.climate === "montagne") {
    const elevScore = city.elevation ? Math.min(10, city.elevation / 100) : 4;
    weighted += elevScore * 1.5; total += 10 * 1.5; weights.nature = (weights.nature ?? 1) + 1.0;
  } else if (answers.climate === "ocean") {
    const oceanRegions = ["Bretagne", "Pays de la Loire", "Nouvelle-Aquitaine", "Normandie"];
    const oceanScore = oceanRegions.includes(city.region) ? 9 : 5;
    weighted += oceanScore * 1.5; total += 10 * 1.5;
  }

  if (answers.mobilityMode === "transit") weights.transport = (weights.transport ?? 1) + 2.0;
  else if (answers.mobilityMode === "velo" || answers.mobilityMode === "marche") { weights.transport = (weights.transport ?? 1) + 1.5; weights.nature = (weights.nature ?? 1) + 0.5; }
  else if (answers.mobilityMode === "voiture") weights.cost = (weights.cost ?? 1) + 0.5;
  if (answers.transitImportance === "indispensable") weights.transport = (weights.transport ?? 1) + 2.0;
  else if (answers.transitImportance === "important") weights.transport = (weights.transport ?? 1) + 1.0;
  if (answers.bikeImportance === "indispensable") { weights.transport = (weights.transport ?? 1) + 1.0; weights.nature = (weights.nature ?? 1) + 0.5; }
  else if (answers.bikeImportance === "important") weights.transport = (weights.transport ?? 1) + 0.5;
  if (answers.parkingNeed === "facile") weights.cost = (weights.cost ?? 1) + 0.5;
  if (typeof answers.commuteMaxMin === "number" && answers.commuteMaxMin <= 20) weights.transport = (weights.transport ?? 1) + 1.0;

  const budgetScore = answers.budget >= 1500 ? 10 : answers.budget >= 1000 ? city.scores.cost : Math.max(0, city.scores.cost - (1000 - answers.budget) / 100);
  const scoreMap: Record<string, number> = {
    life: city.scores.life, transport: city.scores.transport, nature: city.scores.nature, cost: budgetScore,
    safety: city.scores.safety, culture: city.scores.culture, remoteWork: city.scores.remoteWork, schools: city.scores.schools,
  };
  for (const [key, w] of Object.entries(weights)) { const val = scoreMap[key] ?? 7; weighted += val * w; total += 10 * w; }

  const baseScore = city.scores.global;
  const matchPct = total > 0 ? (weighted / total) * 100 : baseScore * 10;
  const finalPct = matchPct * 0.7 + baseScore * 3;
  const topKey = Object.entries(weights).sort((a, b) => b[1] - a[1])[0]?.[0];
  const reasonMap: Record<string, string> = {
    nature: "Cadre naturel exceptionnel", transport: "Excellent réseau de transport", culture: "Vie culturelle riche",
    schools: "Écoles et éducation", cost: "Coût de la vie attractif", safety: "Sécurité et qualité de vie",
    remoteWork: "Idéal pour le télétravail", life: "Qualité de vie globale",
  };
  return { score: Math.min(98, Math.max(40, finalPct)), topReason: reasonMap[topKey ?? "life"] ?? "Qualité de vie globale" };
}

export async function handleQuiz(request: Request): Promise<Response> {
  try {
    const answers = (await request.json()) as QuizAnswers;
    const scored = CITIES_SEED.map((city) => {
      const { score, topReason } = matchScore(answers, city);
      return { city: seedToCity(city), score, topReason };
    });
    const results: MatchResult[] = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => ({ city: r.city, score: r.score, breakdown: {}, topReason: r.topReason }));
    return json({ results });
  } catch {
    return json({ error: "Erreur quiz" }, { status: 500 });
  }
}

// ---- copilot --------------------------------------------------------------

const COPILOT_SYSTEM = `Tu es le Copilote Déménagement MaVilleIdeal. Tu aides les utilisateurs à choisir leur prochaine ville en France.

Ton rôle :
- Répondre aux questions sur les villes françaises avec des données réelles
- Proposer des recommandations personnalisées basées sur le profil de l'utilisateur
- Être honnête sur les points forts ET les faiblesses de chaque ville
- Utiliser les outils à ta disposition pour récupérer des données précises

Règles :
- Réponds en français
- Sois direct et factuel, sans jargon inutile
- Cite toujours les données chiffrées (scores, loyers, prix) quand tu en as
- Ne dépasse pas 3-4 paragraphes par réponse
- Si l'utilisateur n'a pas précisé son budget ou profil, demande-le
- Propose toujours 2-3 villes concrètes avec des raisons spécifiques`;

const COPILOT_TOOLS: Anthropic.Tool[] = [
  { name: "search_cities", description: "Recherche des villes selon des critères (région, taille, budget, axe de score). Retourne une liste de villes correspondantes.", input_schema: { type: "object" as const, properties: { region: { type: "string" }, min_score: { type: "number" }, max_rent_t2: { type: "number" }, priority_axis: { type: "string", enum: ["nature", "transport", "cost", "safety", "culture", "remoteWork", "schools"] }, limit: { type: "number" } } } },
  { name: "get_city_info", description: "Récupère les informations détaillées d'une ville par son slug.", input_schema: { type: "object" as const, properties: { slug: { type: "string" } }, required: ["slug"] } },
  { name: "compare_cities", description: "Compare 2 ou 3 villes sur tous les axes de score.", input_schema: { type: "object" as const, properties: { slugs: { type: "array", items: { type: "string" } } }, required: ["slugs"] } },
];

function copilotSearch(input: { region?: string; min_score?: number; max_rent_t2?: number; priority_axis?: keyof (typeof CITIES_SEED)[number]["scores"]; limit?: number }) {
  let cities = [...CITIES_SEED];
  if (input.region) { const r = input.region.toLowerCase(); cities = cities.filter((c) => c.region.toLowerCase().includes(r)); }
  if (input.min_score) cities = cities.filter((c) => c.scores.global >= input.min_score!);
  if (input.max_rent_t2) cities = cities.filter((c) => { const h = getHousing(c.slug); return !h || (h.avgRentT2 ?? 9999) <= input.max_rent_t2!; });
  const axis = input.priority_axis ?? "global";
  cities.sort((a, b) => b.scores[axis] - a.scores[axis]);
  cities = cities.slice(0, input.limit ?? 5);
  return cities.map((c) => { const h = getHousing(c.slug); return { slug: c.slug, name: c.name, region: c.region, population: c.population, scores: c.scores, loyer_t2: h?.avgRentT2 ?? null, prix_achat_m2: h?.avgBuyPriceM2 ?? null }; });
}

function copilotCityInfo(slug: string) {
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return { error: `Ville '${slug}' introuvable` };
  const h = getHousing(slug);
  const fisc = city.department && city.region ? fiscalityForCity({ department: city.department, region: city.region }) : null;
  const nb = getNeighborhoods(slug);
  return {
    slug: city.slug, name: city.name, region: city.region, department: city.department, population: city.population, elevation: city.elevation,
    scores: city.scores, tags: city.characterTags,
    climat: { soleil_jours: city.sunshinedays, temp_juillet: city.avgTempJuly, temp_janvier: city.avgTempJanuary },
    logement: h ? { loyer_t1: h.avgRentT1, loyer_t2: h.avgRentT2, loyer_t3: h.avgRentT3, prix_achat_m2: h.avgBuyPriceM2 } : null,
    fiscalite: fisc ? { taxe_fonciere_t3: fisc.taxeFonciereT3, zone_tendue: fisc.zoneTendue } : null,
    quartiers: nb?.map((n) => ({ nom: n.name, type: n.type, summary: n.summary, loyer_t2: n.avgRentT2 })) ?? [],
  };
}

function copilotCompare(slugs: string[]) {
  return slugs.map((slug) => {
    const city = CITIES_SEED.find((c) => c.slug === slug);
    if (!city) return { slug, error: "introuvable" };
    const h = getHousing(slug);
    return { slug, name: city.name, region: city.region, scores: city.scores, loyer_t2: h?.avgRentT2 ?? null, prix_m2: h?.avgBuyPriceM2 ?? null };
  });
}

function copilotRunTool(toolUse: Anthropic.ToolUseBlock): string {
  const input = toolUse.input as Record<string, unknown>;
  try {
    if (toolUse.name === "search_cities") return JSON.stringify(copilotSearch(input as Parameters<typeof copilotSearch>[0]));
    if (toolUse.name === "get_city_info") return JSON.stringify(copilotCityInfo(input.slug as string));
    if (toolUse.name === "compare_cities") return JSON.stringify(copilotCompare(input.slugs as string[]));
    return JSON.stringify({ error: "Outil inconnu" });
  } catch {
    return JSON.stringify({ error: "Erreur lors de l'exécution de l'outil" });
  }
}

export async function handleCopilot(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return json({ reply: "Le copilote IA n'est pas encore disponible. Il fonctionne en production avec la clé API configurée.", fallback: true });
  }
  let messages: Array<{ role: "user" | "assistant"; content: string }>;
  try {
    const body = await request.json();
    messages = (body as { messages: typeof messages }).messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("invalid");
  } catch {
    return json({ error: "messages invalides" }, { status: 400 });
  }

  // The budget caps the NUMBER of calls; without a size cap a single multi-MB
  // turn still inflates input-token cost across the agentic loop.
  const recent = messages.slice(-12);
  if (recent.some((m) => (m.role !== "user" && m.role !== "assistant") || typeof m.content !== "string" || m.content.length > 4000))
    return json({ error: "Message trop long (4000 caractères max)." }, { status: 400 });
  if (recent.reduce((n, m) => n + m.content.length, 0) > 16_000)
    return json({ error: "Conversation trop longue — rechargez la page pour repartir de zéro." }, { status: 400 });

  // Reserve the worst-case agentic-loop cost (up to 4 Claude calls) against the
  // global daily budget AFTER validation, so malformed requests don't burn it.
  // Over budget → graceful message, no Anthropic spend.
  if (!(await reserveAiBudget(4))) {
    return json({ reply: "Le copilote a atteint sa limite quotidienne de requêtes IA. Réessayez demain.", fallback: true });
  }

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const anthropicMessages: Anthropic.MessageParam[] = recent.map((m) => ({ role: m.role, content: m.content }));

  try {
    let iteration = 0;
    while (iteration < 4) {
      iteration++;
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: [{ type: "text", text: COPILOT_SYSTEM, cache_control: { type: "ephemeral" } }],
        tools: COPILOT_TOOLS,
        messages: anthropicMessages,
      });
      if (response.stop_reason === "end_turn") {
        const textBlock = response.content.find((b) => b.type === "text");
        return json({ reply: textBlock?.type === "text" ? textBlock.text : "Je n'ai pas pu générer de réponse." });
      }
      if (response.stop_reason === "tool_use") {
        const toolUses = response.content.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
        anthropicMessages.push({ role: "assistant", content: response.content });
        anthropicMessages.push({
          role: "user",
          content: toolUses.map((tu) => ({ type: "tool_result" as const, tool_use_id: tu.id, content: copilotRunTool(tu) })),
        });
        continue;
      }
      break;
    }
    return json({ reply: "Le copilote n'a pas pu répondre. Reformulez votre question." });
  } catch {
    return json({ reply: "Une erreur technique est survenue. Réessayez dans quelques instants." });
  }
}

// ---- AI city summary ------------------------------------------------------

const SUMMARY_SYSTEM = `Tu es MaVilleIdeal IA, un expert en analyse de qualité de vie urbaine en France.
Tu synthétises les avis d'habitants et les données locales pour produire des résumés objectifs, honnêtes et utiles.
Règles :
- Sois concis : 3–4 phrases max par section
- Cite des exemples concrets tirés des données
- Mentionne les points faibles avec autant de franchise que les points forts
- Écris en français, ton professionnel mais accessible
- Ne dis jamais "je pense" ou "à mon avis" — tu es factuel
- Format : JSON structuré, pas de markdown dans les valeurs`;

function summaryFallback(city: (typeof CITIES_SEED)[number]) {
  const strengths: string[] = [], weaknesses: string[] = [], bestFor: string[] = [], notIdealFor: string[] = [];
  if (city.scores.nature >= 7.5) strengths.push("Cadre naturel exceptionnel et accès à la nature");
  if (city.scores.safety >= 7.5) strengths.push("Excellente sécurité, idéale pour les familles");
  if (city.scores.transport >= 7.5) strengths.push("Réseau de transport performant");
  if (city.scores.culture >= 7.5) strengths.push("Vie culturelle et dynamisme remarquables");
  if (city.scores.remoteWork >= 7.5) strengths.push("Infrastructure idéale pour le télétravail");
  if (strengths.length === 0) strengths.push("Qualité de vie globale satisfaisante");
  if (city.scores.cost < 6.0) weaknesses.push("Coût de la vie et de l'immobilier élevé");
  if (city.scores.transport < 6.0) weaknesses.push("Réseau de transport perfectible");
  if (city.scores.culture < 6.0) weaknesses.push("Offre culturelle et de services limitée");
  if (weaknesses.length === 0) weaknesses.push("Peu de points négatifs notables");
  if (city.scores.schools >= 7.5 && city.scores.safety >= 7.5) bestFor.push("Familles avec enfants");
  if (city.scores.remoteWork >= 7.5) bestFor.push("Télétravailleurs");
  if (city.scores.nature >= 7.5) bestFor.push("Amoureux de la nature");
  if (city.scores.cost >= 7.5) bestFor.push("Profils à budget serré");
  if (city.scores.culture >= 7.5) bestFor.push("Étudiants");
  if (bestFor.length === 0) bestFor.push("Profils variés");
  if (city.scores.cost < 6) notIdealFor.push("Primo-accédants avec petit budget");
  if (city.scores.transport < 6) notIdealFor.push("Sans véhicule personnel");
  if (notIdealFor.length === 0) notIdealFor.push("Peu d'exclusions notables");
  return {
    city: city.slug, strengths: strengths.join(". ") + ".", weaknesses: weaknesses.join(". ") + ".",
    bestFor: bestFor.slice(0, 3), notIdealFor: notIdealFor.slice(0, 2),
    tagline: city.characterTags.slice(0, 3).join(" · "), generatedAt: new Date().toISOString(), fallback: true,
  };
}

export async function handleCitySummary(slug: string, env: Env): Promise<Response> {
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return json({ error: "Ville introuvable" }, { status: 404 });
  if (!env.ANTHROPIC_API_KEY) return json(summaryFallback(city));
  if (!(await reserveAiBudget(1))) return json(summaryFallback(city));

  const h = getHousing(city.slug);
  const cityContext = `
Ville : ${city.name} (${city.department}, ${city.region})
Population : ${city.population?.toLocaleString("fr-FR")} habitants
Altitude : ${city.elevation}m
Ensoleillement : ${Math.round((city.sunshinedays ?? 0) / 9.5)} jours ensoleillés/an
Température juillet : ${city.avgTempJuly}°C, janvier : ${city.avgTempJanuary}°C
Tags caractère : ${city.characterTags.join(", ")}
${h ? `Loyer T1 : ${h.avgRentT1}€/mois, T2 : ${h.avgRentT2}€/mois, T3 : ${h.avgRentT3}€/mois\nPrix achat : ${h.avgBuyPriceM2}€/m²` : ""}

Scores (sur 10) :
- Qualité de vie globale : ${city.scores.global}
- Vie pratique : ${city.scores.life}
- Transports : ${city.scores.transport}
- Nature : ${city.scores.nature}
- Coût de la vie : ${city.scores.cost}
- Sécurité : ${city.scores.safety}
- Culture : ${city.scores.culture}
- Télétravail : ${city.scores.remoteWork}
- Écoles : ${city.scores.schools}
`;
  try {
    const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: [{ type: "text", text: SUMMARY_SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: `Génère un résumé JSON pour cette ville. Données :\n${cityContext}\n\nFormat attendu (JSON strict, aucun texte autour) :\n{"strengths": "phrase 1. phrase 2. phrase 3.", "weaknesses": "phrase 1. phrase 2.", "bestFor": ["profil 1", "profil 2", "profil 3"], "notIdealFor": ["profil A", "profil B"], "tagline": "slogan accrocheur en 8 mots max"}` }],
    });
    const raw = message.content[0].type === "text" ? message.content[0].text : "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const summary = JSON.parse(jsonMatch[0]);
    return json({ city: slug, ...summary, generatedAt: new Date().toISOString(), tokens: message.usage }, { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600" } });
  } catch {
    return json(summaryFallback(city));
  }
}

// ---- embeddable widget ----------------------------------------------------

const WIDGET_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

const WIDGET_STYLE = `*{box-sizing:border-box;margin:0;padding:0}html,body{height:100%}body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:14px;color:#1a2533;background:#fff;line-height:1.4}.w{display:flex;flex-direction:column;height:100%;border:1px solid #e5e7eb;border-radius:14px;padding:14px;overflow:hidden}.h{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.h .l{font-weight:700;font-size:13px}.h .r{font-size:11px;color:#6b7280}.score{font-family:ui-monospace,"SF Mono","Menlo",monospace;font-weight:700;font-size:38px;line-height:1}.tag{font-size:10px;color:#6b7280;text-transform:uppercase;letter-spacing:.05em}.bar{height:6px;background:#f1f5f9;border-radius:3px;overflow:hidden;margin-top:4px}.bar>span{display:block;height:100%}.crit{display:flex;justify-content:space-between;align-items:center;font-size:12px;margin-bottom:6px}.crit:last-child{margin-bottom:0}.crit .lbl{color:#374151}.crit .val{font-family:ui-monospace,"SF Mono","Menlo",monospace;font-weight:700;font-size:12px}.cmp{display:grid;grid-template-columns:1fr 1fr;gap:10px;align-items:center}.cmp .c{text-align:center}.cmp .c .n{font-weight:700;font-size:13px;margin-bottom:4px}.cmp .c .s{font-family:ui-monospace,"SF Mono","Menlo",monospace;font-weight:700;font-size:28px}.f{margin-top:auto;padding-top:10px;border-top:1px solid #f1f5f9;font-size:10px;color:#9ca3af;text-align:center}.f a{color:#16a34a;text-decoration:none;font-weight:600}.f a:hover{text-decoration:underline}`;

function widgetShell(inner: string): string {
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MaVilleIdeal — Widget</title><style>${WIDGET_STYLE}</style></head><body>${inner}</body></html>`;
}

function widgetBadge(slug: string): string {
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return widgetShell(`<div class="w"><p>Ville inconnue.</p></div>`);
  const color = scoreHex(city.scores.global);
  return widgetShell(`<div class="w"><div class="h"><div class="l">${escapeHtml(city.name)}</div><div class="r">${escapeHtml(city.region ?? "")}</div></div><div style="display:flex;align-items:baseline;gap:8px"><div class="score" style="color:${color}">${city.scores.global.toFixed(1)}</div><div class="tag">/10 · qualité de vie</div></div><div class="bar" style="margin-top:10px"><span style="width:${city.scores.global * 10}%;background:${color}"></span></div><div class="f">Source : <a href="${WIDGET_BASE_URL}/villes/${city.slug}" target="_blank" rel="noopener">MaVilleIdeal</a></div></div>`);
}

function widgetCriteres(slug: string): string {
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return widgetShell(`<div class="w"><p>Ville inconnue.</p></div>`);
  const axes: Array<{ key: keyof typeof city.scores; label: string }> = [
    { key: "life", label: "Qualité de vie" }, { key: "transport", label: "Transport" }, { key: "nature", label: "Nature" }, { key: "cost", label: "Coût de vie" },
    { key: "safety", label: "Sécurité" }, { key: "culture", label: "Culture" }, { key: "remoteWork", label: "Télétravail" }, { key: "schools", label: "Écoles" },
  ];
  const top3 = [...axes].sort((a, b) => city.scores[b.key] - city.scores[a.key]).slice(0, 3);
  return widgetShell(`<div class="w"><div class="h"><div class="l">${escapeHtml(city.name)}</div><div class="r">${city.scores.global.toFixed(1)}/10 global</div></div>${top3.map((a) => { const v = city.scores[a.key]; return `<div class="crit"><span class="lbl">${escapeHtml(a.label)}</span><span class="val" style="color:${scoreHex(v)}">${v.toFixed(1)}</span></div><div class="bar" style="margin-bottom:8px"><span style="width:${v * 10}%;background:${scoreHex(v)}"></span></div>`; }).join("")}<div class="f">Données : <a href="${WIDGET_BASE_URL}/villes/${city.slug}" target="_blank" rel="noopener">MaVilleIdeal</a></div></div>`);
}

function widgetCompare(slugA: string, slugB: string): string {
  const a = CITIES_SEED.find((c) => c.slug === slugA);
  const b = CITIES_SEED.find((c) => c.slug === slugB);
  if (!a || !b) return widgetShell(`<div class="w"><p>Une ville est inconnue.</p></div>`);
  const aColor = scoreHex(a.scores.global), bColor = scoreHex(b.scores.global);
  const winner = a.scores.global > b.scores.global ? a : b.scores.global > a.scores.global ? b : null;
  return widgetShell(`<div class="w"><div class="h"><div class="l">Comparaison</div><div class="r">${winner ? `${escapeHtml(winner.name)} l'emporte` : "Égalité"}</div></div><div class="cmp"><div class="c"><div class="n">${escapeHtml(a.name)}</div><div class="s" style="color:${aColor}">${a.scores.global.toFixed(1)}</div><div class="tag">/10</div></div><div class="c"><div class="n">${escapeHtml(b.name)}</div><div class="s" style="color:${bColor}">${b.scores.global.toFixed(1)}</div><div class="tag">/10</div></div></div><div class="f">Comparatif : <a href="${WIDGET_BASE_URL}/comparer/${a.slug}-vs-${b.slug}" target="_blank" rel="noopener">MaVilleIdeal</a></div></div>`);
}

export function handleWidgetEmbed(url: URL): Response {
  const format = url.searchParams.get("format") ?? "badge";
  const city = url.searchParams.get("city") ?? "";
  const city2 = url.searchParams.get("city2") ?? "";
  const body = format === "compare" ? widgetCompare(city, city2) : format === "criteres" ? widgetCriteres(city) : widgetBadge(city);
  return new Response(body, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Security-Policy": "frame-ancestors *",
    },
  });
}
