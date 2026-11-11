// Radar à 3 polygones de la vue triplet — SVG rendu côté serveur.
//
// Jusqu'au 2026-11-11 ce graphique passait par recharts dans un composant
// client : ~103 Ko gzip de JS pour un seul dessin (mesuré à l'esbuild), et un
// cadre vide sans JavaScript, ResponsiveContainer ne mesurant sa boîte que dans
// le navigateur. C'était le seul usage de recharts du dépôt ; la dépendance est
// partie avec lui. La valeur exacte de chaque sommet reste lisible au survol
// (<title>) et dans le tableau « critère par critère » juste en dessous.

type CityRadarInput = {
  slug: string;
  name: string;
  color: string;
  scores: Array<{ criterion: string; value: number }>;
};

const SIZE = 400;
const CENTER = SIZE / 2;
const RADIUS = 128;
const RINGS = [2, 4, 6, 8, 10];

function point(index: number, count: number, value: number): [number, number] {
  // Premier axe en haut, puis sens horaire.
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / count;
  const r = (Math.max(0, Math.min(10, value)) / 10) * RADIUS;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

const fmt = (n: number) => n.toFixed(2);

export function TripletRadar({ cities }: { cities: CityRadarInput[] }) {
  if (cities.length === 0) return null;

  const criteria = cities[0].scores.map((s) => s.criterion);
  const count = criteria.length;
  const summary = cities
    .map((c) => `${c.name} : ${c.scores.map((s) => `${s.criterion} ${s.value.toFixed(1)}`).join(", ")}`)
    .join(" · ");

  return (
    <figure className="w-full">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Radar des scores sur 10. ${summary}`}
        className="mx-auto block h-auto w-full max-w-[26rem]"
      >
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={criteria.map((_, i) => point(i, count, ring).map(fmt).join(",")).join(" ")}
            fill="none"
            stroke="var(--border)"
            strokeWidth={1}
          />
        ))}
        {criteria.map((_, i) => {
          const [x, y] = point(i, count, 10);
          return (
            <line key={i} x1={CENTER} y1={CENTER} x2={fmt(x)} y2={fmt(y)} stroke="var(--border)" strokeWidth={1} />
          );
        })}
        {RINGS.map((ring) => (
          <text
            key={ring}
            x={CENTER + 4}
            y={fmt(CENTER - (ring / 10) * RADIUS + 3)}
            fontSize={9}
            fill="var(--text-tertiary)"
          >
            {ring}
          </text>
        ))}
        {criteria.map((criterion, i) => {
          const angle = -Math.PI / 2 + (2 * Math.PI * i) / count;
          const x = CENTER + (RADIUS + 14) * Math.cos(angle);
          const y = CENTER + (RADIUS + 14) * Math.sin(angle);
          const cos = Math.cos(angle);
          const anchor = Math.abs(cos) < 0.2 ? "middle" : cos > 0 ? "start" : "end";
          return (
            <text
              key={criterion}
              x={fmt(x)}
              y={fmt(y)}
              fontSize={11}
              textAnchor={anchor}
              dominantBaseline="middle"
              fill="var(--text-secondary)"
            >
              {criterion}
            </text>
          );
        })}
        {cities.map((city) => (
          <polygon
            key={city.slug}
            points={city.scores.map((s, i) => point(i, count, s.value).map(fmt).join(",")).join(" ")}
            fill={city.color}
            fillOpacity={0.18}
            stroke={city.color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        ))}
        {cities.map((city) =>
          city.scores.map((s, i) => {
            const [x, y] = point(i, count, s.value);
            return (
              <circle key={`${city.slug}-${i}`} cx={fmt(x)} cy={fmt(y)} r={3.5} fill={city.color}>
                <title>{`${city.name} · ${s.criterion} : ${s.value.toFixed(1)}/10`}</title>
              </circle>
            );
          })
        )}
      </svg>
      <figcaption className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[var(--text-secondary)]">
        {cities.map((city) => (
          <span key={city.slug} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: city.color }} aria-hidden="true" />
            {city.name}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
