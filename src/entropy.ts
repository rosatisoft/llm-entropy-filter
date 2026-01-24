// src/entropy.ts
import type { EntropyResult } from "./types";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export function analyzeEntropy(text: string): EntropyResult {
  const raw = text || "";
  const t = raw.toLowerCase();
  const flags: string[] = [];
  let score = 0;

  // 1) Urgencia / presión
  if (/\b(ahora|ya|urgente|última|hoy|inmediato)\b/.test(t)) {
    flags.push("urgency");
    score += 0.2;
  }

  // 2) Spam / venta agresiva
  if (/\b(compra|oferta|promo|descuento|gratis|clic|click|off)\b/.test(t)) {
    flags.push("spam_sales");
    score += 0.25;
  }

  // 3) Señales $$$ / símbolos
  const moneyHits = (raw.match(/\$+/g) || []).length;
  if (moneyHits > 0) {
    flags.push("money_signal");
    score += Math.min(0.2, moneyHits * 0.05);
  }

  // 4) Exceso de signos / gritos
  const exclam = (raw.match(/!/g) || []).length;
  const capsRatio = (() => {
    const letters = raw.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || [];
    if (letters.length === 0) return 0;
    const caps = (raw.match(/[A-ZÁÉÍÓÚÜÑ]/g) || []).length;
    return caps / letters.length;
  })();

  if (exclam >= 3 || capsRatio >= 0.35) {
    flags.push("shouting");
    score += 0.2;
  }

  // 5) Manipulación / culpa / coerción
  if (
    /\b(si de verdad|si me quisieras|es tu culpa|no tienes opción|me debes)\b/.test(
      t
    )
  ) {
    flags.push("emotional_manipulation");
    score += 0.35;
  }

  // 6) Conspiración vaga / “todos lo saben”
  if (
    /\b(todos lo saben|lo esconden|la verdad oculta|ellos no quieren|simulación)\b/.test(
      t
    )
  ) {
    flags.push("conspiracy_vague");
    score += 0.2;
  }

  score = clamp01(score);
  return { score, flags };
}
