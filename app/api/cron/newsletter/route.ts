/**
 * Weekly newsletter cron — the Sunday send.
 *
 * Triggered by Vercel Cron (vercel.json: every Sunday 07:00 UTC). It sends one
 * letter per locale that has a list configured: the FR letter when
 * BREVO_LIST_ID_FR is set, the EN letter when BREVO_LIST_ID_EN is set.
 *
 * The current Vercel project serves both mavilleideale.fr and
 * bestcitiesinfrance.com and has both list ids, so a single run sends both
 * letters (FR → list 4, EN → list 5). If the site is later split into two
 * Vercel projects, set only one BREVO_LIST_ID_* per project and each sends
 * just its own locale — no code change needed.
 *
 * Protected by CRON_SECRET: Vercel automatically attaches
 * `Authorization: Bearer <CRON_SECRET>` when it invokes a cron, and the route
 * refuses to run if the secret is missing or wrong. Add `?dryRun=1` to build
 * the letters and return them without sending.
 */
import { NextRequest, NextResponse } from "next/server";
import type { Locale } from "@/lib/i18n";
import { buildNewsletter } from "@/lib/newsletter-content";
import { createAndSendCampaign, type BrevoSender } from "@/lib/brevo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOCALES: Locale[] = ["fr", "en"];

const SENDER: Record<Locale, BrevoSender> = {
  fr: {
    email: process.env.NEWSLETTER_FROM_EMAIL_FR ?? "lettre@mavilleideale.fr",
    name: "MaVilleIdeal",
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

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const today = new Date().toISOString().slice(0, 10);
  const results: Array<Record<string, unknown>> = [];

  for (const locale of LOCALES) {
    const listId = Number(process.env[LIST_ENV[locale]]);
    if (!Number.isFinite(listId)) continue; // locale not configured here — skip

    const { subject, html } = buildNewsletter(locale);

    if (dryRun) {
      results.push({ locale, listId, subject, html });
      continue;
    }

    const sent = await createAndSendCampaign({
      name: `Lettre ${locale.toUpperCase()} — ${today}`,
      subject,
      sender: SENDER[locale],
      htmlContent: html,
      listId,
    });
    results.push({ locale, listId, subject, ...sent });
  }

  if (results.length === 0) {
    return NextResponse.json(
      { error: "No BREVO_LIST_ID_FR / BREVO_LIST_ID_EN configured" },
      { status: 500 },
    );
  }

  const allOk = dryRun || results.every((r) => r.ok === true);
  return NextResponse.json({ dryRun, results }, { status: allOk ? 200 : 502 });
}

// Vercel Cron invokes the route with GET; POST is allowed for manual triggers.
export async function GET(req: NextRequest) {
  return handle(req);
}
export async function POST(req: NextRequest) {
  return handle(req);
}
