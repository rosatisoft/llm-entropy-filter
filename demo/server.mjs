import express from "express";
import OpenAI from "openai";

import { gate } from "../dist/index.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const APP_VERSION =
  process.env.APP_VERSION ||
  process.env.npm_package_version || // cuando lo corres con npm run ...
  "dev";

// Self-test opcional (solo si lo pides)
if (process.env.DEBUG_SELFTEST === "1") {
  const t = "Congratulations. You won a FREE iPhone. Click here to claim now.";
  console.log("[debug] gate selftest:", gate(t));
}

app.get("/health", (req, res) => res.json({ ok: true, version: APP_VERSION }));

app.get("/", (req, res) => {
  res.type("text").send(
    "llm-entropy-filter is running. Try GET /health or POST /analyze (and POST /triad if OPENAI_API_KEY is set)."
  );
});

// 1) Gate local (producto v1.0.x)
app.post("/analyze", (req, res) => {
  const text = String(req.body?.text ?? "");
  const out = gate(text);

  // Debug por request (solo si lo pides)
  if (process.env.DEBUG_ANALYZE === "1") {
    console.log("[debug] /analyze hit:", Date.now(), "len=", text.length, "action=", out.action);
  }

  res.json({
    ...out,
    meta: {
      ts: Date.now(),
      version: APP_VERSION,
    },
  });
});

// 2) Triad demo (opcional: usa OpenAI)
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

  res.json({
    gate: out,
    triad: {
      model,
      text: triadText,
    },
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`[entropy-filter] listening on http://0.0.0.0:${port}`);
});
