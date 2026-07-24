import { fetch } from 'scripting'
import type { AbortSignal, RequestInit } from 'scripting'
import type { Plugin, SiteConfig, SubmitPluginData } from '../types'
import { getApiBaseUrl } from '../utils/apiConfig'
import { validatePluginUrl } from '../utils/urlValidator'

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

const getTrimmedString = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : ''

const sanitizePlugin = (raw: unknown): Plugin | null => {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>
  const rawUrl = getTrimmedString(value.url)
  const parsedInstallCount = typeof value.installCount === 'number'
    ? value.installCount
    : (typeof value.installCount === 'string' ? Number(value.installCount) : NaN)
  const installCount = Number.isFinite(parsedInstallCount) && parsedInstallCount >= 0
    ? Math.trunc(parsedInstallCount)
    : undefined

  const id = typeof value.id === 'number' ? value.id : Number(value.id)
  const name = getTrimmedString(value.name)
  if (!Number.isSafeInteger(id) || id <= 0 || !name || validatePluginUrl(rawUrl)) return null

  const description = getTrimmedString(value.description)
  const icon = getTrimmedString(value.icon)
  const symbol = getTrimmedString(value.symbol) || undefined
  const author = getTrimmedString(value.author) || '未知作者'
  const updateTime = getTrimmedString(value.updateTime)

  return {
    id,
    name,
    description,
    icon,
    symbol,
    author,
    url: rawUrl,
    updateTime,
    installCount,
  }
}

async function request<T>(path: string, options?: RequestInit, fallbackError = '请求失败'): Promise<ApiResponse<T>> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, options)
  if (!response.ok) throw new Error('网络请求失败')
  const payload = await response.json()
  if (!payload || typeof payload !== 'object') throw new Error(fallbackError)

  const result = payload as ApiResponse<T>
  if (!result.success) throw new Error(result.message || fallbackError)
  return result
}

export async function fetchPlugins(signal?: AbortSignal): Promise<Plugin[]> {
  const data = (await request<unknown>('/api/plugins', signal ? { signal } : undefined, '获取插件失败')).data
  if (!Array.isArray(data)) return []

  const plugins: Plugin[] = []
  const seenIds = new Set<number>()
  for (const item of data) {
    const plugin = sanitizePlugin(item)
    if (plugin && !seenIds.has(plugin.id)) {
      seenIds.add(plugin.id)
      plugins.push(plugin)
    }
  }

  return plugins
}

export async function fetchConfig(signal?: AbortSignal): Promise<Partial<SiteConfig>> {
  const data = (await request<unknown>('/api/config', signal ? { signal } : undefined)).data
  if (!data || typeof data !== 'object') return {}

  const value = data as Record<string, unknown>
  return {
    ...(typeof value.bannerTitle === 'string' && value.bannerTitle.trim()
      ? { bannerTitle: value.bannerTitle.trim() }
      : {}),
    ...(typeof value.bannerSubtitle === 'string' && value.bannerSubtitle.trim()
      ? { bannerSubtitle: value.bannerSubtitle.trim() }
      : {}),
  }
}

export async function submitPlugin(pluginData: SubmitPluginData): Promise<void> {
  await request<unknown>('/api/upload/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pluginData)
  }, '发布插件失败')
}
