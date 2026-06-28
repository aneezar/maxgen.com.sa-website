/** @type {import('next').NextConfig} */

const SECURITY_HEADERS = [
  { key: "X-Frame-Options",           value: "DENY" },
  { key: "X-Content-Type-Options",    value: "nosniff" },
  { key: "X-DNS-Prefetch-Control",    value: "on" },
  { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      // Imgix domain for optimised product images — set NEXT_PUBLIC_IMGIX_DOMAIN in env
      ...(process.env.NEXT_PUBLIC_IMGIX_DOMAIN
        ? [{ protocol: "https", hostname: process.env.NEXT_PUBLIC_IMGIX_DOMAIN }]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: SECURITY_HEADERS,
      },
      {
        source: "/admin",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/export/:id",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/ai/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

module.exports = nextConfig;
