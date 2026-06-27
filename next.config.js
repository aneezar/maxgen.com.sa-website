/** @type {import('next').NextConfig} */
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
        source: "/admin",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/export/:id",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

module.exports = nextConfig;
