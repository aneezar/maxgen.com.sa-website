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

export async function sendAlertEmail({ subject, html, replyTo, to }) {
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
        to: [to || ALERT_TO],
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

export function notifyCustomerEmail(quote) {
  if (!quote.email) return Promise.resolve(false);

  const itemRows = (quote.items || [])
    .map(
      (i) =>
        `<tr>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;font-family:monospace;font-size:12px;">${escapeHtml(i.id)}</td>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;font-size:13px;">${escapeHtml(i.name)}</td>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;text-align:center;">${i.qty}</td>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;font-family:monospace;">SAR ${Number(i.price).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  return sendAlertEmail({
    to: quote.email,
    subject: `Your Maxgen RFQ ${quote.id} has been quoted`,
    html: `
      <h2 style="color:#d97706;">Your RFQ Has Been Quoted</h2>
      <p>Hi ${escapeHtml(quote.contact_name)},</p>
      <p>Your Request for Quotation <strong style="font-family:monospace;">${escapeHtml(quote.id)}</strong> has been reviewed and a formal quotation is ready.</p>
      ${quote.admin_note ? `<blockquote style="border-left:4px solid #f59e0b;padding:8px 16px;background:#fffbeb;margin:16px 0;"><p><strong>Note from Maxgen:</strong></p><p>${escapeHtml(quote.admin_note)}</p></blockquote>` : ""}
      <h3 style="margin-top:20px;">Items Requested</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:4px 8px;border:1px solid #e2e8f0;text-align:left;">SKU</th>
            <th style="padding:4px 8px;border:1px solid #e2e8f0;text-align:left;">Product</th>
            <th style="padding:4px 8px;border:1px solid #e2e8f0;">Qty</th>
            <th style="padding:4px 8px;border:1px solid #e2e8f0;text-align:left;">Unit Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="margin-top:12px;"><strong>Subtotal: SAR ${Number(quote.subtotal).toLocaleString()}</strong></p>
      <p style="margin-top:16px;">Our team will contact you shortly at <strong>${escapeHtml(quote.phone)}</strong> to discuss the next steps.</p>
      <p style="color:#888;font-size:12px;margin-top:24px;">Maxgen Electric Co., Riyadh, Saudi Arabia</p>
    `,
    replyTo: ALERT_TO,
  });
}

export function alertRFQEmail(quote) {
  const itemRows = (quote.items || [])
    .map(
      (i) =>
        `<tr>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;font-family:monospace;font-size:12px;">${escapeHtml(i.id)}</td>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;font-size:13px;">${escapeHtml(i.name)}</td>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;text-align:center;">${i.qty}</td>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;font-family:monospace;">SAR ${Number(i.price).toLocaleString()}</td>
          <td style="padding:4px 8px;border:1px solid #e2e8f0;font-family:monospace;font-weight:bold;">SAR ${Number(i.price * i.qty).toLocaleString()}</td>
        </tr>`
    )
    .join("");

  return sendAlertEmail({
    subject: `New RFQ ${quote.id} — ${quote.contact_name}${quote.company ? ` (${quote.company})` : ""}`,
    html: `
      <h2 style="color:#d97706;">New RFQ Received</h2>
      <p><strong>Reference:</strong> <span style="font-family:monospace;">${escapeHtml(quote.id)}</span></p>
      <p><strong>Contact:</strong> ${escapeHtml(quote.contact_name)}</p>
      <p><strong>Company:</strong> ${escapeHtml(quote.company || "—")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(quote.phone)}</p>
      <p><strong>Email:</strong> ${escapeHtml(quote.email || "—")}</p>
      <p><strong>Project Ref:</strong> ${escapeHtml(quote.project_ref || "—")}</p>
      <p><strong>Required By:</strong> ${escapeHtml(quote.delivery_date || "—")}</p>
      ${quote.notes ? `<p><strong>Notes:</strong> ${escapeHtml(quote.notes)}</p>` : ""}
      ${quote.boq_url ? `<p><strong>BOQ File:</strong> <a href="${quote.boq_url}">Download</a></p>` : ""}
      <h3 style="margin-top:20px;">Line Items</h3>
      <table style="border-collapse:collapse;width:100%;font-size:13px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:4px 8px;border:1px solid #e2e8f0;text-align:left;">SKU</th>
            <th style="padding:4px 8px;border:1px solid #e2e8f0;text-align:left;">Product</th>
            <th style="padding:4px 8px;border:1px solid #e2e8f0;">Qty</th>
            <th style="padding:4px 8px;border:1px solid #e2e8f0;text-align:left;">Unit Price</th>
            <th style="padding:4px 8px;border:1px solid #e2e8f0;text-align:left;">Line Total</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p style="margin-top:12px;font-size:15px;"><strong>Estimated Subtotal: SAR ${Number(quote.subtotal).toLocaleString()}</strong></p>
      <p style="color:#888;font-size:12px;margin-top:20px;">Submitted via the Maxgen RFQ portal.</p>
    `,
    replyTo: quote.email || undefined,
  });
}
