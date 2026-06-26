import { MessageCircle } from "lucide-react";
import { fmt } from "@/lib/constants";

export default function WhatsAppQuoteButton({ quote, subtotal, phone = "96629207699" }) {
  if (!quote || quote.length === 0) return null;

  const lines = [
    "Hi Maxgen, I'd like to request a quote for the following items:",
    "",
    ...quote.map((i) => `• ${i.name} (SKU: ${i.id}) × ${i.qty} — ${fmt(i.price * i.qty)}`),
    "",
    `*Estimated Total: ${fmt(subtotal)}*`,
    "",
    "Please confirm availability and provide your best pricing.",
  ];

  const text = encodeURIComponent(lines.join("\n"));

  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-mono uppercase text-xs tracking-wider px-4 py-2.5 transition-colors"
    >
      <MessageCircle size={14} />
      Send via WhatsApp
    </a>
  );
}
