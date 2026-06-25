import AdminClient from "@/components/AdminClient";
import { getProducts, getServices, getContent, getOrders, getLeads, getMessages, getApplications } from "@/lib/db";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [products, services, content, orders, leads, messages, applications] = await Promise.all([
    getProducts(),
    getServices(),
    getContent(),
    getOrders(),
    getLeads(),
    getMessages(),
    getApplications(),
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
    />
  );
}
