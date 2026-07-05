// src/app/_lib/db-admin.ts
//
// Server-only InstantDB admin client. This bypasses the rules in
// instant.perms.ts and should ONLY be imported from API routes / server
// actions. Importing this into a client component will leak the admin
// token to the browser.
//
// Use this for:
//   - creating preorders after Stripe authorizes a card
//   - flipping drop.status (live -> funded / expired) from the cron
//   - admin approval queue mutations

import { init } from "@instantdb/admin";
import schema from "../../../instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID || !ADMIN_TOKEN) {
  // Hard error on the server is fine — the API route would 500 anyway.
  throw new Error(
    "Missing InstantDB env vars: NEXT_PUBLIC_INSTANT_APP_ID and INSTANT_ADMIN_TOKEN must be set."
  );
}

export const adminDb = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
  schema,
});
