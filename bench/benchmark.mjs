import { runEntropyFilter } from "../dist/index.js";
import { performance } from "node:perf_hooks";

const samples = [
  "hola mundo",
  "¡¡COMPRA YA!! Oferta limitada 90% OFF $$$ Haz clic aquí AHORA MISMO!!!",
  "Si de verdad me quisieras, harías esto. No tienes opción. Es tu culpa si algo sale mal.",
  "Vivimos en una simulación y todos lo saben pero lo esconden. La cultura lo prueba."
];

const LOOPS = 200_000;

console.log("Running benchmark...");
const t0 = performance.now();

let sink = 0;
for (let i = 0; i < LOOPS; i++) {
  const r = runEntropyFilter(samples[i % samples.length]);
  sink += r.entropy_analysis.score;
}

const t1 = performance.now();
const ms = t1 - t0;

console.log({ loops: LOOPS, total_ms: ms.toFixed(2), ops_sec: Math.round((LOOPS / ms) * 1000), sink });
