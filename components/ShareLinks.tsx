// Liens de partage sans JS ni traceur tiers (simples URL d'intention) :
// WhatsApp, X, Facebook, e-mail. Pensé pour les pages qui circulent en période
// électorale (« la projection de ma ville »), où le partage est le premier
// canal d'acquisition.

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.mavilleideale.fr";

export function ShareLinks({ path, text, label = "Partager" }: { path: string; text: string; label?: string }) {
  const url = `${BASE_URL}${path}`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(text);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}` },
    { name: "X", href: `https://twitter.com/intent/tweet?text=${t}&url=${u}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: "E-mail", href: `mailto:?subject=${t}&body=${encodeURIComponent(`${text}\n${url}`)}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-[var(--text-secondary)]">{label} :</span>
      {links.map((l) => (
        <a
          key={l.name}
          href={l.href}
          target="_blank"
          rel="noopener nofollow"
          className="inline-flex min-h-9 items-center rounded-full border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
        >
          {l.name}
        </a>
      ))}
    </div>
  );
}
