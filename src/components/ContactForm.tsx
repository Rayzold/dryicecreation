"use client";

import Link from "next/link";
import { useState } from "react";
import { business } from "@/lib/site";
import { Icon } from "./Icon";

// Web3Forms access key (free, tied to the receiving inbox). Set at build time:
// NEXT_PUBLIC_WEB3FORMS_KEY=xxxxxxxx-xxxx-...  — without it the form falls back to the visitor's mail app.
const KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";

type State = "idle" | "sending" | "sent" | "error";

export function ContactForm({ subject = "Νέο μήνυμα από το dryicecreation.gr" }: { subject?: string }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (data.get("botcheck")) return;

    if (!KEY) {
      const body = `Όνομα: ${data.get("name")}\nΕταιρεία: ${data.get("company") || "-"}\nΤηλέφωνο: ${data.get("phone")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`;
      window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setState("sending");
    setError("");
    try {
      data.append("access_key", KEY);
      data.append("subject", subject);
      data.append("from_name", "dryicecreation.gr");
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: data });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "send failed");
      setState("sent");
      form.reset();
    } catch {
      setState("error");
      setError(`Το μήνυμα δεν στάλθηκε. Δοκίμασε ξανά ή κάλεσέ μας στο ${business.phones[0].display}.`);
    }
  }

  if (state === "sent") {
    return (
      <div className="rounded-2xl border frost-line bg-vapor/40 p-8" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-ember text-abyss">
          <Icon name="tick" size={22} strokeWidth={2.2} />
        </span>
        <p className="heading mt-5 text-2xl">Το μήνυμά σου στάλθηκε</p>
        <p className="mt-2 text-glacier-2">Θα σου απαντήσουμε σύντομα, συνήθως μέσα στην ίδια εργάσιμη μέρα.</p>
        <button type="button" onClick={() => setState("idle")} className="mt-6 text-sm text-ember-2 underline underline-offset-4">
          Στείλε νέο μήνυμα
        </button>
      </div>
    );
  }

  const field =
    "w-full rounded-xl border frost-line bg-abyss/60 px-4 py-3 text-frost placeholder:text-glacier/60 transition focus:border-ember focus:outline-none focus:ring-2 focus:ring-ember/30";

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate={false}>
      <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" />
      <label className="grid gap-1.5 text-sm text-glacier-2">
        Όνομα
        <input required name="name" autoComplete="name" className={field} />
      </label>
      <label className="grid gap-1.5 text-sm text-glacier-2">
        Εταιρεία <span className="sr-only">(προαιρετικό)</span>
        <input name="company" autoComplete="organization" className={field} placeholder="Προαιρετικό" />
      </label>
      <label className="grid gap-1.5 text-sm text-glacier-2">
        Email
        <input required type="email" name="email" autoComplete="email" className={field} />
      </label>
      <label className="grid gap-1.5 text-sm text-glacier-2">
        Τηλέφωνο
        <input required type="tel" name="phone" autoComplete="tel" className={field} />
      </label>
      <label className="grid gap-1.5 text-sm text-glacier-2 sm:col-span-2">
        Μήνυμα
        <textarea
          required
          name="message"
          rows={5}
          className={`${field} resize-y`}
          placeholder="Τι χρειάζεσαι; Π.χ. ποσότητα, μορφή (pellets ή block), ημερομηνία και περιοχή παράδοσης."
        />
      </label>
      <label className="flex items-start gap-3 text-sm text-glacier sm:col-span-2">
        <input required type="checkbox" name="consent" className="mt-1 size-4 accent-[var(--color-ember)]" />
        <span>
          Συμφωνώ με τη φύλαξη και διαχείριση των στοιχείων μου για να επικοινωνήσετε μαζί μου, σύμφωνα με την{" "}
          <Link href="/privacy-policy/" className="text-glacier-2 underline underline-offset-4 hover:text-frost">
            πολιτική απορρήτου
          </Link>
          .
        </span>
      </label>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3.5 font-medium text-abyss transition hover:bg-ember-2 disabled:opacity-60"
        >
          {state === "sending" ? "Αποστολή…" : "Αποστολή μηνύματος"}
        </button>
        {state === "error" && (
          <p className="text-sm text-ember-2" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
