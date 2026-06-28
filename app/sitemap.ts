import type { MetadataRoute } from "next";
import { getProducts, getServices, getPosts } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, services, posts] = await Promise.allSettled([
    getProducts(),
    getServices(),
    getPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`,           changeFrequency: "daily",   priority: 1.0 },
    { url: `${SITE_URL}/shop`,      changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/verticals`, changeFrequency: "weekly",  priority: 0.85 },
    { url: `${SITE_URL}/ai-tools`,  changeFrequency: "weekly",  priority: 0.8 },
    { url: `${SITE_URL}/blog`,      changeFrequency: "daily",   priority: 0.85 },
    { url: `${SITE_URL}/about`,     changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`,   changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/career`,    changeFrequency: "weekly",  priority: 0.7 },
    { url: `${SITE_URL}/customers`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/partners`,  changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/my-quotes`, changeFrequency: "never",   priority: 0.3 },
  ].map((r) => ({ ...r, lastModified: new Date() }));

  const p = products.status === "fulfilled" ? products.value : [];
  const s = services.status === "fulfilled" ? services.value : [];
  const b = posts.status    === "fulfilled" ? posts.value    : [];

  return [
    ...staticRoutes,
    ...p.map((item: { id: string; updated_at?: string }) => ({
      url: `${SITE_URL}/shop/${item.id}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.65,
    })),
    ...s.map((item: { slug: string; updated_at?: string }) => ({
      url: `${SITE_URL}/verticals/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...b.map((item: { slug: string; updated_at?: string }) => ({
      url: `${SITE_URL}/blog/${item.slug}`,
      lastModified: item.updated_at ? new Date(item.updated_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
  ];
}
