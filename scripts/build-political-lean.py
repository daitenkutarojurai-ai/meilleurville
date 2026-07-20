"""Rebuild data/political-lean.json from the official 2022 presidential
first-round results.

Source: Ministère de l'Intérieur via data.gouv.fr, "Election présidentielle
des 10 et 24 avril 2022 - Résultats définitifs du 1er tour", the per-polling-
station TXT (ISO-8859-1, ';'-separated, CRLF, ~36 MB):
  https://www.data.gouv.fr/api/1/datasets/r/79b5cac4-4957-486b-bbda-322d80868224

The file is WIDE: 21 fixed columns, then one 7-column block per candidate
(N°Panneau, Sexe, Nom, Prénom, Voix, % Voix/Ins, % Voix/Exp). Rows are polling
stations, so everything is summed up to the commune before computing shares.

Usage:
  curl -sL -o /tmp/pres2022_t1_bv.txt <url above>
  python3 scripts/build-political-lean.py /tmp/pres2022_t1_bv.txt
"""
import csv, json, re, sys, unicodedata
from collections import Counter, defaultdict

SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/pres2022_t1_bv.txt'
SEED = '/home/flammeur/meilleurville/data/cities-seed.ts'
OUT = '/home/flammeur/meilleurville/data/political-lean.json'

BASE_COLS = 21          # fixed columns before the first candidate block
BLOCK = 7               # columns per candidate


def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


