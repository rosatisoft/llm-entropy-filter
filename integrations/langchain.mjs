// integrations/langchain.mjs
import { gate } from "llm-entropy-filter";

/**
 * Minimal pre-gate for LangChain flows.
 * Use this before calling any LLM / chain / agent.
 */
export function entropyPreGate(input, opts = {}) {
  const { blockOn = "BLOCK" } = opts;
  const blockSet = Array.isArray(blockOn) ? new Set(blockOn) : new Set([blockOn]);

  const text = typeof input === "string" ? input : String(input?.text ?? input ?? "");
  const result = gate(text);

  return {
    gate: result,
    inputText: text,
    shouldBlock: blockSet.has(result?.action),
    shouldWarn: result?.action === "WARN",
    shouldAllow: result?.action === "ALLOW",
  };
}

/**
 * Standard error object you can throw in API routes.
 */
export function entropyBlockedError(gateResult, opts = {}) {
  const { status = 400, code = "ENTROPY_BLOCKED" } = opts;
  const err = new Error("Blocked by llm-entropy-filter (high-entropy / low-signal input).");
  err.name = "EntropyBlockedError";
  err.status = status;
  err.code = code;
  err.gate = gateResult;
  return err;
}

/**
 * LCEL wrapper: wrap a Runnable / function to enforce gate before execution.
 * Works with `@langchain/core/runnables` (RunnableLambda).
 *
 * Usage:
 *   const safe = withEntropyGate(myRunnableOrFn, { pickText: (i)=> i.input })
 *   await safe.invoke({ input: "..." })
 */
export function withEntropyGate(target, opts = {}) {
  const {
    blockOn = "BLOCK",
    pickText, // (input) => string
    onWarn,   // (gateResult, input) => void
  } = opts;

  const blockSet = Array.isArray(blockOn) ? new Set(blockOn) : new Set([blockOn]);

  // lazy import to avoid forcing langchain deps
  let RunnableLambda;
  async function getRunnableLambda() {
    if (RunnableLambda) return RunnableLambda;
    const mod = await import("@langchain/core/runnables");
    RunnableLambda = mod.RunnableLambda;
    return RunnableLambda;
  }

  return {
    async invoke(input, config) {
      const text = typeof pickText === "function"
        ? String(pickText(input) ?? "")
        : (typeof input === "string" ? input : String(input?.input ?? input?.text ?? ""));

      const g = gate(text);

      if (g?.action === "WARN" && typeof onWarn === "function") onWarn(g, input);

      if (blockSet.has(g?.action)) {
        throw entropyBlockedError(g, { status: 400 });
      }

      // If target is a Runnable with invoke()
      if (target && typeof target.invoke === "function") {
        return target.invoke(input, config);
      }

      // If target is a function
      if (typeof target === "function") {
        return target(input, config);
      }

      throw new Error("withEntropyGate: target must be a Runnable (invoke) or a function.");
    },

    // Optional: make it LCEL-friendly by exposing `asRunnable()`
    async asRunnable() {
      const RL = await getRunnableLambda();
      return new RL({
        func: async (input, config) => this.invoke(input, config),
      });
    },
  };
}
