// src/app/_lib/db.ts
//
// Single InstantDB client instance for the browser. Import `db` and use
// hooks like db.useQuery / db.useAuth / db.transact in client components.
//
// The app ID is public — it's how InstantDB identifies the database. All
// access control happens through the rules in instant.perms.ts plus the
// admin SDK on the server, never through hiding this id.

import { init } from "@instantdb/react";
import schema from "../../../instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!APP_ID) {
  // Surface this clearly in development. In production this should fail the
  // build via env validation; for now a runtime warning is enough.
  // eslint-disable-next-line no-console
  console.warn(
    "[threadhaus] NEXT_PUBLIC_INSTANT_APP_ID is not set. " +
      "Add it to .env.local — see README.md for setup."
  );
}

export const db = init({
  appId: APP_ID ?? "missing-app-id",
  schema,
});
