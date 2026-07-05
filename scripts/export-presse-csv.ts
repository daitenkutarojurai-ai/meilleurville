// Régénère public/presse/classement-mavilleideale-2026.csv depuis le seed
// calibré+normalisé. À relancer après toute retouche de scores :
//   npx tsx scripts/export-presse-csv.ts
import { writeFileSync, mkdirSync } from "node:fs";
import { CITIES_SEED } from "../data/cities-seed";

const rows = [...CITIES_SEED]
  .sort((a, b) => b.scores.global - a.scores.global)
  .map((c, i) =>
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
      `"https://www.mavilleideale.fr/villes/${c.slug}"`,
    ].join(",")
  );

const header =
  "rang,ville,departement,region,population,score_global,vie,securite,cout,transport,nature,culture,ecoles,teletravail,fiche";

mkdirSync("public/presse", { recursive: true });
writeFileSync(
  "public/presse/classement-mavilleideale-2026.csv",
  "﻿" + header + "\n" + rows.join("\n") + "\n"
);
console.log(`CSV écrit : ${rows.length} villes`);
