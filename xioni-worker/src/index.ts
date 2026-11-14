// Η Χιόνη του site: Cloudflare Worker που κρατά κρυφό το API key και μιλά με το Claude.
// POST /chat  { messages: [{ role: "user"|"assistant", text: string }] }  ->  { reply, quote? }
// Χωρίς ANTHROPIC_API_KEY τρέχει σε demo mode με έτοιμες απαντήσεις, για να φαίνεται το widget.

import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, estimateKg, ESTIMATE_USES } from "./knowledge";

export interface Env {
  ANTHROPIC_API_KEY?: string;
  ALLOWED_ORIGINS: string; // comma-separated
  MODEL?: string;
}

type ChatTurn = { role: "user" | "assistant"; text: string };
type Quote = Record<string, string | number>;

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
      "Καταχωρεί αίτημα προσφοράς ή παραγγελίας όταν έχεις όλα τα στοιχεία. Μετά πες στον πελάτη ότι θα τον καλέσει η εταιρεία.",
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
    const quote = { ...(input as Quote), ref: `DIC-${Date.now().toString(36).toUpperCase()}` };
    return { content: JSON.stringify({ ok: true, ref: quote.ref, demo: true }), quote };
  }
  return { content: JSON.stringify({ error: `unknown tool ${name}` }) };
}

async function chat(turns: ChatTurn[], env: Env): Promise<{ reply: string; quote?: Quote }> {
  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  const messages: Anthropic.Beta.BetaMessageParam[] = turns.map((t) => ({ role: t.role, content: t.text }));
  let quote: Quote | undefined;

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const response = await client.beta.messages.create({
      model: env.MODEL || "claude-opus-5-5",
      max_tokens: 2048,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      output_config: { effort: "low" },
      tools,
      messages,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });

    if (response.stop_reason === "refusal") {
      return { reply: "Συγγνώμη, σε αυτό δεν μπορώ να βοηθήσω. Για οτιδήποτε άλλο, καλέστε μας στο 213 029 1900.", quote };
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
      return { reply: text || "Μπορείτε να μου το ξαναπείτε;", quote };
    }

    messages.push({ role: "assistant", content: response.content });
    const results: Anthropic.Beta.BetaToolResultBlockParam[] = toolUses.map((tu) => {
      const r = runTool(tu.name, tu.input);
      if (r.quote) quote = r.quote;
      return { type: "tool_result", tool_use_id: tu.id, content: r.content };
    });
    messages.push({ role: "user", content: results });
  }
  return { reply: "Ας το συνεχίσουμε στο τηλέφωνο: 213 029 1900.", quote };
}

// Demo mode: χωρίς API key, έτοιμες απαντήσεις ώστε να φαίνεται η ροή.
function demoReply(turns: ChatTurn[]): { reply: string; quote?: Quote } {
  const userTurns = turns.filter((t) => t.role === "user").length;
  const script = [
    "Γεια σας, είμαι η Χιόνη! Τι μορφή ξηρού πάγου χρειάζεστε: pellets 3 mm, 16 mm ή blocks;",
    "Τέλεια. Πόσα κιλά περίπου; Αν δεν ξέρετε, πείτε μου τη χρήση και θα το υπολογίσω.",
    "Για ποια ημερομηνία και σε ποια περιοχή να γίνει η παράδοση;",
    "Τελευταίο: ένα όνομα και ένα τηλέφωνο για να σας καλέσουμε.",
  ];
  if (userTurns <= script.length) return { reply: script[userTurns - 1] };
  return {
    reply: "Ευχαριστώ! Καταχώρησα το αίτημά σας και η εταιρεία θα σας καλέσει σύντομα. (demo, χωρίς σύνδεση με AI)",
    quote: { ref: "DIC-DEMO", demo: "true" },
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const headers = cors(request.headers.get("Origin"), env);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/chat") return json({ error: "not found" }, 404, headers);

    let body: { messages?: unknown };
    try {
      body = await request.json();
    } catch {
      return json({ error: "bad json" }, 400, headers);
    }
    const turns = validTurns(body.messages);
    if (!turns) return json({ error: "bad messages" }, 400, headers);

    if (!env.ANTHROPIC_API_KEY) return json({ ...demoReply(turns), mode: "demo" }, 200, headers);

    try {
      return json({ ...(await chat(turns, env)), mode: "ai" }, 200, headers);
    } catch (error) {
      const status = error instanceof Anthropic.RateLimitError ? 429 : 502;
      console.error("xioni", error instanceof Anthropic.APIError ? `${error.status} ${error.message}` : error);
      return json({ reply: "Κάτι δεν πήγε καλά. Καλέστε μας στο 213 029 1900.", error: true }, status, headers);
    }
  },
};
