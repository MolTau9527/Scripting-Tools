/**
 * API 服务层 - 从 gallery.scripting.fun 获取数据
 */

import { fetch } from 'scripting'
import type { ApiResponse, Plugin, SiteConfig, SubmitPluginData } from '../types'

const BASE_URL = 'https://gallery.scripting.fun'

/**
 * 获取插件列表
 */
export async function fetchPlugins(): Promise<Plugin[]> {
  const response = await fetch(`${BASE_URL}/api/plugins`)

  if (!response.ok) {
    throw new Error('网络请求失败')
  }

  const data = (await response.json()) as ApiResponse<Plugin[]>

  if (!data.success) {
    throw new Error(data.message || '获取插件失败')
  }

  return data.data
}

/**
 * 获取网站配置
 */
export async function fetchConfig(): Promise<SiteConfig> {
  const defaultConfig: SiteConfig = {
    bannerTitle: '插件中心',
    bannerSubtitle: '只为Scripting打造'
  }

  try {
    const response = await fetch(`${BASE_URL}/api/config`)

    if (!response.ok) {
      return defaultConfig
    }

    const data = (await response.json()) as ApiResponse<SiteConfig>

    if (data.success) {
      return { ...defaultConfig, ...data.data }
    }

    return defaultConfig
  } catch {
    return defaultConfig
  }
}

/**
 * 发布插件
 */
export async function submitPlugin(pluginData: SubmitPluginData): Promise<void> {
  const response = await fetch(`${BASE_URL}/api/upload/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(pluginData)
  })

  if (!response.ok) {
    throw new Error('网络请求失败')
  }

  const data = (await response.json()) as ApiResponse<unknown>

  if (!data.success) {
    throw new Error(data.message || '发布插件失败')
  }
}
