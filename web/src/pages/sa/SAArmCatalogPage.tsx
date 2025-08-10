import { useState } from 'react'
import type { ArmTemplate } from '../../types/sa'
import { SA_STORAGE_KEYS } from '../../types/sa'
import { storage } from '../../lib/storage'

export default function SAArmCatalogPage() {
  const [catalog] = useState<ArmTemplate[]>(() => {
    return storage.getItem<ArmTemplate[]>(SA_STORAGE_KEYS.catalog, [])
  })
  return (
    <div className="container">
      <h1>Solution Architecture — ARM Catalog</h1>
      <p>Browse/upload ARM templates and launch deploy links. Local-first catalog.</p>
      <p><small>Stored under <code>{SA_STORAGE_KEYS.catalog}</code>.</small></p>
      <div className="card">
        <strong>Templates:</strong> {catalog.length}
      </div>
    </div>
  )
}
