/**
 * Article des noms de pays, et les quatre tournures françaises qui s'en
 * déduisent.
 *
 * ## Pourquoi un module à part
 *
 * Ce fichier n'importe **rien**. `lib/expat-return.ts` fait 248 Ko — vingt-trois
 * fiches de prose, de chiffres et de liens administratifs — et un tableau de
 * littéraux n'est pas tree-shakable : un composant client qui importerait une
 * de ces fonctions **en valeur** depuis la lib expédierait tout le corpus au
 * navigateur (CLAUDE.md § Performance, même piège que `@/data/guides` et que
 * `RANKING_META` avant `lib/rankings-meta.ts`). `components/ExpatQuiz.tsx` lit
 * donc ici, et la lib se contente de réexporter pour ses appelants serveur.
 *
 * ## Pourquoi l'article, et pas le genre
 *
 * L'article est la **seule** donnée saisie : il suffit à produire les quatre
 * formes dont le site a besoin, sans qu'aucune surface n'ait à recomposer une
 * phrase à la main. Le genre grammatical, lui, ne suffirait pas — il ne dit pas
 * si le nom s'élide (`l'Allemagne`) ni s'il refuse l'article (`Singapour`).
 *
 * | article | withArticle              | from (provenance)     | inLabel |
 * |---------|--------------------------|-----------------------|---------|
 * | `le`    | le Japon                 | **du** Japon          | Au      |
 * | `la`    | la Suisse                | **de** Suisse         | En      |
 * | `l'`    | l'Allemagne              | **d'**Allemagne       | En      |
 * | `les`   | les États-Unis           | **des** États-Unis    | Aux     |
 * | `""`    | Singapour                | **de** Singapour      | À       |
 * | `d'`    | Israël                   | **d'**Israël          | En      |
 *
 * La colonne `from` suit la règle française de la provenance, qui n'est pas une
 * simple contraction : un nom **féminin perd son article** (« rentrer de
 * Suisse », comme « de France »), là où un masculin à initiale consonantique le
 * garde contracté (« du Japon »). Écrire « de la Suisse » ne serait pas faux à
 * l'oreille, mais « de Suisse » est la forme attendue.
 *
 * ⚠️ **`l'` couvre les deux genres** et c'est voulu : un masculin à initiale
 * vocalique se comporte comme un féminin sur les trois formes (« l'Iran »,
 * « d'Iran », « En Iran »). Ne pas introduire un cas de plus pour lui.
 *
 * ⚠️ **`d'` n'est pas `l'`, et c'est la seule chose qui les sépare : la
 * première colonne.** Le cas a été ouvert le 2026-09-21 pour la fiche Israël,
 * et il désigne un nom qui **refuse l'article** tout en **commençant par une
 * voyelle** — on dit « Israël » et non « l'Israël », mais « d'Israël » et non
 * « de Israël », et « en Israël » et non « à Israël ». Avec `""`, deux
 * dérivations sur quatre sortaient fausses (`og:title` « Rentrer de Israël en
 * France », en-tête de tableau « À Israël », énumération du hub « … ou de
 * Israël ») ; avec `l'`, c'est le titre et le H1 qui sortaient faux
 * (« depuis l'Israël »). Aucune des deux valeurs existantes n'était juste,
 * donc le défaut ne se corrigeait pas par un meilleur choix dans l'ancienne
 * union. Même classe : Oman, Haïti, Aruba.
 *
 * ⚠️ **Et il se saisit, il ne se devine pas.** Tester l'initiale du nom pour
 * décider de l'élision serait une heuristique sur une chaîne — exactement ce
 * qui a produit le `isCoastal` par sous-chaîne de City Match (« sport »
 * contient « port ») et les faux positifs de `guideCityPhoto`. Un h muet
 * (« Haïti » → « d'Haïti ») et un h aspiré se ressemblent à la lettre près et
 * se comportent à l'inverse : la distinction est de la donnée, pas du code.
 */

