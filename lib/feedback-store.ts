/**
 * Per-page feedback store — Cloudflare D1 backed.
 * If BREVO_API_KEY is set, each submission is also forwarded by email.
 * Mirrors lib/contact-store.ts. No account binding (anonymous).
 */
import { getDB } from "@/lib/db";
import { sendBrevoEmail } from "@/lib/brevo";

export interface PageFeedback {
  id: string;
  path: string;
  sentiment: "up" | "down";
  comment?: string;
  locale?: "fr" | "en";
  createdAt: string;
}

export async function addPageFeedback(
  input: Omit<PageFeedback, "id" | "createdAt">,
): Promise<PageFeedback> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO page_feedback (id, path, sentiment, comment, locale, created_at) VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(id, input.path, input.sentiment, input.comment ?? null, input.locale ?? "fr", createdAt)
    .run();
  return { id, createdAt, ...input };
}

/**
 * Best-effort Brevo forward. Returns true if sent. Only the sender brand/domain
 * changes with the locale (same authenticated domains as the contact form).
 */
export async function maybeForwardFeedback(f: PageFeedback): Promise<boolean> {
  const to = process.env.CONTACT_TO_EMAIL ?? "daitenkutarojurai@gmail.com";
  const locale = f.locale ?? "fr";
  const sender =
    locale === "en"
      ? { email: process.env.CONTACT_FROM_EMAIL_EN ?? "hello@bestcitiesinfrance.com", name: "BestCitiesInFrance" }
      : {
          email:
            process.env.CONTACT_FROM_EMAIL_FR ?? process.env.CONTACT_FROM_EMAIL ?? "bonjour@mavilleideale.fr",
          name: "MaVilleIdéale",
        };
  const icon = f.sentiment === "up" ? "👍" : "👎";
  return sendBrevoEmail({
    sender,
    to,
    subject: `[${sender.name}] ${icon} Feedback — ${f.path}`,
    text: `${icon} ${f.sentiment.toUpperCase()} on ${f.path} (${locale})\n\n${f.comment ?? "(no comment)"}`,
  });
}
