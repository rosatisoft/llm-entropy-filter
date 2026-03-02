# llm-entropy-filter metrics report

- dataset: `bench/datasets/core_v1.jsonl`
- ruleset: `public-api`
- timestamp: `2026-01-29T08-06-03-533Z`

## Summary
- total: **20**
- accuracy: **55.00%**
- avg latency: **0.350 ms**

## Primary (BLOCK)
- precision: **100.00%**
- recall: **50.00%**
- f1: **66.67%**
- TP/FP/FN: **3 / 0 / 3**

## Behavior
- overblock (ALLOW→BLOCK): **0.00%**
- underblock (BLOCK→ALLOW): **0.00%**

## Confusion Matrix (gold rows → predicted cols)

| gold \ pred | ALLOW | WARN | BLOCK |
|---|---:|---:|---:|
| ALLOW | 7 | 0 | 0 |
| WARN  | 6  | 1  | 0  |
| BLOCK | 0 | 3 | 3 |

## Per-tag accuracy (top)
- support: 1/1 (100.00%)
- it: 5/5 (100.00%)
- question: 1/1 (100.00%)
- business: 1/1 (100.00%)
- phishing: 2/2 (100.00%)
- storage: 1/1 (100.00%)
- dev: 2/2 (100.00%)
- writing: 1/1 (100.00%)
- urgency: 3/5 (60.00%)
- marketing: 2/4 (50.00%)
- fraud: 1/2 (50.00%)
- spam: 1/3 (33.33%)
