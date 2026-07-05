"use client";

// src/app/studios/page.tsx

import Link from "next/link";
import { db } from "../_lib/db";

export default function StudiosIndexPage() {
  const { data, isLoading } = db.useQuery({
    profiles: {
      $: {
        where: { isDesigner: true },
        order: { serverCreatedAt: "desc" },
        limit: 24,
      },
      drops: {},
    },
  });

  const studios = data?.profiles ?? [];

  return (
    <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-16">
      <span className="eyebrow">Index</span>
      <h1 className="font-display text-[48px] leading-tight mt-2 mb-3">
        The designers.
      </h1>
      <p className="font-body text-[19px] text-[var(--th-ink-soft)] mb-12 max-w-[640px] leading-[1.5]">
        Every name here was invited. Each runs their own studio and ships
        what they sell.
      </p>

      {isLoading ? (
        <p className="font-body italic text-[var(--th-ink-soft)]">Loading…</p>
      ) : studios.length === 0 ? (
        <p className="font-body italic text-[var(--th-ink-soft)]">
          The index is still being assembled.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-12">
          {studios.map((p) => (
            <Link
              key={p.id}
              href={`/studios/${p.handle}`}
              className="block group"
            >
              <div className="aspect-[4/3] swatch-placeholder mb-4 overflow-hidden" />
              <h3 className="font-display text-[22px] group-hover:text-[var(--th-oxblood)]">
                {p.studioName || p.displayName}
              </h3>
              {p.location && (
                <p className="font-body italic text-[15px] text-[var(--th-ink-soft)]">
                  {p.location}
                </p>
              )}
              <p className="font-utility text-[11px] uppercase tracking-[0.1em] text-[var(--th-ink-muted)] mt-2">
                {(p.drops?.length ?? 0)} drops
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
