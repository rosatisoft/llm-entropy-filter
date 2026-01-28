# llm-entropy-filter

[![npm version](https://img.shields.io/npm/v/llm-entropy-filter.svg)](https://www.npmjs.com/package/llm-entropy-filter)
[![license](https://img.shields.io/npm/l/llm-entropy-filter.svg)](LICENSE)

Minimal, fast **entropy + intent gate** for LLM inputs.

`llm-entropy-filter` is a deterministic, local middleware layer that filters high-entropy / low-signal inputs before they reach expensive LLM inference.

It transforms your LLM from a generic processor into a **premium signal resource**.

---

# 🚀 Why this exists

LLMs are powerful but:

- Expensive per token
- Latency-heavy (seconds vs milliseconds)
- Vulnerable to spam, coercion, broken causality, and noise

Most systems solve this with *more processing*.

`llm-entropy-filter` solves it with **criterion before processing**.

---

# 🧠 Architecture

The system operates in two deterministic local layers:

## Layer 1 — Hard Triggers (Deterministic Signals)

Immediate structural patterns:

- Shouting (ALL CAPS)
- Urgency markers
- Money / % signals
- Spam phrasing
- Conspiracy vagueness
- Broken causality structures
- Repetition anomalies

These are language-light, low-cost, and capture obvious noise.

## Layer 2 — Thematic Scoring (Signal Accumulation)

If no hard block occurs, the input is evaluated by topic clusters:

- Marketing spam
- Conspiracy framing
- Coercive tone
- Pseudo-scientific structure
- Relativism / truth dilution
- Semantic incoherence

Each topic contributes to an `entropy_score`.

Final verdict:

ALLOW | WARN | BLOCK


Returned with:

```json
{
  "action": "BLOCK",
  "entropy_score": 0.7,
  "flags": [...],
  "intention": "...",
  "confidence": 0.85,
  "rationale": "..."
}


No network calls. No embeddings. No remote inference.

## Rulesets

This project ships with preset rule packs:

- `default` (balanced)
- `strict` (aggressive blocking)
- `support` (fewer false positives)
- `public-api` (hardened for open endpoints)

Rulesets live in `rulesets/` and define:
- thresholds (WARN/BLOCK)
- hard triggers
- topic scoring weights

## Integrations

This repo includes ready-to-use adapters under `integrations/`:

- `integrations/express.mjs` — Express middleware gate (ALLOW/WARN/BLOCK)
- `integrations/fastify.mjs` — Fastify plugin gate
- `integrations/vercel-ai-sdk.mjs` — pre-gate wrapper for `streamText()` / `generateText()`
- `integrations/langchain.mjs` — pre-gate + optional Runnable wrapper for LangChain

These integrations do **not** change core behavior. They only call `gate()` and route based on the verdict.

## Examples

npm i llm-entropy-filter express openai
export OPENAI_API_KEY="sk-..."
node examples/express-rag-gate-server.mjs

flowchart TD
  U[User / Client] --> API[Public API / Chat Endpoint]

  API --> G[Entropy Gate (local, deterministic)]
  G -->|BLOCK| B[Block Response<br/>(<10ms) + flags + rationale]
  G -->|WARN| W[Warn Response<br/>(<10ms) + suggested next-step]
  G -->|ALLOW| P[LLM Pipeline]

  P -->|RAG (optional)| R[RAG Retriever]
  R --> C[Context Builder]
  C --> L[LLM / Reasoning Model]
  L --> OUT[Final Answer]

  G --> LOG[Metrics / Logs]
  P --> LOG

### Mini case study

## 🧪 Production Scenario (Case Study)

**Context:** A startup ships a public chat widget on their website. Traffic is mixed: legitimate users + spam + prompt abuse + low-signal “conspiracy/vague” prompts.

**Before (`Direct LLM`):**
- Every message hits the LLM.
- Latency is dominated by model roundtrip.
- Rate limits are consumed by noise.
- Debugging is harder (no deterministic explanation layer).

**After (`Entropy Gate → LLM`):**
- The gate blocks obvious spam/coercion/conspiracy-vague patterns locally.
- Only high-signal inputs reach the expensive model layer.
- System gains headroom on rate limits and stabilizes UX.

**Operational effects:**
- **Lower average tail latency** (blocked traffic returns immediately).
- **Budget efficiency increases** (LLM tokens reserved for real users).
- **Better incident response** (flags + rationale make abuse patterns traceable).

## ✅ Production Checklist

- [ ] Choose a ruleset (default/strict/public-api/support)
- [ ] Log gate decisions (flags + rationale) for traceability
- [ ] Add metrics (blocked %, warned %, p95 latency)
- [ ] Place gate *before* RAG retrieval to avoid wasted embeddings/search
- [ ] Enforce rate limits *after* gate for maximum headroom


📦 Installation
npm i llm-entropy-filter

⚡ Quickstart
import { gate } from "llm-entropy-filter";

const result = gate("¡¡COMPRA YA!! Oferta limitada 90% OFF $$$");

console.log(result);

🖥 Demo Server

The demo server wraps the local gate.

Start
npm run serve


(Ensure your package.json includes: "serve": "node demo/server.mjs")

Health
curl http://127.0.0.1:3000/health

Local gate
curl -X POST http://127.0.0.1:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"FREE iPhone!!! Click now!!!"}'

Optional LLM Triad (Demo Only)
export OPENAI_API_KEY="YOUR_KEY"
export OPENAI_MODEL="gpt-4.1-mini"

curl -X POST http://127.0.0.1:3000/triad \
  -H "Content-Type: application/json" \
  -d '{"text":"Vivimos en una simulación y todos lo esconden."}'


If OPENAI_API_KEY is not set, /triad returns 503.

⚡ Performance (Measured)

Environment:
GitHub Codespaces (Linux container), Node 24.x

Local Gate — /analyze

Avg latency: 5.28 ms

p50: 4 ms

p99: 16 ms

Throughput: ~5,118 req/sec

0 errors

LLM Roundtrip — /triad

Avg latency: 5,321 ms

p50: 5,030 ms

Throughput: ~0.34 req/sec

2 timeouts in 30s test

Note: These represent different pipeline layers (local deterministic vs external LLM API). The architectural gain comes from avoiding unnecessary LLM calls.

📉 Economic Impact (Projection)
Assumptions

300 tokens per request (150 in / 150 out)

gpt-4o-mini pricing baseline

30% traffic filtered locally

Effect

If 1M requests are received:

300,000 requests never hit the LLM

30% token cost avoided

30% rate-limit headroom gained

30% reduction in latency pressure

Savings scale linearly with volume and exponentially with higher-cost models.

Formula:

Savings =
(Filtered_Requests / Total_Requests)
× Avg_Tokens_Per_Request
× Token_Price

🛡 Stability & Hallucination Mitigation

High-entropy inputs increase:

Off-topic generation

Reasoning drift

Prompt injection exposure

Token expansion loops

By constraining input entropy before inference,
the downstream model operates in a narrower semantic bandwidth.

This improves stability without imposing moral or ideological constraints.

🧪 Dataset Benchmark

Included:

bench/sms_spam.csv


Run:

node bench/sms_spam_bench.mjs bench/sms_spam.csv


Generates:

Precision / recall

Confusion matrix

Top flags

JSON + Markdown reports

🎯 Design Goals

Deterministic

Transparent

Fast

Composable

Observable

Economically rational

🗺 Roadmap

Multilingual rulesets

Configurable rule packs

Express / Fastify middleware exports

Suggested rewrite mode

Production case studies

👤 Attribution

Developed and maintained by Ernesto Rosati.

If this library creates value for your organization,
consider collaboration or sponsorship.

📜 License

Apache-2.0
Copyright (c) 2026 Ernesto Rosati

Use cases & integrations
## ✅ Where this fits in real systems

`llm-entropy-filter` is designed to sit **before** expensive inference. Common placements:

### 1) Public chat apps (startups)
Use as a first-line gate to block obvious spam/coercion before the LLM:
- faster UX for rejected traffic (<10ms)
- reduced token spend
- reduced prompt-abuse surface

### 2) Rate-limit protection
Acts as a semantic pre-filter that reduces:
- quota exhaustion
- burst abuse
- coordinated spam floods

It creates headroom by rejecting high-entropy traffic locally.

### 3) RAG pipelines (pre-retrieval gate)
Before retrieval:
- block low-signal queries that would waste retrieval + reranking
- normalize/clean input to improve recall precision
- prevent adversarial queries from polluting retrieval traces

### 4) Multi-agent systems
In agent loops:
- prevent “reasoning drift” from noisy inputs
- keep agents from spending cycles on incoherent or adversarial prompts
- add structured telemetry for agent decisions (`flags`, `intention`, `entropy_score`)

### 5) Tooling & SDK pre-gates (LangChain / Vercel AI SDK)
Drop in as a deterministic guard:
- before `callLLM()`
- before `streamText()`
- before tool selection / agent routing

The output can be used as:
- a routing signal (ALLOW/WARN/BLOCK)
- a logging payload for audits and dashboards

“What’s missing to be production-ready” 
## Production readiness checklist

The core gate is stable, but “production-ready” requires:

### 1) Configurable rulesets
- `default` (balanced)
- `strict` (aggressive spam/coercion blocking)
- `support` (customer support / fewer false positives)
- `public-api` (open endpoints / hardened)

### 2) Reproducible metrics (precision / recall)
Bench scripts should emit:
- precision/recall/F1
- confusion matrix
- false-positive rate on normal conversations
- top flags per dataset

### 3) Copy-paste integrations
Provide ready-to-use adapters:
- Express middleware
- Fastify plugin
- Next.js / Vercel edge wrapper
- “pre-gate” helpers for LangChain-style pipelines

### 4) One real production example
A minimal public case study:
- traffic volume
- % blocked
- cost avoided
- rate-limit incidents reduced
- latency improvement for blocked traffic