# llm-entropy-filter metrics report

- dataset: `bench/datasets/core_v1.jsonl`
- ruleset: `strict`
- timestamp: `2026-01-28T23-23-11-634Z`

## Summary
- total: **20**
- accuracy: **55.00%**
- avg latency: **0.330 ms**

## Primary (BLOCK)
- precision: **100.00%**
- recall: **50.00%**
- f1: **66.67%**
- TP/FP/FN: **3 / 0 / 3**

## Behavior
- overblock (ALLOW→BLOCK): **0.00%**
- underblock (BLOCK→ALLOW): **50.00%**

## Confusion Matrix (gold rows → predicted cols)

| gold \ pred | ALLOW | WARN | BLOCK |
|---|---:|---:|---:|
| ALLOW | 7 | 0 | 0 |
| WARN  | 6  | 1  | 0  |
| BLOCK | 3 | 0 | 3 |

## Per-tag accuracy (top)
- support: 1/1 (100.00%)
- it: 5/5 (100.00%)
- question: 1/1 (100.00%)
- business: 1/1 (100.00%)
- storage: 1/1 (100.00%)
- dev: 2/2 (100.00%)
- writing: 1/1 (100.00%)
- marketing: 3/4 (75.00%)
- spam: 2/3 (66.67%)
- urgency: 3/5 (60.00%)
- phishing: 1/2 (50.00%)
- conspiracy: 0/4 (0.00%)
