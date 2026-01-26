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

export function analyzeEntropy(text: string): EntropyResult {
  const raw = text || "";
  const t = raw.toLowerCase();
  const flags: string[] = [];
  let score = 0;

  // 1) Urgencia / presión
  if (/\b(ahora|ya|urgente|última|hoy|inmediato)\b/.test(t)) {
    flags.push("urgency");
    score += 0.20;
  }

  // 2) Spam / venta agresiva
  if (/\b(compra|oferta|promo|descuento|gratis|clic|click|off)\b/.test(t)) {
    flags.push("spam_sales");
    score += 0.25;
  }

  // 3) Señales $$$ / símbolos
  const moneyHits = countRegex(raw, /\$+/g);
  if (moneyHits > 0) {
    flags.push("money_signal");
    score += Math.min(0.20, moneyHits * 0.05);
  }

  // 4) Exceso de signos / gritos
  const exclam = countRegex(raw, /!/g);
  const capsRatio = (() => {
    const letters = raw.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || [];
    if (letters.length === 0) return 0;
    const caps = (raw.match(/[A-ZÁÉÍÓÚÜÑ]/g) || []).length;
    return caps / letters.length;
  })();

  if (exclam >= 3 || capsRatio >= 0.35) {
    flags.push("shouting");
    score += 0.20;
  }

  // 5) Manipulación / culpa / coerción
  if (/\b(si de verdad|si me quisieras|es tu culpa|no tienes opción|me debes)\b/.test(t)) {
    flags.push("emotional_manipulation");
    score += 0.35;
  }

  // 6) Conspiración vaga / “todos lo saben”
  if (/\b(todos lo saben|lo esconden|la verdad oculta|ellos no quieren|simulación)\b/.test(t)) {
    flags.push("conspiracy_vague");
    score += 0.20;
  }

  // 6.5) “Prueba vaga” / apelación a cultura como evidencia
  if (/\b(la cultura lo prueba|es obvio|todo mundo sabe|se sabe|está claro)\b/.test(t)) {
    flags.push("weak_evidence");
    score += 0.20;
  }

  // 6.6) Totalización + agente oculto (“ellos”)
  if (/\b(ellos|la élite|los de arriba)\b/.test(t) && /\b(esconden|ocultan|tapan)\b/.test(t)) {
    flags.push("hidden_actor");
    score += 0.15;
  }

  // ------------------------------------------------------------
  // NUEVO: Entropía por pseudo-ciencia / pensamiento mágico / relativismo
  // ------------------------------------------------------------

  // 7) Pseudo-ciencia "cuántica" usada como licencia mágica
  if (/\b(física cuántica|cuantica|cuántico|quantum)\b/.test(t)) {
    flags.push("pseudo_science_quantum");
    score += 0.20;
  }

  // 8) Manifestación mágica / decretos / vibración / energía como causalidad
  const manifestHits =
    countRegex(t, /\b(manifestar|manifestación|decretar|decreto|vibración|vibracion|frecuencia|energía|energia|ley de la atracción|universo me lo dará)\b/g) +
    countRegex(t, /\b(realine(a|ar)\b.*\bátom|\bátom|\batomos\b)/g);

  if (manifestHits > 0) {
    flags.push("magic_manifesting");
    score += Math.min(0.35, 0.15 + manifestHits * 0.06);
  }

  // 9) Relativismo de la verdad / negación explícita de verdad objetiva
  if (/\b(no hay una verdad objetiva|no existe la verdad objetiva|tu verdad|mi verdad|la verdad es relativa|lo que importa es lo que sientes)\b/.test(t)) {
    flags.push("truth_relativism");
    score += 0.35;
  }

  // 10) Causalidad rota / obligación metafísica ("debe" porque lo deseo)
  if (/\b(deben|debe)\b.*\b(obligatoriamente|por lo tanto|por ende)\b/.test(t) || /\b(la materia)\b.*\b(se subordina|obedece)\b/.test(t)) {
    flags.push("broken_causality");
    score += 0.20;
  }

  // Normaliza: score final 0..1
  score = clamp01(score);

  return { score, flags };
}
