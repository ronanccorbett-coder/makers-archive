"use client";

// src/app/studios/[handle]/page.tsx

import { use } from "react";
import Link from "next/link";
import { db } from "../../_lib/db";
import { DropCard } from "../../_components/drop-card";
import { FollowButton } from "../../_components/follow-button";

export default function StudioProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const { data, isLoading } = db.useQuery({
    profiles: {
      $: { where: { handle } },
      drops: {
        $: { order: { serverCreatedAt: "desc" } },
      },
      followers: {},
    },
  });

  const profile = data?.profiles?.[0];

  if (isLoading) {
    return (
      <p className="mx-auto max-w-[1280px] px-6 lg:px-12 py-20 font-body italic text-[var(--th-ink-soft)]">
        Loading…
      </p>
    );
  }
  if (!profile) {
    return (
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-20">
        <span className="eyebrow">404</span>
        <h1 className="font-display text-[40px] mt-2 mb-3">
          No studio by that name.
        </h1>
        <Link href="/studios" className="btn-primary">
          See all studios
        </Link>
      </div>
    );
  }

  const visibleDrops = (profile.drops ?? []).filter(
    (d) => d.status !== "draft" && d.status !== "pending_review"
  );
  const followerCount = profile.followers?.length ?? 0;
  const shippedCount = (profile.drops ?? []).filter(
    (d) => d.status === "shipped" || d.status === "funded"
  ).length;

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-16">
      <div className="flex flex-wrap items-start justify-between gap-6 mb-12">
        <div>
          <span className="eyebrow">Designer</span>
          <h1 className="font-display text-[56px] leading-tight mt-2 mb-3">
            {profile.studioName || profile.displayName}
          </h1>
          {profile.location && (
            <p className="font-body italic text-[19px] text-[var(--th-ink-soft)]">
              {profile.location}
            </p>
          )}
        </div>
        <FollowButton designerProfileId={profile.id} />
      </div>

      <div className="flex gap-10 mb-12 pb-12 border-b border-[var(--th-rule)]">
        <Stat label="Drops" value={String(profile.drops?.length ?? 0)} />
        <Stat label="Funded" value={String(shippedCount)} />
        <Stat label="Followers" value={String(followerCount)} />
      </div>

      {profile.bio && (
        <p className="font-body text-[19px] text-[var(--th-ink-soft)] max-w-[640px] leading-[1.55] mb-14">
          {profile.bio}
        </p>
      )}

      <div className="flex items-baseline gap-6 mb-10">
        <h2 className="font-display text-[28px]">Work</h2>
        <div className="hr-hair flex-1" />
      </div>

      {visibleDrops.length === 0 ? (
        <p className="font-body italic text-[var(--th-ink-soft)]">
          Nothing in the archive yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {visibleDrops.map((d) => (
            <DropCard
              key={d.id}
              drop={{
                id: d.id,
                slug: d.slug,
                title: d.title,
                coverImageUrl: d.coverImageUrl,
                reservedCount: d.reservedCount,
                goalCount: d.goalCount,
                status: d.status,
                designer: {
                  handle: profile.handle,
                  studioName: profile.studioName,
                  displayName: profile.displayName,
                },
                refNumber: d.slug.slice(-3),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-[28px] text-[var(--th-ink)] tabular-nums">
        {value}
      </div>
      <div className="font-utility text-[10.5px] uppercase tracking-[0.12em] text-[var(--th-ink-soft)] mt-1">
        {label}
      </div>
    </div>
  );
}
