import { getProducts, getServices, getPosts } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap() {
  const [products, services, posts] = await Promise.all([
    getProducts(),
    getServices(),
    getPosts(),
  ]);

  const staticRoutes = [
    "", "/shop", "/verticals", "/about", "/customers", "/partners", "/career", "/contact", "/blog",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" || path === "/blog" ? "daily" : "weekly",
    priority: path === "" ? 1 : path === "/blog" ? 0.9 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${SITE_URL}/verticals/${s.slug}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  return [...staticRoutes, ...productRoutes, ...serviceRoutes, ...postRoutes];
}
