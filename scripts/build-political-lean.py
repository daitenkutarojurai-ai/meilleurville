import csv, json, re, unicodedata, sys

def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

def norm_name(s):
    s = strip_accents(s).lower()
    s = re.sub(r"[''`]", " ", s)
    s = re.sub(r"[^a-z0-9]+", " ", s)
    return re.sub(r"\s+", " ", s).strip()

# --- 1. parse cities-seed.ts -> records {slug,name,dep,insee} ---
src = open('/home/flammeur/meilleurville/data/cities-seed.ts', encoding='utf-8').read()
recs, cur = [], None
for line in src.splitlines():
    m = re.search(r'\bslug:\s*"([^"]+)"', line)
    if m:
        if cur: recs.append(cur)
        cur = {'slug': m.group(1), 'name': None, 'dep': None, 'insee': None}
        continue
    if cur is None: continue
    m = re.search(r'\bname:\s*"([^"]+)"', line)
    if m and cur['name'] is None: cur['name'] = m.group(1)
    m = re.search(r'\bdepartment:\s*"([^"]+)"', line)
    if m and cur['dep'] is None: cur['dep'] = m.group(1)
    m = re.search(r'\binseeCode:\s*"([^"]+)"', line)
    if m and cur['insee'] is None: cur['insee'] = m.group(1)
if cur: recs.append(cur)
# de-dup defensively by slug (keep first)
seen=set(); cities=[]
for r in recs:
    if r['slug'] in seen: continue
    seen.add(r['slug']); cities.append(r)
print(f"seed cities parsed: {len(cities)}  with insee: {sum(1 for c in cities if c['insee'])}", file=sys.stderr)

# --- 2. candidate -> bloc ---
BLOC = {
 'ARTHAUD':'gauche','ROUSSEL':'gauche','MELENCHON':'gauche','HIDALGO':'gauche','JADOT':'gauche','POUTOU':'gauche',
 'MACRON':'centre',
 'PECRESSE':'droite','LASSALLE':'droite',
 'LE PEN':'extreme_droite','ZEMMOUR':'extreme_droite','DUPONT-AIGNAN':'extreme_droite',
}
def insee_from(dep, com):
    com = com.zfill(3)
    if dep.startswith('Z'): return '97' + com
    if dep in ('2A','2B'): return dep + com
    return dep.zfill(2) + com

# --- 3. aggregate election file by insee ---
agg = {}          # insee -> {bloc: voix, 'exp': exprimes}
name_idx = {}     # (norm depname, norm communename) -> insee
with open('/tmp/pres2022_t1_com.csv', encoding='utf-8') as f:
    rd = csv.DictReader(f)
    for row in rd:
        insee = insee_from(row['dep_code'], row['commune_code'])
        nom = strip_accents(row['cand_nom']).upper().strip()
        bloc = BLOC.get(nom)
        if bloc is None:
            continue
        d = agg.setdefault(insee, {'gauche':0,'centre':0,'droite':0,'extreme_droite':0,'exp':0})
        d[bloc] += int(row['cand_nb_voix'])
        d['exp'] = int(row['exprimes_nb'])
        name_idx[(norm_name(row['dep_name']), norm_name(row['commune_name']))] = insee
print(f"communes in election file: {len(agg)}", file=sys.stderr)

# --- 4. build output keyed by slug ---
LABELS = {'gauche':'gauche','centre':'centre','droite':'droite','extreme_droite':'extreme_droite'}
out = {}; unmatched = []
# Manual INSEE for cities the seed lacks a code for AND whose dept label differs
# from the election file (e.g. "Métropole de Lyon" vs "Rhône").
MANUAL_INSEE = {'venissieux': '69259'}
for c in cities:
    insee = c['insee'] or MANUAL_INSEE.get(c['slug'])
    matched_by = 'insee' if c['insee'] else 'manual'
    if not insee or insee not in agg:
        key = (norm_name(c['dep'] or ''), norm_name(c['name'] or ''))
        insee = name_idx.get(key)
        matched_by = 'name+dep'
    if not insee or insee not in agg:
        unmatched.append(c['slug']); continue
    d = agg[insee]; exp = d['exp'] or 1
    pct = {k: round(d[k]*100/exp, 1) for k in ('gauche','centre','droite','extreme_droite')}
    top = max(('gauche','centre','droite','extreme_droite'), key=lambda k: d[k])
    lean_score = round((pct['droite']+pct['extreme_droite']) - pct['gauche'], 1)  # >0 = right-leaning
    out[c['slug']] = {
        'lean': top, 'topPct': pct[top], 'blocs': pct,
        'leanScore': lean_score, 'insee': insee, 'matchedBy': matched_by,
    }

json.dump(out, open('/home/flammeur/meilleurville/data/political-lean.json','w'), ensure_ascii=False, indent=0)
print(f"\nMATCHED: {len(out)} / {len(cities)}")
from collections import Counter
print("by matchedBy:", Counter(v['matchedBy'] for v in out.values()))
print("lean distribution:", Counter(v['lean'] for v in out.values()))
print(f"UNMATCHED ({len(unmatched)}):", ', '.join(unmatched))
