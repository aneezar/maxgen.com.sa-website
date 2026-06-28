"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Sparkles, ChevronDown } from "lucide-react";

const SUGGESTED = [
  "What ELV systems do you supply?",
  "I need MCBs and distribution boards for a villa project.",
  "Do you have fire alarm systems in stock?",
  "Can you help me build a BOQ for a hotel?",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-6 h-6 bg-amber-500 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Sparkles size={12} className="text-slate-950" />
        </div>
      )}
      <div className={`max-w-[82%] px-3 py-2 text-sm leading-relaxed ${isUser ? "bg-amber-500 text-slate-950" : "bg-white border border-slate-200 text-slate-700"}`}>
        {msg.content}
        {msg.streaming && <span className="inline-block w-1 h-3 bg-amber-500 ml-0.5 animate-pulse" />}
      </div>
    </div>
  );
}

export default function AIChatWidget({ pageContext }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm the Maxgen AI Assistant. Ask me about products, specifications, or let me help you with a BOQ or project recommendation." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAI] = useState(true); // checked server-side via env; widget won't render without it
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [open, messages.length]);

  const send = async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { role: "user", content };
    const history = [...messages, userMsg];
    setMessages(history);
    setLoading(true);

    // Optimistic streaming message
    const assistantIdx = history.length;
    setMessages([...history, { role: "assistant", content: "", streaming: true }]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content: c }) => ({ role, content: c })),
          context: pageContext || "",
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error("AI service unavailable.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          next[assistantIdx] = { role: "assistant", content: accumulated, streaming: true };
          return next;
        });
      }

      setMessages((prev) => {
        const next = [...prev];
        next[assistantIdx] = { role: "assistant", content: accumulated || "Sorry, I couldn't generate a response. Please try again." };
        return next;
      });
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[assistantIdx] = { role: "assistant", content: "Sorry — I couldn't reach the AI service right now. Please try again." };
        return next;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open AI chat assistant"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        <MessageSquare size={22} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] shadow-2xl border border-slate-200 bg-white flex flex-col" style={{ height: "520px" }}>
      {/* Header */}
      <div className="bg-amber-500 px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-slate-950" />
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-slate-950 font-semibold">Maxgen AI</p>
            <p className="font-mono text-[9px] text-slate-800">Product & Project Advisor</p>
          </div>
        </div>
        <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-slate-800 hover:text-slate-950">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 bg-slate-50">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions (shown before first user message) */}
      {messages.filter((m) => m.role === "user").length === 0 && (
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 flex-wrap flex-shrink-0">
          {SUGGESTED.map((s) => (
            <button key={s} onClick={() => send(s)}
              className="font-mono text-[9px] border border-slate-300 text-slate-500 hover:border-amber-500 hover:text-amber-700 px-2 py-1 transition-colors text-left">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-200 px-3 py-2 flex items-end gap-2 bg-white flex-shrink-0">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder="Ask about products or projects…"
          className="flex-1 bg-slate-50 border border-slate-300 focus:border-amber-500 outline-none px-3 py-2 text-sm text-slate-700 resize-none"
          style={{ maxHeight: "80px" }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          aria-label="Send message"
          className="w-9 h-9 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-200 text-slate-950 flex items-center justify-center flex-shrink-0 transition-colors"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        </button>
      </div>
    </div>
  );
}
