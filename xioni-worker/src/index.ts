// Η Χιόνη του site: Cloudflare Worker που κρατά κρυφό το API key και μιλά με το Claude.
// POST /chat  { messages: [{ role: "user"|"assistant", text: string }], lang?: "el"|"en" }  ->  { reply, quote? }
// POST /tts   { text, lang? }  ->  audio/mpeg με τη φωνή Madlen (ElevenLabs), με ημερήσιο όριο χαρακτήρων.
// Χωρίς ANTHROPIC_API_KEY τρέχει σε demo mode με έτοιμες απαντήσεις, για να φαίνεται το widget.

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, estimateKg, ESTIMATE_USES } from "./knowledge";

export interface Env {
  ANTHROPIC_API_KEY?: string;
  ALLOWED_ORIGINS: string; // comma-separated
  MODEL?: string;
  ELEVENLABS_API_KEY?: string;
  TTS_VOICE_ID?: string;
  TTS_DAILY_CHARS?: string;
  XIONI_TTS?: KVNamespace;
}

type ChatTurn = { role: "user" | "assistant"; text: string };
type Quote = Record<string, string | number>;
type Lang = "el" | "en";

// Κωδικός αιτήματος που λέγεται εύκολα στο τηλέφωνο: δύο γράμματα, τρία ψηφία και ένα γράμμα, π.χ. «ΚΑ315Τ» (900.000 συνδυασμοί).
// Μόνο γράμματα που είναι ίδια σε ελληνικά και λατινικά, για να μη μπερδεύεται όποιο πληκτρολόγιο κι αν έχει ο υπάλληλος.
// Χωρίς αποθήκευση ακόμα (demo): μοναδικότητα δεν εγγυάται· στην παραγωγή ο κωδικός βγαίνει από το store των αιτημάτων.
const CODE_LETTERS = "ΑΒΕΗΚΜΝΡΤΧ";
function orderCode(): string {
  const r = crypto.getRandomValues(new Uint32Array(4));
  const L = CODE_LETTERS.length;
  return CODE_LETTERS[r[0] % L] + CODE_LETTERS[r[1] % L] + String(100 + (r[2] % 900)) + CODE_LETTERS[r[3] % L];
}

const LANG_HINT: Record<Lang, string> = {
  el: "Η σελίδα είναι στα ελληνικά. Απάντα στα ελληνικά, εκτός αν ο πελάτης γράφει σε άλλη γλώσσα.",
  en: "The page is in English. Reply in English unless the customer writes in Greek.",
};

const FALLBACK: Record<Lang, { refusal: string; again: string; phone: string; error: string }> = {
  el: {
    refusal: "Συγγνώμη, σε αυτό δεν μπορώ να βοηθήσω. Για οτιδήποτε άλλο, καλέστε μας στο 213 029 1900.",
    again: "Μπορείτε να μου το ξαναπείτε;",
    phone: "Ας το συνεχίσουμε στο τηλέφωνο: 213 029 1900.",
    error: "Δεν μπόρεσα να απαντήσω τώρα. Καλέστε μας στο 213 029 1900.",
  },
  en: {
    refusal: "Sorry, I can't help with that. For anything else, call us on +30 213 029 1900.",
    again: "Could you say that again?",
    phone: "Let's continue on the phone: +30 213 029 1900.",
    error: "I couldn't answer just now. Please call us on +30 213 029 1900.",
  },
};

const MAX_TURNS = 30;
const MAX_CHARS = 1500;
const MAX_TOOL_ROUNDS = 4;

