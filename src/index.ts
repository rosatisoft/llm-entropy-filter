// src/index.ts
export { analyzeEntropy } from "./entropy";
export { evaluateIntention } from "./intention";
export { runEntropyFilter } from "./wrapper";
export { entropyMiddleware } from "./middleware";

export type {
  EntropyResult,
  IntentionEvaluation,
  FilterResult
} from "./types";
export * from "./gate";
