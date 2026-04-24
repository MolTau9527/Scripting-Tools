// Scripting 运行时提供标准 Web `URL`，但 TS 配置未引入 DOM lib，因此在这里声明最小子集类型。
declare const URL: {
  new (url: string, base?: string): {
    hostname: string
    pathname: string
    protocol: string
    href: string
  }
}

const DANGEROUS_PROTOCOLS = /^(javascript|file|data|vbscript):/i
const HTTP_PROTOCOL = /^https?:\/\//i
const SCRIPTING_PROTOCOL = /^scripting:\/\//i
const SCRIPTING_IMPORT = 'scripting://import_scripts'

const ALLOWED_HOSTS = [
  'github.com',
  'raw.githubusercontent.com',
  'scripting.fun',
  'gist.github.com',
] as const

const IMPORTABLE_EXT_RE = /\.(scripting|js|zip)(\?|#|$)/i

function extractHostname(url: string): string | null {
  try {
    const u = new URL(url)
    return u.hostname.toLowerCase()
  } catch {
    return null
  }
}

function extractPathname(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return ''
  }
}

const isAllowedHost = (hostname: string): boolean =>
  ALLOWED_HOSTS.some(host => hostname === host || hostname.endsWith('.' + host))

export const isImageUrl = (value: string): boolean =>
  Boolean(value) && (HTTP_PROTOCOL.test(value) || value.startsWith('data:'))

export const isImportableUrl = (url: string): boolean => {
  if (!url) return false
  const hostname = extractHostname(url)
  if (!hostname) return false
  return IMPORTABLE_EXT_RE.test(extractPathname(url)) || isAllowedHost(hostname)
}

export const isSafeUrl = (url: string): boolean =>
  !DANGEROUS_PROTOCOLS.test(url)

export const validatePluginUrl = (value: string): string | null => {
  if (DANGEROUS_PROTOCOLS.test(value)) return '不支持该类型链接'

  if (SCRIPTING_PROTOCOL.test(value)) {
    return value.startsWith(SCRIPTING_IMPORT) ? null : '仅支持 scripting://import_scripts 链接'
  }

  if (!HTTP_PROTOCOL.test(value)) return '仅支持 http(s) 或 scripting:// 链接'

  const hostname = extractHostname(value)
  if (!hostname) return '链接格式无效'

  const pathname = extractPathname(value)
  if (!IMPORTABLE_EXT_RE.test(pathname) && !isAllowedHost(hostname)) {
    return '链接需为 .scripting、.js、.zip 文件或 GitHub/Scripting.fun 链接'
  }

  return null
}
