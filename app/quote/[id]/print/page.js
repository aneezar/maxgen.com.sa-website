import { notFound } from "next/navigation";
import { getQuoteById } from "@/lib/db";
import { fmt, COMPANY_EMAIL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return { title: `Quote ${id}`, robots: { index: false, follow: false } };
}

export default async function QuotePrintPage({ params }) {
  const { id } = await params;
  const q = await getQuoteById(id);
  if (!q) notFound();

  const date = new Date(q.created_at).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const S = {
    root: { fontFamily: "system-ui, -apple-system, sans-serif", color: "#0f172a" },
    wrap: { maxWidth: 760, margin: "0 auto", padding: "48px 48px" },
    mono: { fontFamily: "ui-monospace, monospace" },
    // header
    header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "2px solid #f59e0b", paddingBottom: 20, marginBottom: 28 },
    logoMark: { fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" },
    logoSub: { fontSize: 10, color: "#94a3b8", letterSpacing: "0.12em", fontFamily: "ui-monospace, monospace", marginTop: 3 },
    refBlock: { textAlign: "right" },
    refLabel: { fontSize: 10, color: "#94a3b8", letterSpacing: "0.12em", fontFamily: "ui-monospace, monospace", textTransform: "uppercase" },
    refId: { fontSize: 18, fontWeight: 700, color: "#d97706", fontFamily: "ui-monospace, monospace", marginTop: 3 },
    refDate: { fontSize: 11, color: "#64748b", marginTop: 2 },
    // parties
    parties: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 },
    partyLabel: { fontSize: 10, color: "#94a3b8", letterSpacing: "0.12em", fontFamily: "ui-monospace, monospace", textTransform: "uppercase", marginBottom: 8 },
    partyName: { fontSize: 14, fontWeight: 600 },
    partySub: { fontSize: 12, color: "#475569", marginTop: 2 },
    partyMono: { fontSize: 12, color: "#64748b", fontFamily: "ui-monospace, monospace", marginTop: 2 },
    // table
    table: { width: "100%", borderCollapse: "collapse", marginBottom: 0 },
    th: { padding: "7px 6px", textAlign: "left", fontSize: 10, color: "#94a3b8", letterSpacing: "0.1em", fontFamily: "ui-monospace, monospace", textTransform: "uppercase", fontWeight: 600, borderTop: "2px solid #e2e8f0", borderBottom: "2px solid #e2e8f0" },
    thR: { padding: "7px 6px", textAlign: "right", fontSize: 10, color: "#94a3b8", letterSpacing: "0.1em", fontFamily: "ui-monospace, monospace", textTransform: "uppercase", fontWeight: 600, borderTop: "2px solid #e2e8f0", borderBottom: "2px solid #e2e8f0" },
    thC: { padding: "7px 6px", textAlign: "center", fontSize: 10, color: "#94a3b8", letterSpacing: "0.1em", fontFamily: "ui-monospace, monospace", textTransform: "uppercase", fontWeight: 600, borderTop: "2px solid #e2e8f0", borderBottom: "2px solid #e2e8f0", width: 50 },
    td: { padding: "10px 6px", verticalAlign: "top", borderBottom: "1px solid #f1f5f9" },
    tdR: { padding: "10px 6px", textAlign: "right", verticalAlign: "top", borderBottom: "1px solid #f1f5f9", fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#475569" },
    tdC: { padding: "10px 6px", textAlign: "center", verticalAlign: "top", borderBottom: "1px solid #f1f5f9", fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#475569" },
    skuCell: { fontSize: 11, fontFamily: "ui-monospace, monospace", color: "#64748b" },
    brandCell: { fontSize: 9, fontFamily: "ui-monospace, monospace", color: "#d97706", textTransform: "uppercase", letterSpacing: "0.1em" },
    nameCell: { fontSize: 13 },
    specCell: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
    totalCell: { padding: "10px 6px", textAlign: "right", verticalAlign: "top", borderBottom: "1px solid #f1f5f9", fontFamily: "ui-monospace, monospace", fontSize: 13, fontWeight: 700 },
    // subtotal row
    subTd: { padding: "10px 6px" },
    subLabel: { padding: "10px 6px", textAlign: "right", fontSize: 11, fontFamily: "ui-monospace, monospace", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", borderTop: "2px solid #e2e8f0" },
    subValue: { padding: "10px 6px", textAlign: "right", fontSize: 17, fontFamily: "ui-monospace, monospace", fontWeight: 700, color: "#d97706", borderTop: "2px solid #e2e8f0" },
    // admin note
    note: { borderLeft: "3px solid #f59e0b", background: "#fffbeb", padding: "10px 14px", marginTop: 24 },
    noteLabel: { fontSize: 10, fontFamily: "ui-monospace, monospace", color: "#92400e", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 },
    noteText: { fontSize: 13, color: "#78350f" },
    // request details
    detailsSection: { marginTop: 24, paddingTop: 14, borderTop: "1px solid #e2e8f0" },
    detailsLabel: { fontSize: 10, fontFamily: "ui-monospace, monospace", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 },
    detailRow: { fontSize: 12, color: "#475569", marginBottom: 3 },
    detailKey: { fontFamily: "ui-monospace, monospace", color: "#94a3b8", marginRight: 8 },
    // footer
    pageFooter: { marginTop: 36, paddingTop: 14, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between" },
    footerL: { fontSize: 11, color: "#94a3b8", lineHeight: 1.6 },
    footerR: { fontSize: 11, color: "#94a3b8", textAlign: "right", lineHeight: 1.6, fontFamily: "ui-monospace, monospace" },
  };

  return (
    <>
      {/* Print CSS — visibility trick isolates only #qp for print */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qp, #qp * { visibility: visible; }
          #qp { position: absolute; top: 0; left: 0; right: 0; }
          @page { size: A4 portrait; margin: 10mm 12mm; }
        }
        @media screen {
          #qp { position: fixed; inset: 0; z-index: 9999; background: white; overflow: auto; }
        }
      `}</style>

      {/* Auto-trigger print dialog after fonts + content load */}
      <script dangerouslySetInnerHTML={{ __html: "window.addEventListener('load',function(){setTimeout(window.print,350);});" }} />

      <div id="qp" style={S.root}>
        <div style={S.wrap}>

          {/* Header */}
          <div style={S.header}>
            <div>
              <div style={S.logoMark}>MAXGEN</div>
              <div style={S.mono}><span style={S.logoSub}>ELECTRIC CO.</span></div>
            </div>
            <div style={S.refBlock}>
              <div style={S.refLabel}>Quotation Request</div>
              <div style={S.refId}>{q.id}</div>
              <div style={S.refDate}>{date}</div>
            </div>
          </div>

          {/* Parties */}
          <div style={S.parties}>
            <div>
              <div style={S.partyLabel}>Prepared For</div>
              <div style={S.partyName}>{q.contact_name}</div>
              {q.company && <div style={S.partySub}>{q.company}</div>}
              <div style={S.partyMono}>{q.phone}</div>
              {q.email && <div style={S.partyMono}>{q.email}</div>}
            </div>
            <div>
              <div style={S.partyLabel}>From</div>
              <div style={S.partyName}>Maxgen Electric Co.</div>
              <div style={S.partySub}>Riyadh, Saudi Arabia</div>
              <div style={S.partyMono}>{COMPANY_EMAIL}</div>
              <div style={S.partyMono}>maxgen.com.sa</div>
            </div>
          </div>

          {/* Line items table */}
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: 95 }}>SKU</th>
                <th style={S.th}>Product</th>
                <th style={S.thC}>Qty</th>
                <th style={{ ...S.thR, width: 100 }}>Unit Price</th>
                <th style={{ ...S.thR, width: 100 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(q.items || []).map((item) => (
                <tr key={item.id}>
                  <td style={S.td}><span style={S.skuCell}>{item.id}</span></td>
                  <td style={S.td}>
                    {item.brand && <div style={S.brandCell}>{item.brand}</div>}
                    <div style={S.nameCell}>{item.name}</div>
                    {item.spec && <div style={S.specCell}>{item.spec}</div>}
                  </td>
                  <td style={S.tdC}>{item.qty}</td>
                  <td style={S.tdR}>{fmt(item.price)}</td>
                  <td style={S.totalCell}>{fmt(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={S.subTd} />
                <td style={S.subLabel}>Estimated Subtotal</td>
                <td style={S.subValue}>{fmt(q.subtotal)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Admin note */}
          {q.admin_note && (
            <div style={S.note}>
              <div style={S.noteLabel}>Note from Maxgen</div>
              <div style={S.noteText}>{q.admin_note}</div>
            </div>
          )}

          {/* Request details (if any extra fields) */}
          {(q.project_ref || q.delivery_date || q.notes) && (
            <div style={S.detailsSection}>
              <div style={S.detailsLabel}>Request Details</div>
              {q.project_ref && (
                <div style={S.detailRow}>
                  <span style={S.detailKey}>Project Ref:</span>{q.project_ref}
                </div>
              )}
              {q.delivery_date && (
                <div style={S.detailRow}>
                  <span style={S.detailKey}>Required By:</span>
                  {new Date(q.delivery_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </div>
              )}
              {q.notes && (
                <div style={S.detailRow}>
                  <span style={S.detailKey}>Notes:</span>{q.notes}
                </div>
              )}
            </div>
          )}

          {/* Page footer */}
          <div style={S.pageFooter}>
            <div style={S.footerL}>
              <div>Prices are indicative. A formal quotation will follow.</div>
              <div>Valid for 30 days from the date of this request.</div>
            </div>
            <div style={S.footerR}>
              <div>{COMPANY_EMAIL}</div>
              <div>maxgen.com.sa</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
