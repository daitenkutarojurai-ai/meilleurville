/**
 * Standalone API Worker for the static-first deployment.
 *
 * Static pages live in Cloudflare Workers Static Assets (out/, served directly
 * by the edge). This Worker is only invoked for non-asset paths — the dynamic
 * API surface that used to be Next.js route handlers — plus the two cron
 * triggers. Auth is Worker-native magic-link (D1 + HS256 JWT in localStorage,
 * see lib/auth-*.ts) — no Supabase, no cookies here.
 *
 * Env vars (wrangler [vars] + secrets) are exposed to the shared lib code via
 * process.env (nodejs_compat populates it); the D1 binding is injected with
 * setDB(env.DB) at the top of every invocation.
 */
import { z } from "zod";
import { setDB, type D1Database } from "@/lib/db";
import { addComment, listComments, countComments } from "@/lib/comments-store";
import { addContactMessage, maybeForwardEmail } from "@/lib/contact-store";
import { addPageFeedback, maybeForwardFeedback } from "@/lib/feedback-store";
import { addSubscriber, maybeSyncList, maybeSendWelcome } from "@/lib/newsletter-store";
import {
  addAlerte,
  findActiveByEmailAndCity,
  findAllByEmail,
  findByUnsubscribeToken,
  deactivateAlerte,
} from "@/lib/alertes-store";
import { sendBrevoEmail, addBrevoContact } from "@/lib/brevo";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { checkContent } from "@/lib/spam-filter";
import { CITIES_SEED } from "@/data/cities-seed";
import {
  signSession,
  verifySession,
  generateLoginToken,
  hashToken,
} from "@/lib/auth-tokens";
import {
  findOrCreateUser,
  findUserById,
  createLoginToken,
  consumeLoginToken,
  markLogin,
  purgeStaleLoginTokens,
  setHandle,
  type User,
} from "@/lib/auth-store";
import { listFavorites, addFavorite, removeFavorite, mergeFavorites } from "@/lib/favorites-store";
import {
  listProjections,
  addProjection,
  removeProjection,
} from "@/lib/projections-store";
import {
  listUserContributions,
  countUserContributions,
  addUserComment,
} from "@/lib/contributions-store";
import { runCronNewsletter, runCronAlertes } from "./crons";
import {
  handleQuiz,
  handleCopilot,
  handleCitySummary,
  handleWidgetEmbed,
} from "./compute";

export interface Env {
  DB: D1Database;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  [key: string]: unknown;
}

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", ...(init?.headers ?? {}) },
  });

const html = (body: string, init?: ResponseInit) =>
  new Response(body, {
    ...init,
    headers: { "content-type": "text/html; charset=utf-8", ...(init?.headers ?? {}) },
  });

// Make wrangler vars/secrets visible to lib code that reads process.env.
function exposeEnv(env: Env): void {
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === "string") {
      try {
        process.env[k] = v;
      } catch {
        /* process.env may be read-only in some runtimes — nodejs_compat is writable */
      }
    }
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BANNED_NAMES = new Set([
  "test", "tests", "testing", "user", "users", "utilisateur", "utilisateurs",
  "admin", "administrator", "administrateur", "moderator", "moderateur",
  "anonymous", "anonyme", "anon", "root", "guest", "invité", "invite",
  "bot", "robot", "ai", "ia", "null", "undefined", "none",
  "azerty", "qwerty", "asdf", "noname", "sansnom",
]);

