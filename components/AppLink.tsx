import type { AnchorHTMLAttributes, Ref } from "react";

/**
 * Lien interne rendu en `<a>` natif, à la place de `next/link`.
 *
 * Pourquoi (audit 2026-10-09). L'export statique supprime toutes les charges
 * RSC au `postbuild` (`find out -name '*.txt' ! -name robots.txt -delete`) —
 * sans ça, `out/` dépasserait la limite de fichiers des Workers Static Assets.
 * Or `next/link` précharge la charge RSC (`…/__next._tree.txt?_rsc=…`) de
 * chaque lien visible, puis la redemande au clic : **chaque** préchargement
 * répondait 404 (15 à 20 par page vue, mesurés par Lighthouse sur la home, une
 * page ville, un guide et /classements), chacun passait par le Worker
 * (`run_worker_first`, donc facturé), polluait la console et pesait sur le
 * score « bonnes pratiques » — et au clic Next retombait de toute façon sur une
 * navigation navigateur complète après l'échec. Un `<a>` fait exactement cette
 * navigation, sans les requêtes perdues.
 *
 * `prefetch` est accepté et ignoré pour rester compatible avec les appels
 * existants ; `href` est une chaîne (aucun appel du dépôt ne passe d'objet).
 * Si un jour les charges RSC sont publiées, revenir à `next/link` se fait en
 * une ligne : réexporter `next/link` ici.
 */
type AppLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  prefetch?: boolean | null;
  ref?: Ref<HTMLAnchorElement>;
};

export default function Link({ href, prefetch: _prefetch, ...rest }: AppLinkProps) {
  void _prefetch;
  return <a href={href} {...rest} />;
}
