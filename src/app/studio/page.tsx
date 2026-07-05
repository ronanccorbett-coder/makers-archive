"use client";

// src/app/studio/page.tsx
//
// Designer dashboard. Lists all the drops this designer owns across every
// status, with the right next action surfaced per row.

import Link from "next/link";
import { db } from "../_lib/db";
import { pct, daysLeft, formatMoney } from "../_lib/format";

export default function StudioDashboardPage() {
  const { user, isLoading: authLoading } = db.useAuth();
  const { data, isLoading } = db.useQuery(
    user
      ? {
          profiles: {
            $: { where: { user: user.id } },
            drops: {
              $: { order: { serverCreatedAt: "desc" } },
            },
          },
        }
      : null
  );

  if (authLoading || isLoading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <Empty
        title="Sign in to access your studio."
        body="Your drops, draft and live, live behind your account."
        cta={{ href: "/login", label: "Sign in" }}
      />
    );
  }

  const profile = data?.profiles?.[0];
  if (!profile) {
    return (
      <Empty
        title="Finish setting up your profile."
        body="You need a profile before you can list pieces."
        cta={{ href: "/signup", label: "Set up profile" }}
      />
    );
  }
  if (!profile.isDesigner) {
    return (
      <Empty
        title="Studios are for designers."
        body="If you’re a designer, you can apply to upgrade your account."
        cta={{ href: "/about#designers", label: "Designer guide" }}
      />
    );
  }

  const drops = profile.drops ?? [];

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-12 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <span className="eyebrow">Studio</span>
          <h1 className="font-display text-[40px] leading-tight mt-2">
            {profile.studioName || profile.displayName}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/studio/profile" className="btn-ghost">
            Edit profile
          </Link>
          <Link href="/studio/drops/new" className="btn-primary">
            New drop
          </Link>
        </div>
      </div>

      {drops.length === 0 ? (
        <div className="card-paper p-10 text-center">
          <h3 className="font-display text-[26px] mb-2">
            The ledger is empty.
          </h3>
          <p className="font-body text-[17px] text-[var(--th-ink-soft)] mb-7 leading-[1.5]">
            Add your first piece. We’ll review it before it goes live.
          </p>
          <Link href="/studio/drops/new" className="btn-primary">
            Submit a design
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {drops.map((d) => (
            <DropRow key={d.id} drop={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function DropRow({ drop }: { drop: any }) {
  const percent = pct(drop.reservedCount, drop.goalCount);
  const days = daysLeft(drop.deadline);
  return (
    <div className="card-paper p-5 grid grid-cols-[80px_1fr_auto] items-center gap-5">
      <div className="aspect-[3/4] overflow-hidden">
        {drop.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={drop.coverImageUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="swatch-placeholder w-full h-full" />
        )}
      </div>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="font-display text-[20px]">{drop.title}</h3>
          <StatusPill status={drop.status} />
        </div>
        <p className="font-utility text-[12px] text-[var(--th-ink-soft)] mb-2 uppercase tracking-[0.08em]">
          {formatMoney(drop.priceCents ?? 0, drop.currency ?? "USD")} ·{" "}
          {drop.reservedCount} / {drop.goalCount} pledged ·{" "}
          {drop.status === "live" ? `${days}d left` : ""}
        </p>
        {drop.status === "live" && (
          <div className="ledger-track max-w-[420px]">
            <div className="ledger-fill" style={{ width: `${percent}%` }} />
          </div>
        )}
      </div>
      <Link
        href={`/studio/drops/${drop.id}`}
        className="btn-ghost"
      >
        {drop.status === "draft" ? "Continue" : "View"}
      </Link>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const labels: Record<string, string> = {
    draft: "Draft",
    pending_review: "In review",
    live: "Live",
    funded: "Funded",
    expired: "Expired",
    shipped: "Shipped",
    cancelled: "Cancelled",
  };
  const cls =
    status === "funded"
      ? "status-pill status-pill--funded"
      : status === "expired" || status === "cancelled"
      ? "status-pill status-pill--expired"
      : "status-pill status-pill--live";
  return <span className={cls}>{labels[status] ?? status}</span>;
}

function Loading() {
  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-20">
      <p className="font-body italic text-[var(--th-ink-soft)]">
        Opening the studio…
      </p>
    </div>
  );
}

function Empty({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { href: string; label: string };
}) {
  return (
    <div className="mx-auto max-w-[440px] px-6 py-20">
      <h1 className="font-display text-[34px] leading-tight mb-3">{title}</h1>
      <p className="font-body text-[17px] text-[var(--th-ink-soft)] mb-7 leading-[1.5]">
        {body}
      </p>
      <Link href={cta.href} className="btn-primary">
        {cta.label}
      </Link>
    </div>
  );
}
