"use client";

// src/app/_components/drop-card.tsx
//
// The compact card representation of a drop. Used in the home archive
// feed and on designer profile pages.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pct } from "../_lib/format";

// Touch devices have no hover, so on phones we reveal a card's info the way
// YouTube starts a preview: whichever card is crossing the vertical centre of
// the screen becomes "focused" as you scroll. Pointer devices skip this
// entirely and keep the standard hover reveal.
function useCenterFocus<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined" || !("IntersectionObserver" in window))
      return;
    // Only drive focus from scroll where the device can't hover.
    if (window.matchMedia?.("(hover: hover)").matches) return;

    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      // Shrink the root to a band across the vertical centre of the viewport
      // so only the card(s) you're actually looking at light up.
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return { ref, active };
}

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
  const { ref, active } = useCenterFocus<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      data-active={active ? "true" : "false"}
      href={`/drops/${drop.slug}`}
      className="block group mb-5 break-inside-avoid"
      aria-label={`View ${drop.title} by ${designerLabel}`}
    >
      {/* Everything lives on one image tile now. At rest the card is pure
          photo with a thin ledger bar seated along the bottom; the title,
          designer and Reserve pill rise on hover. Natural height keeps the
          masonry packing, and we keep the paper border + soft rounding of the
          atelier system rather than a flat Pinterest tile. */}
      <div className="relative overflow-hidden rounded-xl border border-[var(--th-rule)] bg-[var(--th-paper-card)] transition-shadow duration-300 group-hover:shadow-[0_14px_34px_-14px_rgba(33,29,23,0.45)] group-data-[active=true]:shadow-[0_14px_34px_-14px_rgba(33,29,23,0.45)]">
        {drop.coverImageUrl ? (
          // Plain img tag is fine for the MVP - we'll move to next/image when
          // we have real photo storage with known dimensions.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={drop.coverImageUrl}
            alt={drop.title}
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.03] group-data-[active=true]:scale-[1.03]"
          />
        ) : (
          <div className="swatch-placeholder w-full aspect-[3/4]" />
        )}

        {/* Scrim that deepens on hover so the overlaid text stays legible.
            A faint permanent foot keeps the ledger bar readable at rest. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[var(--th-ink)]/35 via-transparent to-transparent group-hover:from-[var(--th-ink)]/85 group-hover:via-[var(--th-ink)]/15 group-data-[active=true]:from-[var(--th-ink)]/85 group-data-[active=true]:via-[var(--th-ink)]/15 transition-colors duration-300" />

        {/* Save/reserve affordance — the signature hover interaction. It's a
            visual pill (not a nested button) so the whole card stays one link. */}
        <span className="save-pill absolute top-3 right-3 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-data-[active=true]:opacity-100 group-data-[active=true]:translate-y-0 transition-all duration-200">
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

        {/* Bottom block. Title/designer are hidden until hover; the ledger bar
            is always visible as the at-rest signal (no number). */}
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <div className="mb-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-data-[active=true]:opacity-100 group-data-[active=true]:translate-y-0 transition-all duration-300">
            {drop.refNumber && (
              <span
                className="eyebrow"
                style={{ color: "rgba(244,240,230,0.7)" }}
              >
                No. {drop.refNumber}
              </span>
            )}
            <h3 className="font-display text-[20px] leading-tight text-[var(--th-paper)]">
              {drop.title}
            </h3>
            <span className="font-body italic text-[14px] text-[var(--th-paper)]/80">
              {designerLabel}
            </span>
          </div>
          <div className="ledger-track">
            <div className="ledger-fill" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </Link>
  );
}
