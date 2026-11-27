"use client";

import { useEffect, useRef, useState } from "react";
import { business } from "@/lib/site";
import { asset } from "@/lib/asset";
import { Icon } from "./Icon";
import { useXioniVoice, type XioniLang } from "./useXioniVoice";

// Η Χιόνη: παράθυρο κουβέντας κάτω δεξιά. Εμφανίζεται μόνο αν οριστεί στο build
// NEXT_PUBLIC_XIONI_URL=https://xioni-dryicecreation.<account>.workers.dev
const URL_ = process.env.NEXT_PUBLIC_XIONI_URL || "";

type Turn = { role: "user" | "assistant"; text: string };
type Quote = Record<string, string | number>;

// Κείμενα του widget σε δύο γλώσσες. Ο πελάτης αλλάζει γλώσσα από το EL/EN στην κεφαλίδα.
const T = {
  el: {
    name: "Χιόνη",
    greeting: "Γεια σας, είμαι η Χιόνη! Μπορώ να σας βοηθήσω με μια προσφορά ή να υπολογίσουμε πόσο ξηρό πάγο χρειάζεστε.",
    region: "Χιόνη, η ψηφιακή βοηθός",
    subtitle: "Ψηφιακή βοηθός · απαντά όλο το 24ωρο",
    voiceOn: "Η Χιόνη μιλάει: πατήστε για σίγαση",
    voiceOff: "Να διαβάζει η Χιόνη τις απαντήσεις φωναχτά",
    mute: "Σίγαση",
    voice: "Φωνή",
    close: "Κλείσιμο",
    listening: "Σας ακούω…",
    speaking: "Η Χιόνη μιλάει…",
    typing: "Η Χιόνη γράφει…",
    done: "Το αίτημα καταχωρήθηκε",
    code: "Κωδικός αιτήματος",
    codeHint: "Αν μας καλέσετε, αρκεί να πείτε αυτόν τον κωδικό.",
    inputLabel: "Μήνυμα προς τη Χιόνη",
    placeholderMic: "Γράψτε ή πατήστε το μικρόφωνο…",
    placeholder: "Γράψτε εδώ…",
    micStop: "Τέλος ομιλίας",
    micStart: "Μιλήστε στη Χιόνη",
    micStopShort: "Τέλος",
    micStartShort: "Μιλήστε",
    send: "Αποστολή",
    disclaimer: "Η Χιόνη είναι βοηθός τεχνητής νοημοσύνης. Οι τιμές είναι ενδεικτικές. Μην γράφετε ευαίσθητα προσωπικά στοιχεία.",
    offline: (phone: string) => `Δεν μπόρεσα να συνδεθώ. Καλέστε μας στο ${phone}.`,
    launcher: "Ρωτήστε μας ζωντανά",
    poke: "Πάτησέ με",
    penguin: "Άνοιγμα της Χιόνης, με φωνητικό χαιρετισμό",
    langSwitch: "Switch to English",
  },
  en: {
    name: "Xioni",
    greeting: "Hello, I'm Xioni! I can help you with a quote or work out how much dry ice you need.",
    region: "Xioni, the digital assistant",
    subtitle: "Digital assistant · available 24/7",
    voiceOn: "Xioni is speaking: tap to mute",
    voiceOff: "Have Xioni read replies aloud",
    mute: "Mute",
    voice: "Voice",
    close: "Close",
    listening: "Listening…",
    speaking: "Xioni is speaking…",
    typing: "Xioni is typing…",
    done: "Your request is registered",
    code: "Request code",
    codeHint: "If you call us, just give this code.",
    inputLabel: "Message to Xioni",
    placeholderMic: "Type, or tap the microphone…",
    placeholder: "Type here…",
    micStop: "Stop speaking",
    micStart: "Talk to Xioni",
    micStopShort: "Stop",
    micStartShort: "Talk",
    send: "Send",
    disclaimer: "Xioni is an AI assistant. Prices are indicative. Please don't share sensitive personal data.",
    offline: (phone: string) => `I couldn't connect. Please call us on +30 ${phone}.`,
    launcher: "Ask us live",
    poke: "Tap me",
    penguin: "Open Xioni, with a spoken greeting",
    langSwitch: "Αλλαγή σε ελληνικά",
  },
} as const;

