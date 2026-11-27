import Link from "next/link";
import { business, footerLinks, services, products } from "@/lib/site";
import { Logo } from "./Logo";
import { Icon, socialIcon } from "./Icon";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t frost-line bg-abyss-2">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <address className="mt-6 grid gap-3 text-[0.95rem] not-italic text-glacier-2">
            <a href={business.mapsUrl} target="_blank" rel="noopener" className="flex gap-3 hover:text-frost">
              <Icon name="pin" size={18} className="mt-0.5 shrink-0 text-glacier" />
              <span>
                {business.address.street}
                <br />
                {business.address.area}, <span className="num">{business.address.postalCode}</span>
              </span>
            </a>
            {business.phones.map((p) => (
              <a key={p.tel} href={`tel:${p.tel}`} className="flex gap-3 hover:text-frost">
                <Icon name="phone" size={18} className="mt-0.5 shrink-0 text-glacier" />
                <span className="num">{p.display}</span>
              </a>
            ))}
            <a href={`mailto:${business.email}`} className="flex gap-3 hover:text-frost">
              <Icon name="mail" size={18} className="mt-0.5 shrink-0 text-glacier" />
              {business.email}
            </a>
          </address>
        </div>

        <FooterCol title="Υπηρεσίες" items={services} />
        <FooterCol title="Προϊόντα" items={products.slice(0, 6)} />

        <div>
          <FooterCol title="Χρήσιμα" items={footerLinks.slice(0, 6)} />
          <div className="mt-8">
            <p className="text-sm text-glacier">Ωράριο</p>
            <dl className="mt-3 grid gap-1.5 text-[0.92rem]">
              {business.hours.map((h) => (
                <div key={h.days}>
                  <dt className="text-glacier-2">{h.days}</dt>
                  <dd className="num text-frost">{h.time}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* pb-40: χώρος για τη Χιόνη (κύκλος + κεφάλι ~150px), ώστε στο τέλος της σελίδας να μη σκεπάζει τίποτα. */}
      <div className="border-t frost-line">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-4 pt-6 pb-40 text-sm text-glacier sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <ul className="flex gap-2">
              {business.social.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener"
                    aria-label={s.name}
                    className={`grid size-10 place-items-center rounded-full text-white transition hover:brightness-110 ${brandBg[s.name] ?? "bg-vapor"}`}
                  >
                    <Icon name={socialIcon[s.name]} size={18} />
                  </a>
                </li>
              ))}
            </ul>
            <p>
              © <span className="num">{year}</span> {business.legalName}
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {footerLinks.slice(6).map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-frost">
                  {l.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* Τα social με τα χρώματα των brands τους, για να ξεχωρίζουν· λευκό εικονίδιο (contrast ≥ 4:1). */
const brandBg: Record<string, string> = {
  Facebook: "bg-[#1877F2]",
  YouTube: "bg-[#FF0000]",
  LinkedIn: "bg-[#0A66C2]",
  // Το X είναι μαύρο· το λεπτό περίγραμμα το κρατά ορατό στο σκούρο φόντο.
  "X / Twitter": "bg-black ring-1 ring-white/30",
};

function FooterCol({ title, items }: { title: string; items: { title: string; href: string }[] }) {
  return (
    <div>
      <p className="text-sm text-glacier">{title}</p>
      <ul className="mt-4 grid gap-2.5 text-[0.95rem]">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="text-glacier-2 transition-colors hover:text-frost">
              {i.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
