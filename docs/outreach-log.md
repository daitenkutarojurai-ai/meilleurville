# Journal d'outreach — presse, mairies, offices de tourisme

Campagne de distribution de `mavilleideale.fr`. Envois en transactionnel Brevo
(expéditeur `bonjour@mavilleideale.fr`, reply-to la boîte du propriétaire).
Outil : `npx tsx scripts/outreach-mairies.ts` — registre des communes déjà
contactées dans `scripts/outreach-contacted.json`.

## Où on en est (2026-08-03)

| | Envois | Bounces | Ouvertures | Réponses |
|---|---|---|---|---|
| Presse (vagues 1-4, relances v5) | 32 | 4 | plusieurs | **1** |
| Mairies & OT, hook badge (v5-v8) | 68 | 0 | 3 sur 27 mesurées | 0 |
| Mairies, hook vérification (v9) | 22 | **toujours à mesurer** | idem | idem |

**159 envois cumulés, 1 réponse** — et sur les mairies seules, **90 envois pour
0 réponse**. La v9 reste non mesurée au 2026-08-03 : l'égress de la routine
refuse `api.brevo.com`. Tant qu'elle ne l'est pas, aucune vague suivante ne
part (cf. `docs/outreach-wave-10-draft.md`). La seule vraie réponse presse est celle de
Matthieu Renard (La Nouvelle République / NRCO) le 2026-07-22, sur l'angle
« Amboise 3e » : questions sur les objectifs du site et la méthode de notation,
réponse envoyée le jour même. Toute demande d'extraction Indre-et-Loire de sa
part se traite dans la journée.

Le gisement presse par email public est épuisé — les rédactions restantes ne
publient que des adresses de service abonnés ou des formulaires. La suite passe
par téléphone (action utilisateur).

## Vagues

- **v1-v4 (2026-07-05 → 07-08)** — presse nationale et PQR, 29 envois, angle
  « votre ville est Nᵉ ». 4 bounces, tous sur des adresses issues de l'annuaire
  tiers VoxPublic (Le Bien Public, La Montagne, Le Dauphiné, La République 77).
- **v5 (2026-07-19)** — pivot mairies/OT après 29 envois presse pour 0 réponse.
  Hook « Nᵉ ville de France » + `/badge/[slug]`. 7 mairies/OT + 3 relances
  presse (leads chauds uniquement).
- **v6 (2026-07-22)** — 9 mairies/OT, suite du top 25.
- **v7 (2026-07-29)** — 11 mairies du top 45 + 3 relances J+7 des seules mairies
  ayant ouvert la v6. Angle de relance : *sur les 25 premières communes, 20 font
  moins de 25 000 habitants ; la première grande ville, Strasbourg, n'arrive que
  16e.*
- **v8 (2026-07-29)** — 37 mairies, rangs 4 à 75. Première vague résolue par
  code Insee (voir ci-dessous). 3 communes du rang sautées faute de courriel
  déclaré : Paray-le-Monial 27e, Lannion 30e, Albi 48e.

- **v9 (2026-07-29)** — 22 mairies, rangs 76 à 99. **Nouveau hook** (voir
  ci-dessous) : le badge n'est plus le sujet.

- **v10 (2026-08-03) — préparée, non envoyée.** Détail complet dans
  `docs/outreach-wave-10-draft.md` : 25 cibles rangs 27-127, tableau prêt,
  copie relue. Deux blocages : `BREVO_API_KEY` absente de l'environnement de la
  routine, et `403 CONNECT` du proxy sur `api-lannuaire.service-public.fr` —
  donc aucune adresse résolvable. `api.brevo.com` est refusé de la même façon,
  donc **les statistiques de la v9 n'ont pas pu être relevées**.

## Le hook a changé en v9

Les vagues 5 à 8 vendaient le badge : « votre ville est Nᵉ, voici le code à
coller ». 100 envois, 3 ouvertures mesurées, 0 réponse. Le problème n'était pas
la délivrabilité (0 bounce) mais l'ask : on demandait un service à une adresse
qui traite de l'état civil, pour un bénéfice abstrait, au nom d'un site inconnu.

Le hook `verification` (défaut du script) inverse la mécanique :

- **l'objet nomme la note la plus basse de la commune et pose une question** —
  « Saint-Lô : la note "culture" à 5,1/10 est-elle juste ? » ;
