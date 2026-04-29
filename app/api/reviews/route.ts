import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const ReviewSchema = z.object({
  citySlug: z.string().min(1),
  scoreGlobal: z.number().int().min(1).max(10),
  scoreSafety: z.number().int().min(1).max(10).optional(),
  scoreTransport: z.number().int().min(1).max(10).optional(),
  scoreCost: z.number().int().min(1).max(10).optional(),
  scoreNature: z.number().int().min(1).max(10).optional(),
  body: z.string().min(50).max(2000),
  pros: z.string().max(300).optional(),
  cons: z.string().max(300).optional(),
  livedHere: z.boolean(),
  durationMonths: z.number().int().min(1).optional(),
  lifestyleTags: z.array(z.string()).max(5),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = ReviewSchema.safeParse(body);

    if (!data.success) {
      return NextResponse.json(
        { error: "Données invalides", details: data.error.flatten() },
        { status: 400 }
      );
    }

    // In production: persist to DB via Prisma, trigger moderation queue
    // For now: return success with a mock ID
    const mockId = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return NextResponse.json({
      success: true,
      id: mockId,
      message: "Votre avis a été soumis et sera visible après modération.",
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
