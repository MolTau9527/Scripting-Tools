import { Script } from 'scripting'
import { isImportScheme, isImportableUrl, parseImportUrls, validatePluginUrl } from './urlValidator'

// ============================================================
// 常量
// ============================================================

const SCRIPTING_IMPORT_PREFIX = 'scripting://import_scripts'

// ============================================================
// 底层构造
// ============================================================

/** 把 urls 打包成 `scripting://import_scripts?urls=...`；优先使用运行时 API */
const buildImportScheme = (urls: string[]): string => {
  if (typeof Script.createImportScriptsURLScheme === 'function') {
    return Script.createImportScriptsURLScheme(urls)
  }
  return `${SCRIPTING_IMPORT_PREFIX}?urls=${encodeURIComponent(JSON.stringify(urls))}`
}

// ============================================================
// 公共 API
// ============================================================

/**
 * 把任意合法 URL 规范化为"安装链接"形式：
 *   - import scheme → 重新构造最新 scheme
 *   - 普通可导入 http(s) → 打包成 import scheme
 *   - 无法识别 → null
 */
export const resolveInstallUrl = (url: string): string | null => {
  const value = url.trim()
  if (validatePluginUrl(value)) return null

  if (isImportScheme(value)) {
    const urls = parseImportUrls(value)
    return urls ? buildImportScheme(urls) : null
  }

  if (isImportableUrl(value)) {
    return buildImportScheme([value])
  }

  return null
}

/** 反向还原：如果是 import scheme 则取出首个内部链接，否则原样返回 */
export const getOriginalImportUrl = (url: string): string => {
  if (!isImportScheme(url)) return url
  const urls = parseImportUrls(url)
  return urls && urls.length > 0 ? urls[0] : url
}
