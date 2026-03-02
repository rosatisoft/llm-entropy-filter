# llm-entropy-filter metrics report

- dataset: `bench/datasets/core_v1.jsonl`
- ruleset: `strict`
- timestamp: `2026-01-29T08-06-05-983Z`

## Summary
- total: **20**
- accuracy: **65.00%**
- avg latency: **0.247 ms**

## Primary (BLOCK)
- precision: **100.00%**
- recall: **83.33%**
- f1: **90.91%**
- TP/FP/FN: **5 / 0 / 1**

## Behavior
- overblock (ALLOW→BLOCK): **0.00%**
- underblock (BLOCK→ALLOW): **0.00%**

## Confusion Matrix (gold rows → predicted cols)

| gold \ pred | ALLOW | WARN | BLOCK |
|---|---:|---:|---:|
| ALLOW | 7 | 0 | 0 |
| WARN  | 6  | 1  | 0  |
| BLOCK | 0 | 1 | 5 |

## Per-tag accuracy (top)
- support: 1/1 (100.00%)
- it: 5/5 (100.00%)
- question: 1/1 (100.00%)
- business: 1/1 (100.00%)
- fraud: 2/2 (100.00%)
- phishing: 2/2 (100.00%)
- storage: 1/1 (100.00%)
- scam: 1/1 (100.00%)
- dev: 2/2 (100.00%)
- writing: 1/1 (100.00%)
- urgency: 4/5 (80.00%)
- spam: 2/3 (66.67%)
