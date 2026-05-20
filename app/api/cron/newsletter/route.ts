/**
 * Weekly newsletter cron — the Sunday send.
 *
 * Triggered by Vercel Cron (see vercel.json: every Sunday 07:00 UTC). Both
 * Vercel projects deploy this route, but each one only ever sends ITS OWN
 * locale: the FR project (NEXT_PUBLIC_DEFAULT_LOCALE=fr) sends the French
 * letter to the FR Brevo list, the EN project sends the English letter to the
 * EN list. No project sends both — the two audiences never cross.
 *
 * Protected by CRON_SECRET: Vercel automatically attaches
 * `Authorization: Bearer <CRON_SECRET>` when it invokes a cron, and the route
 * refuses to run if the secret is missing or wrong. Add `?dryRun=1` to build
 * the letter and return it without sending.
 */
import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n";
import { buildNewsletter } from "@/lib/newsletter-content";
import { createAndSendCampaign, type BrevoSender } from "@/lib/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const SENDER: Record<Locale, BrevoSender> = {
  fr: {
    email: process.env.NEWSLETTER_FROM_EMAIL_FR ?? "lettre@mavilleideale.fr",
    name: "MeilleurVille",
  },
  en: {
    email: process.env.NEWSLETTER_FROM_EMAIL_EN ?? "newsletter@bestcitiesinfrance.com",
    name: "BestCitiesInFrance",
  },
};

const LIST_ENV: Record<Locale, string> = {
  fr: "BREVO_LIST_ID_FR",
  en: "BREVO_LIST_ID_EN",
};

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // refuse to run while unprotected
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(req: NextRequest): Promise<NextResponse> {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locale = DEFAULT_LOCALE;
  const listId = Number(process.env[LIST_ENV[locale]]);
  if (!Number.isFinite(listId)) {
    return NextResponse.json(
      { error: `${LIST_ENV[locale]} is not set` },
      { status: 500 },
    );
  }

  const { subject, html } = buildNewsletter(locale);

  // ?dryRun=1 — build the letter and return it without sending. For previewing
  // content and smoke-testing the endpoint.
  if (req.nextUrl.searchParams.get("dryRun") === "1") {
    return NextResponse.json({ dryRun: true, locale, listId, subject, html });
  }

  const result = await createAndSendCampaign({
    name: `Lettre ${locale.toUpperCase()} — ${new Date().toISOString().slice(0, 10)}`,
    subject,
    sender: SENDER[locale],
    htmlContent: html,
    listId,
  });

  return NextResponse.json(
    { locale, listId, subject, ...result },
    { status: result.ok ? 200 : 502 },
  );
}

// Vercel Cron invokes the route with GET; POST is allowed for manual triggers.
export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
