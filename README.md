# The Makers Archive

A demand-validated fashion marketplace. Designers list pieces, supporters pledge, production only proceeds when a piece hits its funding goal. Built on Next.js (App Router), InstantDB, Stripe, and Vercel.

---

## What's in this MVP

| Surface | What works | What's stubbed |
|---|---|---|
| Public archive feed (`/`) | Live drops from InstantDB, mock fallback when empty | — |
| Drop detail (`/drops/[slug]`) | Story, photos, live progress, pledge UX | Stripe confirmation step |
| Designer studio (`/studio`) | Profile dashboard, list owned drops | Edit-in-place is a placeholder |
| New drop (`/studio/drops/new`) | Full submission form → pending_review | Direct photo upload |
| Admin queue (`/admin`) | View pending drops, approve/reject | — |
| Auth (`/login`, `/signup`) | InstantDB magic-link, profile creation | — |
| Account (`/account`) | Pledge history, sign out | — |
| `POST /api/preorders/create` | Auth + DB write + reservedCount increment | Stripe PaymentIntent call (clearly marked `TODO`) |
| `GET  /api/cron/check-thresholds` | Funds drops at goal, expires past deadline | Stripe capture/cancel calls |
| `POST /api/stripe/webhook` | Returns 200 | Signature verification + event handling |

The Stripe pieces are deliberately scaffolded but not wired. They depend on a Stripe test account and live env vars that need to be set up in your real Vercel project — see "Finishing the integration" below.

---

## Stack

- **Next.js 16 / React 19** (App Router, server routes)
- **InstantDB** for the database — schema-first, reactive, with built-in auth
- **Stripe** for payments (authorize-then-capture pattern)
- **Tailwind 4** + custom CSS tokens for the Atelier Ledger design system
- **Vercel** for hosting + cron jobs

---

## Local setup

1. Install dependencies:
   ```sh
   npm install
   ```
   (or `pnpm install` / `yarn`).

2. Create an InstantDB app at https://www.instantdb.com. Copy the App ID and Admin Token.

3. Create a Stripe test account at https://dashboard.stripe.com. Copy your test secret key.

4. Generate a cron secret:
   ```sh
   openssl rand -hex 32
   ```

5. Copy `.env.example` to `.env.local` and fill in the values.

6. Push the schema and permissions to InstantDB:
   ```sh
   npx instant-cli@latest push schema
   npx instant-cli@latest push perms
   ```

7. Run the dev server:
   ```sh
   npm run dev
   ```

   The site is at http://localhost:3000.

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import the repo in Vercel. The framework auto-detects.
3. Add all environment variables from `.env.example` in the Vercel project settings.
4. Deploy. Vercel reads `vercel.json` automatically and provisions the threshold-check cron (every 15 minutes by default).

---

## Finishing the Stripe integration

Three concrete steps remain before real money can move:

1. **Install the Stripe SDK** (already in `package.json`):
   ```sh
   npm install stripe @stripe/stripe-js @stripe/react-stripe-js
   ```

2. **Wire `/api/preorders/create`** to actually create PaymentIntents. The code has a `TODO` block marking the exact spot. The pattern is:
   ```ts
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
   const intent = await stripe.paymentIntents.create({
     amount: drop.priceCents,
     currency: drop.currency.toLowerCase(),
     capture_method: "manual", // critical — authorize only
     metadata: { dropId: drop.id, supporterId: profile.id },
   });
   ```
   Return `intent.client_secret` to the browser; use Stripe Elements in `preorder-button.tsx` to confirm the card.

3. **Wire `/api/cron/check-thresholds`** to capture funded preorders and cancel expired ones — the `TODO` blocks show exactly which Stripe calls go where.

4. **Configure the webhook endpoint** in the Stripe dashboard pointing at `/api/stripe/webhook`, and copy the signing secret into `STRIPE_WEBHOOK_SECRET`.

After those four steps, the group-buy mechanic is real.

---

## Security model

InstantDB rules (in `instant.perms.ts`) lock down what the browser can do:

- Profiles are publicly readable but users can only edit their own.
- Drops are publicly readable (except drafts, which are owner-only).
- Designers can create drafts and edit them, but they CANNOT change `status`, `reservedCount`, `fundedAt`, or `expiredAt` — those are server-only fields.
- Preorders are entirely server-managed; the browser cannot create, edit, or delete them.

Anything privileged (creating preorders, flipping drop status, admin approvals) flows through API routes that use the admin SDK and verify the caller's session.

---

## File map

```
src/app/
  page.tsx                 — home / archive feed
  layout.tsx               — fonts + shell
  globals.css              — Atelier Ledger design tokens
  _components/             — shared UI (header, footer, drop card)
  _lib/                    — db client, db-admin, formatters, mock data
  drops/[slug]/            — drop detail + preorder modal
  studios/                 — designer index + profile pages
  studio/                  — designer dashboard + new-drop form
  admin/                   — approval queue
  login/ signup/ account/  — auth + account pages
  about/                   — public how-it-works page
  api/
    preorders/create/      — auth + create authorization hold
    cron/check-thresholds/ — runs every 15 min via Vercel Cron
    stripe/webhook/        — Stripe events callback (stub)
    admin/drops/[id]/review/ — approve / reject pending drop

instant.schema.ts          — InstantDB entity + link definitions
instant.perms.ts           — Client permission rules
vercel.json                — Cron schedule
```

---

## Known limitations

- No direct photo upload yet (designers paste image URLs). Add Vercel Blob, Cloudinary, or Uploadthing in phase 2.
- No email transactional flow yet (drop-funded, drop-expired, shipped notifications). Add Resend or Postmark.
- Search and filters are deferred — fine while there are <20 live drops at a time.
- No social/share affordances yet.
