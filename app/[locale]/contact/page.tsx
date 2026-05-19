import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ORIGIN_BY_LOCALE } from "@/lib/i18n";

const EN_BASE = ORIGIN_BY_LOCALE.en;

export const metadata: Metadata = {
  title: "Contact · BestCitiesInFrance",
  description:
    "Get in touch with BestCitiesInFrance — feedback on rankings, data corrections, partnerships, or just a question about France.",
  alternates: { canonical: `${EN_BASE}/contact` },
};

export default function EnContact() {
  return (
    <main id="main-content" className="min-h-screen">
      <Navbar />
      <section className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 pb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-6">
          Contact
        </h1>
        <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8">
          Feedback on a ranking, a data correction, a partnership, or just a question about a French city? Pick whichever channel works for you.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="mailto:hello@mavilleideale.fr?subject=BestCitiesInFrance"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
          >
            <h2 className="font-bold text-[var(--text-primary)] mb-2">Email</h2>
            <p className="text-sm text-[var(--text-secondary)]">hello@mavilleideale.fr</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-2">Reply within ~48 hours.</p>
          </a>
          <a
            href="mailto:hello@mavilleideale.fr?subject=Data correction"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
          >
            <h2 className="font-bold text-[var(--text-primary)] mb-2">Data correction</h2>
            <p className="text-sm text-[var(--text-secondary)]">Spotted a wrong figure? Send the city + the number + the source. We update fast.</p>
          </a>
          <a
            href="mailto:hello@mavilleideale.fr?subject=Press"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
          >
            <h2 className="font-bold text-[var(--text-primary)] mb-2">Press &amp; media</h2>
            <p className="text-sm text-[var(--text-secondary)]">Quote our data, embed a ranking, or interview the editor.</p>
          </a>
          <a
            href="mailto:hello@mavilleideale.fr?subject=Partnership"
            className="block rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg"
          >
            <h2 className="font-bold text-[var(--text-primary)] mb-2">Partnership</h2>
            <p className="text-sm text-[var(--text-secondary)]">Affiliate, co-marketing, content syndication — no paid rankings.</p>
          </a>
        </div>

        <div className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-6">
          <h2 className="font-bold text-[var(--text-primary)] mb-2">Editorial policy</h2>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            We don't sell rankings, sponsored placements, or "featured city" slots. If a partner emails us asking for a higher score, the answer is no, regardless of the offer. <Link href="/methodology" className="text-[var(--accent)] hover:underline">See the methodology</Link>.
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}
