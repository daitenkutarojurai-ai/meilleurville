import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS } from "@/lib/stripe";
import { z } from "zod";

const Schema = z.object({
  planKey: z.enum(["pro"]),
  email: z.string().email().optional(),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = Schema.safeParse(body);

    if (!data.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const { planKey, email, successUrl, cancelUrl } = data.data;
    const plan = PLANS[planKey];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://meilleurville.fr";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: successUrl ?? `${baseUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl ?? `${baseUrl}/premium`,
      metadata: { planKey },
      subscription_data: {
        trial_period_days: 7,
        metadata: { planKey },
      },
      allow_promotion_codes: true,
      locale: "fr",
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Erreur paiement" }, { status: 500 });
  }
}
