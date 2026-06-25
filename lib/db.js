import { supabase } from "./supabaseClient";

// ---- Products ----
export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*").order("created_at");
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getProductById(rawId) {
  let id;
  try {
    // Defensive decode: handles cases where the segment arrives still
    // percent-encoded (e.g. "1%20Testing") as well as already-decoded values.
    id = typeof rawId === "string" ? decodeURIComponent(rawId).trim() : String(rawId || "").trim();
  } catch {
    id = String(rawId || "").trim();
  }
  if (!id) return null;

  try {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
    if (error) {
      console.error("getProductById:", error);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error("getProductById threw:", err);
    return null;
  }
}

export async function upsertProducts(products) {
  const { error } = await supabase.from("products").upsert(products);
  return !error;
}

export async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  return !error;
}

// ---- Services / Verticals ----
export async function getServices() {
  const { data, error } = await supabase.from("services").select("*").order("division").order("sort_order");
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getServiceBySlug(rawSlug) {
  let slug;
  try {
    slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug).trim() : String(rawSlug || "").trim();
  } catch {
    slug = String(rawSlug || "").trim();
  }
  if (!slug) return null;

  try {
    const { data, error } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
    if (error) {
      console.error("getServiceBySlug:", error);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error("getServiceBySlug threw:", err);
    return null;
  }
}

export async function getServicesGrouped() {
  const services = await getServices();
  const divisions = [];
  for (const s of services) {
    let div = divisions.find((d) => d.division === s.division);
    if (!div) {
      div = { division: s.division, items: [] };
      divisions.push(div);
    }
    div.items.push(s);
  }
  return divisions;
}

export async function upsertService(service) {
  const { error } = await supabase.from("services").upsert(service);
  return !error;
}

export async function deleteService(slug) {
  const { error } = await supabase.from("services").delete().eq("slug", slug);
  return !error;
}

// ---- Site content (CMS) ----
export async function getContent() {
  const { data, error } = await supabase.from("site_content").select("data").eq("id", 1).single();
  if (error) { console.error(error); return {}; }
  return data?.data || {};
}

export async function saveContent(content) {
  const { error } = await supabase.from("site_content").update({ data: content }).eq("id", 1);
  return !error;
}

// ---- Orders ----
export async function placeOrder(order) {
  const { error } = await supabase.from("orders").insert({
    id: order.orderId,
    items: order.items,
    subtotal: order.subtotal,
    vat: order.vat,
    grand_total: order.grandTotal,
  });
  return !error;
}

export async function getOrders() {
  const { data, error } = await supabase.from("orders").select("*").order("placed_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

// ---- Contact messages ----
export async function saveMessage(msg) {
  const { error } = await supabase.from("messages").insert(msg);
  return !error;
}

export async function getMessages() {
  const { data, error } = await supabase.from("messages").select("*").order("submitted_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

// ---- Leads ----
export async function saveLead(lead) {
  const { error } = await supabase.from("leads").insert(lead);
  return !error;
}

export async function getLeads() {
  const { data, error } = await supabase.from("leads").select("*").order("captured_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

// ---- Job applications ----
export async function saveApplication(app) {
  const { error } = await supabase.from("applications").insert(app);
  return !error;
}

export async function getApplications() {
  const { data, error } = await supabase.from("applications").select("*").order("applied_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

// ---- Major Customers ----
export async function getCustomers() {
  const { data, error } = await supabase.from("customers").select("*").order("sort_order").order("created_at");
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function addCustomer(customer) {
  const { error } = await supabase.from("customers").insert(customer);
  return !error;
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from("customers").delete().eq("id", id);
  return !error;
}

// ---- Partners ----
export async function getPartners() {
  const { data, error } = await supabase.from("partners").select("*").order("sort_order").order("created_at");
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function addPartner(partner) {
  const { error } = await supabase.from("partners").insert(partner);
  return !error;
}

export async function deletePartner(id) {
  const { error } = await supabase.from("partners").delete().eq("id", id);
  return !error;
}
