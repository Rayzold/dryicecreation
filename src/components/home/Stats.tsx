"use client";

import CountUp from "@/components/reactbits/CountUp";

export function Stats({ items }: { items: { value: number; suffix: string; label: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
      {items.map((s) => (
        <div key={s.label} className="border-t frost-line pt-5">
          <dt className="sr-only">{s.label}</dt>
          <dd className="display num text-[2.6rem] text-frost sm:text-[3.4rem]">
            <CountUp to={s.value} separator="." duration={2.2} trigger="view" />
            <span className="text-ember">{s.suffix}</span>
          </dd>
          <dd className="mt-2 text-[0.95rem] text-glacier" aria-hidden="true">
            {s.label}
          </dd>
        </div>
      ))}
    </dl>
  );
}
