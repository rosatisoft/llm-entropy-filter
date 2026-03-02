// src/types.ts

export type GateAction = "ALLOW" | "WARN" | "BLOCK";

/**
 * IntentionType is consumed by src/intention.ts
 * Keep it small + extendable (avoid breaking changes).
 */
export type IntentionType =
  | "unknown"
  | "benign"
  | "support"
  | "request_help"
  | "marketing_spam"
  | "phishing"
  | "fraud"
  | "scam"
  | "misinformation"
  | "manipulation"
  | "conspiracy";

/** Deterministic entropy analysis (no AI). */
export interface EntropyAnalysis {
  /** 0..1 */
  score: number;
  flags: string[];
  rationale?: string;
}

/** Deterministic intention evaluation (still no AI). */
export interface IntentionEvaluation {
  intention: IntentionType;
  /** 0..1 */
  confidence: number;
  rationale: string;
}

/**
 * Wrapper envelope result (entropy + intention).
 * This matches what src/wrapper.ts returns.
 */
export interface FilterResult {
  entropy_analysis: EntropyAnalysis;
  intention_evaluation: IntentionEvaluation;
}

// ---- Ruleset types (used across gate/rulesets)

export interface RulesetThresholds {
  warn: number;
  block: number;
}

export interface NormalizationConfig {
  lowercase?: boolean;
  trim?: boolean;
  collapse_whitespace?: boolean;
  unicode_nfkc?: boolean;
}

export interface PolicyCombo {
  all: string[];
  any?: string[];
}

export interface RulesetPolicy {
  strong_spam_block?: boolean;

  block_intentions?: IntentionType[];
  warn_intentions?: IntentionType[];

  block_flags?: string[];
  warn_flags?: string[];

  block_combos?: PolicyCombo[];
  warn_combos?: PolicyCombo[];
}

export type TriggerType = "signal" | "topic_hint";

export interface HardTrigger {
  id: string;
  type: TriggerType;
  weight: number;
  patterns: string[];
}

export interface Ruleset {
  name: string;
  version: number;
  description?: string;

  thresholds?: RulesetThresholds;
  normalization?: NormalizationConfig;

  policy?: RulesetPolicy;

  hard_triggers?: HardTrigger[];
}

export interface GateOptions {
  ruleset?: Ruleset;
}

export interface GateResult {
  action: GateAction;
  entropy_score: number;
  flags: string[];
  intention: IntentionType;
  confidence: number;
  rationale: string;
}

// -----------------------------------------------------------------------------
// Backward-compatible aliases (do NOT remove in OSS 1.2.x)
// -----------------------------------------------------------------------------
export type EntropyResult = EntropyAnalysis;
export type Intention = IntentionType;
