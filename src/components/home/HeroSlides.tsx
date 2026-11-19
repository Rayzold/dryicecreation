"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { Icon } from "@/components/Icon";

export type Slide = { title: string; line: string; href: string; image: string };

/** Εναλλασσόμενες κάρτες υπηρεσιών στο hero, στο πνεύμα του παλιού slider: μία εικόνα, ένας τίτλος, μία γραμμή, ένα κουμπί. */
export function HeroSlides({ slides, interval = 6000 }: { slides: Slide[]; interval?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % slides.length), interval);
    return () => window.clearInterval(t);
  }, [paused, slides.length, interval]);

  return (
    <section
      className="relative isolate flex min-h-[min(88svh,52rem)] items-end overflow-hidden pb-12 pt-32 sm:pb-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Οι υπηρεσίες μας"
    >
      {slides.map((s, n) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={s.href}
          src={asset(s.image)}
          alt=""
          fetchPriority={n === 0 ? "high" : "low"}
          loading={n === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 -z-20 size-full object-cover transition-opacity duration-1000 ease-out-ice motion-reduce:transition-none ${
            n === i ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-abyss via-abyss/65 to-abyss/25" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="min-h-[13rem] sm:min-h-[12rem]" aria-live="polite">
          <p className="text-sm uppercase tracking-[0.18em] text-ember-2">Dry Ice Creation</p>
          <h1 className="display mt-3 max-w-[18ch] text-[2.5rem] leading-[1.05] text-frost sm:text-[4rem]">{slides[i].title}</h1>
          <p className="mt-4 max-w-[46ch] text-[1.1rem] text-glacier-2 sm:text-[1.25rem]">{slides[i].line}</p>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href={slides[i].href}
            className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-4 font-medium text-abyss transition hover:bg-ember-2"
          >
            Μάθε περισσότερα <Icon name="arrow" size={17} strokeWidth={2} />
          </Link>
          <div className="ml-1 flex items-center gap-2" role="tablist" aria-label="Επιλογή υπηρεσίας">
            {slides.map((s, n) => (
              <button
                key={s.href}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={s.title}
                onClick={() => setI(n)}
                className={`h-2.5 rounded-full transition-all ${n === i ? "w-8 bg-ember" : "w-2.5 bg-frost/40 hover:bg-frost/70"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
