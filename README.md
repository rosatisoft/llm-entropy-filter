# llm-entropy-filter

Minimal, fast **entropy + intent gate** for LLM inputs.

This package detects high-entropy patterns (spam, coercion, vague conspiracies, pseudo-science, truth relativism, broken causality) and returns:

- `entropy_analysis` → `{ score: 0..1, flags: string[] }`
- `intention_evaluation` → `{ intention, confidence, rationale }`

Use it as a **pre-filter** (middleware/wrapper) to:
- block low-signal / high-entropy prompts,
- warn and request reformulation,
- reduce hallucinations and unnecessary LLM calls.

---

## Install

```bash
npm i llm-entropy-filter


Quickstart
import { runEntropyFilter } from "llm-entropy-filter";

const r = runEntropyFilter("¡¡COMPRA YA!! Oferta limitada 90% OFF $$$");
console.log(r.entropy_analysis.score, r.entropy_analysis.flags);
console.log(r.intention_evaluation);


Output example (Entropy Trap)
Input:
“La física cuántica ya demostró… tú decretas… no hay verdad objetiva…”
Result:
{
  "entropy_analysis": {
    "score": 1,
    "flags": [
      "urgency",
      "pseudo_science_quantum",
      "magic_manifesting",
      "truth_relativism",
      "broken_causality"
    ]
  },
  "intention_evaluation": {
    "intention": "misinformation",
    "confidence": 0.85,
    "rationale": "Detecté patrón de pseudo-ciencia/pensamiento mágico/relativismo de la verdad; alta probabilidad de desinformación o argumento sin anclaje causal."
  }
}


Recommended usage: ALLOW / WARN / BLOCK
A simple policy layer on top of entropy_analysis.score:
< 0.25 → ALLOW
0.25 – 0.60 → WARN (ask user to clarify / add evidence)
> 0.60 → BLOCK (reject or require rewrite)
Example:
import { runEntropyFilter } from "llm-entropy-filter";

function verdict(score: number) {
  if (score > 0.6) return "BLOCK";
  if (score >= 0.25) return "WARN";
  return "ALLOW";
}

export function gate(text: string) {
  const r = runEntropyFilter(text);
  return { action: verdict(r.entropy_analysis.score), ...r };
}


CLI / Demo
npm run demo


Benchmark
Heuristic filter throughput (local):
npm run bench

Example output:
~313k ops/sec (200k loops)

API
runEntropyFilter(text: string)
Returns:
entropy_analysis: { score: number; flags: string[] }
intention_evaluation: { intention: "unknown" | "request_help" | "marketing_spam" | "manipulation" | "conspiracy" | "misinformation"; confidence: number; rationale?: string }

Design goals
Fast: pure heuristics, no network calls
Portable: works in any Node environment
Composable: use as middleware/wrapper before calling an LLM
Transparent: flags explain why a prompt is risky

Roadmap
gate() helper exported by the library (standard thresholds)
Optional suggested_rewrite (ask for evidence/context to reduce entropy)
Example integrations: Next.js / Vercel API Route, Express, Cloudflare Workers
Comparative benchmark: LLM calls with vs without gating

---

## Conceptual Model

This package is a **pre-reasoning coherence gate** for LLM pipelines.

It does not “solve philosophy” or attempt to prove metaphysical claims.
Instead, it enforces minimal structural constraints **before** an LLM call:

- Signal vs noise separation
- Causal coherence (rejects broken-causality framing)
- Detection of manipulative patterns (spam / coercion)
- Detection of pseudo-scientific or relativistic framing

**Goal:** reduce computational entropy and hallucination risk by preventing
high-noise or structurally incoherent inputs from reaching the model.

---

## License

This project is licensed under the **Apache License 2.0**.

Copyright (c) 2026 Ernesto Rosati

You are free to:

- Use the software for personal or commercial purposes  
- Modify the source code  
- Distribute original or modified versions  

Under the following conditions:

- You must retain the original copyright notice  
- You must include a copy of the Apache 2.0 license  
- Any modifications must be clearly documented  

### Attribution & Support

If you use this project in production systems or commercial applications,
please retain attribution to the original author.

Voluntary collaboration, sponsorship, or technical partnership inquiries are welcome.

For the full license text, see the `LICENSE` file in this repository.
