"use client";

// src/app/signup/page.tsx
//
// Same magic-link flow as login but with an extra step to create a profile
// (display name, handle, isDesigner flag) after the first sign-in succeeds.

import { useState } from "react";
import Link from "next/link";
import { db } from "../_lib/db";
import { id, tx } from "@instantdb/react";

type Stage = "email" | "code" | "profile" | "done";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [isDesigner, setIsDesigner] = useState(false);
  const [stage, setStage] = useState<Stage>("email");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { user } = db.useAuth();

  async function sendCode() {
    setBusy(true);
    setError(null);
    try {
      await db.auth.sendMagicCode({ email });
      setStage("code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send code.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode() {
    setBusy(true);
    setError(null);
    try {
      await db.auth.signInWithMagicCode({ email, code });
      setStage("profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Code didn't work.");
    } finally {
      setBusy(false);
    }
  }

  async function createProfile() {
    if (!user) {
      setError("Lost the session. Try again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const profileId = id();
      await db.transact(
        tx.profiles[profileId]
          .update({
            displayName,
            handle: handle.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            isDesigner,
            isAdmin: false,
            createdAt: new Date().toISOString(),
          })
          .link({ user: user.id })
      );
      setStage("done");
      window.location.href = isDesigner ? "/studio" : "/";
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not create profile. Try a different handle."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[440px] px-6 py-20">
      <span className="eyebrow">Join Threadhaus</span>
      <h1 className="font-display text-[40px] leading-tight mt-2 mb-4">
        {stage === "profile" ? "One last thing." : "Begin your record."}
      </h1>
      <p className="font-body text-[17px] text-[var(--th-ink-soft)] mb-9 leading-[1.5]">
        {stage === "profile"
          ? "Tell us how you want to appear in the ledger."
          : "We’ll send a six-digit code to your email. No password to remember."}
      </p>

      <div className="flex flex-col gap-4">
        {stage !== "profile" && (
          <label className="block">
            <span className="field-label">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={stage === "code"}
              required
              className="field-input"
            />
          </label>
        )}

        {stage === "code" && (
          <label className="block">
            <span className="field-label">Six-digit code</span>
            <input
              type="text"
              value={code}
              inputMode="numeric"
              onChange={(e) => setCode(e.target.value)}
              required
              className="field-input"
              autoFocus
            />
          </label>
        )}

        {stage === "profile" && (
          <>
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
            <label className="block">
              <span className="field-label">Handle</span>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="your-name"
                required
                className="field-input"
              />
              <span className="font-body italic text-[14px] text-[var(--th-ink-muted)] mt-1 block">
                Your page will be at threadhaus.com/studios/{handle || "your-name"}
              </span>
            </label>
            <label className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                checked={isDesigner}
                onChange={(e) => setIsDesigner(e.target.checked)}
              />
              <span className="font-body text-[16px] text-[var(--th-ink)]">
                I’m a designer — I want to list pieces
              </span>
            </label>
          </>
        )}

        {error && (
          <p className="font-body italic text-[var(--th-oxblood)] text-[15px]">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={
            stage === "email"
              ? sendCode
              : stage === "code"
              ? verifyCode
              : createProfile
          }
          disabled={busy}
          className="btn-primary btn-block mt-2"
        >
          {busy
            ? "Just a moment…"
            : stage === "email"
            ? "Send code"
            : stage === "code"
            ? "Verify code"
            : "Create profile"}
        </button>

        <p className="font-body text-[15px] text-[var(--th-ink-soft)] mt-6 text-center">
          Already on Threadhaus?{" "}
          <Link href="/login" className="text-[var(--th-oxblood)] underline underline-offset-2">
            Sign in
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
