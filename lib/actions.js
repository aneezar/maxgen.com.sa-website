"use server";

import { revalidatePath } from "next/cache";
import {
  saveMessage,
  saveLead,
  saveApplication,
  placeOrder,
  upsertProducts,
  deleteProduct as dbDeleteProduct,
  upsertService,
  deleteService as dbDeleteService,
  saveContent as dbSaveContent,
  addCustomer,
  deleteCustomer as dbDeleteCustomer,
  addPartner,
  deletePartner as dbDeletePartner,
  saveQuote,
  getProductsByIds,
  updateQuoteStatus as dbUpdateQuoteStatus,
  getQuoteById as dbGetQuoteById,
} from "./db";
import { alertLeadEmail, alertMessageEmail, alertApplicationEmail, alertRFQEmail, notifyCustomerEmail, sendQuoteEmailToCustomer } from "./email";

export async function submitContactForm(formData) {
  const payload = {
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    message: formData.get("message"),
  };
  if (!payload.name || !payload.phone || !payload.message) {
    return { ok: false, error: "Please fill in name, phone, and message." };
  }
  const ok = await saveMessage(payload);
  if (ok) {
    // Email alert is best-effort — never block or fail the form on this.
    alertMessageEmail(payload).catch(() => {});
  }
  return ok ? { ok: true } : { ok: false, error: "Could not send right now — please try again." };
}

export async function submitLead(formData) {
  const payload = { email: formData.get("email"), phone: formData.get("phone") };
  if (!payload.email && !payload.phone) {
    return { ok: false, error: "Enter at least an email or phone number." };
  }
  const ok = await saveLead(payload);
  if (ok) {
    alertLeadEmail(payload).catch(() => {});
  }
  return ok ? { ok: true } : { ok: false, error: "Could not submit — please try again." };
}

export async function submitApplication(formData, role) {
  const payload = {
    role,
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
  };
  if (!payload.name || !payload.email) {
    return { ok: false, error: "Name and email are required." };
  }
  const ok = await saveApplication(payload);
  if (ok) {
    alertApplicationEmail(payload).catch(() => {});
  }
  return ok ? { ok: true } : { ok: false, error: "Could not submit — please try again." };
}

export async function submitOrder(order) {
  const ok = await placeOrder(order);
  if (ok) revalidatePath("/admin");
  return ok;
}

// ---- Admin mutations ----
export async function adminSaveProduct(record) {
  const ok = await upsertProducts([record]);
  if (ok) {
    revalidatePath("/shop");
    revalidatePath(`/shop/${record.id}`);
    revalidatePath("/");
    revalidatePath("/admin");
  }
  return ok;
}

export async function adminDeleteProduct(id) {
  const ok = await dbDeleteProduct(id);
  if (ok) {
    revalidatePath("/shop");
    revalidatePath("/admin");
  }
  return ok;
}

export async function adminSaveService(record) {
  const ok = await upsertService(record);
  if (ok) {
    revalidatePath("/verticals");
    revalidatePath(`/verticals/${record.slug}`);
    revalidatePath("/admin");
  }
  return ok;
}

export async function adminDeleteService(slug) {
  const ok = await dbDeleteService(slug);
  if (ok) {
    revalidatePath("/verticals");
    revalidatePath("/admin");
  }
  return ok;
}

export async function adminSaveContent(content) {
  const ok = await dbSaveContent(content);
  if (ok) {
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/contact");
    revalidatePath("/admin");
  }
  return ok;
}

// ---- Major Customers (CMS form on /customers) ----
export async function submitCustomer(formData) {
  const payload = {
    name: formData.get("name"),
    sector: formData.get("sector"),
    note: formData.get("note"),
  };
  if (!payload.name) {
    return { ok: false, error: "Customer name is required." };
  }
  const ok = await addCustomer(payload);
  if (ok) revalidatePath("/customers");
  return ok ? { ok: true } : { ok: false, error: "Could not save — please try again." };
}

export async function adminDeleteCustomer(id) {
  const ok = await dbDeleteCustomer(id);
  if (ok) revalidatePath("/customers");
  return ok;
}

// ---- Partners (CMS form on /partners) ----
export async function submitPartner(formData) {
  const payload = {
    name: formData.get("name"),
    type: formData.get("type"),
    focus: formData.get("focus"),
  };
  if (!payload.name) {
    return { ok: false, error: "Partner name is required." };
  }
  const ok = await addPartner(payload);
  if (ok) revalidatePath("/partners");
  return ok ? { ok: true } : { ok: false, error: "Could not save — please try again." };
}

export async function adminDeletePartner(id) {
  const ok = await dbDeletePartner(id);
  if (ok) revalidatePath("/partners");
  return ok;
}

// ---- RFQ / Quotes ----
export async function submitRFQ(formData) {
  let items;
  try {
    items = JSON.parse(formData.get("items") || "[]");
  } catch {
    return { ok: false, error: "Invalid items data." };
  }

  if (!items.length) return { ok: false, error: "Quote basket is empty." };

  const contactName = formData.get("contact_name")?.trim();
  const phone = formData.get("phone")?.trim();
  if (!contactName || !phone) {
    return { ok: false, error: "Contact name and phone are required." };
  }

  // Re-fetch prices from DB to prevent client-side price tampering
  const dbProducts = await getProductsByIds(items.map((i) => i.id));
  for (const item of items) {
    const dbProd = dbProducts.find((p) => p.id === item.id);
    if (dbProd && Math.abs(dbProd.price - item.price) / (dbProd.price || 1) > 0.01) {
      return { ok: false, error: "Product prices have changed. Please refresh and try again." };
    }
  }

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const refId = `MG-RFQ-${Date.now().toString().slice(-8)}`;

  const quote = {
    id: refId,
    status: "pending",
    contact_name: contactName,
    company: formData.get("company")?.trim() || null,
    phone,
    email: formData.get("email")?.trim() || null,
    project_ref: formData.get("project_ref")?.trim() || null,
    delivery_date: formData.get("delivery_date") || null,
    notes: formData.get("notes")?.trim() || null,
    boq_url: formData.get("boq_url") || null,
    items,
    subtotal,
  };

  const ok = await saveQuote(quote);
  if (!ok) return { ok: false, error: "Could not submit your RFQ — please try again." };

  alertRFQEmail(quote).catch(() => {});
  revalidatePath("/admin");
  return { ok: true, refId };
}

export async function adminSendQuoteEmail(quoteId) {
  const quote = await dbGetQuoteById(quoteId);
  if (!quote) return { ok: false, error: "Quote not found." };
  if (!quote.email) return { ok: false, error: "No email address on this quote." };
  const ok = await sendQuoteEmailToCustomer(quote);
  return ok ? { ok: true } : { ok: false, error: "Email failed. Ensure RESEND_API_KEY is configured." };
}

export async function adminUpdateQuoteStatus(id, status, adminNote) {
  const ok = await dbUpdateQuoteStatus(id, status, adminNote);
  if (ok) {
    revalidatePath("/admin");
    if (status === "quoted") {
      dbGetQuoteById(id).then((quote) => {
        if (quote?.email) notifyCustomerEmail(quote).catch(() => {});
      }).catch(() => {});
    }
  }
  return ok;
}
