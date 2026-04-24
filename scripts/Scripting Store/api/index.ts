import { fetch } from 'scripting'
import type { ApiResponse, Plugin, SiteConfig, SubmitPluginData } from '../types'
import { normalizeInstallUrl } from '../utils/importUrl'

const BASE_URL = 'https://scripting.oraclecloud.us.kg'

const sanitizePlugin = (raw: any): Plugin | null => {
  if (!raw || typeof raw !== 'object') return null
  const rawUrl = typeof raw.url === 'string' ? raw.url : ''
  const installCount = typeof raw.installCount === 'number'
    ? raw.installCount
    : (typeof raw.installCount === 'string' ? Number(raw.installCount) || undefined : undefined)

  return {
    id: typeof raw.id === 'number' ? raw.id : Number(raw.id) || 0,
    name: typeof raw.name === 'string' ? raw.name : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    icon: typeof raw.icon === 'string' ? raw.icon : '',
    symbol: typeof raw.symbol === 'string' ? raw.symbol : undefined,
    author: typeof raw.author === 'string' ? raw.author : '',
    url: normalizeInstallUrl(rawUrl),
    updateTime: typeof raw.updateTime === 'string' ? raw.updateTime : '',
    installCount,
  }
}

async function request(path: string, options?: any, fallbackError = '请求失败'): Promise<ApiResponse<any>> {
  const response = await fetch(`${BASE_URL}${path}`, options)
  if (!response.ok) throw new Error('网络请求失败')
  const data = (await response.json()) as ApiResponse<any>
  if (!data.success) throw new Error(data.message || fallbackError)
  return data
}

export async function fetchPlugins(): Promise<Plugin[]> {
  const data = (await request('/api/plugins', undefined, '获取插件失败')).data
  if (!Array.isArray(data)) return []

  const plugins: Plugin[] = []
  for (const item of data) {
    const plugin = sanitizePlugin(item)
    if (plugin && plugin.id > 0) {
      plugins.push(plugin)
    }
  }

  return plugins
}

export async function fetchConfig(): Promise<SiteConfig> {
  const defaultConfig: SiteConfig = { bannerTitle: '插件中心', bannerSubtitle: '只为Scripting打造' }
  try {
    return { ...defaultConfig, ...(await request('/api/config')).data }
  } catch {
    return defaultConfig
  }
}

export async function submitPlugin(pluginData: SubmitPluginData): Promise<void> {
  await request('/api/upload/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pluginData)
  }, '发布插件失败')
}
