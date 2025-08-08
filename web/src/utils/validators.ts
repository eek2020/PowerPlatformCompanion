import type { Snippet } from '../data/snippetsMock'

export function isString(x: unknown): x is string {
  return typeof x === 'string'
}

export function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(isString)
}

export function isBoolean(x: unknown): x is boolean {
  return typeof x === 'boolean'
}

export function isSnippet(x: unknown): x is Snippet {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    isString(o.id) &&
    isString(o.title) &&
    isStringArray(o.tags) &&
    isString(o.code) &&
    (o.explanation === undefined || isString(o.explanation)) &&
    (o.source === undefined || isString(o.source)) &&
    (o.tested === undefined || isBoolean(o.tested))
  )
}

export function isSnippetArray(x: unknown): x is Snippet[] {
  return Array.isArray(x) && x.every(isSnippet)
}
