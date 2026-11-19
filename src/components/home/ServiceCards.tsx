import Link from "next/link";
import type { Item } from "@/lib/site";
import { asset } from "@/lib/asset";
import { Icon } from "@/components/Icon";

/** «Τι σου προσφέρουμε»: κάρτες με εικόνα και ένα κλικ. Η πρώτη κάρτα είναι μεγαλύτερη. */
export function ServiceCards({ items }: { items: Item[] }) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
      {items.map((s, n) => (
        <li key={s.href} className={`min-w-0 ${n === 0 ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}`}>
          <Link
            href={s.href}
            className={`group relative block h-full overflow-hidden rounded-[24px] border frost-line ${n === 0 ? "aspect-[16/11] lg:aspect-auto lg:min-h-[34rem]" : "aspect-[16/11]"}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset(s.image ?? "")} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-ice group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <h3 className={`heading text-frost ${n === 0 ? "text-[1.9rem]" : "text-2xl"}`}>{s.title}</h3>
              {s.tags && <p className="mt-2 text-sm text-glacier-2">{s.tags}</p>}
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm text-ember-2">
                Δες περισσότερα <Icon name="arrow" size={15} />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
