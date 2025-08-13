export type ProviderId = 'openai' | 'anthropic'
export type ProcessId =
  | 'snippets'
  | 'delegation'
  | 'expression'
  | 'diagnostics'
  | 'formatter'
  | 'dataverse'
  | 'packs'
  | 'icons'
  | 'estimating'
  | 'requirements'
  | 'hld'
  | 'arm'
  | 'erd'
  | 'roadmap'
  | 'licensing'

export type Binding = {
  provider: ProviderId
  model: string
  prompt: string  // Store prompt directly in the binding
  promptOverride?: string // Legacy field, will be migrated
}

const LS = {
  activeProvider: 'mm.ai.activeProvider',
  activeModel: 'mm.ai.activeModel',
  openaiModels: 'mm.ai.models.openai',
  anthropicModels: 'mm.ai.models.anthropic',
  prompt: (p: ProviderId, m: string) => `mm.ai.prompt.${p}.${m}`,
  bindings: 'mm.ai.bindings.v1',
}

export const getActiveProvider = (): ProviderId => (localStorage.getItem(LS.activeProvider) as ProviderId) || 'openai'
export const setActiveProvider = (p: ProviderId) => localStorage.setItem(LS.activeProvider, p)

export const getActiveModel = (): string => localStorage.getItem(LS.activeModel) || ''
export const setActiveModel = (m: string) => localStorage.setItem(LS.activeModel, m)

export const getModels = (p: ProviderId): string[] => {
  try {
    const key = p === 'openai' ? LS.openaiModels : LS.anthropicModels
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch { return [] }
}

export const setModels = (p: ProviderId, models: string[]) => {
  const key = p === 'openai' ? LS.openaiModels : LS.anthropicModels
  localStorage.setItem(key, JSON.stringify(models))
}

export const getPrompt = (p: ProviderId, m: string): string => localStorage.getItem(LS.prompt(p, m)) || ''
export const setPrompt = (p: ProviderId, m: string, text: string) => localStorage.setItem(LS.prompt(p, m), text)

export type BindingsMap = Record<ProcessId, Binding | undefined>

export const getBindings = (): BindingsMap => {
  try { return JSON.parse(localStorage.getItem(LS.bindings) || '{}') } catch { return {} as any }
}

export const setBindings = (map: BindingsMap) => localStorage.setItem(LS.bindings, JSON.stringify(map))

export const getBinding = (proc: ProcessId): Binding | undefined => getBindings()[proc]

// Type guard to check if an object is a Binding
const isBinding = (obj: any): obj is Binding => 
  obj && typeof obj === 'object' && 'provider' in obj && 'model' in obj

// Type for the old Binding format before we added the prompt field
interface LegacyBinding {
  provider: ProviderId
  model: string
  promptOverride?: string
}

// Migrate old bindings to include prompt field if needed
const migrateBindings = (bindings: BindingsMap): BindingsMap => {
  let changed = false
  const result: BindingsMap = { ...bindings }
  
  for (const proc of Object.keys(result) as ProcessId[]) {
    const binding = result[proc]
    if (binding && isBinding(binding) && !('prompt' in binding)) {
      // Migrate from promptOverride to prompt
      const oldBinding = binding as unknown as LegacyBinding
      result[proc] = {
        provider: oldBinding.provider,
        model: oldBinding.model,
        prompt: oldBinding.promptOverride || getPrompt(oldBinding.provider, oldBinding.model),
        ...(oldBinding.promptOverride && { promptOverride: oldBinding.promptOverride })
      }
      changed = true
    }
  }
  
  return changed ? result : bindings
}

export const setBinding = (proc: ProcessId, binding: Binding | undefined) => {
  const map = getBindings()
  
  // Migrate existing bindings if needed
  const migratedMap = migrateBindings(map)
  if (migratedMap !== map) {
    setBindings(migratedMap)
  }
  
  // Update the specified binding
  if (binding) {
    // Ensure prompt is set, falling back to provider/model prompt if not provided
    const updatedBinding: Binding = {
      ...binding,
      prompt: binding.prompt || getPrompt(binding.provider, binding.model)
    }
    migratedMap[proc] = updatedBinding
  } else {
    delete migratedMap[proc]
  }
  
  setBindings(migratedMap)
}

export type ResolvedConfig = { provider: ProviderId; model: string; prompt: string }

// Resolve what to use for a given process: binding if present; otherwise fall back to global active selections.
export const resolveConfig = (proc: ProcessId): ResolvedConfig => {
  const b = getBinding(proc)
  if (b) {
    // Prefer the binding's prompt, then legacy promptOverride, then fall back to provider/model prompt
    const prompt = b.prompt || b.promptOverride || getPrompt(b.provider, b.model)
    return { provider: b.provider, model: b.model, prompt }
  }
  const provider = getActiveProvider()
  const model = getActiveModel()
  const prompt = getPrompt(provider, model)
  return { provider, model, prompt }
}

export const ALL_PROCESSES: { id: ProcessId; label: string }[] = [
  { id: 'snippets', label: 'Snippets' },
  { id: 'delegation', label: 'Delegation' },
  { id: 'expression', label: 'Expression Tester' },
  { id: 'diagnostics', label: 'Diagnostics' },
  { id: 'formatter', label: 'Flow Formatter' },
  { id: 'dataverse', label: 'Dataverse Lookup' },
  { id: 'packs', label: 'Packs' },
  { id: 'icons', label: 'Icons' },
  { id: 'estimating', label: 'Estimating' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'hld', label: 'HLD' },
  { id: 'arm', label: 'ARM Catalog' },
  { id: 'erd', label: 'ERD' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'licensing', label: 'Licensing' },
]
