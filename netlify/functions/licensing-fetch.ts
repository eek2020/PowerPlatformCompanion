// Fetches a PDF from a given URL server-side and returns base64 + content-type
// Frontend calls /api/licensing/fetch with JSON { url }
// Using global Buffer to avoid adding @types/node; Netlify Node runtime provides Buffer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Buffer: any

export const handler = async (event: any) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: cors(), body: JSON.stringify({ error: 'Method not allowed' }) }
  }
  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const url = String(body.url || '').trim()
    if (!url || !/^https?:\/\//i.test(url)) {
      return { statusCode: 400, headers: corsJson(), body: JSON.stringify({ error: 'Invalid or missing url' }) }
    }

    const resp = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'MakerMate/1.0' } })
    if (!resp.ok) {
      return { statusCode: resp.status, headers: corsJson(), body: JSON.stringify({ error: 'Upstream fetch failed', status: resp.status }) }
    }
    const contentType = resp.headers.get('content-type') || 'application/pdf'
    const arrayBuf = await resp.arrayBuffer()
    const buf = Buffer.from(arrayBuf)
    const base64 = buf.toString('base64')

    return {
      statusCode: 200,
      headers: { ...corsJson(), 'Cache-Control': 'no-store' },
      body: JSON.stringify({ contentType, size: buf.length, base64 })
    }
  } catch (err: any) {
    return { statusCode: 500, headers: corsJson(), body: JSON.stringify({ error: 'Server error', detail: String(err?.message || err) }) }
  }
}

function cors() {
  return { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }
}
function corsJson() {
  return { ...cors(), 'Content-Type': 'application/json; charset=utf-8' }
}
export const handlerOptions = { timeout: 26 }
