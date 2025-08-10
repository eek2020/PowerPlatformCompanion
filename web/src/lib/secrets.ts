// Secrets abstraction. In the browser we fall back to localStorage under a private prefix.
// Desktop (Electron/Tauri) should provide OS keychain-backed implementations.

export interface SecretStore {
  get(key: string): string | null
  set(key: string, value: string): void
  delete(key: string): void
}

const PREFIX = 'mm.secret.'

class BrowserSecretStore implements SecretStore {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(PREFIX + key)
    } catch {
      return null
    }
  }
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(PREFIX + key, value)
    } catch {
      // no-op
    }
  }
  delete(key: string): void {
    try {
      window.localStorage.removeItem(PREFIX + key)
    } catch {
      // no-op
    }
  }
}

export const secrets: SecretStore = new BrowserSecretStore()
