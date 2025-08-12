// Simple CSV export helper for arrays of objects
// Escapes double quotes and wraps fields containing commas/newlines in quotes

export function exportToCsv(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) {
    console.warn('exportToCsv: no rows to export')
    return
  }
  const headers = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r).forEach((k) => set.add(k))
      return set
    }, new Set<string>())
  )

  const escape = (val: unknown) => {
    if (val == null) return ''
    const s = String(val)
    const needsQuotes = /[",\n]/.test(s)
    const escaped = s.replace(/"/g, '""')
    return needsQuotes ? `"${escaped}"` : escaped
  }

  const lines: string[] = []
  lines.push(headers.join(','))
  for (const row of rows) {
    lines.push(headers.map((h) => escape((row as any)[h])).join(','))
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