const tools: Anthropic.Tool[] = [
  {
    name: "estimate_kg",
    description:
      "Εκτιμά πόσα κιλά ξηρού πάγου χρειάζεται ο πελάτης. Κάλεσέ το όταν ο πελάτης δεν ξέρει την ποσότητα.",
    input_schema: {
      type: "object",
      properties: {
        use: { type: "string", enum: ESTIMATE_USES, description: "Η χρήση" },
        units: { type: "number", description: "Πόσα κουτιά / εμφανίσεις / ποτά / ώρες καθαρισμού" },
        hours: { type: "number", description: "Για αποστολές: πόσες ώρες πρέπει να κρατήσει. Αλλιώς 0." },
      },
      required: ["use", "units", "hours"],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    name: "create_quote_request",
    description:
      "Καταχωρεί αίτημα προσφοράς ή παραγγελίας όταν έχεις όλα τα στοιχεία. Μετά πες στον πελάτη τον κωδικό (ref) του αιτήματος.",
    input_schema: {
      type: "object",
      properties: {
        form: { type: "string", enum: ["pellets 3 mm", "pellets 16 mm", "blocks", "δεν ξέρω"] },
        kg: { type: "number" },
        date: { type: "string", description: "Ημερομηνία παράδοσης όπως την είπε ο πελάτης" },
        area: { type: "string" },
        use: { type: "string" },
        name: { type: "string" },
        phone: { type: "string" },
        email: { type: "string", description: "Κενό αν δεν δόθηκε" },
        notes: { type: "string", description: "Ό,τι άλλο χρήσιμο, ή κενό" },
      },
      required: ["form", "kg", "date", "area", "use", "name", "phone", "email", "notes"],
      additionalProperties: false,
    },
    strict: true,
  },
];

function cors(origin: string | null, env: Env): Record<string, string> {
  const allowed = env.ALLOWED_ORIGINS.split(",").map((s) => s.trim());
  const ok = origin && allowed.includes(origin) ? origin : allowed[0];
  return {
    "Access-Control-Allow-Origin": ok,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers: { ...headers, "Content-Type": "application/json" } });
}

function validTurns(raw: unknown): ChatTurn[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_TURNS) return null;
  const turns: ChatTurn[] = [];
  for (const t of raw) {
    if (!t || (t.role !== "user" && t.role !== "assistant") || typeof t.text !== "string") return null;
    if (t.text.length === 0 || t.text.length > MAX_CHARS) return null;
    turns.push({ role: t.role, text: t.text });
  }
  if (turns[0].role !== "user" || turns[turns.length - 1].role !== "user") return null;
  return turns;
}

function runTool(name: string, input: unknown): { content: string; quote?: Quote } {
  if (name === "estimate_kg") {
    return { content: JSON.stringify(estimateKg(input as { use: string; units: number; hours: number })) };
  }
  if (name === "create_quote_request") {
    // Demo: δεν στέλνεται email. Στην παραγωγή εδώ μπαίνει αποστολή (Resend) και γραμμή στο Google Sheet.
    const quote = { ...(input as Quote), ref: orderCode() };
    return { content: JSON.stringify({ ok: true, ref: quote.ref, demo: true }), quote };
  }
  return { content: JSON.stringify({ error: `unknown tool ${name}` }) };
}

