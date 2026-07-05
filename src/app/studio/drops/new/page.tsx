"use client";

// src/app/studio/drops/new/page.tsx
//
// The single most important designer-facing screen. Lets a designer create
// a drop in draft state and submit it for admin review.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../_lib/db";
import { id, tx } from "@instantdb/react";
import { ImageUploader } from "../../../_components/image-uploader";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewDropPage() {
  const router = useRouter();
  const { user } = db.useAuth();
  const { data } = db.useQuery(
    user ? { profiles: { $: { where: { user: user.id } } } } : null
  );
  const profile = data?.profiles?.[0];

  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [goal, setGoal] = useState("50");
  const [deadlineDays, setDeadlineDays] = useState("21");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submitForReview(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) {
      setError("Sign in as a designer first.");
      return;
    }
    if (images.length === 0) {
      setError("Add at least one photo.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const priceCents = Math.round(parseFloat(price) * 100);
      const goalCount = parseInt(goal, 10);
      const deadline = new Date(
        Date.now() + parseInt(deadlineDays, 10) * 24 * 60 * 60 * 1000
      ).toISOString();
      const dropId = id();
      const slug = `${slugify(title)}-${dropId.slice(0, 6)}`;

      await db.transact(
        tx.drops[dropId]
          .update({
            slug,
            title,
            story,
            priceCents,
            currency,
            goalCount,
            reservedCount: 0,
            deadline,
            status: "pending_review",
            imageUrls: images,
            coverImageUrl: images[0],
            createdAt: new Date().toISOString(),
          })
          .link({ designer: profile.id })
      );
      router.push("/studio");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not submit. Try again."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-12 lg:py-16">
      <span className="eyebrow">Studio · New drop</span>
      <h1 className="font-display text-[40px] leading-tight mt-2 mb-3">
        Tell us about the piece.
      </h1>
      <p className="font-body text-[17px] text-[var(--th-ink-soft)] mb-9 leading-[1.5]">
        A drop is one piece you’re taking pledges on. Be specific about how
        many you’ll make and how long supporters have to pledge — the story
        matters as much as the photo.
      </p>

      <form onSubmit={submitForReview} className="flex flex-col gap-6">
        <label className="block">
          <span className="field-label">Title of the piece</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bias-Cut Slip, Raw Silk"
            required
            className="field-input"
          />
        </label>

        <label className="block">
          <span className="field-label">The story</span>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            rows={6}
            placeholder="Where did the fabric come from? Why this piece, why now? Anything that makes the work worth supporting."
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
              inputMode="decimal"
              step="0.01"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="field-input"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="NZD">NZD</option>
              <option value="AUD">AUD</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="field-label">Minimum pledges to fund</span>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              required
              className="field-input"
            />
          </label>
          <label className="block">
            <span className="field-label">Pledge window (days)</span>
            <input
              type="number"
              inputMode="numeric"
              min="3"
              max="60"
              value={deadlineDays}
              onChange={(e) => setDeadlineDays(e.target.value)}
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

        <button
          type="submit"
          disabled={busy}
          className="btn-primary btn-block mt-2"
        >
          {busy ? "Submitting…" : "Submit for review"}
        </button>
        <p className="font-body italic text-[14px] text-[var(--th-ink-muted)] text-center">
          We review every drop within a day or two before it goes live.
        </p>
      </form>
    </div>
  );
}
