// bench/benchmark.ts
import { runEntropyFilter } from "../src/index";

function nowMs() {
  // performance.now existe en Node >=16. Si por algo no, fallback:
  // @ts-ignore
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

const samples = [
  "hola mundo",
  "¡¡COMPRA YA!! Oferta limitada 90% OFF $$$ Haz clic aquí AHORA MISMO!!!",
  "Si de verdad me quisieras, harías esto. No tienes opción. Es tu culpa si algo sale mal.",
  "Vivimos en una simulación y todos lo saben pero lo esconden. La cultura lo prueba.",
];

function bench(iterations: number) {
  // warmup
  for (let i = 0; i < 20_000; i++) runEntropyFilter(samples[i % samples.length]);

  const start = nowMs();
  let checksum = 0;

  for (let i = 0; i < iterations; i++) {
    const r = runEntropyFilter(samples[i % samples.length]);
    checksum += r.entropy_analysis.score;
    checksum += r.intention_evaluation.confidence;
  }

  const ms = nowMs() - start;
  const ops = iterations / (ms / 1000);

  console.log("\n=== BENCHMARK ===");
  console.log("iterations:", iterations);
  console.log("total ms:", ms.toFixed(2));
  console.log("ops/sec:", Math.round(ops));
  console.log("checksum:", checksum.toFixed(2)); // evita que el motor optimice de más
}

bench(200_000);
