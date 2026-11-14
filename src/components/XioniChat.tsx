"use client";

import { useEffect, useRef, useState } from "react";
import { business } from "@/lib/site";
import { Icon } from "./Icon";

// Η Χιόνη: παράθυρο κουβέντας κάτω δεξιά. Εμφανίζεται μόνο αν οριστεί στο build
// NEXT_PUBLIC_XIONI_URL=https://xioni-dryicecreation.<account>.workers.dev
const URL_ = process.env.NEXT_PUBLIC_XIONI_URL || "";

type Turn = { role: "user" | "assistant"; text: string };
type Quote = Record<string, string | number>;

const GREETING: Turn = {
  role: "assistant",
  text: "Γεια σας, είμαι η Χιόνη! Μπορώ να σας βοηθήσω με μια προσφορά ή να υπολογίσουμε πόσο ξηρό πάγο χρειάζεστε.",
};

export function XioniChat() {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<Turn[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, quote]);

  if (!URL_) return null;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim().slice(0, 1500);
    if (!text || busy) return;
    const next: Turn[] = [...turns, { role: "user", text }];
    setTurns(next);
    setInput("");
    setBusy(true);
    try {
      // Ο χαιρετισμός είναι μόνο της σελίδας· στο API στέλνουμε από το πρώτο μήνυμα του πελάτη.
      const history = next.slice(1).slice(-30);
      const res = await fetch(`${URL_}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      setTurns((t) => [...t, { role: "assistant", text: String(data.reply || "") }]);
      if (data.quote) setQuote(data.quote);
    } catch {
      setTurns((t) => [
        ...t,
        { role: "assistant", text: `Δεν μπόρεσα να συνδεθώ. Καλέστε μας στο ${business.phones[0].display}.` },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {open && (
        <section
          aria-label="Χιόνη, η ψηφιακή βοηθός"
          className="flex h-[min(560px,75dvh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border frost-line bg-abyss-2 shadow-2xl"
        >
          <header className="flex items-center justify-between border-b frost-line bg-vapor/60 px-4 py-3">
            <div>
              <p className="heading text-lg leading-tight">Χιόνη</p>
              <p className="text-xs text-glacier">Ψηφιακή βοηθός · απαντά όλο το 24ωρο</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Κλείσιμο" className="rounded-full p-2 text-glacier-2 hover:bg-vapor-2">
              <Icon name="close" size={18} />
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {turns.map((t, i) => (
              <p
                key={i}
                className={
                  t.role === "user"
                    ? "ml-8 rounded-2xl rounded-br-sm bg-ember px-3 py-2 text-sm text-abyss"
                    : "mr-8 rounded-2xl rounded-bl-sm bg-vapor px-3 py-2 text-sm text-frost"
                }
              >
                {t.text}
              </p>
            ))}
            {busy && <p className="mr-8 w-fit rounded-2xl bg-vapor px-3 py-2 text-sm text-glacier">Η Χιόνη γράφει…</p>}
            {quote && (
              <div className="rounded-xl border frost-line bg-vapor/40 p-3 text-sm" role="status">
                <p className="flex items-center gap-2 font-semibold text-frost">
                  <Icon name="tick" size={16} /> Το αίτημα καταχωρήθηκε
                </p>
                <p className="mt-1 text-glacier-2">Κωδικός: {String(quote.ref)}</p>
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t frost-line p-3">
            <label htmlFor="xioni-input" className="sr-only">Μήνυμα προς τη Χιόνη</label>
            <input
              id="xioni-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1500}
              placeholder="Γράψτε εδώ…"
              className="min-w-0 flex-1 rounded-full border frost-line bg-abyss px-4 py-2 text-sm text-frost placeholder:text-glacier/70 focus:outline-2 focus:outline-ember"
            />
            <button type="submit" disabled={busy || !input.trim()} className="rounded-full bg-ember px-4 text-sm font-semibold text-abyss disabled:opacity-50">
              Αποστολή
            </button>
          </form>
          <p className="px-4 pb-2 text-[10px] text-glacier/80">
            Η Χιόνη είναι βοηθός τεχνητής νοημοσύνης. Οι τιμές είναι ενδεικτικές. Μην γράφετε ευαίσθητα προσωπικά στοιχεία.
          </p>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-ember px-5 py-3 font-semibold text-abyss shadow-xl hover:bg-ember-2"
      >
        <Icon name={open ? "close" : "mail"} size={18} />
        {open ? "Κλείσιμο" : "Ρωτήστε τη Χιόνη"}
      </button>
    </div>
  );
}
