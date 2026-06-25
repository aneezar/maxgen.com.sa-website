// ---------------------------------------------------------------------------
// Email alerts via Resend (https://resend.com)
//
// Why Resend and not SMTP/Nodemailer: Cloudflare Workers runs on V8 isolates
// with no raw TCP socket support, so traditional SMTP libraries cannot work
// here at all. Resend (and similar providers) send mail over a plain HTTPS
// POST request, which works natively with `fetch()` in any runtime —
// Cloudflare Workers, Vercel, or local Node.
//
// Setup required before this actually sends anything:
//   1. Create a free account at https://resend.com
//   2. Add and verify your sending domain (maxgen.com.sa) in the Resend
//      dashboard — until verified, only their test sender address works.
//   3. Generate an API key in Resend.
//   4. Set it as RESEND_API_KEY:
//        - Local dev:    add to .env.local
//        - Vercel:       Project Settings → Environment Variables
//        - Cloudflare:   wrangler secret put RESEND_API_KEY
//                         (or add it in the Workers Builds "Variables and
//                         secrets" panel if deploying via Git integration)
//
// Until RESEND_API_KEY is set, sendAlertEmail() silently no-ops (logs a
// warning) rather than throwing — a missing/misconfigured email key should
// never prevent a lead, message, or application from being saved.
// ---------------------------------------------------------------------------

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const ALERT_TO = "support@maxgen.com.sa";

// Falls back to Resend's shared test sender, which works without domain
// verification — replace via ALERT_FROM_EMAIL once maxgen.com.sa is verified.
const ALERT_FROM = process.env.ALERT_FROM_EMAIL || "Maxgen Website <onboarding@resend.dev>";

export async function sendAlertEmail({ subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn(`[email] RESEND_API_KEY not set — skipping email alert: "${subject}"`);
    return false;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: ALERT_FROM,
        to: [ALERT_TO],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[email] Resend API error (${res.status}): ${body}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Failed to send alert:", err);
    return false;
  }
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function alertLeadEmail(lead) {
  return sendAlertEmail({
    subject: "New lead captured — Maxgen website",
    html: `
      <h2>New lead captured</h2>
      <p><strong>Email:</strong> ${escapeHtml(lead.email) || "—"}</p>
      <p><strong>Phone:</strong> ${escapeHtml(lead.phone) || "—"}</p>
      <p style="color:#888;font-size:12px;">Captured via the homepage "Stay In The Loop" form.</p>
    `,
  });
}

export function alertMessageEmail(message) {
  return sendAlertEmail({
    subject: `New contact message from ${message.name || "website visitor"}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(message.name)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(message.phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(message.email) || "—"}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message.message).replace(/\n/g, "<br>")}</p>
    `,
    replyTo: message.email || undefined,
  });
}

export function alertApplicationEmail(application) {
  return sendAlertEmail({
    subject: `New job application — ${application.role || "role unspecified"}`,
    html: `
      <h2>New job application</h2>
      <p><strong>Role:</strong> ${escapeHtml(application.role)}</p>
      <p><strong>Name:</strong> ${escapeHtml(application.name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(application.email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(application.phone) || "—"}</p>
    `,
    replyTo: application.email || undefined,
  });
}
