import AdminClient from "@/components/AdminClient";
import { getProducts, getServices, getContent, getOrders, getLeads, getMessages, getApplications, getQuotes, getCustomers, getPartners, getAdminPosts, getAdminJobs } from "@/lib/db";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [products, services, content, orders, leads, messages, applications, quotes, customers, partners, posts, jobs] = await Promise.all([
    getProducts(),
    getServices(),
    getContent(),
    getOrders(),
    getLeads(),
    getMessages(),
    getApplications(),
    getQuotes(),
    getCustomers(),
    getPartners(),
    getAdminPosts(),
    getAdminJobs(),
  ]);

  return (
    <AdminClient
      initialProducts={products}
      initialServices={services}
      initialContent={content}
      initialOrders={orders}
      initialLeads={leads}
      initialMessages={messages}
      initialApplications={applications}
      initialQuotes={quotes}
      initialCustomers={customers}
      initialPartners={partners}
      initialPosts={posts}
      initialJobs={jobs}
      hasAI={!!process.env.ANTHROPIC_API_KEY}
    />
  );
}
