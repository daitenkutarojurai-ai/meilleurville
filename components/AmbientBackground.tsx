/**
 * AmbientBackground — fixed behind everything (« Carte & plaque » identity).
 *  • Map-paper canvas with survey contour lines (static /textures/topo.svg)
 *  • Faint paper grain
 *  • Paper wash toward the bottom so long pages stay calm and readable
 *
 * Server component, no JS: it replaced a WebGL mesh gradient + falling leaves
 * (2026-10-16), which were the most "template" part of the site and cost a
 * client bundle on ~75 pages.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[var(--bg-canvas)]" aria-hidden>
      <div className="absolute inset-0 topo-bg opacity-[0.10]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-canvas)]/40 to-[var(--bg-canvas)]/80" />
      <div className="grain grain-soft" />
    </div>
  );
}
