import type { ReactNode } from "react";

export function Section({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <section id={id} className={`scroll-mt-24 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">{children}</div>
    </section>
  );
}

export function SectionHead({ title, intro, aside }: { title: string; intro?: ReactNode; aside?: ReactNode }) {
  return (
    <div className="mb-12 flex flex-col gap-6 sm:mb-16 md:flex-row md:items-end md:justify-between">
      <div className="max-w-[46rem]">
        <h2 className="display text-[2.2rem] text-frost sm:text-[3.1rem]">{title}</h2>
        {intro && <p className="mt-5 max-w-[60ch] text-[1.08rem] leading-relaxed text-glacier-2">{intro}</p>}
      </div>
      {aside}
    </div>
  );
}
