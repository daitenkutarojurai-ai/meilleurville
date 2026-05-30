"use client";

/**
 * Client-side session manager for the Worker-native auth (R9.1).
 *
 * The session JWT lives in localStorage (the static export has no server, so no
 * httpOnly cookie is possible; the token is a 60-day HS256 JWT minted by the
 * Worker). All authed calls go through `authFetch`, which attaches the Bearer
 * header. Components subscribe via `subscribeAuth` + `getAuthSnapshot` with
 * useSyncExternalStore — no setState-in-effect (matches FavoriteButton).
 */

const TOKEN_KEY = "meilleurville:session";
const CHANGED = "auth-changed";

export interface AuthUser {
  id: string;
  email: string;
  handle: string | null;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function setToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(CHANGED));
  } catch {
    /* storage may be unavailable (private mode) — auth simply won't persist */
  }
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

/** fetch() with the Bearer token attached. 401 clears the stale session. */
export async function authFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("authorization", `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401 && token) setToken(null);
  return res;
}

/** Step 1 of login: email a magic link. Returns false on a network/server error. */
export async function requestLoginLink(email: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("/api/auth/request-link", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (res.ok) return { ok: true };
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    return { ok: false, error: data.error ?? "Erreur, réessayez." };
  } catch {
    return { ok: false, error: "Connexion impossible. Vérifiez votre réseau." };
  }
}

/** Step 2 of login: exchange the link token for a session JWT. */
export async function verifyLoginToken(token: string): Promise<{ ok: boolean; user?: AuthUser; error?: string }> {
  try {
    const res = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token }),
    });
    const data = (await res.json().catch(() => ({}))) as { token?: string; user?: AuthUser; error?: string };
    if (res.ok && data.token) {
      setToken(data.token);
      return { ok: true, user: data.user };
    }
    return { ok: false, error: data.error ?? "Lien invalide." };
  } catch {
    return { ok: false, error: "Connexion impossible." };
  }
}

export function logout(): void {
  setToken(null);
}

/** Fetch the current user from the server (validates the token). */
export async function fetchMe(): Promise<AuthUser | null> {
  if (!getToken()) return null;
  try {
    const res = await authFetch("/api/auth/me");
    if (!res.ok) return null;
    const data = (await res.json()) as { user: AuthUser | null };
    return data.user;
  } catch {
    return null;
  }
}

// ── useSyncExternalStore plumbing (login-state, not full user) ──
export function subscribeAuth(notify: () => void): () => void {
  window.addEventListener(CHANGED, notify);
  window.addEventListener("storage", notify);
  return () => {
    window.removeEventListener(CHANGED, notify);
    window.removeEventListener("storage", notify);
  };
}

export function getAuthSnapshot(): boolean {
  return getToken() !== null;
}

export function getServerAuthSnapshot(): boolean {
  return false;
}
