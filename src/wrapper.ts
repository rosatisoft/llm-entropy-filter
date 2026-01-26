// src/wrapper.ts
import { analyzeEntropy } from "./entropy";
import { evaluateIntention } from "./intention";
import type { FilterResult, IntentionEvaluation } from "./types";

export function runEntropyFilter(text: string): FilterResult {
  const entropy_analysis = analyzeEntropy(text);
  let intention_evaluation: IntentionEvaluation = evaluateIntention(text);

  // Corrección: si el texto trae señales fuertes de entropía epistemológica,
  // no lo clasifiques como "request_help" solo por ser pregunta larga.
  const hardFlags = new Set(entropy_analysis.flags);
  const epistemicEntropy =
    hardFlags.has("truth_relativism") ||
    hardFlags.has("magic_manifesting") ||
    hardFlags.has("pseudo_science_quantum") ||
    hardFlags.has("broken_causality");

  if (epistemicEntropy) {
    intention_evaluation = {
      intention: "misinformation",
      confidence: Math.max(intention_evaluation.confidence ?? 0.7, 0.8),
      rationale:
        "Detecté patrón de pseudo-ciencia/pensamiento mágico/relativismo de la verdad; alta probabilidad de desinformación o argumento sin anclaje causal."
    };
  }

  return { entropy_analysis, intention_evaluation };
}
