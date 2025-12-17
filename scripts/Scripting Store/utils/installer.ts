import { Script } from 'scripting'
import type { Plugin } from '../types'

const extractUrlsParam = (url: string): string | null => {
  const match = url.match(/[?&]urls=([^&]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : null
}

const parseUrlsFromParam = (url: string): string[] | null => {
  try {
    const param = extractUrlsParam(url)
    if (!param) return null
    const urls = JSON.parse(param)
    return Array.isArray(urls) && urls.length > 0 ? urls : null
  } catch { return null }
}

const isImportableUrl = (url: string) =>
  /\.(scripting|js|zip)($|\?)/i.test(url) || url.includes('github.com')

const openImportUrl = async (urls: string[]) => {
  const scheme = Script.createImportScriptsURLScheme?.(urls)
    ?? `scripting://import_scripts?urls=${encodeURIComponent(JSON.stringify(urls))}`
  await Safari.openURL(scheme)
}

export async function installPlugin(plugin: Plugin): Promise<void> {
  if (!plugin.url || plugin.url === '#') return

  let targetUrl = plugin.url

  // 处理旧版 scripting.fun 链接
  if (targetUrl.startsWith('https://scripting.fun/import_scripts')) {
    targetUrl = parseUrlsFromParam(targetUrl)?.[0] ?? targetUrl
  }

  // scripting:// 协议
  if (targetUrl.startsWith('scripting://')) {
    const urls = parseUrlsFromParam(targetUrl)
    if (urls) { await openImportUrl(urls); return }
    Safari.openURL(targetUrl)
    return
  }

  // 非可导入链接直接打开
  if (!isImportableUrl(targetUrl)) { Safari.openURL(targetUrl); return }

  // 封装并安装
  try {
    await openImportUrl([targetUrl])
  } catch {
    Safari.openURL(targetUrl)
  }
}
