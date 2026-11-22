import type { ReactNode } from "react";
import Link from "@/components/AppLink";
import { EmojiBadge } from "@/components/EmojiBadge";

// Gabarit partagé du calendrier immobilier (FR `/calendrier-immobilier`, EN
// `/property-calendar`). Composant serveur, zéro JS : les ancres de mois et le
// tableau d'ensemble marchent sans script.
//
// Identité « Couleurs » : hero en aurore, vue d'ensemble en bande blanche, un
// trimestre par bande (indigo, rose, ciel, aqua), liens en bande vive. Les notes
// 1-5 gardent les teintes des paliers (rouge → vert, c'est une échelle de note),
// en fond pastel + encre foncée pour tenir le contraste AA.

export type Rating = 1 | 2 | 3 | 4 | 5;
export type CalendarMonth = {
  name: string;
  emoji: string;
  buy: { score: Rating; tip: string };
  sell: { score: Rating; tip: string };
  rent: { score: Rating; tip: string };
  move: { score: Rating; tip: string };
};

const RATING_CLASS: Record<Rating, string> = {
  1: "bg-[#FEE2E2] text-[#991B1B] ring-[#FCA5A5]",
  2: "bg-[#FFEDD5] text-[#9A3412] ring-[#FDBA74]",
  3: "bg-[#FEF3C7] text-[#92400E] ring-[#FCD34D]",
  4: "bg-[#ECFCCB] text-[#3F6212] ring-[#BEF264]",
  5: "bg-[#D1FAE5] text-[#065F46] ring-[#6EE7B7]",
};

const QUARTER_BANDS = ["band-indigo", "band-pink", "band-sky", "band-aqua"] as const;
const QUARTER_TONES = ["indigo", "pink", "sky", "aqua"] as const;
const CARD_RINGS = ["ring-[#C7D2FE]", "ring-[#FBCFE8]", "ring-[#BAE6FD]", "ring-[#A5F3FC]"];
const ACTION_EMOJI = ["🔑", "🏷️", "📝", "🚚"];
const ACTION_TINT = [
  "bg-[#E0E7FF] ring-[#C7D2FE]",
  "bg-[#FCE7F3] ring-[#FBCFE8]",
  "bg-[#CFFAFE] ring-[#A5F3FC]",
  "bg-[#F3E8FF] ring-[#E9D5FF]",
];

const COPY = {
  fr: {
    badge: "Calendrier 2026",
    legend: "Légende des notes",
    overview: "Vue d'ensemble",
    overviewTitle: "L'année en un coup d'œil",
    month: "Mois",
    actions: ["Acheter", "Vendre", "Louer / louer à un locataire", "Déménager"],
    shortActions: ["Acheter", "Vendre", "Louer", "Déménager"],
    ratingLabels: { 1: "Très défavorable", 2: "Défavorable", 3: "Moyen", 4: "Favorable", 5: "Très favorable" },
    quarter: (q: number) => (q === 0 ? "1er trimestre" : `${q + 1}e trimestre`),
    jump: "Aller au mois",
    more: "Pour aller plus loin",
  },
  en: {
    badge: "Calendar 2026",
    legend: "Score legend",
    overview: "Overview",
    overviewTitle: "The year at a glance",
    month: "Month",
    actions: ["Buy", "Sell", "Let (as a landlord)", "Move"],
    shortActions: ["Buy", "Sell", "Let", "Move"],
    ratingLabels: { 1: "Very unfavourable", 2: "Unfavourable", 3: "Average", 4: "Favourable", 5: "Very favourable" },
    quarter: (q: number) => `Q${q + 1}`,
    jump: "Jump to month",
    more: "Keep going",
  },
} as const;

