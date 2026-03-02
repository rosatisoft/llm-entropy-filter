#!/usr/bin/env node
import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import minimist from "minimist";

import { gate } from "../dist/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readJsonl(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      try {
        return JSON.parse(line);
      } catch (e) {
        throw new Error(`Invalid JSONL at line ${i + 1}: ${e.message}`);
      }
    });
}

function asAction(x) {
  const v = String(x || "").toUpperCase();
  if (v === "ALLOW" || v === "WARN" || v === "BLOCK") return v;
  return "ALLOW";
}

function nowIsoCompact() {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

function safeDiv(a, b) {
  return b === 0 ? 0 : a / b;
}

function computeMetrics(rows, gateOptions) {
  const labels = ["ALLOW", "WARN", "BLOCK"];
  const matrix = {};
  for (const g of labels) {
    matrix[g] = {};
    for (const p of labels) matrix[g][p] = 0;
  }

  const perTag = {};
  const errors = [];

  const t0 = performance.now();
  for (const r of rows) {
    const text = String(r.text ?? "");
    const gold = asAction(r.label);
    const tags = Array.isArray(r.tags) ? r.tags : [];

    let pred = "ALLOW";
    try {
      const decision = gate(text, gateOptions);
      pred = asAction(decision.action);
    } catch (e) {
      errors.push({ text, error: String(e?.message || e) });
      pred = "ALLOW";
    }

    matrix[gold][pred]++;

    for (const tag of tags) {
      if (!perTag[tag]) perTag[tag] = { total: 0, correct: 0 };
      perTag[tag].total++;
      if (pred === gold) perTag[tag].correct++;
    }
  }
  const t1 = performance.now();

  const total = rows.length;

  const TP = matrix["BLOCK"]["BLOCK"];
  const FP = matrix["ALLOW"]["BLOCK"] + matrix["WARN"]["BLOCK"];
  const FN = matrix["BLOCK"]["ALLOW"] + matrix["BLOCK"]["WARN"];

  const precision_block = safeDiv(TP, TP + FP);
  const recall_block = safeDiv(TP, TP + FN);
  const f1_block =
    precision_block + recall_block === 0
      ? 0
      : (2 * precision_block * recall_block) / (precision_block + recall_block);

  const correct =
    matrix["ALLOW"]["ALLOW"] + matrix["WARN"]["WARN"] + matrix["BLOCK"]["BLOCK"];
  const accuracy = safeDiv(correct, total);

  const overblock_allow_to_block = safeDiv(
    matrix["ALLOW"]["BLOCK"],
    matrix["ALLOW"]["ALLOW"] + matrix["ALLOW"]["WARN"] + matrix["ALLOW"]["BLOCK"]
  );

  const underblock_block_to_allow = safeDiv(
    matrix["BLOCK"]["ALLOW"],
    matrix["BLOCK"]["ALLOW"] + matrix["BLOCK"]["WARN"] + matrix["BLOCK"]["BLOCK"]
  );

  return {
    summary: {
      total,
      correct,
      accuracy,
      latency_ms_total: Math.round(t1 - t0),
      latency_ms_avg: total ? (t1 - t0) / total : 0
    },
    primary: {
      class: "BLOCK",
      precision: precision_block,
      recall: recall_block,
      f1: f1_block,
      TP,
      FP,
      FN
    },
    behavior: {
      overblock_allow_to_block,
      underblock_block_to_allow
    },
    matrix,
    perTag,
    errors
  };
}

function toMarkdown(report, meta) {
  const pct = (x) => `${(x * 100).toFixed(2)}%`;
  const m = report.matrix;

  const perTagTop = Object.entries(report.perTag)
    .sort((a, b) => (b[1].correct / b[1].total) - (a[1].correct / a[1].total))
    .slice(0, 12)
    .map(([tag, v]) => `- ${tag}: ${v.correct}/${v.total} (${pct(v.correct / v.total)})`)
    .join("\n");

  return `# llm-entropy-filter metrics report

- dataset: \`${meta.dataset}\`
- ruleset: \`${meta.rulesetName}\`
- timestamp: \`${meta.timestamp}\`

## Summary
- total: **${report.summary.total}**
- accuracy: **${pct(report.summary.accuracy)}**
- avg latency: **${report.summary.latency_ms_avg.toFixed(3)} ms**

## Primary (BLOCK)
- precision: **${pct(report.primary.precision)}**
- recall: **${pct(report.primary.recall)}**
- f1: **${pct(report.primary.f1)}**
- TP/FP/FN: **${report.primary.TP} / ${report.primary.FP} / ${report.primary.FN}**

## Behavior
- overblock (ALLOW→BLOCK): **${pct(report.behavior.overblock_allow_to_block)}**
- underblock (BLOCK→ALLOW): **${pct(report.behavior.underblock_block_to_allow)}**

## Confusion Matrix (gold rows → predicted cols)

| gold \\ pred | ALLOW | WARN | BLOCK |
|---|---:|---:|---:|
| ALLOW | ${m.ALLOW.ALLOW} | ${m.ALLOW.WARN} | ${m.ALLOW.BLOCK} |
| WARN  | ${m.WARN.ALLOW}  | ${m.WARN.WARN}  | ${m.WARN.BLOCK}  |
| BLOCK | ${m.BLOCK.ALLOW} | ${m.BLOCK.WARN} | ${m.BLOCK.BLOCK} |

## Per-tag accuracy (top)
${perTagTop}
`;
}

async function main() {
  const args = minimist(process.argv.slice(2));
  const dataset = args.dataset || path.join(__dirname, "datasets", "core_v1.jsonl");
  const rulesetName = args.ruleset || "default";

  const rows = readJsonl(dataset);

  // NOTE: in this first commit we keep rulesetName only as metadata.
  // Next commit can add ruleset loading if you want strict/public-api comparisons.
  const gateOptions = {};

  if (rulesetName !== "default") {
    const rulesetPath = path.join(process.cwd(), "rulesets", `${rulesetName}.js`);
    if (!fs.existsSync(rulesetPath)) {
      throw new Error(`Ruleset not found: ${rulesetPath}`);
    }
    const mod = await import(pathToFileURL(rulesetPath).href);
    gateOptions.ruleset = mod.default ?? mod;
  }

  const report = computeMetrics(rows, gateOptions);

  const timestamp = nowIsoCompact();
  const base = `metrics_${path.basename(dataset).replace(/\W+/g, "_")}_${rulesetName}_${timestamp}`;

  const outDir = path.join(process.cwd(), "bench", "reports");
  fs.mkdirSync(outDir, { recursive: true });

  const meta = {
    dataset: path.relative(process.cwd(), dataset),
    rulesetName,
    timestamp
  };

  const jsonPath = path.join(outDir, `${base}.json`);
  fs.writeFileSync(jsonPath, JSON.stringify({ meta, report }, null, 2), "utf8");

  const mdPath = path.join(outDir, `${base}.md`);
  fs.writeFileSync(mdPath, toMarkdown(report, meta), "utf8");

  console.log(`OK: wrote\n- ${path.relative(process.cwd(), jsonPath)}\n- ${path.relative(process.cwd(), mdPath)}`);
}

main().catch((e) => {
  console.error("metrics failed:", e);
  process.exit(1);
});
