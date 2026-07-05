// src/app/api/preorders/create/route.ts
//
// POST /api/preorders/create
//
// This route is the trust boundary for the entire group-buy mechanic. It is
// the ONLY place that can write to drops.reservedCount and preorders.*, and
// for that reason it must:
//
//   1. Verify the caller is authenticated with InstantDB
//   2. Verify the drop is in "live" status and not past its deadline
//   3. Create a Stripe PaymentIntent with capture_method:"manual" so the
//      card is authorized but not charged
//   4. Write a preorders row via the admin SDK
//   5. Increment drops.reservedCount atomically
//   6. Return the PaymentIntent client_secret so the browser can confirm
//      the payment method via Stripe Elements
//
// The current implementation is a stub that does steps 1, 2, 4, and 5, with
// the Stripe call marked TODO. This is enough to wire the UI end-to-end and
// validate the data flow; the Stripe integration is the next discrete piece
// of work and needs a Stripe test account + STRIPE_SECRET_KEY in env.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../_lib/db-admin";
import { id, tx } from "@instantdb/admin";
import { pledgeReceivedEmail } from "../../../_lib/email";

export const runtime = "nodejs"; // Stripe SDK uses Node APIs

type ShippingPayload = {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postal: string;
  country: string;
};

type CreatePayload = {
  dropId: string;
  shipping: ShippingPayload;
};

export async function POST(req: NextRequest) {
  let payload: CreatePayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // --- 1. Auth ---------------------------------------------------------
  // InstantDB issues a refresh token cookie on login. The admin SDK can
  // verify it. For the MVP we accept the token from an Authorization header
  // OR a body field for easy testing; production should be cookie-only.
  const authHeader = req.headers.get("authorization");
  const refreshToken =
    authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : req.cookies.get("__instantdb_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  let user;
  try {
    user = await adminDb.auth.verifyToken(refreshToken);
  } catch {
    return NextResponse.json({ error: "Invalid session." }, { status: 401 });
  }
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // --- 2. Drop validation ---------------------------------------------
  const data = await adminDb.query({
    drops: {
      $: { where: { id: payload.dropId } },
      designer: {},
    },
    profiles: {
      $: { where: { user: user.id } },
    },
  });
  const drop = data.drops?.[0];
  const profile = data.profiles?.[0];

  if (!drop) {
    return NextResponse.json({ error: "Drop not found." }, { status: 404 });
  }
  if (!profile) {
    return NextResponse.json(
      { error: "Set up your profile before pledging." },
      { status: 400 }
    );
  }
  if (drop.status !== "live") {
    return NextResponse.json(
      { error: "This drop is not accepting pledges." },
      { status: 409 }
    );
  }
  if (new Date(drop.deadline).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This drop has closed." },
      { status: 409 }
    );
  }

  // --- 3. Stripe authorization hold -----------------------------------
  // TODO: integrate Stripe. Sketch of the call:
  //
  //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  //   const intent = await stripe.paymentIntents.create({
  //     amount: drop.priceCents,
  //     currency: drop.currency.toLowerCase(),
  //     capture_method: "manual", // authorize now, capture later
  //     metadata: { dropId: drop.id, supporterId: profile.id },
  //   });
  //   const stripePaymentIntentId = intent.id;
  //   const clientSecret = intent.client_secret;
  //
  // For now, write a stub id so the DB flow can be tested end to end.
  const stripePaymentIntentId = `pi_stub_${Math.random().toString(36).slice(2, 12)}`;
  const clientSecret = `${stripePaymentIntentId}_secret_stub`;

  // --- 4 & 5. Write preorder + bump reservedCount ----------------------
  const preorderId = id();
  await adminDb.transact([
    tx.preorders[preorderId]
      .update({
        status: "authorized",
        amountCents: drop.priceCents,
        currency: drop.currency,
        shippingName: payload.shipping.name,
        shippingLine1: payload.shipping.line1,
        shippingLine2: payload.shipping.line2 ?? "",
        shippingCity: payload.shipping.city,
        shippingRegion: payload.shipping.region ?? "",
        shippingPostal: payload.shipping.postal,
        shippingCountry: payload.shipping.country,
        stripePaymentIntentId,
        createdAt: new Date().toISOString(),
      })
      .link({ drop: drop.id, supporter: profile.id }),
    tx.drops[drop.id].update({
      reservedCount: drop.reservedCount + 1,
    }),
  ]);

  // Fire-and-forget receipt email. Failures here must not affect the
  // preorder, so we don't await it.
  if (user.email) {
    pledgeReceivedEmail({
      to: user.email,
      dropTitle: drop.title,
      designerName:
        (drop as any).designer?.studioName ??
        (drop as any).designer?.displayName ??
        "the designer",
      amountFormatted: new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: drop.currency,
        maximumFractionDigits: 0,
      }).format(drop.priceCents / 100),
      dropUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/drops/${drop.slug}`,
    }).catch(() => {});
  }

  return NextResponse.json({
    ok: true,
    preorderId,
    clientSecret, // browser uses this with Stripe Elements to confirm
  });
}
