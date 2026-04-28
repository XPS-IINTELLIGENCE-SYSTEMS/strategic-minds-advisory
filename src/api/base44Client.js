import { getSupabaseClient } from '@/lib/supabaseClient'
import { runtimeStatus } from '@/lib/runtimeConfig'

const memoryStore = new Map()

function normalizeTableName(name = '') {
  return String(name)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .toLowerCase()
}

function localEntity(name) {
  const table = normalizeTableName(name)
  if (!memoryStore.has(table)) memoryStore.set(table, [])

  return {
    async list() {
      return memoryStore.get(table) || []
    },
    async filter(predicate = {}) {
      const rows = memoryStore.get(table) || []
      return rows.filter(row => Object.entries(predicate).every(([key, value]) => row[key] === value))
    },
    async get(id) {
      return (memoryStore.get(table) || []).find(row => row.id === id) || null
    },
    async create(payload = {}) {
      const row = {
        id: payload.id || crypto.randomUUID(),
        ...payload,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        mode: 'local-native-fallback'
      }
      memoryStore.set(table, [...(memoryStore.get(table) || []), row])
      return row
    },
    async update(id, patch = {}) {
      const rows = memoryStore.get(table) || []
      const next = rows.map(row => row.id === id ? { ...row, ...patch, updated_at: new Date().toISOString() } : row)
      memoryStore.set(table, next)
      return next.find(row => row.id === id) || null
    },
    async delete(id) {
      const rows = memoryStore.get(table) || []
      memoryStore.set(table, rows.filter(row => row.id !== id))
      return { id, deleted: true }
    }
  }
}

function supabaseEntity(name) {
  const table = normalizeTableName(name)
  const fallback = localEntity(name)

  return {
    async list() {
      const client = getSupabaseClient()
      if (!client) return fallback.list()
      const { data, error } = await client.from(table).select('*').order('created_at', { ascending: false })
      if (error) return fallback.list()
      return data || []
    },
    async filter(predicate = {}) {
      const client = getSupabaseClient()
      if (!client) return fallback.filter(predicate)
      let query = client.from(table).select('*')
      for (const [key, value] of Object.entries(predicate)) query = query.eq(key, value)
      const { data, error } = await query
      if (error) return fallback.filter(predicate)
      return data || []
    },
    async get(id) {
      const client = getSupabaseClient()
      if (!client) return fallback.get(id)
      const { data, error } = await client.from(table).select('*').eq('id', id).maybeSingle()
      if (error) return fallback.get(id)
      return data || null
    },
    async create(payload = {}) {
      const client = getSupabaseClient()
      if (!client) return fallback.create(payload)
      const record = {
        ...payload,
        created_at: payload.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { data, error } = await client.from(table).insert(record).select('*').single()
      if (error) return fallback.create(payload)
      return data
    },
    async update(id, patch = {}) {
      const client = getSupabaseClient()
      if (!client) return fallback.update(id, patch)
      const { data, error } = await client
        .from(table)
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select('*')
        .single()
      if (error) return fallback.update(id, patch)
      return data
    },
    async delete(id) {
      const client = getSupabaseClient()
      if (!client) return fallback.delete(id)
      const { error } = await client.from(table).delete().eq('id', id)
      if (error) return fallback.delete(id)
      return { id, deleted: true }
    }
  }
}

async function callNativeFunction(name, payload = {}) {
  const route = `/api/${normalizeTableName(name).replace(/_/g, '-')}`

  try {
    const response = await fetch(route, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-ai-action-source': 'native-base44-compat' },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    let body = text
    try { body = JSON.parse(text) } catch (_) {}

    return {
      ok: response.ok,
      status: response.status,
      route,
      data: body
    }
  } catch (error) {
    return {
      ok: false,
      route,
      error: error.message,
      mode: 'native-function-fallback'
    }
  }
}

const entities = new Proxy({}, {
  get(_target, prop) {
    if (typeof prop !== 'string') return undefined
    return supabaseEntity(prop)
  }
})

const functions = new Proxy({}, {
  get(_target, prop) {
    if (typeof prop !== 'string') return undefined
    return (payload) => callNativeFunction(prop, payload)
  }
})

export const base44 = {
  mode: 'native-ai-in-action-compatibility',
  provider: 'strategic-minds-advisory',
  runtimeStatus,
  entities,
  functions,
  integrations: {
    Core: {
      async InvokeLLM(payload = {}) {
        return callNativeFunction('orchestrator', {
          type: 'llm_invocation',
          payload
        })
      },
      async SendEmail(payload = {}) {
        return callNativeFunction('send-email', payload)
      },
      async UploadFile(payload = {}) {
        return callNativeFunction('upload-file', payload)
      },
      async ExtractDataFromUploadedFile(payload = {}) {
        return callNativeFunction('extract-data', payload)
      }
    }
  }
}

export default base44
