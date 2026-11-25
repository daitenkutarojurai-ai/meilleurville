import { ExternalLink } from "lucide-react";
import Link from "@/components/AppLink";
import { activeAwinProgrammes, awinLink, type AwinPlacement } from "@/lib/awin";

interface Props {
  placement: AwinPlacement;
  /** Préfixe du clickref Awin, ex. `sinstaller-lyon`. */
  clickref: string;
  title: string;
  mountain?: boolean;
}

/**
 * Liens partenaires Awin. Ne rend rien tant qu'aucun programme de
 * l'emplacement n'est accepté (`joined` dans `lib/awin.ts`).
 * Même règle que `BookingCTA` : mention « lien partenaire » visible et
 * `rel="sponsored"` sur chaque lien.
 */
export function PartnerOffers({ placement, clickref, title, mountain }: Props) {
  const programmes = activeAwinProgrammes(placement, { mountain });
  if (programmes.length === 0) return null;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {programmes.map((p) => (
          <li key={p.mid}>
            <a
              href={awinLink(p.mid, `${clickref}-${p.mid}`)}
              target="_blank"
              rel="sponsored noopener"
              className="group flex h-full items-start justify-between gap-3 rounded-lg border border-[var(--border)] px-4 py-3 hover:border-[var(--accent)]/40 hover:shadow-sm transition-all"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {p.label}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--text-tertiary)]">{p.blurb}</span>
              </span>
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-tertiary)]" />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[var(--text-tertiary)]">
        Liens partenaires : nous touchons une commission si vous souscrivez ou réservez via ces liens,
        sans surcoût pour vous. Ils n&apos;entrent ni dans nos notes ni dans nos classements.{" "}
        <Link href="/mentions-legales#affiliation" className="underline hover:text-[var(--accent)]">
          En savoir plus
        </Link>
      </p>
    </section>
  );
}
