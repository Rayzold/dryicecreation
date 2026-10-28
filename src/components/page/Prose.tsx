import { withBase } from "@/lib/asset";

export function Prose({ html, className = "" }: { html: string; className?: string }) {
  return <div className={`prose-ice ${className}`} dangerouslySetInnerHTML={{ __html: withBase(html) }} />;
}
