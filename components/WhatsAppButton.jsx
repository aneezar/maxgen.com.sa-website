import { MessageCircle } from "lucide-react";

export default function WhatsAppButton({ product, phone = "96629207699" }) {
  const text = encodeURIComponent(
    `Hi Maxgen, I'm interested in:\n\n*${product.name}*\nSKU: ${product.id}\nPrice: SAR ${Number(product.price).toLocaleString("en-US")}\n\nCould you please confirm availability and lead time?`
  );
  return (
    <a
      href={`https://wa.me/${phone}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 border border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-mono uppercase text-sm tracking-wider px-6 py-3.5 transition-colors"
    >
      <MessageCircle size={16} />
      WhatsApp Enquiry
    </a>
  );
}
