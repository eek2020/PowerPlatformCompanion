# Over-reach Ideas Log

Updated: 2025-08-12T20:47:24+01:00

This log captures ideas that are valuable but beyond the current scope. Use it to park, refine, and later schedule ambitious work without derailing near-term goals.

## How to use

- Add each idea as a new entry under “Ideas” using the template.
- Keep entries concise but actionable; link to related code/docs.
- Track status: `proposed | parked | researching | scheduled | done`.

## Template

```md
### <Title> — YYYY-MM-DD
- Context: <where the idea came up>
- Why it’s over-reach: <what makes it out-of-scope now>
- Potential value: <what we gain>
- Possible MVP path: <smallest viable version>
- Dependencies/risks: <tech, time, skills, privacy>
- Related code/docs: <paths or links>
- Status: proposed
- Owner: <who will push it forward>
```

## Ideas

### Serverless AI key proxy for production — 2025-08-12
- Context: Storing API keys in the browser is fine for dev; production should avoid it.
- Why it’s over-reach: Requires backend work, auth, and ops setup.
- Potential value: Keeps provider keys off the client; centralizes usage controls.
- Possible MVP path: Netlify function that forwards AI requests with provider creds from env vars; simple rate-limit.
- Dependencies/risks: Netlify functions, env management, minimal auth.
- Related code/docs: `netlify/functions/*`, `web/src/lib/ai/client.ts`, `docs/security.md`.
- Status: proposed
- Owner: TBD

### Pluggable AI provider system — 2025-08-12
- Context: We support a couple providers; more may be needed.
- Why it’s over-reach: Requires interfaces, registry, and testing across providers.
- Potential value: Faster onboarding of new providers/models.
- Possible MVP path: Define `ProviderAdapter` interface; registry + simple adapters for OpenAI/Anthropic.
- Dependencies/risks: Abstraction churn; handling provider-specific features.
- Related code/docs: `web/src/lib/ai/client.ts`, `web/src/lib/ai.ts`.
- Status: proposed
- Owner: TBD

### Local secret obfuscation (passphrase) — 2025-08-12
- Context: Dev keys live in localStorage via `SecretStore`.
- Why it’s over-reach: Web crypto + UX for passphrase adds complexity; not true security.
- Potential value: Opportunistic mitigation against casual inspection.
- Possible MVP path: Optional passphrase to wrap secrets using Web Crypto; remember for session.
- Dependencies/risks: UX friction; recovery flows.
- Related code/docs: `web/src/lib/secrets.ts`, `web/src/lib/storage.ts`.
- Status: proposed
- Owner: TBD

### Desktop packaging (Tauri/Electron) — 2025-08-12
- Context: Shared logic under `web/src/core/sa/` anticipates desktop.
- Why it’s over-reach: Tooling, signing, updates, and OS nuances.
- Potential value: Offline-first UX; better secret handling; local file I/O.
- Possible MVP path: Tauri shell that serves the existing SPA; wire secrets to native store.
- Dependencies/risks: Build pipelines, code signing.
- Related code/docs: `web/src/core/sa/`, `web/src/lib/secrets.ts`.
- Status: proposed
- Owner: TBD

### Implement real SA backends (Netlify functions) — 2025-08-12
- Context: Current SA endpoints are stubs with mock responses.
- Why it’s over-reach: Requires security, rate limits, cost control, and prompt design.
- Potential value: End-to-end usable SA workflows (Requirements, HLD, ERD).
- Possible MVP path: Wire one endpoint (e.g., `sa-generate-options`) to a single provider via serverless proxy.
- Dependencies/risks: Provider costs; API quotas.
- Related code/docs: `netlify/functions/sa-*`, `web/src/pages/sa/*`.
- Status: proposed
- Owner: TBD

### Docs–code drift guardrails — 2025-08-12
- Context: We updated docs to match code; drift can reappear.
- Why it’s over-reach: Requires build-time checks and conventions.
- Potential value: Early warnings when routes/components and docs diverge.
- Possible MVP path: CI script to parse routes (`web/src/App.tsx`) and assert presence in `docs/routing.md`.
- Dependencies/risks: Maintenance overhead; false positives.
- Related code/docs: `web/src/App.tsx`, `docs/routing.md`.
- Status: proposed
- Owner: TBD
