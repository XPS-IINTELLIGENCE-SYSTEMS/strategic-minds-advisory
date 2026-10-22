import { getSupabaseClient } from '@/lib/supabaseClient'

const memoryStore = new Map()

export function normalizeEntityName(name = '') {
  return String(name)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .toLowerCase()
}

function ensureLocalTable(table) {
  if (!memoryStore.has(table)) memoryStore.set(table, [])
  return memoryStore.get(table)
}

function withTimestamps(payload = {}, isCreate = false) {
  const now = new Date().toISOString()
  return {
    ...payload,
    ...(isCreate ? { created_at: payload.created_at || now } : {}),
    updated_at: now,
  }
}

function localEntity(name) {
  const table = normalizeEntityName(name)

  return {
    table,
    mode: 'local-fallback',
    async list(orderBy = 'created_at', ascending = false) {
      const rows = [...ensureLocalTable(table)]
      return rows.sort((a, b) => {
        const left = a?.[orderBy] || ''
        const right = b?.[orderBy] || ''
        return ascending ? String(left).localeCompare(String(right)) : String(right).localeCompare(String(left))
      })
    },
    async filter(predicate = {}) {
      return ensureLocalTable(table).filter((row) => Object.entries(predicate).every(([key, value]) => row[key] === value))
    },
    async get(id) {
      return ensureLocalTable(table).find((row) => row.id === id) || null
    },
    async create(payload = {}) {
      const row = {
        id: payload.id || crypto.randomUUID(),
        ...withTimestamps(payload, true),
        mode: 'local-fallback',
      }
      memoryStore.set(table, [row, ...ensureLocalTable(table)])
      return row
    },
    async update(id, patch = {}) {
      const rows = ensureLocalTable(table)
      const next = rows.map((row) => (row.id === id ? { ...row, ...withTimestamps(patch) } : row))
      memoryStore.set(table, next)
      return next.find((row) => row.id === id) || null
    },
    async delete(id) {
      memoryStore.set(table, ensureLocalTable(table).filter((row) => row.id !== id))
      return { id, deleted: true }
    },
  }
}

function supabaseEntity(name) {
  const table = normalizeEntityName(name)
  const fallback = localEntity(name)

  return {
    table,
    mode: 'supabase-or-fallback',
    async list(orderBy = 'created_at', ascending = false) {
      const client = getSupabaseClient()
      if (!client) return fallback.list(orderBy, ascending)
      const { data, error } = await client.from(table).select('*').order(orderBy, { ascending })
      if (error) return fallback.list(orderBy, ascending)
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
      const { data, error } = await client.from(table).insert(withTimestamps(payload, true)).select('*').single()
      if (error) return fallback.create(payload)
      return data
    },
    async update(id, patch = {}) {
      const client = getSupabaseClient()
      if (!client) return fallback.update(id, patch)
      const { data, error } = await client.from(table).update(withTimestamps(patch)).eq('id', id).select('*').single()
      if (error) return fallback.update(id, patch)
      return data
    },
    async delete(id) {
      const client = getSupabaseClient()
      if (!client) return fallback.delete(id)
      const { error } = await client.from(table).delete().eq('id', id)
      if (error) return fallback.delete(id)
      return { id, deleted: true }
    },
  }
}

export const nativeData = {
  entity: supabaseEntity,
  table: supabaseEntity,
}

export default nativeData