const ContactSchema = z.object({
  topic: z.enum(["question", "red-flag", "erreur", "ville", "presse", "suggestion", "autre"]),
  name: z.string().min(2).max(80).regex(/^[\p{L}0-9 .'_-]+$/u),
  email: z.string().email(),
  body: z.string().min(20).max(4000),
  locale: z.enum(["fr", "en"]).default("fr"),
  website: z.string().max(0).optional(),
});

const FeedbackSchema = z.object({
  path: z.string().min(1).max(300),
  sentiment: z.enum(["up", "down"]),
  comment: z.string().max(280).optional(),
  locale: z.enum(["fr", "en"]).default("fr"),
  website: z.string().max(0).optional(),
});

const CommentSchema = z.object({
  topic: z.string().min(1).max(120).regex(/^[a-z0-9:_\-]+$/i),
  author: z.string().min(3).max(40).regex(/^[\p{L}0-9 .'_-]+$/u),
  email: z.string().min(5).max(120).regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/),
  body: z.string().min(8).max(2000),
  rating: z.number().int().min(1).max(5).optional(),
  categoryRatings: z.record(z.string().max(40), z.number().int().min(1).max(5)).optional(),
  type: z.enum(["comment", "question"]).optional().default("comment"),
  website: z.string().max(0).optional(),
  formStartedAt: z.number().int().optional(),
});

const NewsletterSchema = z.object({
  email: z.string().email().max(254),
  locale: z.enum(["fr", "en"]).default("fr"),
  website: z.string().optional(),
});

// ---- auth helpers ---------------------------------------------------------

const ORIGIN_BY_LOCALE = {
  fr: "https://www.mavilleideale.fr",
  en: "https://bestcitiesinfrance.com",
} as const;

function originFor(request: Request, fallbackLocale: string): string {
  const referer = request.headers.get("referer") ?? "";
  if (referer.includes("bestcitiesinfrance")) return ORIGIN_BY_LOCALE.en;
  if (referer.includes("mavilleideale")) return ORIGIN_BY_LOCALE.fr;
  return fallbackLocale === "en" ? ORIGIN_BY_LOCALE.en : ORIGIN_BY_LOCALE.fr;
}

/** Resolve the authenticated user from the Bearer JWT, or null. */
async function authedUser(request: Request): Promise<User | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  const header = request.headers.get("authorization") ?? "";
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const claims = await verifySession(m[1], secret);
  if (!claims) return null;
  return findUserById(claims.sub);
}

const PublicUser = (u: User) => ({ id: u.id, email: u.email, handle: u.handle });

// ---- auth handlers --------------------------------------------------------

async function handleAuthRequestLink(request: Request, fallbackLocale: string): Promise<Response> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return json({ error: "Auth non configurée." }, { status: 503 });

  const ip = getClientIp(request.headers);
  if (!rateLimit(`auth:req:m:${ip}`, 4, 60_000).allowed || !rateLimit(`auth:req:h:${ip}`, 15, 60 * 60_000).allowed)
    return json({ error: "Trop de demandes de connexion. Réessayez plus tard." }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide." }, { status: 400 }); }
  const { email, website } = body as { email?: string; website?: string };
  if (website && website.length > 0) return json({ ok: true }); // honeypot
  if (!email || !EMAIL_RE.test(email) || email.length > 254)
    return json({ error: "Adresse email invalide." }, { status: 400 });

  // Per-email throttle so one address can't be link-bombed.
  if (!rateLimit(`auth:req:e:${email.toLowerCase()}`, 3, 10 * 60_000).allowed)
    return json({ error: "Un lien a déjà été envoyé. Vérifiez vos emails." }, { status: 429 });

  const user = await findOrCreateUser(email);
  const token = generateLoginToken();
  await createLoginToken({ userId: user.id, tokenHash: await hashToken(token) });
  await purgeStaleLoginTokens();

  const origin = originFor(request, fallbackLocale);
  const locale: "fr" | "en" = origin === ORIGIN_BY_LOCALE.en ? "en" : "fr";
  const link = `${origin}/auth/callback?token=${token}`;
  const subject = locale === "fr" ? "Votre lien de connexion — MaVilleIdéale" : "Your sign-in link — Best Cities in France";
  const text = locale === "fr"
    ? `Bonjour,\n\nCliquez sur ce lien pour vous connecter à MaVilleIdéale :\n${link}\n\nCe lien expire dans 30 minutes et ne fonctionne qu'une fois. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.\n\n— L'équipe MaVilleIdéale`
    : `Hello,\n\nClick this link to sign in to Best Cities in France:\n${link}\n\nThe link expires in 30 minutes and works only once. If you didn't request it, ignore this email.\n\n— Best Cities in France`;
  await sendBrevoEmail({
    sender: { email: locale === "fr" ? "bonjour@mavilleideale.fr" : "hello@bestcitiesinfrance.com", name: locale === "fr" ? "MaVilleIdéale" : "Best Cities in France" },
    to: email, subject, text,
  });

  return json({ ok: true });
}

async function handleAuthVerify(request: Request): Promise<Response> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return json({ error: "Auth non configurée." }, { status: 503 });

  const ip = getClientIp(request.headers);
  if (!rateLimit(`auth:vfy:${ip}`, 10, 60_000).allowed)
    return json({ error: "Trop de tentatives." }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide." }, { status: 400 }); }
  const { token } = body as { token?: string };
  if (!token || token.length < 16 || token.length > 200)
    return json({ error: "Lien invalide." }, { status: 400 });

  const userId = await consumeLoginToken(await hashToken(token));
  if (!userId) return json({ error: "Lien invalide ou expiré. Redemandez un lien de connexion." }, { status: 401 });

  const user = await findUserById(userId);
  if (!user) return json({ error: "Compte introuvable." }, { status: 401 });
  await markLogin(user.id);

  const jwt = await signSession({ sub: user.id, email: user.email }, secret);
  return json({ ok: true, token: jwt, user: PublicUser(user) });
}

async function handleAuthMe(request: Request): Promise<Response> {
  const user = await authedUser(request);
  if (!user) return json({ user: null });
  return json({ user: PublicUser(user) });
}

const HANDLE_RE = /^[\p{L}0-9 .'_-]{2,40}$/u;
async function handleAuthHandle(request: Request): Promise<Response> {
  const user = await authedUser(request);
  if (!user) return json({ error: "Non authentifié." }, { status: 401 });
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide." }, { status: 400 }); }
  const { handle } = body as { handle?: string };
  if (!handle || !HANDLE_RE.test(handle.trim()))
    return json({ error: "Pseudo invalide (2 à 40 caractères)." }, { status: 400 });
  await setHandle(user.id, handle.trim());
  return json({ ok: true, handle: handle.trim() });
}

// ---- account data handlers ------------------------------------------------

async function handleFavorites(request: Request): Promise<Response> {
  const user = await authedUser(request);
  if (!user) return json({ error: "Non authentifié." }, { status: 401 });
  const method = request.method;

  if (method === "GET") return json({ favorites: await listFavorites(user.id) });

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide." }, { status: 400 }); }

  if (method === "POST") {
    const { slug, merge } = body as { slug?: string; merge?: string[] };
    if (Array.isArray(merge)) return json({ favorites: await mergeFavorites(user.id, merge) });
    if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) return json({ error: "Ville invalide." }, { status: 400 });
    await addFavorite(user.id, slug);
    return json({ favorites: await listFavorites(user.id) });
  }
  if (method === "DELETE") {
    const { slug } = body as { slug?: string };
    if (!slug || !/^[a-z0-9-]{1,80}$/.test(slug)) return json({ error: "Ville invalide." }, { status: 400 });
    await removeFavorite(user.id, slug);
    return json({ favorites: await listFavorites(user.id) });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

async function handleProjections(request: Request): Promise<Response> {
  const user = await authedUser(request);
  if (!user) return json({ error: "Non authentifié." }, { status: 401 });
  const method = request.method;

  if (method === "GET") return json({ projections: await listProjections(user.id) });

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide." }, { status: 400 }); }

  if (method === "POST") {
    const { citySlug, cityName, label, payload } = body as {
      citySlug?: string; cityName?: string; label?: string; payload?: unknown;
    };
    if (!citySlug || !/^[a-z0-9-]{1,80}$/.test(citySlug)) return json({ error: "Ville invalide." }, { status: 400 });
    const serialized = JSON.stringify(payload ?? null);
    if (serialized.length > 20_000) return json({ error: "Projection trop volumineuse." }, { status: 413 });
    const proj = await addProjection({
      userId: user.id,
      citySlug,
      cityName: (cityName ?? citySlug).slice(0, 120),
      label: (label ?? "Projection").slice(0, 120),
      payload: payload ?? null,
    });
    return json({ ok: true, projection: proj }, { status: 201 });
  }
  if (method === "DELETE") {
    const { id } = body as { id?: string };
    if (!id) return json({ error: "id manquant." }, { status: 400 });
    await removeProjection(user.id, id);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed" }, { status: 405 });
}

// Authenticated review/question submission — like /api/comments but identity-bound.
async function handleReviewsPost(request: Request): Promise<Response> {
  const user = await authedUser(request);
  if (!user) return json({ error: "Non authentifié." }, { status: 401 });

  const ip = getClientIp(request.headers);
  if (!rateLimit(`rev:m:${ip}`, 5, 60_000).allowed || !rateLimit(`rev:h:${user.id}`, 20, 60 * 60_000).allowed)
    return json({ error: "Trop de contributions. Réessayez plus tard." }, { status: 429 });

  let payload: unknown;
  try { payload = await request.json(); } catch { return json({ error: "JSON invalide." }, { status: 400 }); }
  const parsed = CommentSchema.safeParse(payload);
  if (!parsed.success) return json({ error: "Données invalides", issues: parsed.error.flatten().fieldErrors }, { status: 400 });

  const author = (user.handle ?? parsed.data.author).trim();
  const check = checkContent({ author, body: parsed.data.body });
  if (!check.ok) return json({ error: check.reason ?? "Contenu refusé" }, { status: 422 });

  let categoryRatings: Record<string, number> | undefined;
  if (parsed.data.categoryRatings) {
    const s: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed.data.categoryRatings))
      if (typeof v === "number" && v >= 1 && v <= 5 && /^[a-z0-9-]+$/i.test(k) && k.length <= 40) s[k] = Math.round(v);
    if (Object.keys(s).length > 0) categoryRatings = s;
  }

  const comment = await addUserComment({
    userId: user.id,
    topic: parsed.data.topic,
    author,
    body: parsed.data.body.trim(),
    rating: parsed.data.rating,
    categoryRatings,
    type: parsed.data.type,
  });
  return json({ ok: true, comment }, { status: 201 });
}

// Dashboard aggregate: everything /mes-villes needs in one authed round-trip.
async function handleAccount(request: Request): Promise<Response> {
  const user = await authedUser(request);
  if (!user) return json({ user: null }, { status: 401 });
  const [favorites, contributions, contributionCount, projections] = await Promise.all([
    listFavorites(user.id),
    listUserContributions(user.id),
    countUserContributions(user.id),
    listProjections(user.id),
  ]);
  const alertes = await findAllByEmail(user.email);
  return json({
    user: PublicUser(user),
    favorites,
    contributions,
    contributionCount,
    projections,
    alertes: alertes.map((a) => ({ citySlug: a.citySlug, cityName: a.cityName, types: a.types })),
  });
}

// ---- handlers -------------------------------------------------------------

async function handleCommentsGet(url: URL): Promise<Response> {
  const topic = url.searchParams.get("topic");
  if (!topic) return json({ error: "topic requis" }, { status: 400 });
  const [items, total] = await Promise.all([listComments(topic), countComments(topic)]);
  return json({ items, total });
}

async function handleCommentsPost(request: Request): Promise<Response> {
  const ip = getClientIp(request.headers);
  const minute = rateLimit(`cmt:m:${ip}`, 5, 60_000);
  if (!minute.allowed)
    return json({ error: `Trop de messages — réessayez dans ${minute.retryAfterSeconds}s.` }, { status: 429, headers: { "Retry-After": String(minute.retryAfterSeconds) } });
  const hour = rateLimit(`cmt:h:${ip}`, 30, 60 * 60_000);
  if (!hour.allowed)
    return json({ error: "Limite horaire atteinte. Revenez plus tard." }, { status: 429 });

  let payload: unknown;
  try { payload = await request.json(); } catch { return json({ error: "Body JSON invalide" }, { status: 400 }); }
  const parsed = CommentSchema.safeParse(payload);
  if (!parsed.success) return json({ error: "Données invalides", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website && parsed.data.website.length > 0) return json({ ok: true, comment: null });
  if (parsed.data.formStartedAt && Date.now() - parsed.data.formStartedAt < 2_000)
    return json({ error: "Patientez quelques secondes avant de soumettre." }, { status: 429 });

  const authorClean = parsed.data.author.trim();
  const authorLc = authorClean.toLowerCase();
  if (BANNED_NAMES.has(authorLc) || /^(.)\1+$/.test(authorLc))
    return json({ error: "Merci d'utiliser un vrai prénom (pas \"test\", \"user\", etc.)" }, { status: 422 });

  const daily = rateLimit(`cmt:d:${ip}:${parsed.data.topic}`, 1, 24 * 60 * 60_000);
  if (!daily.allowed) {
    const hours = Math.ceil(daily.retryAfterSeconds / 3600);
    return json({ error: `Vous avez déjà commenté cette page récemment. Réessayez dans ~${hours}h.` }, { status: 429 });
  }

  const check = checkContent({ author: authorClean, body: parsed.data.body });
  if (!check.ok) return json({ error: check.reason ?? "Contenu refusé" }, { status: 422 });

  let categoryRatings: Record<string, number> | undefined;
  if (parsed.data.categoryRatings) {
    const s: Record<string, number> = {};
    for (const [k, v] of Object.entries(parsed.data.categoryRatings))
      if (typeof v === "number" && v >= 1 && v <= 5 && /^[a-z0-9-]+$/i.test(k) && k.length <= 40) s[k] = Math.round(v);
    if (Object.keys(s).length > 0) categoryRatings = s;
  }

  const comment = await addComment({
    topic: parsed.data.topic,
    author: authorClean,
    body: parsed.data.body.trim(),
    rating: parsed.data.rating,
    categoryRatings,
    type: parsed.data.type,
  });
  return json({ ok: true, comment }, { status: 201 });
}

async function handleContact(request: Request): Promise<Response> {
  const ip = getClientIp(request.headers);
  const burst = rateLimit(`ctc:b:${ip}`, 3, 5 * 60_000);
  if (!burst.allowed) return json({ error: `Patientez ${burst.retryAfterSeconds}s avant un nouvel envoi.` }, { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } });
  const daily = rateLimit(`ctc:d:${ip}`, 10, 24 * 60 * 60_000);
  if (!daily.allowed) return json({ error: "Limite quotidienne atteinte." }, { status: 429 });

  let payload: unknown;
  try { payload = await request.json(); } catch { return json({ error: "Body JSON invalide" }, { status: 400 }); }
  const parsed = ContactSchema.safeParse(payload);
  if (!parsed.success) return json({ error: "Données invalides", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website && parsed.data.website.length > 0) return json({ ok: true });

  const { topic, name, email, body, locale } = parsed.data;
  const stored = await addContactMessage({ topic, name, email, body, locale });
  const sent = await maybeForwardEmail(stored);
  return json({ ok: true, id: stored.id, emailDelivered: sent }, { status: 201 });
}

async function handleFeedback(request: Request): Promise<Response> {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`fb:b:${ip}`, 6, 5 * 60_000).allowed) return json({ error: "Trop de votes — patientez un peu." }, { status: 429 });
  if (!rateLimit(`fb:d:${ip}`, 60, 24 * 60 * 60_000).allowed) return json({ error: "Limite quotidienne atteinte." }, { status: 429 });

  let payload: unknown;
  try { payload = await request.json(); } catch { return json({ error: "Body JSON invalide" }, { status: 400 }); }
  const parsed = FeedbackSchema.safeParse(payload);
  if (!parsed.success) return json({ error: "Données invalides", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  if (parsed.data.website && parsed.data.website.length > 0) return json({ ok: true }); // honeypot

  const { path, sentiment, comment, locale } = parsed.data;
  const stored = await addPageFeedback({ path, sentiment, comment, locale });
  const sent = await maybeForwardFeedback(stored);
  return json({ ok: true, id: stored.id, emailDelivered: sent }, { status: 201 });
}

async function handleNewsletter(request: Request): Promise<Response> {
  const ip = getClientIp(request.headers);
  const burst = rateLimit(`nl:${ip}`, 5, 10 * 60_000);
  if (!burst.allowed) return json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429, headers: { "Retry-After": String(burst.retryAfterSeconds) } });

  let payload: unknown;
  try { payload = await request.json(); } catch { return json({ error: "Body JSON invalide" }, { status: 400 }); }
  const parsed = NewsletterSchema.safeParse(payload);
  if (!parsed.success) return json({ error: "Email invalide" }, { status: 400 });
  if (parsed.data.website && parsed.data.website.length > 0) return json({ success: true });

  const { subscriber, alreadySubscribed } = await addSubscriber({ email: parsed.data.email, locale: parsed.data.locale });
  if (!alreadySubscribed) {
    await maybeSyncList(subscriber);
    await maybeSendWelcome(subscriber);
  }
  return json({ success: true, alreadySubscribed }, { status: 201 });
}

async function handleVacancesNewsletter(request: Request): Promise<Response> {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`vacances-nl:${ip}`, 5, 60_000).allowed) return json({ error: "Trop de requêtes." }, { status: 429 });
  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide." }, { status: 400 }); }
  const { email } = body as { email?: string };
  if (!email || !EMAIL_RE.test(email)) return json({ error: "Adresse email invalide." }, { status: 400 });
  await addBrevoContact({ email, listId: 4 });
  return json({ ok: true });
}

