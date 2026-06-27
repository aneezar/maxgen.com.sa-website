if (
  typeof process !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  !process.env.NEXT_PUBLIC_IMGIX_DOMAIN
) {
  console.warn("[imgix] NEXT_PUBLIC_IMGIX_DOMAIN is not set — images will load directly from Supabase Storage.");
}

export function imgixUrl(src, { w = 800, h, q = 75, fit = "crop" } = {}) {
  if (!src || src.startsWith("data:")) return src || null;
  const domain = process.env.NEXT_PUBLIC_IMGIX_DOMAIN;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!domain || !supabaseUrl || !src.includes("/storage/v1/object/public/")) return src;
  const path = src.split("/storage/v1/object/public/")[1] || "";
  const params = new URLSearchParams({ w: String(w), q: String(q), auto: "format", fit });
  if (h) params.set("h", String(h));
  return `https://${domain}/${path}?${params.toString()}`;
}
