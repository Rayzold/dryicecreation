import Link from "next/link";

type Entry = { year: string; title: string; text: string; href?: string };

export function Timeline({ items }: { items: Entry[] }) {
  return (
    <ol className="relative grid gap-0">
      {items.map((e, i) => (
        <li key={e.year + e.title} className="relative grid gap-3 border-t frost-line py-10 sm:grid-cols-[180px_1fr] sm:gap-10">
          <p className="display num text-[2.6rem] leading-none text-glacier-2" style={{ fontVariationSettings: '"SHRP" 100' }}>
            {e.year}
          </p>
          <div>
            <h2 className="heading text-2xl text-frost">{e.title}</h2>
            <p className="mt-3 max-w-[62ch] leading-relaxed text-glacier-2">{e.text}</p>
            {e.href && (
              <Link href={e.href} className="mt-4 inline-block text-ember-2 underline underline-offset-4 hover:text-ember">
                Διάβασε περισσότερα
              </Link>
            )}
          </div>
          {i === items.length - 1 && <span className="sr-only">Τέλος χρονολογίου</span>}
        </li>
      ))}
    </ol>
  );
}
