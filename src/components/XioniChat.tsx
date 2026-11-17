"use client";

import { useEffect, useRef, useState } from "react";
import { business } from "@/lib/site";
import { asset } from "@/lib/asset";
import { Icon } from "./Icon";
import { useXioniVoice } from "./useXioniVoice";

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
  const voice = useXioniVoice();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, quote, voice.interim]);

  if (!URL_) return null;

  function send(e: React.FormEvent) {
    e.preventDefault();
    void sendText(input);
  }

  function close() {
    voice.stopListening();
    voice.stopSpeaking();
    setOpen(false);
  }

  // spoken: ήρθε από το μικρόφωνο, άρα η απάντηση ακούγεται ακόμα κι αν το state της φωνής δεν έχει ενημερωθεί.
  async function sendText(raw: string, spoken = false) {
    const text = raw.trim().slice(0, 1500);
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
      const reply = String(data.reply || "");
      setTurns((t) => [...t, { role: "assistant", text: reply }]);
      if (spoken || voice.voiceOn) voice.speak(reply);
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
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
              <img src={asset("/xioni-avatar.webp")} alt="" width={40} height={40} className="size-10 rounded-full ring-2 ring-ember" />
              <div>
                <p className="heading text-lg leading-tight">Χιόνη</p>
                <p className="text-xs text-glacier">Ψηφιακή βοηθός · απαντά όλο το 24ωρο</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {voice.canSpeak && (
                <button
                  type="button"
                  onClick={() => {
                    if (voice.voiceOn) voice.stopSpeaking();
                    else voice.unlockAudio();
                    voice.setVoiceOn(!voice.voiceOn);
                  }}
                  aria-pressed={voice.voiceOn}
                  aria-label={voice.voiceOn ? "Η Χιόνη μιλάει: πατήστε για σίγαση" : "Να διαβάζει η Χιόνη τις απαντήσεις φωναχτά"}
                  title={voice.voiceOn ? "Σίγαση" : "Φωνή"}
                  className={`rounded-full p-2 hover:bg-vapor-2 ${voice.voiceOn ? "text-ember" : "text-glacier-2"}`}
                >
                  <Icon name={voice.voiceOn ? "volume" : "mute"} size={18} />
                </button>
              )}
              <button type="button" onClick={close} aria-label="Κλείσιμο" className="rounded-full p-2 text-glacier-2 hover:bg-vapor-2">
                <Icon name="close" size={18} />
              </button>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {turns.map((t, i) =>
              t.role === "user" ? (
                <p key={i} className="ml-8 rounded-2xl rounded-br-sm bg-ember px-3 py-2 text-sm text-abyss">
                  {t.text}
                </p>
              ) : (
                <div key={i} className="mr-6 flex items-end gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
                  <img src={asset("/xioni-avatar.webp")} alt="" width={24} height={24} className="size-6 shrink-0 rounded-full" />
                  <p className="min-w-0 rounded-2xl rounded-bl-sm bg-vapor px-3 py-2 text-sm text-frost">{t.text}</p>
                </div>
              ),
            )}
            {voice.listening && (
              <p className="ml-8 rounded-2xl rounded-br-sm border border-ember/60 px-3 py-2 text-sm text-frost">
                <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-ember align-middle" aria-hidden="true" />
                {voice.interim || "Σας ακούω…"}
              </p>
            )}
            {voice.speaking && !busy && <p className="mr-8 w-fit rounded-2xl bg-vapor/60 px-3 py-1 text-xs text-glacier">Η Χιόνη μιλάει…</p>}
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
              placeholder={voice.canListen ? "Γράψτε ή πατήστε το μικρόφωνο…" : "Γράψτε εδώ…"}
              className="min-w-0 flex-1 rounded-full border frost-line bg-abyss px-4 py-2 text-sm text-frost placeholder:text-glacier/70 focus:outline-2 focus:outline-ember"
            />
            {voice.canListen && (
              <button
                type="button"
                onClick={() => (voice.listening ? voice.stopListening() : voice.startListening((t) => void sendText(t, true)))}
                disabled={busy}
                aria-pressed={voice.listening}
                aria-label={voice.listening ? "Τέλος ομιλίας" : "Μιλήστε στη Χιόνη"}
                title={voice.listening ? "Τέλος" : "Μιλήστε"}
                className={`grid size-10 shrink-0 place-items-center rounded-full border frost-line disabled:opacity-50 ${voice.listening ? "animate-pulse bg-ember text-abyss" : "bg-abyss text-frost hover:bg-vapor-2"}`}
              >
                <Icon name={voice.listening ? "stop" : "mic"} size={18} />
              </button>
            )}
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
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-ember px-5 py-3 font-semibold text-abyss shadow-xl hover:bg-ember-2"
      >
        <Icon name={open ? "close" : "snowflake"} size={18} />
        {open ? "Κλείσιμο" : "Ρωτήστε μας ζωντανά"}
      </button>
    </div>
  );
}
