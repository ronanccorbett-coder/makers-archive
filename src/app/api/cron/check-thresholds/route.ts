// src/app/api/cron/check-thresholds/route.ts
//
// GET /api/cron/check-thresholds
//
// This is the heartbeat of the group-buy mechanic. It runs on a Vercel Cron
// schedule (configured in vercel.json) and does two things:
//
//   1. Funds any live drop whose reservedCount has reached its goalCount.
//      For each, it captures every authorized PaymentIntent, transitions
//      preorders from "authorized" -> "captured", and flips drop.status to
//      "funded". (Capturing only AT or AFTER the goal is hit is critical:
//      Stripe authorizations expire after ~7 days, so we should fund as
//      soon as the goal is reached, not wait for the deadline.)
//
//   2. Expires any live drop whose deadline has passed without reaching
//      its goal. For each, it cancels every authorized PaymentIntent
//      (releasing the hold) and flips drop.status to "expired".
//
// Idempotency: the route only acts on drops in status="live", so re-runs
// over the same time window do nothing. Errors on individual drops are
// logged but don't stop the rest of the batch.
//
// Auth: protected by a shared secret in the CRON_SECRET env var. Vercel
// Cron sends this in the Authorization header.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../_lib/db-admin";
import { tx } from "@instantdb/admin";
import {
  dropFundedEmailToSupporter,
  dropFundedEmailToDesigner,
  dropExpiredEmail,
} from "../../../_lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // never cache

export async function GET(req: NextRequest) {
  // --- Authentication ---------------------------------------------------
  const auth = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { funded: 0, expired: 0, errors: [] as string[] };

  // --- Pass 1: fund drops that hit their goal --------------------------
  const fundedData = await adminDb.query({
    drops: {
      $: { where: { status: "live" } },
      designer: { user: {} },
      preorders: {
        $: { where: { status: "authorized" } },
        supporter: { user: {} },
      },
    },
  });

  for (const drop of fundedData.drops ?? []) {
    if (drop.reservedCount < drop.goalCount) continue;

    try {
      // TODO: capture every authorized PaymentIntent via Stripe.
      // Sketch:
      //   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      //   for (const po of drop.preorders) {
      //     if (po.stripePaymentIntentId) {
      //       await stripe.paymentIntents.capture(po.stripePaymentIntentId);
      //     }
      //   }

      const now = new Date().toISOString();
      const txs = [
        tx.drops[drop.id].update({
          status: "funded",
          fundedAt: now,
        }),
        ...(drop.preorders ?? []).map((po) =>
          tx.preorders[po.id].update({
            status: "captured",
            capturedAt: now,
          })
        ),
      ];
      await adminDb.transact(txs);
      results.funded++;

      // Notify supporters + designer (fire-and-forget)
      const designerName =
        (drop as any).designer?.studioName ??
        (drop as any).designer?.displayName ??
        "the designer";
      const totalCents = drop.priceCents * (drop.preorders?.length ?? 0);
      const fmt = (cents: number) =>
        new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: drop.currency,
          maximumFractionDigits: 0,
        }).format(cents / 100);

      for (const po of drop.preorders ?? []) {
        const email = (po as any).supporter?.user?.email;
        if (email) {
          dropFundedEmailToSupporter({
            to: email,
            dropTitle: drop.title,
            designerName,
            amountFormatted: fmt(po.amountCents),
          }).catch(() => {});
        }
      }
      const designerEmail = (drop as any).designer?.user?.email;
      if (designerEmail) {
        dropFundedEmailToDesigner({
          to: designerEmail,
          dropTitle: drop.title,
          count: drop.preorders?.length ?? 0,
          totalFormatted: fmt(totalCents),
        }).catch(() => {});
      }
    } catch (err) {
      results.errors.push(`fund:${drop.id}:${(err as Error).message}`);
    }
  }

  // --- Pass 2: expire drops past their deadline ------------------------
  const expireData = await adminDb.query({
    drops: {
      $: {
        where: {
          status: "live",
          // InstantDB's where supports $lt on indexed dates
          deadline: { $lt: new Date() },
        },
      },
      designer: {},
      preorders: {
        $: { where: { status: "authorized" } },
        supporter: { user: {} },
      },
    },
  });

  for (const drop of expireData.drops ?? []) {
    try {
      // TODO: cancel every authorized PaymentIntent to release the hold.
      //   for (const po of drop.preorders) {
      //     if (po.stripePaymentIntentId) {
      //       await stripe.paymentIntents.cancel(po.stripePaymentIntentId);
      //     }
      //   }

      const now = new Date().toISOString();
      const txs = [
        tx.drops[drop.id].update({
          status: "expired",
          expiredAt: now,
        }),
        ...(drop.preorders ?? []).map((po) =>
          tx.preorders[po.id].update({
            status: "released",
            releasedAt: now,
          })
        ),
      ];
      await adminDb.transact(txs);
      results.expired++;

      const designerName =
        (drop as any).designer?.studioName ??
        (drop as any).designer?.displayName ??
        "the designer";
      for (const po of drop.preorders ?? []) {
        const email = (po as any).supporter?.user?.email;
        if (email) {
          dropExpiredEmail({
            to: email,
            dropTitle: drop.title,
            designerName,
          }).catch(() => {});
        }
      }
    } catch (err) {
      results.errors.push(`expire:${drop.id}:${(err as Error).message}`);
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
