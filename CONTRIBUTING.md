CONTRIBUTING.md
Contributing to llm-entropy-filter

Thank you for your interest in contributing.

This project is a deterministic linguistic risk engine.
It prioritizes:

Transparency

Measurability

Logical consistency

Deterministic behavior

Before contributing, please read this document carefully.

1. Philosophy

This is not a machine learning project.

It is not:

An AI wrapper

A black-box classifier

A content moderation ideology engine

It is:

A deterministic entropy scoring engine

A configurable risk classifier

A measurable linguistic system

All contributions must preserve:

Determinism

Explainability

Benchmarkability

2. Types of Contributions Welcome

We accept:

✅ Pattern improvements

New fraud/phishing patterns

Multilingual coverage

Regex refinement

✅ Weight tuning (with justification)

Adjusting signal weights

Improving entropy balance

Reducing false positives/negatives

✅ Logical escalation rules

Flag combinations

Risk clusters

Structural manipulation detection

✅ Benchmark improvements

Expanding test datasets

Improving metrics clarity

Tag-level accuracy improvements

✅ Documentation improvements

README clarity

Examples

Performance explanations

3. What We Do NOT Accept

We do not accept:

❌ Random threshold lowering to “boost recall”
❌ Hardcoded censorship rules
❌ Ideological filters
❌ Non-deterministic behavior
❌ Hidden heuristics
❌ Silent breaking changes

If a change cannot be measured via benchmarks, it will not be merged.

4. Development Setup

Clone:

git clone https://github.com/<your-repo>/llm-entropy-filter
cd llm-entropy-filter
npm install


Build:

npm run build


Run benchmarks:

npm run bench:metrics:public-api
npm run bench:metrics:strict

5. Benchmark Requirement

Every meaningful engine change must:

Include benchmark results

Compare before/after metrics

Justify trade-offs

At minimum, report:

Accuracy

Precision (BLOCK)

Recall (BLOCK)

F1

Confusion matrix

If your change improves recall but reduces precision, explain why.

6. Ruleset Contributions

Rulesets live in:

/rulesets


Rulesets may include:

thresholds

policy

normalization

hard_triggers

Contributions must:

Maintain valid JSON

Preserve backward compatibility

Avoid breaking the public API

7. Signal Contributions

Signals must include:

{
  id: string,
  type: "signal" | "topic_hint",
  weight: number,
  patterns: string[]
}


Guidelines:

Weight range: 0.05 – 0.30

Avoid duplicate semantics

Avoid vague patterns

Prefer structural over semantic triggers

Bad example:

"patterns": ["bad message"]


Good example:

"patterns": ["\\bverify your account\\b"]

8. Logical Escalation Rules

Escalation logic must be:

Deterministic

Explicit

Documented

Example:

if fraud_payment_request → score >= 0.55


Escalations must never:

Override policy silently

Bypass threshold logic

Introduce randomness

9. Pull Request Guidelines

Each PR must include:

Clear description

Motivation

Before/after benchmark output

Explanation of trade-offs

Small regex fixes do not require full benchmark runs, but must explain impact.

10. Versioning

We follow semantic versioning:

PATCH → small fixes

MINOR → new signals or rules

MAJOR → breaking changes

Engine logic changes that alter classification behavior require at least MINOR.

11. Code Style

TypeScript strict mode

Explicit types for public interfaces

No implicit any

Avoid dynamic magic

Keep core logic readable

Clarity > cleverness.

12. Security Considerations

If you discover:

Bypass patterns

High-confidence fraud leaks

Logical contradictions

Open an issue labeled:

[security]


If critical, contact maintainers directly.

13. Enterprise Extensions

Enterprise features are not part of this repository.

OSS Core includes only:

Deterministic engine

Rule-based escalation

Configurable policy

Benchmark tooling

Contextual AI review layers belong to separate projects.

14. Final Note

This project exists to prove that:

Deterministic linguistic systems can be transparent, measurable, and configurable.

If your contribution makes the engine:

More predictable

More measurable

More logically sound

It is welcome.

If it makes the engine:

More opaque

More ideological

Less deterministic

It will not be merged.