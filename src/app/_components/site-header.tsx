"use client";

// src/app/_components/site-header.tsx

import Link from "next/link";
import { db } from "../_lib/db";

export function SiteHeader() {
  const { isLoading, user } = db.useAuth();

  return (
    <header className="border-b border-[var(--th-rule)]">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 h-[72px] flex items-center justify-between">
        <Link
          href="/"
          className="font-display text-[26px] tracking-tight text-[var(--th-ink)]"
        >
          The Makers Archive
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-utility text-[12.5px] uppercase tracking-[0.12em]">
          <Link href="/" className="hover:text-[var(--th-oxblood)]">
            Archive
          </Link>
          <Link href="/studios" className="hover:text-[var(--th-oxblood)]">
            Designers
          </Link>
          <Link href="/about" className="hover:text-[var(--th-oxblood)]">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-4 font-utility text-[12.5px] uppercase tracking-[0.06em]">
          {isLoading ? null : user ? (
            <>
              <Link
                href="/studio"
                className="hidden sm:inline hover:text-[var(--th-oxblood)]"
              >
                Studio
              </Link>
              <Link
                href="/account"
                className="hover:text-[var(--th-oxblood)]"
              >
                Account
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline hover:text-[var(--th-oxblood)]"
              >
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary">
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
