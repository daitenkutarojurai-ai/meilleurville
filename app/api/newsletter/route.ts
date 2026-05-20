import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  addSubscriber,
  maybeSyncAudience,
  maybeSendWelcome,
} from "@/lib/newsletter-store";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  email: z.string().email().max(254),
  // Which site the signup came from. The FR form sends "fr", the EN form
  // sends "en" — this is what keeps the two newsletter lists separate.
  locale: z.enum(["fr", "en"]).default("fr"),
  // honeypot — accepted with any value so a filled one is dropped silently
  // below (a 400 would tell the bot the field is checked).
  website: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  // 5 signups per 10 minutes per IP — generous for humans, tight for bots.
  const burst = rateLimit(`nl:${ip}`, 5, 10 * 60_000);
  if (!burst.allowed) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Body JSON invalide" }, { status: 400 });
  }

  const parsed = Schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  // Drop silently if the honeypot is filled — bot gets a 200, no list entry.
  if (parsed.data.website && parsed.data.website.length > 0) {
    return NextResponse.json({ success: true }, { status: 200 });
  }

  const { email, locale } = parsed.data;
  const { subscriber, alreadySubscribed } = await addSubscriber({ email, locale });

  // Only sync/welcome on a genuinely new signup — no duplicate welcome emails.
  if (!alreadySubscribed) {
    await maybeSyncAudience(subscriber);
    await maybeSendWelcome(subscriber);
  }

  return NextResponse.json({ success: true, alreadySubscribed }, { status: 201 });
}
