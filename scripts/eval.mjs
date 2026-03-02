// scripts/eval.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { performance } from "node:perf_hooks";

import { runEntropyFilter } from "../dist/index.js"; // usa dist (tras build)

// -----------------------------
// Gate v1.0 (alineado a tu demo)
// -----------------------------
function gateV1(result) {
  const score = result?.entropy_analysis?.score ?? 0;
  const flags = result?.entropy_analysis?.flags ?? [];
  const intention = result?.intention_evaluation?.intention ?? "unknown";

  const hardBlockIntentions = new Set(["marketing_spam", "misinformation"]);
  const warnIntentions = new Set(["manipulation", "conspiracy"]);

  if (score >= 0.7 || hardBlockIntentions.has(intention)) return "BLOCK";
  if (score >= 0.3 || warnIntentions.has(intention)) return "WARN";
  return "ALLOW";
}

function inc(map, key) {
  map.set(key, (map.get(key) ?? 0) + 1);
}

function fmtPct(n) {
  return (n * 100).toFixed(1) + "%";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const datasetPath = process.argv[2] ?? path.join(__dirname, "dataset.jsonl");
if (!fs.existsSync(datasetPath)) {
  console.error(`Dataset not found: ${datasetPath}`);
  process.exit(1);
}

const lines = fs
  .readFileSync(datasetPath, "utf-8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

const confusion = new Map(); // key: expected|pred
const byExpected = new Map(); // expected intention counts
const byGateExpected = new Map();
const byGatePred = new Map();

let total = 0;
let correctIntention = 0;
let correctGate = 0;

let flagsMustTotal = 0;
let flagsMustHit = 0;

let entropyMinTotal = 0;
let entropyMinHit = 0;

let totalMs = 0;

for (const line of lines) {
  const item = JSON.parse(line);

  const t0 = performance.now();
  const out = runEntropyFilter(item.text);
  const t1 = performance.now();
  const ms = t1 - t0;

  totalMs += ms;

  const predInt = out?.intention_evaluation?.intention ?? "unknown";
  const predGate = gateV1(out);

  total += 1;

  if (predInt === item.expected_intention) correctIntention += 1;
  if (predGate === item.expected_action) correctGate += 1;

  inc(byExpected, item.expected_intention);
  inc(byGateExpected, item.expected_action);
  inc(byGatePred, predGate);

  const key = `${item.expected_intention} | ${predInt}`;
  inc(confusion, key);

  // flags coverage
  const flags = new Set(out?.entropy_analysis?.flags ?? []);
  const must = item.must_flags ?? [];
  for (const f of must) {
    flagsMustTotal += 1;
    if (flags.has(f)) flagsMustHit += 1;
  }

  // min entropy check (si viene)
  if (typeof item.min_entropy === "number") {
    entropyMinTotal += 1;
    const score = out?.entropy_analysis?.score ?? 0;
    if (score >= item.min_entropy) entropyMinHit += 1;
  }

  // Si quieres ver fallos detallados:
  // if (predGate !== item.expected_action || predInt !== item.expected_intention) {
  //   console.log("\nFAIL:", item.id);
  //   console.log("TEXT:", item.text);
  //   console.log("EXPECTED:", item.expected_intention, item.expected_action);
  //   console.log("GOT:", predInt, predGate, out);
  // }
}

// ---------- Report ----------
console.log("====================================");
console.log("llm-entropy-filter v1.0 — EVAL REPORT");
console.log("====================================");
console.log("Cases:", total);
console.log("Avg latency:", (totalMs / total).toFixed(3), "ms/case");
console.log("");

console.log("Intention accuracy:", fmtPct(correctIntention / total));
console.log("Gate accuracy:", fmtPct(correctGate / total));
console.log("");

console.log("Must-flags coverage:", flagsMustTotal ? fmtPct(flagsMustHit / flagsMustTotal) : "n/a");
console.log("Min-entropy pass rate:", entropyMinTotal ? fmtPct(entropyMinHit / entropyMinTotal) : "n/a");
console.log("");

console.log("Gate distribution (expected):");
for (const k of ["ALLOW", "WARN", "BLOCK"]) {
  console.log(" ", k.padEnd(5), "=", (byGateExpected.get(k) ?? 0));
}
console.log("Gate distribution (predicted):");
for (const k of ["ALLOW", "WARN", "BLOCK"]) {
  console.log(" ", k.padEnd(5), "=", (byGatePred.get(k) ?? 0));
}

console.log("");
console.log("Confusion matrix (top pairs):");

// print top confusion entries
const sorted = [...confusion.entries()].sort((a, b) => b[1] - a[1]).slice(0, 20);
for (const [k, v] of sorted) {
  console.log(" ", String(v).padStart(3), ":", k);
}

console.log("");
console.log("By expected intention:");
const expSorted = [...byExpected.entries()].sort((a, b) => b[1] - a[1]);
for (const [k, v] of expSorted) {
  console.log(" ", k.padEnd(16), v);
}
