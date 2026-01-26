// src/gate.ts
import { runEntropyFilter } from "./wrapper";

export type GateAction = "ALLOW" | "WARN" | "BLOCK";

export type GateConfig = {
  warnThreshold?: number;   // default 0.25
  blockThreshold?: number;  // default 0.60
};

export type GateResult = {
  action: GateAction;
  entropy_score: number;
  flags: string[];
  intention: string;
  confidence: number;
  rationale?: string;
};

export function gateLLM(
  text: string,
  config: GateConfig = {}
): GateResult {
  const warnT = config.warnThreshold ?? 0.25;
  const blockT = config.blockThreshold ?? 0.60;

  const r = runEntropyFilter(text);
  const score = r.entropy_analysis.score;

  let action: GateAction = "ALLOW";
  if (score > blockT) action = "BLOCK";
  else if (score >= warnT) action = "WARN";

  return {
    action,
    entropy_score: score,
    flags: r.entropy_analysis.flags,
    intention: r.intention_evaluation.intention,
    confidence: r.intention_evaluation.confidence,
    rationale: r.intention_evaluation.rationale,
  };
}
