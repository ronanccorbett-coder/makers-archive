"use client";

// src/app/login/page.tsx
//
// Two-step magic-link login. Step 1: enter email -> InstantDB sends a
// 6-digit code. Step 2: paste the code -> session is created.

import { useState } from "react";
import Link from "next/link";
import { db } from "../_lib/db";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Code didn't work.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[440px] px-6 py-20">
      <span className="eyebrow">Sign in</span>
      <h1 className="font-display text-[40px] leading-tight mt-2 mb-4">
        Welcome back.
      </h1>
      <p className="font-body text-[17px] text-[var(--th-ink-soft)] mb-9 leading-[1.5]">
        We’ll send a six-digit code to your email. No password to remember.
      </p>

      <div className="flex flex-col gap-4">
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

        {error && (
          <p className="font-body italic text-[var(--th-oxblood)] text-[15px]">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={stage === "email" ? sendCode : verifyCode}
          disabled={busy}
          className="btn-primary btn-block mt-2"
        >
          {busy
            ? "Just a moment…"
            : stage === "email"
            ? "Send code"
            : "Sign in"}
        </button>

        {stage === "code" && (
          <button
            type="button"
            onClick={() => {
              setStage("email");
              setCode("");
              setError(null);
            }}
            className="btn-ghost self-start mt-1"
          >
            ← Use a different email
          </button>
        )}

        <p className="font-body text-[15px] text-[var(--th-ink-soft)] mt-6 text-center">
          New here?{" "}
          <Link href="/signup" className="text-[var(--th-oxblood)] underline underline-offset-2">
            Create an account
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
