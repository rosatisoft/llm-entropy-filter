import express from "express";
import OpenAI from "openai";

// Importa SIEMPRE desde ../dist (porque server.mjs vive en /demo)
import { gateLLM as gate } from "../dist/index.js";

const app = express();
app.use(express.json({ limit: "1mb" }));

// OpenAI opcional
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// (Opcional) Self-test para confirmar que el server está usando el gate correcto
if (process.env.DEBUG_SELFTEST === "1") {
  const __t = "Congratulations. You won a FREE iPhone. Click here to claim now.";
  console.log("[debug] gate selftest:", gate(__t));
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/", (req, res) => {
  res
    .type("text")
    .send(
      "llm-entropy-filter is running. Try GET /health, POST /analyze. " +
        "Optional: POST /triad if OPENAI_API_KEY is set."
    );
});

// 1) Gate local (producto v1.0) - deterministic, rápido
app.post("/analyze", (req, res) => {
  const text = String(req.body?.text ?? "");
  const out = gate(text);

  res.json({
    ...out,
    meta: {
      ts: Date.now(),
      version: process.env.APP_VERSION || "1.0.0",
    },
  });
});

// 2) LLM opcional (demo): triad_response
app.post("/triad", async (req, res) => {
  if (!openai) {
    return res
      .status(501)
      .json({ error: "OPENAI_API_KEY not set. /triad is disabled." });
  }

  const text = String(req.body?.text ?? "");
  const gateOut = gate(text);

  // Si está bloqueado, ni gastes tokens
  if (gateOut?.action === "BLOCK") {
    return res.json({
      gate: gateOut,
      triad: null,
      note: "Blocked by local gate; triad_response not executed.",
    });
  }

  try {
    const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

    const prompt =
      "Responde con un análisis breve basado en Verdad/Ser/Principio. " +
      "1) Identifica afirmaciones no verificables, 2) señala salto lógico, " +
      "3) propone una versión más sobria y verificable. Texto:\n\n" +
      text;

    const completion = await openai.responses.create({
      model,
      input: prompt,
    });

    const triadText = completion.output_text ?? "";

    return res.json({
      gate: gateOut,
      triad: { model, text: triadText },
    });
  } catch (err) {
    return res.status(500).json({
      error: String(err?.message ?? err),
    });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0", () => {
  console.log(`[entropy-filter] listening on http://0.0.0.0:${port}`);
});
