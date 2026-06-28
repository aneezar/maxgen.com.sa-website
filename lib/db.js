import { supabase } from "./supabaseClient";
import { supabaseAdmin } from "./supabaseServer";

// ---- Products ----
export async function getProducts() {
  const { data, error } = await supabase.from("products").select("*").order("created_at");
  if (error) { console.error("[db]", error.message); return []; }
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
      console.error("[db:getProductById]", error.message);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error("[db:getProductById]", err.message);
    return null;
  }
}

export async function upsertProducts(products) {
  const { error } = await supabaseAdmin.from("products").upsert(products);
  return !error;
}

export async function deleteProduct(id) {
  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  return !error;
}

// ---- Services / Verticals ----
export async function getServices() {
  const { data, error } = await supabase.from("services").select("*").order("division").order("sort_order");
  if (error) { console.error("[db]", error.message); return []; }
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
      console.error("[db:getServiceBySlug]", error.message);
      return null;
    }
    return data || null;
  } catch (err) {
    console.error("[db:getServiceBySlug]", err.message);
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
  const { error } = await supabaseAdmin.from("services").upsert(service);
  return !error;
}

export async function deleteService(slug) {
  const { error } = await supabaseAdmin.from("services").delete().eq("slug", slug);
  return !error;
}

// ---- Site content (CMS) ----
export async function getContent() {
  const { data, error } = await supabase.from("site_content").select("data").eq("id", 1).single();
  if (error) { console.error("[db]", error.message); return {}; }
  return data?.data || {};
}

