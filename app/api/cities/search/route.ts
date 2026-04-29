import { NextRequest, NextResponse } from "next/server";
import { CITIES_SEED } from "@/data/cities-seed";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() ?? "";
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "8"), 20);

  if (q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const results = CITIES_SEED.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q) ||
      c.slug.includes(q)
  )
    .sort((a, b) => {
      const aStart = a.name.toLowerCase().startsWith(q) ? 0 : 1;
      const bStart = b.name.toLowerCase().startsWith(q) ? 0 : 1;
      if (aStart !== bStart) return aStart - bStart;
      return b.scores.global - a.scores.global;
    })
    .slice(0, limit)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      region: c.region,
      department: c.department,
      population: c.population,
      score: c.scores.global,
    }));

  return NextResponse.json({ results }, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
