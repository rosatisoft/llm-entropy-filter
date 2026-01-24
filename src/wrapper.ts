import { entropyAnalysis } from "./entropy";
import { intentionEvaluation } from "./intention";

export function runEntropyFilter(text: string) {
  return {
    entropy_analysis: entropyAnalysis(text),
    intention_evaluation: intentionEvaluation(text),
  };
}
