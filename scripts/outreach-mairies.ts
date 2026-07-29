// Campagne d'outreach mairies — hook « Nᵉ ville de France sur 540 » + badge R13.1.
//
//   npx tsx scripts/outreach-mairies.ts                  # dry-run, 10 prochaines cibles
//   npx tsx scripts/outreach-mairies.ts --limit=25       # dry-run élargi
//   npx tsx scripts/outreach-mairies.ts --limit=25 --send
//   npx tsx scripts/outreach-mairies.ts --only=collioure
//
// Deux règles héritées des vagues 1 à 8 (cf. docs/outreach-log.md) :
//
// 1. Les adresses viennent de l'annuaire officiel de l'État, résolues par CODE
//    INSEE — jamais par nom de commune. « Mairie - Vernon » renvoie trois
//    communes dans trois départements, et les annuaires tiers (VoxPublic) ont
//    produit 3 bounces en vague 3.
// 2. Tous les chiffres sont calculés depuis le seed calibré, jamais saisis à la
//    main : un chiffre faux envoyé à une mairie est un chiffre faux vérifié par
//    la seule personne au monde qui connaît sa commune par cœur.
import { readFileSync, writeFileSync } from "node:fs";
import { CITIES_SEED } from "../data/cities-seed";

const CONTACTED_PATH = "scripts/outreach-contacted.json";
const ANNUAIRE =
  "https://api-lannuaire.service-public.fr/api/explore/v2.1/catalog/datasets/api-lannuaire-administration/records";
const U = "https://www.mavilleideale.fr";
const SENDER = { name: "Thomas — MaVilleIdéale", email: "bonjour@mavilleideale.fr" };
const REPLY_TO = { name: "Thomas", email: "daitenkutarojurai@gmail.com" };

// Au-delà, la mairie d'une grande ville ne relaiera pas un badge : la motion
// backlink vise les communes qui ont un intérêt à afficher leur rang.
const MAX_POPULATION = 60_000;

const AXIS_LABEL: Record<string, string> = {
  life: "qualité de vie",
  transport: "transports",
  nature: "nature",
  cost: "coût de la vie",
  safety: "sécurité",
  culture: "culture",
  remoteWork: "télétravail",
  schools: "écoles",
};

