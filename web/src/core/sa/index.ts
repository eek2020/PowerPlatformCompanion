// Shared, framework-agnostic SA core utilities
// Keep functions here pure and side-effect free so they can be reused in web, functions, and desktop backends.

import type { Requirement } from '../../types/sa'

export function summarizeRequirements(reqs: Requirement[]): { count: number; titles: string[] } {
  return { count: reqs.length, titles: reqs.map(r => r.title) }
}
