import { NextRequest, NextResponse } from "next/server";
import { CITIES_SEED } from "@/data/cities-seed";
import { listComments } from "@/lib/comments-store";
import { addAlerte, findActiveByEmailAndCity } from "@/lib/alertes-store";
import { sendBrevoEmail } from "@/lib/brevo";
import { rateLimit } from "@/lib/rate-limit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isFrLocale(req: NextRequest): boolean {
  const referer = req.headers.get("referer") ?? "";
  return !referer.includes("bestcitiesinfrance");
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = rateLimit(`alerte:${ip}`, 5, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide." }, { status: 400 });
  }

  const { email, citySlug, types, scoreThreshold } = body as {
    email?: string;
    citySlug?: string;
    types?: string[];
    scoreThreshold?: number;
  };

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (!citySlug) {
    return NextResponse.json({ error: "Ville manquante." }, { status: 400 });
  }

  const city = CITIES_SEED.find((c) => c.slug === citySlug);
  if (!city) {
    return NextResponse.json({ error: "Ville introuvable." }, { status: 400 });
  }

  const watchTypes = (types ?? ["score", "comments"]).filter(
    (t): t is "score" | "comments" => t === "score" || t === "comments"
  );
  if (watchTypes.length === 0) {
    return NextResponse.json({ error: "Sélectionnez au moins un type d'alerte." }, { status: 400 });
  }

  const existing = await findActiveByEmailAndCity(email, citySlug);
  const comments = await listComments(`city:${citySlug}`);
  const locale = isFrLocale(req) ? "fr" : "en";
  const baseUrl = locale === "fr" ? "https://mavilleideale.fr" : "https://bestcitiesinfrance.com";

  const alerte = await addAlerte({
    email,
    citySlug,
    cityName: city.name,
    types: watchTypes,
    scoreThreshold: scoreThreshold ?? undefined,
    currentScore: city.scores.global,
    currentCommentCount: comments.length,
    locale,
  });

  // Send confirmation email
  const subject =
    locale === "fr"
      ? `Alerte activée pour ${city.name} — MaVilleIdéale`
      : `Alert set up for ${city.name} — Best Cities in France`;

  const unsubUrl = `${baseUrl}/api/alertes/unsubscribe?token=${alerte.unsubscribeToken}`;

  const text =
    locale === "fr"
      ? `Bonjour,\n\nVotre alerte pour ${city.name} est activée.\n\nVous serez notifié·e quand :\n${watchTypes.includes("score") ? `- Le score de ${city.name} change${scoreThreshold ? ` et atteint ${scoreThreshold}/10` : ""}\n` : ""}${watchTypes.includes("comments") ? `- De nouveaux commentaires sont postés sur ${city.name}\n` : ""}\nPour vous désabonner : ${unsubUrl}\n\n— L'équipe MaVilleIdéale`
      : `Hello,\n\nYour alert for ${city.name} is now active.\n\nYou'll be notified when:\n${watchTypes.includes("score") ? `- ${city.name}'s score changes${scoreThreshold ? ` and reaches ${scoreThreshold}/10` : ""}\n` : ""}${watchTypes.includes("comments") ? `- New comments are posted about ${city.name}\n` : ""}\nTo unsubscribe: ${unsubUrl}\n\n— Best Cities in France`;

  await sendBrevoEmail({
    sender: {
      email: locale === "fr" ? "bonjour@mavilleideale.fr" : "hello@bestcitiesinfrance.com",
      name: locale === "fr" ? "MaVilleIdéale" : "Best Cities in France",
    },
    to: email,
    subject,
    text,
  });

  return NextResponse.json({
    ok: true,
    updated: !!existing,
    message:
      existing
        ? `Alerte mise à jour pour ${city.name}.`
        : `Alerte activée pour ${city.name}. Un email de confirmation vous a été envoyé.`,
  });
}
