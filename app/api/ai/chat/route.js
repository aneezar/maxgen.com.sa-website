import { aiStream, MAXGEN_SYSTEM } from "@/lib/ai";

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

  const messages = (body.messages || [])
    .filter((m) => m?.role && m?.content && typeof m.content === "string")
    .map((m) => ({ ...m, content: m.content.slice(0, 4000) })) // cap each message
    .slice(-20); // keep last 20 turns max

  if (!messages.length) {
    return new Response(JSON.stringify({ error: "No messages provided." }), {
      status: 400, headers: { "Content-Type": "application/json" },
    });
  }

  // Optionally inject product/page context — capped to prevent prompt injection
  const rawContext = typeof body.context === "string" ? body.context.slice(0, 2000) : null;
  const system = rawContext
    ? `${MAXGEN_SYSTEM}\n\n## Current page context\n${rawContext}`
    : MAXGEN_SYSTEM;

  try {
    const upstream = await aiStream({ system, messages, max_tokens: 1024 });

    // Pipe the Anthropic SSE stream back to the browser.
    // We parse SSE events and re-emit only the text deltas as plain chunks
    // so the client can use a simple ReadableStream reader.
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    (async () => {
      const reader = upstream.body.getReader();
      try {
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (raw === "[DONE]") continue;
            try {
              const evt = JSON.parse(raw);
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
                await writer.write(encoder.encode(evt.delta.text));
              }
            } catch { /* skip malformed SSE event */ }
          }
        }
      } finally {
        await writer.close().catch(() => {});
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[ai:chat]", err.message);
    return new Response(JSON.stringify({ error: "AI service error. Try again shortly." }), {
      status: 502, headers: { "Content-Type": "application/json" },
    });
  }
}
