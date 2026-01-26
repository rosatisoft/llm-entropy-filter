// demo/server.mjs
import express from "express";
import OpenAI from "openai";
import { runEntropyFilter } from "../dist/index.js"; // usa el build (dist) para demo estable

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/analyze", (req, res) => {
  const text = String(req.body?.text ?? "");
  const result = runEntropyFilter(text);
  res.json({ input: text, ...result });
});

// ---- LLM WRAPPER (OpenAI) ----
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function makeGate(entropyResult) {
  // ejemplo de umbrales (ajústalos)
  const score = entropyResult.entropy_analysis.score;
  const flags = entropyResult.entropy_analysis.flags;

  if (score >= 0.7 || flags.includes("magic_manifesting") || flags.includes("truth_relativism")) {
    return { action: "BLOCK" };
  }
  if (score >= 0.25 || flags.includes("weak_evidence") || flags.includes("conspiracy_vague")) {
    return { action: "WARN" };
  }
  return { action: "ALLOW" };
}

app.post("/chat", async (req, res) => {
  try {
    const text = String(req.body?.text ?? "");
    const filtered = runEntropyFilter(text);
    const gate = makeGate(filtered);

    // 1) BLOCK => no LLM
    if (gate.action === "BLOCK") {
      return res.json({
        gate,
        filtered,
        answer: "Bloqueado por alta entropía (riesgo de pseudo-ciencia / coerción / relativismo / causalidad rota). Si quieres, reformula con hechos verificables y evidencia."
      });
    }

    // 2) WARN => LLM pero con instrucciones estrictas anti-alucinación
    const extraInstructions =
      gate.action === "WARN"
        ? "Responde con cautela. No afirmes como hecho. Señala supuestos, pide evidencia, ofrece alternativas verificables y evita lenguaje persuasivo."
        : "Responde directo, claro y verificable.";

    // Responses API (OpenAI)
    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: extraInstructions,
      input: text
    });

    return res.json({
      gate,
      filtered,
      answer: response.output_text
    });
  } catch (err) {
    return res.status(500).json({ error: String(err?.message ?? err) });
  }
});

app.get("/", (req, res) => {
  res.type("text").send(
    "llm-entropy-filter is running. Try GET /health or POST /analyze"
  );
});

const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`[entropy-filter] listening on http://${HOST}:${PORT}`);
});
