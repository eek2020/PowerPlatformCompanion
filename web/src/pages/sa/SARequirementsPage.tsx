import { useState } from 'react'
import type { Requirement } from '../../types/sa'
import { SA_STORAGE_KEYS } from '../../types/sa'
import { storage } from '../../lib/storage'

export default function SARequirementsPage() {
  const [requirements] = useState<Requirement[]>(() => {
    return storage.getItem<Requirement[]>(SA_STORAGE_KEYS.requirements, [])
  })
  return (
    <div className="container">
      <h1>Solution Architecture — Requirements</h1>
      <p>Import CSV/XLSX, generate dual options (Power Platform vs Azure), and edit inline. Local-first data.</p>
      <p><small>Items stored in localStorage key <code>{SA_STORAGE_KEYS.requirements}</code>.</small></p>
      <div className="card">
        <strong>Total requirements:</strong> {requirements.length}
      </div>
    </div>
  )
}
