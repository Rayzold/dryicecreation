"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Φωνή για τη Χιόνη με το δωρεάν Web Speech API του browser (el-GR ή en-GB, ανάλογα με τη γλώσσα του widget).
// Ακούει: SpeechRecognition (Chrome, Edge, Safari). Μιλάει: speechSynthesis (όλοι οι σύγχρονοι browsers).
// Αν ο browser δεν υποστηρίζει αναγνώριση (π.χ. Firefox), το κουμπί του μικροφώνου απλώς δεν εμφανίζεται.

type RecognitionResultEvent = { resultIndex: number; results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: RecognitionResultEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export type XioniLang = "el" | "en";
const BCP47: Record<XioniLang, string> = { el: "el-GR", en: "en-GB" };

// Η πιο φυσική φωνή της γλώσσας που έχει η συσκευή: πρώτα οι «natural/online», μετά Google/Microsoft, μετά ό,τι ταιριάζει.
function pickVoice(lang: XioniLang): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
  const score = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase();
    return (n.includes("natural") || n.includes("online") ? 4 : 0) + (n.includes("google") ? 2 : 0) + (n.includes("microsoft") ? 1 : 0) + (n.includes("female") || n.includes("athina") || n.includes("sonia") || n.includes("libby") ? 1 : 0);
  };
  return voices.sort((a, b) => score(b) - score(a))[0] ?? null;
}

// Χωρίς emoji, markdown και URLs, που ακούγονται άσχημα.
function speakable(text: string) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#`>]/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

const noSubscribe = () => () => {};

export function useXioniVoice(lang: XioniLang = "el") {
  // Στο static HTML (server) δεν υπάρχει φωνή· στον browser ελέγχεται μετά το hydration.
  const canListen = useSyncExternalStore(noSubscribe, () => !!getRecognition(), () => false);
  const canSpeak = useSyncExternalStore(noSubscribe, () => "speechSynthesis" in window, () => false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState("");
  // Η φωνή ανοίγει μόνη της μόλις ο πελάτης μιλήσει, και κλείνει/ανοίγει με το κουμπί του ηχείου.
  const [voiceOn, setVoiceOn] = useState(false);
  const recRef = useRef<Recognition | null>(null);

  useEffect(() => {
    const synth = "speechSynthesis" in window;
    if (synth) {
      // Σε Chrome οι φωνές φορτώνουν ασύγχρονα.
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
    return () => {
      recRef.current?.abort();
      if (synth) window.speechSynthesis.cancel();
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, as: XioniLang = lang) => {
      if (!canSpeak) return;
      const clean = speakable(text);
      if (!clean) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = BCP47[as];
      // Χωρίς φωνή της γλώσσας στη συσκευή η Χιόνη δεν μιλά: μια αγγλική φωνή που διαβάζει ελληνικά ακούγεται χειρότερα από τη σιωπή.
      const v = pickVoice(as);
      if (!v) return;
      u.voice = v;
      u.rate = 1.02;
      u.pitch = 1.08;
      u.onstart = () => setSpeaking(true);
      u.onend = () => setSpeaking(false);
      u.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(u);
    },
    [canSpeak, lang],
  );

  // iOS/Safari μιλάει μόνο αν η πρώτη εκφώνηση ξεκινήσει από άγγιγμα του χρήστη.
  // Μια σιωπηλή εκφώνηση τη στιγμή του κλικ «ξεκλειδώνει» τις επόμενες, που έρχονται μετά το fetch.
  const unlockAudio = useCallback(() => {
    if (!canSpeak) return;
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  }, [canSpeak]);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
  }, []);

  // onFinal: τι γίνεται με όσα είπε ο πελάτης όταν σταματήσει να μιλάει (στη Χιόνη: αποστολή).
  const startListening = useCallback((onFinal: (text: string) => void) => {
    const Ctor = getRecognition();
    if (!Ctor || listening) return;
    stopSpeaking();
    unlockAudio();
    const rec = new Ctor();
    rec.lang = BCP47[lang];
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e) => {
      let live = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else live += r[0].transcript;
      }
      setInterim((finalText + live).trim());
    };
    rec.onerror = () => {
      // «no-speech», «not-allowed» κ.λπ.: απλώς σταματάμε, το κείμενο μένει διαθέσιμο.
    };
    rec.onend = () => {
      setListening(false);
      setInterim("");
      recRef.current = null;
      const t = finalText.trim();
      if (t) onFinal(t);
    };
    recRef.current = rec;
    setVoiceOn(true);
    setListening(true);
    setInterim("");
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [listening, stopSpeaking, unlockAudio, lang]);

  return { canListen, canSpeak, listening, speaking, interim, voiceOn, setVoiceOn, startListening, stopListening, speak, stopSpeaking, unlockAudio };
}
