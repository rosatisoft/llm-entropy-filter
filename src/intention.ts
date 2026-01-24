// src/intention.ts
import type { IntentionEvaluation, IntentionType } from "./types";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function evaluateIntention(text: string): IntentionEvaluation {
  const raw = text || "";
  const t = raw.toLowerCase();

  // Heurísticas rápidas (MVP)
  const isHelp =
    /\b(ayuda|ayúdame|explica|resume|resumir|cómo|como|puedes|podrías|por favor)\b/.test(
      t
    );

  const isSpam =
    /\b(compra|oferta|promo|descuento|gratis|haz clic|click|off|90%|% off)\b/.test(
      t
    ) || (raw.match(/\$+/g) || []).length > 0;

  const isManip =
    /\b(si de verdad|si me quisieras|es tu culpa|no tienes opción|me debes)\b/.test(
      t
    );

  const isConsp =
    /\b(simulación|todos lo saben|lo esconden|verdad oculta|ellos no quieren)\b/.test(
      t
    );

  let intention: IntentionType = "unknown";
  let confidence = 0.0;
  let rationale = "";

  if (isSpam) {
    intention = "marketing_spam";
    confidence = 0.85;
    rationale = "Detecté señales de venta agresiva/urgencia/dinero.";
  } else if (isManip) {
    intention = "manipulation";
    confidence = 0.85;
    rationale = "Detecté coerción/culpa/chantaje emocional.";
  } else if (isConsp) {
    intention = "conspiracy";
    confidence = 0.75;
    rationale = "Detecté marco conspirativo vago ('lo esconden', 'todos lo saben').";
  } else if (isHelp) {
    intention = "request_help";
    confidence = 0.7;
    rationale = "Parece una petición legítima de ayuda/explicación.";
  }

  return { intention, confidence: clamp01(confidence), rationale };
}