async function handleAlertesSubscribe(request: Request): Promise<Response> {
  const ip = getClientIp(request.headers);
  if (!rateLimit(`alerte:${ip}`, 5, 60_000).allowed) return json({ error: "Trop de requêtes, réessayez dans une minute." }, { status: 429 });

  let body: unknown;
  try { body = await request.json(); } catch { return json({ error: "JSON invalide." }, { status: 400 }); }
  const { email, citySlug, types, scoreThreshold } = body as { email?: string; citySlug?: string; types?: string[]; scoreThreshold?: number };
  if (!email || !EMAIL_RE.test(email)) return json({ error: "Adresse email invalide." }, { status: 400 });
  if (!citySlug) return json({ error: "Ville manquante." }, { status: 400 });
  const city = CITIES_SEED.find((c) => c.slug === citySlug);
  if (!city) return json({ error: "Ville introuvable." }, { status: 400 });

  const watchTypes = (types ?? ["score", "comments"]).filter((t): t is "score" | "comments" => t === "score" || t === "comments");
  if (watchTypes.length === 0) return json({ error: "Sélectionnez au moins un type d'alerte." }, { status: 400 });

  const existing = await findActiveByEmailAndCity(email, citySlug);
  const comments = await listComments(`city:${citySlug}`);
  const referer = request.headers.get("referer") ?? "";
  const locale: "fr" | "en" = referer.includes("bestcitiesinfrance") ? "en" : "fr";
  const baseUrl = locale === "fr" ? "https://mavilleideale.fr" : "https://bestcitiesinfrance.com";

  const alerte = await addAlerte({
    email, citySlug, cityName: city.name, types: watchTypes,
    scoreThreshold: scoreThreshold ?? undefined,
    currentScore: city.scores.global, currentCommentCount: comments.length, locale,
  });

  const subject = locale === "fr" ? `Alerte activée pour ${city.name} — MaVilleIdéale` : `Alert set up for ${city.name} — Best Cities in France`;
  const unsubUrl = `${baseUrl}/api/alertes/unsubscribe?token=${alerte.unsubscribeToken}`;
  const text = locale === "fr"
    ? `Bonjour,\n\nVotre alerte pour ${city.name} est activée.\n\nVous serez notifié·e quand :\n${watchTypes.includes("score") ? `- Le score de ${city.name} change${scoreThreshold ? ` et atteint ${scoreThreshold}/10` : ""}\n` : ""}${watchTypes.includes("comments") ? `- De nouveaux commentaires sont postés sur ${city.name}\n` : ""}\nPour vous désabonner : ${unsubUrl}\n\n— L'équipe MaVilleIdéale`
    : `Hello,\n\nYour alert for ${city.name} is now active.\n\nYou'll be notified when:\n${watchTypes.includes("score") ? `- ${city.name}'s score changes${scoreThreshold ? ` and reaches ${scoreThreshold}/10` : ""}\n` : ""}${watchTypes.includes("comments") ? `- New comments are posted about ${city.name}\n` : ""}\nTo unsubscribe: ${unsubUrl}\n\n— Best Cities in France`;
  await sendBrevoEmail({
    sender: { email: locale === "fr" ? "bonjour@mavilleideale.fr" : "hello@bestcitiesinfrance.com", name: locale === "fr" ? "MaVilleIdéale" : "Best Cities in France" },
    to: email, subject, text,
  });

  return json({
    ok: true, updated: !!existing,
    message: existing ? `Alerte mise à jour pour ${city.name}.` : `Alerte activée pour ${city.name}. Un email de confirmation vous a été envoyé.`,
  });
}

