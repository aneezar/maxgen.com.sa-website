import { cookies } from "next/headers";

export async function requireAdmin() {
  const PIN = process.env.ADMIN_PIN;
  if (!PIN || PIN === "ADMIN_PIN_NOT_SET") throw new Error("Admin not configured.");
  const store = await cookies();
  const session = store.get("admin_session")?.value;
  if (!session || session !== PIN) throw new Error("Unauthorized");
}

export function checkAdminSession(cookieHeader) {
  const PIN = process.env.ADMIN_PIN;
  if (!PIN || PIN === "ADMIN_PIN_NOT_SET") return false;
  const match = cookieHeader?.match(/admin_session=([^;]+)/);
  return !!(match && match[1] === PIN);
}
