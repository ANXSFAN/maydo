import type { MetadataRoute } from "next";

const BASE_URL = "https://sushimaydo.es";
const LOCALES = ["es", "en", "ca", "zh"];

const PAGES = [
  { path: "", priority: 1, changeFrequency: "weekly" as const },
  { path: "/pedido", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/reservas", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/galeria", priority: 0.6, changeFrequency: "monthly" as const },
  { path: "/sobre", priority: 0.5, changeFrequency: "monthly" as const },
  { path: "/contacto", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/eventos", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/privacidad", priority: 0.2, changeFrequency: "yearly" as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of PAGES) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: new Date(),
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }
  }

  return entries;
}
