import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addComment, listComments, countComments } from "@/lib/comments-store";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { checkContent } from "@/lib/spam-filter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BANNED_NAMES = new Set([
  "test", "tests", "testing",
  "user", "users", "utilisateur", "utilisateurs",
  "admin", "administrator", "administrateur", "moderator", "moderateur",
  "anonymous", "anonyme", "anon",
  "root", "guest", "invité", "invite",
  "bot", "robot", "ai", "ia",
  "null", "undefined", "none",
  "azerty", "qwerty", "asdf",
  "noname", "sansnom",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PostSchema = z.object({
  topic: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9:_\-]+$/i, "topic invalide"),
  author: z
    .string()
    .min(3, "Au moins 3 caractères")
    .max(40, "Trop long")
    .regex(/^[\p{L}0-9 .'_-]+$/u, "Caractères non autorisés"),
  email: z
    .string()
    .min(5, "Email requis")
    .max(120, "Email trop long")
    .regex(EMAIL_RE, "Email invalide"),
  body: z.string().min(8, "Trop court (8 caractères mini)").max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  // Anti-bot: honeypot must be empty, formStartedAt must be at least ~2s in the past
  website: z.string().max(0).optional(),
  formStartedAt: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic");
  if (!topic) return NextResponse.json({ error: "topic requis" }, { status: 400 });

  const [items, total] = await Promise.all([listComments(topic), countComments(topic)]);
  return NextResponse.json({ items, total });
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);

  // 5 comments per minute per IP, 30 per hour
  const minuteWindow = rateLimit(`cmt:m:${ip}`, 5, 60_000);
  if (!minuteWindow.allowed) {
    return NextResponse.json(
      { error: `Trop de messages — réessayez dans ${minuteWindow.retryAfterSeconds}s.` },
      { status: 429, headers: { "Retry-After": String(minuteWindow.retryAfterSeconds) } }
    );
  }
  const hourWindow = rateLimit(`cmt:h:${ip}`, 30, 60 * 60_000);
  if (!hourWindow.allowed) {
    return NextResponse.json(
      { error: "Limite horaire atteinte. Revenez plus tard." },
      { status: 429, headers: { "Retry-After": String(hourWindow.retryAfterSeconds) } }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Honeypot — drop silently like the contact form (bots think they succeeded).
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true, comment: null }, { status: 200 });
  }

  // Time-to-submit: humans take >2s to type a comment.
  if (parsed.data.formStartedAt) {
    const elapsed = Date.now() - parsed.data.formStartedAt;
    if (elapsed < 2_000) {
      return NextResponse.json(
        { error: "Patientez quelques secondes avant de soumettre." },
        { status: 429 }
      );
    }
  }

  // Reject generic / fake usernames
  const authorClean = parsed.data.author.trim();
  const authorLc = authorClean.toLowerCase();
  if (BANNED_NAMES.has(authorLc) || /^(.)\1+$/.test(authorLc)) {
    return NextResponse.json(
      { error: "Merci d'utiliser un vrai prénom (pas \"test\", \"user\", etc.)" },
      { status: 422 }
    );
  }

  // 1 comment per IP per topic per 24h (prevents stuffing same city with same IP)
  const dailyKey = `cmt:d:${ip}:${parsed.data.topic}`;
  const dailyWindow = rateLimit(dailyKey, 1, 24 * 60 * 60_000);
  if (!dailyWindow.allowed) {
    const hours = Math.ceil(dailyWindow.retryAfterSeconds / 3600);
    return NextResponse.json(
      { error: `Vous avez déjà commenté cette page récemment. Réessayez dans ~${hours}h.` },
      { status: 429, headers: { "Retry-After": String(dailyWindow.retryAfterSeconds) } }
    );
  }

  const check = checkContent({ author: authorClean, body: parsed.data.body });
  if (!check.ok) {
    return NextResponse.json({ error: check.reason ?? "Contenu refusé" }, { status: 422 });
  }

  const comment = await addComment({
    topic: parsed.data.topic,
    author: authorClean,
    body: parsed.data.body.trim(),
    rating: parsed.data.rating,
  });
  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
