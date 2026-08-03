# Vague 10 — préparée le 2026-08-03, **non envoyée**

Run automatisé du 2026-08-03. Les deux conditions de pré-vol échouent, donc aucun
envoi n'a eu lieu. Ce document contient la vague prête à tirer en local, et la
raison pour laquelle il ne faut **pas** la tirer telle quelle avant d'avoir lu les
statistiques de la v9.

## Pourquoi le run n'a pas envoyé

| Condition | État |
|---|---|
| `BREVO_API_KEY` présente | **non** — variable vide dans l'environnement de la routine |
| Annuaire de l'État joignable | **non** — `403 CONNECT` sur `api-lannuaire.service-public.fr` |

L'égress est également refusé vers `api.brevo.com` (403 CONNECT), donc les
statistiques d'engagement de la v9 n'ont pas pu être relevées non plus. C'est le
même blocage proxy que celui documenté pour GBIF / INPN / Overpass (cf. CLAUDE.md
§ Vague 7) : les sources sont joignables depuis une session locale, pas depuis la
routine cloud.

## Le point bloquant n'est pas l'égress, c'est la mesure

La v9 est la **première** vague du hook « vérification » : 22 envois le
2026-07-29, colonne « à mesurer » dans le journal, jamais relevée depuis. Tirer
25 envois de plus avant de l'avoir lue reproduit exactement l'erreur des vagues
5 à 8 — quatre vagues consécutives d'un hook déjà mort, parce que personne n'a
lu les chiffres entre deux.

**Donc : relever la v9 d'abord, décider ensuite.** La commande est en bas.

Cohorte v9 à agréger (22 communes, les 22 dernières entrées du registre) :

```
gien, saint-lo, rumilly, mayenne, compiegne, brive-la-gaillarde, dole,
saint-jean-de-luz, chaumont, aubusson, florac-trois-rivieres,
saint-yrieix-la-perche, montbard, chateau-gontier-sur-mayenne, embrun,
saint-girons, royan, sainte-maxime, dieppe, vesoul, bar-sur-aube, montbrison
```

Seuil de décision, fixé d'avance pour ne pas être réinterprété après coup :

- **≥ 1 réponse de mairie** → le hook fonctionne, tirer la v10 telle quelle.
- **0 réponse mais ouvertures nettement > 3/22** (le taux du hook badge) → le
  hook progresse sans convertir : tirer la v10, mais c'est la dernière avant
  arbitrage.
- **0 réponse et ouvertures au niveau du hook badge** → l'email froid vers les
  mairies est un canal mort, quel que soit le message. Voir « Si ça ne convertit
  pas » plus bas. Ne pas tirer une v10 identique pour tenir la cadence.

## Les 25 cibles

Rangs 27 à 127, calculés depuis le seed calibré le 2026-08-03 (`--limit=25`,
filtre population ≤ 60 000, communes absentes de `scripts/outreach-contacted.json`).
Registre à 86 communes ; 360 communes éligibles restent non contactées, le vivier
n'est pas la contrainte.

