import Link from "@/components/AppLink";

type Crumb = { label: string; href?: string };

interface Props {
  items: Crumb[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";
const IS_EN = process.env.NEXT_PUBLIC_DEFAULT_LOCALE === "en";

/**
 * Visible breadcrumb trail + embedded BreadcrumbList JSON-LD. Drop into any
 * page that's not the home, immediately under the hero. Crumbs without href
 * are rendered as plain text (used for the current page).
 *
 * Rendered as an ordered list (the trail is a sequence, and that is what
 * assistive tech and crawlers expect), wrapping on narrow screens instead of
 * overflowing, with the current page marked `aria-current`. The look follows
 * « Carte & plaque »: a route traced in ink, the current stop on a small
 * paper tag.
 */
export function Breadcrumbs({ items }: Props) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: c.href.startsWith("http") ? c.href : `${BASE_URL}${c.href}` } : {}),
    })),
  };

  return (
    <nav aria-label={IS_EN ? "Breadcrumb" : "Fil d'Ariane"} className="mb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-[var(--text-tertiary)]">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5 min-w-0">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="underline decoration-[var(--border)] decoration-1 underline-offset-[3px] hover:text-[var(--accent)] hover:decoration-[var(--accent)] transition-colors"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={
                    last
                      ? "truncate rounded-[4px] border border-[var(--border)] bg-[var(--bg-surface)] px-1.5 py-0.5 font-medium text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }
                >
                  {c.label}
                </span>
              )}
              {!last && (
                <span aria-hidden className="opacity-60">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
