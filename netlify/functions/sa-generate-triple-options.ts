// Netlify Function: sa-generate-triple-options
// Returns mocked triple-option responses for a given list of requirements.
// Later, this will call OpenAI/Azure OpenAI based on provider/model.

interface ReqItem {
  id: string
  title: string
  description: string
}

interface TripleOptionsRequest {
  requirements: ReqItem[]
  provider?: 'openai' | 'azure-openai'
  model?: string
  systemPrompt?: string
}

export default async function handler(event: Request): Promise<Response> {
  if (event.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }
  try {
    const body = (await event.json()) as TripleOptionsRequest & { apiKey?: string }
    const reqs = Array.isArray(body.requirements) ? body.requirements : []
    if (!reqs.length) {
      return new Response(JSON.stringify({ error: 'Missing requirements[]' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const provider = (body.provider || 'openai') as 'openai' | 'azure-openai'
    const model = body.model || 'gpt-4o-mini'
    const systemPrompt = body.systemPrompt || defaultSystemPrompt()

    // Prefer server-side env var; accept apiKey in request as a fallback for development.
    const env = ((globalThis as any).process?.env || {}) as Record<string, string>
    const apiKey = (provider === 'openai' ? (env.OPENAI_API_KEY || body.apiKey) : env.AZURE_OPENAI_API_KEY) || ''

    // If no key available, return mocked items (keeps UX working without secrets)
    if (!apiKey) {
      const items = reqs.map(mockTripleForReq)
      return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } })
    }

    if (provider === 'openai') {
      const items = await callOpenAIForTripleOptions({ reqs, model, systemPrompt, apiKey })
      return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } })
    }

    // TODO: Implement Azure OpenAI path (deployment endpoint). Until then, fallback to mock to avoid breaking UX.
    const items = reqs.map(mockTripleForReq)
    return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    // On any error, fall back to mocked data for resilience in dev.
    try {
      const body = (await event.json()) as TripleOptionsRequest
      const reqs = Array.isArray(body.requirements) ? body.requirements : []
      const items = reqs.map(mockTripleForReq)
      return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } })
    } catch {}
    return new Response(JSON.stringify({ error: 'bad_request', message: err?.message || String(err) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

function defaultSystemPrompt(): string {
  return 'You are a senior Microsoft Solution Architect. Return ONLY JSON with keys powerPlatformOnly, hybrid, azureOnly. Each contains fields: architectureSummary, components[], services[], tradeoffs, implementationNotes, security, costConsiderations, complexity (low|medium|high), scale (small|medium|large). Keep architectureSummary concise.'
}

function mockTripleForReq(r: ReqItem) {
  return {
    requirementId: r.id,
    responses: {
      powerPlatformOnly: {
        architectureSummary: `Power Platform approach for: ${r.title || r.description?.slice(0, 60) || r.id}. Use Dataverse, Power Apps, Power Automate, and appropriate connectors.`,
        components: ['Power Apps', 'Dataverse', 'Power Automate'],
        services: ['AAD', 'M365 Graph (as needed)'],
        tradeoffs: 'Low-code speed vs. advanced customization limits.',
        implementationNotes: 'Model-driven or canvas app; flows for automation; governance in place.',
        security: 'AAD auth, DLP policies, environment strategies.',
        costConsiderations: 'Per-user/app licensing; Dataverse capacity; connectors.',
        complexity: 'medium',
        scale: 'medium',
      },
      hybrid: {
        architectureSummary: `Hybrid approach for: ${r.title || r.description?.slice(0, 60) || r.id}. Combine Azure APIs with Power Platform UX and automation.`,
        components: ['Power Apps', 'Azure Functions', 'APIM', 'Dataverse'],
        services: ['AAD', 'Key Vault', 'Storage'],
        tradeoffs: 'More flexibility and scalability vs. higher operational overhead.',
        implementationNotes: 'Expose APIs via APIM; secure with AAD; use custom connectors.',
        security: 'Managed identities, Key Vault, least-privilege; governance in PP.',
        costConsiderations: 'Azure runtime + PP licensing; APIM, Functions, data egress.',
        complexity: 'high',
        scale: 'large',
      },
      azureOnly: {
        architectureSummary: `Azure approach for: ${r.title || r.description?.slice(0, 60) || r.id}. Full-code solution leveraging Azure services.`,
        components: ['Web App', 'Azure SQL/Storage', 'Functions', 'Event Grid'],
        services: ['AAD', 'Key Vault', 'Monitor'],
        tradeoffs: 'Max control and scale vs. longer development time and complexity.',
        implementationNotes: 'IaC, CI/CD, API-first design; consider microservices if needed.',
        security: 'AAD, RBAC, network isolation, encryption; compliance mapping.',
        costConsiderations: 'Compute, storage, networking, monitoring; reserved capacity options.',
        complexity: 'high',
        scale: 'large',
      },
    },
  }
}

async function callOpenAIForTripleOptions(params: { reqs: ReqItem[]; model: string; systemPrompt: string; apiKey: string }) {
  const { reqs, model, systemPrompt, apiKey } = params
  const out: Array<{ requirementId: string; responses: any }> = []
  for (const r of reqs) {
    // Compose a compact user message with the requirement details
    const user = `Requirement ID: ${r.id}\nTitle: ${r.title || ''}\nDescription: ${r.description || ''}\n\nReturn ONLY JSON with keys powerPlatformOnly, hybrid, azureOnly as specified in the system prompt.`
    try {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: user },
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' },
        }),
      })
      if (!resp.ok) {
        // On failure, fallback to mock for this item to avoid breaking the batch
        out.push(mockTripleForReq(r) as any)
        continue
      }
      const data = await resp.json() as any
      const content = data?.choices?.[0]?.message?.content || '{}'
      let parsed: any
      try {
        parsed = JSON.parse(content)
      } catch {
        // If the model did not return strict JSON, attempt to extract
        parsed = safeJsonFromText(content) || {}
      }
      // Minimal validation: ensure required keys exist; otherwise fallback to mock
      if (!parsed.powerPlatformOnly || !parsed.hybrid || !parsed.azureOnly) {
        out.push(mockTripleForReq(r) as any)
        continue
      }
      out.push({ requirementId: r.id, responses: parsed })
    } catch {
      out.push(mockTripleForReq(r) as any)
    }
  }
  return out
}

function safeJsonFromText(s: string): any | null {
  const start = s.indexOf('{')
  const end = s.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  try { return JSON.parse(s.slice(start, end + 1)) } catch { return null }
}
