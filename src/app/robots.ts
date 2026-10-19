import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/login", "/reset-password", "/api/"] },
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
