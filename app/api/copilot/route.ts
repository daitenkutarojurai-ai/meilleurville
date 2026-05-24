import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";
import { fiscalityForCity } from "@/lib/fiscalite";
import { getNeighborhoods } from "@/data/neighborhoods";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const client = new Anthropic();

const SYSTEM_PROMPT = `Tu es le Copilote Déménagement MaVilleIdeal. Tu aides les utilisateurs à choisir leur prochaine ville en France.

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

type CityTool = Anthropic.ToolUseBlock & { input: Record<string, unknown> };

const TOOLS: Anthropic.Tool[] = [
  {
    name: "search_cities",
    description: "Recherche des villes selon des critères (région, taille, budget, axe de score). Retourne une liste de villes correspondantes.",
    input_schema: {
      type: "object" as const,
      properties: {
        region: { type: "string", description: "Région française (ex: Bretagne, Occitanie)" },
        min_score: { type: "number", description: "Score global minimum (0-10)" },
        max_rent_t2: { type: "number", description: "Loyer T2 max en €/mois" },
        priority_axis: {
          type: "string",
          enum: ["nature", "transport", "cost", "safety", "culture", "remoteWork", "schools"],
          description: "Axe à privilégier dans le classement"
        },
        limit: { type: "number", description: "Nombre de résultats max (défaut 5)" },
      },
    },
  },
  {
    name: "get_city_info",
    description: "Récupère les informations détaillées d'une ville par son slug (ex: lyon, bordeaux, annecy).",
    input_schema: {
      type: "object" as const,
      properties: {
        slug: { type: "string", description: "Slug de la ville (ex: lyon, bordeaux, annecy)" },
      },
      required: ["slug"],
    },
  },
  {
    name: "compare_cities",
    description: "Compare 2 ou 3 villes sur tous les axes de score. Utile pour trancher entre plusieurs options.",
    input_schema: {
      type: "object" as const,
      properties: {
        slugs: {
          type: "array",
          items: { type: "string" },
          description: "Liste de 2-3 slugs de villes à comparer",
        },
      },
      required: ["slugs"],
    },
  },
];

function searchCities(input: {
  region?: string;
  min_score?: number;
  max_rent_t2?: number;
  priority_axis?: keyof (typeof CITIES_SEED)[number]["scores"];
  limit?: number;
}) {
  let cities = [...CITIES_SEED];

  if (input.region) {
    const r = input.region.toLowerCase();
    cities = cities.filter((c) => c.region.toLowerCase().includes(r));
  }
  if (input.min_score) {
    cities = cities.filter((c) => c.scores.global >= input.min_score!);
  }
  if (input.max_rent_t2) {
    cities = cities.filter((c) => {
      const h = getHousing(c.slug);
      return !h || (h.avgRentT2 ?? 9999) <= input.max_rent_t2!;
    });
  }

  const axis = input.priority_axis ?? "global";
  cities.sort((a, b) => b.scores[axis] - a.scores[axis]);
  cities = cities.slice(0, input.limit ?? 5);

  return cities.map((c) => {
    const h = getHousing(c.slug);
    return {
      slug: c.slug,
      name: c.name,
      region: c.region,
      population: c.population,
      scores: c.scores,
      loyer_t2: h?.avgRentT2 ?? null,
      prix_achat_m2: h?.avgBuyPriceM2 ?? null,
    };
  });
}

function getCityInfo(slug: string) {
  const city = CITIES_SEED.find((c) => c.slug === slug);
  if (!city) return { error: `Ville '${slug}' introuvable` };

  const h = getHousing(slug);
  const fisc =
    city.department && city.region
      ? fiscalityForCity({ department: city.department, region: city.region })
      : null;
  const nb = getNeighborhoods(slug);

  return {
    slug: city.slug,
    name: city.name,
    region: city.region,
    department: city.department,
    population: city.population,
    elevation: city.elevation,
    scores: city.scores,
    tags: city.characterTags,
    climat: {
      soleil_jours: city.sunshinedays,
      temp_juillet: city.avgTempJuly,
      temp_janvier: city.avgTempJanuary,
    },
    logement: h
      ? {
          loyer_t1: h.avgRentT1,
          loyer_t2: h.avgRentT2,
          loyer_t3: h.avgRentT3,
          prix_achat_m2: h.avgBuyPriceM2,
        }
      : null,
    fiscalite: fisc
      ? {
          taxe_fonciere_t3: fisc.taxeFonciereT3,
          zone_tendue: fisc.zoneTendue,
        }
      : null,
    quartiers: nb?.map((n) => ({ nom: n.name, type: n.type, summary: n.summary, loyer_t2: n.avgRentT2 })) ?? [],
  };
}

function compareCities(slugs: string[]) {
  return slugs.map((slug) => {
    const city = CITIES_SEED.find((c) => c.slug === slug);
    if (!city) return { slug, error: "introuvable" };
    const h = getHousing(slug);
    return {
      slug,
      name: city.name,
      region: city.region,
      scores: city.scores,
      loyer_t2: h?.avgRentT2 ?? null,
      prix_m2: h?.avgBuyPriceM2 ?? null,
    };
  });
}

function runTool(toolUse: CityTool): string {
  const input = toolUse.input as Record<string, unknown>;
  try {
    if (toolUse.name === "search_cities") {
      return JSON.stringify(searchCities(input as Parameters<typeof searchCities>[0]));
    }
    if (toolUse.name === "get_city_info") {
      return JSON.stringify(getCityInfo(input.slug as string));
    }
    if (toolUse.name === "compare_cities") {
      return JSON.stringify(compareCities(input.slugs as string[]));
    }
    return JSON.stringify({ error: "Outil inconnu" });
  } catch {
    return JSON.stringify({ error: "Erreur lors de l'exécution de l'outil" });
  }
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        reply:
          "Le copilote IA n'est pas encore disponible en mode local. Il fonctionne en production avec la clé API configurée.",
        fallback: true,
      },
      { status: 200 },
    );
  }

  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = body.messages;
    if (!Array.isArray(messages) || messages.length === 0) throw new Error("invalid");
  } catch {
    return NextResponse.json({ error: "messages invalides" }, { status: 400 });
  }

  // Limit conversation history
  const history = messages.slice(-12);

  const anthropicMessages: Anthropic.MessageParam[] = history.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  try {
    // Agentic loop: run until we get a text response (max 4 tool-use iterations)
    let iteration = 0;
    while (iteration < 4) {
      iteration++;
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: [
          {
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          },
        ],
        tools: TOOLS,
        messages: anthropicMessages,
      });

      if (response.stop_reason === "end_turn") {
        const textBlock = response.content.find((b) => b.type === "text");
        const reply = textBlock?.type === "text" ? textBlock.text : "Je n'ai pas pu générer de réponse.";
        return NextResponse.json({ reply });
      }

      if (response.stop_reason === "tool_use") {
        const toolUses = response.content.filter(
          (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
        ) as CityTool[];

        // Append assistant turn
        anthropicMessages.push({ role: "assistant", content: response.content });

        // Execute tools and append results
        const toolResults: Anthropic.ToolResultBlockParam[] = toolUses.map((tu) => ({
          type: "tool_result" as const,
          tool_use_id: tu.id,
          content: runTool(tu),
        }));
        anthropicMessages.push({ role: "user", content: toolResults });
        continue;
      }

      // Unexpected stop reason
      break;
    }

    return NextResponse.json({ reply: "Le copilote n'a pas pu répondre. Reformulez votre question." });
  } catch {
    return NextResponse.json(
      { reply: "Une erreur technique est survenue. Réessayez dans quelques instants." },
      { status: 200 },
    );
  }
}
