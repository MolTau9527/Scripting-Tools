import { fetch } from 'scripting'
import type { ApiResponse, Plugin, SiteConfig, SubmitPluginData } from '../types'

const BASE_URL = 'https://scripting.oraclecloud.us.kg'

async function request<T>(path: string, options?: RequestInit, fallbackError = '请求失败'): Promise<ApiResponse<T>> {
  const response = await fetch(`${BASE_URL}${path}`, options)
  if (!response.ok) throw new Error('网络请求失败')
  const data = (await response.json()) as ApiResponse<T>
  if (!data.success) throw new Error(data.message || fallbackError)
  return data
}

export async function fetchPlugins(): Promise<Plugin[]> {
  return (await request<Plugin[]>('/api/plugins', undefined, '获取插件失败')).data
}

export async function fetchConfig(): Promise<SiteConfig> {
  const defaultConfig: SiteConfig = { bannerTitle: '插件中心', bannerSubtitle: '只为Scripting打造' }
  try {
    return { ...defaultConfig, ...(await request<SiteConfig>('/api/config')).data }
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
