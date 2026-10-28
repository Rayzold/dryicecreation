import Link from "next/link";
import { business, type Item } from "@/lib/site";
import { Icon } from "../Icon";

export function Sidebar({ current, section }: { current: string; section: { label: string; items: Item[] } | null }) {
  return (
    <aside className="grid content-start gap-6 lg:sticky lg:top-28">
      {section && (
        <nav aria-label={section.label} className="rounded-2xl border frost-line bg-abyss-2/60 p-5">
          <p className="px-2 text-sm text-glacier">{section.label}</p>
          <ul className="mt-2">
            {section.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  aria-current={it.href === current ? "page" : undefined}
                  className={`flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-[0.95rem] transition-colors ${
                    it.href === current ? "bg-vapor text-frost" : "text-glacier-2 hover:bg-vapor/50 hover:text-frost"
                  }`}
                >
                  {it.title}
                  {it.href === current && <span className="size-1.5 shrink-0 rounded-full bg-ember" />}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <div className="rounded-2xl border border-ember/40 bg-ember/[0.07] p-6">
        <p className="heading text-xl text-frost">Χρειάζεσαι προσφορά;</p>
        <p className="mt-2 text-[0.95rem] text-glacier-2">Πες μας ποσότητα, μορφή και πού πρέπει να φτάσει.</p>
        <a href={`tel:${business.phones[0].tel}`} className="mt-5 flex items-center justify-center gap-2 rounded-full bg-ember py-3 font-medium text-abyss transition hover:bg-ember-2">
          <Icon name="phone" size={17} strokeWidth={2} />
          <span className="num">{business.phones[0].display}</span>
        </a>
        <a href="#epikoinonia" className="mt-2 flex items-center justify-center gap-2 rounded-full border frost-line py-3 text-frost transition hover:border-glacier/60">
          Στείλε μήνυμα
        </a>
      </div>
    </aside>
  );
}
