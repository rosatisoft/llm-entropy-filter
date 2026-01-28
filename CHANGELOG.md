# Changelog

All notable changes to this project will be documented in this file.

The format is based on semantic versioning principles.

---

## [1.1.0] - 2026-01-28

### 🚀 Added

- Introduced formal **ruleset architecture** (`default`, `strict`, `support`, `public-api`).
- Added `rulesets/` directory for configurable entropy presets.
- Added integration examples:
  - Express middleware
  - Fastify plugin
  - Vercel AI SDK pre-gate wrapper
- Added reproducible benchmark scripts for spam dataset evaluation.
- Added economic & performance impact documentation.
- Added stability & hallucination mitigation section in README.
- Added production-readiness checklist.

### 🧪 Bench & Metrics

- Included reproducible SMS spam dataset benchmarking.
- Added support for generating precision / recall style reports.
- Added structured telemetry output for integration logging.

### 🛠 Internal

- No changes to core `gate()` logic.
- No breaking changes to public API.
- Existing behavior remains the default under `ruleset: "default"`.

### ⚠️ Breaking Changes

None.

This release focuses on infrastructure packaging, documentation clarity, and integration readiness without altering the deterministic entropy engine.

---

## [1.0.1] - 2026-01-27

### Added

- Initial demo server (`/analyze`, `/triad`)
- Deterministic entropy scoring
- ALLOW / WARN / BLOCK verdict structure
- Performance benchmark documentation
