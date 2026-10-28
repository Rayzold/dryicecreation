"use client";

import Link from "next/link";
import { useState } from "react";
import type { Item } from "@/lib/site";
import { asset } from "@/lib/asset";
import { Icon } from "../Icon";

// Editorial list of services; the photo pane follows hover / keyboard focus.
export function ServiceIndex({ items }: { items: Item[] }) {
  const [active, setActive] = useState(0);
  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
      <ul className="border-t frost-line">
        {items.map((s, i) => (
          <li key={s.href} className="border-b frost-line">
            <Link
              href={s.href}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className="group grid grid-cols-[1fr_auto] items-start gap-x-6 gap-y-2 py-7"
            >
              <span>
                <span className={`heading block text-[1.6rem] transition-colors duration-300 sm:text-[1.9rem] ${active === i ? "text-frost" : "text-glacier-2"}`}>
                  {s.title}
                </span>
                <span className="mt-2 block max-w-[52ch] text-[0.98rem] leading-relaxed text-glacier">{s.short}</span>
                {s.tags && <span className="mt-3 block text-sm text-glacier/80">{s.tags}</span>}
              </span>
              <span
                className={`mt-1.5 grid size-11 place-items-center rounded-full border transition-all duration-300 ${
                  active === i ? "border-ember bg-ember text-abyss" : "frost-line text-glacier"
                }`}
              >
                <Icon name="arrow" size={18} />
              </span>
              {/* Mobile: inline photo */}
              {s.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset(s.image)} alt="" loading="lazy" className="col-span-2 mt-3 aspect-[16/9] w-full rounded-2xl object-cover lg:hidden" />
              )}
            </Link>
          </li>
        ))}
      </ul>
      <div className="relative hidden lg:block">
        <div className="sticky top-28 aspect-[4/5] overflow-hidden rounded-[28px] border frost-line">
          {items.map((s, i) =>
            s.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={s.href}
                src={asset(s.image)}
                alt={s.title}
                loading={i === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 size-full object-cover transition-all duration-700 ease-out-ice ${
                  active === i ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              />
            ) : null
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-abyss/70 via-transparent to-transparent" />
          <p className="absolute bottom-5 left-6 right-6 text-sm text-frost/90">{items[active].title}</p>
        </div>
      </div>
    </div>
  );
}
