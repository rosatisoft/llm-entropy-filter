// src/wrapper.ts
import type { Ruleset, FilterResult } from "./types";
import { analyzeEntropy } from "./entropy";
import { evaluateIntention } from "./intention";

export function runEntropyFilter(input: string, ruleset?: Ruleset): FilterResult {
  const entropy_analysis = analyzeEntropy(input, ruleset);
  const intention_evaluation = evaluateIntention(input, entropy_analysis.flags, ruleset);

  return { entropy_analysis, intention_evaluation };
}
