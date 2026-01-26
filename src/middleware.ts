// src/middleware.ts
import { runEntropyFilter } from "./wrapper";
import type { FilterResult } from "./types";

/**
 * Middleware agnóstico (NO depende de express types).
 * Compatible con Express / Next API routes / cualquier framework estilo req-res-next.
 *
 * Espera: req.body.text (string)
 * Escribe: req.entropy = FilterResult
 */
export function entropyMiddleware(req: any, _res: any, next: any) {
  const text = req?.body?.text;

  const result: FilterResult =
    typeof text === "string" ? runEntropyFilter(text) : runEntropyFilter("");

  req.entropy = result;
  next?.();
}

/**
 * Tipo auxiliar opcional (sin forzar dependencias).
 * Útil si quieres tipar tu req en tu app.
 */
export type EntropyAugmentedRequest = {
  body?: { text?: unknown };
  entropy?: FilterResult;
};
