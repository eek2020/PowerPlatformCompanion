// Serverless stub: generate dual solution options (mock)
// POST /api/sa/generate-options { requirements: [{id,title,description}], provider?, model?, systemPrompt? }
// Returns: [{ requirementId, options: [PowerPlatform, Azure] }]

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsJson(), body: JSON.stringify({ error: 'Method not allowed' }) }
  }
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const reqs: Array<{ id: string; title: string; description: string }> = Array.isArray(body.requirements) ? body.requirements : []
    if (!reqs.length) {
      return { statusCode: 400, headers: corsJson(), body: JSON.stringify({ error: 'Missing requirements[]' }) }
    }
    const items = reqs.map(r => ({
      requirementId: r.id,
      options: [
        {
          optionType: 'PowerPlatform',
          architectureSummary: `Canvas app + Dataverse for ${r.title}`,
          components: ['Power Apps', 'Dataverse'],
          services: ['M365 Identity'],
          tradeoffs: 'Faster delivery; platform limits may apply.'
        },
        {
          optionType: 'Azure',
          architectureSummary: `Web app + Azure SQL for ${r.title}`,
          components: ['App Service', 'Azure SQL'],
          services: ['Managed Identity'],
          tradeoffs: 'More control; higher ops overhead.'
        }
      ]
    }))
    return { statusCode: 200, headers: corsJson(), body: JSON.stringify(items) }
  } catch (err: any) {
    return { statusCode: 500, headers: corsJson(), body: JSON.stringify({ error: 'Server error', detail: String(err?.message || err) }) }
  }
}

function corsJson() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json; charset=utf-8' }
}
export const handlerOptions = { timeout: 26 }
