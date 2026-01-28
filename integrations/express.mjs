// integrations/express.mjs
import { gate } from "llm-entropy-filter";

/**
 * Create an Express middleware that runs `gate()` before LLM calls.
 *
 * Design goals:
 * - Zero behavior changes to core `gate()`
 * - Drop-in for public chat endpoints
 * - Deterministic: no external calls
 *
 * @param {object} [opts]
 * @param {string} [opts.bodyField="text"] - Field name in req.body that contains user text.
 * @param {string} [opts.queryField] - Optional query param fallback (e.g., ?text=...).
 * @param {boolean} [opts.attachResult=true] - Attach result to req.entropyGate.
 * @param {boolean} [opts.blockOn="BLOCK"] - Block when action matches this string ("BLOCK") or array of actions.
 * @param {number} [opts.blockStatus=400] - HTTP status when blocked.
 * @param {object|function} [opts.blockResponse] - Custom JSON response or function(req, res, result) => any
 * @param {boolean} [opts.warnHeader=true] - If WARN, add response headers with gate metadata.
 * @param {boolean} [opts.alwaysHeader=false] - If true, add headers for all actions.
 * @param {function} [opts.onResult] - Hook: (req, result) => void
 * @param {function} [opts.getText] - Hook: (req) => string (overrides bodyField/queryField)
 */
export function entropyGateMiddleware(opts = {}) {
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
  } = opts;

  const blockSet = Array.isArray(blockOn) ? new Set(blockOn) : new Set([blockOn]);

  return function entropyGate(req, res, next) {
    try {
      // 1) Extract text
      let text = "";
      if (typeof getText === "function") {
        text = String(getText(req) ?? "");
      } else {
        const bodyVal = req?.body?.[bodyField];
        const queryVal = queryField ? req?.query?.[queryField] : undefined;
        text = String(bodyVal ?? queryVal ?? "");
      }

      // 2) Run deterministic gate
      const result = gate(text);

      // 3) Attach result for downstream routing/logging
      if (attachResult) {
        // Convention: req.entropyGate
        req.entropyGate = result;
      }

      // Optional hook
      if (typeof onResult === "function") {
        onResult(req, result);
      }

      // 4) Telemetry headers (optional)
      const shouldHeader = alwaysHeader || (warnHeader && result?.action === "WARN");
      if (shouldHeader) {
        // Keep headers small and stable
        res.setHeader("x-entropy-action", String(result?.action ?? ""));
        res.setHeader("x-entropy-score", String(result?.entropy_score ?? ""));
        res.setHeader("x-entropy-intention", String(result?.intention ?? ""));
        // Flags can be large; keep compact
        if (Array.isArray(result?.flags)) {
          res.setHeader("x-entropy-flags", result.flags.slice(0, 10).join(","));
        }
      }

      // 5) Block if configured
      if (blockSet.has(result?.action)) {
        res.status(blockStatus);

        if (typeof blockResponse === "function") {
          return res.json(blockResponse(req, res, result));
        }

        if (blockResponse && typeof blockResponse === "object") {
          return res.json(blockResponse);
        }

        // Default response: transparent + actionable
        return res.json({
          ok: false,
          blocked: true,
          gate: result,
          message:
            "Request blocked by llm-entropy-filter (high-entropy / low-signal input).",
        });
      }

      // Otherwise proceed
      return next();
    } catch (err) {
      // Fail-open by default: do not block requests if the gate errors.
      // You can change this behavior by wrapping with your own error handler.
      return next(err);
    }
  };
}

/**
 * Small helper for routing:
 * If you prefer to run gate manually inside route handlers.
 */
export function runEntropyGate(text) {
  return gate(String(text ?? ""));
}
