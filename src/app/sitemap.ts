import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { getPolicies, getPublishedCourses, getPublishedNews } from "@/server/public-data";

/** Public, published pages only. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [courses, news, policies] = await Promise.all([getPublishedCourses(), getPublishedNews(), getPolicies()]);
  const statics = ["", "/courses", "/admissions", "/about", "/corporate-training", "/news", "/contact", "/policies"];
  return [
    ...statics.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...courses.map((c) => ({ url: `${base}/courses/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...news.map((n) => ({ url: `${base}/news/${n.slug}`, lastModified: n.publishedAt ?? undefined, priority: 0.5 })),
    ...policies.map((p) => ({ url: `${base}/policies/${p.slug}`, priority: 0.3 })),
  ];
}
