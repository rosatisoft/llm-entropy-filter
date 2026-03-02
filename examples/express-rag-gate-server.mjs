import express from "express";
import OpenAI from "openai";

import { gate } from "llm-entropy-filter";
import defaultRules from "llm-entropy-filter/rulesets/default";

const app = express();
app.use(express.json({ limit: "1mb" }));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/chat", async (req, res) => {
  const text = String(req.body?.text ?? "");

  // 1) Local deterministic gate (fast)
  const decision = gate(text, { ruleset: defaultRules });

  // Simple metrics hook (replace with Prometheus/Datadog later)
  console.log(
    JSON.stringify({
      ts: Date.now(),
      action: decision.action,
      score: decision.entropy_score,
      flags: decision.flags,
      intention: decision.intention,
      confidence: decision.confidence
    })
  );

  if (decision.action === "BLOCK") {
    return res.status(403).json({
      ok: false,
      gate: decision,
      message: "Request blocked by deterministic entropy gate."
    });
  }

  if (!openai) {
    // In demo mode, return the gate decision only
    return res.status(200).json({
      ok: true,
      gate: decision,
      demo: true,
      message: "OPENAI_API_KEY not set; returning gate result only."
    });
  }

  // 2) Escalate to LLM only when allowed
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant. Keep answers short, factual, and avoid speculation."
      },
      { role: "user", content: text }
    ]
  });

  const answer = completion.choices?.[0]?.message?.content ?? "";

  return res.status(200).json({
    ok: true,
    gate: decision,
    model: "gpt-4.1-mini",
    answer
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => console.log(`[express] listening on :${port}`));
