// src/normalize.ts
import type { Ruleset } from "./types";

export function normalizeText(input: string, rs?: Ruleset): string {
  let s = String(input ?? "");

  const n = rs?.normalization ?? {};
  if (n.unicode_nfkc) s = s.normalize("NFKC");
  if (n.trim) s = s.trim();
  if (n.collapse_whitespace) s = s.replace(/\s+/g, " ");
  if (n.lowercase) s = s.toLowerCase();

  return s;
}
