import { useCallback, useRef, useState } from 'scripting'
import type { Plugin } from '../types'
import { installPlugin } from '../utils/installer'
import { getPluginKey } from '../utils/plugin'
import { showError } from '../utils/alerts'

interface PluginInstallerState {
  installingPluginKey: string | null
  hasActiveInstall: boolean
  startInstall: (plugin: Plugin) => Promise<void>
}

export const usePluginInstaller = (): PluginInstallerState => {
  const [installingPluginKey, setInstallingPluginKey] = useState<string | null>(null)
  const activePluginKeyRef = useRef<string | null>(null)

  const startInstall = useCallback(async (plugin: Plugin) => {
    if (activePluginKeyRef.current) return

    const pluginKey = getPluginKey(plugin)
    activePluginKeyRef.current = pluginKey
    setInstallingPluginKey(pluginKey)

    try {
      await installPlugin(plugin)
    } catch (error) {
      await showError(
        '安装失败',
        error instanceof Error ? error.message : '安装过程中出现错误',
      )
    } finally {
      if (activePluginKeyRef.current === pluginKey) {
        activePluginKeyRef.current = null
        setInstallingPluginKey(null)
      }
    }
  }, [])

  return {
    installingPluginKey,
    hasActiveInstall: Boolean(installingPluginKey),
    startInstall,
  }
}
