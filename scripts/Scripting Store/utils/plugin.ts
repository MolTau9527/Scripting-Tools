import type { Plugin } from '../types'

export const getPluginKey = (plugin: Plugin): string => {
  return plugin.id ? String(plugin.id) : `fallback-${plugin.name}-${plugin.url}`
}
