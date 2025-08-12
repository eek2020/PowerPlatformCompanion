import { useState, useEffect } from 'react'

// Pricing data (as of late 2024 - should be updated regularly)
const PRICING = {
  openai: {
    'gpt-4o': { input: 2.50, output: 10.00 }, // per 1M tokens
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'o1-mini': { input: 3.00, output: 12.00 },
    'gpt-4-turbo': { input: 10.00, output: 30.00 },
    'gpt-3.5-turbo': { input: 0.50, output: 1.50 }
  },
  anthropic: {
    'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00 },
    'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25 },
    'claude-3-opus-20240229': { input: 15.00, output: 75.00 },
    'claude-3-sonnet-20240229': { input: 3.00, output: 15.00 }
  },
  google: {
    'gemini-1.5-pro': { input: 1.25, output: 5.00 },
    'gemini-1.5-flash': { input: 0.075, output: 0.30 },
    'gemini-1.0-pro': { input: 0.50, output: 1.50 },
    'gemini-pro-vision': { input: 0.25, output: 0.50 }
  }
} as const

type ProviderId = 'openai' | 'anthropic' | 'google'

export default function AICostCalculatorPage() {
  const [provider, setProvider] = useState<ProviderId>('openai')
  const [model, setModel] = useState<string>('')
  const [inputTokens, setInputTokens] = useState<string>('1000')
  const [outputTokens, setOutputTokens] = useState<string>('500')
  const [requestsPerDay, setRequestsPerDay] = useState<string>('10')
  const [daysPerMonth, setDaysPerMonth] = useState<string>('22')

  // Update model when provider changes
  useEffect(() => {
    const models = Object.keys(PRICING[provider])
    setModel(models[0] || '')
  }, [provider])

  const calculateCost = () => {
    const providerPricing = PRICING[provider] as any
    const pricing = providerPricing?.[model]
    if (!pricing) return { perRequest: 0, perDay: 0, perMonth: 0 }

    const inputCost = (parseInt(inputTokens) / 1000000) * pricing.input
    const outputCost = (parseInt(outputTokens) / 1000000) * pricing.output
    const perRequest = inputCost + outputCost
    const perDay = perRequest * parseInt(requestsPerDay)
    const perMonth = perDay * parseInt(daysPerMonth)

    return { perRequest, perDay, perMonth }
  }

  const costs = calculateCost()
  const models = Object.keys((PRICING[provider] as any) || {})

  // Estimate tokens from text
  const estimateTokens = (text: string) => {
    // Rough estimation: ~4 characters per token for English
    return Math.ceil(text.length / 4)
  }

  const [sampleText, setSampleText] = useState('')
  const estimatedTokens = estimateTokens(sampleText)

  return (
    <main className="container">
      <h1>AI Cost Calculator</h1>
      <p>Estimate costs for AI API usage across OpenAI, Anthropic, and Google AI providers.</p>

      <section style={{ display: 'grid', gap: '1.5rem', maxWidth: 800 }}>
        {/* Provider and Model Selection */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="cost-provider">Provider</label>
            <select id="cost-provider" value={provider} onChange={e => setProvider(e.target.value as ProviderId)}>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google AI</option>
            </select>
          </div>
          <div>
            <label htmlFor="cost-model">Model</label>
            <select id="cost-model" value={model} onChange={e => setModel(e.target.value)}>
              {models.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Pricing Display */}
        {model && (PRICING[provider] as any)?.[model] && (
          <div style={{ padding: '1rem', border: '1px solid #333', borderRadius: '4px', backgroundColor: '#1a1a1a' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Current Pricing ({model})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
              <div>Input: <strong>${(PRICING[provider] as any)[model].input.toFixed(2)}</strong> per 1M tokens</div>
              <div>Output: <strong>${(PRICING[provider] as any)[model].output.toFixed(2)}</strong> per 1M tokens</div>
            </div>
            <small style={{ color: '#888', display: 'block', marginTop: '0.5rem' }}>
              Pricing as of late 2024. Check provider documentation for latest rates.
            </small>
          </div>
        )}

        {/* Token Estimation Tool */}
        <div>
          <label htmlFor="sample-text">Text Token Estimator</label>
          <textarea 
            id="sample-text"
            value={sampleText}
            onChange={e => setSampleText(e.target.value)}
            placeholder="Paste sample text to estimate token count..."
            rows={4}
          />
          <small className="help">
            Estimated tokens: <strong>{estimatedTokens}</strong> (rough: ~4 chars per token)
          </small>
        </div>

        {/* Usage Parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="input-tokens">Input Tokens per Request</label>
            <input 
              id="input-tokens"
              type="number" 
              value={inputTokens} 
              onChange={e => setInputTokens(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <label htmlFor="output-tokens">Output Tokens per Request</label>
            <input 
              id="output-tokens"
              type="number" 
              value={outputTokens} 
              onChange={e => setOutputTokens(e.target.value)}
              min="0"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label htmlFor="requests-per-day">Requests per Day</label>
            <input 
              id="requests-per-day"
              type="number" 
              value={requestsPerDay} 
              onChange={e => setRequestsPerDay(e.target.value)}
              min="0"
            />
          </div>
          <div>
            <label htmlFor="days-per-month">Working Days per Month</label>
            <input 
              id="days-per-month"
              type="number" 
              value={daysPerMonth} 
              onChange={e => setDaysPerMonth(e.target.value)}
              min="0"
            />
          </div>
        </div>

        {/* Cost Results */}
        <div style={{ padding: '1.5rem', border: '2px solid #646cff', borderRadius: '8px', backgroundColor: '#1a1a1a' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#646cff' }}>Cost Estimates</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                ${costs.perRequest.toFixed(4)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Per Request</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                ${costs.perDay.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Per Day</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
                ${costs.perMonth.toFixed(2)}
              </div>
              <div style={{ fontSize: '0.9rem', color: '#888' }}>Per Month</div>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div style={{ padding: '1rem', border: '1px solid #444', borderRadius: '4px', backgroundColor: '#0f0f0f' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>💡 Cost Optimization Tips</h4>
          <ul style={{ margin: '0', paddingLeft: '1.5rem', fontSize: '0.9rem', color: '#ccc' }}>
            <li>Use smaller models (like GPT-4o mini, Claude Haiku) for simple tasks</li>
            <li>Optimize prompts to reduce input tokens</li>
            <li>Set max_tokens limits to control output costs</li>
            <li>Batch similar requests when possible</li>
            <li>Consider caching responses for repeated queries</li>
            <li>Monitor usage with provider dashboards</li>
          </ul>
        </div>

        {/* Comparison Table */}
        <div>
          <h3>Quick Model Comparison (Input/Output per 1M tokens)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333' }}>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Provider</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Model</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Input</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>Output</th>
                  <th style={{ padding: '0.5rem', textAlign: 'left' }}>Best For</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '0.5rem' }}>OpenAI</td><td>gpt-4o-mini</td><td style={{ textAlign: 'right' }}>$0.15</td><td style={{ textAlign: 'right' }}>$0.60</td><td>Fast, cost-effective</td></tr>
                <tr><td style={{ padding: '0.5rem' }}>Google</td><td>gemini-1.5-flash</td><td style={{ textAlign: 'right' }}>$0.075</td><td style={{ textAlign: 'right' }}>$0.30</td><td>Cheapest option</td></tr>
                <tr><td style={{ padding: '0.5rem' }}>Anthropic</td><td>claude-3-5-haiku</td><td style={{ textAlign: 'right' }}>$0.25</td><td style={{ textAlign: 'right' }}>$1.25</td><td>Balanced performance</td></tr>
                <tr><td style={{ padding: '0.5rem' }}>OpenAI</td><td>gpt-4o</td><td style={{ textAlign: 'right' }}>$2.50</td><td style={{ textAlign: 'right' }}>$10.00</td><td>High performance</td></tr>
                <tr><td style={{ padding: '0.5rem' }}>Anthropic</td><td>claude-3-opus</td><td style={{ textAlign: 'right' }}>$15.00</td><td style={{ textAlign: 'right' }}>$75.00</td><td>Premium quality</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}
