ENGINE_SPEC.md
llm-entropy-filter – Engine Specification

Version: 1.2.x
Status: Stable OSS Core

1. Purpose

The Entropy Filter Engine is a deterministic linguistic risk classifier.

Its goal is to:

Detect high-entropy linguistic signals

Classify risk levels (ALLOW / WARN / BLOCK)

Apply deterministic escalation rules

Remain transparent and configurable

The engine does not:

Use AI internally

Store context

Learn dynamically

Modify thresholds automatically

It is purely rule-based and deterministic.

2. High-Level Architecture

Pipeline:

Input Text
    ↓
Normalization
    ↓
Hard Trigger Matching
    ↓
Topic Detection
    ↓
Entropy Scoring
    ↓
Decision Resolution (threshold + policy)
    ↓
GateResult

3. Normalization Stage

Configurable via ruleset:

"normalization": {
  "lowercase": true,
  "trim": true,
  "collapse_whitespace": true,
  "unicode_nfkc": true
}


Operations:

Lowercasing

Whitespace collapsing

Unicode normalization (NFKC)

Trimming

Goal: remove superficial variance before pattern matching.

4. Signal Model

Signals are extracted via:

Hard triggers

Topic hints

Keyword detectors

Each signal has:

id

type

weight

pattern(s)

Example:

{
  "id": "shouting",
  "type": "signal",
  "weight": 0.22,
  "patterns": ["[A-ZÁÉÍÓÚÑ]{5,}", "!!+"]
}

5. Signal Types
signal

Direct entropy contribution.

Examples:

shouting

links

urgency

topic_hint

Contextual classification hints.

Examples:

money_signal

spam_sales

fraud_payment_request

phishing_2fa_code

6. Entropy Scoring

Entropy score is a bounded value in range:

0.0 – 1.0

Base Computation

Entropy score is computed as:

score = Σ(signal_weight)


Clamped:

score = clamp(0, 1)

7. Logical Escalation (v1.2.x)

The engine supports logical escalation before threshold resolution.

Escalation Conditions

Examples implemented:

Fraud payment request → force score ≥ 0.55

Phishing 2FA code → force score ≥ 0.55

Phishing verify + threat → force score ≥ 0.7

Combined spam + money + shouting → higher entropy

This ensures:

Critical fraud signals cannot be buried under low weight totals

Risk reflects logical structure, not just arithmetic

8. Threshold Resolution

Each ruleset defines:

"thresholds": {
  "warn": 0.4,
  "block": 0.6
}


Resolution:

if score >= block → BLOCK
else if score >= warn → WARN
else → ALLOW

9. Policy Overrides

Rulesets may define policy overrides.

Example:

"policy": {
  "strong_spam_block": false,
  "block_flags": ["phishing_2fa_code"],
  "warn_flags": ["fraud_payment_request"]
}


Policy logic:

If flag ∈ block_flags → BLOCK

Else if flag ∈ warn_flags → WARN

Else resolve by score

Policy overrides always take precedence over thresholds.

10. Strong Spam Mode

If enabled:

"strong_spam_block": true


Then:

if hasSpam && hasMoneySignals → BLOCK


This is optional and configurable.

11. Decision Function

Core resolution:

decideAction({
  score,
  warnT,
  blockT,
  strongSpam,
  intention,
  flags,
  policy
})


Priority order:

Policy block flags

Policy warn flags

Strong spam logic

Threshold resolution

Default ALLOW

12. Gate Result Structure

Return object:

{
  action: "ALLOW" | "WARN" | "BLOCK",
  entropy_score: number,
  flags: string[],
  intention: string,
  confidence: number,
  rationale: string
}


Definitions:

action: final decision

entropy_score: computed risk score

flags: triggered signal IDs

intention: classified intent

confidence: deterministic confidence estimate

rationale: explanation text (if applicable)

13. Determinism Guarantee

For identical:

text

ruleset

engine version

Output is identical.

There is no randomness.
There is no hidden state.

14. Benchmarking

The engine includes:

bench/metrics.mjs


Metrics:

Accuracy

Precision (BLOCK)

Recall (BLOCK)

F1

Confusion matrix

Per-tag accuracy

This ensures measurable evolution across versions.

15. Known Limitations

No cross-message context

No behavioral tracking

No semantic understanding beyond patterns

No adaptive learning

Context is purely linguistic

16. Design Philosophy

The entropy engine follows these principles:

Linguistic signals reflect entropy.

Logical escalation is superior to blind threshold lowering.

Deterministic systems must be transparent.

Policy is separate from scoring.

AI (if used) must be secondary, never primary.

17. Future Extensions

Planned (see ROADMAP):

Flag cluster escalation

Subject-weight tables

Structured signal graph

Expanded multilingual coverage

Middleware LLM review layer (optional)

18. Separation of Concerns

OSS Core:

Deterministic scoring

Rule-based escalation

Configurable thresholds

Policy overrides

Enterprise (separate project):

Contextual memory

Behavioral risk modeling

Monitoring dashboards

Threat intelligence feeds

19. Security Philosophy

Entropy is treated as:

Linguistic disorder that correlates with manipulation risk.

The engine does not censor ideas.

It flags structural manipulation signals.

20. Final Note

This engine is not a moral arbiter.
It is a deterministic linguistic risk detector.

Transparency over opacity.
Logic over heuristics.
Configuration over guesswork.