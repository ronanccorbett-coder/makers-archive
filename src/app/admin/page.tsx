"use client";

// src/app/admin/page.tsx
//
// Approval queue. Pulls all drops in pending_review and lets an admin
// approve (move to live) or reject. The mutation goes through a server
// route so the rules don't need to allow client-side status changes.

import { db } from "../_lib/db";
import { formatMoney } from "../_lib/format";

export default function AdminPage() {
  const { user, isLoading: authLoading } = db.useAuth();
  const { data, isLoading } = db.useQuery(
    user
      ? {
          profiles: { $: { where: { user: user.id } } },
          drops: {
            $: { where: { status: "pending_review" } },
            designer: {},
          },
        }
      : null
  );

  if (authLoading || isLoading) {
    return <p className="mx-auto max-w-[1280px] px-6 lg:px-12 py-20 font-body italic">Loading…</p>;
  }
  if (!user || !data?.profiles?.[0]?.isAdmin) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-20">
        <h1 className="font-display text-[34px]">Admins only.</h1>
        <p className="font-body text-[17px] text-[var(--th-ink-soft)] mt-2">
          You don’t have access to this page.
        </p>
      </div>
    );
  }

  const queue = data?.drops ?? [];

  async function decide(dropId: string, action: "approve" | "reject") {
    // TODO: implement /api/admin/drops/:id/review on the server side.
    // Calling it directly here so the UI is wired even though the route
    // is a stub.
    await fetch(`/api/admin/drops/${dropId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  }

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-16">
      <span className="eyebrow">Admin · Approval queue</span>
      <h1 className="font-display text-[40px] mt-2 mb-10">
        {queue.length === 0 ? "Inbox zero." : `${queue.length} awaiting review.`}
      </h1>

      <div className="space-y-4">
        {queue.map((d) => (
          <div
            key={d.id}
            className="card-paper p-5 grid grid-cols-[120px_1fr_auto] gap-6 items-center"
          >
            <div className="aspect-[3/4] overflow-hidden">
              {d.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.coverImageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="swatch-placeholder w-full h-full" />
              )}
            </div>
            <div>
              <h3 className="font-display text-[22px]">{d.title}</h3>
              <p className="font-utility text-[12px] text-[var(--th-ink-soft)] uppercase tracking-[0.08em] mb-2">
                {d.designer?.studioName || d.designer?.displayName} ·{" "}
                {formatMoney(d.priceCents, d.currency)} · Goal {d.goalCount}
              </p>
              <p className="font-body italic text-[15px] text-[var(--th-ink-soft)] line-clamp-3 max-w-[640px]">
                {d.story}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => decide(d.id, "approve")}
                className="btn-primary"
              >
                Approve
              </button>
              <button
                onClick={() => decide(d.id, "reject")}
                className="btn-ghost"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
