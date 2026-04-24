import { Script } from 'scripting'
import { isImportableUrl, isSafeUrl } from './urlValidator'

// ============================================================
// 常量
// ============================================================

export const SCRIPTING_IMPORT_PREFIX = 'scripting://import_scripts'

export const IMPORT_SCRIPT_PREFIXES = [
  SCRIPTING_IMPORT_PREFIX,
  'https://scripting.fun/import_scripts',
] as const

export const isImportScheme = (url: string): boolean =>
  IMPORT_SCRIPT_PREFIXES.some(prefix => url.startsWith(prefix))

// ============================================================
// 底层构造
// ============================================================

/** 把 urls 打包成 `scripting://import_scripts?urls=...`；优先使用运行时 API */
export const buildImportScheme = (urls: string[]): string => {
  if (typeof Script.createImportScriptsURLScheme === 'function') {
    return Script.createImportScriptsURLScheme(urls)
  }
  return `${SCRIPTING_IMPORT_PREFIX}?urls=${encodeURIComponent(JSON.stringify(urls))}`
}

/** 从 `?urls=...` 参数里取原始字符串 */
const extractUrlsParam = (url: string): string | null => {
  const match = url.match(/[?&]urls=([^&]+)/)
  return match && match[1] ? decodeURIComponent(match[1]) : null
}

/** 清洗并去重：仅保留安全 + 可导入的 http(s) 链接 */
const sanitizeImportUrls = (urls: unknown[]): string[] => {
  const safeUrls: string[] = []
  const seen = new Set<string>()

  for (const item of urls) {
    if (typeof item !== 'string') continue

    const value = item.trim()
    if (!value || seen.has(value)) continue
    if (!isSafeUrl(value) || !isImportableUrl(value)) continue

    seen.add(value)
    safeUrls.push(value)
  }

  return safeUrls
}

// ============================================================
// 公共 API
// ============================================================

/** 解析 `scripting://import_scripts?urls=[...]` 得到内部 URL 数组 */
export const parseUrlsFromParam = (url: string): string[] | null => {
  try {
    const param = extractUrlsParam(url)
    if (!param) return null
    const urls = JSON.parse(param)
    if (!Array.isArray(urls) || urls.length === 0) return null

    const safeUrls = sanitizeImportUrls(urls)
    return safeUrls.length > 0 ? safeUrls : null
  } catch {
    return null
  }
}

/**
 * 把任意合法 URL 规范化为"安装链接"形式：
 *   - import scheme → 重新构造最新 scheme
 *   - 普通可导入 http(s) → 打包成 import scheme
 *   - 其他安全链接 → 原样
 *   - 无法识别 → null
 */
export const getInstallUrl = (url: string): string | null => {
  const value = url.trim()
  if (!value || !isSafeUrl(value)) return null

  if (isImportScheme(value)) {
    const urls = parseUrlsFromParam(value)
    return urls ? buildImportScheme(urls) : null
  }

  if (isImportableUrl(value)) {
    return buildImportScheme([value])
  }

  return value
}

/** 类 getInstallUrl，但失败时回退到原始 trim 后的字符串（API 层使用） */
export const normalizeInstallUrl = (url: string): string => {
  return getInstallUrl(url) || url.trim()
}

/** 反向还原：如果是 import scheme 则取出首个内部链接，否则原样返回 */
export const getOriginalImportUrl = (url: string): string => {
  if (!isImportScheme(url)) return url
  const urls = parseUrlsFromParam(url)
  return urls && urls.length > 0 ? urls[0] : url
}
