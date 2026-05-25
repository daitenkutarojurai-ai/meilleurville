/**
 * R9.3 — Cron: check active alertes and send notifications.
 *
 * Triggered weekly via Vercel cron (vercel.json). Checks two triggers:
 *  1. Score change: current global score ≠ lastNotifiedScore (delta ≥ 0.05)
 *     AND (if scoreThreshold set) new score ≥ threshold.
 *  2. Comment count increase: current count > lastNotifiedCommentCount.
 *
 * Uses ?dryRun=1 for preview without sending.
 * Protected by CRON_SECRET (same pattern as /api/cron/newsletter).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAllAlertes, updateLastNotified } from "@/lib/alertes-store";
import { CITIES_SEED } from "@/data/cities-seed";
import { listComments } from "@/lib/comments-store";
import { sendBrevoEmail } from "@/lib/brevo";

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dryRun = req.nextUrl.searchParams.get("dryRun") === "1";
  const alertes = await getAllAlertes();
  const active = alertes.filter((a) => a.active);

  const results: Array<{ id: string; email: string; city: string; triggers: string[]; sent: boolean }> = [];

  for (const alerte of active) {
    const city = CITIES_SEED.find((c) => c.slug === alerte.citySlug);
    if (!city) continue;

    const currentScore = city.scores.global;
    const comments = await listComments(`city:${alerte.citySlug}`);
    const currentCount = comments.length;

    const triggers: string[] = [];

    // Score change trigger
    if (alerte.types.includes("score")) {
      const delta = Math.abs(currentScore - alerte.lastNotifiedScore);
      const crossedThreshold =
        !alerte.scoreThreshold || currentScore >= alerte.scoreThreshold;
      if (delta >= 0.05 && crossedThreshold) {
        const dir = currentScore > alerte.lastNotifiedScore ? "↑" : "↓";
        triggers.push(`score ${dir} ${alerte.lastNotifiedScore.toFixed(1)} → ${currentScore.toFixed(1)}`);
      }
    }

    // New comment trigger
    if (alerte.types.includes("comments") && currentCount > alerte.lastNotifiedCommentCount) {
      const newCount = currentCount - alerte.lastNotifiedCommentCount;
      triggers.push(`${newCount} nouveau${newCount > 1 ? "x" : ""} commentaire${newCount > 1 ? "s" : ""}`);
    }

    if (triggers.length === 0) {
      results.push({ id: alerte.id, email: alerte.email, city: city.name, triggers: [], sent: false });
      continue;
    }

    const isFr = alerte.locale === "fr";
    const baseUrl = isFr ? "https://mavilleideale.fr" : "https://bestcitiesinfrance.com";
    const cityPath = isFr ? `/villes/${alerte.citySlug}` : `/cities/${alerte.citySlug}`;
    const unsubUrl = `${baseUrl}/api/alertes/unsubscribe?token=${alerte.unsubscribeToken}`;

    const subject = isFr
      ? `[Alerte ${city.name}] ${triggers.join(" · ")} — MaVilleIdéale`
      : `[Alert ${city.name}] ${triggers.join(" · ")} — Best Cities in France`;

    const triggerLines = triggers.map((t) => `  • ${t}`).join("\n");
    const text = isFr
      ? `Bonjour,\n\nVotre alerte pour ${city.name} s'est déclenchée :\n${triggerLines}\n\nVoir la fiche : ${baseUrl}${cityPath}\n\nPour vous désabonner : ${unsubUrl}\n\n— L'équipe MaVilleIdéale`
      : `Hello,\n\nYour alert for ${city.name} was triggered:\n${triggerLines}\n\nSee the city profile: ${baseUrl}${cityPath}\n\nTo unsubscribe: ${unsubUrl}\n\n— Best Cities in France`;

    let sent = false;
    if (!dryRun) {
      sent = await sendBrevoEmail({
        sender: {
          email: isFr ? "bonjour@mavilleideale.fr" : "hello@bestcitiesinfrance.com",
          name: isFr ? "MaVilleIdéale" : "Best Cities in France",
        },
        to: alerte.email,
        subject,
        text,
      });

      if (sent) {
        await updateLastNotified(alerte.id, currentScore, currentCount);
      }
    } else {
      sent = true;
    }

    results.push({ id: alerte.id, email: alerte.email, city: city.name, triggers, sent });
  }

  const triggered = results.filter((r) => r.triggers.length > 0);
  return NextResponse.json({
    dryRun,
    totalActive: active.length,
    triggered: triggered.length,
    sent: triggered.filter((r) => r.sent).length,
    results: dryRun ? results : triggered,
  });
}
