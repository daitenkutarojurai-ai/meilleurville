"use client";

// 3-polygon radar — used only by the triplet view. Loaded as a client
// component because recharts needs the browser. The parent server component
// stays SSG.

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

type CityRadarInput = {
  slug: string;
  name: string;
  color: string;
  scores: Array<{ criterion: string; value: number }>;
};

export function TripletRadar({ cities }: { cities: CityRadarInput[] }) {
  if (cities.length === 0) return null;

  // Reshape: one row per criterion, with one column per city.
  // recharts RadarChart expects this wide format.
  const criteria = cities[0].scores.map((s) => s.criterion);
  const data = criteria.map((criterion, idx) => {
    const row: Record<string, string | number> = { criterion };
    for (const city of cities) {
      row[city.name] = city.scores[idx].value;
    }
    return row;
  });

  return (
    <div className="w-full h-80 sm:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid stroke="var(--border)" />
          <PolarAngleAxis
            dataKey="criterion"
            tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
          />
          {cities.map((city) => (
            <Radar
              key={city.slug}
              name={city.name}
              dataKey={city.name}
              stroke={city.color}
              fill={city.color}
              fillOpacity={0.18}
            />
          ))}
          <Tooltip
            formatter={(value) =>
              typeof value === "number" ? value.toFixed(1) : String(value ?? "")
            }
            contentStyle={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