async function handleAlertesUnsubscribe(url: URL): Promise<Response> {
  const token = url.searchParams.get("token");
  if (!token) return html(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Lien invalide</title></head><body><p>Lien de désabonnement invalide ou expiré.</p></body></html>`, { status: 400 });
  const alerte = await findByUnsubscribeToken(token);
  if (!alerte || !alerte.active)
    return html(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Déjà désabonné</title></head><body><p>Cette alerte est déjà désactivée ou le lien est invalide.</p></body></html>`);
  await deactivateAlerte(token);
  const cityPath = alerte.locale === "fr" ? `/villes/${alerte.citySlug}` : `/cities/${alerte.citySlug}`;
  const origin = alerte.locale === "fr" ? "https://mavilleideale.fr" : "https://bestcitiesinfrance.com";
  return html(`<!DOCTYPE html><html lang="${alerte.locale}"><head><meta charset="utf-8"><meta http-equiv="refresh" content="4;url=${origin}${cityPath}"><title>Désabonné</title></head><body><p>Vous avez été désabonné·e des alertes pour <strong>${alerte.cityName}</strong>.</p><p>Redirection dans 4 secondes...</p><p><a href="${origin}${cityPath}">Retour à la fiche de ${alerte.cityName}</a></p></body></html>`);
}

