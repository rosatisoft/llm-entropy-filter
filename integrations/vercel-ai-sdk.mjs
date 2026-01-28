// integrations/vercel-ai-sdk.mjs
import { gate } from "llm-entropy-filter";

/**
 * Pre-gate helper for Vercel AI SDK style flows.
 *
 * Typical usage:
 *  - Compute gate result
 *  - If BLOCK: return early
 *  - If WARN: optionally add metadata/logging and continue
 */
export function entropyPreGate(input, opts = {}) {
  const { blockOn = "BLOCK" } = opts;
  const blockSet = Array.isArray(blockOn) ? new Set(blockOn) : new Set([blockOn]);

  const result = gate(String(input ?? ""));

  return {
    gate: result,
    shouldBlock: blockSet.has(result?.action),
    shouldWarn: result?.action === "WARN",
    shouldAllow: result?.action === "ALLOW",
  };
}

/**
 * Helper to build a standard Response when blocked (Edge/Node compatible).
 */
export function blockedResponse(gateResult, opts = {}) {
  const { status = 400 } = opts;
  return new Response(
    JSON.stringify({
      ok: false,
      blocked: true,
      gate: gateResult,
      message:
        "Request blocked by llm-entropy-filter (high-entropy / low-signal input).",
    }),
    {
      status,
      headers: { "content-type": "application/json; charset=utf-8" },
    }
  );
}
