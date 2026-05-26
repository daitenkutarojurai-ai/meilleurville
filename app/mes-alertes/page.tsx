import type { Metadata } from "next";
import Link from "next/link";
import { Bell, MapPin, Trash2, CheckCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { findAllByEmail } from "@/lib/alertes-store";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Mes alertes villes · MaVilleIdeal",
  description: "Consultez et gérez vos alertes de suivi sur les villes françaises. Désabonnez-vous en un clic.",
  alternates: { canonical: "/mes-alertes" },
  robots: { index: false, follow: false },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function MesAlertesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const rawEmail = typeof sp.email === "string" ? sp.email.trim() : "";
  const email = EMAIL_RE.test(rawEmail) ? rawEmail : null;

  const alertes = email ? await findAllByEmail(email) : [];

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "Mes alertes", path: "/mes-alertes" },
  ]);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="mx-auto max-w-2xl px-4 sm:px-6 pt-20 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-6 w-6 text-[var(--accent)]" aria-hidden />
          <h1 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
            Mes alertes villes
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          Retrouvez toutes les alertes actives liées à votre adresse email. Désabonnez-vous depuis le lien
          reçu par email ou via la liste ci-dessous.
        </p>
      </section>

      {/* Email lookup form */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-6">
        <form method="GET" action="/mes-alertes" className="flex gap-2">
          <input
            type="email"
            name="email"
            defaultValue={rawEmail}
            placeholder="votre@email.fr"
            required
            autoComplete="email"
            className="flex-1 min-w-0 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)]"
          />
          <button
            type="submit"
            className="rounded-xl bg-[var(--accent)] text-white text-sm font-semibold px-5 py-2.5 hover:bg-[var(--accent-hover)] transition-colors shrink-0"
          >
            Voir mes alertes
          </button>
        </form>
        {rawEmail && !email && (
          <p className="mt-2 text-xs text-red-500">Adresse email invalide.</p>
        )}
      </section>

      {/* Results */}
      {email && (
        <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-16">
          {alertes.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 text-center">
              <Bell className="h-8 w-8 text-[var(--text-tertiary)] mx-auto mb-3" aria-hidden />
              <p className="text-sm text-[var(--text-secondary)]">
                Aucune alerte active pour <strong className="text-[var(--text-primary)]">{email}</strong>.
              </p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Vous pouvez créer une alerte depuis la fiche de n&apos;importe quelle ville.
              </p>
              <Link href="/villes" className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">
                Parcourir les villes →
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4 text-green-500" aria-hidden />
                <p className="text-sm text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">{alertes.length} alerte{alertes.length > 1 ? "s" : ""}</strong> active{alertes.length > 1 ? "s" : ""} pour {email}
                </p>
              </div>
              <div className="space-y-3">
                {alertes.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <MapPin className="h-4 w-4 text-[var(--accent)] mt-0.5 shrink-0" aria-hidden />
                        <div className="min-w-0">
                          <Link
                            href={`/villes/${a.citySlug}`}
                            className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                          >
                            {a.cityName}
                          </Link>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {a.types.includes("score") && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border)]">
                                Évolution du score{a.scoreThreshold ? ` ≥ ${a.scoreThreshold}/10` : ""}
                              </span>
                            )}
                            {a.types.includes("comments") && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)] border border-[var(--border)]">
                                Nouveaux commentaires
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                            Depuis le {new Date(a.subscribedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/api/alertes/unsubscribe?token=${a.unsubscribeToken}`}
                        className="shrink-0 flex items-center gap-1 text-[10px] text-[var(--text-tertiary)] hover:text-red-500 transition-colors border border-[var(--border)] rounded-lg px-2.5 py-1.5 hover:border-red-300"
                        title="Supprimer cette alerte"
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                        Supprimer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <Footer />
    </main>
  );
}
