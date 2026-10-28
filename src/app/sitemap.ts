import type { MetadataRoute } from "next";
import { allPages } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return allPages.map((p) => ({
    url: SITE_URL + p.path,
    lastModified: p.modified || p.date || undefined,
    changeFrequency: p.type === "post" ? "yearly" : "monthly",
    priority: p.type === "home" ? 1 : p.type === "post" ? 0.5 : 0.8,
  }));
}
