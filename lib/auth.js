// Set NEXT_PUBLIC_ADMIN_PIN in .env.local and as a Cloudflare Workers secret.
// If unset, the sentinel value ensures no guessable PIN is accepted.
export const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "ADMIN_PIN_NOT_SET";
