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

export type GateConfig = {
  warnThreshold?: number;  // default: 0.25
  blockThreshold?: number; // default: 0.60
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
 * Detección de spam/phishing en inglés por keywords.
 * Se implementa como “booster” de score + flags (sin tocar entropy.ts).
 */
function englishSpamBooster(rawText: string): {
  addScore: number;
  addFlags: string[];
  hitCount: number;
} {
  const t = (rawText || "").toLowerCase();

  // Patrones típicos (spam / phishing / promos agresivas)
  const patterns: Array<{ re: RegExp; score: number; flag: string }> = [
    { re: /\bfree\b/g, score: 0.08, flag: "spam_kw_free" },
    { re: /\bwinner\b|\bwon\b|\bcongratulations\b/g, score: 0.10, flag: "spam_kw_winner" },
    { re: /\bclaim\b|\bredeem\b/g, score: 0.08, flag: "spam_kw_claim" },
    { re: /\bclick\b|\bclick here\b|\bopen link\b|\btap here\b/g, score: 0.10, flag: "spam_kw_click" },
    { re: /\blimited time\b|\bact now\b|\bfinal notice\b|\bbefore midnight\b/g, score: 0.10, flag: "spam_kw_urgency_en" },
    { re: /\bverify\b|\bconfirm\b|\baccount\b.*\b(suspended|locked)\b/g, score: 0.12, flag: "spam_kw_verify" },
    { re: /\bprize\b|\bgift card\b|\bgiftcard\b|\bvoucher\b|\biphone\b|\bsurvey\b/g, score: 0.10, flag: "spam_kw_prize" },
    { re: /\bloan\b|\bpre-?approved\b|\bno credit check\b/g, score: 0.12, flag: "spam_kw_loan" },
    { re: /\bcrypto\b|\bairdrop\b|\bwallet\b|\bseed phrase\b/g, score: 0.10, flag: "spam_kw_crypto" },
    { re: /\bdelivery failed\b|\breschedule\b|\bpackage\b|\bcourier\b/g, score: 0.10, flag: "spam_kw_delivery" },
    { re: /\btax refund\b|\bunpaid\b|\brefund\b|\bchargeback\b/g, score: 0.10, flag: "spam_kw_refund" },
  ];

  let addScore = 0;
  const addFlags: string[] = [];
  let hitCount = 0;

  for (const p of patterns) {
    const m = t.match(p.re);
    if (m && m.length > 0) {
      hitCount += m.length;
      addScore += p.score; // suma “por patrón”, no por ocurrencia (controlado)
      addFlags.push(p.flag);
    }
  }

  // cap para no sobre-castigar
  addScore = Math.min(0.35, addScore);

  if (hitCount > 0) addFlags.push("spam_keywords_en");

  return { addScore, addFlags, hitCount };
}

/**
 * Gate principal (producto): deterministic + barato.
 */
export function gateLLM(text: string, config: GateConfig = {}): GateResult {
  const warnT = config.warnThreshold ?? 0.25;
  const blockT = config.blockThreshold ?? 0.6;

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
  let intention = r.intention_evaluation.intention || "unknown";
  let confidence = r.intention_evaluation.confidence ?? 0;
  let rationale = r.intention_evaluation.rationale ?? "";

  // si pegó booster EN y quedó unknown → marketing_spam
  if (booster.hitCount > 0 && intention === "unknown") {
    intention = "marketing_spam";
    confidence = Math.max(confidence, 0.75);
    rationale = (rationale ? rationale + " " : "") + "Detecté keywords típicas de spam/phishing en inglés.";
  }

  // reglas fuertes (para BLOCK “vendible”)
  const hasSpam =
    flags.includes("spam_sales") ||
    flags.includes("spam_keywords_en");

  const hasMoneySignals =
    flags.includes("money_signal") ||
    flags.includes("spam_kw_prize") ||
    flags.includes("spam_kw_loan");

  const strongSpam = hasSpam && hasMoneySignals;

  let action: GateAction = "ALLOW";
  if (score > blockT || strongSpam) action = "BLOCK";
  else if (score >= warnT) action = "WARN";

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
