// src/index.ts
export { analyzeEntropy } from "./entropy";
export { evaluateIntention } from "./intention";
export { runEntropyFilter } from "./wrapper";
export { entropyMiddleware } from "./middleware";

export { gate } from "./gate";       // API pública: gate()
export { gateLLM } from "./gate";    // opcional: alias explícito si quieres mantenerlo

export type {
  EntropyAnalysis,
  IntentionEvaluation,
  FilterResult,
  GateResult,
  GateOptions,
  Ruleset,
  RulesetPolicy
} from "./types";
