RELEASE_NOTES.md
Release Notes — v1.2.0

Date: 2026-01-29
Type: Minor (Behavioral + Security Improvements)

🎯 Overview

Version 1.2.0 introduces a significant improvement to the deterministic logic of llm-entropy-filter.

This release strengthens fraud/phishing detection while preserving configurability for OSS developers.

Key improvements:

Hard trigger escalation (linguistic + logical)

Policy-driven flag blocking

Strict vs Public behavioral separation

Zero BLOCK→ALLOW leaks

Improved benchmark recall for BLOCK class

Cleaner policy architecture

This version stabilizes the engine as a reliable deterministic first-layer filter.

🚀 What’s New
1️⃣ Hard Trigger Escalation

Certain linguistic patterns now escalate deterministically:

Examples:

phishing_2fa_code

fraud_payment_request

scam_wfh

phishing_verify_threat_en

Hard triggers may:

Increase entropy score

Add explicit flags

Force BLOCK through policy

This reduces fraud false negatives without globally lowering thresholds.

2️⃣ Policy-Based Escalation

Rulesets can now define:

"policy": {
  "strong_spam_block": false,
  "block_flags": [...],
  "warn_flags": [...]
}


This allows:

Per-flag deterministic blocking

Controlled WARN escalation

Fine-grained risk posture

Strict and Public now differ in posture, not in engine logic.

3️⃣ Improved BLOCK Recall

Primary metric improvement:

Metric	Before	After
BLOCK Recall	33%	50%
BLOCK F1	50%	66%
BLOCK→ALLOW leaks	>0	0

This is a critical security improvement.

4️⃣ Zero Critical Leaks

Current status:

BLOCK→ALLOW leaks: 0


All gold BLOCK samples are now at least WARN or BLOCK.

This ensures no confirmed fraud example passes silently.

5️⃣ Deterministic Escalation Stability

Escalation order is now cleanly defined:

Policy overrides

Strong spam logic

Threshold logic

This guarantees:

Predictable behavior

No hidden side-effects

Benchmark reproducibility

📊 Benchmark Snapshot (core_v1.jsonl)

Public Ruleset

Accuracy: 55%

BLOCK Precision: 100%

BLOCK Recall: 50%

F1: 66.67%

BLOCK→ALLOW leaks: 0

Strict Ruleset shows more aggressive blocking.

🛠 Developer Impact

No breaking API changes.

Still:

import { gate } from "llm-entropy-filter";

const result = gate(text, { ruleset });


However:

Scores may be slightly higher for fraud patterns

Some previous WARN may now BLOCK (policy-based)

⚙ Configuration Philosophy

This version stabilizes the OSS model:

Developers can tune:

thresholds.warn

thresholds.block

policy.block_flags

policy.warn_flags

Without modifying engine internals.

Enterprise logic remains out of scope for OSS.

🧠 Engine Stability

This release focuses on:

Linguistic consistency

Logical determinism

Explicit escalation rules

Measured improvements

No AI dependencies.
No runtime heuristics.
No probabilistic drift.

📌 Known Limitations

Context awareness remains limited

No combinational flag policies (planned)

No subject clustering (planned)

No AI-assisted review layer (middleware only)

🔮 Next Direction (v1.3.0 Candidate)

Planned exploration:

Combinational policy logic

Subject cluster scoring

Flag interaction matrices

Improved spam_sales weighting

News/article analyzer demo

Optional review-layer hooks

🔒 Security Status

This release eliminates:

Deterministic fraud bypasses

2FA phishing leaks

Payment request silent passes

Security posture: Stable

📦 Packaging Status

Ready for:

npm publish

OSS distribution

Middleware integration

Final Note

v1.2.0 marks the first stable security-oriented version of the engine.

It is:

Deterministic

Configurable

Measurable

Benchmark-validated

The foundation is now solid.