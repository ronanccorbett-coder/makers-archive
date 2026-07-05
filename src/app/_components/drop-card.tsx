"use client";

// src/app/_components/drop-card.tsx
//
// The compact card representation of a drop. Used in the home archive
// feed and on designer profile pages.

import Link from "next/link";
import { pct } from "../_lib/format";

type Designer = {
  handle?: string;
  studioName?: string;
  displayName?: string;
};

export type DropCardData = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  reservedCount: number;
  goalCount: number;
  status: string;
  designer?: Designer;
  // Reference number — derive from slug or a real `no` field later
  refNumber?: string;
};

export function DropCard({ drop }: { drop: DropCardData }) {
  const percent = pct(drop.reservedCount, drop.goalCount);
  const designerLabel =
    drop.designer?.studioName ||
    drop.designer?.displayName ||
    "Independent designer";

  return (
    <Link
      href={`/drops/${drop.slug}`}
      className="block group mb-5 break-inside-avoid"
      aria-label={`View ${drop.title} by ${designerLabel}`}
    >
      {/* Image-first card. Natural height so the feed packs like a masonry
          board, but we keep the paper border + soft rounding of the atelier
          system rather than a flat Pinterest tile. */}
      <div className="mb-3 overflow-hidden relative rounded-xl border border-[var(--th-rule)] bg-[var(--th-paper-card)] transition-shadow duration-300 group-hover:shadow-[0_14px_34px_-14px_rgba(33,29,23,0.45)]">
        {drop.coverImageUrl ? (
          // Plain img tag is fine for the MVP - we'll move to next/image when
          // we have real photo storage with known dimensions.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={drop.coverImageUrl}
            alt={drop.title}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="swatch-placeholder w-full aspect-[3/4]" />
        )}

        {/* Darken slightly on hover to lift the save pill off the image */}
        <div className="absolute inset-0 bg-[var(--th-ink)]/0 group-hover:bg-[var(--th-ink)]/10 transition-colors duration-300" />

        {/* Save/reserve affordance — the signature hover interaction. It's a
            visual pill (not a nested button) so the whole card stays one link. */}
        <span className="save-pill absolute top-3 right-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
          Reserve
        </span>

        {drop.status === "funded" && (
          <span className="status-pill status-pill--funded absolute top-3 left-3">
            Funded
          </span>
        )}
        {drop.status === "expired" && (
          <span className="status-pill status-pill--expired absolute top-3 left-3">
            Closed
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 px-0.5">
        {drop.refNumber && (
          <span className="eyebrow">No. {drop.refNumber}</span>
        )}
        <h3 className="font-display text-[22px] leading-tight text-[var(--th-ink)] group-hover:text-[var(--th-oxblood)] transition-colors">
          {drop.title}
        </h3>
        <span className="font-body italic text-[15px] text-[var(--th-ink-soft)] mb-2">
          {designerLabel}
        </span>
        <div className="flex items-center gap-3">
          <div className="ledger-track flex-1">
            <div className="ledger-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="font-utility text-[11px] text-[var(--th-oxblood)] font-medium tabular-nums">
            {percent}%
          </span>
        </div>
      </div>
    </Link>
  );
}
