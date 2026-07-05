// instant.schema.ts
//
// The Makers Archive InstantDB schema. This file defines the shape of the database
// and is the single source of truth for entities and their relationships.
// Push changes with: npx instant-cli push schema
//
// Permissions live in a separate file (instant.perms.ts) and MUST be set up
// before going live - by default, InstantDB lets clients read/write anything.

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    // Standard auth entity that InstantDB manages for you.
    $users: i.entity({
      email: i.string().unique().indexed(),
    }),

    // A profile per user. Created on signup. Buyers and designers share the
    // same profile entity; the `isDesigner` flag gates studio-only features.
    profiles: i.entity({
      handle: i.string().unique().indexed(), // url-safe, e.g. "mara-studio"
      displayName: i.string(),
      isDesigner: i.boolean().indexed(),
      isAdmin: i.boolean().indexed(), // for the approval queue
      bio: i.string().optional(),
      studioName: i.string().optional(), // designers only
      location: i.string().optional(),
      avatarUrl: i.string().optional(),
      createdAt: i.date().indexed(),
    }),

    // The core entity: a "drop" is one piece a designer is taking preorders on.
    // Lifecycle: draft -> pending_review -> live -> (funded | expired) -> shipped
    drops: i.entity({
      // identity
      slug: i.string().unique().indexed(), // for the url
      title: i.string(),
      story: i.string(), // the long-form description, the "why"

      // commercial terms
      priceCents: i.number(), // store all money as integer cents
      currency: i.string(), // ISO 4217, e.g. "USD", "NZD"
      goalCount: i.number(), // minimum preorders required to fund
      reservedCount: i.number().indexed(), // running tally of authorized preorders

      // timing
      deadline: i.date().indexed(), // when the campaign closes
      createdAt: i.date().indexed(),
      fundedAt: i.date().optional(),
      expiredAt: i.date().optional(),

      // status: enforced as a string with known values. Indexed because
      // every feed query filters by it.
      // values: "draft" | "pending_review" | "live" | "funded" | "expired" | "shipped" | "cancelled"
      status: i.string().indexed(),

      // media: a list of image urls. For the MVP, designers paste URLs;
      // proper uploads come in phase 2.
      imageUrls: i.json(), // string[]
      coverImageUrl: i.string(),

      // admin
      adminNotes: i.string().optional(),
    }),

    // A preorder is one supporter's commitment on one drop.
    // Created with status="authorized" once Stripe accepts the card.
    // Transitions to "captured" when the drop funds and the charge clears.
    // Transitions to "released" if the drop expires unfunded.
    preorders: i.entity({
      // status: "authorized" | "captured" | "released" | "refunded" | "failed"
      status: i.string().indexed(),

      // money
      amountCents: i.number(),
      currency: i.string(),

      // shipping snapshot (we copy at order time so future address edits
      // don't change historical orders)
      shippingName: i.string(),
      shippingLine1: i.string(),
      shippingLine2: i.string().optional(),
      shippingCity: i.string(),
      shippingRegion: i.string().optional(),
      shippingPostal: i.string(),
      shippingCountry: i.string(), // ISO 3166-1 alpha-2

      // stripe
      stripePaymentIntentId: i.string().indexed().optional(),

      // timing
      createdAt: i.date().indexed(),
      capturedAt: i.date().optional(),
      releasedAt: i.date().optional(),
    }),

    // Follow relationship: a supporter following a designer to get notified
    // about new drops. Modeled as its own entity (not just a link) so we can
    // store createdAt and later add notification preferences.
    follows: i.entity({
      createdAt: i.date().indexed(),
    }),

    // A shipment is one parcel sent to a supporter for one preorder.
    // Created by the platform once a funded drop is produced and packed.
    // status: "preparing" | "shipped" | "delivered" | "returned"
    shipments: i.entity({
      status: i.string().indexed(),
      carrier: i.string().optional(),
      trackingNumber: i.string().optional(),
      trackingUrl: i.string().optional(),
      shippedAt: i.date().optional(),
      deliveredAt: i.date().optional(),
      notes: i.string().optional(),
    }),

    // Design journal entry: posts from a designer between drops. The
    // schema is in for phase 2 — UI follows once we have repeat usage.
    journalEntries: i.entity({
      title: i.string(),
      body: i.string(),
      coverImageUrl: i.string().optional(),
      createdAt: i.date().indexed(),
      published: i.boolean().indexed(),
    }),
  },

  // Links define the graph structure. Each link establishes a directional
  // relationship that can be traversed in queries on either side.
  links: {
    // Every profile belongs to exactly one user (1:1).
    profileUser: {
      forward: { on: "profiles", has: "one", label: "user" },
      reverse: { on: "$users", has: "one", label: "profile" },
    },

    // A drop is owned by one designer profile; a designer has many drops.
    dropDesigner: {
      forward: { on: "drops", has: "one", label: "designer" },
      reverse: { on: "profiles", has: "many", label: "drops" },
    },

    // Preorders connect a supporter profile to a drop.
    preorderDrop: {
      forward: { on: "preorders", has: "one", label: "drop" },
      reverse: { on: "drops", has: "many", label: "preorders" },
    },
    preorderSupporter: {
      forward: { on: "preorders", has: "one", label: "supporter" },
      reverse: { on: "profiles", has: "many", label: "preorders" },
    },

    // Follows form a many-to-many between supporters and designers.
    // We model as an entity (not a direct link) so we can record createdAt
    // and add preferences later.
    followFollower: {
      forward: { on: "follows", has: "one", label: "follower" },
      reverse: { on: "profiles", has: "many", label: "following" },
    },
    followDesigner: {
      forward: { on: "follows", has: "one", label: "designer" },
      reverse: { on: "profiles", has: "many", label: "followers" },
    },

    // Shipments hang off preorders 1:1 — one preorder produces one parcel.
    shipmentPreorder: {
      forward: { on: "shipments", has: "one", label: "preorder" },
      reverse: { on: "preorders", has: "one", label: "shipment" },
    },

    // Journal entries are owned by a designer.
    journalEntryDesigner: {
      forward: { on: "journalEntries", has: "one", label: "designer" },
      reverse: { on: "profiles", has: "many", label: "journalEntries" },
    },
  },
});

// Workaround for TypeScript inference (per InstantDB docs)
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
