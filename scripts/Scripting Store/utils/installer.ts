import type { Plugin } from '../types'
import { resolveInstallUrl } from './importUrl'

// 参考插件「脚本商店」的做法：调用全局 Safari.openURL 打开已校验的安装 scheme。
declare const Safari: {
  openURL: (url: string) => void | Promise<boolean>
}

export async function installPlugin(plugin: Plugin): Promise<void> {
  const target = resolveInstallUrl(plugin.url || '')
  if (!target) throw new Error('插件链接无效')

  // Safari.openURL 的返回类型在不同运行时版本里有差异（void 或 Promise<boolean>），
  // 统一 await 吸收 Promise。
  await Promise.resolve(Safari.openURL(target))
}
