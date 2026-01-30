// src/gate.ts
import { runEntropyFilter } from "./wrapper";

export type GateAction = "ALLOW" | "WARN" | "BLOCK";

export type GateResult = {
  action: GateAction;
  entropy_score: number;
  flags: string[];
  intention: string;
  confidence: number;
  rationale: string;
};

export type RulesetThresholds = {
  warn?: number;
  block?: number;
};

export type RulesetPolicy = {
  /** if true, allow strongSpam to force BLOCK */
  strong_spam_block?: boolean;

  /** optional overrides */
  block_intentions?: string[];
  warn_intentions?: string[];

  /** flag overrides */
  block_flags?: string[];
  warn_flags?: string[];
};

export type RulesetConfig = {
  name?: string;
  version?: number;
  description?: string;
  thresholds?: RulesetThresholds;
  policy?: RulesetPolicy;
  // normalization is applied in wrapper/ruleset loader; kept here for completeness
  normalization?: Record<string, unknown>;
};

export type GateConfig = {
  /** Per-call threshold overrides (fallback if ruleset.thresholds not provided) */
  warnThreshold?: number; // default: 0.25
  blockThreshold?: number; // default: 0.60

  /** Optional ruleset (default/strict/public-api) */
  ruleset?: RulesetConfig;
};

/** Clamp 0..1 */
function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

/** Add unique flags preserving order */
function mergeFlags(base: string[], extra: string[]) {
  const set = new Set(base);
  const out = [...base];
  for (const f of extra) {
    if (!set.has(f)) {
      set.add(f);
      out.push(f);
    }
  }
  return out;
}

/**
 * Very small EN spam booster (keyword-ish).
 * Keep it deterministic and cheap. Tune in src/entropy.ts for real weights/patterns.
 */
function englishSpamBooster(text: string): {
  hitCount: number;
  addScore: number;
  addFlags: string[];
} {
  const t = (text || "").toLowerCase();
  const hits: string[] = [];

  const kw = [
    ["free", "spam_kw_free"],
    ["winner", "spam_kw_winner"],
    ["claim", "spam_kw_claim"],
    ["click", "spam_kw_click"],
    ["verify", "spam_kw_verify"],
    ["prize", "spam_kw_prize"],
    ["urgent", "spam_kw_urgency_en"],
    ["limited time", "spam_kw_urgency_en"],
    ["today only", "spam_kw_urgency_en"],
  ] as const;

  for (const [s, flag] of kw) {
    if (t.includes(s)) hits.push(flag);
  }

  if (hits.length === 0) return { hitCount: 0, addScore: 0, addFlags: [] };

  // conservative bump: 0.05 per hit, capped
  const addScore = Math.min(0.25, hits.length * 0.05);
  const addFlags = mergeFlags(["spam_keywords_en"], hits);
  return { hitCount: hits.length, addScore, addFlags };
}

function decideAction(params: {
  score: number;
  warnT: number;
  blockT: number;
  strongSpam: boolean;
  intention?: string;
  flags: string[];
  policy?: RulesetPolicy;
}): GateAction {
  const {
    score,
    warnT,
    blockT,
    strongSpam,
    intention = "",
    flags,
    policy = {},
  } = params;

  const blockIntentions = new Set(policy.block_intentions ?? []);
  const warnIntentions = new Set(policy.warn_intentions ?? []);
  const blockFlags = new Set(policy.block_flags ?? []);
  const warnFlags = new Set(policy.warn_flags ?? []);

  // 1) explicit overrides (if provided)
  if (blockIntentions.has(intention)) return "BLOCK";
  if (flags.some((f) => blockFlags.has(f))) return "BLOCK";

  if (warnIntentions.has(intention)) return "WARN";
  if (flags.some((f) => warnFlags.has(f))) return "WARN";

  // 2) strong spam override (configurable)
  const strongSpamBlock = policy.strong_spam_block ?? true;
  if (strongSpamBlock && strongSpam) return "BLOCK";

  // 3) thresholds
  if (score >= blockT) return "BLOCK";
  if (score >= warnT) return "WARN";
  return "ALLOW";
}

/**
 * Gate principal (producto): deterministic + barato.
 */
export function gateLLM(text: string, config: GateConfig = {}): GateResult {
  const ruleset = config.ruleset;

  // thresholds: ruleset > config > defaults
  const warnT = ruleset?.thresholds?.warn ?? config.warnThreshold ?? 0.25;
  const blockT = ruleset?.thresholds?.block ?? config.blockThreshold ?? 0.6;

  const r = runEntropyFilter(text);

  // base
  let score = r.entropy_analysis.score;
  let flags = [...r.entropy_analysis.flags];

  // booster EN
  const booster = englishSpamBooster(text);
  if (booster.hitCount > 0) {
    score = clamp01(score + booster.addScore);
    flags = mergeFlags(flags, booster.addFlags);
  }

  // intención base (intention.ts)
  const intention = r.intention_evaluation.intention || "unknown";
  const confidence = r.intention_evaluation.confidence ?? 0;
  const rationale = r.intention_evaluation.rationale ?? "";

  // heuristic: "strong spam" only when BOTH spam_sales + money_signal are present
  // (tune this in entropy.ts; here we only consume flags)
  const hasSpam = flags.includes("spam_sales");
  const hasMoneySignals =
    flags.includes("money_signal") || flags.includes("money_signal_high");
  const strongSpam = hasSpam && hasMoneySignals;

  const policy: RulesetPolicy = ruleset?.policy ?? {};

  const action: GateAction = decideAction({
    score,
    warnT,
    blockT,
    strongSpam,
    intention,
    flags,
    policy,
  });

  return {
    action,
    entropy_score: score,
    flags,
    intention,
    confidence: clamp01(confidence),
    rationale,
  };
}

// Alias “bonito” para tu server: gate(text)
export const gate = gateLLM;
