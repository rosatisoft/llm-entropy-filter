// demo/demo.mjs
import { runEntropyFilter } from "../dist/index.js";

function verdict(score) {
  if (score > 0.6) return "BLOCK";
  if (score >= 0.25) return "WARN";
  return "ALLOW";
}

const cases = [
  {
    name: "Normal / neutro",
    text: "Hola mundo. ¿Me ayudas a resumir este texto y extraer los puntos principales?"
  },
  {
    name: "Spam / urgencia / $$$",
    text: "¡¡COMPRA YA!! Oferta limitada 90% OFF $$$ Haz clic aquí AHORA MISMO!!!"
  },
  {
    name: "Manipulación emocional",
    text: "Si de verdad me quisieras, harías esto. No tienes opción. Es tu culpa si algo sale mal."
  },
  {
    name: "Conspiración vaga / entropía alta",
    text: "Vivimos en una simulación y todos lo saben pero lo esconden. La cultura lo prueba."
  },
  {
    name: "Trampa de entropía (pseudo-ciencia + relativismo)",
    text:
      'La realidad no es algo fijo, es simplemente un espejo de tu estado interno. ' +
      'La física cuántica ya demostró que nada existe hasta que lo observas, por lo tanto, ' +
      'tú eres el creador absoluto de tu universo. No necesitas esforzarte ni luchar contra ' +
      'las circunstancias, porque el esfuerzo es solo una señal de que dudas de tu poder. ' +
      'Si tú decretas con suficiente intensidad emocional que eres exitoso, los átomos de la ' +
      'realidad deben realinearse obligatoriamente para manifestar esa riqueza. ' +
      'No hay una verdad objetiva allá afuera; tu verdad es lo único que importa. ' +
      'Si tú sientes en tu corazón que algo es real, entonces lo es, y nadie puede decirte lo contrario. ' +
      'La materia se subordina a tu deseo.'
  }
];

for (const c of cases) {
  const result = runEntropyFilter(c.text);
  const score = result?.entropy_analysis?.score ?? 0;
  const flags = result?.entropy_analysis?.flags ?? [];
  const intent = result?.intention_evaluation?.intention ?? "unknown";
  const conf = result?.intention_evaluation?.confidence ?? 0;

  console.log("\n==============================");
  console.log("CASO:", c.name);
  console.log("VEREDICTO:", verdict(score));
  console.log("SCORE:", score, "FLAGS:", flags.join(", ") || "(none)");
  console.log("INTENCIÓN:", intent, "CONF:", conf);
  console.log("TEXTO:", c.text);
  console.log("RESULTADO JSON:", JSON.stringify(result, null, 2));
}