// Article contracté par département / région — « de Haut-Rhin » sonne faux à
// l'oreille d'un secrétariat de mairie, et c'est le premier signal de mail
// automatique. Les entrées absentes retombent sur « de X ».
const DEPT_ARTICLE: Record<string, string> = {
  Ain: "de l'Ain",
  Aisne: "de l'Aisne",
  Allier: "de l'Allier",
  Ardèche: "de l'Ardèche",
  Ardennes: "des Ardennes",
  Ariège: "de l'Ariège",
  Aube: "de l'Aube",
  Aveyron: "de l'Aveyron",
  Calvados: "du Calvados",
  Charente: "de la Charente",
  Cher: "du Cher",
  "Corse-du-Sud": "de Corse-du-Sud",
  Dordogne: "de la Dordogne",
  Drôme: "de la Drôme",
  Essonne: "de l'Essonne",
  "Eure-et-Loir": "d'Eure-et-Loir",
  Finistère: "du Finistère",
  Gard: "du Gard",
  Gers: "du Gers",
  Gironde: "de la Gironde",
  Guadeloupe: "de Guadeloupe",
  Guyane: "de Guyane",
  "Haute-Corse": "de Haute-Corse",
  "Haute-Marne": "de la Haute-Marne",
  "Haute-Saône": "de la Haute-Saône",
  "Haute-Vienne": "de la Haute-Vienne",
  "Hautes-Alpes": "des Hautes-Alpes",
  "Hauts-de-Seine": "des Hauts-de-Seine",
  Hérault: "de l'Hérault",
  Indre: "de l'Indre",
  "Indre-et-Loire": "d'Indre-et-Loire",
  Jura: "du Jura",
  "La Réunion": "de La Réunion",
  Loire: "de la Loire",
  Loiret: "du Loiret",
  Lot: "du Lot",
  "Lot-et-Garonne": "de Lot-et-Garonne",
  Lozère: "de la Lozère",
  Manche: "de la Manche",
  Marne: "de la Marne",
  Martinique: "de Martinique",
  Mayenne: "de la Mayenne",
  Mayotte: "de Mayotte",
  "Meurthe-et-Moselle": "de Meurthe-et-Moselle",
  Meuse: "de la Meuse",
  Moselle: "de la Moselle",
  "Métropole de Lyon": "de la Métropole de Lyon",
  Nièvre: "de la Nièvre",
  Nord: "du Nord",
  Oise: "de l'Oise",
  Orne: "de l'Orne",
  Paris: "de Paris",
  "Pas-de-Calais": "du Pas-de-Calais",
  "Seine-Maritime": "de Seine-Maritime",
  "Seine-Saint-Denis": "de Seine-Saint-Denis",
  Somme: "de la Somme",
  "Territoire de Belfort": "du Territoire de Belfort",
  "Val-d'Oise": "du Val-d'Oise",
  "Val-de-Marne": "du Val-de-Marne",
  Yonne: "de l'Yonne",
  Yvelines: "des Yvelines",
  "Alpes-de-Haute-Provence": "des Alpes-de-Haute-Provence",
  "Alpes-Maritimes": "des Alpes-Maritimes",
  Aude: "de l'Aude",
  "Bouches-du-Rhône": "des Bouches-du-Rhône",
  Cantal: "du Cantal",
  "Charente-Maritime": "de la Charente-Maritime",
  Corrèze: "de la Corrèze",
  "Côte-d'Or": "de la Côte-d'Or",
  "Côtes-d'Armor": "des Côtes-d'Armor",
  Creuse: "de la Creuse",
  "Deux-Sèvres": "des Deux-Sèvres",
  Doubs: "du Doubs",
  Eure: "de l'Eure",
  "Haute-Garonne": "de la Haute-Garonne",
  "Haute-Loire": "de la Haute-Loire",
  "Haute-Savoie": "de la Haute-Savoie",
  "Hautes-Pyrénées": "des Hautes-Pyrénées",
  "Haut-Rhin": "du Haut-Rhin",
  "Bas-Rhin": "du Bas-Rhin",
  "Ille-et-Vilaine": "d'Ille-et-Vilaine",
  Isère: "de l'Isère",
  Landes: "des Landes",
  "Loir-et-Cher": "du Loir-et-Cher",
  "Loire-Atlantique": "de Loire-Atlantique",
  "Maine-et-Loire": "de Maine-et-Loire",
  Morbihan: "du Morbihan",
  "Puy-de-Dôme": "du Puy-de-Dôme",
  "Pyrénées-Atlantiques": "des Pyrénées-Atlantiques",
  "Pyrénées-Orientales": "des Pyrénées-Orientales",
  Rhône: "du Rhône",
  "Saône-et-Loire": "de Saône-et-Loire",
  Sarthe: "de la Sarthe",
  Savoie: "de la Savoie",
  "Seine-et-Marne": "de Seine-et-Marne",
  Tarn: "du Tarn",
  "Tarn-et-Garonne": "de Tarn-et-Garonne",
  Var: "du Var",
  Vaucluse: "du Vaucluse",
  Vendée: "de la Vendée",
  Vienne: "de la Vienne",
  Vosges: "des Vosges",
};
const REGION_ARTICLE: Record<string, string> = {
  "Auvergne-Rhône-Alpes": "d'Auvergne-Rhône-Alpes",
  "Bourgogne-Franche-Comté": "de Bourgogne-Franche-Comté",
  Bretagne: "de Bretagne",
  "Centre-Val de Loire": "du Centre-Val de Loire",
  Corse: "de Corse",
  Guadeloupe: "de Guadeloupe",
  Guyane: "de Guyane",
  "La Réunion": "de La Réunion",
  Martinique: "de Martinique",
  Mayotte: "de Mayotte",
  "Grand Est": "du Grand Est",
  "Hauts-de-France": "des Hauts-de-France",
  "Île-de-France": "d'Île-de-France",
  Normandie: "de Normandie",
  "Nouvelle-Aquitaine": "de Nouvelle-Aquitaine",
  Occitanie: "d'Occitanie",
  "Pays de la Loire": "des Pays de la Loire",
  "Provence-Alpes-Côte d'Azur": "de Provence-Alpes-Côte d'Azur",
};

const num = (n: number) => n.toFixed(1).replace(".", ",");
const ord = (n: number) => (n === 1 ? "1re" : `${n}e`);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/['’]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const arg = (name: string) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];

const sorted = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global);

function facts(slug: string) {
  const i = sorted.findIndex((c) => c.slug === slug);
  const c = sorted[i];
  const dept = sorted.filter((x) => x.department === c.department);
  const region = sorted.filter((x) => x.region === c.region);
  const axes = Object.entries(c.scores)
    .filter(([k]) => k !== "global")
    .sort((a, b) => b[1] - a[1]);
  return {
    city: c,
    rank: i + 1,
    deptRank: dept.findIndex((x) => x.slug === slug) + 1,
    deptTotal: dept.length,
    regionRank: region.findIndex((x) => x.slug === slug) + 1,
    regionTotal: region.length,
    top3: axes.slice(0, 3),
    worst: axes[axes.length - 1],
  };
}

