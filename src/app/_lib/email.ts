// src/app/_lib/email.ts
//
// Centralized transactional email. Uses Resend (https://resend.com) — a
// good fit for Vercel and has a generous free tier. Set RESEND_API_KEY
// to enable real sending; without it, this module logs the email to the
// server console which is useful for development.
//
// All templates are plain text + minimal HTML to match the Atelier Ledger
// aesthetic: serif type, a single hairline rule, no logos or buttons that
// look like marketing email. Each helper returns void; failures are logged
// but don't throw, because email failure should never block the main
// transaction (e.g. a successful preorder).

type SendArgs = {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
};

const FROM = process.env.EMAIL_FROM || "Threadhaus <ledger@threadhaus.com>";

export async function sendEmail(args: SendArgs): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // eslint-disable-next-line no-console
    console.log(
      "[email:stub]",
      JSON.stringify({ to: args.to, subject: args.subject }, null, 2)
    );
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: args.to,
        subject: args.subject,
        html: args.html,
        text: args.text,
        reply_to: args.replyTo,
      }),
    });
    if (!res.ok) {
      // eslint-disable-next-line no-console
      console.error("[email:fail]", res.status, await res.text());
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[email:err]", err);
  }
}

// ---- Template helpers --------------------------------------------------

const wrap = (body: string) => `
<div style="font-family: Georgia, 'Cormorant', serif; color: #211D17; background: #F4F0E6; padding: 32px; max-width: 540px; margin: 0 auto;">
  <div style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #8C2F25;">THREADHAUS</div>
  <hr style="border: none; border-top: 1px solid #DAD2C0; margin: 16px 0 24px;" />
  <div style="font-size: 18px; line-height: 1.5;">${body}</div>
</div>`;

export function pledgeReceivedEmail(opts: {
  to: string;
  dropTitle: string;
  designerName: string;
  amountFormatted: string;
  dropUrl: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Pledge recorded — ${opts.dropTitle}`,
    text: `Your pledge for "${opts.dropTitle}" by ${opts.designerName} is on the ledger. Your card is held but not charged. We'll only take payment if the piece reaches its goal. ${opts.dropUrl}`,
    html: wrap(`
      <p>Your pledge is on the ledger.</p>
      <p><em>${opts.dropTitle}</em> by ${opts.designerName}, ${opts.amountFormatted}.</p>
      <p>Your card is held but not charged. We'll only take payment if the piece reaches its goal. If it doesn't, the hold is released automatically.</p>
      <p><a href="${opts.dropUrl}" style="color:#8C2F25;">View the drop →</a></p>
    `),
  });
}

export function dropFundedEmailToSupporter(opts: {
  to: string;
  dropTitle: string;
  designerName: string;
  amountFormatted: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Funded — ${opts.dropTitle} is being made`,
    text: `Good news. ${opts.dropTitle} by ${opts.designerName} reached its goal. Your card was charged ${opts.amountFormatted}. Production now begins; we'll be in touch with timing.`,
    html: wrap(`
      <p>Good news.</p>
      <p><em>${opts.dropTitle}</em> by ${opts.designerName} reached its goal. Your card has been charged ${opts.amountFormatted}.</p>
      <p>Production now begins. Most pieces ship within 8–16 weeks; we'll keep you posted at each step.</p>
    `),
  });
}

export function dropFundedEmailToDesigner(opts: {
  to: string;
  dropTitle: string;
  count: number;
  totalFormatted: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Your drop just funded — ${opts.dropTitle}`,
    text: `${opts.dropTitle} reached its goal. ${opts.count} pledges in, ${opts.totalFormatted} captured. We'll be in touch about production scheduling shortly.`,
    html: wrap(`
      <p>It funded.</p>
      <p><em>${opts.dropTitle}</em> closed at ${opts.count} pledges, ${opts.totalFormatted}.</p>
      <p>We'll reach out within a day or two to confirm production scheduling. In the meantime, post a thank-you to your supporters from your studio dashboard — it goes a long way.</p>
    `),
  });
}

export function dropExpiredEmail(opts: {
  to: string;
  dropTitle: string;
  designerName: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `Pledge released — ${opts.dropTitle}`,
    text: `${opts.dropTitle} by ${opts.designerName} didn't reach its goal in time. Your card was never charged and the hold has been released. Thanks for backing it.`,
    html: wrap(`
      <p><em>${opts.dropTitle}</em> by ${opts.designerName} didn't reach its goal in time.</p>
      <p>Your card was never charged, and the hold has been released. Thank you for backing it — that's how this is supposed to work.</p>
    `),
  });
}

export function shippedEmail(opts: {
  to: string;
  dropTitle: string;
  trackingUrl?: string;
  carrier?: string;
}) {
  return sendEmail({
    to: opts.to,
    subject: `On its way — ${opts.dropTitle}`,
    text: `Your ${opts.dropTitle} has shipped${opts.carrier ? ` via ${opts.carrier}` : ""}.${opts.trackingUrl ? ` Track it: ${opts.trackingUrl}` : ""}`,
    html: wrap(`
      <p>Your <em>${opts.dropTitle}</em> has shipped${opts.carrier ? ` via ${opts.carrier}` : ""}.</p>
      ${opts.trackingUrl ? `<p><a href="${opts.trackingUrl}" style="color:#8C2F25;">Track the parcel →</a></p>` : ""}
    `),
  });
}
