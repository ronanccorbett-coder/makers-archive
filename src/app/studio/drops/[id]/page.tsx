"use client";

// src/app/studio/drops/[id]/page.tsx
//
// Designer-facing drop view. Two modes:
//   - draft / pending_review: edit form, can resubmit
//   - live / funded / shipped: read-only stats + backer list

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tx } from "@instantdb/react";
import { db } from "../../../_lib/db";
import { ImageUploader } from "../../../_components/image-uploader";
import { formatMoney, pct, daysLeft } from "../../../_lib/format";

export default function StudioDropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: dropId } = use(params);
  const router = useRouter();
  const { user } = db.useAuth();

  const { data, isLoading } = db.useQuery(
    user
      ? {
          profiles: { $: { where: { user: user.id } } },
          drops: {
            $: { where: { id: dropId } },
            designer: {},
            preorders: {},
          },
        }
      : null
  );

  const drop = data?.drops?.[0];
  const profile = data?.profiles?.[0];

  // Local edit state - hydrated from server data once
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [price, setPrice] = useState("");
  const [goal, setGoal] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (drop && !hydrated) {
      setTitle(drop.title);
      setStory(drop.story);
      setPrice((drop.priceCents / 100).toFixed(2));
      setGoal(String(drop.goalCount));
      setImages((drop.imageUrls as string[]) ?? []);
      setHydrated(true);
    }
  }, [drop, hydrated]);

  if (isLoading) {
    return <p className="mx-auto max-w-[680px] px-6 py-20 font-body italic">Loading…</p>;
  }
  if (!user) {
    return <Empty title="Sign in" cta="/login" />;
  }
  if (!drop) {
    return <Empty title="Drop not found" cta="/studio" ctaLabel="Back to studio" />;
  }
  if (drop.designer?.id !== profile?.id) {
    return <Empty title="Not your drop" cta="/studio" ctaLabel="Back to studio" />;
  }

  const isEditable = drop.status === "draft" || drop.status === "pending_review";

  async function save() {
    if (!drop) return;
    setBusy(true);
    setError(null);
    try {
      const priceCents = Math.round(parseFloat(price) * 100);
      const goalCount = parseInt(goal, 10);
      await db.transact(
        tx.drops[drop.id].update({
          title,
          story,
          priceCents,
          goalCount,
          imageUrls: images,
          coverImageUrl: images[0] ?? drop.coverImageUrl,
        })
      );
      router.push("/studio");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  if (!isEditable) {
    return (
      <div className="mx-auto max-w-[760px] px-6 py-16">
        <Link
          href="/studio"
          className="font-utility text-[11px] uppercase tracking-[0.12em] text-[var(--th-ink-soft)] hover:text-[var(--th-oxblood)]"
        >
          ← Studio
        </Link>
        <h1 className="font-display text-[40px] mt-3 mb-8">{drop.title}</h1>

        <div className="grid grid-cols-3 gap-6 mb-10">
          <Stat label="Status" value={drop.status} />
          <Stat
            label="Pledged"
            value={`${drop.reservedCount} / ${drop.goalCount}`}
          />
          <Stat
            label="Funded"
            value={`${pct(drop.reservedCount, drop.goalCount)}%`}
          />
        </div>
        <div className="ledger-track mb-2">
          <div
            className="ledger-fill"
            style={{ width: `${pct(drop.reservedCount, drop.goalCount)}%` }}
          />
        </div>
        <p className="font-utility text-[11px] uppercase tracking-[0.1em] text-[var(--th-ink-soft)] mb-10">
          {drop.status === "live"
            ? `${daysLeft(drop.deadline)} days left`
            : drop.status === "funded"
            ? "Funded — in production"
            : "Closed"}
        </p>

        <div className="flex items-baseline gap-6 mb-5">
          <h2 className="font-display text-[24px]">Backers</h2>
          <div className="hr-hair flex-1" />
        </div>
        {(drop.preorders ?? []).length === 0 ? (
          <p className="font-body italic text-[var(--th-ink-soft)]">
            No backers yet.
          </p>
        ) : (
          <div className="space-y-2">
            {(drop.preorders ?? []).map((po) => (
              <div
                key={po.id}
                className="card-paper p-3 flex justify-between items-center"
              >
                <span className="font-body text-[16px]">{po.shippingName}</span>
                <span className="font-utility text-[11px] uppercase tracking-[0.1em] text-[var(--th-ink-soft)]">
                  {po.status} · {formatMoney(po.amountCents, po.currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        <Link href={`/drops/${drop.slug}`} className="btn-ghost mt-8 inline-block">
          View public page →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-16">
      <Link
        href="/studio"
        className="font-utility text-[11px] uppercase tracking-[0.12em] text-[var(--th-ink-soft)] hover:text-[var(--th-oxblood)]"
      >
        ← Studio
      </Link>
      <span className="eyebrow mt-6 block">
        {drop.status === "draft" ? "Edit draft" : "In review · edit"}
      </span>
      <h1 className="font-display text-[40px] leading-tight mt-2 mb-9">
        {drop.title || "Untitled"}
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        className="flex flex-col gap-6"
      >
        <label className="block">
          <span className="field-label">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="field-label">Story</span>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={6}
            required
            className="field-textarea"
          />
        </label>
        <ImageUploader value={images} onChange={setImages} max={6} />
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="field-label">Price</span>
            <input
              type="number"
              step="0.01"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Pledges needed</span>
            <input
              type="number"
              min="1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
              className="field-input"
            />
          </label>
        </div>

        {error && (
          <p className="font-body italic text-[var(--th-oxblood)] text-[15px]">
            {error}
          </p>
        )}

        <button type="submit" disabled={busy} className="btn-primary btn-block">
          {busy ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-[24px] text-[var(--th-ink)] capitalize">
        {value}
      </div>
      <div className="font-utility text-[10.5px] uppercase tracking-[0.12em] text-[var(--th-ink-soft)] mt-1">
        {label}
      </div>
    </div>
  );
}

function Empty({
  title,
  cta,
  ctaLabel = "Sign in",
}: {
  title: string;
  cta: string;
  ctaLabel?: string;
}) {
  return (
    <div className="mx-auto max-w-[440px] px-6 py-20">
      <h1 className="font-display text-[34px] mb-3">{title}</h1>
      <Link href={cta} className="btn-primary">
        {ctaLabel}
      </Link>
    </div>
  );
}
