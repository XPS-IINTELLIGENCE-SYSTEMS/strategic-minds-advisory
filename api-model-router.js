const DEFAULT_GATEWAY_BASE_URL = 'https://ai-gateway.vercel.sh/v1'
const DEFAULT_GROQ_BASE_URL = 'https://api.groq.com/openai/v1'
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1'

function json(res, status, payload) {
  return res.status(status).json({ ...payload, time: new Date().toISOString() })
}

function providerCandidates() {
  return [
    {
      name: 'vercel_gateway',
      enabled: Boolean(process.env.AI_GATEWAY_API_KEY),
      apiKey: process.env.AI_GATEWAY_API_KEY,
      baseUrl: process.env.AI_GATEWAY_BASE_URL || DEFAULT_GATEWAY_BASE_URL,
      model: process.env.AI_GATEWAY_MODEL || process.env.OPENAI_MODEL || 'openai/gpt-4.1-mini',
      responseFormat: 'json_schema'
    },
    {
      name: 'groq',
      enabled: Boolean(process.env.GROQ_API_KEY),
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: process.env.GROQ_BASE_URL || DEFAULT_GROQ_BASE_URL,
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      responseFormat: 'json_object'
    },
    {
      name: 'openai',
      enabled: Boolean(process.env.OPENAI_API_KEY),
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL,
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      responseFormat: 'json_schema'
    }
  ]
}

function decisionSchema() {
  return {
    type: 'object',
    additionalProperties: false,
    required: ['action', 'reason', 'next_task'],
    properties: {
      action: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'args'],
        properties: {
          type: {
            type: 'string',
            enum: ['call_internal_endpoint', 'create_task', 'write_log', 'complete_task', 'fail_task', 'noop']
          },
          args: { type: 'object', additionalProperties: true }
        }
      },
      reason: { type: 'string' },
      next_task: {
        type: 'object',
        additionalProperties: false,
        required: ['create', 'title', 'type', 'priority', 'payload'],
        properties: {
          create: { type: 'boolean' },
          title: { type: 'string' },
          type: { type: 'string' },
          priority: { type: 'number' },
          payload: { type: 'object', additionalProperties: true }
        }
      }
    }
  }
}

function buildMessages(input) {
  return [
    {
      role: 'system',
      content: 'You are AI in Action model router for Strategic Minds Advisory. Return only valid JSON matching the required schema. Choose one safe bounded system action. Prefer verification, logging, task creation, internal API calls, and no-op when unsafe.'
    },
    {
      role: 'user',
      content: JSON.stringify(input)
    }
  ]
}

function parseAssistantContent(data) {
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('empty_model_content')
  if (typeof content === 'object') return content
  return JSON.parse(content)
}

async function callProvider(provider, input) {
  const body = {
    model: provider.model,
    messages: buildMessages(input),
    temperature: 0.1
  }

  if (provider.responseFormat === 'json_schema') {
    body.response_format = {
      type: 'json_schema',
      json_schema: {
        name: 'ai_in_action_orchestrator_action',
        strict: true,
        schema: decisionSchema()
      }
    }
  } else {
    body.response_format = { type: 'json_object' }
    body.messages[0].content += ` Schema: ${JSON.stringify(decisionSchema())}`
  }

  const response = await fetch(`${provider.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${provider.apiKey}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  })

  const data = await response.json().catch(async () => ({ raw: await response.text() }))

  if (!response.ok) {
    throw new Error(`${provider.name}_failed:${data?.error?.message || response.status}`)
  }

  return {
    provider: provider.name,
    model: provider.model,
    decision: parseAssistantContent(data),
    rawUsage: data.usage || null
  }
}

export async function routeModel(input) {
  const preferred = process.env.AI_PROVIDER
  const candidates = providerCandidates().filter(provider => provider.enabled)
  const ordered = preferred
    ? [...candidates.filter(p => p.name === preferred), ...candidates.filter(p => p.name !== preferred)]
    : candidates

  const attempts = []

  for (const provider of ordered) {
    try {
      const result = await callProvider(provider, input)
      return { ok: true, ...result, attempts }
    } catch (error) {
      attempts.push({ provider: provider.name, error: error.message })
    }
  }

  return {
    ok: false,
    error: 'no_model_provider_succeeded',
    attempts,
    configuredProviders: candidates.map(p => p.name)
  }
}

export default async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) return json(res, 405, { status: 'error', error: 'method_not_allowed' })

  const safeStatusOnly = req.method === 'GET'
  if (safeStatusOnly) {
    const providers = providerCandidates().map(provider => ({
      name: provider.name,
      configured: provider.enabled,
      model: provider.model,
      baseUrl: provider.baseUrl
    }))
    return json(res, 200, { status: 'ok', providers })
  }

  try {
    const input = typeof req.body === 'object' && req.body ? req.body : {}
    const result = await routeModel(input)
    return json(res, result.ok ? 200 : 502, result)
  } catch (error) {
    return json(res, 500, { status: 'error', error: error.message })
  }
}
