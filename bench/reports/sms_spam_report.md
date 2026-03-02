# SMS Spam Bench Report
- Dataset: `sms_spam.csv`
- Samples: **39**
- Runtime: **3 ms**
- Throughput: **13000 samples/sec**

## Actions
- ALLOW: **30** (76.92%)
- WARN: **4** (10.26%)
- BLOCK: **5** (12.82%)

## Savings (simple model)
- Calls avoided (BLOCK): **5** (12.82%)

## Confusion (ground truth label → action)
- spam → ALLOW/WARN/BLOCK: **10/4/5**
- ham  → ALLOW/WARN/BLOCK: **20/0/0**

## Top Flags
- `spam_keywords_en`: 15
- `spam_kw_free`: 4
- `spam_sales`: 4
- `spam_kw_winner`: 3
- `spam_kw_prize`: 3
- `spam_kw_click`: 3
- `spam_kw_urgency_en`: 3
- `money_signal`: 2
- `spam_kw_claim`: 2
- `spam_kw_verify`: 2
- `spam_kw_delivery`: 2
- `shouting`: 1
- `spam_kw_loan`: 1
- `spam_kw_crypto`: 1
- `spam_kw_refund`: 1

## Top Intentions
- `unknown`: 23
- `marketing_spam`: 16
