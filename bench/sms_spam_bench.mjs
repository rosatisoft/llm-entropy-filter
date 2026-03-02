// bench/sms_spam_bench.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gate } from "../dist/index.js"; // asegúrate que ya exportas gate

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseCsvLine(line) {
  // CSV simple: label,text (text puede traer comas si viene entre comillas)
  // Intento robusto mínimo:
  const firstComma = line.indexOf(",");
  if (firstComma === -1) return null;
  const label = line.slice(0, firstComma).trim().replace(/^"|"$/g, "");
  let text = line.slice(firstComma + 1).trim();
  if (text.startsWith('"') && text.endsWith('"')) text = text.slice(1, -1);
  text = text.replace(/""/g, '"'); // unescape CSV quotes
  return { label, text };
}

function inc(map, key, by = 1) {
  map[key] = (map[key] || 0) + by;
}

function pct(n, d) {
  if (!d) return "0.00%";
  return ((n / d) * 100).toFixed(2) + "%";
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: node bench/sms_spam_bench.mjs <path-to-csv>");
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter(Boolean);

  // Detect header
  let start = 0;
  if (lines[0].toLowerCase().includes("label") && lines[0].toLowerCase().includes("text")) {
    start = 1;
  }

  const totals = { all: 0, spam: 0, ham: 0 };
  const byAction = { ALLOW: 0, WARN: 0, BLOCK: 0 };
  const byIntention = {};
  const byFlag = {};
  const confusion = {
    // treat BLOCK as "pred_spam" for this report; WARN is "suspicious"
    spam: { ALLOW: 0, WARN: 0, BLOCK: 0 },
    ham: { ALLOW: 0, WARN: 0, BLOCK: 0 },
  };

  const t0 = Date.now();
  for (let i = start; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    if (!row) continue;

    const label = row.label.toLowerCase();
    const gt = label === "spam" ? "spam" : "ham";
    totals.all++;
    totals[gt]++;

    const out = gate(String(row.text || ""));
    const action = out?.action || "ALLOW";
    byAction[action] = (byAction[action] || 0) + 1;

    confusion[gt][action]++;

    inc(byIntention, out?.intention || "unknown");
    const flags = Array.isArray(out?.flags) ? out.flags : [];
    for (const f of flags) inc(byFlag, f);
  }
  const t1 = Date.now();
  const ms = t1 - t0;
  const rps = totals.all ? (totals.all / (ms / 1000)) : 0;

  // “Savings” model (simple): calls avoided = BLOCK (porque no irías al LLM)
  // You can refine with WARN policy later.
  const callsAvoided = byAction.BLOCK || 0;

  const report = {
    meta: {
      ts: Date.now(),
      dataset: path.basename(csvPath),
      samples: totals.all,
      runtime_ms: ms,
      throughput_rps: Number(rps.toFixed(2)),
      policy: {
        callsAvoidedDefinition: "BLOCK => no LLM call",
      },
    },
    totals,
    byAction,
    confusion,
    topIntentions: Object.entries(byIntention).sort((a, b) => b[1] - a[1]).slice(0, 10),
    topFlags: Object.entries(byFlag).sort((a, b) => b[1] - a[1]).slice(0, 15),
    savings: {
      callsAvoided,
      callsAvoided_pct: pct(callsAvoided, totals.all),
    },
  };

  const outDir = path.join(__dirname, "reports");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(path.join(outDir, "sms_spam_report.json"), JSON.stringify(report, null, 2));

  // Markdown report
  const md = [];
  md.push(`# SMS Spam Bench Report`);
  md.push(`- Dataset: \`${report.meta.dataset}\``);
  md.push(`- Samples: **${report.meta.samples}**`);
  md.push(`- Runtime: **${report.meta.runtime_ms} ms**`);
  md.push(`- Throughput: **${report.meta.throughput_rps} samples/sec**`);
  md.push(``);
  md.push(`## Actions`);
  md.push(`- ALLOW: **${byAction.ALLOW}** (${pct(byAction.ALLOW, totals.all)})`);
  md.push(`- WARN: **${byAction.WARN}** (${pct(byAction.WARN, totals.all)})`);
  md.push(`- BLOCK: **${byAction.BLOCK}** (${pct(byAction.BLOCK, totals.all)})`);
  md.push(``);
  md.push(`## Savings (simple model)`);
  md.push(`- Calls avoided (BLOCK): **${report.savings.callsAvoided}** (${report.savings.callsAvoided_pct})`);
  md.push(``);
  md.push(`## Confusion (ground truth label → action)`);
  md.push(`- spam → ALLOW/WARN/BLOCK: **${confusion.spam.ALLOW}/${confusion.spam.WARN}/${confusion.spam.BLOCK}**`);
  md.push(`- ham  → ALLOW/WARN/BLOCK: **${confusion.ham.ALLOW}/${confusion.ham.WARN}/${confusion.ham.BLOCK}**`);
  md.push(``);
  md.push(`## Top Flags`);
  for (const [k, v] of report.topFlags) md.push(`- \`${k}\`: ${v}`);
  md.push(``);
  md.push(`## Top Intentions`);
  for (const [k, v] of report.topIntentions) md.push(`- \`${k}\`: ${v}`);

  fs.writeFileSync(path.join(outDir, "sms_spam_report.md"), md.join("\n") + "\n");

  console.log("✅ Wrote:");
  console.log(" -", path.join(outDir, "sms_spam_report.json"));
  console.log(" -", path.join(outDir, "sms_spam_report.md"));
  console.log(`✅ Throughput: ${report.meta.throughput_rps} samples/sec`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
