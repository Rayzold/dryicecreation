"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

// Φωνή για τη Χιόνη.
// Μιλάει: η Madlen (ElevenLabs) από το /tts του worker, με το ίδιο ηχείο σε κάθε συσκευή. Αν το /tts δεν απαντήσει
// (όριο της μέρας, δίκτυο), η Χιόνη απλώς γράφει· δεν πέφτουμε σε φωνή του browser (ο Stefanos κόπηκε, 27/11).
// Ακούει: SpeechRecognition του browser (Chrome, Edge, Safari).
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

// Χωρίς emoji, markdown και URLs, που ακούγονται άσχημα.
function speakable(text: string) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#`>]/g, "")
    .replace(/\p{Extended_Pictographic}/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Το /tts δέχεται έως 600 χαρακτήρες: κόβουμε στο τέλος της τελευταίας πρότασης που χωράει.
const TTS_MAX = 600;
function fitTts(text: string) {
  if (text.length <= TTS_MAX) return text;
  const cut = text.slice(0, TTS_MAX);
  const end = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("; "), cut.lastIndexOf("? "));
  return end > 100 ? cut.slice(0, end + 1) : cut;
}

// Σιωπηλό WAV: παίζεται τη στιγμή του κλικ για να «ξεκλειδώσει» το ηχείο σε iOS/Safari.
const SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

const noSubscribe = () => () => {};

export function useXioniVoice(lang: XioniLang = "el", ttsUrl = "") {
  // Στο static HTML (server) δεν υπάρχει φωνή· στον browser ελέγχεται μετά το hydration.
  const canListen = useSyncExternalStore(noSubscribe, () => !!getRecognition(), () => false);
  const canSpeak = useSyncExternalStore(noSubscribe, () => !!ttsUrl && typeof Audio !== "undefined", () => false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interim, setInterim] = useState("");
  // Η φωνή ανοίγει μόνη της μόλις ο πελάτης μιλήσει, και κλείνει/ανοίγει με το κουμπί του ηχείου.
  const [voiceOn, setVoiceOn] = useState(false);
  const recRef = useRef<Recognition | null>(null);
  // Ένα ηχείο για όλη τη συζήτηση (το ξεκλειδωμένο στο iOS), και αριθμός εκφώνησης ώστε μια παλιά
  // απάντηση που αργεί να φτάσει να μη μιλήσει πάνω από νεότερη ή μετά το «σταμάτα».
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);
  const seqRef = useRef(0);

  const player = useCallback(() => {
    if (!audioRef.current) {
      const a = new Audio();
      a.onplaying = () => setSpeaking(true);
      a.onended = () => setSpeaking(false);
      a.onpause = () => setSpeaking(false);
      a.onerror = () => setSpeaking(false);
      audioRef.current = a;
    }
    return audioRef.current;
  }, []);

  useEffect(() => {
    return () => {
      recRef.current?.abort();
      audioRef.current?.pause();
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    seqRef.current++;
    audioRef.current?.pause();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, as: XioniLang = lang) => {
      if (!canSpeak) return;
      const clean = fitTts(speakable(text));
      if (!clean) return;
      const seq = ++seqRef.current;
      audioRef.current?.pause();
      void (async () => {
        try {
          const res = await fetch(`${ttsUrl}/tts`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: clean, lang: as }),
          });
          if (!res.ok || seq !== seqRef.current) return;
          const blob = await res.blob();
          if (seq !== seqRef.current) return;
          const a = player();
          if (urlRef.current) URL.revokeObjectURL(urlRef.current);
          urlRef.current = URL.createObjectURL(blob);
          a.src = urlRef.current;
          await a.play();
        } catch {
          setSpeaking(false);
        }
      })();
    },
    [canSpeak, lang, ttsUrl, player],
  );

  // iOS/Safari παίζει ήχο μόνο αν το ηχείο ξεκίνησε από άγγιγμα του χρήστη.
  // Ένα σιωπηλό WAV τη στιγμή του κλικ το «ξεκλειδώνει» για τις επόμενες εκφωνήσεις, που έρχονται μετά το fetch.
  const unlockAudio = useCallback(() => {
    if (!canSpeak) return;
    const a = player();
    if (a.src && !a.paused) return;
    a.src = SILENT_WAV;
    a.play().catch(() => {});
  }, [canSpeak, player]);

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
