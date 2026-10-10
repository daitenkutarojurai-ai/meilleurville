// F63 — the measured counterpart of the modelled air score. Server component:
// it reads lib/city-air (data/city-air.json) at build time, so nothing ships
// to the client.

import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  AIR_MEASURE_YEAR,
  AIR_POLLUTANTS,
  AIR_REFERENCES,
  cityAirEvaluated,
  cityAirMeasures,
  type AirPollutant,
} from "@/lib/city-air";

const LABEL: Record<AirPollutant, { fr: string; en: string }> = {
  no2: { fr: "Dioxyde d'azote (NO₂)", en: "Nitrogen dioxide (NO₂)" },
  pm25: { fr: "Particules fines PM2.5", en: "Fine particles PM2.5" },
  pm10: { fr: "Particules PM10", en: "Particles PM10" },
  o3: { fr: "Ozone (O₃)", en: "Ozone (O₃)" },
};

const AREA: Record<string, { fr: string; en: string }> = {
  urban: { fr: "urbaine", en: "urban" },
  suburban: { fr: "périurbaine", en: "suburban" },
  rural: { fr: "rurale", en: "rural" },
  "rural-near_city": { fr: "rurale", en: "rural" },
  "rural-regional": { fr: "rurale", en: "rural" },
  "rural-remote": { fr: "rurale", en: "rural" },
};

function tone(p: AirPollutant, v: number): string {
  const ref = AIR_REFERENCES[p];
  if (v > ref.eu) return "text-red-600";
  if (ref.who !== null ? v > ref.who : v > 0) return "text-amber-600";
  return "text-emerald-600";
}

export function AirMeasuredCard({ slug, cityName, locale = "fr" }: { slug: string; cityName: string; locale?: "fr" | "en" }) {
  const L = (fr: string, en: string) => (locale === "en" ? en : fr);
  const nf = (n: number) => n.toLocaleString(locale === "en" ? "en-GB" : "fr-FR", { maximumFractionDigits: 1 });
  if (!cityAirEvaluated(slug)) return null;
  const m = cityAirMeasures(slug);
  const rows = AIR_POLLUTANTS.filter((p) => m?.[p]);
  const missing = AIR_POLLUTANTS.filter((p) => !m?.[p]);

  return (
    <Card className="mt-6 border-l-4 border-l-sky-500">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="text-sm uppercase tracking-wide text-[var(--text-tertiary)] font-semibold">
          {L(`Mesuré en station · ${AIR_MEASURE_YEAR}`, `Measured at stations · ${AIR_MEASURE_YEAR}`)}
        </h2>
        <Badge>{L("Mesure officielle", "Official measurement")}</Badge>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mb-4">
        {L(
          `Moyennes annuelles ${AIR_MEASURE_YEAR} relevées à la station « de fond » la plus proche (à moins de 25 km), c'est-à-dire l'air respiré dans les quartiers d'habitation, pas au bord d'un axe routier.`,
          `${AIR_MEASURE_YEAR} annual averages from the nearest "background" station (within 25 km): the air breathed in residential areas, not at the kerb of a busy road.`,
        )}
      </p>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--text-primary)]">
          {L(
            `Aucune station de fond n'a publié assez de mesures en ${AIR_MEASURE_YEAR} à moins de 25 km de ${cityName}. Nous n'affichons pas le chiffre d'une station plus lointaine : il décrirait un autre air.`,
            `No background station within 25 km of ${cityName} published enough measurements in ${AIR_MEASURE_YEAR}. We do not show a more distant station's figure: it would describe different air.`,
          )}
        </p>
      ) : (
        <ul className="divide-y divide-[var(--border)]">
          {rows.map((p) => {
            const x = m![p]!;
            const ref = AIR_REFERENCES[p];
            const area = x.area ? AREA[x.area]?.[locale] : null;
            return (
              <li key={p} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{L(LABEL[p].fr, LABEL[p].en)}</span>
                  <span className={`text-lg font-bold tabular-nums ${tone(p, x.value)}`}>
                    {p === "o3"
                      ? L(`${x.value} j`, `${x.value} d`)
                      : <>{nf(x.value)} <span className="text-xs font-normal text-[var(--text-tertiary)]">µg/m³</span></>}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
                  {p === "o3"
                    ? L(
                        `Jours au-dessus de 120 µg/m³ (moyenne sur 8 h) · valeur cible UE : 25 jours par an au plus`,
                        `Days above 120 µg/m³ (8-hour mean) · EU target: no more than 25 days a year`,
                      )
                    : L(
                        `Recommandation OMS ${ref.who} · limite UE ${ref.eu} (${ref.eu2030} en 2030)`,
                        `WHO guideline ${ref.who} · EU limit ${ref.eu} (${ref.eu2030} from 2030)`,
                      )}
                  {" · "}
                  {L("station", "station")} {x.station}
                  {area ? ` (${L("zone ", "")}${area}${locale === "en" ? " area" : ""})` : ""}, {nf(x.distanceKm)} km
                </p>
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > 0 && missing.length > 0 && (
        <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">
          {L(
            `Pas de station de fond à moins de 25 km pour : ${missing.map((p) => LABEL[p].fr).join(", ")}.`,
            `No background station within 25 km for: ${missing.map((p) => LABEL[p].en).join(", ")}.`,
          )}
        </p>
      )}
      <p className="mt-3 text-[11px] text-[var(--text-tertiary)]">
        {L(
          "Sources : mesures des AASQA compilées par le LCSQA (Licence Ouverte), diffusées par l'Agence européenne pour l'environnement (CC BY 4.0). Données validées, au moins 75 % de l'année couverte.",
          "Sources: measurements by the French regional monitoring networks (AASQA), compiled by LCSQA (Licence Ouverte) and published by the European Environment Agency (CC BY 4.0). Validated data, at least 75 % of the year covered.",
        )}
      </p>
    </Card>
  );
}
