import Link from "next/link";

type Crumb = { label: string; href?: string };

interface Props {
  items: Crumb[];
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

/**
 * Visible breadcrumb trail + embedded BreadcrumbList JSON-LD. Drop into any
 * page that's not the home, immediately under the hero. Crumbs without href
 * are rendered as plain text (used for the current page).
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
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] mb-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          {c.href ? (
            <Link href={c.href} className="hover:text-[var(--text-secondary)] transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-[var(--text-secondary)]">{c.label}</span>
          )}
          {i < items.length - 1 && <span aria-hidden>/</span>}
        </span>
      ))}
    </nav>
  );
}
