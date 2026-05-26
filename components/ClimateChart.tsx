export interface MonthNormal {
  tempAvg: number | null;
  tempMin: number | null;
  tempMax: number | null;
  precipMm: number | null;
  sunHours: number | null;
}

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface Props {
  months: MonthNormal[];
  source: string;
  stationDist?: number | null;
  locale?: "fr" | "en";
}

function Chart({ months }: { months: MonthNormal[] }) {
  const W = 560, H = 165;
  const ML = 34, MR = 8, MT = 10, MB = 28;
  const CW = W - ML - MR;
  const CH = H - MT - MB;
  const T_LO = -8, T_HI = 38;
  const P_MAX = 140;
  const S_MAX = 280;

  function tx(i: number) { return ML + (i + 0.5) * (CW / 12); }
  function ty(t: number) { return MT + CH * (1 - (t - T_LO) / (T_HI - T_LO)); }

  const tMaxs = months.map((m) => m.tempMax);
  const tMins = months.map((m) => m.tempMin);
  const hasTemp = months.some((m) => m.tempAvg != null);
  const hasPrec = months.some((m) => m.precipMm != null);
  const hasSun = months.some((m) => m.sunHours != null);

  const bandPoints: string[] = [];
  for (let i = 0; i < 12; i++) {
    if (tMaxs[i] != null) bandPoints.push(`${tx(i).toFixed(1)},${ty(tMaxs[i]!).toFixed(1)}`);
  }
  for (let i = 11; i >= 0; i--) {
    if (tMins[i] != null) bandPoints.push(`${tx(i).toFixed(1)},${ty(tMins[i]!).toFixed(1)}`);
  }

  const avgLine = months
    .map((m, i) => m.tempAvg != null ? `${tx(i).toFixed(1)},${ty(m.tempAvg).toFixed(1)}` : null)
    .filter(Boolean)
    .join(" ");

  const yTicks = [-5, 0, 5, 10, 15, 20, 25, 30];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" aria-label="Monthly climate chart" style={{ fontFamily: "inherit" }}>
      {yTicks.map((t) => {
        const y = ty(t);
        if (y < MT || y > MT + CH) return null;
        return (
          <g key={t}>
            <line x1={ML} y1={y} x2={ML + CW} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
            <text x={ML - 4} y={y + 3.5} textAnchor="end" fontSize="9" fill="currentColor" fillOpacity="0.45">{t}°</text>
          </g>
        );
      })}

      {hasPrec && months.map((m, i) => {
        if (m.precipMm == null) return null;
        const bh = CH * Math.min(m.precipMm / P_MAX, 1);
        const bw = (CW / 12) * 0.55;
        return <rect key={i} x={tx(i) - bw / 2} y={MT + CH - bh} width={bw} height={bh} fill="#60a5fa" fillOpacity="0.35" rx="2" />;
      })}

      {hasSun && months.map((m, i) => {
        if (m.sunHours == null) return null;
        const bh = CH * Math.min(m.sunHours / S_MAX, 1);
        const bw = (CW / 12) * 0.3;
        return <rect key={i} x={tx(i) + (CW / 12) * 0.15} y={MT + CH - bh} width={bw} height={bh} fill="#fbbf24" fillOpacity="0.25" rx="1" />;
      })}

      {bandPoints.length >= 4 && (
        <polygon points={bandPoints.join(" ")} fill="#f97316" fillOpacity="0.15" />
      )}

      {hasTemp && (
        <polyline points={avgLine} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      )}

      {hasTemp && months.map((m, i) =>
        m.tempAvg != null ? <circle key={i} cx={tx(i)} cy={ty(m.tempAvg)} r="2.5" fill="#f97316" /> : null
      )}

      {months.map((_, i) => (
        <text key={i} x={tx(i)} y={H - 6} textAnchor="middle" fontSize="9" fill="currentColor" fillOpacity="0.55">
          {String(i + 1).padStart(2, " ")}
        </text>
      ))}
    </svg>
  );
}