| # | Rang | Commune | Insee | Département | Pop. | Global | Axe le plus faible |
|---|------|---------|-------|-------------|------|--------|--------------------|
| 1 | 27 | Paray-le-Monial | 71342 | Saône-et-Loire | 8 500 | 7,4 | transports 4,2 |
| 2 | 30 | Lannion | 22113 | Côtes-d'Armor | 20 000 | 7,3 | transports 4,9 |
| 3 | 48 | Albi | 81004 | Tarn | 49 971 | 7,1 | transports 5,5 |
| 4 | 100 | Sablé-sur-Sarthe | 72264 | Sarthe | 12 400 | 6,7 | transports 4,2 |
| 5 | 101 | Monistrol-sur-Loire | 43137 | Haute-Loire | 9 400 | 6,7 | culture 4,2 |
| 6 | 103 | Cholet | 49099 | Maine-et-Loire | 55 000 | 6,6 | culture 5,7 |
| 7 | 105 | Cassis | 13022 | Bouches-du-Rhône | 7 000 | 6,6 | transports 4,2 |
| 8 | 106 | Montargis | 45208 | Loiret | 14 000 | 6,6 | qualité de vie 5,9 |
| 9 | 107 | Guingamp | 22070 | Côtes-d'Armor | 7 800 | 6,6 | transports 4,2 |
| 10 | 108 | Sens | 89387 | Yonne | 25 500 | 6,6 | nature 5,7 |
| 11 | 109 | Pont-à-Mousson | 54431 | Meurthe-et-Moselle | 14 000 | 6,6 | transports 5,6 |
| 12 | 110 | Soissons | 02722 | Aisne | 28 000 | 6,6 | transports 5,6 |
| 13 | 111 | Gourdon | 46127 | Lot | 4 800 | 6,6 | transports 2,7 |
| 14 | 112 | Sarrebourg | 57630 | Moselle | 13 500 | 6,6 | transports 4,2 |
| 15 | 113 | Rambouillet | 78517 | Yvelines | 26 600 | 6,6 | coût de la vie 3,8 |
| 16 | 116 | Saint-Malo | 35288 | Ille-et-Vilaine | 45 165 | 6,5 | coût de la vie 5,0 |
| 17 | 118 | Vichy | 03310 | Allier | 24 400 | 6,5 | transports 4,2 |
| 18 | 119 | Auch | 32013 | Gers | 22 000 | 6,5 | transports 4,2 |
| 19 | 121 | Menton | 06083 | Alpes-Maritimes | 29 000 | 6,5 | coût de la vie 3,2 |
| 20 | 122 | Épernay | 51230 | Marne | 23 000 | 6,5 | transports 5,6 |
| 21 | 123 | La Ciotat | 13028 | Bouches-du-Rhône | 37 000 | 6,5 | sécurité 4,8 |
| 22 | 124 | Orange | 84087 | Vaucluse | 30 000 | 6,5 | sécurité 5,1 |
| 23 | 125 | Pézenas | 34199 | Hérault | 8 500 | 6,5 | transports 4,2 |
| 24 | 126 | Gordes | 84050 | Vaucluse | 2 200 | 6,5 | transports 2,2 |
| 25 | 127 | Saint-Paul-de-Vence | 06128 | Alpes-Maritimes | 3 600 | 6,5 | coût de la vie 2,3 |

Trois de ces communes — **Paray-le-Monial, Lannion, Albi** — avaient déjà été
sautées en v8 « faute de courriel déclaré ». Elles remontent en tête de file à
chaque run puisque le registre ne consigne que les envois réussis. Si le run
local les redonne sans adresse, elles sont à écarter définitivement : ce sont
trois places perdues sur 25 à chaque vague. (Le journal les cite déjà, mais rien
dans le code ne les exclut.)

## Relecture de la copie (règle 6, faite hors ligne)

Les 25 messages ont été composés et relus dans ce run. La composition ne dépend
d'aucun réseau — seule la résolution d'adresse est bloquée — donc la relecture
est valide même sans envoi.

- **Aucun exemple hors sujet.** Chaque `WORST_EXAMPLE` correspond à l'axe cité :
  médiathèque/cinéma sur « culture », ligne de bus ou halte ferroviaire sur
  « transports », commerces de centre-ville sur « qualité de vie », marché du
  logement sur « coût de la vie », chiffres SSMSI sur « sécurité ».
- **Les tableaux départementaux tiennent.** Vérifié sur Montargis (5 communes du
  Loiret, la commune ciblée marquée `←`, Orléans classée derrière elle — c'est
  précisément le genre de ligne qui donne envie de répondre). Les départements
  sous 3 communes basculent bien sur le top régional.
- **Une réserve, non bloquante : 14 cibles sur 25 ont « transports » comme axe le
  plus faible, dont 8 à la valeur exacte 4,2/10.** Ce n'est pas un bug : dans le
  seed, `transport` vaut 4,2 pour 63 des 540 communes — c'est un palier de
  gabarit (petites villes sans réseau structurant), pas une mesure propre à
  chacune. Deux communes voisines qui compareraient leurs courriels liraient le
  même chiffre. La copie le couvre déjà en disant « c'est un calcul dérivé de
  données publiques, pas une enquête de terrain » — c'est justement pourquoi
  cette phrase ne doit pas sauter. Ces cibles restent les moins susceptibles de
  produire une correction utile : sur un palier de gabarit, une mairie n'a rien
  de factuel à corriger.
