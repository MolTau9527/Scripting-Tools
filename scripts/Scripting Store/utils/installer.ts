import type { Plugin } from '../types'
import { buildImportScheme, isImportScheme, parseUrlsFromParam } from './importUrl'

// 参考插件「脚本商店」的做法：只调用全局 Safari.openURL + 已构造好的 scheme，
// 不在首页按钮路径上做任何 URL 校验（校验已在发布表单处完成），保证即点即跳。
declare const Safari: {
  openURL: (url: string) => void | Promise<boolean>
}

const HTTP_PROTOCOL = /^https?:\/\//i

/**
 * 把 plugin.url 规范化为 iOS 可直接打开的"安装目标"：
 *   - import scheme → 重建以拿到最新格式
 *   - http(s)       → 包成 import scheme
 *   - 其他协议       → 原样（交给系统处理）
 */
const resolveInstallTarget = (rawUrl: string): string => {
  const value = (rawUrl || '').trim()
  if (!value) throw new Error('插件链接为空')

  if (isImportScheme(value)) {
    const urls = parseUrlsFromParam(value)
    return urls && urls.length > 0 ? buildImportScheme(urls) : value
  }

  if (HTTP_PROTOCOL.test(value)) {
    return buildImportScheme([value])
  }

  return value
}

export async function installPlugin(plugin: Plugin): Promise<void> {
  const target = resolveInstallTarget(plugin.url || '')
  // Safari.openURL 的返回类型在不同运行时版本里有差异（void 或 Promise<boolean>），
  // 统一 await 吸收 Promise。
  await Promise.resolve(Safari.openURL(target))
}
