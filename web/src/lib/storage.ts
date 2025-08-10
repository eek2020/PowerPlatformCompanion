// Storage abstraction to support browser localStorage now and desktop storage later
// Desktop targets (Electron/Tauri) can provide alternative implementations (e.g., SQLite)

export interface StorageService {
  getItem<T = unknown>(key: string, fallback: T): T
  setItem<T = unknown>(key: string, value: T): void
  removeItem(key: string): void
}

class BrowserLocalStorageService implements StorageService {
  getItem<T>(key: string, fallback: T): T {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw == null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }
  setItem<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // no-op in browser; desktop impl can log
    }
  }
  removeItem(key: string): void {
    try {
      window.localStorage.removeItem(key)
    } catch {
      // no-op
    }
  }
}

// Default singleton for the web app
export const storage: StorageService = new BrowserLocalStorageService()
