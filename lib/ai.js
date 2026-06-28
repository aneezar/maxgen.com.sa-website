// ---- Maxgen AI client — uses Anthropic REST API directly via fetch ----
// Cloudflare Workers: no native Node.js modules, so we skip the SDK
// and call the API ourselves with fetch (always available in the V8 runtime).

const API_URL = "https://api.anthropic.com/v1/messages";
export const AI_MODEL_FAST = "claude-haiku-4-5-20251001";
export const AI_MODEL_FULL = "claude-sonnet-4-6";

export const MAXGEN_SYSTEM = `You are the Maxgen AI Assistant — a knowledgeable B2B technical advisor for Maxgen, a supplier of electrical accessories and ELV (Extra Low Voltage) systems serving Saudi Arabia, India, the UK, and the USA.

You help project engineers, procurement managers, and technical teams with:
- Selecting the right electrical and ELV products for their projects
- Understanding technical specifications
- Building Bill of Quantities (BOQ) for projects
- Generating technical submittals and proposals
- Understanding compliance requirements (Saudi SASO, CE, ISI standards)

Maxgen's main product categories:
- Wiring devices: switches, sockets, dimmers, USB outlets, data points
- Protection: MCBs, RCBOs, RCDs, distribution boards, panel boards
- Cable management: cable trays, conduits, trunking, wire ducts
- ELV systems: CCTV, access control, fire alarm, BMS, structured cabling, PA systems
- Lighting: LED panels, emergency lighting, outdoor floodlights
- Wires and cables: multi-core, armoured, fire-resistant

Be concise, technically accurate, and professional. Format lists with bullet points. Prices are in SAR. When referencing products without a specific SKU in context, advise the customer to check the Maxgen catalog or contact their account manager.`;

function getHeaders() {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not configured.");
  return {
    "Content-Type": "application/json",
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
  };
}

// Non-streaming: returns the full text response
export async function aiGenerate({ system = MAXGEN_SYSTEM, messages, max_tokens = 1500, model = AI_MODEL_FAST }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ model, max_tokens, system, messages }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// Streaming: returns the Response object with a ReadableStream body (SSE)
export async function aiStream({ system = MAXGEN_SYSTEM, messages, max_tokens = 1500, model = AI_MODEL_FAST }) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ model, max_tokens, system, messages, stream: true }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    throw new Error(`Anthropic API ${res.status}: ${err}`);
  }

  return res; // caller reads the SSE body
}

// ---- Prompt helpers ----

export function productContext(product) {
  return `Product: ${product.name} (SKU: ${product.id})
Brand: ${product.brand || "Maxgen"}
Category: ${product.cat}
Specification: ${product.spec || "N/A"}
Price: SAR ${product.price}
Stock status: ${product.stock > 0 ? `${product.stock} units in stock` : "Out of stock"}
Applications: ${product.applications || "General electrical installation"}
Tags: ${Array.isArray(product.tags) ? product.tags.join(", ") : ""}`;
}

export function productsContext(products) {
  return products.map((p, i) => `${i + 1}. ${p.name} (${p.id}) — ${p.spec || ""} — SAR ${p.price}`).join("\n");
}
