"use client";

// src/app/drops/[slug]/page.tsx

import { use } from "react";
import Link from "next/link";
import { db } from "../../_lib/db";
import { formatMoney, pct, daysLeft } from "../../_lib/format";
import { findMockDrop } from "../../_lib/mock-data";
import { PreorderButton } from "./preorder-button";
import { ShareButton } from "../../_components/share-button";
import { FollowButton } from "../../_components/follow-button";

type Params = { slug: string };

export default function DropDetailPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = use(params);

  const { isLoading, data } = db.useQuery({
    drops: {
      $: { where: { slug } },
      designer: {},
    },
  });

  const liveDrop = data?.drops?.[0];
  const mock = !liveDrop && !isLoading ? findMockDrop(slug) : undefined;

  // While loading, show a quiet skeleton-ish state. Cormorant body text
  // makes a sparse placeholder feel intentional rather than broken.
  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-20">
        <p className="font-body italic text-[var(--th-ink-soft)]">
          Pulling the record…
        </p>
      </div>
    );
  }

  if (!liveDrop && !mock) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-20">
        <span className="eyebrow">404</span>
        <h1 className="font-display text-[40px] mt-2 mb-3">
          No entry by that name.
        </h1>
        <p className="font-body text-[19px] text-[var(--th-ink-soft)] mb-8 max-w-[480px]">
          This piece may have been pulled, or never logged at all. The archive
          is still open.
        </p>
        <Link href="/" className="btn-primary">
          Back to the archive
        </Link>
      </div>
    );
  }

  // Normalize the two data shapes into one for rendering
  const drop = liveDrop
    ? {
        id: liveDrop.id,
        title: liveDrop.title,
        story: liveDrop.story,
        priceCents: liveDrop.priceCents,
        currency: liveDrop.currency,
        goalCount: liveDrop.goalCount,
        reservedCount: liveDrop.reservedCount,
        deadline: liveDrop.deadline,
        status: liveDrop.status,
        coverImageUrl: liveDrop.coverImageUrl,
        imageUrls: (liveDrop.imageUrls as string[]) ?? [],
        slug: liveDrop.slug,
        designerId: liveDrop.designer?.id,
        designerName:
          liveDrop.designer?.studioName ??
          liveDrop.designer?.displayName ??
          "Independent designer",
        designerHandle: liveDrop.designer?.handle,
        designerLocation: liveDrop.designer?.location,
        designerBio: liveDrop.designer?.bio,
        refNumber: liveDrop.slug.slice(-3),
      }
    : {
        id: mock!.id,
        title: mock!.title,
        story:
          "I sourced this material from a small mill outside Lyon that's closing at the end of the year. There were forty meters left. This is what they become — cut, sewn, and finished in the studio over the next eight weeks if enough of you say so.",
        priceCents: 21500,
        currency: "USD",
        goalCount: mock!.goalCount,
        reservedCount: mock!.reservedCount,
        deadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
        status: mock!.status,
        coverImageUrl: mock!.coverImageUrl,
        imageUrls: [mock!.coverImageUrl] as string[],
        slug: mock!.slug,
        designerId: undefined as string | undefined,
        designerName: mock!.designer?.studioName ?? "Independent designer",
        designerHandle: undefined as string | undefined,
        designerLocation: "Lagos, Nigeria",
        designerBio: undefined as string | undefined,
        refNumber: mock!.refNumber,
      };

  const percent = pct(drop.reservedCount, drop.goalCount);
  const remaining = Math.max(0, drop.goalCount - drop.reservedCount);
  const days = daysLeft(drop.deadline);
  const isLive = drop.status === "live";
  const isFunded = drop.status === "funded";

  return (
    <article className="mx-auto max-w-[1280px] px-6 lg:px-12 py-12 lg:py-16">
      <Link
        href="/"
        className="font-utility text-[11px] uppercase tracking-[0.12em] text-[var(--th-ink-soft)] hover:text-[var(--th-oxblood)]"
      >
        ← The archive
      </Link>

      <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 mt-8">
        {/* Image column */}
        <div>
          <div className="aspect-[4/5] overflow-hidden">
            {drop.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={drop.coverImageUrl}
                alt={drop.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="swatch-placeholder w-full h-full" />
            )}
          </div>
          {drop.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {drop.imageUrls.slice(0, 4).map((url, i) => (
                <div key={i} className="aspect-square overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail column */}
        <div className="flex flex-col">
          <span className="eyebrow">
            Pattern {drop.refNumber} — {drop.designerName}
          </span>
          <h1 className="font-display text-[40px] lg:text-[48px] leading-[1.05] mt-3 mb-6">
            {drop.title}
          </h1>

          <p className="font-body text-[19px] italic leading-[1.55] text-[var(--th-ink-soft)] mb-8">
            “{drop.story}”
          </p>

          <hr className="hr-hair mb-7" />

          {/* The ledger — central proof element */}
          <div className="mb-7">
            <div className="flex justify-between items-baseline mb-2">
              <span className="font-utility text-[11px] uppercase tracking-[0.12em] text-[var(--th-ink-soft)]">
                Pledged
              </span>
              <span className="font-display text-[22px] text-[var(--th-ink)]">
                {drop.reservedCount} / {drop.goalCount}
              </span>
            </div>
            <div className="ledger-track">
              <div
                className="ledger-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="font-utility text-[11px] text-[var(--th-ink-muted)] uppercase tracking-[0.1em] mt-2">
              {isFunded
                ? "Funded — in production"
                : isLive && remaining > 0
                ? `${remaining} more to fund · ${days} ${days === 1 ? "day" : "days"} left`
                : "Closed"}
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-8 mb-8">
            <Stat label="Price" value={formatMoney(drop.priceCents, drop.currency)} />
            <Stat label="Goal" value={String(drop.goalCount)} />
            <Stat
              label="Remaining"
              value={isFunded ? "—" : `${days}d`}
            />
          </div>

          <PreorderButton
            dropId={drop.id}
            priceCents={drop.priceCents}
            currency={drop.currency}
            status={drop.status}
          />

          <div className="flex items-center justify-between mt-3">
            <ShareButton
              url={`/drops/${drop.slug}`}
              title={drop.title}
              text={`${drop.title} by ${drop.designerName} on Threadhaus`}
            />
            <p className="font-body italic text-[13px] text-[var(--th-ink-muted)]">
              Sharing helps fund it.
            </p>
          </div>

          <p className="font-body text-[14px] italic text-[var(--th-ink-muted)] mt-3 leading-[1.5]">
            Your card is held, not charged. We only take payment if the piece
            reaches its goal. If it doesn’t, the hold is released automatically.
          </p>

          <hr className="hr-hair my-9" />

          {/* Designer block */}
          <div>
            <span className="eyebrow">The maker</span>
            <h3 className="font-display text-[22px] mt-2 mb-1">
              {drop.designerName}
            </h3>
            {drop.designerLocation && (
              <p className="font-body italic text-[15px] text-[var(--th-ink-soft)] mb-3">
                {drop.designerLocation}
              </p>
            )}
            {drop.designerBio && (
              <p className="font-body text-[16px] text-[var(--th-ink-soft)] leading-[1.55] mb-4">
                {drop.designerBio}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              {drop.designerHandle && (
                <Link
                  href={`/studios/${drop.designerHandle}`}
                  className="btn-ghost"
                >
                  See more work →
                </Link>
              )}
              {drop.designerId && (
                <FollowButton designerProfileId={drop.designerId} />
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-[26px] text-[var(--th-ink)]">
        {value}
      </div>
      <div className="font-utility text-[10.5px] uppercase tracking-[0.12em] text-[var(--th-ink-soft)] mt-1">
        {label}
      </div>
    </div>
  );
}

// Expose the mock slugs at build-time so dev navigation works without a DB.
// Real drops resolve dynamically from InstantDB.
// (generateStaticParams omitted because this is a client component; dynamic
// routes still resolve fine at runtime.)
