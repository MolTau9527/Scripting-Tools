/**
 * 插件安装工具
 * 处理插件的安装逻辑，支持 App 内和浏览器环境
 */

import { Script } from 'scripting'
import type { Plugin } from '../types'

/**
 * 从 URL 中提取 urls 参数
 */
function extractUrlsParam(url: string): string | null {
  const match = url.match(/[?&]urls=([^&]+)/)
  if (match && match[1]) {
    return decodeURIComponent(match[1])
  }
  return null
}

/**
 * 解包旧版 scripting.fun 链接，提取原始 URL
 */
function unwrapLegacyUrl(url: string): string | null {
  try {
    const urlsParam = extractUrlsParam(url)

    if (urlsParam) {
      const jsonUrls = JSON.parse(urlsParam)

      if (Array.isArray(jsonUrls) && jsonUrls.length > 0) {
        return jsonUrls[0]
      }
    }
  } catch (e) {
    console.error('Failed to unwrap legacy url:', e)
  }

  return null
}

/**
 * 检查 URL 是否为可导入的文件类型
 */
function isImportableUrl(url: string): boolean {
  const hasExtension = /\.(scripting|js|zip)($|\?)/i.test(url)
  const isGitHub = url.includes('github.com')
  return hasExtension || isGitHub
}

/**
 * 安装插件
 * @param plugin 要安装的插件
 */
export async function installPlugin(plugin: Plugin): Promise<void> {
  if (!plugin.url || plugin.url === '#') {
    console.warn('Plugin not found or invalid URL')
    return
  }

  let targetUrl = plugin.url

  // 处理旧版 scripting.fun 链接
  if (targetUrl.startsWith('https://scripting.fun/import_scripts')) {
    const unwrapped = unwrapLegacyUrl(targetUrl)
    if (unwrapped) {
      targetUrl = unwrapped
    }
  }

  // 如果已经是 scripting:// 协议，直接跳转
  if (targetUrl.startsWith('scripting://')) {
    // 在 App 内使用 Script API
    if (Script.createImportScriptsURLScheme) {
      // 从 scripting:// URL 中提取原始链接
      try {
        const urlsParam = extractUrlsParam(targetUrl)
        if (urlsParam) {
          const urls = JSON.parse(urlsParam)
          const urlScheme = Script.createImportScriptsURLScheme(urls)
          await Safari.openURL(urlScheme)
          return
        }
      } catch {
        // 解析失败，直接使用原 URL
      }
    }
    await Safari.openURL(targetUrl)
    return
  }

  // 检查是否为可导入的文件类型
  if (!isImportableUrl(targetUrl)) {
    // 普通网页链接，直接打开
    await Safari.openURL(targetUrl)
    return
  }

  // 封装并安装
  try {
    const urls = [targetUrl]

    // App 内环境 - 使用原生 API
    if (Script.createImportScriptsURLScheme) {
      const urlScheme = Script.createImportScriptsURLScheme(urls)
      await Safari.openURL(urlScheme)
    } else {
      // 外部环境 - 生成 scripting:// 协议
      const jsonUrls = JSON.stringify(urls)
      const encodedUrls = encodeURIComponent(jsonUrls)
      const urlScheme = `scripting://import_scripts?urls=${encodedUrls}`
      await Safari.openURL(urlScheme)
    }
  } catch (error) {
    console.error('Error processing install link:', error)
    await Safari.openURL(targetUrl)
  }
}
