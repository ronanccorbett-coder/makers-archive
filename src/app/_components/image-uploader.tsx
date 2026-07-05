"use client";

// src/app/_components/image-uploader.tsx
//
// A reusable image picker. Uses InstantDB's storage API (db.storage.uploadFile).
// Each upload returns a public URL we store as a string in the relevant entity.
// We deliberately keep this component dumb — the parent owns the URL list.
//
// To enable, set up storage in your InstantDB dashboard:
//   1. Open your app
//   2. Storage → enable
//   3. Set permissions so uploads require auth.id != null

import { useRef, useState } from "react";
import { db } from "../_lib/db";

export function ImageUploader({
  value,
  onChange,
  max = 4,
  label = "Photos",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (value.length + uploaded.length >= max) break;
        if (!file.type.startsWith("image/")) {
          throw new Error("Only image files.");
        }
        // Files larger than ~8MB make sense to reject up front rather than
        // wait for the upload to time out.
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(`${file.name} is over 8MB.`);
        }

        // InstantDB storage: uploadFile returns a path; we then turn it into
        // a public URL. The path is namespaced by the file's deterministic
        // bucket key.
        const path = `drops/${crypto.randomUUID()}-${file.name}`;
        await db.storage.uploadFile(path, file, {
          contentType: file.type,
        });
        const url = await db.storage.getDownloadUrl(path);
        uploaded.push(url);
      }
      onChange([...value, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function remove(idx: number) {
    onChange(value.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <span className="field-label">{label}</span>
      <div className="grid grid-cols-4 gap-3 mt-1">
        {value.map((url, i) => (
          <div
            key={url}
            className="aspect-[3/4] relative card-paper overflow-hidden group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="absolute top-1 right-1 bg-[var(--th-ink)] text-[var(--th-paper)] w-6 h-6 text-[14px] leading-none opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Remove photo ${i + 1}`}
            >
              ×
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="aspect-[3/4] card-paper flex items-center justify-center text-[var(--th-ink-soft)] hover:text-[var(--th-oxblood)] hover:border-[var(--th-oxblood)] transition-colors"
          >
            {busy ? (
              <span className="font-utility text-[11px] uppercase tracking-[0.1em]">
                Uploading…
              </span>
            ) : (
              <span className="font-display text-[24px]">+</span>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />
      {error && (
        <p className="font-body italic text-[var(--th-oxblood)] text-[14px] mt-2">
          {error}
        </p>
      )}
      <p className="font-body italic text-[13px] text-[var(--th-ink-muted)] mt-2">
        Up to {max} photos · JPG, PNG, or WebP · 8MB each
      </p>
    </div>
  );
}
