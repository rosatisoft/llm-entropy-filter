// src/entropy.ts
export type EntropyResult = {
  score: number; // 0..1
  flags: string[];
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function countRegex(text: string, re: RegExp) {
  const m = text.match(re);
  return m ? m.length : 0;
}

/**
 * Entropy = señales lingüísticas + lógicas (determinístico, barato).
 * Nota: aquí SOLO generamos banderas y score. La acción (ALLOW/WARN/BLOCK)
 * se decide en gate.ts según thresholds/policy del ruleset.
 */
export function analyzeEntropy(text: string): EntropyResult {
  const raw = text || "";
  const t = raw.toLowerCase();
  const flags: string[] = [];
  let score = 0;

  // ------------------------------------------------------------
  // 1) Urgencia / presión temporal
  // ------------------------------------------------------------
  if (
    /\b(ahora|ya|urgente|urgencia|hoy|inmediato|inmediatamente|últim[oa]s?|solo\s+hoy|ap[uú]rate|rápido|de\s+inmediato)\b/.test(
      t
    )
  ) {
    flags.push("urgency");
    score += 0.2;
  }

  // ------------------------------------------------------------
  // 2) Spam / venta agresiva (ES/EN básico)
  // ------------------------------------------------------------
  if (
    /\b(compra|oferta|promo|promoci[oó]n|descuento|rebaja|gratis|free|premio|prize|winner|gana|claim|reward|clic|click)\b/.test(
      t
    )
  ) {
    flags.push("spam_sales");
    score += 0.25;
  }

  // ------------------------------------------------------------
  // 3) Phishing / Fraude / Scam (señales de alto riesgo)
  // ------------------------------------------------------------

  // 3A) Phishing: pedir código/OTP/token de verificación (ES/EN)
  // Ej: "Envíame tu código de verificación para confirmar tu cuenta."
  const wantsSendVerb =
    /\b(envi(a|á)me|env[ií]ame|m(a|á)ndame|p(a|á)same|dame|compart(e|a|as)|reenv[ií]a(me)?)\b/.test(
      t
    );

  const mentionsCode =
    /\b(c[oó]digo|codigo|otp|2fa|token|pin|clave)\b/.test(t);

  const mentionsVerify =
    /\b(verificaci[oó]n|verificar|confirmar|validar)\b/.test(t);

  const mentionsAccount = /\b(cuenta|account)\b/.test(t);

  const mentionsSms = /\b(sms|por\s+sms)\b/.test(t);

  // Regla: verbo de “enviar/pasar” + (código/otp/token/pin) + (verificación/cuenta/sms)
  if (wantsSendVerb && mentionsCode && (mentionsVerify || mentionsAccount || mentionsSms)) {
    flags.push("phishing_2fa_code");
    score += 0.55; // fuerte: debe quedar mínimo en WARN con casi cualquier preset
  }

  // 3B) Phishing EN: “verify account” + “click” + amenaza de cierre
  if (
    /\bverify\b/.test(t) &&
    /\baccount\b/.test(t) &&
    /\bclick\b/.test(t) &&
    /\b(closed|close|suspend|suspended|disable|disabled|locked)\b/.test(t)
  ) {
    flags.push("phishing_verify_threat_en");
    score += 0.35;
  }

  // 3C) Fraude: “te deposito / transfiero” + “tarjeta/cuenta/clabe”
  if (
    /\b(te\s+deposito|te\s+dep[oó]sito|te\s+transfiero|te\s+transferir[eé]|transferencia|dep[oó]sito)\b/.test(
      t
    ) &&
    /\b(tarjeta|cuenta|clabe|iban|swift|n[uú]mero\s+de\s+tarjeta|numero\s+de\s+tarjeta)\b/.test(t)
  ) {
    flags.push("fraud_payment_request");
    score += 0.35;
  }

  // 3D) Scam: “gana dinero desde casa / sin esfuerzo”
  if (
    /\b(gana(r)?\s+dinero|ingresos|dinero\s+extra)\b/.test(t) &&
    /\b(desde\s+casa|en\s+casa|home)\b/.test(t) &&
    /\b(sin\s+esfuerzo|f[aá]cil|r[aá]pido|easy|fast)\b/.test(t)
  ) {
    flags.push("scam_wfh");
    score += 0.3;
  }

  // ------------------------------------------------------------
  // 4) Señales de dinero ($$$, %, monedas)
  // ------------------------------------------------------------
  const moneyHits = countRegex(raw, /\$+/g);
  const pctHits = countRegex(raw, /%/g);
  if (moneyHits > 0 || pctHits > 0 || /\b(usd|mxn|eur)\b/i.test(raw)) {
    flags.push("money_signal");
    score += Math.min(0.25, moneyHits * 0.05 + pctHits * 0.05 + 0.1);
  }

  // ------------------------------------------------------------
  // 5) Exceso de signos / gritos (señal de baja calidad o manipulación)
  // ------------------------------------------------------------
  const exclam = countRegex(raw, /!/g);
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

  // ------------------------------------------------------------
  // 6) Coerción / culpa / chantaje emocional
  // ------------------------------------------------------------
  if (
    /\b(si\s+de\s+verdad|si\s+me\s+quisieras|es\s+tu\s+culpa|no\s+tienes\s+opci[oó]n|me\s+debes|hazlo\s+o\s+si\s+no|si\s+no\s+lo\s+haces)\b/.test(
      t
    )
  ) {
    flags.push("emotional_manipulation");
    score += 0.35;
  }

  // ------------------------------------------------------------
  // 7) Conspiración vaga / evidencia débil (baja confiabilidad)
  // ------------------------------------------------------------
  if (
    /\b(todos\s+lo\s+saben|lo\s+esconden|la\s+verdad\s+oculta|ellos\s+no\s+quieren|simulaci[oó]n)\b/.test(
      t
    )
  ) {
    flags.push("conspiracy_vague");
    score += 0.2;
  }

  if (
    /\b(es\s+obvio|todo\s+mundo\s+sabe|se\s+sabe|est[aá]\s+claro|la\s+cultura\s+lo\s+prueba)\b/.test(
      t
    )
  ) {
    flags.push("weak_evidence");
    score += 0.2;
  }

  score = clamp01(score);
  return { score, flags };
}
