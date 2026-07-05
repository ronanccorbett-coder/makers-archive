"use client";

// src/app/studio/profile/page.tsx
//
// Profile editor. Designers can update their studio name, location, bio,
// avatar, and (for non-designers) toggle into designer mode.

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { tx } from "@instantdb/react";
import { db } from "../../_lib/db";

export default function ProfileEditorPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = db.useAuth();
  const { data, isLoading } = db.useQuery(
    user ? { profiles: { $: { where: { user: user.id } } } } : null
  );

  const profile = data?.profiles?.[0];

  const [displayName, setDisplayName] = useState("");
  const [studioName, setStudioName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile && !hydrated) {
      setDisplayName(profile.displayName ?? "");
      setStudioName(profile.studioName ?? "");
      setLocation(profile.location ?? "");
      setBio(profile.bio ?? "");
      setHydrated(true);
    }
  }, [profile, hydrated]);

  if (authLoading || isLoading) {
    return <p className="mx-auto max-w-[680px] px-6 py-20 font-body italic">Loading…</p>;
  }
  if (!user) {
    return (
      <div className="mx-auto max-w-[440px] px-6 py-20">
        <h1 className="font-display text-[34px] mb-3">Sign in first.</h1>
        <Link href="/login" className="btn-primary">Sign in</Link>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="mx-auto max-w-[440px] px-6 py-20">
        <h1 className="font-display text-[34px] mb-3">No profile yet.</h1>
        <Link href="/signup" className="btn-primary">Create one</Link>
      </div>
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      await db.transact(
        tx.profiles[profile.id].update({
          displayName,
          studioName,
          location,
          bio,
        })
      );
      setSaved(true);
      setTimeout(() => router.push("/studio"), 600);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-16">
      <Link
        href="/studio"
        className="font-utility text-[11px] uppercase tracking-[0.12em] text-[var(--th-ink-soft)] hover:text-[var(--th-oxblood)]"
      >
        ← Studio
      </Link>
      <span className="eyebrow mt-6 block">Profile</span>
      <h1 className="font-display text-[40px] leading-tight mt-2 mb-9">
        Edit your studio details.
      </h1>

      <form onSubmit={save} className="flex flex-col gap-5">
        <label className="block">
          <span className="field-label">Display name</span>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="field-input"
          />
        </label>
        {profile.isDesigner && (
          <label className="block">
            <span className="field-label">Studio name</span>
            <input
              type="text"
              value={studioName}
              onChange={(e) => setStudioName(e.target.value)}
              className="field-input"
              placeholder="The name on the label"
            />
          </label>
        )}
        <label className="block">
          <span className="field-label">Location</span>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="field-input"
            placeholder="City, country"
          />
        </label>
        <label className="block">
          <span className="field-label">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            className="field-textarea"
            placeholder="A few sentences about what you make and why."
          />
        </label>

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
          {saved ? "Saved ✓" : busy ? "Saving…" : "Save changes"}
        </button>
        <Link
          href={`/studios/${profile.handle}`}
          className="btn-ghost self-start"
        >
          View your public page →
        </Link>
      </form>
    </div>
  );
}
