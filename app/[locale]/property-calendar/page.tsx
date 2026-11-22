import { Metadata } from "next";
import Link from "@/components/AppLink";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyCalendar, type CalendarMonth } from "@/components/PropertyCalendar";
import { pathAlternatesEn } from "@/lib/i18n";

export async function generateStaticParams() {
  return [{ locale: "en" }];
}

export const revalidate = false;

export const metadata: Metadata = {
  title: "French property calendar 2026 · When to buy, sell or move",
  description:
    "Best months to buy, sell, rent or move in France: month-by-month seasonality of the property market, from notaires.fr, SeLoger and OLAP patterns.",
  alternates: pathAlternatesEn("/calendrier-immobilier", "/property-calendar"),
};

type Month = CalendarMonth;

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

export default function EnPropertyCalendarPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <PropertyCalendar
        locale="en"
        months={MONTHS}
        breadcrumb={
          <nav className="text-xs text-[var(--text-tertiary)] mb-4">
            <Link href="/" className="hover:underline">Home</Link>
            {" / "}
            <Link href="/tools" className="hover:underline">Tools</Link>
            {" / "}
            <span>Property calendar</span>
          </nav>
        }
        title="When to buy, sell, rent or move in France?"
        intro="Month-by-month seasonality of the French property market. Score from 1 (very unfavourable) to 5 (very favourable) for each action. Based on patterns observed in notaires.fr, SeLoger and OLAP data since 2018."
        links={[
          { href: "/guides", label: "All guides →" },
          { href: "/glossary", label: "Property glossary →" },
          { href: "/quiz/compatibility", label: "✨ Find your ideal French city →" },
        ]}
      />
      <Footer />
    </main>
  );
}
