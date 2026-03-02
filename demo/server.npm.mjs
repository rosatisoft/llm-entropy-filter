import express from "express";
import OpenAI from "openai";

import { gate } from "llm-entropy-filter"; // ✅ como usuario npm

// Opcional: versión del paquete (sin JSON assert: usamos createRequire)
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const APP_VERSION = process.env.APP_VERSION || "demo";
const LIB_VERSION =
  process.env.LLM_ENTROPY_FILTER_VERSION ||
  process.env.npm_package_version ||
  "unknown";

const app = express();
app.use(express.json({ limit: "1mb" }));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const APP_VERSION = process.env.APP_VERSION || "demo";
const LIB_VERSION = pkg.version;

app.get("/health", (req, res) =>
  res.json({ ok: true, app_version: APP_VERSION, lib_version: LIB_VERSION })
);

app.post("/analyze", (req, res) => {
  const text = String(req.body?.text ?? "");
  const out = gate(text);

  res.json({
    ...out,
    meta: { ts: Date.now(), app_version: APP_VERSION, lib_version: LIB_VERSION },
  });
});

app.post("/triad", async (req, res) => {
  const text = String(req.body?.text ?? "");
  const out = gate(text);

  if (!openai) {
    return res.status(503).json({
      gate: out,
      error: "OPENAI_API_KEY not set. /triad is a demo endpoint.",
    });
  }

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const prompt = `Analiza el texto con enfoque sobrio:
1) Afirmaciones no verificables
2) Saltos lógicos
3) Versión más sobria y verificable

Texto:
${text}`;

  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const triadText = completion.choices?.[0]?.message?.content ?? "";

  res.json({ gate: out, triad: { model, text: triadText } });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`[entropy-filter npm demo] listening on http://0.0.0.0:${port}`);
});
