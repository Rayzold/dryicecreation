import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // Preview builds (served from a sub-path) must not be indexed, or they'd compete with the live domain.
  const preview = Boolean(process.env.NEXT_PUBLIC_BASE_PATH);
  return {
    rules: preview ? { userAgent: "*", disallow: "/" } : { userAgent: "*", allow: "/" },
    sitemap: preview ? undefined : `${SITE_URL}/sitemap.xml`,
  };
}
