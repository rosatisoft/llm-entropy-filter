// integrations/fastify.mjs
import { gate } from "llm-entropy-filter";

/**
 * Fastify plugin: adds a preHandler that runs `gate()` before your route handler.
 *
 * Usage:
 *   fastify.register(entropyGatePlugin, { bodyField: "text", blockOn: "BLOCK" })
 *
 * Design:
 * - Deterministic, local
 * - Fail-open by default (if gate throws, request continues unless you override)
 */
export async function entropyGatePlugin(fastify, opts = {}) {
  const {
    bodyField = "text",
    queryField,
    attachResult = true,
    blockOn = "BLOCK",
    blockStatus = 400,
    blockResponse,
    warnHeader = true,
    alwaysHeader = false,
    onResult,
    getText,
    failClosed = false, // if true: return 500 on errors instead of passing through
  } = opts;

  const blockSet = Array.isArray(blockOn) ? new Set(blockOn) : new Set([blockOn]);

  fastify.decorateRequest("entropyGate", null);

  fastify.addHook("preHandler", async (request, reply) => {
    try {
      // 1) Extract text
      let text = "";
      if (typeof getText === "function") {
        text = String(getText(request) ?? "");
      } else {
        const bodyVal = request?.body?.[bodyField];
        const queryVal = queryField ? request?.query?.[queryField] : undefined;
        text = String(bodyVal ?? queryVal ?? "");
      }

      // 2) Run gate
      const result = gate(text);

      // 3) Attach
      if (attachResult) {
        request.entropyGate = result;
      }

      if (typeof onResult === "function") {
        onResult(request, result);
      }

      // 4) Headers
      const shouldHeader =
        alwaysHeader || (warnHeader && result?.action === "WARN");
      if (shouldHeader) {
        reply.header("x-entropy-action", String(result?.action ?? ""));
        reply.header("x-entropy-score", String(result?.entropy_score ?? ""));
        reply.header("x-entropy-intention", String(result?.intention ?? ""));
        if (Array.isArray(result?.flags)) {
          reply.header("x-entropy-flags", result.flags.slice(0, 10).join(","));
        }
      }

      // 5) Block
      if (blockSet.has(result?.action)) {
        reply.code(blockStatus);

        if (typeof blockResponse === "function") {
          return reply.send(blockResponse(request, reply, result));
        }

        if (blockResponse && typeof blockResponse === "object") {
          return reply.send(blockResponse);
        }

        return reply.send({
          ok: false,
          blocked: true,
          gate: result,
          message:
            "Request blocked by llm-entropy-filter (high-entropy / low-signal input).",
        });
      }
    } catch (err) {
      if (failClosed) {
        reply.code(500);
        return reply.send({
          ok: false,
          error: "entropy_gate_error",
          message: String(err?.message ?? err),
        });
      }
      // fail-open: continue request
    }
  });
}

/** Manual helper if you prefer using it inside handlers */
export function runEntropyGate(text) {
  return gate(String(text ?? ""));
}
