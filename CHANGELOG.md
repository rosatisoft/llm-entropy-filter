[1.2.0] – 2026-01-29
Major Improvements

Introduced policy-based deterministic overrides

block_flags

warn_flags

Implemented hard escalation independent of entropy score.

Eliminated BLOCK → ALLOW leaks in benchmark dataset.

Improved logical signal clustering behavior.

Refactored gate.ts decision flow for clearer policy precedence.

Decision Flow Order (Updated)

Score calculation

Policy overrides

Threshold comparison

Final action resolution

Security Improvements

Deterministic phishing escalation (phishing_2fa_code)

Fraud payment request detection

Scam work-from-home detection

Strong spam clustering logic

Shouting + money signal amplification

Metrics (public-api preset)

Recall improved from 33% → 50%

F1 improved to 66.67%

BLOCK→ALLOW leaks: 0

Deterministic behavior confirmed

Internal Refactors

Cleaned entropy.ts

Cleaned gate.ts decision logic

Clarified ruleset schema

Improved type safety

[1.1.0] – 2026-01-28
Added

Configurable strong_spam_block policy option

Initial policy override support

Ruleset-level normalization controls

Benchmark CLI metrics runner

Improvements

Improved spam keyword coverage

Added urgency detection

Added fraud signal hints

Added link detection patterns

Known Limitations

Contextual false negatives on isolated phishing patterns

No cluster-based deterministic override

Score-only dependency in some edge cases

[1.0.0] – Initial Release
Features

Deterministic entropy scoring engine

Hard trigger system

Topic hint architecture

Threshold-based decisions (warn / block)

Public API preset

Strict preset

CLI benchmark tool

Philosophy

Linguistic entropy detection

Deterministic filtering

Middleware-first design

Roadmap (Next Minor Versions)
Planned for 1.3.x

Flag cluster policies (block on combination)

Configurable signal groups

Weighted cluster escalation

Expanded multilingual patterns

Subject/intent classification layer

Future (Enterprise Layer – Separate Project)

Context memory

Behavioral pattern tracking

Secondary AI review pipeline

Adaptive thresholding

Admin dashboard

Threat intelligence feeds

Versioning Philosophy

This project evolves by:

Increasing determinism

Improving recall without sacrificing precision

Strengthening policy clarity

Maintaining reproducibility

No hidden behavior.
No silent escalation.
No model dependency.