/**
 * Article défini du nom de pays, tel qu'il s'écrit devant lui.
 *
 * ⚠️ Champ **obligatoire** sur `ExpatCountryProfile`, et c'est le correctif du
 * 2026-09-16 : il remplace deux champs optionnels (`depuisLabel`, `auLabel`)
 * dont le repli silencieux valait `"le"` / `"Au"`. Six fiches ne les avaient
 * jamais renseignés, donc trois pages publiaient « depuis **le** Suisse »,
 * « **le** Belgique », « **le** Allemagne » et les en-têtes de tableau
 * assortis. Un champ requis fait échouer `tsc` sur la vingt-quatrième fiche ;
 * un champ optionnel à repli la laisse passer.
 */
export type CountryArticle = "le" | "la" | "l'" | "les" | "" | "d'";

/** Le minimum qu'une fonction d'ici demande — un nom et son article. */
export interface ArticledCountry {
  name: string;
  article: CountryArticle;
}

/**
 * Le nom précédé de son article : « la Suisse », « l'Allemagne », « les
 * États-Unis », « Singapour ».
 *
 * Renvoie la chaîne **entière** plutôt que le seul article, parce que l'élision
 * ne prend pas d'espace et que le JSX en insère une : `{article} {name}`
 * rendait « depuis l' Espagne » sur les quatre fiches en `l'`.
 */
export function countryWithArticle({ name, article }: ArticledCountry): string {
  // `d'` comme `""` : le nom refuse l'article. Ce qui les sépare est la
  // provenance, pas le nom nu — cf. l'avertissement en tête de fichier.
  if (article === "" || article === "d'") return name;
  if (article === "l'") return `l'${name}`;
  return `${article} ${name}`;
}

/**
 * La provenance : « de Suisse », « du Japon », « d'Allemagne », « des
 * États-Unis », « de Singapour ». S'emploie après un verbe de mouvement
 * (« rentrer », « revenir »).
 */
export function countryFrom({ name, article }: ArticledCountry): string {
  switch (article) {
    case "le":
      return `du ${name}`;
    case "les":
      return `des ${name}`;
    // Élision devant voyelle, que le nom prenne l'article (« l'Allemagne » →
    // « d'Allemagne ») ou non (« Israël » → « d'Israël »).
    case "l'":
    case "d'":
      return `d'${name}`;
    // Féminin et noms sans article ni élision : provenance sans article.
    case "la":
    case "":
      return `de ${name}`;
  }
}

/**
 * La localisation, capitalisée pour un en-tête de colonne : « En Suisse », « Au
 * Japon », « Aux États-Unis », « À Singapour ».
 *
 * ⚠️ Cette dérivation reproduit **à l'identique** les dix-sept `auLabel` qui
 * avaient été écrits à la main avant le 2026-09-16 — c'est ce qui l'a validée,
 * et non une intuition de rédaction. Elle ne fait qu'ajouter les six qui
 * manquaient.
 */
export function countryInLabel({ article }: ArticledCountry): string {
  switch (article) {
    case "le":
      return "Au";
    case "les":
      return "Aux";
    // « En Israël » et non « À Israël » : le nom refuse l'article mais pas la
    // préposition des noms féminins et vocaliques.
    case "la":
    case "l'":
    case "d'":
      return "En";
    case "":
      return "À";
  }
}

/**
 * Énumération française d'une liste de pays en provenance : « de Suisse, du
 * Luxembourg … ou du Mexique ».
 *
 * Existe pour que la page hub cesse de porter sa liste de pays **en dur** : la
 * sienne annonçait dix-huit pays quand la lib en portait vingt-trois, et les
 * cinq derniers arrivés n'y figuraient pas. Même correctif que la liste du
 * sitemap, dérivée d'`EXPAT_COUNTRIES` après avoir dérivé.
 */
export function listCountriesFrom(countries: ArticledCountry[]): string {
  const parts = countries.map(countryFrom);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!;
  return `${parts.slice(0, -1).join(", ")} ou ${parts[parts.length - 1]!}`;
}
