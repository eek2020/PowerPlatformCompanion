import { useState } from 'react'
import type { Entity, Field } from '../../types/sa'
import { SA_STORAGE_KEYS } from '../../types/sa'
import { storage } from '../../lib/storage'

export default function SAErdPage() {
  const [entities] = useState<Entity[]>(() => {
    return storage.getItem<{ entities?: Entity[]; fields?: Field[] } | null>(SA_STORAGE_KEYS.erd, null)?.entities || []
  })
  const [fields] = useState<Field[]>(() => {
    return storage.getItem<{ entities?: Entity[]; fields?: Field[] } | null>(SA_STORAGE_KEYS.erd, null)?.fields || []
  })
  return (
    <div className="container">
      <h1>Solution Architecture — ERD</h1>
      <p>Define entities and fields, generate Mermaid erDiagram, and export/import CSV. Local-first storage.</p>
      <p><small>Stored under <code>{SA_STORAGE_KEYS.erd}</code>.</small></p>
      <div className="card">
        <strong>Entities:</strong> {entities.length} &nbsp;|&nbsp; <strong>Fields:</strong> {fields.length}
      </div>
    </div>
  )
}
