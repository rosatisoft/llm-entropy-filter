ROADMAP

This document describes the planned evolution of llm-entropy-filter.

The roadmap is divided into:

Core OSS evolution

Middleware enhancements

Advanced logical escalation

Enterprise (separate layer)

Current State – v1.2.0

The engine is:

Deterministic

Linguistically driven

Threshold-configurable

Policy-aware

Leak-free (BLOCK → ALLOW = 0 in benchmark)

Core capabilities:

Entropy-based scoring

Hard triggers

Topic hints

Policy overrides (block_flags, warn_flags)

Configurable thresholds

CLI benchmark system

This is a stable Open Source base.

v1.3.x – Logical Escalation & Cluster Policies

Focus: smarter deterministic logic without AI dependency.

1. Flag Cluster Escalation

Allow deterministic BLOCK when certain flag combinations appear.

Example:

spam_kw_click + spam_kw_claim + spam_kw_free
→ BLOCK


This avoids over-relying on raw entropy score.

Planned additions:

block_combinations

warn_combinations

Configurable minimum cluster size

2. Signal Grouping

Introduce logical signal categories:

spam_cluster

fraud_cluster

phishing_cluster

manipulation_cluster

This allows:

Threshold per cluster

Escalation by cluster density

Clearer reporting

3. Expanded Pattern Coverage

Improve multilingual detection:

Spanish phishing variants

Latin American fraud slang

Manipulative urgency phrases

Crypto scam patterns

Fake investment signals

4. Deterministic Intent Layer (Lightweight)

Introduce structured intent classification:

marketing_spam

phishing

fraud

scam

manipulation

legitimate_support

unknown

Still deterministic.
Still no AI required.

v1.4.x – Configurable Risk Tables

Focus: configurability without complexity.

1. Subject / Topic Weight Tables

Move toward configurable weight matrices:

subject_weights:
  phishing:
    base_weight: 0.5
    escalation_threshold: 2 signals


This allows deployments to:

Tune risk per industry

Adjust abuse sensitivity

Adapt to local threat profiles

2. Preset Profiles

Introduce official presets:

relaxed

public-api

strict

high-risk

These would be maintained in-repo.

v2.0 – Structured Entropy Engine

Focus: architectural clarity.

Goals

Separate scoring pipeline into modules:

normalization

pattern matching

signal aggregation

entropy scoring

decision resolution

Formal signal graph model

Full test coverage

Documented scoring algorithm

Middleware Enhancement Layer (Optional)

Not part of OSS core logic.

Optional second-stage review:

If WARN → send to LLM review
If BLOCK → auto-reject
If ALLOW → pass-through


Design goal:

AI is verification, not decision-maker.

Enterprise Layer (Separate Project)

Not included in OSS roadmap.

Would include:

Contextual session tracking

Behavior memory

Adaptive thresholds

Abuse rate monitoring

Dashboard

Risk analytics

Review queue

Threat intelligence updates

Enterprise = operational orchestration.
OSS = deterministic core engine.

Testing Roadmap
Expand benchmark dataset

Increase dataset from 20 → 200+ samples:

Fraud

Phishing

Investment scams

Legitimate marketing

Technical support

Political narratives

News headlines

Add real-world evaluation tool

Planned CLI:

node tools/analyze-news.mjs <url>


or

node tools/analyze-file.mjs sample.txt


For:

News scanning

Bulk moderation

Research evaluation

Design Principles Going Forward

Determinism first

Linguistics over heuristics

Logical escalation over brute threshold lowering

No silent behavior

Configurable but predictable

Clear separation between scoring and policy

What We Will NOT Do

Hidden AI decision layers in OSS

Black-box scoring

Automatic self-modifying thresholds

Non-deterministic filtering

Long-Term Vision

The entropy filter becomes:

A linguistic risk engine

A deterministic moderation core

A middleware guardrail for LLM systems

A configurable abuse-detection kernel

AI optional.
Logic mandatory.