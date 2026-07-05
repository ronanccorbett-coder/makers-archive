"use client";

// src/app/_components/feed-filters.tsx
//
// Controlled filter bar for the archive. Filtering happens client-side
// against the already-loaded drops — at MVP scale (< 50 live drops) that
// is faster and simpler than re-querying. Add server-side filtering once
// the list exceeds a couple hundred entries.

import type { DropCardData } from "./drop-card";

export type FilterState = {
  q: string;
  status: "all" | "live" | "funded" | "almost";
  sort: "newest" | "funding" | "ending";
};

export function FeedFilters({
  value,
  onChange,
  total,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
  total: number;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 mb-10">
      <div className="flex-1 min-w-[240px] max-w-[420px]">
        <label className="block">
          <span className="field-label">Search the archive</span>
          <input
            type="search"
            value={value.q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder="Title or designer"
            className="field-input"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill
          label="All"
          active={value.status === "all"}
          onClick={() => onChange({ ...value, status: "all" })}
        />
        <Pill
          label="Live"
          active={value.status === "live"}
          onClick={() => onChange({ ...value, status: "live" })}
        />
        <Pill
          label="Funded"
          active={value.status === "funded"}
          onClick={() => onChange({ ...value, status: "funded" })}
        />
        <Pill
          label="Almost there"
          active={value.status === "almost"}
          onClick={() => onChange({ ...value, status: "almost" })}
        />
      </div>

      <div>
        <label className="block">
          <span className="field-label">Sort</span>
          <select
            value={value.sort}
            onChange={(e) =>
              onChange({ ...value, sort: e.target.value as FilterState["sort"] })
            }
            className="field-input min-w-[160px]"
          >
            <option value="newest">Newest first</option>
            <option value="funding">Most funded</option>
            <option value="ending">Ending soonest</option>
          </select>
        </label>
      </div>

      <div className="font-utility text-[11px] uppercase tracking-[0.12em] text-[var(--th-ink-muted)] self-end pb-3">
        {total} {total === 1 ? "entry" : "entries"}
      </div>
    </div>
  );
}

function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "font-utility text-[11px] uppercase tracking-[0.1em] px-3 py-1.5 rounded-full border transition-colors " +
        (active
          ? "bg-[var(--th-ink)] text-[var(--th-paper)] border-[var(--th-ink)]"
          : "bg-transparent text-[var(--th-ink-soft)] border-[var(--th-rule)] hover:border-[var(--th-ink)]")
      }
    >
      {label}
    </button>
  );
}

export function applyFilters(
  drops: DropCardData[],
  filter: FilterState,
  deadlines: Record<string, string | undefined> = {}
): DropCardData[] {
  let list = drops;
  if (filter.q.trim()) {
    const q = filter.q.toLowerCase();
    list = list.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.designer?.studioName ?? d.designer?.displayName ?? "")
          .toLowerCase()
          .includes(q)
    );
  }
  if (filter.status === "live") {
    list = list.filter((d) => d.status === "live");
  } else if (filter.status === "funded") {
    list = list.filter((d) => d.status === "funded");
  } else if (filter.status === "almost") {
    list = list.filter(
      (d) =>
        d.status === "live" &&
        d.goalCount > 0 &&
        d.reservedCount / d.goalCount >= 0.75
    );
  }
  if (filter.sort === "funding") {
    list = [...list].sort(
      (a, b) =>
        b.reservedCount / b.goalCount - a.reservedCount / a.goalCount
    );
  } else if (filter.sort === "ending") {
    list = [...list].sort((a, b) => {
      const ad = new Date(deadlines[a.id] ?? 0).getTime();
      const bd = new Date(deadlines[b.id] ?? 0).getTime();
      return ad - bd;
    });
  }
  return list;
}