function anchorFor(name: string) {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function RatingPill({ score, size = "sm" }: { score: Rating; size?: "sm" | "xs" }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-bold font-mono-data ring-1 ${RATING_CLASS[score]} ${
        size === "xs" ? "min-w-[2.25rem] px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-[11px]"
      }`}
    >
      {score}/5
    </span>
  );
}

export function PropertyCalendar({
  locale,
  months,
  breadcrumb,
  title,
  intro,
  links,
}: {
  locale: "fr" | "en";
  months: CalendarMonth[];
  breadcrumb: ReactNode;
  title: string;
  intro: string;
  links: Array<{ href: string; label: string }>;
}) {
  const c = COPY[locale];
  const quarters = [0, 1, 2, 3].map((q) => months.slice(q * 3, q * 3 + 3));

  return (
    <>
      <section className="relative overflow-hidden bg-aurora pt-20 pb-12 sm:pb-14">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6">
          {breadcrumb}
          <div className="flex items-center gap-3 mb-4">
            <EmojiBadge emoji="📅" tone="indigo" />
            <span className="inline-flex items-center rounded-full grad-head-0 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
              {c.badge}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-4">
            <span className="gradient-text">{title}</span>
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed max-w-3xl">{intro}</p>
          <nav aria-label={c.jump} className="mt-6 flex flex-wrap gap-2">
            {months.map((m, i) => (
              <a
                key={m.name}
                href={`#${anchorFor(m.name)}`}
                className={`inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#3730A3] ring-1 transition-all hover:-translate-y-0.5 hover:bg-white ${CARD_RINGS[Math.floor(i / 3)]}`}
              >
                <span aria-hidden="true">{m.emoji}</span>
                {m.name}
              </a>
            ))}
          </nav>
        </div>
      </section>

      <section className="band band-white py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-2">
            <EmojiBadge emoji="🗓️" tone="lilac" size="sm" />
            <p className="text-xs uppercase tracking-widest font-semibold text-[#6D28D9]">{c.overview}</p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-5">{c.overviewTitle}</h2>

          <div className="mb-6 rounded-2xl bg-[#F5F3FF] p-4 ring-1 ring-[#E9D5FF]">
            <p className="text-xs uppercase tracking-widest text-[#6D28D9] font-semibold mb-3">{c.legend}</p>
            <div className="flex flex-wrap gap-2">
              {([1, 2, 3, 4, 5] as const).map((s) => (
                <span
                  key={s}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ${RATING_CLASS[s]}`}
                >
                  <span className="font-mono-data font-bold">{s}/5</span> {c.ratingLabels[s]}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl bg-white shadow-[0_14px_36px_-22px_rgba(79,70,229,0.5)] ring-1 ring-[#C7D2FE]">
            <table className="w-full text-sm">
              <thead>
                <tr className="grad-head-0">
                  <th scope="col" className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-wider">
                    {c.month}
                  </th>
                  {c.shortActions.map((a, ai) => (
                    <th key={a} scope="col" className="px-1.5 py-3 text-center text-[11px] font-semibold uppercase tracking-wider">
                      <span aria-hidden="true" className="hidden sm:inline mr-1">{ACTION_EMOJI[ai]}</span>
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {months.map((m, i) => (
                  <tr
                    key={m.name}
                    className={`border-b border-[#E0E7FF] last:border-0 ${i % 2 ? "bg-[#F8F9FF]" : "bg-white"}`}
                  >
                    <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-semibold">
                      <a href={`#${anchorFor(m.name)}`} className="text-[var(--text-primary)] hover:text-[#4338CA] hover:underline underline-offset-2">
                        <span aria-hidden="true" className="mr-1.5 hidden sm:inline">{m.emoji}</span>
                        {m.name}
                      </a>
                    </th>
                    {[m.buy, m.sell, m.rent, m.move].map((item, ai) => (
                      <td key={ai} className="px-1.5 py-2 text-center">
                        <RatingPill score={item.score} size="xs" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {quarters.map((qMonths, q) => (
        <section key={q} className={`band ${QUARTER_BANDS[q]} py-12`}>
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-6">
              <EmojiBadge emoji={qMonths[0].emoji} tone={QUARTER_TONES[q]} size="sm" />
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
                {c.quarter(q)}
                <span className="ml-2 text-base font-medium text-[var(--text-secondary)]">
                  · {qMonths[0].name} – {qMonths[qMonths.length - 1].name}
                </span>
              </h2>
            </div>
            <div className="space-y-6">
              {qMonths.map((m, mi) => {
                const idx = q * 3 + mi;
                return (
                  <article
                    key={m.name}
                    id={anchorFor(m.name)}
                    className={`scroll-mt-20 overflow-hidden rounded-2xl bg-white ring-1 shadow-[0_14px_34px_-22px_rgba(79,70,229,0.55)] ${CARD_RINGS[q]}`}
                  >
                    <div className={`grad-head-${idx % 6} flex items-center gap-3 px-5 py-3`}>
                      <span aria-hidden="true" className="text-2xl leading-none">{m.emoji}</span>
                      <h3 className="text-lg font-bold text-white">{m.name}</h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3 p-4 sm:p-5">
                      {[m.buy, m.sell, m.rent, m.move].map((item, ai) => (
                        <div key={ai} className="rounded-xl bg-[#F8F9FF] p-4 ring-1 ring-[#E0E7FF]">
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
                              <span aria-hidden="true" className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm ring-1 ${ACTION_TINT[ai]}`}>
                                {ACTION_EMOJI[ai]}
                              </span>
                              {c.actions[ai]}
                            </p>
                            <RatingPill score={item.score} />
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{item.tip}</p>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      <section className="band band-bold py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <p className="text-xs uppercase tracking-widest font-semibold text-white/85 mb-4">{c.more}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {links.map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  i === links.length - 1
                    ? "inline-flex items-center rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#4338CA] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    : "inline-flex items-center rounded-full bg-white/15 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/50 transition-all hover:-translate-y-0.5 hover:bg-white/25"
                }
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
