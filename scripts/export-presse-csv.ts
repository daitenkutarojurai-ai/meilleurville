// Régénère les deux CSV presse depuis le seed calibré+normalisé.
// À relancer après toute retouche de scores :
//   npx tsx scripts/export-presse-csv.ts
//
//   public/presse/classement-mavilleideale-2026.csv  (FR, /presse)
//   public/press/ranking-bestcitiesinfrance-2026.csv (EN, /press)
//
// Les deux sortent de la **même boucle** sur le même seed : c'est la garantie
// structurelle que les deux domaines publient les mêmes nombres. Un jour où
// l'un des deux serait régénéré seul, ils divergeraient sans que rien ne le
// signale — d'où l'écriture conjointe plutôt que deux scripts.
// Seuls l'en-tête et l'URL de la fiche changent d'une locale à l'autre.
import { writeFileSync, mkdirSync } from "node:fs";
import { CITIES_SEED } from "../data/cities-seed";

const FR_HEADER =
  "rang,ville,departement,region,population,score_global,vie,securite,cout,transport,nature,culture,ecoles,teletravail,fiche";
const EN_HEADER =
  "rank,city,department,region,population,overall_score,quality_of_life,safety,cost_of_living,transport,nature,culture,schools,remote_work,page";

const ranked = [...CITIES_SEED].sort((a, b) => b.scores.global - a.scores.global);

function rows(pageUrl: (slug: string) => string): string[] {
  return ranked.map((c, i) =>
    [
      i + 1,
      `"${c.name}"`,
      `"${c.department}"`,
      `"${c.region}"`,
      c.population ?? "",
      c.scores.global.toFixed(2),
      c.scores.life.toFixed(1),
      c.scores.safety.toFixed(1),
      c.scores.cost.toFixed(1),
      c.scores.transport.toFixed(1),
      c.scores.nature.toFixed(1),
      c.scores.culture.toFixed(1),
      c.scores.schools.toFixed(1),
      c.scores.remoteWork.toFixed(1),
      `"${pageUrl(c.slug)}"`,
    ].join(","),
  );
}

// Le BOM est là pour Excel, qui lit sinon l'UTF-8 en latin-1 et affiche
// « Ile-de-France » en mojibake : les noms de communes et de départements sont
// accentués dans les deux fichiers, l'anglais n'y change rien.
function write(path: string, header: string, lines: string[]) {
  writeFileSync(path, "﻿" + header + "\n" + lines.join("\n") + "\n");
  console.log(`CSV écrit : ${path} — ${lines.length} villes`);
}

mkdirSync("public/presse", { recursive: true });
write(
  "public/presse/classement-mavilleideale-2026.csv",
  FR_HEADER,
  rows((slug) => `https://www.mavilleideale.fr/villes/${slug}`),
);

mkdirSync("public/press", { recursive: true });
write(
  "public/press/ranking-bestcitiesinfrance-2026.csv",
  EN_HEADER,
  rows((slug) => `https://bestcitiesinfrance.com/cities/${slug}`),
);
