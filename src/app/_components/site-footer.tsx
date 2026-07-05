// src/app/_components/site-footer.tsx

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--th-rule)] mt-24">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="font-display text-[20px] mb-3">The Makers Archive</div>
          <p className="font-body text-[15px] text-[var(--th-ink-soft)] max-w-[260px] leading-[1.5]">
            An archive of pieces that exist only because enough people wanted
            them to.
          </p>
        </div>

        <div>
          <div className="eyebrow mb-3">Browse</div>
          <ul className="space-y-2 font-utility text-[13px]">
            <li><Link href="/" className="hover:text-[var(--th-oxblood)]">The archive</Link></li>
            <li><Link href="/studios" className="hover:text-[var(--th-oxblood)]">Designers</Link></li>
            <li><Link href="/about" className="hover:text-[var(--th-oxblood)]">How it works</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-3">For designers</div>
          <ul className="space-y-2 font-utility text-[13px]">
            <li><Link href="/studio/onboarding" className="hover:text-[var(--th-oxblood)]">Submit a design</Link></li>
            <li><Link href="/about#designers" className="hover:text-[var(--th-oxblood)]">Designer guide</Link></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-3">Legal</div>
          <ul className="space-y-2 font-utility text-[13px]">
            <li><Link href="/legal/terms" className="hover:text-[var(--th-oxblood)]">Terms</Link></li>
            <li><Link href="/legal/privacy" className="hover:text-[var(--th-oxblood)]">Privacy</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--th-rule)]">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-5 flex items-center justify-between font-utility text-[11px] uppercase tracking-[0.1em] text-[var(--th-ink-muted)]">
          <span>© {new Date().getFullYear()} The Makers Archive</span>
          <span>Made deliberately</span>
        </div>
      </div>
    </footer>
  );
}
