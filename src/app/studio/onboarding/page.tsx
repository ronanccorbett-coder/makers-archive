// src/app/studio/onboarding/page.tsx

import Link from "next/link";

export default function OnboardingPage() {
  return (
    <div className="mx-auto max-w-[680px] px-6 py-16 lg:py-20">
      <span className="eyebrow">For designers</span>
      <h1 className="font-display text-[44px] leading-tight mt-3 mb-5">
        Submit a design.
      </h1>
      <p className="font-body text-[19px] text-[var(--th-ink-soft)] leading-[1.55] mb-10">
        Threadhaus is currently invite-curated. Apply with a few work samples
        and we’ll be in touch within a week. If you’ve already been
        approved, head straight to your studio.
      </p>

      <div className="card-paper p-7 mb-8">
        <h3 className="font-display text-[22px] mb-2">
          What we’re looking for
        </h3>
        <ul className="font-body text-[17px] text-[var(--th-ink-soft)] leading-[1.55] list-none space-y-2">
          <li>— A clear point of view in the work</li>
          <li>— A realistic sense of what one piece costs to make</li>
          <li>— Willingness to share the story behind each drop</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-4">
        <a
          href="mailto:designers@threadhaus.com?subject=Application"
          className="btn-primary"
        >
          Email an application
        </a>
        <Link href="/studio" className="btn-ghost">
          I’m already approved →
        </Link>
      </div>
    </div>
  );
}
