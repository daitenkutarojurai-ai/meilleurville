/**
 * Brevo (ex-Sendinblue) REST API v3 client. Plain fetch — no SDK, no new npm
 * dependency — same shape as the rest of the codebase.
 *
 * BREVO_API_KEY must be a *v3 API key* (it starts with `xkeysib-`), created in
 * Brevo → Settings → SMTP & API → API Keys. An SMTP key (`xsmtpsib-...`) is
 * NOT accepted here: that kind only authenticates the SMTP relay, not this
 * REST API — `api.brevo.com` answers `401 unauthorized` for it.
 *
 * Every call is best-effort: with no key (or a rejected one) the functions
 * return false and the caller degrades gracefully — the JSON stores stay the
 * local source of truth and the visitor still gets a success response.
 */
const BREVO_BASE = "https://api.brevo.com/v3";

function authHeaders(key: string) {
  return {
    "api-key": key,
    "content-type": "application/json",
    accept: "application/json",
  };
}

export interface BrevoSender {
  email: string;
  name: string;
}

/** Send one transactional email via Brevo. Returns true on a 2xx response. */
export async function sendBrevoEmail(opts: {
  sender: BrevoSender;
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`${BREVO_BASE}/smtp/email`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify({
        sender: opts.sender,
        to: [{ email: opts.to }],
        subject: opts.subject,
        textContent: opts.text,
        ...(opts.replyTo ? { replyTo: { email: opts.replyTo } } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Add (or update) a contact and attach it to a Brevo list. `updateEnabled`
 * makes re-subscribing an existing address a no-op (Brevo answers 204) rather
 * than a 400 duplicate error. Returns true on any 2xx response.
 */
export async function addBrevoContact(opts: {
  email: string;
  listId: number;
}): Promise<boolean> {
  const key = process.env.BREVO_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch(`${BREVO_BASE}/contacts`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify({
        email: opts.email,
        listIds: [opts.listId],
        updateEnabled: true,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export interface CampaignResult {
  ok: boolean;
  campaignId?: number;
  error?: string;
}

/**
 * Create a "classic" email campaign targeting a Brevo list and send it now.
 * This is how a newsletter reaches a whole list — with Brevo's own tracking
 * and unsubscribe handling — as opposed to sendBrevoEmail, which is 1:1.
 */
export async function createAndSendCampaign(opts: {
  name: string;
  subject: string;
  sender: BrevoSender;
  htmlContent: string;
  listId: number;
}): Promise<CampaignResult> {
  const key = process.env.BREVO_API_KEY;
  if (!key) return { ok: false, error: "BREVO_API_KEY not set" };
  try {
    const createRes = await fetch(`${BREVO_BASE}/emailCampaigns`, {
      method: "POST",
      headers: authHeaders(key),
      body: JSON.stringify({
        name: opts.name,
        subject: opts.subject,
        sender: opts.sender,
        type: "classic",
        htmlContent: opts.htmlContent,
        recipients: { listIds: [opts.listId] },
      }),
    });
    if (!createRes.ok) {
      return {
        ok: false,
        error: `create failed (${createRes.status}): ${await createRes.text()}`,
      };
    }
    const created = (await createRes.json()) as { id: number };
    const sendRes = await fetch(
      `${BREVO_BASE}/emailCampaigns/${created.id}/sendNow`,
      { method: "POST", headers: authHeaders(key) },
    );
    if (!sendRes.ok) {
      return {
        ok: false,
        campaignId: created.id,
        error: `send failed (${sendRes.status}): ${await sendRes.text()}`,
      };
    }
    return { ok: true, campaignId: created.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "network error" };
  }
}
