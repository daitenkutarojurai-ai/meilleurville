/**
 * Cron handlers, invoked from the Worker's scheduled() entrypoint.
 * Cloudflare triggers these directly (no HTTP request, no CRON_SECRET needed —
 * the old Bearer check guarded a public Vercel route; a CF cron trigger cannot
 * be called externally).
 *   - newsletter: Sunday 07:00 UTC
 *   - alertes:    Monday 08:00 UTC
 */
import type { Locale } from "@/lib/i18n";
import { buildNewsletter } from "@/lib/newsletter-content";
import { createAndSendCampaign, sendBrevoEmail, type BrevoSender } from "@/lib/brevo";
import { getAllAlertes, updateLastNotified } from "@/lib/alertes-store";
import { listComments } from "@/lib/comments-store";
import { CITIES_SEED } from "@/data/cities-seed";

const LOCALES: Locale[] = ["fr", "en"];

const NEWSLETTER_SENDER: Record<Locale, BrevoSender> = {
  fr: { email: process.env.NEWSLETTER_FROM_EMAIL_FR ?? "lettre@mavilleideale.fr", name: "MaVilleIdeal" },
  en: { email: process.env.NEWSLETTER_FROM_EMAIL_EN ?? "newsletter@bestcitiesinfrance.com", name: "BestCitiesInFrance" },
};

const LIST_ENV: Record<Locale, string> = { fr: "BREVO_LIST_ID_FR", en: "BREVO_LIST_ID_EN" };

export async function runCronNewsletter(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  for (const locale of LOCALES) {
    const listId = Number(process.env[LIST_ENV[locale]]);
    if (!Number.isFinite(listId)) continue;
    const { subject, html } = buildNewsletter(locale);
    await createAndSendCampaign({
      name: `Lettre ${locale.toUpperCase()} — ${today}`,
      subject,
      sender: NEWSLETTER_SENDER[locale],
      htmlContent: html,
      listId,
    });
  }
}

export async function runCronAlertes(): Promise<void> {
  const alertes = await getAllAlertes();
  const active = alertes.filter((a) => a.active);

  for (const alerte of active) {
    const city = CITIES_SEED.find((c) => c.slug === alerte.citySlug);
    if (!city) continue;

    const currentScore = city.scores.global;
    const comments = await listComments(`city:${alerte.citySlug}`);
    const currentCount = comments.length;
    const triggers: string[] = [];

    if (alerte.types.includes("score")) {
      const delta = Math.abs(currentScore - alerte.lastNotifiedScore);
      const crossedThreshold = !alerte.scoreThreshold || currentScore >= alerte.scoreThreshold;
      if (delta >= 0.05 && crossedThreshold) {
        const dir = currentScore > alerte.lastNotifiedScore ? "↑" : "↓";
        triggers.push(`score ${dir} ${alerte.lastNotifiedScore.toFixed(1)} → ${currentScore.toFixed(1)}`);
      }
    }
    if (alerte.types.includes("comments") && currentCount > alerte.lastNotifiedCommentCount) {
      const newCount = currentCount - alerte.lastNotifiedCommentCount;
      triggers.push(`${newCount} nouveau${newCount > 1 ? "x" : ""} commentaire${newCount > 1 ? "s" : ""}`);
    }
    if (triggers.length === 0) continue;

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

    const sent = await sendBrevoEmail({
      sender: { email: isFr ? "bonjour@mavilleideale.fr" : "hello@bestcitiesinfrance.com", name: isFr ? "MaVilleIdéale" : "Best Cities in France" },
      to: alerte.email, subject, text,
    });
    if (sent) await updateLastNotified(alerte.id, currentScore, currentCount);
  }
}
