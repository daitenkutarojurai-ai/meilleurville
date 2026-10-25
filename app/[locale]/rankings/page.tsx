import Link from "@/components/AppLink";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RANKING_META } from "@/lib/rankings";
import { RANKINGS_COUNT } from "@/lib/site-stats";
import { rankingEn } from "@/lib/rankings-en";
import { t, pathAlternatesEn } from "@/lib/i18n";

// Le compteur est dérivé, pas écrit à la main : la page annonçait 13 thèmes
// pour 19 classements réellement rendus juste en dessous.
export const metadata: Metadata = {
  title: `French city rankings · ${RANKINGS_COUNT} themed leaderboards`,
  description: `Independent rankings of French cities across ${RANKINGS_COUNT} themes (remote work, families, retirees, climate, cycling, seaside living…). Calibrated on official data — Insee, SSMSI, observatoires des loyers.`,
  alternates: pathAlternatesEn("/classements", "/rankings"),
};

export default function EnRankingsIndex() {
  const all = Object.values(RANKING_META);
  const sheetTotal = String(all.length).padStart(2, "0");

  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-aurora px-4 sm:px-6 pt-20 pb-12 text-center">
        <div className="mx-auto max-w-5xl">
        <h1 className="text-4xl sm:text-6xl font-bold text-[var(--text-primary)] mb-4 tracking-tight leading-[1.05]">
          {t("rankings.title", "en")}
        </h1>
        <p className="text-[var(--text-secondary)] text-lg max-w-2xl mx-auto">
          {t("rankings.intro", "en")}
        </p>
        <p className="mt-3 text-[var(--text-secondary)] max-w-2xl mx-auto">
          Prefer no lifestyle filter at all?{" "}
          <Link href="/reviews" className="text-[var(--accent)] hover:underline">
            Every city rating sits in one place
          </Link>
          , best and worst side by side.
        </p>
        </div>
      </section>

      <section className="band band-indigo px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-6xl">
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {all.map((r, idx) => {
            const en = rankingEn(r.slug, r);
            // Same « sheet NN / 19 » numbering as the FR hub and the detail
            // pages, derived from RANKING_META order — never typed by hand.
            const sheetNo = String(idx + 1).padStart(2, "0");
            return (
              <li key={r.slug}>
                <Link
                  href={`/rankings/${r.slug}`}
                  className="group block h-full rounded-2xl bg-white p-5 ring-1 ring-[var(--accent)]/12 shadow-[0_10px_24px_-16px_rgba(79,70,229,0.55)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-16px_rgba(219,39,119,0.55)]"
                >
                  {/* « Couleurs »: numbered gradient tile rotated by index,
                      mono label, title. No category emoji. */}
                  <div className="flex items-center gap-3">
                    <span className={`grad-head-${idx % 6} flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-mono-data text-sm font-bold`} aria-hidden>
                      {sheetNo}
                    </span>
                    <div className="min-w-0">
                      <p className="font-mono-data text-[10px] uppercase tracking-[0.18em] text-[var(--accent-hover)]">
                        Ranking {sheetNo} / {sheetTotal}
                      </p>
                      <h2 className="text-lg font-bold leading-snug text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {en.label}
                      </h2>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    {en.tagline}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
        </div>
      </section>

      <Footer />
    </main>
  );
}
