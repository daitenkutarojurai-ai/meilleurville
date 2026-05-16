# Vercel ISR Reads — fix pattern

**Symptôme** : ISR Reads explose sur le Vercel dashboard (proche de la limite gratuit/Pro).

**Cause** : par défaut, toute page avec `generateStaticParams()` est traitée comme **ISR** par Next.js. Chaque requête à ces pages compte 1 ISR Read. Avec 5 000+ pages SSG et un peu de trafic, on consomme rapidement la limite.

**Fix** : forcer le mode **SSG pur** (statique, servi depuis l'edge cache, zéro Data Cache layer) via :

```ts
export const revalidate = false;
export const dynamicParams = false; // si la liste curée est exhaustive
```

- `revalidate = false` → la page est buildée une fois au déploiement et servie statiquement (pas de re-validation, pas de Data Cache).
- `dynamicParams = false` → les paramètres hors `generateStaticParams()` répondent 404 au lieu de générer une page on-demand. Évite les ISR Writes provoqués par des crawlers ou URLs random.

## Où appliquer

Pour **chaque `app/**/page.tsx` qui exporte `generateStaticParams`** :

1. Ouvrir le fichier.
2. Ajouter juste après les imports :
   ```ts
   export const revalidate = false;
   export const dynamicParams = false;
   ```
3. **Exception** : si la route accepte légitimement des paramètres hors liste (ex. `/comparer/[pair]` qui doit résoudre n'importe quelle paire de villes), garder `dynamicParams = true` et ajouter seulement `revalidate = false`.

## Script d'application automatique

`/tmp/fix-isr-reads.py` (copier dans le projet cible) :

```python
#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path("app")  # adapter au projet
KEEP_OPEN = {"app/comparer/[pair]/page.tsx", "app/quitter/[pair]/page.tsx"}

CONFIG_OPEN = """
export const revalidate = false;
"""
CONFIG_CLOSED = """
export const revalidate = false;
export const dynamicParams = false;
"""

for path in ROOT.rglob("page.tsx"):
    content = path.read_text()
    if "generateStaticParams" not in content:
        continue
    if re.search(r"^export\s+const\s+revalidate\b", content, re.MULTILINE):
        continue
    # Find insertion point: after last top-level import
    last_import = 0
    for m in re.finditer(r"^import\s.+$", content, re.MULTILINE):
        last_import = m.end()
    insertion = last_import + 1
    block = CONFIG_OPEN if str(path) in KEEP_OPEN else CONFIG_CLOSED
    path.write_text(content[:insertion] + block + content[insertion:])
    print(f"PATCH {path}")
```

Run : `python3 fix-isr-reads.py`

## Vérification post-déploiement

Après push + redéploiement :
1. Aller sur Vercel → Project → **Settings** → **Functions** → **ISR usage**
2. Le compteur ISR Reads doit baisser (et arrêter d'augmenter quotidiennement)
3. Les pages doivent toujours répondre en < 100 ms (depuis l'edge static)
4. Vérifier qu'aucune page ne renvoie 404 inattendu (test : visiter quelques URLs principales)

## Autres projets

À appliquer sur :
- **meilleurville** ✅ (29 routes patchées 2026-05-16)
- **crepesforecast / glaceenseine** : adapter le script (`ROOT = Path("app")` selon structure)
- **aitrainningcourse / nextgenailearn** : idem
- **certquestsapp** : idem
- **portofolio** : idem

## Pour les API routes

Si une route handler fait des `fetch()` vers une API externe avec `cache: 'force-cache'` ou `next: { revalidate: N }`, chaque hit compte aussi en ISR Read. Solutions :

- `cache: 'no-store'` → pas de Data Cache (mais ré-exécute la fonction à chaque requête)
- `Cache-Control: 'public, s-maxage=N, stale-while-revalidate=...'` sur la réponse → cache CDN edge (compte en Edge Requests, pas en ISR Reads)

Préférer **Cache-Control headers** plutôt que `fetch().next.revalidate` pour les API routes publiques.

## Limites Vercel — ordre de grandeur

| Plan | ISR Reads / mois | ISR Writes / mois | Edge Requests |
|------|------------------|-------------------|---------------|
| Hobby (gratuit) | 100 k | 200 k | 1 M |
| Pro | 1 M | 2 M | 10 M |

Au-delà : facturation à l'usage (~$0.40 / M ISR Reads).
