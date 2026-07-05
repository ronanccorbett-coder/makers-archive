// src/app/api/stripe/webhook/route.ts
//
// POST /api/stripe/webhook
//
// Stripe sends events here when something happens to a PaymentIntent:
// payment_intent.canceled, payment_intent.payment_failed, etc. We use it
// mostly as a safety net — the happy path is driven by the cron route,
// but webhooks let us react to e.g. a card declining on capture.
//
// To enable: set STRIPE_WEBHOOK_SECRET to the value Stripe gives you when
// you create the webhook endpoint in their dashboard, and add the route
// URL there.

import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // TODO: verify signature using stripe.webhooks.constructEvent and the
  // raw body. Next.js App Router gives the raw body via req.text().
  //
  //   const sig = req.headers.get("stripe-signature");
  //   const rawBody = await req.text();
  //   const event = stripe.webhooks.constructEvent(
  //     rawBody, sig!, process.env.STRIPE_WEBHOOK_SECRET!
  //   );
  //
  // Then handle relevant event types:
  //   - payment_intent.payment_failed -> mark preorder status="failed"
  //   - payment_intent.canceled       -> mark preorder status="released"

  return NextResponse.json({ received: true });
}
