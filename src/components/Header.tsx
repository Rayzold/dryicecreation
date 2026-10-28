"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, business, type Item, type NavGroup } from "@/lib/site";
import { asset } from "@/lib/asset";
import { Logo } from "./Logo";
import { Icon } from "./Icon";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (adjust state during render, no effect needed)
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(null);
    setMobile(false);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setMobile(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = mobile ? "hidden" : "";
  }, [mobile]);

  const enter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(label);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setOpen(null), 160);
  };

  const solid = scrolled || open !== null;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-ember focus:px-4 focus:py-2 focus:text-abyss">
        Μετάβαση στο περιεχόμενο
      </a>
      <div
        ref={barRef}
        className={`transition-[background-color,backdrop-filter,border-color] duration-500 border-b ${
          solid ? "bg-abyss/80 backdrop-blur-xl frost-line" : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Logo />

          <nav aria-label="Κύρια πλοήγηση" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {nav.map((g) => (
                <li key={g.label} className="relative" onMouseEnter={() => (g.href ? null : enter(g.label))} onMouseLeave={leave}>
                  {g.href ? (
                    <Link
                      href={g.href}
                      className={`block rounded-full px-3.5 py-2 text-[0.92rem] transition-colors hover:text-frost ${
                        pathname === g.href ? "text-frost" : "text-glacier-2"
                      }`}
                    >
                      {g.label}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        aria-expanded={open === g.label}
                        aria-controls={`menu-${g.label}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpen(open === g.label ? null : g.label);
                        }}
                        className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[0.92rem] transition-colors hover:text-frost ${
                          open === g.label ? "text-frost" : "text-glacier-2"
                        }`}
                      >
                        {g.label}
                        <Icon name="down" size={14} className={`transition-transform duration-300 ${open === g.label ? "rotate-180" : ""}`} />
                      </button>
                      <MegaPanel group={g} open={open === g.label} />
                    </>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <a
            href={`tel:${business.phones[0].tel}`}
            className="ml-auto hidden items-center gap-2 rounded-full bg-ember px-4 py-2.5 text-[0.92rem] font-medium text-abyss transition hover:bg-ember-2 sm:flex lg:ml-2"
          >
            <Icon name="phone" size={17} strokeWidth={2} />
            <span className="num">{business.phones[0].display}</span>
          </a>

          <div className="ml-auto flex items-center gap-2 sm:ml-0 lg:hidden">
            <a href={`tel:${business.phones[0].tel}`} className="grid size-11 place-items-center rounded-full bg-ember text-abyss sm:hidden" aria-label="Κλήση">
              <Icon name="phone" size={19} strokeWidth={2} />
            </a>
            <button
              type="button"
              onClick={() => setMobile(true)}
              className="grid size-11 place-items-center rounded-full border frost-line text-frost"
              aria-label="Άνοιγμα μενού"
              aria-expanded={mobile}
            >
              <Icon name="menu" size={20} />
            </button>
          </div>
        </div>
      </div>

      <MobileMenu open={mobile} onClose={() => setMobile(false)} pathname={pathname} />
    </header>
  );
}

function MegaPanel({ group, open }: { group: NavGroup; open: boolean }) {
  const withImages = group.label === "Προϊόντα" || group.label === "Υπηρεσίες";
  const wide = group.groups || withImages;
  return (
    <div
      id={`menu-${group.label}`}
      className={`absolute top-full pt-3 transition-all duration-300 ease-out-ice ${
        wide ? "left-1/2 -translate-x-1/2" : "left-0"
      } ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
    >
      <div
        className={`rounded-2xl border frost-line bg-abyss-2 p-3 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl ${
          group.groups ? "w-[640px]" : withImages ? (group.items!.length > 6 ? "w-[760px]" : "w-[620px]") : "w-[280px]"
        }`}
      >
        {group.groups ? (
          <div className="grid grid-cols-[1fr_1.35fr] gap-2">
            {group.groups.map((sub) => (
              <div key={sub.label} className="p-2">
                <p className="px-3 pb-2 text-xs text-glacier">{sub.label}</p>
                <ul>
                  {sub.items.map((it) => (
                    <li key={it.href}>
                      <PanelLink item={it} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : withImages ? (
          <ul className={`grid gap-1 ${group.items!.length > 6 ? "grid-cols-3" : "grid-cols-2"}`}>
            {group.items!.map((it) => (
              <li key={it.href}>
                <Link href={it.href} className="group/item flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-vapor/70">
                  {it.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={asset(it.image)} alt="" loading="lazy" className="size-12 shrink-0 rounded-lg object-cover opacity-85 transition group-hover/item:opacity-100" />
                  )}
                  <span className="text-[0.9rem] leading-snug text-glacier-2 group-hover/item:text-frost">{it.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <ul>
            {group.items!.map((it) => (
              <li key={it.href}>
                <PanelLink item={it} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PanelLink({ item }: { item: Item }) {
  return (
    <Link href={item.href} className="block rounded-lg px-3 py-2 text-[0.92rem] text-glacier-2 transition-colors hover:bg-vapor/70 hover:text-frost">
      {item.title}
    </Link>
  );
}

function MobileMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <div
      className={`fixed inset-0 z-[55] lg:hidden ${open ? "visible" : "invisible"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Μενού"
    >
      <div className={`absolute inset-0 bg-abyss/70 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        className={`absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-abyss-2 transition-transform duration-500 ease-out-ice ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-[72px] items-center justify-between border-b frost-line px-4">
          <Logo />
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full border frost-line" aria-label="Κλείσιμο μενού">
            <Icon name="close" size={20} />
          </button>
        </div>
        <nav aria-label="Κύρια πλοήγηση" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="divide-y divide-vapor">
            {nav.map((g) => {
              const items = g.groups ? g.groups.flatMap((s) => s.items) : g.items;
              if (g.href)
                return (
                  <li key={g.label}>
                    <Link href={g.href} className={`block py-4 text-lg ${pathname === g.href ? "text-ember" : "text-frost"}`}>
                      {g.label}
                    </Link>
                  </li>
                );
              const isOpen = expanded === g.label;
              return (
                <li key={g.label}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-4 text-left text-lg text-frost"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : g.label)}
                  >
                    {g.label}
                    <Icon name="down" size={18} className={`text-glacier transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-400 ease-out-ice ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <ul className="overflow-hidden">
                      {items!.map((it) => (
                        <li key={it.href}>
                          <Link href={it.href} className={`block py-2.5 pl-3 text-[0.98rem] ${pathname === it.href ? "text-ember" : "text-glacier-2"}`}>
                            {it.title}
                          </Link>
                        </li>
                      ))}
                      <li className="h-3" />
                    </ul>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t frost-line p-4">
          <a href={`tel:${business.phones[0].tel}`} className="flex items-center justify-center gap-2 rounded-full bg-ember py-3.5 font-medium text-abyss">
            <Icon name="phone" size={18} strokeWidth={2} />
            Κάλεσε <span className="num">{business.phones[0].display}</span>
          </a>
          <p className="mt-3 text-center text-sm text-glacier">
            {business.hours[0].days}: <span className="num">{business.hours[0].time}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
