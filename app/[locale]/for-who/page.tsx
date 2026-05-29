import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Which French city suits your profile? — Top 20 lists 2026",
  description:
    "13 lifestyle profiles, 13 top-20 rankings calibrated on the axes that actually matter: families, couples, young professionals, retirees, freelancers, students, first-time buyers, single parents, and more.",
  alternates: { canonical: `${EN_BASE}/for-who` },
};

const PROFILES = [
  { enSlug: "families", emoji: "👨‍👩‍👧", label: "Families with children", intro: "Schools + safety + green space + affordable living — the real family trade-off." },
  { enSlug: "young-professionals", emoji: "🚀", label: "Young professionals", intro: "Job market momentum, culture, affordable rents, and a network to actually make friends." },
  { enSlug: "retirees", emoji: "🌅", label: "Retirees", intro: "Health, safety, mild climate, quality daily life — the retirement combination that holds." },
  { enSlug: "freelancers", emoji: "💼", label: "Freelancers", intro: "Fibre, coworking, a local community of independents, and quality of life to avoid burnout." },
  { enSlug: "remote-workers", emoji: "💻", label: "Remote workers", intro: "Keep your Paris employer, trade the rent for quality of life. These 20 cities optimise that ratio." },
  { enSlug: "students", emoji: "🎓", label: "Students", intro: "Universities, nightlife, transport, and rents compatible with a student budget." },
  { enSlug: "car-free", emoji: "🚲", label: "Car-free living", intro: "Tram, metro, bus, cycling — cities where you can genuinely ditch the car." },
  { enSlug: "premium", emoji: "✨", label: "Premium lifestyle", intro: "High safety, exceptional setting, renowned schools, rich culture. For budgets €4,000+/month." },
  { enSlug: "women-solo", emoji: "👤", label: "Women living solo", intro: "Night safety + late transport + urban quality of life. Getting home serene, every evening." },
  { enSlug: "couples", emoji: "👫", label: "Couples without children", intro: "Culture, restaurants, nature weekends, transport — the DINK combination that actually matters." },
  { enSlug: "returning-expats", emoji: "✈️", label: "Returning expats", intro: "Transitioning from an international lifestyle back to France — without feeling like a downgrade." },
  { enSlug: "first-time-buyers", emoji: "🔑", label: "First-time buyers", intro: "Affordable entry prices, low taxes, rental yield potential — cities where a first home is within reach." },
  { enSlug: "single-parents", emoji: "🧑‍👧", label: "Single parents", intro: "Good schools, safe streets, walkable daily life — family life manageable on a single income." },
];

export default function ForWhoIndex() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="pt-20 pb-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <div className="mb-3 inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1 text-sm text-[var(--text-secondary)]">
            👥 Top cities by profile
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] mb-3 tracking-tight">
            Which French city suits your profile?
          </h1>
          <p className="text-[var(--text-secondary)] text-base max-w-2xl mx-auto">
            13 lifestyle profiles, 13 top-20 rankings calibrated on the axes that actually
            matter for each one. More useful than a generic global score.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PROFILES.map((p) => (
            <Link key={p.enSlug} href={`/for-who/${p.enSlug}`} className="block">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-4 hover:border-[var(--accent)]/40 cursor-pointer transition-colors h-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl" aria-hidden>{p.emoji}</span>
                  <h2 className="text-base font-bold text-[var(--text-primary)]">{p.label}</h2>
                </div>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-3">{p.intro}</p>
                <p className="text-[11px] text-[var(--accent)] mt-3 underline">
                  See top 20 →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <p className="text-sm text-[var(--text-secondary)]">
            For a personalised match combining ALL your criteria, take the{" "}
            <Link href="/city-match" className="underline text-[var(--accent)]">
              compatibility quiz
            </Link>{" "}
            — 10 questions, top 5 cities with contribution per criterion.
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