async function chat(turns: ChatTurn[], lang: Lang, env: Env): Promise<{ reply: string; quote?: Quote }> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.text }));
  let quote: Quote | undefined;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const response = await client.beta.messages.create({
      model: env.MODEL || "claude-opus-5-5",
      max_tokens: 2048,
      system: [
        { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        { type: "text", text: LANG_HINT[lang] },
      ],
      output_config: { effort: "low" },
      tools,
      messages,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") {
      return { reply: FALLBACK[lang].refusal, quote };
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    const toolUses = response.content.filter(
      (b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use",
    );

    if (response.stop_reason !== "tool_use" || toolUses.length === 0) {
      return { reply: text || FALLBACK[lang].again, quote };
    }

    messages.push({ role: "assistant", content: response.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((tu) => {
      const r = runTool(tu.name, tu.input);
      if (r.quote) quote = r.quote;
      return { type: "tool_result", tool_use_id: tu.id, content: r.content };
    });
    messages.push({ role: "user", content: results });
  }
  return { reply: FALLBACK[lang].phone, quote };
}

// Demo mode: χωρίς API key, έτοιμες απαντήσεις ώστε να φαίνεται η ροή.
function demoReply(turns: ChatTurn[], lang: Lang): { reply: string; quote?: Quote } {
  const userTurns = turns.filter((t) => t.role === "user").length;
  const script: Record<Lang, string[]> = {
    el: [
      "Γεια σας, είμαι η Χιόνη! Τι μορφή ξηρού πάγου χρειάζεστε: pellets 3 mm, 16 mm ή blocks;",
      "Τέλεια. Πόσα κιλά περίπου; Αν δεν ξέρετε, πείτε μου τη χρήση και θα το υπολογίσω.",
      "Για ποια ημερομηνία και σε ποια περιοχή να γίνει η παράδοση;",
      "Τελευταίο: ένα όνομα και ένα τηλέφωνο για να σας καλέσουμε.",
    ],
    en: [
      "Hello, I'm Xioni! Which form of dry ice do you need: 3 mm pellets, 16 mm pellets or blocks?",
      "Great. Roughly how many kilos? If you're not sure, tell me what it's for and I'll work it out.",
      "For which date, and where should we deliver?",
      "Last thing: a name and a phone number so we can call you.",
    ],
  };
  const lines = script[lang];
  if (userTurns <= lines.length) return { reply: lines[userTurns - 1] };
  const ref = orderCode();
  return {
    reply:
      lang === "en"
        ? `Thank you! Your request code is ${ref}. If you call us, just give this code. (demo, no AI connection)`
        : `Ευχαριστώ! Ο κωδικός του αιτήματός σας είναι ${ref}. Αν μας καλέσετε, αρκεί να πείτε αυτόν τον κωδικό. (demo, χωρίς σύνδεση με AI)`,
    quote: { ref, demo: "true" },
  };
}

// --- Φωνή (Madlen) ---
const TTS_MODEL = "eleven_v4";
const TTS_MAX_TEXT = 600;
const DAY = 86400;

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function audio(body: ArrayBuffer, headers: Record<string, string>, cached: boolean) {
  return new Response(body, { status: 200, headers: { ...headers, "Content-Type": "audio/mpeg", "X-Xioni-Cache": cached ? "hit" : "miss" } });
}

async function tts(request: Request, env: Env, headers: Record<string, string>): Promise<Response> {
  if (!env.ELEVENLABS_API_KEY || !env.TTS_VOICE_ID || !env.XIONI_TTS) return json({ error: "tts off" }, 503, headers);
  // Μόνο από τα sites μας: όχι τέλεια προστασία (το Origin πλαστογραφείται), γι' αυτό υπάρχει και το ημερήσιο όριο.
  const origin = request.headers.get("Origin");
  if (!origin || !env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).includes(origin)) return json({ error: "forbidden" }, 403, headers);

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad json" }, 400, headers);
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return json({ error: "empty" }, 400, headers);
  if (text.length > TTS_MAX_TEXT) return json({ error: "too long" }, 413, headers);

  const kv = env.XIONI_TTS;
  const key = "a:" + (await sha256(`${env.TTS_VOICE_ID}|${TTS_MODEL}|${text}`));
  const hit = await kv.get(key, "arrayBuffer");
  if (hit) return audio(hit, headers, true);

  // Ο μετρητής δεν είναι ατομικός (KV): σε ταυτόχρονα αιτήματα μπορεί να περάσει λίγο το όριο. Για demo αρκεί.
  const cap = Number(env.TTS_DAILY_CHARS || "1000");
  const countKey = "c:" + new Date().toISOString().slice(0, 10);
  const used = Number((await kv.get(countKey)) || "0");
  if (used + text.length > cap) return json({ error: "daily limit" }, 429, headers);

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${env.TTS_VOICE_ID}?output_format=mp3_44100_64`, {
    method: "POST",
    headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: TTS_MODEL }),
  });
  if (!res.ok) {
    console.error("xioni tts", res.status, (await res.text()).slice(0, 200));
    return json({ error: "tts failed" }, 502, headers);
  }
  const mp3 = await res.arrayBuffer();
  await Promise.all([
    kv.put(countKey, String(used + text.length), { expirationTtl: 2 * DAY }),
    kv.put(key, mp3, { expirationTtl: 30 * DAY }),
  ]);
  return audio(mp3, headers, false);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = cors(request.headers.get("Origin"), env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (request.method === "POST" && url.pathname === "/tts") return tts(request, env, headers);
    if (request.method !== "POST" || url.pathname !== "/chat") return json({ error: "not found" }, 404, headers);

    let body: { messages?: unknown; lang?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad json" }, 400, headers);
    }
    const turns = validTurns(body.messages);
    if (!turns) return json({ error: "bad messages" }, 400, headers);
    const lang: Lang = body.lang === "en" ? "en" : "el";

    if (!env.ANTHROPIC_API_KEY) return json({ ...demoReply(turns, lang), mode: "demo" }, 200, headers);

    try {
      return json({ ...(await chat(turns, lang, env)), mode: "ai" }, 200, headers);
    } catch (error) {
      const status = error instanceof Anthropic.RateLimitError ? 429 : 502;
      console.error("xioni", error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
      return json({ reply: FALLBACK[lang].error, error: true }, status, headers);
    }
  },
};
