import Link from "next/link";
import { asset } from "@/lib/asset";
import { SITE_URL } from "@/lib/site";

export type Crumb = { label: string; href?: string };

export function PageHero({
  title,
  lead,
  crumbs,
  image,
  meta,
}: {
  title: string;
  lead?: string;
  crumbs: Crumb[];
  image?: string | null;
  meta?: React.ReactNode;
}) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ label: "Αρχική", href: "/" }, ...crumbs].map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: SITE_URL + c.href } : {}),
    })),
  };
  return (
    <section className="relative isolate overflow-hidden border-b frost-line pt-[72px]">
      <div className="fog-static absolute inset-0 -z-10" aria-hidden="true" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className={`mx-auto grid max-w-[1320px] gap-10 px-4 pb-14 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8 ${image ? "lg:grid-cols-[1.15fr_0.85fr] lg:items-end" : ""}`}>
        <div>
          <nav aria-label="Διαδρομή">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-glacier">
              <li>
                <Link href="/" className="hover:text-frost">
                  Αρχική
                </Link>
              </li>
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-glacier/50">
                    /
                  </span>
                  {c.href && i < crumbs.length - 1 ? (
                    <Link href={c.href} className="hover:text-frost">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current={i === crumbs.length - 1 ? "page" : undefined} className="text-glacier-2">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <h1 className="display mt-6 max-w-[20ch] text-[2.4rem] text-frost sm:text-[3.4rem] lg:text-[4rem]">{title}</h1>
          {meta && <div className="mt-5 text-glacier">{meta}</div>}
          {lead && <p className="mt-6 max-w-[58ch] text-[1.1rem] leading-relaxed text-glacier-2">{lead}</p>}
        </div>
        {image && (
          <div className="overflow-hidden rounded-[28px] border frost-line">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(image)} alt="" className="aspect-[4/3] w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}
