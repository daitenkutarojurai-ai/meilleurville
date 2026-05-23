import { buildFingerprint, type FingerprintGeometry, type Petal } from "@/lib/city-fingerprint";
import { formatScore, scoreLabel } from "@/lib/utils";
import type { CitySeed } from "@/data/cities-seed";

interface Props {
  city: Pick<CitySeed, "slug" | "name" | "scores"> & { region?: string | null };
  size?: number;
  showLabels?: boolean;
  showFooter?: boolean;
  className?: string;
}

function petalPath(p: Petal, cx: number, cy: number): string {
  const halfWidth = 18;
  const perp = p.angle + Math.PI / 2;
  const baseAX = cx + Math.cos(perp) * halfWidth;
  const baseAY = cy + Math.sin(perp) * halfWidth;
  const baseBX = cx - Math.cos(perp) * halfWidth;
  const baseBY = cy - Math.sin(perp) * halfWidth;
  const midOff = p.length * 0.6;
  const widthMid = halfWidth * 0.85;
  const midAX = cx + Math.cos(p.angle) * midOff + Math.cos(perp) * widthMid;
  const midAY = cy + Math.sin(p.angle) * midOff + Math.sin(perp) * widthMid;
  const midBX = cx + Math.cos(p.angle) * midOff - Math.cos(perp) * widthMid;
  const midBY = cy + Math.sin(p.angle) * midOff - Math.sin(perp) * widthMid;
  return (
    `M ${baseAX.toFixed(2)} ${baseAY.toFixed(2)}` +
    ` Q ${midAX.toFixed(2)} ${midAY.toFixed(2)} ${p.tipX.toFixed(2)} ${p.tipY.toFixed(2)}` +
    ` Q ${midBX.toFixed(2)} ${midBY.toFixed(2)} ${baseBX.toFixed(2)} ${baseBY.toFixed(2)} Z`
  );
}

export function CityFingerprint({ city, size = 320, showLabels = true, showFooter = true, className }: Props) {
  const geom: FingerprintGeometry = buildFingerprint(city);
  const idBase = `fp-${city.slug}`;
  const guideRings = [0.35, 0.7, 1.0];

  return (
    <figure className={className} aria-label={`Empreinte visuelle de ${city.name}`}>
      <svg
        viewBox={`0 0 ${geom.size} ${geom.size}`}
        width={size}
        height={size}
        role="img"
        aria-hidden={false}
        className="block"
      >
        <defs>
          <radialGradient id={`${idBase}-bg`} cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor={geom.centerColor} stopOpacity="0.22" />
            <stop offset="65%" stopColor={geom.centerColor} stopOpacity="0.06" />
            <stop offset="100%" stopColor={geom.centerColor} stopOpacity="0" />
          </radialGradient>
          {geom.petals.map((p, i) => (
            <radialGradient
              key={i}
              id={`${idBase}-p${i}`}
              cx="50%"
              cy="50%"
              r="55%"
              fx="50%"
              fy="50%"
            >
              <stop offset="0%" stopColor={p.color} stopOpacity="0.95" />
              <stop offset="55%" stopColor={p.color} stopOpacity="0.45" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0.05" />
            </radialGradient>
          ))}
          <radialGradient id={`${idBase}-core`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={geom.centerColor} stopOpacity="0.95" />
            <stop offset="100%" stopColor={geom.centerColor} stopOpacity="0.45" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width={geom.size} height={geom.size} fill={`url(#${idBase}-bg)`} />

        {guideRings.map((f, i) => (
          <circle
            key={i}
            cx={geom.cx}
            cy={geom.cy}
            r={56 + f * 116}
            fill="none"
            stroke={geom.centerColor}
            strokeOpacity={i === guideRings.length - 1 ? 0.18 : 0.1}
            strokeWidth={0.6}
            strokeDasharray={i === guideRings.length - 1 ? "0" : "2 5"}
          />
        ))}

        <g transform={`rotate(${geom.rotation} ${geom.cx} ${geom.cy})`}>
          {geom.petals.map((p, i) => (
            <path
              key={p.key}
              d={petalPath(p, geom.cx, geom.cy)}
              fill={`url(#${idBase}-p${i})`}
              stroke={p.color}
              strokeOpacity={0.55}
              strokeWidth={0.8}
            />
          ))}
          <polygon
            points={geom.polygonPoints}
            fill={geom.centerColor}
            fillOpacity={0.07}
            stroke={geom.centerColor}
            strokeOpacity={0.6}
            strokeWidth={1.3}
            strokeLinejoin="round"
          />
        </g>

        {geom.orbitalDots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={d.color} opacity={d.alpha} />
        ))}

        {showLabels &&
          geom.petals.map((p) => (
            <text
              key={`label-${p.key}`}
              x={p.labelX}
              y={p.labelY}
              textAnchor={p.textAnchor}
              dominantBaseline="middle"
              fontSize="11"
              fontWeight={500}
              fill="currentColor"
              opacity={0.55}
            >
              {p.short}
            </text>
          ))}

        <circle cx={geom.cx} cy={geom.cy} r={34} fill={`url(#${idBase}-core)`} />
        <circle cx={geom.cx} cy={geom.cy} r={28} fill="#0b0f17" />
        <text
          x={geom.cx}
          y={geom.cy - 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="22"
          fontWeight={800}
          fill={geom.centerColor}
        >
          {formatScore(geom.globalScore)}
        </text>
        <text
          x={geom.cx}
          y={geom.cy + 14}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="7.5"
          fontWeight={600}
          letterSpacing="1.5"
          fill={geom.centerColor}
          opacity={0.85}
        >
          /10
        </text>
      </svg>
      {showFooter && (
        <figcaption className="mt-3 text-center">
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            Empreinte de {city.name}
          </div>
          <div className="text-xs text-[var(--text-tertiary)]">
            Signature unique · {scoreLabel(geom.globalScore)} · dérivée des 8 axes
          </div>
        </figcaption>
      )}
    </figure>
  );
}
