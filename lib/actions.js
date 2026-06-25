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
} from "./db";
import { alertLeadEmail, alertMessageEmail, alertApplicationEmail } from "./email";

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
