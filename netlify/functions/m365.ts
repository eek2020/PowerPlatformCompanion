// Proxies requests to the Microsoft M365 Public Roadmap API to avoid CORS in production
// Frontend calls /api/m365[?query], which is redirected to this function (/.netlify/functions/m365)

const BASE = 'https://www.microsoft.com/releasecommunications/api/v1/m365'

export const handler = async (event: any) => {
  try {
    const qs = event.rawQuery ? `?${event.rawQuery}` : ''
    const url = `${BASE}${qs}`

    const upstream = await fetch(url, {
      // Forward method/headers if needed; we only support GET for now
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'PowerPlatformCompanion/1.0 (+https://github.com/)'
      },
    })

    const text = await upstream.text()
    const status = upstream.status

    return {
      statusCode: status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=900',
      },
      body: text,
    }
  } catch (err: any) {
    return {
      statusCode: 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Bad gateway', detail: String(err?.message || err) }),
    }
  }
}
