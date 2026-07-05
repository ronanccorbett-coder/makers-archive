"use client";

// src/app/_components/follow-button.tsx
//
// Toggle a follow on a designer profile. Optimistic — InstantDB's local
// state updates immediately, so the button feels instant even on slow
// connections.

import { useMemo } from "react";
import { id, tx } from "@instantdb/react";
import { db } from "../_lib/db";

export function FollowButton({
  designerProfileId,
}: {
  designerProfileId: string;
}) {
  const { user } = db.useAuth();

  // Look up my profile + whether I already follow this designer
  const { data } = db.useQuery(
    user
      ? {
          profiles: { $: { where: { user: user.id } } },
          follows: {
            $: {
              where: {
                "follower.user": user.id,
                "designer.id": designerProfileId,
              },
              limit: 1,
            },
          },
        }
      : null
  );

  const myProfile = data?.profiles?.[0];
  const existing = data?.follows?.[0];
  const isFollowing = !!existing;

  const canFollow = useMemo(
    () => !!myProfile && myProfile.id !== designerProfileId,
    [myProfile, designerProfileId]
  );

  async function toggle() {
    if (!myProfile) {
      window.location.href = "/login";
      return;
    }
    if (myProfile.id === designerProfileId) return;
    if (existing) {
      await db.transact(tx.follows[existing.id].delete());
    } else {
      const followId = id();
      await db.transact(
        tx.follows[followId]
          .update({ createdAt: new Date().toISOString() })
          .link({ follower: myProfile.id, designer: designerProfileId })
      );
    }
  }

  if (!user) {
    return (
      <a href="/login" className="btn-ghost">
        Follow
      </a>
    );
  }

  if (!canFollow) return null;

  return (
    <button onClick={toggle} className={isFollowing ? "btn-ghost" : "btn-primary"}>
      {isFollowing ? "Following ✓" : "Follow"}
    </button>
  );
}
