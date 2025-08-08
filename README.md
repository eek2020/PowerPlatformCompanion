# PowerPlatformCompanion
A MacOS companion to help with all things Power Platform

## Documentation
- **Vision**: see `docs/vision.md` for the product concept and MVP goals.
- **Background**: see `docs/background.md` for history, prior exploration, and decisions.

## Repo Structure (high‑level)
- **`context/`**: Runtime prompt surface for the assistant.
  - `system.md`, `persona.md`, `style.md`, `safety.md`, `glossary.md`, `tools.json`
  - Keep this minimal and focused on rules the model should follow at run time.
- **`docs/`**: Project documentation (vision, background, architecture, ADRs, roadmap).
  - Non‑runtime materials live here to avoid polluting the active context.
- **`prompts/`**: Feature prompt templates (repeatable patterns, input/output contracts).
- **`retrieval/`**: RAG schemas and router prompts.
- **`memory/`**: Templates for user/session state.
- **`packs/`**: Content pack schemas (snippets, issues, MVPs, licensing).
- **`eval/`**: Guardrail rubrics, red‑team cases, and golden testcases.
