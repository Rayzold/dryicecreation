import Link from "next/link";
import { asset } from "@/lib/asset";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group flex items-center gap-3 rounded-full" aria-label="Dry Ice Creation, αρχική σελίδα">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={asset("/media/2017/09/Dry-Ice-Creation-Penguin-Orange-transparent.png")}
        alt=""
        width={40}
        height={40}
        className="size-10 shrink-0 transition-transform duration-500 ease-out-ice group-hover:-rotate-6"
      />
      {!compact && (
        <span className="leading-none">
          <span className="heading block text-[1.05rem] text-frost">Dry Ice Creation</span>
          <span className="mt-1 block text-[0.7rem] tracking-wide text-glacier">Ξηρός πάγος από το 2013</span>
        </span>
      )}
    </Link>
  );
}
