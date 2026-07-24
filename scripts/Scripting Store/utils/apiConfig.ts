/**
 * API 配置管理：后端地址可由用户在设置页动态修改
 */

const STORAGE_KEY_API_BASE = 'store_api_base'
const DEFAULT_API_BASE = 'https://scripting.roayc.com'
let cachedApiBaseUrl: string | null = null

declare const URL: {
  new (url: string): {
    protocol: string
    hostname: string
    host: string
    pathname: string
  }
}

export const normalizeApiBaseUrl = (value: string): string | null => {
  try {
    const parsed = new URL(value.trim())
    if (
      (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
      !parsed.hostname
    ) {
      return null
    }

    const pathname = parsed.pathname.replace(/\/+$/, '')
    return `${parsed.protocol}//${parsed.host}${pathname}`
  } catch {
    return null
  }
}

/**
 * 获取当前生效的 API 基础地址
 */
export const getApiBaseUrl = (): string => {
  if (cachedApiBaseUrl !== null) return cachedApiBaseUrl

  try {
    const saved = Storage.get(STORAGE_KEY_API_BASE)
    cachedApiBaseUrl = typeof saved === 'string'
      ? normalizeApiBaseUrl(saved) || DEFAULT_API_BASE
      : DEFAULT_API_BASE
  } catch {
    cachedApiBaseUrl = DEFAULT_API_BASE
  }

  return cachedApiBaseUrl
}

/**
 * 保存新的 API 基础地址
 */
export const setApiBaseUrl = (url: string): string => {
  const trimmed = url.trim()
  if (trimmed.length === 0) {
    cachedApiBaseUrl = DEFAULT_API_BASE
    Storage.remove(STORAGE_KEY_API_BASE)
    return cachedApiBaseUrl
  }

  const normalized = normalizeApiBaseUrl(trimmed)
  if (!normalized) throw new Error('请输入有效的 http(s) 地址')

  cachedApiBaseUrl = normalized
  Storage.set(STORAGE_KEY_API_BASE, normalized)
  return normalized
}
