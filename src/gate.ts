// src/gate.ts
import { analyzeEntropy } from "./entropy";
import type {
  GateAction,
  GateOptions,
  GateResult,
  RulesetPolicy,
  IntentionType,
} from "./types";

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function comboMatches(flags: string[], combo: { all: string[]; any?: string[] }) {
  const s = new Set(flags);
  const hasAll = combo.all.every((f) => s.has(f));
  const hasAny = combo.any ? combo.any.some((f) => s.has(f)) : true;
  return hasAll && hasAny;
}

function decideAction(params: {
  score: number;
  warnT: number;
  blockT: number;
  strongSpam: boolean;
  intention?: IntentionType;
  flags: string[];
  policy?: RulesetPolicy;
}): GateAction {
  const {
    score,
    warnT,
    blockT,
    strongSpam,
    intention = "unknown",
    flags,
    policy = {},
  } = params;

  // 0) Policy combos first (highest-confidence deterministic rules)
  if (policy.block_combos?.length) {
    for (const c of policy.block_combos) {
      if (comboMatches(flags, c)) return "BLOCK";
    }
  }
  if (policy.warn_combos?.length) {
    for (const c of policy.warn_combos) {
      if (comboMatches(flags, c)) return "WARN";
    }
  }

  // 1) Policy flags (single flags)
  if (policy.block_flags?.some((f) => flags.includes(f))) return "BLOCK";
  if (policy.warn_flags?.some((f) => flags.includes(f))) return "WARN";

  // 2) Policy intentions (optional)
  if (policy.block_intentions?.includes(intention)) return "BLOCK";
  if (policy.warn_intentions?.includes(intention)) return "WARN";

  // 3) Legacy strongSpam behavior (optional)
  if (policy.strong_spam_block && strongSpam) return "BLOCK";

  // 4) Threshold-based
  if (score >= blockT) return "BLOCK";
  if (score >= warnT) return "WARN";
  return "ALLOW";
}

function inferIntention(flags: string[]): {
  intention: IntentionType;
  confidence: number;
  rationale: string;
} {
  // OSS: intención simple y honesta (lingüística/heurística)
  if (flags.includes("spam_sales") || flags.includes("spam_keywords_en")) {
    return {
      intention: "marketing_spam",
      confidence: 0.85,
      rationale: "Detecté señales típicas de spam/marketing (urgencia/venta/keywords).",
    };
  }
  return { intention: "unknown", confidence: 0, rationale: "" };
}

export function gateLLM(text: string, options: GateOptions = {}): GateResult {
  const rs = options.ruleset;

  const warnT = rs?.thresholds?.warn ?? 0.35;
  const blockT = rs?.thresholds?.block ?? 0.60;

  // Deterministic entropy + flags
  const r = analyzeEntropy(text, rs);
  const score = clamp01(r.score);
  const flags = r.flags;

  // strongSpam (solo señal adicional; la decisión final la hace policy/threshold)
  const hasSpam = flags.includes("spam_sales") || flags.includes("spam_keywords_en");
  const hasMoneySignals = flags.includes("money_signal");
  const strongSpam = hasSpam && hasMoneySignals;

  const policy: RulesetPolicy = rs?.policy ?? {};

  const ie = inferIntention(flags);

  const action: GateAction = decideAction({
    score,
    warnT,
    blockT,
    strongSpam,
    intention: ie.intention,
    flags,
    policy,
  });

  return {
    action,
    entropy_score: score,
    flags,
    intention: ie.intention,
    confidence: clamp01(ie.confidence),
    rationale: ie.rationale,
  };
}

// Alias “bonito” para tu server: gate(text)
export const gate = gateLLM;
