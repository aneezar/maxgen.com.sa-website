import AIToolsClient from "@/components/AIToolsClient";
import { getProducts } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export const metadata = {
  title: "AI Tools — Proposal, BOQ & Product Advisor",
  description: "AI-powered tools for electrical project teams: generate proposals, build BOQs, create technical submittals, and get instant product recommendations.",
  alternates: { canonical: "/ai-tools" },
  openGraph: {
    title: "AI Tools | Maxgen",
    description: "AI-powered proposal generator, BOQ builder, and product advisor for electrical and ELV projects.",
    url: `${SITE_URL}/ai-tools`,
  },
};

export const dynamic = "force-dynamic";

export default async function AIToolsPage() {
  const products = await getProducts();
  const hasAI = !!process.env.ANTHROPIC_API_KEY;

  return <AIToolsClient products={products} hasAI={hasAI} />;
}
