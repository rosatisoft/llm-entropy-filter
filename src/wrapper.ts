// src/wrapper.ts
import { analyzeEntropy } from "./entropy";
import { evaluateIntention } from "./intention";
import type { FilterResult } from "./types";

export function runEntropyFilter(text: string): FilterResult {
  const entropy = analyzeEntropy(text);
  const intention = evaluateIntention(text);

  return {
    entropy_analysis: entropy,
    intention_evaluation: intention,
  };
}
