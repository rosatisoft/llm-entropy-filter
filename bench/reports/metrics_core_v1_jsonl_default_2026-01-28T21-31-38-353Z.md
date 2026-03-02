# llm-entropy-filter metrics report

- dataset: `bench/datasets/core_v1.jsonl`
- ruleset: `default`
- timestamp: `2026-01-28T21-31-38-353Z`

## Summary
- total: **20**
- accuracy: **55.00%**
- avg latency: **0.211 ms**

## Primary (BLOCK)
- precision: **100.00%**
- recall: **33.33%**
- f1: **50.00%**
- TP/FP/FN: **2 / 0 / 4**

## Behavior
- overblock (ALLOW→BLOCK): **0.00%**
- underblock (BLOCK→ALLOW): **50.00%**

## Confusion Matrix (gold rows → predicted cols)

| gold \ pred | ALLOW | WARN | BLOCK |
|---|---:|---:|---:|
| ALLOW | 7 | 0 | 0 |
| WARN  | 5  | 2  | 0  |
| BLOCK | 3 | 1 | 2 |

## Per-tag accuracy (top)
- marketing: 4/4 (100.00%)
- support: 1/1 (100.00%)
- it: 5/5 (100.00%)
- question: 1/1 (100.00%)
- business: 1/1 (100.00%)
- storage: 1/1 (100.00%)
- dev: 2/2 (100.00%)
- writing: 1/1 (100.00%)
- spam: 2/3 (66.67%)
- urgency: 3/5 (60.00%)
- conspiracy: 0/4 (0.00%)
- vague: 0/4 (0.00%)
