import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
  console.warn(
    "[supabaseServer] SUPABASE_SERVICE_ROLE_KEY is not set. Admin write operations will fail. " +
    "Add it to .env.local (never prefix with NEXT_PUBLIC_)."
  );
}

// Used exclusively for server-side admin mutations. Never expose this client
// or the service role key to the browser.
// Falls back to a placeholder key so the module loads cleanly at build time;
// any actual write will return a 401 from Supabase until the real key is set.
export const supabaseAdmin = createClient(url, serviceRoleKey || "SUPABASE_SERVICE_ROLE_KEY_NOT_SET", {
  auth: { persistSession: false },
});