- **Les cibles « coût de la vie » (Menton 3,2, Saint-Paul-de-Vence 2,3) sont
  également peu actionnables** : une mairie ne corrige pas un marché immobilier.
  Elles sont conservées parce que le tableau départemental garde de l'intérêt,
  mais ne pas s'attendre à une réponse de leur part.

## La commande, en local

Dans l'ordre. Ne pas sauter l'étape 1.

```bash
# 1. Lire la v9 avant tout — c'est ce qui décide s'il faut tirer la v10.
curl -s -H "api-key: $BREVO_API_KEY" \
  "https://api.brevo.com/v3/smtp/statistics/events?startDate=2026-07-29&endDate=2026-08-05&limit=500" \
  | jq -r '.events[] | [.email, .event] | @tsv' | sort | uniq -c | sort -rn

# 2. Dry-run, relire les destinataires et les axes cités.
npx tsx scripts/outreach-mairies.ts --limit=25

# 3. Seulement si l'étape 1 le justifie.
npx tsx scripts/outreach-mairies.ts --limit=25 --send

# 4. IMMÉDIATEMENT après, avant tout autre travail.
git pull --rebase origin main
git add scripts/outreach-contacted.json
git commit -m "chore(outreach): vague 10 — N envois"
git push -u origin main
```

Le dry-run sort désormais en **code 1** si l'annuaire est injoignable, au lieu
d'afficher « aucun courriel déclaré » sur toute la file (cf. correctif du
2026-08-03 ci-dessous). Si l'étape 2 sort en échec, c'est l'égress, pas le
vivier.

## Si ça ne convertit toujours pas

Chiffres cumulés : **159 envois, 1 réponse** — et cette réponse est une réponse
presse (NRCO, 2026-07-22), pas une mairie. Côté mairies isolément : **90 envois,
0 réponse**, dont 68 sur le hook badge (3 ouvertures sur 27 mesurées) et 22 sur
le hook vérification, non mesurés.

Si la v9 relève 0 réponse et des ouvertures au niveau du hook badge, la
conclusion honnête est que **le problème n'est plus le message**. Deux hooks
opposés — flatterie de classement puis demande de correction — ont produit le
même néant sur 90 envois. Ce qui reste constant entre les deux, c'est le canal :
un courriel non sollicité, envoyé par un expéditeur inconnu, à une adresse
`mairie@` qui traite de l'état civil et du scolaire. Ce n'est pas une boîte qui
répond à des inconnus.

Pistes qui changent le canal plutôt que le texte, par ordre de coût croissant :

1. **Le téléphone**, déjà identifié dans le journal comme la suite pour la presse.
   Le même raisonnement vaut pour les mairies : le service communication d'une
   commune de 20 000 habitants se joint, et 10 appels renseigneraient plus que
   100 courriels.
2. **Inverser le sens du contact** — publier l'extraction CSV départementale en
   libre accès (elle existe déjà sur `/presse`) et laisser les communes venir,
   plutôt que de la proposer une commune à la fois.
3. **Passer par les offices de tourisme et les agences de développement**, dont
   le métier *est* de relayer un classement favorable, contrairement à un
   secrétariat de mairie. Les v5-v6 en ont touché quelques-uns sans les isoler
   dans les mesures.

Recommandation du run : **ne pas envoyer une 9ᵉ vague identique pour tenir la
cadence.** Relever la v9, et si elle est vide, arrêter l'email froid vers les
mairies plutôt que de continuer à consommer le vivier — 360 communes éligibles
restent non contactées, et elles ne valent que si le canal fonctionne.

## Correctif embarqué dans ce run

`scripts/outreach-mairies.ts` confondait « la commune ne déclare pas d'adresse »
et « l'annuaire est injoignable » : les deux cas retombaient sur `null` et
s'affichaient « aucun courriel déclaré à l'annuaire (portail seul) ». Ce run a
commencé par afficher ce message sur 5 communes alors qu'aucune requête n'était
jamais partie — le proxy refusait les CONNECT.

`mairieEmail()` renvoie désormais un résultat à trois états
(`found` / `none` / `unreachable`), l'injoignable s'affiche `!!!`, une file
entièrement injoignable sort en code 1, et le dry-run imprime quand même le
message composé (`[adresse non résolue]`) pour que la relecture reste possible
hors ligne. `npx tsc --noEmit` passe.
