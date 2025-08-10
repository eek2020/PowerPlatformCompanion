// Serverless stub: HLD draft (mock)
// POST /api/sa/hld-draft { brief, docs? }
// Returns: { mermaidCode, narrative }

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsJson(), body: JSON.stringify({ error: 'Method not allowed' }) }
  }
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const brief: string = String(body.brief || '')
    if (!brief.trim()) {
      return { statusCode: 400, headers: corsJson(), body: JSON.stringify({ error: 'Missing brief' }) }
    }
    const mermaidCode = `graph TD\n  User[User] --> App[App Service]\n  App --> DB[(Database)]\n  App --> IdP[Identity Provider]\n  subgraph Azure\n    App\n    DB\n  end`
    const narrative = `High-level design generated for: ${brief}.\nWeb client communicates with an App Service API protected by identity; data stored in a managed database.\nAdjust components as needed.`
    return { statusCode: 200, headers: corsJson(), body: JSON.stringify({ mermaidCode, narrative }) }
  } catch (err: any) {
    return { statusCode: 500, headers: corsJson(), body: JSON.stringify({ error: 'Server error', detail: String(err?.message || err) }) }
  }
}

function corsJson() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json; charset=utf-8' }
}
export const handlerOptions = { timeout: 26 }
