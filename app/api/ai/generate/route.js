import { aiGenerate, MAXGEN_SYSTEM, AI_MODEL_FULL } from "@/lib/ai";

const ALLOWED_TYPES = ["proposal", "boq", "submittal", "recommend", "compare", "search", "summary"];

const PROMPTS = {
  proposal: (d) => `You are writing a formal project proposal for ${d.client || "the client"}.

Project: ${d.project}
Scope: ${d.scope || ""}
Location: ${d.location || "Saudi Arabia"}
Budget range: ${d.budget ? `SAR ${d.budget}` : "To be quoted"}

Write a professional B2B project proposal with these sections:
1. Executive Summary (2-3 sentences)
2. Project Understanding
3. Proposed Solution (reference relevant Maxgen product categories)
4. Project Timeline (outline phases)
5. Why Maxgen (3 bullet points on capabilities)
6. Next Steps

Keep it under 600 words. Professional tone. Do not include pricing tables.`,

  boq: (d) => `Generate a detailed Bill of Quantities (BOQ) for the following project:

Project: ${d.project}
Area / Scale: ${d.area || "to be determined"}
Systems required: ${d.systems || d.project}

Format as a markdown table with columns: Item No | Description | Unit | Estimated Qty | Notes
Group items by system/category. Include all electrical and ELV items typically required.
After the table, add a brief "Assumptions & Exclusions" section (5 bullet points max).`,

  submittal: (d) => `Generate a technical product submittal document for:

Product: ${d.name} (SKU: ${d.sku || "N/A"})
Brand: ${d.brand || "Maxgen"}
Specification: ${d.spec || ""}
Applications: ${d.applications || "General electrical installation"}

Format the submittal with:
1. Product Description
2. Technical Specifications (bullet list)
3. Compliance & Standards (mention relevant Saudi/international standards)
4. Installation Notes
5. Recommended Applications

Keep it concise and technically accurate. Professional format suitable for consultant review.`,

  recommend: (d) => `A customer has the following requirement:

"${d.requirement}"

Based on Maxgen's product categories (wiring devices, MCBs/distribution boards, cable management, ELV systems: CCTV/access control/fire alarm/BMS, lighting, cables), recommend the most suitable products.

Format your response as:
1. Requirement Analysis (1 sentence)
2. Recommended Products (bullet list with category + specific product type + why)
3. Additional Considerations (2-3 bullets on installation, compliance, or procurement tips)

Be specific about product types and specifications.`,

  compare: (d) => `Compare the following products for a customer evaluating them:

${d.products}

Provide:
1. Side-by-side comparison table (use markdown): Feature | Product 1 | Product 2 (etc.)
   Include: Price, Key specs, Best use case, Pros, Cons
2. Recommendation (1 paragraph on which to choose and when)

Be objective and technically accurate.`,

  search: (d) => `A customer typed this product search query: "${d.query}"

Convert this natural language query into structured search criteria for an electrical products catalog.

Respond with ONLY a JSON object (no markdown, no explanation) with these optional fields:
{
  "q": "keyword search term if relevant",
  "cat": "one of: switches|mcbs|distribution-boards|cable-management|elv-systems|lighting|cables or omit if unclear",
  "brand": "brand name if mentioned or omit",
  "featured": true or omit,
  "sort": "price-asc|price-desc|name-asc or omit",
  "summary": "1-sentence plain English explanation of what was searched"
}`,

  summary: (d) => `Write a concise AI-generated product summary for a B2B buyer evaluating this product:

${d.product}

Include:
- 1 sentence overview of what the product is
- 3-4 bullet points on key technical highlights
- 1 sentence on ideal use cases
- 1 sentence on ordering/availability note

Keep the total under 120 words. Professional B2B tone.`,
};

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(JSON.stringify({ error: "AI not configured." }), {
      status: 503, headers: { "Content-Type": "application/json" },
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON." }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const { type, data = {} } = body;

  if (!ALLOWED_TYPES.includes(type)) {
    return new Response(JSON.stringify({ error: "Unknown generation type." }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  const promptFn = PROMPTS[type];
  const userPrompt = promptFn(data);

  try {
    const useFullModel = ["proposal", "boq", "submittal", "compare"].includes(type);
    const result = await aiGenerate({
      system: MAXGEN_SYSTEM,
      messages: [{ role: "user", content: userPrompt }],
      max_tokens: type === "boq" || type === "proposal" ? 2000 : 1200,
      model: useFullModel ? AI_MODEL_FULL : undefined,
    });

    return new Response(JSON.stringify({ result }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error(`[ai:generate:${type}]`, err.message);
    return new Response(JSON.stringify({ error: "AI service error. Try again shortly." }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
}
