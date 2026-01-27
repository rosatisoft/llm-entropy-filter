README.md reescrito (v1.0.0 listo para publicar)

Basado en tu README actual 

README (5)

, aquí va una versión limpia, con tus métricas reales, endpoints, bench y dataset.

Copia y pega esto como README.md:

# llm-entropy-filter

Minimal, fast **entropy + intent gate** for LLM inputs.

This package runs a **local, deterministic heuristic gate** to detect high-entropy / low-signal inputs (spam, coercion, vague conspiracies, pseudo-science, truth relativism, broken causality) and returns an **ALLOW / WARN / BLOCK** verdict.

Use it **before** calling an LLM to reduce hallucinations, cost, and risk.

---

## What you get

### Core (library)
- `gate(text)` → `{ action, entropy_score, flags, intention, confidence, rationale }`
- `gateLLM(text)` → alias of `gate(text)` (kept for compatibility)
- `runEntropyFilter(text)` → underlying entropy + intention analysis utilities

### Demo (server)
- `POST /analyze` → runs local `gate(text)` + returns `meta.ts` + `meta.version`
- `POST /triad` → optional OpenAI analysis (only if `OPENAI_API_KEY` is set)

---

## Install

```bash
npm i llm-entropy-filter

Quickstart (library)
import { gate } from "llm-entropy-filter";

const r = gate("¡¡COMPRA YA!! Oferta limitada 90% OFF $$$");
console.log(r);


Example output:

{
  "action": "BLOCK",
  "entropy_score": 0.7,
  "flags": ["urgency","spam_sales","money_signal","shouting"],
  "intention": "marketing_spam",
  "confidence": 0.85,
  "rationale": "Detecté señales de venta agresiva/urgencia/dinero."
}

Demo server (Express)

Start:

npm run serve


Health:

curl -s http://127.0.0.1:3000/health


Local gate:

curl -s -X POST http://127.0.0.1:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Congratulations! You won a FREE iPhone. Click here to claim now!"}' | jq .


You will also see:

"meta": { "ts": 1769546511060, "version": "1.0.0" }

Optional: OpenAI triad demo
export OPENAI_API_KEY="YOUR_KEY"
export OPENAI_MODEL="gpt-4.1-mini"

curl -s -X POST http://127.0.0.1:3000/triad \
  -H "Content-Type: application/json" \
  -d '{"text":"Vivimos en una simulación y todos lo esconden."}' | jq .


/triad is a demo layer. The product is the local gate().

Benchmarks (measured)
HTTP gate /analyze (local, deterministic)

Command:

npx autocannon -m POST -c 30 -d 10 --renderStatusCodes \
  http://127.0.0.1:3000/analyze \
  -H "Content-Type: application/json" \
  -b '{"text":"Congratulations. You won a FREE iPhone. Click here to claim now."}'


Observed (typical run):

~5.2k req/s

~5.1 ms avg latency (p50 ~4 ms)

LLM demo /triad (OpenAI)

Command:

npx autocannon -m POST -c 2 -d 30 --renderStatusCodes \
  http://127.0.0.1:3000/triad \
  -H "Content-Type: application/json" \
  -b '{"text":"Texto real de prueba (1-3 párrafos) ..."}'


Observed (typical run):

~1.7 req/s

~1.17 s avg latency

Dataset mini + bench script (no HTTP)

A tiny CSV lives at:

bench/sms_spam.csv

Run the bench:

node bench/sms_spam_bench.mjs bench/sms_spam.csv
cat bench/reports/sms_spam_report.md


Typical report:

Throughput: ~9–10k samples/sec

Actions: ALLOW / WARN / BLOCK distribution

Confusion table (ground truth spam/ham → action)

Top flags + intentions

JSON + Markdown reports written to bench/reports/

Design goals

Fast: pure heuristics, no network calls

Portable: works in any Node environment

Composable: middleware/wrapper before calling an LLM

Transparent: flags explain why an input is risky

Observable: /analyze returns meta.ts and meta.version

Roadmap

Expand multilingual spam patterns

Optional suggested_rewrite to lower entropy

Example integrations: Next.js / Vercel, Express, Cloudflare Workers

Extended dataset benches + cost-savings estimates

Install:

npm i llm-entropy-filter


Ejemplo mínimo:

import { gate } from "llm-entropy-filter";
console.log(gate("Congratulations. You won a FREE iPhone. Click here."));


Bench results (tu mejor “prueba”):

/analyze ~ 5k req/sec

/triad ~ 1–2 req/sec (LLM)

License

Apache-2.0

Copyright (c) 2026 Ernesto Rosati


---

