import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import {
  decodeAnswers,
  topMatchesWithSurprise,
  CITY_MATCH_QUESTIONS,
} from "@/lib/city-match";
import { scoreHex, scoreColor } from "@/lib/utils";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/jsonld";

type Props = { params: Promise<{ code: string }> };

// Render any submitted code on demand (combinatorial space is huge but each is
// deterministic and cheap to render).
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const answers = decodeAnswers(code);
  if (answers.length === 0) {
    return { title: "City Match — résultat introuvable" };
  }
  const { top } = topMatchesWithSurprise(answers, 1);
  const t = top[0];
  if (!t) return { title: "City Match — résultat" };
  return {
    title: `Mon match : ${t.city.name} à ${t.percent} % — City Match`,
    description: `Sur ${answers.length} priorités, ${t.city.name} est la ville française la plus alignée (${t.percent} % de match). Faites le test à votre tour.`,
    alternates: { canonical: `/city-match/r/${code}` },
    openGraph: {
      title: `${t.city.name} à ${t.percent} % · mon City Match`,
      description: "8 questions → vos 3 villes qui collent à votre vie.",
    },
  };
}

export default async function CityMatchResultPage({ params }: Props) {
  const { code } = await params;
  const answers = decodeAnswers(code);

  const breadcrumb = breadcrumbJsonLd([
    { name: "Accueil", path: "/" },
    { name: "City Match", path: "/city-match" },
    { name: "Résultat partagé", path: `/city-match/r/${code}` },
  ]);

  if (answers.length === 0) {
    return (
      <main id="main-content" className="min-h-screen">
        <Navbar />
        <section className="mx-auto max-w-4xl px-4 sm:px-6 py-16 text-center">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
            Lien de résultat invalide
          </h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Ce code de City Match n&apos;est pas reconnu. Faites le quiz pour générer un nouveau lien.
          </p>
          <Link
            href="/city-match"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--accent-hover)]"
          >
            Faire le test
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  const { top, surprise } = topMatchesWithSurprise(answers, 3);

  return (
    <main id="main-content" className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(breadcrumb)} />
      <Navbar />

      <section className="border-b border-[var(--border)] bg-[var(--bg-surface)] py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <Badge variant="accent" className="mb-3">Résultat partagé · City Match</Badge>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-3">
            <Sparkles className="h-3 w-3" /> Match calculé
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-2">
            {top[0]?.city.name} correspond à {top[0]?.percent} %
          </h1>
          <p className="text-[var(--text-secondary)] max-w-xl mx-auto">
            Voici les 3 villes les plus alignées avec un profil basé sur{" "}
            <strong>{answers.length}</strong> priorités.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-8">
        {/* Quoi a été demandé */}
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-canvas)] p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)] mb-2">
            Priorités de la personne
          </div>
          <div className="flex flex-wrap gap-1.5">
            {answers.map((a) => {
              const q = CITY_MATCH_QUESTIONS.find((q) => q.id === a.id);
              const o = q?.options.find((o) => o.value === a.value);
              if (!q || !o) return null;
              return (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] px-2.5 py-0.5 text-[11px] text-[var(--text-secondary)]"
                >
                  {o.emoji} {o.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Top 3 */}
        <div className="grid gap-4 md:grid-cols-3">
          {top.map((r, i) => (
            <Link
              key={r.city.slug}
              href={`/villes/${r.city.slug}`}
              className={
                "group block rounded-3xl border p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg " +
                (i === 0
                  ? "border-[var(--accent)] bg-gradient-to-br from-[var(--accent)]/10 to-transparent shadow-md"
                  : "border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]/40")
              }
            >
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-[var(--text-tertiary)]">
                  #{i + 1}
                </span>
                <div
                  className="text-2xl font-bold font-mono-data"
                  style={{ color: scoreHex(r.city.scores.global) }}
                >
                  {r.percent}<span className="text-sm text-[var(--text-tertiary)]">%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors leading-tight">
                {r.city.name}
              </h3>
              <p className="text-xs text-[var(--text-tertiary)] truncate mt-0.5">{r.city.region}</p>

              {r.topReasons.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {r.topReasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-[var(--text-secondary)]">
                      <span className={scoreColor(r.city.scores.global)}>●</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4 text-xs font-semibold text-[var(--accent)] group-hover:underline">
                Voir la fiche →
              </div>
            </Link>
          ))}
        </div>

        {surprise && (
          <div className="rounded-3xl border border-amber-400/30 bg-amber-500/5 p-5">
            <div className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-2">
              🎲 Match surprise
            </div>
            <Link
              href={`/villes/${surprise.city.slug}`}
              className="group flex items-baseline justify-between gap-3"
            >
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {surprise.city.name}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)] truncate">{surprise.city.region}</p>
                {surprise.topReasons.length > 0 && (
                  <p className="text-xs text-[var(--text-secondary)] mt-1">
                    {surprise.topReasons.join(" · ")}
                  </p>
                )}
              </div>
              <span
                className="shrink-0 text-2xl font-bold font-mono-data"
                style={{ color: scoreHex(surprise.city.scores.global) }}
              >
                {surprise.percent}<span className="text-sm">%</span>
              </span>
            </Link>
          </div>
        )}

        {/* CTA — your turn */}
        <div className="rounded-3xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/10 to-transparent p-6 text-center">
          <p className="text-sm font-bold text-[var(--text-primary)] mb-3">
            Et vous, quelle ville colle à votre vie ?
          </p>
          <Link
            href="/city-match"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors"
          >
            Faire le test
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
