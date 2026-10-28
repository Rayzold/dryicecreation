import { withBase } from "@/lib/asset";
import { Icon } from "../Icon";

export function Faq({ items }: { items: { q: string; a: string }[] }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() },
    })),
  };
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="border-t frost-line">
        {items.map((i, n) => (
          <details key={i.q} className="group border-b frost-line" open={n === 0}>
            <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
              <h2 className="heading text-[1.25rem] text-frost sm:text-[1.45rem]">{i.q}</h2>
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border frost-line text-glacier transition-transform duration-300 group-open:rotate-180 group-open:border-ember group-open:text-ember">
                <Icon name="down" size={17} />
              </span>
            </summary>
            <div className="prose-ice pb-8" dangerouslySetInnerHTML={{ __html: withBase(i.a) }} />
          </details>
        ))}
      </div>
    </div>
  );
}
