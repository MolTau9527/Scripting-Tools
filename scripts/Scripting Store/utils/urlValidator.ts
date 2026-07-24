// Scripting 运行时提供标准 Web `URL`，但 TS 配置未引入 DOM lib，因此在这里声明最小子集类型。
declare const URL: {
  new (url: string, base?: string): {
    hostname: string
    pathname: string
    protocol: string
    href: string
  }
}

const SCRIPTING_IMPORT = 'scripting://import_scripts'
const SCRIPTING_FUN_IMPORT_PATH = '/import_scripts'

const ALLOWED_HOSTS = [
  'github.com',
  'raw.githubusercontent.com',
  'scripting.fun',
  'gist.github.com',
] as const

const IMPORTABLE_EXT_RE = /\.(scripting|js|zip)(\?|#|$)/i

interface ParsedUrl {
  hostname: string
  pathname: string
  protocol: string
}

const parseUrl = (value: string): ParsedUrl | null => {
  try {
    const parsed = new URL(value)
    return {
      hostname: parsed.hostname.toLowerCase(),
      pathname: parsed.pathname,
      protocol: parsed.protocol.toLowerCase(),
    }
  } catch {
    return null
  }
}

const extractUrlsParam = (url: string): string | null => {
  try {
    const match = url.match(/[?&]urls=([^&]+)/)
    return match?.[1] ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

const isAllowedHost = (hostname: string): boolean =>
  ALLOWED_HOSTS.some(host => hostname === host || hostname.endsWith('.' + host))

export const isImportScheme = (value: string): boolean => {
  const url = value.trim()
  if (url === SCRIPTING_IMPORT || url.startsWith(`${SCRIPTING_IMPORT}?`)) return true

  const parsed = parseUrl(url)
  return parsed?.protocol === 'https:' &&
    parsed.hostname === 'scripting.fun' &&
    parsed.pathname === SCRIPTING_FUN_IMPORT_PATH
}

/** 可导入的 http(s) 链接：.scripting/.js/.zip 文件，或白名单域名 */
export const isImportableUrl = (value: string): boolean => {
  const parsed = parseUrl(value.trim())
  if (!parsed || (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')) return false
  return IMPORTABLE_EXT_RE.test(parsed.pathname) || isAllowedHost(parsed.hostname)
}

/** 解析 import scheme 中的 URL，并仅保留可导入的 http(s) 地址。 */
export const parseImportUrls = (value: string): string[] | null => {
  if (!isImportScheme(value)) return null

  try {
    const param = extractUrlsParam(value.trim())
    if (!param) return null

    const items = JSON.parse(param)
    if (!Array.isArray(items) || items.length === 0) return null

    const urls: string[] = []
    const seen = new Set<string>()
    for (const item of items) {
      if (typeof item !== 'string') continue
      const url = item.trim()
      if (!url || seen.has(url) || !isImportableUrl(url)) continue
      seen.add(url)
      urls.push(url)
    }

    return urls.length > 0 ? urls : null
  } catch {
    return null
  }
}

export const isImageUrl = (value: string): boolean => {
  const url = value.trim()
  if (/^data:image\/[a-z0-9.+-]+(?:;[^,]*)?,/i.test(url)) return true

  const parsed = parseUrl(url)
  return Boolean(parsed && (parsed.protocol === 'http:' || parsed.protocol === 'https:'))
}

export const validatePluginUrl = (value: string): string | null => {
  const url = value.trim()
  if (!url) return '链接不能为空'

  if (isImportScheme(url)) {
    return parseImportUrls(url) ? null : 'Scripting 安装链接参数无效'
  }

  const parsed = parseUrl(url)
  if (!parsed) return '链接格式无效'

  if (parsed.protocol === 'scripting:') {
    return '仅支持 scripting://import_scripts 链接'
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return '仅支持 http(s) 或 scripting:// 链接'
  }

  if (!IMPORTABLE_EXT_RE.test(parsed.pathname) && !isAllowedHost(parsed.hostname)) {
    return '链接需为 .scripting、.js、.zip 文件或 GitHub/Scripting.fun 链接'
  }

  return null
}
