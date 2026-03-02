// scripts/load.mjs
import autocannon from "autocannon";

const argv = process.argv.slice(2);
const getArg = (name, def) => {
  const idx = argv.indexOf(`--${name}`);
  if (idx === -1) return def;
  return argv[idx + 1] ?? def;
};

const url = getArg("url", "http://127.0.0.1:3000/analyze");
const connections = Number(getArg("c", "30"));
const duration = Number(getArg("d", "10"));
const pipelining = Number(getArg("p", "1"));

const text = getArg("text", "¡¡COMPRA YA!! Oferta limitada 90% OFF $$$");
const body = JSON.stringify({ text });

console.log("====================================");
console.log("llm-entropy-filter v1.0 — LOAD TEST");
console.log("====================================");
console.log("URL:", url);
console.log("connections:", connections, "duration(s):", duration, "pipelining:", pipelining);
console.log("payload bytes:", Buffer.byteLength(body));
console.log("");

const inst = autocannon(
  {
    url,
    method: "POST",
    connections,
    duration,
    pipelining,
    headers: { "Content-Type": "application/json" },
    body,
    timeout: 10, // seconds
  },
  (err, result) => {
    if (err) {
      console.error("autocannon error:", err);
      process.exit(1);
    }
    console.log("\nDone.");
    console.log("Errors:", result.errors, "Timeouts:", result.timeouts, "Non2xx:", result.non2xx);
  }
);

// live progress
autocannon.track(inst, { renderProgressBar: true });
