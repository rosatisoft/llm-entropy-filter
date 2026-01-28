import express from "express";
import OpenAI from "openai";

import { gate } from "llm-entropy-filter";

const app = express();
app.use(express.json({ limit: "1mb" }));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const APP_PORT = process.env.PORT || 3000;

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    app: "lef-user-demo",
    node: process.version,
  });
});

// 1) Gate local (rápido)
app.post("/analyze", (req, res) => {
  const text = String(req.body?.text ?? "");
  const result = gate(text); // modo default
  res.json(result);
});

// 2) Triad (LLM) - demo
app.post("/triad", async (req, res) => {
  const text = String(req.body?.text ?? "");

  // gate primero (siempre)
  const g = gate(text);

  if (!openai) {
    return res.status(503).json({
      gate: g,
      error: "OPENAI_API_KEY not set. /triad is a demo endpoint.",
    });
  }

  try {
    const prompt = `
Analiza el texto con 3 pasos:
1) Afirmaciones no verificables
2) Saltos lógicos
3) Versión más sobria y verificable

Texto: "${text}"
Responde en español, conciso.
`.trim();

    const r = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const out =
      r.output_text || (r.output?.[0]?.content?.[0]?.text ?? "No output_text");

    res.json({
      gate: g,
      triad: { model: "gpt-4.1-mini", text: out },
    });
  } catch (err) {
    res.status(500).json({
      gate: g,
      error: String(err?.message || err),
    });
  }
});

app.listen(APP_PORT, () => {
  console.log(`lef-user-demo listening on http://127.0.0.1:${APP_PORT}`);
});
