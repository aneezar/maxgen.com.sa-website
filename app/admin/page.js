import { cookies } from "next/headers";
import AdminClient from "@/components/AdminClient";
import AdminLoginForm from "@/components/AdminLoginForm";
import { getProducts, getServices, getContent, getOrders, getLeads, getMessages, getApplications, getQuotes, getCustomers, getPartners, getAdminPosts, getAdminJobs } from "@/lib/db";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  const PIN = process.env.ADMIN_PIN;
  const isAuthed = !!(session && PIN && PIN !== "ADMIN_PIN_NOT_SET" && session === PIN);

  if (!isAuthed) {
    return <AdminLoginForm />;
  }

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
