import pages from "@/content/pages.json";

export type Page = {
  path: string;
  type: "home" | "page" | "post";
  title: string;
  seoTitle: string;
  description: string;
  ogImage: string | null;
  featured: string | null;
  date: string | null;
  modified: string | null;
  categories: string[];
  heroText: string;
  images: { src: string; alt: string }[];
  videos: string[];
  html: string;
  words: number;
  faq?: { q: string; a: string }[];
  timeline?: { year: string; title: string; text: string }[];
  gallery?: { src: string; alt: string; w: number; h: number; kind: "image" | "youtube" | "mp4"; href: string }[];
};

const all = pages as Page[];
const HIDDEN = new Set(["/test-2/"]);

export const allPages = all.filter((p) => !HIDDEN.has(p.path));

export function getPage(path: string): Page | undefined {
  return allPages.find((p) => p.path === path);
}

export const posts = allPages
  .filter((p) => p.type === "post")
  .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

export function postImage(p: Page): string | null {
  return p.featured || p.ogImage || p.images[0]?.src || null;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("el-GR", { day: "numeric", month: "long", year: "numeric" });
}

// WordPress titles sometimes keep typographic quirks; normalise for display.
export function cleanTitle(t: string): string {
  return t.replace(/^[‘']Ο/u, "Ό").replace(/\s+\|\s+.*$/, "").trim();
}