export function XioniChat() {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<XioniLang>("el");
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", text: T.el.greeting }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const voice = useXioniVoice(lang, URL_);
  const t = T[lang];

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, busy, quote, voice.interim]);

  // Στο πρώτο άνοιγμα η Χιόνη ακολουθεί τη γλώσσα της σελίδας (<html lang>), όχι του browser:
  // στο ελληνικό site μιλά ελληνικά, και τα αγγλικά είναι επιλογή από τον διακόπτη.
  // Όχι στο φόρτωμα, για να ταιριάζει το static HTML με το hydration.
  const detected = useRef(false);
  function firstLang(): XioniLang {
    if (detected.current) return lang;
    detected.current = true;
    const l: XioniLang = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "el";
    if (l !== lang) switchLang(l);
    return l;
  }

  if (!URL_) return null;

  function send(e: React.FormEvent) {
    e.preventDefault();
    void sendText(input);
  }

  // Ο χαιρετισμός αλλάζει γλώσσα όσο ο πελάτης δεν έχει γράψει τίποτα.
  function switchLang(next: XioniLang) {
    detected.current = true;
    voice.stopSpeaking();
    setLang(next);
    setTurns((cur) => (cur.length === 1 ? [{ role: "assistant", text: T[next].greeting }] : cur));
  }

  // Το πιγκουινάκι ανοίγει τη Χιόνη και λέει τον χαιρετισμό φωναχτά.
  // Φωνή μόνο με κλικ του πελάτη, ποτέ μόνη της στο φόρτωμα της σελίδας.
  function openWithGreeting() {
    const l = firstLang();
    setOpen(true);
    if (!voice.canSpeak) return;
    voice.setVoiceOn(true);
    voice.unlockAudio(); // μέσα στο κλικ, για το iOS· ο ήχος της Madlen φτάνει μετά το fetch
    voice.speak(turns.length === 1 ? T[l].greeting : turns[turns.length - 1].text, l);
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
        body: JSON.stringify({ messages: history, lang }),
      });
      const data = await res.json();
      const reply = String(data.reply || "");
      setTurns((cur) => [...cur, { role: "assistant", text: reply }]);
      if (spoken || voice.voiceOn) voice.speak(reply);
      if (data.quote) setQuote(data.quote);
    } catch {
      setTurns((cur) => [...cur, { role: "assistant", text: t.offline(business.phones[0].display) }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {open && (
        <section
          aria-label={t.region}
          lang={lang}
          className="flex h-[min(560px,75dvh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border frost-line bg-abyss-2 shadow-2xl"
        >
          <header className="flex items-center justify-between border-b frost-line bg-vapor/60 px-4 py-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
              <img src={asset("/xioni-avatar.webp")} alt="" width={40} height={40} className="size-10 rounded-full ring-2 ring-ember" />
              <div>
                <p className="heading text-lg leading-tight">{t.name}</p>
                <p className="text-xs text-glacier">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => switchLang(lang === "el" ? "en" : "el")}
                aria-label={t.langSwitch}
                title={t.langSwitch}
                className="rounded-full px-2 py-1 text-xs font-semibold text-glacier-2 hover:bg-vapor-2"
              >
                <span className={lang === "el" ? "text-ember" : ""}>EL</span>
                <span aria-hidden="true" className="px-0.5 text-glacier/60">/</span>
                <span className={lang === "en" ? "text-ember" : ""}>EN</span>
              </button>
              {voice.canSpeak && (
                <button
                  type="button"
                  onClick={() => {
                    if (voice.voiceOn) voice.stopSpeaking();
                    else voice.unlockAudio();
                    voice.setVoiceOn(!voice.voiceOn);
                  }}
                  aria-pressed={voice.voiceOn}
                  aria-label={voice.voiceOn ? t.voiceOn : t.voiceOff}
                  title={voice.voiceOn ? t.mute : t.voice}
                  className={`rounded-full p-2 hover:bg-vapor-2 ${voice.voiceOn ? "text-ember" : "text-glacier-2"}`}
                >
                  <Icon name={voice.voiceOn ? "volume" : "mute"} size={18} />
                </button>
              )}
              <button type="button" onClick={close} aria-label={t.close} className="rounded-full p-2 text-glacier-2 hover:bg-vapor-2">
                <Icon name="close" size={18} />
              </button>
            </div>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" aria-live="polite">
            {turns.map((turn, i) =>
              turn.role === "user" ? (
                <p key={i} className="ml-8 rounded-2xl rounded-br-sm bg-ember px-3 py-2 text-sm text-abyss">
                  {turn.text}
                </p>
              ) : (
                <div key={i} className="mr-6 flex items-end gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
                  <img src={asset("/xioni-avatar.webp")} alt="" width={24} height={24} className="size-6 shrink-0 rounded-full" />
                  <p className="min-w-0 rounded-2xl rounded-bl-sm bg-vapor px-3 py-2 text-sm text-frost">{turn.text}</p>
                </div>
              ),
            )}
            {voice.listening && (
              <p className="ml-8 rounded-2xl rounded-br-sm border border-ember/60 px-3 py-2 text-sm text-frost">
                <span className="mr-2 inline-block size-2 animate-pulse rounded-full bg-ember align-middle" aria-hidden="true" />
                {voice.interim || t.listening}
              </p>
            )}
            {voice.speaking && !busy && <p className="mr-8 w-fit rounded-2xl bg-vapor/60 px-3 py-1 text-xs text-glacier">{t.speaking}</p>}
            {busy && <p className="mr-8 w-fit rounded-2xl bg-vapor px-3 py-2 text-sm text-glacier">{t.typing}</p>}
            {quote && (
              <div className="rounded-xl border frost-line bg-vapor/40 p-3 text-sm" role="status">
                <p className="flex items-center gap-2 font-semibold text-frost">
                  <Icon name="tick" size={16} /> {t.done}
                </p>
                <p className="mt-2 flex items-baseline gap-2 text-glacier-2">
                  {t.code}: <span className="heading text-2xl tracking-wider text-ember">{String(quote.ref)}</span>
                </p>
                <p className="mt-1 text-xs text-glacier">{t.codeHint}</p>
              </div>
            )}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t frost-line p-3">
            <label htmlFor="xioni-input" className="sr-only">{t.inputLabel}</label>
            <input
              id="xioni-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1500}
              placeholder={voice.canListen ? t.placeholderMic : t.placeholder}
              className="min-w-0 flex-1 rounded-full border frost-line bg-abyss px-4 py-2 text-sm text-frost placeholder:text-glacier/70 focus:outline-2 focus:outline-ember"
            />
            {voice.canListen && (
              <button
                type="button"
                onClick={() => (voice.listening ? voice.stopListening() : voice.startListening((said) => void sendText(said, true)))}
                disabled={busy}
                aria-pressed={voice.listening}
                aria-label={voice.listening ? t.micStop : t.micStart}
                title={voice.listening ? t.micStopShort : t.micStartShort}
                className={`grid size-10 shrink-0 place-items-center rounded-full border frost-line disabled:opacity-50 ${voice.listening ? "animate-pulse bg-ember text-abyss" : "bg-abyss text-frost hover:bg-vapor-2"}`}
              >
                <Icon name={voice.listening ? "stop" : "mic"} size={18} />
              </button>
            )}
            <button type="submit" disabled={busy || !input.trim()} className="rounded-full bg-ember px-4 text-sm font-semibold text-abyss disabled:opacity-50">
              {t.send}
            </button>
          </form>
          <p className="px-4 pb-2 text-[10px] text-glacier/80">{t.disclaimer}</p>
        </section>
      )}
      <div className="flex items-end gap-2">
        {!open && (
          <button type="button" onClick={openWithGreeting} aria-label={t.penguin} className="group relative mb-1 size-14 rounded-full">
            <span
              aria-hidden="true"
              className="xioni-bubble pointer-events-none absolute -top-12 right-0 whitespace-nowrap rounded-2xl rounded-br-sm bg-frost px-3 py-1 text-xs font-semibold text-abyss shadow-lg"
            >
              {t.poke}
            </span>
            {/* Ακίνητος κύκλος με λάμψη· η Χιόνη στέκεται μέσα του και το κεφάλι της βγαίνει από πάνω. */}
            <span aria-hidden="true" className="xioni-disc absolute inset-0 rounded-full ring-2 ring-ember group-hover:ring-ember-2" />
            <span aria-hidden="true" className="xioni-clip pointer-events-none absolute">
              <span className="xioni-hop absolute inset-0">
                {/* eslint-disable-next-line @next/next/no-img-element -- static export, images unoptimized */}
                <img src={asset("/xioni-cutout.webp")} alt="" width={56} height={63} className="xioni-waddle absolute bottom-[6px] left-[8px] h-[63px] w-[56px]" />
              </span>
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            if (open) return close();
            firstLang();
            setOpen(true);
          }}
          aria-expanded={open}
          className={`flex items-center gap-2 rounded-full bg-ember px-5 py-3 font-semibold text-abyss shadow-xl hover:bg-ember-2${open ? "" : " frost-launcher"}`}
        >
          <Icon name={open ? "close" : "snowflake"} size={18} />
          {open ? t.close : t.launcher}
        </button>
      </div>
    </div>
  );
}
