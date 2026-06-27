import { getQuoteById } from "@/lib/db";
import { fmt } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const emailParam = searchParams.get("email")?.trim().toLowerCase();

  const q = await getQuoteById(id);
  if (!q) return new Response("Not found", { status: 404 });

  // Require the caller to supply the quote's email address.
  // This prevents unauthenticated enumeration of all quotes by ID alone.
  if (!q.email) {
    return new Response("This quote has no email address on file and cannot be exported via this endpoint.", { status: 403 });
  }
  if (!emailParam || emailParam !== q.email.trim().toLowerCase()) {
    return new Response("Unauthorized: email address does not match this quote.", { status: 401 });
  }

  const rows = [
    ["RFQ Reference", q.id],
    ["Status", q.status],
    ["Contact Name", q.contact_name],
    ["Company", q.company || ""],
    ["Phone", q.phone],
    ["Email", q.email || ""],
    ["Project Reference", q.project_ref || ""],
    ["Required By", q.delivery_date || ""],
    ["Submitted At", new Date(q.created_at).toLocaleString("en-GB")],
    ["Notes", q.notes || ""],
    [],
    ["SKU", "Product", "Brand", "Unit Price (SAR)", "Qty", "Line Total (SAR)"],
    ...(q.items || []).map((i) => [i.id, i.name, i.brand || "", i.price, i.qty, i.price * i.qty]),
    [],
    ["", "", "", "", "Subtotal (SAR)", q.subtotal],
    [],
    ["Admin Note", q.admin_note || ""],
  ];

  const csv = rows
    .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${q.id}.csv"`,
    },
  });
}
