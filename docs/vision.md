# Power Platform Companion App – Concept Overview

## Core Purpose

A lightweight, web or mobile app designed to support **Power Platform developers** in real time.

> **Goal:** Provide a quick-access toolkit, cheat sheet, and sanity-preserver for Power Platform builders.

---

## Feature Ideas

| Feature                                | Description                                                                                                 |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 🧠 **Power Fx Snippet Bank**           | Quick copy‑pasteable formulas with tags (delegation‑safe, collection operations, datetime, etc.).           |
| 🔁 **Expression Tester**               | Input Power Fx or Flow expressions, and simulate results (e.g., `addDays(utcNow(), -5)`).                   |
| 🔍 **Delegation Checker**              | Paste a Power Fx formula and get a report on which parts aren’t delegable to SharePoint/SQL.                |
| ⚙️ **Control Finder**                  | Type a use‑case and get recommended Power Apps control setups (gallery with filter, form with patch, etc.). |
| 📚 **Dataverse Entity Lookup**         | Browse Dataverse tables and columns via Graph API (with Auth) to check field names and data types.          |
| 📦 **Power Automate Action Reference** | Look up connectors and actions with examples, including error handling best practices.                      |
| 🔐 **Environment Switcher Tracker**    | Track your current environment and show warnings if switching frequently.                                   |
| 📥 **Flow Output Formatter**           | Paste raw Flow JSON and get auto‑formatted, colorized output for easy reading/debugging.                    |
| 🧪 **Instant Regex Tester**            | Quick regex testing utility, handy for `match()` in expressions and other pattern matching needs.           |
| 🌐 **Resources**                        | Curated YouTube channels and blogs with search and future recommendations.                                  |
| 🩺 **Diagnostics**                      | Error message helper with heuristics and suggested next steps.                                              |
| 🗺️ **Roadmap**                          | Reformatted official roadmap (MVP uses sample data) with search, filter, and due‑soon notifications.        |
| 🎨 **Icons**                            | Icon browser (MVP) to customise SVGs and copy Power Apps‑ready snippets.                                    |

---

## MVP (v0.x) — Implemented

The current web app (React + Vite) includes:

- Snippets (`/snippets`)
- Expression Tester (`/expression`)
- Delegation Checker (`/delegation`)
- Flow Output Formatter (`/formatter`)
- Resources (`/resources`)
- Diagnostics (`/diagnostics`)
- Roadmap (`/roadmap`)
- Icons (`/icons`)
- Settings (`/settings`), About (`/about`), Packs (`/packs`), Dataverse (placeholder, `/dataverse`), Licensing (placeholder, `/licensing`)

Data sources: static JSON examples under `web/public/*.example.json` (resources, roadmap, snippets). Preferences persisted via `localStorage` (`mm.notifyWindowMonths`, `mm.icons.*`).

---

## Near‑term (v0.1–v0.3)

- Resources: add live discovery and recommendations (ranked feeds, caching).
- Diagnostics: expand pattern library and add inline fix suggestions.
- Expression Tester: stronger parsing/linting for Power Fx.
- Roadmap: connect to official feed, configurable notifications.
- Icons: integrate larger icon libraries (Lucide/Bootstrap) with licensing and attribution.
- UX: tooltips, active indicators, typography polish.

## Later (v0.4+)

- Control Finder with guided setups and snippets.
- Power Automate action reference with examples.
- Dataverse lookup with authenticated Graph/Dataverse API.
- Collections/exports for icons and snippets.

## Principles

- Offline‑friendly MVP with static data and graceful fallbacks.
- Simple, testable components (one feature per page under `web/src/pages/`).
- Persist user preferences only; avoid sensitive data in `localStorage`.
- Clear licensing/attribution for any third‑party catalogs (icons, resources).

## Success Metrics (v0.x)

- **Time saved**: median time to find/copy a snippet or icon < 15 seconds.
- **Usage**: >= 3 features used per session on average.
- **Return rate**: 50% of users return within a week.
- **Copy actions**: >= 2 copy/export actions per session.

## Non‑goals (for MVP)

- No tenant‑specific or paid data integrations by default.
- No storage of sensitive data in localStorage.
- No heavy server‑side or multi‑user sync; focus on local/offline utility.
