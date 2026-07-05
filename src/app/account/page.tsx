"use client";

// src/app/account/page.tsx

import { db } from "../_lib/db";

export default function AccountPage() {
  const { user, isLoading } = db.useAuth();
  const { data } = db.useQuery(
    user
      ? {
          profiles: { $: { where: { user: user.id } } },
          preorders: {
            $: {
              where: { supporter: user.id },
              order: { serverCreatedAt: "desc" },
            },
            drop: {},
          },
        }
      : null
  );

  if (isLoading) {
    return <p className="mx-auto max-w-[760px] px-6 py-20 font-body italic">Loading…</p>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-[440px] px-6 py-20">
        <h1 className="font-display text-[34px] mb-3">You're signed out.</h1>
        <a href="/login" className="btn-primary">Sign in</a>
      </div>
    );
  }

  const profile = data?.profiles?.[0];
  const orders = data?.preorders ?? [];

  return (
    <div className="mx-auto max-w-[760px] px-6 py-16">
      <span className="eyebrow">Account</span>
      <h1 className="font-display text-[40px] mt-2 mb-2">
        {profile?.displayName ?? user.email}
      </h1>
      <p className="font-body italic text-[15px] text-[var(--th-ink-soft)] mb-10">
        {user.email}
      </p>

      <div className="flex items-baseline gap-6 mb-6">
        <h2 className="font-display text-[24px]">Your pledges</h2>
        <div className="hr-hair flex-1" />
      </div>

      {orders.length === 0 ? (
        <p className="font-body italic text-[var(--th-ink-soft)] mb-10">
          Nothing pledged yet.
        </p>
      ) : (
        <div className="space-y-3 mb-10">
          {orders.map((o) => (
            <div key={o.id} className="card-paper p-4 flex justify-between items-center">
              <div>
                <h3 className="font-display text-[18px]">
                  {o.drop?.title ?? "—"}
                </h3>
                <p className="font-utility text-[11px] uppercase tracking-[0.1em] text-[var(--th-ink-soft)] mt-1">
                  {o.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => db.auth.signOut()} className="btn-ghost">
        Sign out →
      </button>
    </div>
  );
}
