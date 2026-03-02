SECURITY.md
Security Policy

Thank you for helping improve the security and robustness of llm-entropy-filter.

This project is a deterministic linguistic risk engine.
Security here means:

Preventing bypass of known fraud/phishing patterns

Avoiding logical inconsistencies

Preventing unintended classification leaks

Maintaining deterministic and explainable behavior

1. Supported Versions

We currently provide security support for:

Version	Supported
1.2.x	✅ Yes
< 1.2.0	❌ No

Older versions may contain known weaknesses and will not receive fixes.

2. What Counts as a Security Issue

Security issues include:

🔴 High Severity

Confirmed fraud/phishing messages classified as ALLOW

Deterministic bypass of hard triggers

Logical escalation inconsistencies

Pattern injection vulnerabilities

Policy override bugs

Threshold bypass through malformed input

🟡 Medium Severity

Significant false negatives in fraud clusters

Escalation logic not triggering when expected

Regex patterns that can be trivially evaded

Improper normalization handling

🟢 Low Severity

Minor weight imbalances

Non-critical false positives

Documentation inconsistencies

3. What Is NOT a Security Issue

The following are not considered security vulnerabilities:

Disagreement with threshold defaults

Different moderation philosophy

Political or ideological complaints

Feature requests

AI integration limitations

This is a deterministic engine, not a censorship system.

4. Reporting a Vulnerability

If you believe you’ve discovered a security issue:

Please open an issue labeled:

[security]


Include:

Version number

Example input

Expected behavior

Actual behavior

Reproduction steps

Benchmark impact (if applicable)

If the issue is sensitive (e.g. exploit pattern), contact maintainers privately.

5. Responsible Disclosure

We request:

Do not publicly disclose exploit details before fix.

Allow maintainers reasonable time to investigate.

Provide reproducible evidence.

We commit to:

Respond within a reasonable timeframe

Provide fix or mitigation guidance

Release patch version if required

6. Threat Model

This engine protects against:

Phishing attempts

Fraud patterns

Manipulative urgency tactics

Scam language structures

High-entropy spam signals

It does NOT protect against:

Zero-day social engineering

Multi-step contextual deception

AI-generated adaptive attacks

Human review failures

It is a deterministic first-layer filter.

7. Security Design Principles

The engine follows:

Determinism

Same input → same output

Transparency

All decisions are traceable to:

Score

Flags

Policy

Thresholds

Configurability

Security posture can be tuned via:

thresholds

policy

hard_triggers

Measurability

All changes are benchmark-validated.

8. Hard Triggers and Escalation Safety

Certain signals are escalated deterministically:

Examples:

phishing_2fa_code

fraud_payment_request

phishing_verify_threat_en

These may:

Force BLOCK

Elevate score

Override thresholds

All escalation logic must remain explicit and documented.

9. Regex and Pattern Safety

All contributed patterns must:

Avoid catastrophic backtracking

Avoid excessive wildcards

Be performance safe

Be benchmark validated

Patterns must not introduce:

ReDoS vulnerabilities

Runtime exponential behavior

10. AI Review Layers

AI-based review systems are:

Not part of OSS core

Optional middleware integrations

Separate from deterministic engine

Security of external AI layers is outside the scope of this repository.

11. Security Updates

Security patches will:

Increment PATCH or MINOR version

Be documented in CHANGELOG.md

Include benchmark comparisons

Critical issues may require urgent release.

12. Final Note

Security in this project means:

Logical rigor

Pattern clarity

Deterministic escalation

Measured improvement

If you discover a bypass, we want to know.

If you find a weakness, document it.

If you propose a fix, benchmark it.

That is how this engine evolves safely.