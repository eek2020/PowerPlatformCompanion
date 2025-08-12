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
    const body = (await event.json()) as TripleOptionsRequest
    const items = (body.requirements || []).map((r) => ({
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
    }))

    return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: 'bad_request', message: err?.message || String(err) }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
