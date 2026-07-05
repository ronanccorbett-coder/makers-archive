// instant.perms.ts
//
// Permissions for Threadhaus. Push with: npx instant-cli push perms
//
// IMPORTANT: by default InstantDB allows all reads and writes from any client.
// This file locks that down. Every entity should have explicit rules.
//
// CRITICAL: certain mutations MUST NOT be allowed from the client:
//   - drops.status changes (must come from a server route with a service token)
//   - drops.reservedCount changes (server only - prevents users from faking funding)
//   - drops.fundedAt / expiredAt timestamps (server only)
//   - preorders.status changes (server only)
//   - preorders.stripePaymentIntentId (server only)
//
// The cleanest pattern: only allow client mutations on a small set of safe fields,
// and have the server use the @instantdb/admin SDK (with a service token) for
// privileged updates from API routes.

import type { InstantRules } from "@instantdb/react";

const rules = {
  $users: {
    allow: {
      view: "auth.id == data.id",
      create: "false", // managed by InstantDB auth
      update: "false",
      delete: "false",
    },
  },

  profiles: {
    allow: {
      view: "true", // profiles are public
      // a user can only create a profile linked to themselves
      create: "auth.id != null && newData.user == auth.id",
      // a user can only update their own profile, and CANNOT flip isAdmin
      update:
        "auth.id == data.user && newData.isAdmin == data.isAdmin",
      delete: "false",
    },
  },

  drops: {
    allow: {
      // drops are public once they're past the draft stage; drafts only
      // visible to their owner.
      view:
        "data.status != 'draft' || (auth.id != null && data.designer.user == auth.id)",
      // designers can create drops as drafts
      create:
        "auth.id != null && data.designer.user == auth.id && newData.status == 'draft' && newData.reservedCount == 0",
      // designers can edit fields on their own drop while it's a draft or pending review,
      // but the security-critical fields (status, reservedCount, fundedAt, expiredAt)
      // must not be changed from the client.
      update:
        "auth.id == data.designer.user && (data.status == 'draft' || data.status == 'pending_review') && newData.status == data.status && newData.reservedCount == data.reservedCount && newData.fundedAt == data.fundedAt && newData.expiredAt == data.expiredAt",
      delete: "false", // soft-delete via status='cancelled' from the server
    },
  },

  preorders: {
    allow: {
      // supporters can see their own preorders; designers can see preorders on their drops
      view:
        "auth.id == data.supporter.user || auth.id == data.drop.designer.user",
      // preorders are created from the server (after Stripe authorization succeeds).
      // No client creates allowed.
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  follows: {
    allow: {
      // Follows are public so we can show follower counts and a "people you
      // follow" view. Anyone can create a follow linking themselves to a
      // designer; only the follower can delete their own follow.
      view: "true",
      create:
        "auth.id != null && newData.follower == auth.id && newData.designer != auth.id",
      update: "false",
      delete: "auth.id == data.follower",
    },
  },

  shipments: {
    allow: {
      // Visible to the supporter who'll receive the parcel and the designer
      // who made it. Created and updated server-side only.
      view:
        "auth.id == data.preorder.supporter.user || auth.id == data.preorder.drop.designer.user",
      create: "false",
      update: "false",
      delete: "false",
    },
  },

  journalEntries: {
    allow: {
      // Designers manage their own entries. Published entries are public;
      // unpublished drafts are owner-only.
      view: "data.published == true || auth.id == data.designer.user",
      create:
        "auth.id != null && newData.designer == auth.id",
      update: "auth.id == data.designer.user",
      delete: "auth.id == data.designer.user",
    },
  },
} satisfies InstantRules;

export default rules;
