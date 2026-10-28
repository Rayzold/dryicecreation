import Link from "next/link";
import { business } from "@/lib/site";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden pt-[72px]">
      <div className="fog-static absolute inset-0 -z-10" aria-hidden="true" />
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <p className="display num text-[5rem] leading-none text-glacier-2/60 sm:text-[8rem]">404</p>
        <h1 className="display mt-4 max-w-[18ch] text-[2.4rem] text-frost sm:text-[3.4rem]">Αυτή η σελίδα εξαχνώθηκε</h1>
        <p className="mt-5 max-w-[50ch] text-[1.08rem] text-glacier-2">
          Ο σύνδεσμος που ακολούθησες δεν υπάρχει πια. Δοκίμασε από την αρχική ή πάρε μας τηλέφωνο στο{" "}
          <a href={`tel:${business.phones[0].tel}`} className="num text-frost underline underline-offset-4">
            {business.phones[0].display}
          </a>
          .
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/" className="rounded-full bg-ember px-6 py-3.5 font-medium text-abyss transition hover:bg-ember-2">
            Πήγαινε στην αρχική
          </Link>
          <Link href="/sychnes-erotisis/" className="rounded-full border frost-line px-6 py-3.5 text-frost transition hover:border-glacier/60">
            Συχνές ερωτήσεις
          </Link>
        </div>
      </div>
    </section>
  );
}
