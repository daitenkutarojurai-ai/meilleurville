import { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/Badge";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "French property calendar 2026 · When to buy, sell, rent or move?",
  description:
    "Best months for buying, selling, renting or moving in France. Month-by-month seasonality of the French property market. Based on notaires.fr, SeLoger and OLAP patterns since 2018.",
  alternates: { canonical: `${EN_BASE}/property-calendar` },
};

type Month = {
  name: string;
  emoji: string;
  buy: { score: 1 | 2 | 3 | 4 | 5; tip: string };
  sell: { score: 1 | 2 | 3 | 4 | 5; tip: string };
  rent: { score: 1 | 2 | 3 | 4 | 5; tip: string };
  move: { score: 1 | 2 | 3 | 4 | 5; tip: string };
};

const MONTHS: Month[] = [
  {
    name: "January",
    emoji: "❄️",
    buy: { score: 4, tip: "Quiet market, motivated vendors at the start of the year. Good negotiation window (−3 to −5% vs September asking prices)." },
    sell: { score: 2, tip: "Very few active buyers. Only list in late January if necessary — wait for March/April." },
    rent: { score: 2, tip: "Weak rental market (little mobility outside students). Limited tenants in large cities." },
    move: { score: 3, tip: "Removal companies available at low rates, but winter conditions (ice, frost) carry risks." },
  },
  {
    name: "February",
    emoji: "🌨️",
    buy: { score: 4, tip: "Continued winter lull. Viewings are less competitive, vendors open to negotiation." },
    sell: { score: 2, tip: "Use this time to prepare your listing (photos, diagnostics) for a March launch." },
    rent: { score: 2, tip: "Low rental demand outside students. Landlords flexible." },
    move: { score: 3, tip: "Low rates but unfavourable weather. School holidays create some peak periods." },
  },
  {
    name: "March",
    emoji: "🌷",
    buy: { score: 3, tip: "Market restarts. More properties online, but also more buyers — competition picks up." },
    sell: { score: 4, tip: "Excellent listing window (gardens in bloom, better light). Good photos are essential." },
    rent: { score: 3, tip: "Rental market returns, especially in university cities." },
    move: { score: 4, tip: "Weather improving, removal costs still moderate." },
  },
  {
    name: "April",
    emoji: "🌸",
    buy: { score: 3, tip: "Tight market, prices at their spring peak. Target listings that have been online ≥45 days (sellers more flexible)." },
    sell: { score: 5, tip: "Best month to sell: maximum active buyers, properties at their most attractive in spring light." },
    rent: { score: 3, tip: "Sustained rental market, especially furnished." },
    move: { score: 4, tip: "Rates rising — book 4–6 weeks ahead." },
  },
  {
    name: "May",
    emoji: "🌼",
    buy: { score: 3, tip: "Activity peak. A well-priced property sells fast. Bidding wars in high-tension cities." },
    sell: { score: 5, tip: "Peak buyers, capitalise on the long bank-holiday weekends (1 May, 8 May, Ascension)." },
    rent: { score: 3, tip: "Good letting window, balanced demand." },
    move: { score: 3, tip: "High demand, high prices. Book well in advance." },
  },
  {
    name: "June",
    emoji: "☀️",
    buy: { score: 2, tip: "End of spring cycle, many properties already sold. Remaining stock is often lower quality." },
    sell: { score: 4, tip: "Still a good month, but demand starting to ease as buyers go on holiday." },
    rent: { score: 5, tip: "Student rental peak — landlords in a strong position; prefer stable families over students if possible." },
    move: { score: 2, tip: "Peak season, rates +30 to +50%. Book 2 months ahead — essential." },
  },
  {
    name: "July",
    emoji: "🌞",
    buy: { score: 2, tip: "Market on pause, buyers on holiday. Some bargains on properties that haven't sold." },
    sell: { score: 1, tip: "Very few active buyers (holidays). Suspend the listing until September." },
    rent: { score: 5, tip: "Holiday lettings peak. Student furnished market tightening (new term approaching)." },
    move: { score: 1, tip: "Peak removal season, maximum rates (+50 to +80%). Avoid unless absolutely necessary." },
  },
  {
    name: "August",
    emoji: "🏖️",
    buy: { score: 2, tip: "Market almost at a standstill, but ideal for viewings without competition." },
    sell: { score: 1, tip: "No transactions. Wait for September." },
    rent: { score: 4, tip: "Strong student rental demand (start of term). Landlord in a strong position." },
    move: { score: 1, tip: "Saturated season, maximum rates. Book 3 months ahead if unavoidable." },
  },
  {
    name: "September",
    emoji: "🍂",
    buy: { score: 4, tip: "Post-holiday restart, motivated sellers (before year-end). Good period for serious buyers." },
    sell: { score: 4, tip: "Excellent back-to-school window. Serious post-holiday buyers. Autumn light works well in photos." },
    rent: { score: 4, tip: "Student peak tapering, family market returns. Landlord still in a strong position." },
    move: { score: 2, tip: "High demand, elevated rates. Book early." },
  },
  {
    name: "October",
    emoji: "🍁",
    buy: { score: 4, tip: "Continuation of the back-to-school period, active but less frenetic. Good negotiation window." },
    sell: { score: 4, tip: "Steady sales, serious buyers. Aim to sell before All Saints' Day to complete before year-end." },
    rent: { score: 3, tip: "Stable rental market. Families searching." },
    move: { score: 3, tip: "Moderate rates, decent weather. All Saints' holiday creates a small spike." },
  },
  {
    name: "November",
    emoji: "🌧️",
    buy: { score: 4, tip: "Market slowing, sellers want to complete before year-end. Excellent negotiation window (−3 to −7%)." },
    sell: { score: 3, tip: "Only list if your property is genuinely attractive. Otherwise wait for March." },
    rent: { score: 2, tip: "Quiet rental market. Low mobility." },
    move: { score: 3, tip: "Rates falling. Variable weather (rain)." },
  },
  {
    name: "December",
    emoji: "🎄",
    buy: { score: 4, tip: "Annual low point — highly motivated sellers (year-end tax incentives). Best negotiation window after January." },
    sell: { score: 1, tip: "Very little activity. Suspend until March." },
    rent: { score: 1, tip: "Rental market almost zero (festive period). Defer to January." },
    move: { score: 3, tip: "Low rates but winter conditions. School holidays create some spikes." },
  },
];

