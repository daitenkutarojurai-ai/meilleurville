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
