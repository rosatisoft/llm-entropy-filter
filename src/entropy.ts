// src/entropy.ts
import type { Ruleset, EntropyAnalysis } from "./types";
import { normalizeText } from "./normalize";

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function safeRegex(reSrc: string): RegExp | null {
  try {
    return new RegExp(reSrc, "i");
  } catch {
    return null;
  }
}

// --- EN keyword booster (conservador)
const EN_SPAM_KEYWORDS: Array<[string, RegExp]> = [
  ["spam_kw_free", /\bfree\b/i],
  ["spam_kw_winner", /\bwinner\b/i],
  ["spam_kw_prize", /\bprize\b/i],
  ["spam_kw_claim", /\bclaim\b/i],
  ["spam_kw_click", /\bclick\b/i],
  ["spam_kw_verify", /\bverify\b/i],
];

function keywordBoosterEN(text: string): EntropyAnalysis {
  const hits: string[] = [];
  for (const [flag, re] of EN_SPAM_KEYWORDS) {
    if (re.test(text)) hits.push(flag);
  }

  if (!hits.length) return { score: 0, flags: [] };

  // conservative bump: 0.05 per hit, capped
  const addScore = Math.min(0.25, hits.length * 0.05);
  const flags = ["spam_keywords_en", ...hits];
  return { score: addScore, flags };
}

/**
 * Canonical engine (deterministic)
 */
export function analyzeEntropy(input: string, rs?: Ruleset): EntropyAnalysis {
  const text = normalizeText(input, rs);

  let score = 0;
  const flags: string[] = [];

  // 1) hard triggers from ruleset
  const triggers = rs?.hard_triggers ?? [];
  for (const trig of triggers) {
    const weight = typeof trig.weight === "number" ? trig.weight : 0;
    if (!trig.patterns?.length) continue;

    let matched = false;
    for (const p of trig.patterns) {
      const re = safeRegex(p);
      if (!re) continue;
      if (re.test(text)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      flags.push(trig.id);
      score += weight;
    }
  }

  // 2) EN keyword booster (adds spam_kw_* + spam_keywords_en)
  const en = keywordBoosterEN(text);
  if (en.flags.length) flags.push(...en.flags);
  score += en.score;

  score = clamp01(score);

  // dedupe flags
  const uniq = Array.from(new Set(flags));
  return { score, flags: uniq };
}
