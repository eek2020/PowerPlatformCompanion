// Solution Architecture workspace types
// Local-first models; persisted to localStorage and exportable as JSON

export type Requirement = {
  id: string
  title: string
  description: string
  category?: string
  priority?: string
  source?: string
  acceptanceCriteria?: string
  metadata?: Record<string, unknown>
}

export type OptionType = 'PowerPlatform' | 'Azure'

export type SolutionOption = {
  id: string
  requirementId: string
  optionType: OptionType
  architectureSummary: string
  components: string[]
  services: string[]
  tradeoffs: string
  security?: string
  costConsiderations?: string
  implementationNotes?: string
  rationale?: string
  status?: 'todo' | 'in-progress' | 'done' | 'needs-review'
  lastEditedAt?: string
}

export type HLDArtifact = {
  id: string
  title: string
  mermaidCode: string
  narrative: string
  references?: string[]
  attachments?: string[]
  updatedAt?: string
}

export type ArmTemplate = {
  id: string
  title: string
  description?: string
  source: 'catalog' | 'uploaded'
  parametersSchema?: Record<string, unknown>
  templateUrl?: string
  fileRef?: string
  tags?: string[]
  updatedAt?: string
}

export type Entity = {
  id: string
  name: string
  description?: string
  tags?: string[]
}

export type Field = {
  id: string
  entityId: string
  name: string
  type: string
  required: boolean
  pk?: boolean
  fk?: { targetEntity: string; targetField: string }
  notes?: string
}

export const SA_STORAGE_KEYS = {
  requirements: 'mm.sa.requirements.v1',
  options: 'mm.sa.options.v1',
  hld: 'mm.sa.hld.v1',
  erd: 'mm.sa.erd.v1',
  catalog: 'mm.sa.catalog.v1',
} as const