def norm_name(s):
    s = strip_accents(s).lower()
    s = re.sub(r"[''`]", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()


# Candidate key -> bloc. Keys are the accent-stripped uppercase surnames as they
# appear in the source file.
BLOC = {
    'ARTHAUD': 'gauche', 'ROUSSEL': 'gauche', 'MELENCHON': 'gauche',
    'HIDALGO': 'gauche', 'JADOT': 'gauche', 'POUTOU': 'gauche',
    'MACRON': 'centre',
    'PECRESSE': 'droite', 'LASSALLE': 'droite',
    'LE PEN': 'extreme_droite', 'ZEMMOUR': 'extreme_droite', 'DUPONT-AIGNAN': 'extreme_droite',
}

# Stable slug per candidate, for the JSON keys.
SLUG = {
    'ARTHAUD': 'arthaud', 'ROUSSEL': 'roussel', 'MELENCHON': 'melenchon',
    'HIDALGO': 'hidalgo', 'JADOT': 'jadot', 'POUTOU': 'poutou',
    'MACRON': 'macron', 'PECRESSE': 'pecresse', 'LASSALLE': 'lassalle',
    'LE PEN': 'lepen', 'ZEMMOUR': 'zemmour', 'DUPONT-AIGNAN': 'dupont-aignan',
}


# Only these Z* codes are real overseas *départements* whose communes carry a
# 97xxx INSEE code (the commune code already embeds the third digit, e.g.
# Guadeloupe "120" -> 97120). Every other Z* block — Nouvelle-Calédonie,
# Polynésie, Wallis, Saint-Pierre, Saint-Martin and above all ZZ "Français
# établis hors de France" — has its own numbering that collides head-on with
# those codes: 60 collisions, which silently merged embassy polling stations
# (heavily pro-Macron) into Guadeloupe and Martinique communes. Drop them.
DROM_DEPS = {'ZA', 'ZB', 'ZC', 'ZD', 'ZM'}


def insee_from(dep, com):
    com = com.zfill(3)
    if dep.startswith('Z'):
        return '97' + com if dep in DROM_DEPS else None
    if dep in ('2A', '2B'):
        return dep + com
    return dep.zfill(2) + com


# --- 1. seed cities -> {slug, name, dep, insee} ---
src = open(SEED, encoding='utf-8').read()
recs, cur = [], None
for line in src.splitlines():
    m = re.search(r'\bslug:\s*"([^"]+)"', line)
    if m:
        if cur:
            recs.append(cur)
        cur = {'slug': m.group(1), 'name': None, 'dep': None, 'insee': None}
        continue
    if cur is None:
        continue
    for field, key in (('name', 'name'), ('department', 'dep'), ('inseeCode', 'insee')):
        m = re.search(r'\b%s:\s*"([^"]+)"' % field, line)
        if m and cur[key] is None:
            cur[key] = m.group(1)
if cur:
    recs.append(cur)
seen, cities = set(), []
for r in recs:
    if r['slug'] in seen:
        continue
    seen.add(r['slug'])
    cities.append(r)
print(f"seed cities parsed: {len(cities)} (with insee: {sum(1 for c in cities if c['insee'])})", file=sys.stderr)

# --- 2. aggregate polling stations up to communes ---
# voix[insee][candidate_key] = votes ; meta[insee] = turnout counters
voix = defaultdict(Counter)
meta = defaultdict(Counter)
name_idx = {}

with open(SRC, encoding='latin-1', newline='') as f:
    rd = csv.reader(f, delimiter=';')
    header = next(rd)
    for row in rd:
        if len(row) <= BASE_COLS:
            continue
        insee = insee_from(row[0], row[4])
        if insee is None:
            continue
        name_idx[(norm_name(row[1]), norm_name(row[5]))] = insee

        m = meta[insee]
        for col, key in ((7, 'inscrits'), (8, 'abstentions'), (10, 'votants'),
                         (12, 'blancs'), (15, 'nuls'), (18, 'exprimes')):
            try:
                m[key] += int(row[col])
            except (ValueError, IndexError):
                pass

        v = voix[insee]
        for i in range(BASE_COLS, len(row) - BLOCK + 1, BLOCK):
            nom = strip_accents(row[i + 2]).upper().strip()
            if nom not in BLOC:
                continue
            try:
                v[nom] += int(row[i + 4])
            except ValueError:
                pass

print(f"communes aggregated: {len(voix)}", file=sys.stderr)

# --- 3. build output keyed by city slug ---
MANUAL_INSEE = {'venissieux': '69259'}
BLOC_KEYS = ('gauche', 'centre', 'droite', 'extreme_droite')

out, unmatched = {}, []
for c in cities:
    insee = c['insee'] or MANUAL_INSEE.get(c['slug'])
    matched_by = 'insee' if c['insee'] else 'manual'
    if not insee or insee not in voix:
        insee = name_idx.get((norm_name(c['dep'] or ''), norm_name(c['name'] or '')))
        matched_by = 'name+dep'
    if not insee or insee not in voix:
        unmatched.append(c['slug'])
        continue

    v, m = voix[insee], meta[insee]
    exp = m['exprimes'] or 1

    cands = {SLUG[k]: round(v[k] * 100 / exp, 1) for k in BLOC if v[k]}
    raw = {b: 0 for b in BLOC_KEYS}
    for k, votes in v.items():
        raw[BLOC[k]] += votes
    blocs = {b: round(raw[b] * 100 / exp, 1) for b in BLOC_KEYS}

    # Decide the winner on raw vote counts: Colmar's gauche and extreme droite
    # are both 32.2% once rounded, and picking from the rounded values made the
    # result depend on dict order.
    top_bloc = max(BLOC_KEYS, key=lambda b: raw[b])
    top_cand = max(v, key=lambda k: v[k]) if v else None
    ins = m['inscrits'] or 1

    out[c['slug']] = {
        'lean': top_bloc,
        'topPct': blocs[top_bloc],
        'blocs': blocs,
        'leanScore': round((blocs['droite'] + blocs['extreme_droite']) - blocs['gauche'], 1),
        'insee': insee,
        'matchedBy': matched_by,
        # New: per-candidate shares of votes cast, plus turnout.
        'cands': cands,
        'topCand': SLUG[top_cand] if top_cand else None,
        'topCandPct': round(v[top_cand] * 100 / exp, 1) if top_cand else 0.0,
        'turnout': {
            'inscrits': m['inscrits'],
            'exprimes': m['exprimes'],
            'abstentionPct': round(m['abstentions'] * 100 / ins, 1),
            'blancsNulsPct': round((m['blancs'] + m['nuls']) * 100 / (m['votants'] or 1), 1),
        },
    }

json.dump(out, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(f"\nMATCHED: {len(out)} / {len(cities)}")
print("by matchedBy:", Counter(v['matchedBy'] for v in out.values()))
print("lean distribution:", Counter(v['lean'] for v in out.values()))
print("top candidate distribution:", Counter(v['topCand'] for v in out.values()))
if unmatched:
    print(f"UNMATCHED ({len(unmatched)}):", ', '.join(unmatched))
