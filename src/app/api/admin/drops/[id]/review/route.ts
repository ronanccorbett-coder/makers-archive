// src/app/api/admin/drops/[id]/review/route.ts
//
// POST /api/admin/drops/:id/review { action: "approve" | "reject" }
//
// Admin-only. Approves a pending drop by flipping status to "live", or
// rejects it by flipping to "cancelled" with an optional adminNotes string.

import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "../../../../../_lib/db-admin";
import { tx } from "@instantdb/admin";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: dropId } = await params;

  // Auth check
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

  // Confirm admin role
  const data = await adminDb.query({
    profiles: { $: { where: { user: user.id } } },
    drops: { $: { where: { id: dropId } } },
  });
  const profile = data.profiles?.[0];
  const drop = data.drops?.[0];

  if (!profile?.isAdmin) {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }
  if (!drop) {
    return NextResponse.json({ error: "Drop not found." }, { status: 404 });
  }
  if (drop.status !== "pending_review") {
    return NextResponse.json(
      { error: "Drop is not awaiting review." },
      { status: 409 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const action = body.action;

  if (action === "approve") {
    await adminDb.transact(tx.drops[dropId].update({ status: "live" }));
    return NextResponse.json({ ok: true, status: "live" });
  }
  if (action === "reject") {
    await adminDb.transact(
      tx.drops[dropId].update({
        status: "cancelled",
        adminNotes: body.notes ?? "",
      })
    );
    return NextResponse.json({ ok: true, status: "cancelled" });
  }
  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
