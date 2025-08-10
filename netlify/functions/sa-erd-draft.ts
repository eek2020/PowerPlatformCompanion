// Serverless stub: ERD draft (mock)
// POST /api/sa/erd-draft { description }
// Returns: { entities[], fields[], mermaidCode }

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsJson(), body: JSON.stringify({ error: 'Method not allowed' }) }
  }
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const description: string = String(body.description || '')
    if (!description.trim()) {
      return { statusCode: 400, headers: corsJson(), body: JSON.stringify({ error: 'Missing description' }) }
    }
    const entities = [
      { id: 'e1', name: 'Customer' },
      { id: 'e2', name: 'Order' }
    ]
    const fields = [
      { id: 'f1', entityId: 'e1', name: 'CustomerId', type: 'uuid', required: true },
      { id: 'f2', entityId: 'e1', name: 'Name', type: 'string', required: true },
      { id: 'f3', entityId: 'e2', name: 'OrderId', type: 'uuid', required: true },
      { id: 'f4', entityId: 'e2', name: 'CustomerId', type: 'uuid', required: true },
      { id: 'f5', entityId: 'e2', name: 'Total', type: 'number', required: true }
    ]
    const mermaidCode = `erDiagram\n  Customer ||--o{ Order : places\n  Customer {\n    uuid CustomerId PK\n    string Name\n  }\n  Order {\n    uuid OrderId PK\n    uuid CustomerId FK\n    number Total\n  }`
    return { statusCode: 200, headers: corsJson(), body: JSON.stringify({ entities, fields, mermaidCode }) }
  } catch (err: any) {
    return { statusCode: 500, headers: corsJson(), body: JSON.stringify({ error: 'Server error', detail: String(err?.message || err) }) }
  }
}

function corsJson() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json; charset=utf-8' }
}
export const handlerOptions = { timeout: 26 }
