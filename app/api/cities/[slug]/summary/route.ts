import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CITIES_SEED } from "@/data/cities-seed";
import { getHousing } from "@/data/housing";

export const runtime = "edge";

const client = new Anthropic();

// Prompt-cached system context — shared across all city requests
const SYSTEM_PROMPT = `Tu es MeilleurVille IA, un expert en analyse de qualité de vie urbaine en France.
Tu synthétises les avis d'habitants et les données locales pour produire des résumés objectifs, honnêtes et utiles.
Règles :
- Sois concis : 3–4 phrases max par section
- Cite des exemples concrets tirés des données
- Mentionne les points faibles avec autant de franchise que les points forts
- Écris en français, ton professionnel mais accessible
- Ne dis jamais "je pense" ou "à mon avis" — tu es factuel
- Format : JSON structuré, pas de markdown dans les valeurs`;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const city = CITIES_SEED.find((c) => c.slug === slug);

  if (!city) {
    return new Response(JSON.stringify({ error: "Ville introuvable" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const housing = getHousing(city.slug);
  const cityContext = `
Ville : ${city.name} (${city.department}, ${city.region})
Population : ${city.population?.toLocaleString("fr-FR")} habitants
Altitude : ${city.elevation}m
Ensoleillement : ${city.sunshinedays} heures/an
Température juillet : ${city.avgTempJuly}°C, janvier : ${city.avgTempJanuary}°C
Tags caractère : ${city.characterTags.join(", ")}
${housing ? `Loyer T1 : ${housing.avgRentT1}€/mois, T2 : ${housing.avgRentT2}€/mois, T3 : ${housing.avgRentT3}€/mois
Prix achat : ${housing.avgBuyPriceM2}€/m²` : ""}

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
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          // Prompt caching — system prompt cached across all requests
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Génère un résumé JSON pour cette ville. Données :\n${cityContext}\n\nFormat attendu (JSON strict, aucun texte autour) :\n{"strengths": "phrase 1. phrase 2. phrase 3.", "weaknesses": "phrase 1. phrase 2.", "bestFor": ["profil 1", "profil 2", "profil 3"], "notIdealFor": ["profil A", "profil B"], "tagline": "slogan accrocheur en 8 mots max"}`,
        },
      ],
    });

    const raw =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");

    const summary = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        city: slug,
        ...summary,
        generatedAt: new Date().toISOString(),
        tokens: message.usage,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (err) {
    // Deterministic fallback if Claude is unavailable
    const fallback = buildFallback(city);
    return new Response(JSON.stringify(fallback), {
      headers: { "Content-Type": "application/json" },
    });
  }
}

function buildFallback(city: (typeof CITIES_SEED)[number]) {
  const strengths = [];
  const weaknesses = [];
  const bestFor: string[] = [];
  const notIdealFor: string[] = [];

  if (city.scores.nature >= 8) strengths.push("Cadre naturel exceptionnel et accès à la nature");
  if (city.scores.safety >= 8) strengths.push("Excellente sécurité, idéale pour les familles");
  if (city.scores.transport >= 8) strengths.push("Réseau de transport performant");
  if (city.scores.culture >= 8) strengths.push("Vie culturelle et dynamisme remarquables");
  if (city.scores.remoteWork >= 8) strengths.push("Infrastructure idéale pour le télétravail");
  if (strengths.length === 0) strengths.push("Qualité de vie globale satisfaisante");

  if (city.scores.cost < 6.5) weaknesses.push("Coût de la vie et de l'immobilier élevé");
  if (city.scores.transport < 6.5) weaknesses.push("Réseau de transport perfectible");
  if (city.scores.culture < 6.5) weaknesses.push("Offre culturelle et de services limitée");
  if (weaknesses.length === 0) weaknesses.push("Peu de points négatifs notables");

  if (city.scores.schools >= 7.5 && city.scores.safety >= 7.5) bestFor.push("Familles avec enfants");
  if (city.scores.remoteWork >= 7.5) bestFor.push("Télétravailleurs");
  if (city.scores.nature >= 8) bestFor.push("Amoureux de la nature");
  if (city.scores.cost >= 7.5) bestFor.push("Profils à budget serré");
  if (city.scores.culture >= 8) bestFor.push("Étudiants");
  if (bestFor.length === 0) bestFor.push("Profils variés");

  if (city.scores.cost < 6) notIdealFor.push("Primo-accédants avec petit budget");
  if (city.scores.transport < 6) notIdealFor.push("Sans véhicule personnel");
  if (notIdealFor.length === 0) notIdealFor.push("Peu d'exclusions notables");

  return {
    city: city.slug,
    strengths: strengths.join(". ") + ".",
    weaknesses: weaknesses.join(". ") + ".",
    bestFor: bestFor.slice(0, 3),
    notIdealFor: notIdealFor.slice(0, 2),
    tagline: city.characterTags.slice(0, 3).join(" · "),
    generatedAt: new Date().toISOString(),
    fallback: true,
  };
}