- **le corps affiche le classement du département dans le mail**, en clair —
  voir ses voisines classées est le contenu ; sous 3 communes classées, on
  bascule sur le haut du classement régional ;
- **l'ask est une correction de donnée**, avec un exemple concret adapté à
  l'axe faible (`WORST_EXAMPLE`) et un engagement de recalcul le jour même ;
- **le badge est relégué en dernière ligne**, conditionnel.

La demande de correction est sincère et c'est ce qui la rend défendable : une
réponse de mairie améliore réellement le seed, et c'est la seule chose qu'une
mairie est mieux placée que quiconque pour donner. À comparer à J+7 : 100 envois
hook badge contre 22 hook vérification.

`--hook=badge` rejoue l'ancien template si besoin de comparaison.

## Ce que les vagues ont appris

**Les adresses se résolvent par code Insee, jamais par nom de commune.**
L'annuaire officiel de l'État expose `adresse_courriel` déclaré par la commune
elle-même :

```
https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/
  api-lannuaire-administration/records?where=code_insee_commune="35360" and pivot like "mairie"
```

Chercher par nom est un piège : `Mairie - Vernon` renvoie trois communes dans
trois départements (86, 27, 07). Le seed porte `inseeCode` sur les 540 villes,
donc la jointure est exacte.

**Ne jamais envoyer à une adresse issue d'un snippet de recherche ou d'un
annuaire tiers.** Les 4 bounces de la campagne viennent tous de là. Zéro bounce
sur les 68 envois mairies sourcés à l'annuaire de l'État. Préférer les adresses
de rôle (`mairie@`, `accueil@`, `direction@`) aux adresses nominatives (RGPD).

**Les sites communaux ne publient presque jamais d'email.** Vérifié sur Vendôme,
Lannion, Sanary-sur-Mer, Dinard : mentions légales sans adresse, portail citoyen
ou formulaire seul. Inutile de les crawler, l'annuaire est la source.

**Le hook badge plafonne.** Vagues 5-6 mesurées à J+7 : tout délivré, 3 mairies
sur 16 ont ouvert (Pontarlier 5 clics — le seul signal réel, Le Puy-en-Velay,
Les Sables-d'Olonne), zéro réponse. Si la v8 donne le même résultat, c'est
l'accroche qu'il faut changer, pas le volume de cibles.

**Une seule relance, puis stop.** Appliqué en v5 (3 rédactions) et v7 (3
mairies) — ces cibles sont closes.

**« Aucun courriel déclaré » et « annuaire injoignable » se ressemblaient à
l'écran, et c'est un piège** (constaté 2026-08-03). `mairieEmail()` renvoyait
`null` dans les deux cas, affiché « aucun courriel déclaré à l'annuaire (portail
seul) ». Un dry-run de routine a donc annoncé 5 communes sans adresse alors que
le proxy refusait les CONNECT et qu'aucune requête n'était partie — soit
exactement la conclusion inverse de la réalité. Corrigé : résultat à trois états
(`found` / `none` / `unreachable`), ligne `!!!` sur l'injoignable, code de sortie
1 si toute la file l'est, et impression du message composé en dry-run même sans
adresse résolue, pour que la relecture de la copie reste possible hors ligne.

**Ne pas tirer une vague avant d'avoir lu la précédente.** Les vagues 5 à 8 ont
enchaîné 100 envois d'un hook déjà mort parce que les chiffres n'ont été relevés
qu'après coup. La v9 inaugure le hook « vérification » et n'est toujours pas
mesurée : la v10 est donc préparée mais conditionnée à cette lecture, avec un
seuil de décision fixé d'avance dans le brouillon.

## Contenu d'un envoi

Tous les chiffres sont calculés depuis le seed calibré au moment de l'envoi,
jamais saisis à la main : rang national, rang départemental, rang régional,
3 meilleurs axes, axe le plus faible. Puis fiche ville, classement du
département, `/badge/[slug]`, `/methode`, et deux offres — correction de donnée,
extraction CSV départementale sous 24 h.

Un chiffre faux envoyé à une mairie est un chiffre faux lu par la seule personne
au monde qui connaît sa commune par cœur.

## Suivi

Aucun webhook Brevo configuré : les bounces et l'engagement se lisent via
`GET https://api.brevo.com/v3/smtp/statistics/events?startDate=…&endDate=…`
(agréger par `email`), les réponses arrivent sur la boîte Gmail via Cloudflare
Email Routing.