async function mairieEmail(inseeCode: string): Promise<string | null> {
  const url = `${ANNUAIRE}?where=code_insee_commune%3D%22${inseeCode}%22%20and%20pivot%20like%20%22mairie%22&limit=3`;
  const res = await fetch(url, {
    headers: { "user-agent": "MaVilleIdeale/1.0 (bonjour@mavilleideale.fr)" },
  });
  if (!res.ok) return null;
  const rows: { nom?: string; adresse_courriel?: string }[] = (await res.json()).results ?? [];
  const mairie = rows.find((r) => (r.nom ?? "").startsWith("Mairie")) ?? rows[0];
  return mairie?.adresse_courriel || null;
}

function compose(slug: string) {
  const f = facts(slug);
  const c = f.city;
  const deptArt = DEPT_ARTICLE[c.department] ?? `de ${c.department}`;
  const regionArt = REGION_ARTICLE[c.region] ?? `de ${c.region}`;
  const forces = f.top3.map(([k, v]) => `${AXIS_LABEL[k]} ${num(v)}`).join(", ");
  const faible = `${AXIS_LABEL[f.worst[0]]} ${num(f.worst[1])}`;

  const subject = `${c.name}, ${ord(f.rank)} ville de France sur 540 (classement qualité de vie 2026)`;
  const text = `Bonjour,

MaVilleIdéale est un site indépendant qui classe 540 communes françaises sur la qualité de vie, à partir de sources publiques : Insee, SSMSI (délinquance), Météo-France, notaires, observatoires des loyers. La méthode est publiée en entier : ${U}/methode

Dans l'édition 2026, ${c.name} ressort ${ord(f.rank)} sur 540, avec ${num(c.scores.global)}/10. C'est la ${ord(f.deptRank)} commune ${deptArt} de notre base (${f.deptTotal} classées) et la ${ord(f.regionRank)} ${regionArt} sur ${f.regionTotal}.

Ce qui la fait monter : ${forces} (sur 10). Ce qui la fait descendre : ${faible}.

La fiche complète : ${U}/villes/${c.slug}
Le classement de votre département : ${U}/departements/${slugify(c.department)}

Nous avons mis à disposition un badge libre de droits « ${ord(f.rank)} ville de France », en trois formats, avec le code à copier-coller sur votre site ou dans une newsletter : ${U}/badge/${c.slug}

Deux choses si ça vous intéresse :
— une donnée vous semble fausse ou dépassée ? Écrivez-nous, on vérifie et on corrige (les scores sont recalculés à chaque mise à jour du site) ;
— vous voulez le classement complet ${deptArt} en CSV, ou l'extraction sur mesure d'un critère précis ? On l'envoie dans la journée.

Bien cordialement,

Thomas
MaVilleIdéale — ${U}
bonjour@mavilleideale.fr`;
  return { subject, text, rank: f.rank };
}

const toHtml = (text: string) =>
  `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f2937">${text
    .split("\n\n")
    .map(
      (p) =>
        `<p style="margin:0 0 14px">${p
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/(https:\/\/[^\s]+)/g, '<a href="$1" style="color:#0d9488">$1</a>')
          .replace(/\n/g, "<br>")}</p>`,
    )
    .join("")}</div>`;

async function main() {
  const send = process.argv.includes("--send");
  const limit = Number(arg("limit") ?? 10);
  const only = arg("only");
  const contacted: string[] = JSON.parse(readFileSync(CONTACTED_PATH, "utf8"));
  const done = new Set(contacted);

  const queue = (
    only
      ? sorted.filter((c) => c.slug === only)
      : sorted.filter((c) => !done.has(c.slug) && (c.population ?? 0) <= MAX_POPULATION)
  ).slice(0, limit);

  const sent: string[] = [];
  for (const c of queue) {
    const email = await mairieEmail(c.inseeCode);
    if (!email) {
      console.log(`—    ${c.name} : aucun courriel déclaré à l'annuaire (portail seul)`);
      continue;
    }
    const { subject, text, rank } = compose(c.slug);
    if (!send) {
      console.log(`\n=== ${email} (${c.name}, ${ord(rank)})\nSUJET: ${subject}\n\n${text}\n`);
      continue;
    }
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.BREVO_API_KEY ?? "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: SENDER,
        replyTo: REPLY_TO,
        to: [{ email }],
        subject,
        textContent: text,
        htmlContent: toHtml(text),
      }),
    });
    console.log(res.status, `${ord(rank)}`.padEnd(5), c.name.padEnd(26), email);
    if (res.ok) sent.push(c.slug);
    await new Promise((r) => setTimeout(r, 2500));
  }

  if (send && sent.length) {
    writeFileSync(CONTACTED_PATH, `${JSON.stringify([...contacted, ...sent], null, 2)}\n`);
    console.log(`\n${sent.length} envoyés — ${CONTACTED_PATH} mis à jour.`);
  }
}

main();
