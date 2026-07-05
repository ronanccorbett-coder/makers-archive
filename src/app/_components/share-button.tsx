"use client";

// src/app/_components/share-button.tsx
//
// Share a drop link. Uses the Web Share API on mobile when available,
// falls back to copying the URL to the clipboard on desktop.

import { useState } from "react";

export function ShareButton({
  url,
  title,
  text,
}: {
  url: string;
  title: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const absoluteUrl =
      typeof window !== "undefined" && url.startsWith("/")
        ? `${window.location.origin}${url}`
        : url;
    try {
      if (navigator.share && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
        await navigator.share({ url: absoluteUrl, title, text });
        return;
      }
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // user dismissed share sheet — nothing to do
    }
  }

  return (
    <button onClick={share} className="btn-ghost" type="button">
      {copied ? "Copied ✓" : "Share →"}
    </button>
  );
}
