import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addComment, listComments, countComments } from "@/lib/comments-store";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { checkContent } from "@/lib/spam-filter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PostSchema = z.object({
  topic: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9:_\-]+$/i, "topic invalide"),
  author: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(40, "Trop long")
    .regex(/^[\p{L}0-9 .'_-]+$/u, "Caractères non autorisés"),
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

  const check = checkContent({ author: parsed.data.author, body: parsed.data.body });
  if (!check.ok) {
    return NextResponse.json({ error: check.reason ?? "Contenu refusé" }, { status: 422 });
  }

  const comment = await addComment({
    topic: parsed.data.topic,
    author: parsed.data.author.trim(),
    body: parsed.data.body.trim(),
    rating: parsed.data.rating,
  });
  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
