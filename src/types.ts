// src/types.ts

export type EntropyResult = {
  score: number; // 0..1
  flags: string[];
};

export type IntentionType =
  | "unknown"
  | "request_help"
  | "marketing_spam"
  | "manipulation"
  | "conspiracy";

export type IntentionEvaluation = {
  intention: IntentionType;
  confidence: number; // 0..1
  rationale?: string;
};

export type FilterResult = {
  entropy_analysis: EntropyResult;
  intention_evaluation: IntentionEvaluation;
};