export function ClimateChart({ months, source, stationDist, locale = "fr" }: Props) {
  const labels = locale === "en" ? MONTHS_EN : MONTHS_FR;
  const hasPrec = months.some((m) => m.precipMm != null);
  const hasSun = months.some((m) => m.sunHours != null);
  const sourceNote = stationDist != null && stationDist > 30
    ? `${source} · station ${stationDist} km away`
    : source;

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-2 mb-3">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">
          {locale === "en" ? "Monthly climate" : "Diagramme climatique mensuel"}
        </h2>
        <span className="text-[10px] text-[var(--text-tertiary)]">{sourceNote}</span>
      </div>

      <Chart months={months} />

      <div className="mt-2 flex flex-wrap gap-4 text-[10px] text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1">
          <svg width="20" height="4" aria-hidden><line x1="0" y1="2" x2="20" y2="2" stroke="#f97316" strokeWidth="2"/></svg>
          {locale === "en" ? "Avg temp" : "Temp. moy."}
        </span>
        <span className="flex items-center gap-1">
          <svg width="12" height="10" aria-hidden><rect x="0" y="0" width="12" height="10" fill="#f97316" fillOpacity="0.15" rx="1"/></svg>
          {locale === "en" ? "Min–max" : "Min–max"}
        </span>
        {hasPrec && (
          <span className="flex items-center gap-1">
            <svg width="12" height="10" aria-hidden><rect x="0" y="0" width="12" height="10" fill="#60a5fa" fillOpacity="0.35" rx="1"/></svg>
            {locale === "en" ? "Rainfall (mm)" : "Précip. (mm)"}
          </span>
        )}
        {hasSun && (
          <span className="flex items-center gap-1">
            <svg width="12" height="10" aria-hidden><rect x="0" y="0" width="12" height="10" fill="#fbbf24" fillOpacity="0.25" rx="1"/></svg>
            {locale === "en" ? "Sunshine" : "Ensoleillement"}
          </span>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[10px] text-[var(--text-tertiary)] border-collapse min-w-[540px]">
          <thead>
            <tr>
              <td className="pr-2 pb-1"></td>
              {labels.map((m) => <td key={m} className="text-center pb-1 font-medium">{m}</td>)}
            </tr>
          </thead>
          <tbody>
            {months.some((n) => n.tempMax != null) && (
              <tr>
                <td className="pr-2 py-0.5 text-right whitespace-nowrap">{locale === "en" ? "Max °C" : "Max °C"}</td>
                {months.map((n, i) => <td key={i} className="text-center py-0.5 font-mono-data">{n.tempMax?.toFixed(1) ?? "—"}</td>)}
              </tr>
            )}
            {months.some((n) => n.tempAvg != null) && (
              <tr>
                <td className="pr-2 py-0.5 text-right whitespace-nowrap text-orange-500">{locale === "en" ? "Avg °C" : "Moy °C"}</td>
                {months.map((n, i) => <td key={i} className="text-center py-0.5 font-mono-data text-orange-500">{n.tempAvg?.toFixed(1) ?? "—"}</td>)}
              </tr>
            )}
            {months.some((n) => n.tempMin != null) && (
              <tr>
                <td className="pr-2 py-0.5 text-right whitespace-nowrap">{locale === "en" ? "Min °C" : "Min °C"}</td>
                {months.map((n, i) => <td key={i} className="text-center py-0.5 font-mono-data">{n.tempMin?.toFixed(1) ?? "—"}</td>)}
              </tr>
            )}
            {hasPrec && (
              <tr>
                <td className="pr-2 py-0.5 text-right whitespace-nowrap">{locale === "en" ? "Rain mm" : "Précip mm"}</td>
                {months.map((n, i) => <td key={i} className="text-center py-0.5 font-mono-data">{n.precipMm?.toFixed(0) ?? "—"}</td>)}
              </tr>
            )}
            {hasSun && (
              <tr>
                <td className="pr-2 py-0.5 text-right whitespace-nowrap">{locale === "en" ? "Sun h" : "Soleil h"}</td>
                {months.map((n, i) => <td key={i} className="text-center py-0.5 font-mono-data">{n.sunHours?.toFixed(0) ?? "—"}</td>)}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
