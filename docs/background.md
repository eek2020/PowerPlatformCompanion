# Power Platform Companion – Context Engineering Setup

## 1. Goal

We’re building the **Power Platform Companion App** using **context engineering** rather than ad-hoc “vibe coding”.
This ensures predictable, safe, and maintainable AI behavior.

We will:

* Define the architecture now.
* Consider native macOS/iOS options (Swift) and cross-platform approaches (React, etc.).
* Choose developer tools, frameworks, and architecture patterns.
* Create a GitHub repo scaffold with repeatable prompt patterns, schemas, and evaluation loops.

---

## 2. Suggested Architectures

### **Option A – Native Apple Stack**

* **Language/Tools:** Swift + Xcode (Swift Package Manager or CocoaPods)
* **UI:**

  * SwiftUI for declarative interfaces and theming
  * UIKit for mature libraries and control
* **Architecture:**

  * MVVM + Combine
  * Composable Architecture (Point-Free)
  * Clean Architecture (domain/data/presentation)
* **Persistence/Networking:**

  * Core Data, CloudKit, Realm, SQLite
  * URLSession or Alamofire
* **Testing/CI:**

  * Xcode unit/UI tests, Quick/Nimble
  * GitHub Actions or Fastlane

### **Option B – Cross-Platform**

* **Flutter (Dart)**: iOS, Android, Web, macOS
* **React Native (JavaScript/TypeScript)**: large ecosystem, Expo for prototyping
* **Kotlin Multiplatform:** shared logic, native UI per platform

### **Backend/API**

* Serverless (Azure Functions, AWS Lambda, Firebase)
* Node.js (Express/NestJS) or Python (FastAPI/Django)
* Server-side Swift (Vapor, Hummingbird)
* **Auth:** Microsoft Identity Platform (OAuth, MSAL)

---

## 3. Chosen Path – React

**Core Tooling**

```bash
brew install node
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

**Recommended Libraries**

```bash
npm install @tanstack/react-query axios @azure/msal-browser
npm install --save-dev eslint prettier
```

**State & Data**

* React Query / Redux Toolkit / Zustand
* Axios for HTTP
* MSAL for Microsoft API auth

**UI & Styling**

* Material UI, Chakra UI, Ant Design, or Tailwind

**Testing**

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Current Implementation Snapshot (Aug 2025)

- App is implemented as a React + TypeScript SPA under `web/` using Vite.
- Navigation: left collapsible sidebar (`web/src/components/NavBar.tsx`).
- Routes declared in `web/src/App.tsx`:
  - `/snippets`, `/expression`, `/delegation`, `/formatter`, `/resources`, `/icons`, `/diagnostics`, `/roadmap`, `/packs`, `/dataverse`, `/licensing`, `/settings`, `/about`.
- Data sources (MVP): static JSON in `web/public/*.example.json` (resources, roadmap, snippets), with graceful fallbacks.
- Persistence: `localStorage` keys `mm.notifyWindowMonths`, `mm.icons.size`, `mm.icons.stroke`, `mm.icons.strokeColor`, `mm.icons.fillColor`, `mm.icons.rounded`.
- Styling: global in `web/src/index.css`; sidebar styles in `web/src/components/NavBar.css`.

Run locally for this repo:

```bash
cd web
npm install
npm run dev
```

---

## 4. macOS Development Environment Setup

### Step 1 – Prerequisites

```bash
xcode-select --install
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Step 2 – Node.js + React

Install Node.js:

```bash
brew install node
```

Scaffold with Vite:

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

### Step 3 – Optional Swift Native

* Install Xcode (App Store)
* Create SwiftUI app via Xcode wizard
* For server-side Swift:

```bash
brew install vapor
vapor new MyBackend --template=api
```

### Step 4 – Tooling

* **Editors:** VS Code (React), Xcode (Swift)
* **Version Control:**

```bash
git init
git add .
git commit -m "initial commit"
```

* **API Testing:** Postman / Insomnia
* **CI/CD:** GitHub Actions, Fastlane for iOS

---

## 5. GitHub Repo Scaffold

```plaintext
/context
  system.md
  persona.md
  style.md
  safety.md
  tools.json
  glossary.md
/prompts
  snippets.compose.md
  odata.builder.md
  delegation.check.md
  licensing.explain.md
  licensing.estimate.md
  issue.search.md
  mvp.discover.md
  project.plan.md
  prompt.library.curate.md
  governance.checklists.md
/retrieval
  chunk.schema.json
  metadata.schema.json
/memory
  user.profile.json
  session.state.json
/packs
  snippets.schema.json
  issues.schema.json
  mvp.schema.json
  licensing.schema.json
/eval
  rubric.functional.md
  rubric.safety.md
  rubric.format.md
  redteam.md
  /testcases/
```

---

## 6. Example Context Files

**`/context/system.md`**

```md
You are the Power Platform Companion assistant.
- Prefer offline, tenant-agnostic advice in v1.x.
- Output in the requested format; if unspecified, short summary + copy block.
- Use UK conventions (dd/mm/yyyy, £).
- When citing licensing, include plan name + month/year.
- Never invent Microsoft prices or policy; use indicative ranges with disclaimers.
```

**`/context/tools.json`**

```json
[
  {
    "name": "extract_pdf_tables",
    "description": "Extract text and tables from a licensing PDF"
  },
  {
    "name": "search_web",
    "description": "Search for MVP blogs and YouTube channels"
  }
]
```

---

## 7. Next Steps

1. **Download Scaffold ZIP** (prepared with all files/folders).
2. Extract into your repo root.
3. Open in VS Code:

   ```bash
   code .
   ```
4. Commit & push:

   ```bash
   git add .
   git commit -m "Add MakerMate context-engineering scaffold"
   git push
   ```
