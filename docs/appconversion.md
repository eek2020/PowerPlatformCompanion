# Desktop App Conversion (Non‑Store)

This document outlines the fastest path to ship the existing React + Vite SPA (`web/`) as installable desktop apps for macOS and Windows WITHOUT using their app stores. Mobile (Android/iOS) is intentionally out of scope for now.

Assumptions:
- The app is client‑only, uses `localStorage`, and needs file save/open and clipboard.
- No heavy native integrations are required at this time.


## Recommendation at a Glance

- Framework: Prefer Tauri (smaller footprint, fast, native dialogs); Electron also viable.
- Distribution: Direct downloads (no stores).
  - macOS: notarized DMG/ZIP for best UX, or unsigned ZIP with quarantine instructions for internal use.
  - Windows: EXE/MSI installer; signing recommended to reduce SmartScreen prompts.
- Abstraction: Add a tiny platform adapter for file/clipboard so web/desktop share one code path.


## Why Tauri over Electron (for us)
- Very small runtime compared to Electron (Rust shell + system webview).
- First‑class APIs for filesystem, dialogs, clipboard, and auto‑updater.
- Easy packaging for macOS and Windows; good CI story.
- If we later need Node modules, Electron may be simpler; for our current needs, Tauri is leaner.


## macOS (Direct distribution)

- Complexity: Medium
- Output: `.dmg` (or `.zip`) containing `MakerMate.app`.
- Install UX:
  - DMG with drag‑to‑Applications is familiar and clean.
  - ZIP is fine for internal users; macOS will quarantine unsigned apps.

### Steps
1. Add Tauri to the project (desktop shell alongside `web/`).
2. Point Tauri to Vite build output (`dist/`) and wire up:
   - File save dialog for CSV export (replace File System Access API with Tauri `dialog` + `fs`).
   - Clipboard operations via Tauri `clipboard`.
3. App identity: name, version, icons, bundle identifier.
4. Build a `.app` + `.dmg` on macOS (or via CI macOS runner).
5. Signing & Notarization options:
   - Best practice: sign with Developer ID + notarize (smooth launch without scary prompts).
   - Internal use only: keep unsigned, but users must right‑click → Open (Gatekeeper warning).

### Challenges
- Code signing + notarization pipeline (Apple Developer account, CI secrets).
- Hardened runtime flags and entitlements (minimal for this app).
- Handling first‑run permissions if any future features require them.

### Effort (ballpark)
- 3–5 days for a working signed/notarized DMG with native file dialogs and clipboard.
- 1–2 extra days to automate CI builds and notarization.


## Windows (Direct distribution)

- Complexity: Medium
- Output: `.exe` (NSIS) or `.msi` installer; optional portable `.exe`.
- Install UX:
  - Double‑click installer; optional Start Menu/Desktop shortcuts.
  - Unsigned builds show SmartScreen warnings; signing certificate improves trust.

### Steps
1. Add Tauri to the project (or Electron, if preferred).
2. Use Tauri APIs for file dialogs and clipboard (replace browser‑only calls).
3. App identity: product name, version, icons.
4. Package via Tauri bundler:
   - NSIS `.exe` (common) or MSI.
   - Configure install dir, shortcuts, and uninstaller.
5. Code signing options:
   - Recommended: sign with an Authenticode certificate (EV improves SmartScreen reputation).
   - Internal use: unsigned is acceptable; expect SmartScreen prompts.

### Challenges
- SmartScreen reputation for unsigned/new binaries.
- Updater hosting (if we enable auto‑updates) – e.g., GitHub Releases or S3.
- File path differences vs browser; ensure we always use user‑chosen paths.

### Effort (ballpark)
- 3–5 days to produce a usable installer with native file dialogs and clipboard.
- +1–2 days to wire up auto‑update and signing in CI.


## Shared Work Items (macOS + Windows)

- Create a platform adapter in `web/`:
  - `saveFile(csvBytes, suggestedName)` →
    - Web: trigger download (current fallback path)
    - Desktop: Tauri dialog + fs write
  - `copyToClipboard(text)` →
    - Web: `navigator.clipboard`
    - Desktop: Tauri `clipboard`
- Add an environment flag (e.g., `VITE_RUNTIME=web|desktop`) to select adapter at runtime/build.
- CI pipelines (GitHub Actions) with separate jobs for macOS and Windows builds, optional signing.
- Icons and branding for both platforms.


## What We Don’t Need (yet)
- App Store listings (Mac App Store / Microsoft Store) – parked.
- Deep OS integrations beyond dialogs/clipboard.


## Next Steps
1. Introduce the platform adapter and swap `Save As…` to use it when in desktop mode.
2. Scaffold Tauri, point to Vite build, and verify CSV export + clipboard.
3. Produce unsigned builds first for internal testing.
4. Add signing & (macOS) notarization once we’re happy with the UX.
5. Optional: add auto‑updater and CI release automation.
