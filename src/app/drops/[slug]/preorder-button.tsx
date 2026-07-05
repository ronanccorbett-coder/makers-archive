"use client";

// src/app/drops/[slug]/preorder-button.tsx
//
// The single CTA on the drop detail page. Opens a lightweight modal to
// collect shipping info, then POSTs to /api/preorders/create which:
//   1. Validates the user is authenticated
//   2. Creates a Stripe PaymentIntent with `capture_method: "manual"`
//      (this puts an authorization hold on the card — no money moves yet)
//   3. Uses Stripe Elements to confirm the payment method
//   4. Writes a `preorders` row via the admin SDK with status="authorized"
//   5. Increments `drops.reservedCount`
//
// For the MVP the modal is just a stub — wiring Stripe Elements properly
// is a meaningful chunk of work and belongs in its own follow-up. The
// stub UI demonstrates the flow and shipping fields.

import { useState } from "react";
import { db } from "../../_lib/db";
import { formatMoney } from "../../_lib/format";

export function PreorderButton({
  dropId,
  priceCents,
  currency,
  status,
}: {
  dropId: string;
  priceCents: number;
  currency: string;
  status: string;
}) {
  const { user } = db.useAuth();
  const [open, setOpen] = useState(false);

  if (status === "funded") {
    return (
      <button className="btn-primary btn-block" disabled>
        Funded — production underway
      </button>
    );
  }
  if (status === "expired" || status === "cancelled") {
    return (
      <button className="btn-primary btn-block" disabled>
        This drop is closed
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary btn-block">
        Pledge — {formatMoney(priceCents, currency)}
      </button>

      {open && (
        <PreorderModal
          dropId={dropId}
          priceCents={priceCents}
          currency={currency}
          isAuthed={!!user}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

function PreorderModal({
  dropId,
  priceCents,
  currency,
  isAuthed,
  onClose,
}: {
  dropId: string;
  priceCents: number;
  currency: string;
  isAuthed: boolean;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!isAuthed) {
    return (
      <Backdrop onClose={onClose}>
        <span className="eyebrow">Sign in to pledge</span>
        <h3 className="font-display text-[28px] mt-2 mb-4">
          You need an account to pledge.
        </h3>
        <p className="font-body text-[17px] text-[var(--th-ink-soft)] mb-7 leading-[1.5]">
          Pledging holds your card. We only need an email to set you up.
        </p>
        <a href="/signup" className="btn-primary btn-block">
          Create account
        </a>
        <a
          href="/login"
          className="btn-ghost mt-4 self-start"
          style={{ alignSelf: "flex-start" }}
        >
          Already have one? Sign in →
        </a>
      </Backdrop>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      dropId,
      shipping: {
        name: data.get("name"),
        line1: data.get("line1"),
        line2: data.get("line2") || undefined,
        city: data.get("city"),
        region: data.get("region") || undefined,
        postal: data.get("postal"),
        country: data.get("country"),
      },
    };

    try {
      const res = await fetch("/api/preorders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not place the pledge.");
      }
      // TODO: redirect to Stripe Elements confirmation here. For now we
      // just show success to demonstrate the round trip.
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Backdrop onClose={onClose}>
        <span className="eyebrow">Pledge recorded</span>
        <h3 className="font-display text-[28px] mt-2 mb-4">
          You’re on the list.
        </h3>
        <p className="font-body text-[17px] text-[var(--th-ink-soft)] mb-7 leading-[1.5]">
          We’ve placed a hold on your card. We’ll only charge it if this piece
          reaches its goal — and you’ll get an email either way.
        </p>
        <button onClick={onClose} className="btn-primary btn-block">
          Back to the archive
        </button>
      </Backdrop>
    );
  }

  return (
    <Backdrop onClose={onClose}>
      <span className="eyebrow">Pledge — {formatMoney(priceCents, currency)}</span>
      <h3 className="font-display text-[28px] mt-2 mb-2">
        Where should we send it?
      </h3>
      <p className="font-body text-[16px] text-[var(--th-ink-soft)] mb-6 leading-[1.5]">
        Your card is held now and only charged if the drop funds.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Full name" name="name" required />
        <Field label="Address line 1" name="line1" required />
        <Field label="Address line 2 (optional)" name="line2" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="City" name="city" required />
          <Field label="State / region" name="region" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Postal code" name="postal" required />
          <Field label="Country" name="country" defaultValue="US" required />
        </div>

        {error && (
          <p className="font-body text-[15px] text-[var(--th-oxblood)] italic">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary btn-block mt-2"
          disabled={submitting}
        >
          {submitting ? "Placing pledge…" : "Place pledge"}
        </button>
        <p className="font-body italic text-[13px] text-[var(--th-ink-muted)] text-center">
          Next: card details on Stripe’s secure page
        </p>
      </form>
    </Backdrop>
  );
}

function Backdrop({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[rgba(20,16,10,0.55)]"
      onClick={onClose}
    >
      <div
        className="card-paper w-full sm:max-w-[480px] p-7 sm:rounded-none m-0 sm:m-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          aria-label="Close"
          onClick={onClose}
          className="self-end font-utility text-[18px] text-[var(--th-ink-soft)] hover:text-[var(--th-oxblood)] -mt-2 -mr-2"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="field-input"
      />
    </label>
  );
}
