import { getProducts, getServices } from "@/lib/db";
import { SITE_URL } from "@/lib/constants";

export default async function sitemap() {
  const products = await getProducts();
  const services = await getServices();

  const staticRoutes = [
    "", "/shop", "/verticals", "/about", "/customers", "/partners", "/career", "/contact",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const productRoutes = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const serviceRoutes = services.map((s) => ({
    url: `${SITE_URL}/verticals/${s.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes, ...serviceRoutes];
}
