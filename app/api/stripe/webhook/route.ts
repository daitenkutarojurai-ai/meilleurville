import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // TODO: mark user as pro in DB
      // await prisma.user.update({ where: { email: session.customer_email! }, data: { isPro: true, stripeCustomerId: session.customer as string } })
      console.log("New Pro subscriber:", session.customer_email);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      // TODO: revoke pro access
      console.log("Subscription cancelled:", sub.id);
      break;
    }
    case "invoice.payment_failed": {
      // TODO: notify user via email
      break;
    }
  }

  return NextResponse.json({ received: true });
}
