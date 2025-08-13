import OpenAI from 'openai'

// POST /api/sa/generate-options { requirements: [{id,title,description}], provider?, model?, systemPrompt?, apiKey? }
// Returns: [{ requirementId, options: [PowerPlatform, Azure] }]

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsJson(), body: JSON.stringify({ error: 'Method not allowed' }) }
  }
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const { requirements, provider = 'openai', model = 'gpt-4o-mini', systemPrompt, apiKey } = body
    const reqs: Array<{ id: string; title: string; description: string }> = Array.isArray(requirements) ? requirements : []
    if (!reqs.length) {
      return { statusCode: 400, headers: corsJson(), body: JSON.stringify({ error: 'Missing requirements[]' }) }
    }

    if (!apiKey) {
      return { statusCode: 401, headers: corsJson(), body: JSON.stringify({ error: 'Missing apiKey' }) }
    }

    const openai = new OpenAI({ apiKey })

    const items = await Promise.all(reqs.map(async (r) => {
      const userPrompt = `Requirement Title: ${r.title}\n\nRequirement Description: ${r.description}`
      const chatCompletion = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt || 'You are a helpful assistant.' },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
      })

      const responseContent = chatCompletion.choices[0].message?.content
      const options = responseContent ? JSON.parse(responseContent) : { PowerPlatform: {}, Azure: {} }

      return {
        requirementId: r.id,
        options: [
          {
            optionType: 'PowerPlatform',
            ...(options.PowerPlatform || {}),
          },
          {
            optionType: 'Azure',
            ...(options.Azure || {}),
          },
        ],
      }
    }))

    return { statusCode: 200, headers: corsJson(), body: JSON.stringify(items) }
  } catch (err: any) {
    return { statusCode: 500, headers: corsJson(), body: JSON.stringify({ error: 'Server error', detail: String(err?.message || err) }) }
  }
}

function corsJson() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json; charset=utf-8' }
}

export const handlerOptions = { timeout: 90 }
