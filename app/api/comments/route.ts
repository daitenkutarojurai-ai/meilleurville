import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addComment, listComments, countComments } from "@/lib/comments-store";

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
});

// Light profanity / link spam filter — avoids the most blatant abuse without being heavy.
function isClean(body: string): boolean {
  const lower = body.toLowerCase();
  if (lower.includes("http://") || lower.includes("https://")) return false;
  const blocked = ["connard", "salope", "pute", "enculé", "fdp"];
  return !blocked.some((w) => lower.includes(w));
}

export async function GET(req: NextRequest) {
  const topic = req.nextUrl.searchParams.get("topic");
  if (!topic) return NextResponse.json({ error: "topic requis" }, { status: 400 });

  const [items, total] = await Promise.all([listComments(topic), countComments(topic)]);
  return NextResponse.json({ items, total });
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const parsed = PostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Données invalides",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  if (!isClean(parsed.data.body)) {
    return NextResponse.json(
      { error: "Votre commentaire a été refusé (liens ou propos non autorisés)." },
      { status: 422 }
    );
  }

  const comment = await addComment(parsed.data);
  return NextResponse.json({ ok: true, comment }, { status: 201 });
}
