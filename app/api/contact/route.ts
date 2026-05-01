import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { addContactMessage, maybeForwardEmail } from "@/lib/contact-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  topic: z.enum(["question", "erreur", "ville", "presse", "suggestion", "autre"]),
  name: z
    .string()
    .min(2, "Au moins 2 caractères")
    .max(80, "Trop long")
    .regex(/^[\p{L}0-9 .'_-]+$/u, "Caractères non autorisés"),
  email: z.string().email("Email invalide"),
  body: z.string().min(20, "Au moins 20 caractères").max(4000),
  // honeypot — bots love filling these
  website: z.string().max(0).optional(),
});

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const parsed = Schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // Drop silently if honeypot is filled
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const { topic, name, email, body } = parsed.data;
  const stored = await addContactMessage({ topic, name, email, body });
  const sent = await maybeForwardEmail(stored);

  return NextResponse.json(
    { ok: true, id: stored.id, emailDelivered: sent },
    { status: 201 }
  );
}
