llm-entropy-filter

Deterministic linguistic entropy gate for LLM inputs.

llm-entropy-filter is a lightweight, configurable middleware that evaluates text using linguistic and logical entropy signals before it reaches an LLM.

It is not an AI model.
It is a deterministic decision layer.

Why This Exists

Modern LLM systems face:

Spam floods

Phishing attempts

Fraud requests

Prompt injection

Manipulative urgency

Entropic noise

Most systems try to solve this reactively inside the model.

This project solves it before the model.

Order before generation.
Criteria before probability.

Core Principles

Deterministic (no randomness)

Linguistic + logical analysis

Configurable via rulesets

Fully reproducible scoring

No external API calls

Middleware-ready

Architecture Overview
Text
  ↓
Normalization
  ↓
Hard Triggers
  ↓
Topic Signals
  ↓
Entropy Scoring
  ↓
Policy Overrides
  ↓
Threshold Decision
  ↓
ALLOW | WARN | BLOCK

Installation
npm install llm-entropy-filter

Quick Usage
import { gate } from "llm-entropy-filter";
import ruleset from "./rulesets/public-api.js";

const result = gate("FREE prize winner click now claim $100!!!", {
  ruleset
});

console.log(result);


Example output:

{
  "action": "BLOCK",
  "entropy_score": 0.85,
  "flags": ["spam_sales", "money_signal", "shouting"],
  "intention": "marketing_spam",
  "confidence": 0.85
}

Actions
Action	Meaning
ALLOW	Low entropy, safe to process
WARN	Suspicious signals detected
BLOCK	High entropy or deterministic policy match
Rulesets

Behavior is controlled entirely by rulesets.

Each ruleset defines:

thresholds

normalization

hard triggers

topic signals

policy overrides

Example:

{
  "name": "public-api",
  "thresholds": { "warn": 0.4, "block": 0.6 },
  "policy": {
    "block_flags": ["phishing_2fa_code"],
    "warn_flags": ["scam_wfh"]
  }
}

Threshold Logic

Decision is score-based unless overridden by policy.

if score >= block → BLOCK
else if score >= warn → WARN
else → ALLOW

Policy Overrides (Deterministic Control Layer)

Rulesets may define deterministic overrides:

"policy": {
  "block_flags": ["phishing_2fa_code"],
  "warn_flags": ["fraud_payment_request"]
}


Behavior:

If any block_flag matches → BLOCK (independent of score)

If any warn_flag matches → at least WARN

Otherwise → threshold decision

This allows:

Fraud cluster blocking

Linguistic certainty escalation

Safe tuning without lowering global thresholds

Logical Clusters

Entropy is not triggered by single words.

It increases when patterns accumulate.

Example combinations:

spam_kw_click + spam_kw_claim + spam_kw_free

urgency + fraud_payment_request

phishing_verify_threat + money_signal

Suspicion grows with structural density.

This reflects a linguistic-logical principle, not keyword matching alone.

Deterministic Stability Guarantee

For identical input + identical ruleset:

Output is deterministic

Score is reproducible

Flags are traceable

No external calls are made

This makes the gate:

Auditable

Compliance-friendly

Safe for logging

Open-Source Scope

This core version does NOT include:

Context memory

Session tracking

Behavioral anomaly detection

Identity verification

AI secondary review

Adaptive learning

Those belong to orchestration layers or enterprise systems.

This package focuses strictly on:

Linguistic entropy filtering.

Benchmarks

Run metrics:

npm run bench:metrics:public-api
npm run bench:metrics:strict


Reports include:

Accuracy

Precision / Recall

F1 score

Confusion matrix

Per-tag accuracy

Overblock / Underblock rates

The system is fully reproducible.

Tuning Strategy

Do NOT blindly lower thresholds.

Prefer:

Add deterministic block_flags

Adjust pattern weights

Improve signal density

Then adjust thresholds if necessary

This preserves precision while increasing recall safely.

Middleware Mode

Typical production flow:

User Input
   ↓
Entropy Gate
   ↓
ALLOW → LLM
WARN  → Log / Rate-limit / Secondary review
BLOCK → Reject

Philosophy

This project is grounded in a simple idea:

Entropy precedes manipulation.

Linguistic disorder precedes exploitation.

A gate should not think.
It should filter.

Version

Current stable: v1.2.x

Features:

Deterministic entropy scoring

Policy override system

Configurable thresholds

Hard trigger architecture

Cluster-sensitive scoring

Zero BLOCK→ALLOW leaks in benchmark dataset

License

APACHE 2.0