// mes-alertes (client page) reads alertes for an email via this endpoint.
async function handleAlertesList(url: URL): Promise<Response> {
  const email = url.searchParams.get("email")?.trim() ?? "";
  if (!EMAIL_RE.test(email)) return json({ alertes: [] });
  const alertes = await findAllByEmail(email);
  return json({
    alertes: alertes.map((a) => ({
      id: a.id, citySlug: a.citySlug, cityName: a.cityName, types: a.types,
      scoreThreshold: a.scoreThreshold, subscribedAt: a.subscribedAt, unsubscribeToken: a.unsubscribeToken,
    })),
  });
}

function handleCitiesSearch(url: URL): Response {
  const q = url.searchParams.get("q")?.toLowerCase().trim() ?? "";
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "8"), 20);
  if (q.length < 1) return json({ results: [] });
  const results = CITIES_SEED.filter(
    (c) => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q) || c.department.toLowerCase().includes(q) || c.slug.includes(q),
  )
    .sort((a, b) => {
      const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
      return b.scores.global - a.scores.global;
    })
    .slice(0, limit)
    .map((c) => ({ slug: c.slug, name: c.name, region: c.region, department: c.department, population: c.population, score: c.scores.global }));
  return json({ results }, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}

// ---- entrypoint -----------------------------------------------------------

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const locale = (env.NEXT_PUBLIC_DEFAULT_LOCALE as string) ?? "fr";

    // Host canonicalization + locale isolation. _redirects can't match on host,
    // and static export can't rewrite, so the (deleted) proxy.ts logic lives
    // here. run_worker_first (wrangler.toml, scoped to exclude /_next/*) puts the
    // Worker ahead of asset serving, so this fires even for paths that exist as
    // static files. The export bakes BOTH page trees into out/ (FR at root, EN
    // under /en/*); each domain serves only its own locale.
    if (locale === "en") {
      // EN (bestcitiesinfrance.com): canonical host is the apex.
      if (url.hostname === "www.bestcitiesinfrance.com") {
        return Response.redirect(`https://bestcitiesinfrance.com${url.pathname}${url.search}`, 301);
      }
    } else {
      // FR (mavilleideale.fr): canonical host is www.
      if (url.hostname === "mavilleideale.fr") {
        return Response.redirect(`https://www.mavilleideale.fr${url.pathname}${url.search}`, 301);
      }
      // English pages live EXCLUSIVELY on bestcitiesinfrance.com. The FR export
      // still contains the /en/* tree — never serve it on the FR domain.
      const p = url.pathname.replace(/\/+$/, "");
      if (p === "/en" || p.startsWith("/en/")) {
        const nf = await env.ASSETS.fetch(new Request(new URL("/404.html", url)));
        return new Response(nf.body, { status: 404, headers: nf.headers });
      }
    }

    exposeEnv(env);
    setDB(env.DB);

    const path = url.pathname.replace(/\/+$/, "") || "/";
    const method = request.method;

    try {
      if (path === "/api/comments") {
        if (method === "GET") return await handleCommentsGet(url);
        if (method === "POST") return await handleCommentsPost(request);
      }
      if (path === "/api/contact" && method === "POST") return await handleContact(request);
      if (path === "/api/feedback" && method === "POST") return await handleFeedback(request);
      if (path === "/api/newsletter" && method === "POST") return await handleNewsletter(request);
      if (path === "/api/vacances/newsletter" && method === "POST") return await handleVacancesNewsletter(request);
      if (path === "/api/alertes/subscribe" && method === "POST") return await handleAlertesSubscribe(request);
      if (path === "/api/alertes/unsubscribe" && method === "GET") return await handleAlertesUnsubscribe(url);
      if (path === "/api/alertes/list" && method === "GET") return await handleAlertesList(url);
      if (path === "/api/cities/search" && method === "GET") return handleCitiesSearch(url);

      // ── Accounts (Worker-native magic-link auth — R9.1) ──
      if (path === "/api/auth/request-link" && method === "POST") return await handleAuthRequestLink(request, locale);
      if (path === "/api/auth/verify" && method === "POST") return await handleAuthVerify(request);
      if (path === "/api/auth/me" && method === "GET") return await handleAuthMe(request);
      if (path === "/api/auth/handle" && method === "POST") return await handleAuthHandle(request);
      if (path === "/api/account" && method === "GET") return await handleAccount(request);
      if (path === "/api/favorites") return await handleFavorites(request);
      if (path === "/api/projections") return await handleProjections(request);
      if (path === "/api/reviews" && method === "POST") return await handleReviewsPost(request);

      if (path === "/api/quiz" && method === "POST") return await handleQuiz(request);
      if (path === "/widget/embed" && method === "GET") return handleWidgetEmbed(url);

      // AI endpoints call Anthropic — rate-limit per IP to cap spend exposure.
      // In-memory limiter is per-isolate (soft); the hard backstop is the
      // Anthropic Console monthly spend cap.
      if (path === "/api/copilot" && method === "POST") {
        const ip = getClientIp(request.headers);
        if (!rateLimit(`ai:cop:m:${ip}`, 8, 60_000).allowed || !rateLimit(`ai:cop:d:${ip}`, 60, 24 * 60 * 60_000).allowed)
          return json({ reply: "Trop de requêtes — patientez un peu avant de relancer le copilote.", rateLimited: true }, { status: 429 });
        return await handleCopilot(request, env);
      }

      const summaryMatch = path.match(/^\/api\/cities\/([^/]+)\/summary$/);
      if (summaryMatch && method === "GET") {
        const ip = getClientIp(request.headers);
        if (!rateLimit(`ai:sum:m:${ip}`, 20, 60_000).allowed || !rateLimit(`ai:sum:d:${ip}`, 200, 24 * 60 * 60_000).allowed)
          return json({ error: "Trop de requêtes" }, { status: 429 });
        return await handleCitySummary(summaryMatch[1], env);
      }

      if (path.startsWith("/api/")) return json({ error: "Not found" }, { status: 404 });

      const serve404 = async () => {
        const nf = await env.ASSETS.fetch(new Request(new URL("/404.html", url)));
        return new Response(nf.body, { status: 404, headers: nf.headers });
      };

      // run_worker_first routes non-/_next/* requests through the Worker before
      // assets are served, so serve the matching static asset here.
      // On the EN domain, clean URLs (/cities/lyon) map to the /en/* asset tree
      // (replaces proxy.ts). The EN export also contains the FR page tree at
      // root — serve English only: fall through to a root path solely for static
      // infra files (extension or opengraph-image), never the extensionless FR
      // page routes (/villes/*, /classements/*, ...).
      if (locale === "en" && path !== "/en" && !path.startsWith("/en/")) {
        const enUrl = new URL(url);
        enUrl.pathname = `/en${path === "/" ? "" : path}`;
        const enAsset = await env.ASSETS.fetch(new Request(enUrl, request));
        if (enAsset.status !== 404) return enAsset;
        const isInfraFile =
          /\.[a-z0-9]+$/i.test(path) || path === "/opengraph-image" || path.endsWith("/opengraph-image");
        if (!isInfraFile) return serve404();
      }

      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
      return serve404();
    } catch (err) {
      return json({ error: "Erreur interne", detail: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
  },

  async scheduled(event: { cron: string }, env: Env): Promise<void> {
    exposeEnv(env);
    setDB(env.DB);
    if (event.cron === "0 7 * * SUN") await runCronNewsletter();
    else if (event.cron === "0 8 * * MON") await runCronAlertes();
  },
};
