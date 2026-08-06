import Link from "next/link";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RANKING_META } from "@/lib/rankings";
import { RANKINGS_COUNT } from "@/lib/site-stats";
import { rankingEn } from "@/lib/rankings-en";
import { t, ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

// Le compteur est dérivé, pas écrit à la main : la page annonçait 13 thèmes
// pour 19 classements réellement rendus juste en dessous.
export const metadata: Metadata = {
  title: `French city rankings · ${RANKINGS_COUNT} themed leaderboards`,
  description: `Independent rankings of French cities across ${RANKINGS_COUNT} themes (remote work, families, retirees, climate, cycling, seaside living…). Calibrated on official data — Insee, SSMSI, observatoires des loyers.`,
  alternates: { canonical: `${EN_BASE}/rankings` },
};

export default function EnRankingsIndex() {
  const all = Object.values(RANKING_META);

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-10 text-center">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          {t("rankings.title", "en")}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {t("rankings.intro", "en")}
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-6">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((r) => {
            const en = rankingEn(r.slug, r);
            return (
              <li key={r.slug}>
                <Link
                  href={`/rankings/${r.slug}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden>
                      {r.emoji}
                    </span>
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">
                      {en.label}
                    </h2>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {en.tagline}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <Footer />
    </main>
  );
}
