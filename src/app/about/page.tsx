// src/app/about/page.tsx

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[760px] px-6 py-16 lg:py-20">
      <span className="eyebrow">About</span>
      <h1 className="font-display text-[56px] leading-[1.02] mt-3 mb-8">
        Clothes that<br />only exist if you<br />call for them.
      </h1>

      <p className="font-body text-[21px] text-[var(--th-ink-soft)] leading-[1.55] mb-10">
        The Makers Archive is an archive of pieces in waiting. Independent designers
        post the work; supporters pledge. If a piece reaches its goal, we
        make it. If it doesn’t, no one is charged and no fabric is cut.
        The model is older than fast fashion. We’re just bringing it back.
      </p>

      <hr className="hr-hair mb-10" />

      <Section
        n="01"
        title="A designer logs the piece"
        body="They post photos, set a price, decide how many pledges they need before production makes sense, and tell the story behind the work."
      />
      <Section
        n="02"
        title="Supporters pledge"
        body="If you want the piece, you place a pledge. Your card is held — never charged — until the goal is met. If it isn’t reached by the deadline, the hold is released automatically."
      />
      <Section
        n="03"
        title="The piece is made"
        body="Once enough pledges are in, we work with the designer to produce and ship. You get the piece eight to sixteen weeks later, with a clear timeline you can watch in your account."
      />

      <hr className="hr-hair my-10" />

      <div id="designers">
        <span className="eyebrow">For designers</span>
        <h2 className="font-display text-[34px] mt-2 mb-5">
          Make what gets asked for.
        </h2>
        <p className="font-body text-[19px] text-[var(--th-ink-soft)] leading-[1.55] mb-7">
          You bring the work and the story. We handle payments,
          manufacturing coordination, and shipping. You take home the bulk
          of every pledge — we earn a single, transparent commission only
          when a drop actually funds.
        </p>
        <Link href="/studio/onboarding" className="btn-primary">
          Apply to list
        </Link>
      </div>
    </div>
  );
}

function Section({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="grid grid-cols-[60px_1fr] gap-6 mb-9">
      <div className="font-display text-[40px] text-[var(--th-oxblood)] leading-none">
        {n}
      </div>
      <div>
        <h3 className="font-display text-[26px] mb-2">{title}</h3>
        <p className="font-body text-[18px] text-[var(--th-ink-soft)] leading-[1.55]">
          {body}
        </p>
      </div>
    </div>
  );
}
