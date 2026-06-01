import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Privacy policy · BestCitiesInFrance",
  description:
    "How BestCitiesInFrance handles your data: data collected, cookies, affiliate disclosure, GDPR rights.",
  alternates: {
    canonical: `${EN_BASE}/privacy-policy`,
    languages: {
      fr: "https://www.mavilleideale.fr/confidentialite",
      en: `${EN_BASE}/privacy-policy`,
    },
  },
};

const SECTIONS = [
  {
    title: "1. Who controls your data?",
    content: `The data controller is Thomas Fendrich, sole trader (SIREN 797 983 665), publisher of BestCitiesInFrance (bestcitiesinfrance.com) and MaVilleIdeal (mavilleideale.fr).

GDPR contact: privacy@mavilleideale.fr
General contact: hello@bestcitiesinfrance.com

The site has no Data Protection Officer (DPO) and no joint controller — the publisher is the sole decision-maker.`,
  },
  {
    title: "2. What data we collect",
    content: `We collect only the strict minimum needed to run the service:

• Email address — only if you subscribe to the newsletter or post a review.
• Reviews and comments you publish voluntarily (text, scores, tags).
• Technical access logs managed by our hosting provider Cloudflare: IP address (anonymised within 30 days), user-agent, requested URL. These logs are used to detect abuse and to size infrastructure.
• Quiz answers and favourites — stored only in your browser via localStorage. This data is never sent to our server.

We never collect: precise geolocation, payment data, health data, political, religious or trade-union opinions, or any sensitive data within the meaning of article 9 of the GDPR.`,
  },
  {
    title: "3. Purposes and legal basis",
    content: `Your data is used only to:

• Run the service you requested (reviews, quiz, recommendations) — legal basis: performance of the service (art. 6.1.b GDPR).
• Send you the newsletter you explicitly subscribed to — legal basis: consent (art. 6.1.a GDPR), withdrawable at any time via the unsubscribe link in every email.
• Improve editorial quality and detect abuse — legal basis: legitimate interest (art. 6.1.f GDPR), balanced against your privacy rights.

No data is used for behavioural advertising, profiling, or audience resale.`,
  },
  {
    title: "4. Cookies and trackers",
    content: `BestCitiesInFrance uses a strict minimum of cookies:

• Strictly necessary technical cookies: browsing session, interface preferences (theme, language). These are exempt from consent under article 82 of the French Data Protection Act and the corresponding CNIL recommendation.
• No third-party advertising cookies — no Facebook Pixel, no Google Ads, no retargeting, no Hotjar.
• No statistical analytics cookies at this time. If we add an analytics tool in the future, it will be GDPR-friendly (cookieless or consent-exempt) and this page will be updated before activation.

The site is registered with Google Search Console to monitor indexing: this is a webmaster tool that does not place any cookies in your browser and does not collect individual usage data.

Booking.com may place its own cookies when you click a partner link and land on their site — those cookies are then governed by Booking.com's own privacy policy, not ours.`,
  },
  {
    title: "5. Affiliate links — Booking.com",
    content: `BestCitiesInFrance is part of the Booking.com Partners programme. Some outbound links to Booking.com (the "Find a hotel" buttons, the sticky bar, the vacation pages) are affiliate links.

In practice: if you click such a link and book accommodation on Booking, we earn a small commission from Booking. This does not change the price you pay. We never see your booking data — Booking only shares aggregated, anonymous statistics (clicks, bookings, total commission).

All affiliate links are labelled "partner link" and carry the HTML rel="sponsored" attribute. Our editorial work (scores, rankings, reviews) is fully independent from this commercial relationship.`,
  },
  {
    title: "6. Data retention",
    content: `• Newsletter email address: until you unsubscribe.
• Public reviews and comments: kept while the site exists, unless you ask for deletion.
• Cloudflare technical access logs: 30 days, then automatic anonymisation.
• Local preferences (favourites, quiz): only on your device — we never have a copy.

You can request deletion of your data at any time.`,
  },
  {
    title: "7. Your rights (GDPR)",
    content: `Under the General Data Protection Regulation (EU 2016/679) and the French Data Protection Act as amended, you have the following rights:

• Right of access — obtain a copy of your personal data.
• Right to rectification — correct inaccurate data.
• Right to erasure ("right to be forgotten").
• Right to restrict processing.
• Right to data portability — receive your data in a structured, reusable format.
• Right to object — on legitimate grounds.
• Right to set post-mortem directives concerning your data.

To exercise these rights, write to privacy@mavilleideale.fr. We respond within 30 days (statutory GDPR deadline). We do not require ID by default; minimal identity verification is performed only to prevent impersonation.

If you believe your rights have been infringed, you can lodge a complaint with the CNIL (www.cnil.fr), the French supervisory authority. You may also contact your national data protection authority.`,
  },
  {
    title: "8. Processors and recipients",
    content: `Your data may be processed by the following technical providers, exclusively for the purposes described above:

• Cloudflare, Inc. (United States) — hosting, CDN, technical logs. Cloudflare is certified under the EU–US Data Privacy Framework, which governs personal-data transfers to the United States (European Commission adequacy decision of 10 July 2023).
• Booking.com B.V. (Netherlands) — only if you click a partner link; no data is shared upstream.

We never sell your data. We never share it with data brokers, ad networks or profiling platforms.`,
  },
  {
    title: "9. Minors",
    content: `BestCitiesInFrance is not intended for children under 15. We do not knowingly collect data from minors. If you are a parent or guardian and you discover that your child has provided us with data, please write to privacy@mavilleideale.fr — we will delete it without delay.`,
  },
  {
    title: "10. Policy updates",
    content: `We may update this policy to reflect technical, legal or editorial changes. Any material change (new data category, new processor, new purpose) will be highlighted at the top of this page for at least 30 days.

Last updated: 31 May 2026.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
            Privacy policy
          </h1>
          <p className="text-sm text-[var(--text-tertiary)]">
            How we handle your data — honest version, no jargon.
          </p>
        </div>
        <div className="space-y-8">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-3">
                {s.title}
              </h2>
              <div className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-line">
                {s.content}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-8 border-t border-[var(--border)] flex flex-wrap gap-3">
          <Link
            href="/legal-notice"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            Legal notice →
          </Link>
          <Link href="/" className="text-sm text-[var(--accent)] hover:underline">
            Home →
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
