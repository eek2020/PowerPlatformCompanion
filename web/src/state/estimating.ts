// Shared state for Estimating (Planning + Licensing)
// Minimal evented store with localStorage persistence.

export type LicensingDataset = {
  versionTag?: string
  sourceUrl?: string
  fetchedAt?: string
  // Free-form payload for now; will formalize in Phase 2
  data?: any
}

export type EstimatingState = {
  planningItems: any[]
  licensing: LicensingDataset | null
}

const LS_KEY = 'mm.estimating.v1'

function load(): EstimatingState {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { planningItems: [], licensing: null }
}

let state: EstimatingState = load()

const listeners = new Set<() => void>()

function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  } catch {}
}

export const estimatingStore = {
  getState(): EstimatingState {
    return state
  },
  subscribe(fn: () => void) {
    listeners.add(fn)
    return () => { listeners.delete(fn) }
  },
  setPlanning(items: any[]) {
    state = { ...state, planningItems: items }
    save()
    listeners.forEach(l => l())
  },
  setLicensing(dataset: LicensingDataset | null) {
    state = { ...state, licensing: dataset }
    save()
    listeners.forEach(l => l())
  },
}

// Listen to storage changes (multi-tab sync)
window.addEventListener('storage', (e) => {
  if (e.key === LS_KEY && e.newValue) {
    try {
      state = JSON.parse(e.newValue)
      listeners.forEach(l => l())
    } catch {}
  }
})
