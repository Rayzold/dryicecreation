// Prefix static asset paths with the deploy basePath (needed for raw <img>/<video>,
// next/link handles routes on its own).
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path: string | null | undefined): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path;
  return BASE + encodeURI(decodeURI(path));
}

// Rewrites root-relative src/href inside migrated HTML.
export function withBase(html: string): string {
  if (!BASE) return html;
  return html.replace(/(src|href)="\/(?!\/)/g, `$1="${BASE}/`);
}