export async function saveContent(content) {
  const { error } = await supabaseAdmin.from("site_content").update({ data: content }).eq("id", 1);
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
  const { data, error } = await supabaseAdmin.from("orders").select("*").order("placed_at", { ascending: false });
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

// ---- Contact messages ----
export async function saveMessage(msg) {
  const { error } = await supabase.from("messages").insert(msg);
  return !error;
}

export async function getMessages() {
  const { data, error } = await supabaseAdmin.from("messages").select("*").order("submitted_at", { ascending: false });
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

// ---- Leads ----
export async function saveLead(lead) {
  const { error } = await supabase.from("leads").insert(lead);
  return !error;
}

export async function getLeads() {
  const { data, error } = await supabaseAdmin.from("leads").select("*").order("captured_at", { ascending: false });
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

// ---- Job applications ----
export async function saveApplication(app) {
  const { error } = await supabase.from("applications").insert(app);
  return !error;
}

export async function getApplications() {
  const { data, error } = await supabaseAdmin.from("applications").select("*").order("applied_at", { ascending: false });
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

// ---- Major Customers ----
export async function getCustomers() {
  const { data, error } = await supabase.from("customers").select("*").order("sort_order").order("created_at");
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

export async function addCustomer(customer) {
  const { error } = await supabaseAdmin.from("customers").insert(customer);
  return !error;
}

export async function deleteCustomer(id) {
  const { error } = await supabaseAdmin.from("customers").delete().eq("id", id);
  return !error;
}

// ---- Partners ----
export async function getPartners() {
  const { data, error } = await supabase.from("partners").select("*").order("sort_order").order("created_at");
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

export async function addPartner(partner) {
  const { error } = await supabaseAdmin.from("partners").insert(partner);
  return !error;
}

export async function deletePartner(id) {
  const { error } = await supabaseAdmin.from("partners").delete().eq("id", id);
  return !error;
}

// ---- Products (filtered, server-side) ----
export async function getProductsFiltered({
  cat, brand, featured, availability, q, sort, maxPrice,
} = {}) {
  let query = supabase.from("products").select("*");
  if (cat && cat !== "all")       query = query.eq("cat", cat);
  if (brand && brand !== "all")   query = query.eq("brand", brand);
  if (featured)                   query = query.eq("featured", true);
  if (availability === "instock") query = query.eq("status", "active");
  if (maxPrice)                   query = query.lte("price", maxPrice);
  if (q) {
    const safe = String(q).slice(0, 100);
    const like = `%${safe}%`;
    query = query.or(`name.ilike.${like},id.ilike.${like},brand.ilike.${like}`);
  }
  if (sort === "price-asc")       query = query.order("price", { ascending: true });
  else if (sort === "price-desc") query = query.order("price", { ascending: false });
  else if (sort === "name-asc")   query = query.order("name", { ascending: true });
  else                            query = query.order("created_at");
  const { data, error } = await query;
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

export async function getBrands() {
  const { data, error } = await supabase
    .from("products")
    .select("brand")
    .not("brand", "is", null)
    .neq("brand", "");
  if (error) { console.error("[db]", error.message); return []; }
  return [...new Set((data || []).map((r) => r.brand).filter(Boolean))].sort();
}

export async function getMaxPrice() {
  const { data, error } = await supabase
    .from("products")
    .select("price")
    .order("price", { ascending: false })
    .limit(1);
  if (error) { console.error("[db]", error.message); return 100; }
  return data?.[0]?.price ?? 100;
}

export async function getProductsByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase.from("products").select("id,price").in("id", ids);
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

export async function getQuotesByIds(ids) {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

// ---- Quotes (RFQ) ----
export async function saveQuote(quote) {
  const { error } = await supabase.from("quotes").insert(quote);
  return !error;
}

export async function getQuotes() {
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[db]", error.message); return []; }
  return data || [];
}

export async function getQuoteById(id) {
  const { data, error } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (error) { console.error("[db]", error.message); return null; }
  return data || null;
}

export async function updateQuoteStatus(id, status, adminNote) {
  const update = {
    status,
    updated_at: new Date().toISOString(),
    ...(adminNote !== undefined ? { admin_note: adminNote } : {}),
    ...(status === "quoted" ? { quoted_at: new Date().toISOString() } : {}),
  };
  const { error } = await supabaseAdmin.from("quotes").update(update).eq("id", id);
  return !error;
}

// ---- Customer (admin update) ----
export async function updateCustomer(id, updates) {
  const { error } = await supabaseAdmin.from("customers").update(updates).eq("id", id);
  return !error;
}

// ---- Partner (admin update) ----
export async function updatePartner(id, updates) {
  const { error } = await supabaseAdmin.from("partners").update(updates).eq("id", id);
  return !error;
}

// ---- Orders (admin) ----
export async function updateOrderStatus(id, status, notes) {
  const update = { status };
  if (notes !== undefined) update.notes = notes;
  const { error } = await supabaseAdmin.from("orders").update(update).eq("id", id);
  return !error;
}

export async function adminAddCustomer(customer) {
  const { error } = await supabaseAdmin.from("customers").insert(customer);
  return !error;
}

export async function adminAddPartner(partner) {
  const { error } = await supabaseAdmin.from("partners").insert(partner);
  return !error;
}

// ---- Posts (blog / news / case-study / success-story) ----
export async function getPosts({ type, limit } = {}) {
  let query = supabase.from("posts").select("*").eq("status", "published").order("published_at", { ascending: false });
  if (type) query = query.eq("type", type);
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) { console.error("[db:getPosts]", error.message); return []; }
  return data || [];
}

export async function getPostBySlug(slug) {
  const { data, error } = await supabase.from("posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
  if (error) { console.error("[db:getPostBySlug]", error.message); return null; }
  return data || null;
}

export async function getAdminPosts() {
  const { data, error } = await supabaseAdmin.from("posts").select("*").order("created_at", { ascending: false });
  if (error) { console.error("[db:getAdminPosts]", error.message); return []; }
  return data || [];
}

export async function upsertPost(post) {
  const { error } = await supabaseAdmin.from("posts").upsert({ ...post, updated_at: new Date().toISOString() });
  return !error;
}

export async function deletePost(id) {
  const { error } = await supabaseAdmin.from("posts").delete().eq("id", id);
  return !error;
}

// ---- Jobs (dynamic career listings) ----
export async function getJobs() {
  const { data, error } = await supabase.from("jobs").select("*").eq("status", "active").order("sort_order").order("created_at");
  if (error) { console.error("[db:getJobs]", error.message); return []; }
  return data || [];
}

export async function getAdminJobs() {
  const { data, error } = await supabaseAdmin.from("jobs").select("*").order("sort_order").order("created_at");
  if (error) { console.error("[db:getAdminJobs]", error.message); return []; }
  return data || [];
}

export async function upsertJob(job) {
  const { error } = await supabaseAdmin.from("jobs").upsert(job);
  return !error;
}

export async function deleteJob(id) {
  const { error } = await supabaseAdmin.from("jobs").delete().eq("id", id);
  return !error;
}
