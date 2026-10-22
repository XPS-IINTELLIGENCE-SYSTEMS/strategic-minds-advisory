import { normalizeEntityName } from '@/lib/nativeDataClient'

function toKebabCase(name = '') {
  return normalizeEntityName(name).replace(/_/g, '-')
}

export const nativeFunctions = {
  async invoke(name, payload = {}, options = {}) {
    const route = options.route || `/api/${toKebabCase(name)}`
    const method = options.method || 'POST'

    try {
      const response = await fetch(route, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
        body: method === 'GET' ? undefined : JSON.stringify(payload),
      })

      const text = await response.text()
      let data = text
      try {
        data = JSON.parse(text)
      } catch (_) {}

      return {
        ok: response.ok,
        status: response.status,
        route,
        data,
        error: response.ok ? null : data,
      }
    } catch (error) {
      return {
        ok: false,
        status: 0,
        route,
        data: null,
        error: error.message,
        mode: 'native-function-fallback',
      }
    }
  },
}

export default nativeFunctions
