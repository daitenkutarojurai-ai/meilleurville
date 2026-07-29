# Journal d'outreach — presse, mairies, offices de tourisme

Campagne de distribution de `mavilleideale.fr`. Envois en transactionnel Brevo
(expéditeur `bonjour@mavilleideale.fr`, reply-to la boîte du propriétaire).
Outil : `npx tsx scripts/outreach-mairies.ts` — registre des communes déjà
contactées dans `scripts/outreach-contacted.json`.

## Où on en est (2026-07-29)

| | Envois | Bounces | Ouvertures | Réponses |
|---|---|---|---|---|
| Presse (vagues 1-4, relances v5) | 32 | 4 | plusieurs | **1** |
| Mairies & OT (vagues 5-8) | 68 | 0 | 3 sur 27 mesurées | 0 |

**137 envois cumulés, 1 réponse.** La seule vraie réponse presse est celle de
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
