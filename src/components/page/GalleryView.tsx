"use client";

import Masonry from "@/components/reactbits/Masonry";
import { asset } from "@/lib/asset";
import type { Page } from "@/lib/content";
import { Icon } from "../Icon";

type G = NonNullable<Page["gallery"]>[number];

export function GalleryView({ items }: { items: G[] }) {
  const photos = items.filter((i) => i.kind === "image");
  const videos = items.filter((i) => i.kind !== "image");
  return (
    <div className="grid gap-20">
      <div>
        <h2 className="display text-[2rem] text-frost sm:text-[2.6rem]">Φωτογραφίες</h2>
        <div className="mt-8">
          <Masonry
            items={photos.map((p, i) => ({ id: i, img: asset(p.src), width: p.w, height: p.h, alt: p.alt, title: p.alt }))}
            columns="auto"
            columnWidth={340}
            gap={16}
            radius={20}
            animateFrom="bottom"
            hoverEffect="zoom"
            captions="hover"
            lightbox
            revealOnScroll
          />
        </div>
      </div>
      <div>
        <h2 className="display text-[2rem] text-frost sm:text-[2.6rem]">Βίντεο</h2>
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <li key={v.href}>
              <a
                href={v.kind === "mp4" ? asset(v.href) : v.href}
                target="_blank"
                rel="noopener"
                className="group relative block aspect-video overflow-hidden rounded-[20px] border frost-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset(v.src)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-ice group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-abyss/90 via-abyss/20 to-transparent" />
                <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-frost/90 text-abyss transition group-hover:scale-110 group-hover:bg-ember">
                  <Icon name="play" size={24} strokeWidth={2} />
                </span>
                <span className="absolute inset-x-0 bottom-0 p-4 text-sm text-frost">
                  {v.alt}
                  <span className="block text-xs text-glacier">{v.kind === "youtube" ? "Ανοίγει στο YouTube" : "Βίντεο"}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
