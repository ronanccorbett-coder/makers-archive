"use client";

// src/app/page.tsx
//
// The home page is the archive feed. Hero on top, then live drops in a
// three-column grid with search and filters.

import { useState, useMemo } from "react";
import Link from "next/link";
import { db } from "./_lib/db";
import { DropCard, type DropCardData } from "./_components/drop-card";
import { MOCK_DROPS } from "./_lib/mock-data";
import {
  FeedFilters,
  applyFilters,
  type FilterState,
} from "./_components/feed-filters";

export default function HomePage() {
  const [filter, setFilter] = useState<FilterState>({
    q: "",
    status: "all",
    sort: "newest",
  });

  const { isLoading, error, data } = db.useQuery({
    drops: {
      $: {
        where: {
          or: [{ status: "live" }, { status: "funded" }],
        },
        order: { serverCreatedAt: "desc" },
        limit: 36,
      },
      designer: {},
    },
  });

  const { drops, deadlines } = useMemo(() => {
    const hasLive =
      !isLoading && data?.drops && data.drops.length > 0;
    if (!hasLive) {
      return { drops: MOCK_DROPS, deadlines: {} as Record<string, string> };
    }
    const dls: Record<string, string> = {};
    const cards: DropCardData[] = (data!.drops as any[]).map((d) => {
      if (d.deadline) dls[d.id] = d.deadline as string;
      return {
        id: d.id,
        slug: d.slug,
        title: d.title,
        coverImageUrl: d.coverImageUrl,
        reservedCount: d.reservedCount,
        goalCount: d.goalCount,
        status: d.status,
        designer: d.designer
          ? {
              handle: d.designer.handle,
              studioName: d.designer.studioName,
              displayName: d.designer.displayName,
            }
          : undefined,
        refNumber: d.slug.slice(-3),
      };
    });
    return { drops: cards, deadlines: dls };
  }, [isLoading, data]);

  const filtered = useMemo(
    () => applyFilters(drops, filter, deadlines),
    [drops, filter, deadlines]
  );

  return (
    <>
      <Hero />
      <section
        id="archive"
        className="mx-auto max-w-[1280px] px-6 lg:px-12 py-16"
      >
        <div className="flex items-baseline gap-6 mb-10">
          <h2 className="font-display text-[32px] whitespace-nowrap">
            Currently in the ledger
          </h2>
          <div className="hr-hair flex-1" />
        </div>

        <FeedFilters
          value={filter}
          onChange={setFilter}
          total={filtered.length}
        />

        {error && (
          <p className="font-body text-[var(--th-ink-soft)]">
            Something went wrong loading the archive. Try again in a moment.
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="card-paper p-12 text-center">
            <h3 className="font-display text-[26px] mb-2">
              Nothing matches.
            </h3>
            <p className="font-body italic text-[17px] text-[var(--th-ink-soft)]">
              Try a different search, or clear the filters.
            </p>
          </div>
        ) : (
          <div className="columns-2 lg:columns-3 xl:columns-4 [column-gap:1.25rem]">
            {filtered.map((d) => (
              <DropCard key={d.id} drop={d} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-6 lg:px-12 pt-20 pb-12 lg:pt-24 lg:pb-16">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center">
        <div>
          <span className="eyebrow">No. 001 — Concept</span>
          <h1 className="font-display text-[64px] lg:text-[80px] leading-[1.02] mt-4 mb-7">
            Fashion,<br />
            held to{" "}
            <em className="not-italic font-display italic text-[var(--th-oxblood)] font-medium">
              account.
            </em>
          </h1>
          <p className="font-body text-[21px] leading-[1.5] text-[var(--th-ink-soft)] max-w-[480px] mb-9">
            Every piece begins as a record, not a guess. Designers log the
            work; supporters underwrite it; production only proceeds once the
            ledger balances.
          </p>
          <div className="flex flex-wrap items-center gap-5">
            <Link href="#archive" className="btn-primary">
              Browse the archive
            </Link>
            <Link href="/studio/onboarding" className="btn-ghost">
              Submit a design →
            </Link>
          </div>
        </div>

        <div className="card-paper p-6">
          <div className="aspect-[4/5] swatch-placeholder mb-4" />
          <div>
            <span className="eyebrow">Pattern 014</span>
            <h3 className="font-display text-[24px] mt-1.5 mb-1">
              Bias-Cut Slip, Raw Silk
            </h3>
            <p className="font-body italic text-[15px] text-[var(--th-ink-soft)] mb-5">
              M. Okafor Studio
            </p>
            <div className="flex justify-between font-utility text-[11px] uppercase tracking-[0.1em] text-[var(--th-ink-soft)] pt-3 border-t border-[var(--th-rule)] mb-2">
              <span>Pledged</span>
              <span className="text-[var(--th-ink)] font-medium">62 / 80</span>
            </div>
            <div className="ledger-track">
              <div className="ledger-fill" style={{ width: "77%" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
