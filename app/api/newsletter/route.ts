import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = Schema.safeParse(body);

    if (!data.success) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    // In production: persist to DB + trigger Resend welcome email
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({ from: "bonjour@meilleurville.fr", to: data.data.email, ... })

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
