import { useState } from 'react'
import { SA_STORAGE_KEYS } from '../../types/sa'
import { storage } from '../../lib/storage'

export default function SAHldPage() {
  const [mermaidCode] = useState<string>(() => {
    return storage.getItem<{ mermaidCode?: string } | null>(SA_STORAGE_KEYS.hld, null)?.mermaidCode || ''
  })
  return (
    <div className="container">
      <h1>Solution Architecture — HLD</h1>
      <p>Draft High-Level Designs using Mermaid with AI assistance. Local-first storage.</p>
      <p><small>Stored under <code>{SA_STORAGE_KEYS.hld}</code>.</small></p>
      <div className="card">
        <strong>Current Mermaid snippet:</strong>
        <pre><code>{mermaidCode || '—'}</code></pre>
      </div>
    </div>
  )
}
