# llm-entropy-filter metrics report

- dataset: `bench/datasets/core_v1.jsonl`
- ruleset: `strict`
- timestamp: `2026-01-29T05-18-17-697Z`

## Summary
- total: **20**
- accuracy: **65.00%**
- avg latency: **0.419 ms**

## Primary (BLOCK)
- precision: **100.00%**
- recall: **83.33%**
- f1: **90.91%**
- TP/FP/FN: **5 / 0 / 1**

## Behavior
- overblock (ALLOW→BLOCK): **0.00%**
- underblock (BLOCK→ALLOW): **16.67%**

## Confusion Matrix (gold rows → predicted cols)

| gold \ pred | ALLOW | WARN | BLOCK |
|---|---:|---:|---:|
| ALLOW | 7 | 0 | 0 |
| WARN  | 6  | 1  | 0  |
| BLOCK | 1 | 0 | 5 |

## Per-tag accuracy (top)
- spam: 3/3 (100.00%)
- support: 1/1 (100.00%)
- it: 5/5 (100.00%)
- question: 1/1 (100.00%)
- business: 1/1 (100.00%)
- storage: 1/1 (100.00%)
- scam: 1/1 (100.00%)
- dev: 2/2 (100.00%)
- writing: 1/1 (100.00%)
- urgency: 4/5 (80.00%)
- marketing: 3/4 (75.00%)
- fraud: 1/2 (50.00%)
