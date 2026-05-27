/**
 * Contact-message store — Cloudflare D1 backed.
 * If BREVO_API_KEY is set in the environment, also forwards via email.
 */
import { getDB } from "@/lib/db";
import { sendBrevoEmail } from "@/lib/brevo";

export interface ContactMessage {
  id: string;
  topic: string;
  name: string;
  email: string;
  body: string;
  /** Which site the message came from. Older entries may lack it → treated as "fr". */
  locale?: "fr" | "en";
  createdAt: string;
}

export async function addContactMessage(
  input: Omit<ContactMessage, "id" | "createdAt">,
): Promise<ContactMessage> {
  const db = await getDB();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await db
    .prepare(
      "INSERT INTO contact_messages (id, topic, name, email, body, locale, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(id, input.topic, input.name, input.email, input.body, input.locale ?? "fr", createdAt)
    .run();
  return { id, createdAt, ...input };
}

/**
 * Best-effort Brevo forward. Returns true if sent.
 *
 * Every contact message — FR or EN — is delivered to a single inbox
 * (CONTACT_TO_EMAIL). Only the sender address and the subject brand change
 * with the locale, so a reply lands on the right domain. The sender domains
 * must be authenticated in Brevo (mavilleideale.fr / bestcitiesinfrance.com).
 */
export async function maybeForwardEmail(m: ContactMessage): Promise<boolean> {
  const to = process.env.CONTACT_TO_EMAIL ?? "daitenkutarojurai@gmail.com";
  const locale = m.locale ?? "fr";
  const sender =
    locale === "en"
      ? {
          email: process.env.CONTACT_FROM_EMAIL_EN ?? "hello@bestcitiesinfrance.com",
          name: "BestCitiesInFrance",
        }
      : {
          email:
            process.env.CONTACT_FROM_EMAIL_FR ??
            process.env.CONTACT_FROM_EMAIL ??
            "bonjour@mavilleideale.fr",
          name: "MeilleurVille",
        };

  return sendBrevoEmail({
    sender,
    to,
    replyTo: m.email,
    subject: `[${sender.name}] ${m.topic} — ${m.name}`,
    text: `${m.body}\n\n— ${m.name} <${m.email}>`,
  });
}