const SCORE_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "bg-red-500/15 text-red-400 border-red-500/30",
  2: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  3: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  4: "bg-lime-500/15 text-lime-400 border-lime-500/30",
  5: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

const SCORE_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "Very unfavourable",
  2: "Unfavourable",
  3: "Neutral",
  4: "Favourable",
  5: "Very favourable",
};

export default function EnPropertyCalendarPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />

      <section className="bg-[var(--bg-surface)] border-b border-[var(--border)] py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <Link href="/tools" className="hover:underline">Tools</Link>
            {" / "}
            <span>Property calendar</span>
          </nav>
          <Badge variant="accent" className="mb-3">Calendar 2026</Badge>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
            When to buy, sell, rent or move in France?
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            Month-by-month seasonality of the French property market. Score from 1 (very
            unfavourable) to 5 (very favourable) for each action. Based on patterns observed
            in notaires.fr, SeLoger and OLAP data since 2018.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
        {/* Legend */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--text-tertiary)] font-semibold mb-3">
            Score legend
          </p>
          <div className="flex flex-wrap gap-2">
            {([1, 2, 3, 4, 5] as const).map((s) => (
              <span
                key={s}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${SCORE_COLORS[s]}`}
              >
                <span className="font-mono-data font-bold">{s}/5</span> {SCORE_LABELS[s]}
              </span>
            ))}
          </div>
        </div>

        {/* Months */}
        <div className="space-y-6">
          {MONTHS.map((m) => (
            <article
              key={m.name}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-6"
            >
              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-3xl">{m.emoji}</span>
                <h2 className="text-xl font-bold text-[var(--text-primary)]">{m.name}</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {([
                  ["Buy", m.buy],
                  ["Sell", m.sell],
                  ["Let (as a landlord)", m.rent],
                  ["Move", m.move],
                ] as const).map(([label, item]) => (
                  <div key={label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-canvas)] p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold font-mono-data ${SCORE_COLORS[item.score]}`}
                      >
                        {item.score}/5
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      {item.tip}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* Related */}
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            All guides →
          </Link>
          <Link
            href="/glossary"
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            Property glossary →
          </Link>
          <Link
            href="/quiz/compatibility"
            className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 px-4 py-2.5 text-sm text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
          >
            ✨ Find your ideal French city →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
